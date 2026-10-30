import { useState, useRef, useCallback, useEffect } from 'react';
import { CameraStatus, CameraErrorInfo } from './types';

interface UseCameraSessionReturn {
  cameraStatus: CameraStatus;
  errorInfo: CameraErrorInfo | null;
  stream: MediaStream | null;
  startCamera: () => Promise<void>;
  stopCamera: () => void;
  permissionQueryState: string;
  deviceCount: number;
}

export function useCameraSession(videoRef: React.RefObject<HTMLVideoElement | null>): UseCameraSessionReturn {
  const [cameraStatus, setCameraStatus] = useState<CameraStatus>('idle');
  const [errorInfo, setErrorInfo] = useState<CameraErrorInfo | null>(null);
  const [permissionQueryState, setPermissionQueryState] = useState<string>('unknown');
  const [deviceCount, setDeviceCount] = useState<number>(0);

  const streamRef = useRef<MediaStream | null>(null);
  const sessionIdRef = useRef<number>(0);

  // Query permissions API and enumerate devices if available
  const updateDeviceAndPermissionDiagnostics = useCallback(async () => {
    if (typeof window === 'undefined') return;

    if (navigator.permissions && navigator.permissions.query) {
      try {
        const status = await navigator.permissions.query({ name: 'camera' as PermissionName });
        setPermissionQueryState(status.state);
        status.onchange = () => {
          setPermissionQueryState(status.state);
        };
      } catch {
        setPermissionQueryState('unsupported');
      }
    }

    if (navigator.mediaDevices && navigator.mediaDevices.enumerateDevices) {
      try {
        const devices = await navigator.mediaDevices.enumerateDevices();
        const videoInputs = devices.filter((d) => d.kind === 'videoinput');
        setDeviceCount(videoInputs.length);
      } catch {
        // ignore
      }
    }
  }, []);

  const stopCamera = useCallback(() => {
    sessionIdRef.current += 1; // Invalidate any in-flight camera request

    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => {
        try {
          track.stop();
        } catch {
          // ignore
        }
      });
      streamRef.current = null;
    }

    const video = videoRef.current;
    if (video) {
      try {
        video.pause();
        video.srcObject = null;
      } catch {
        // ignore
      }
    }

    setCameraStatus('idle');
  }, [videoRef]);

  const startCamera = useCallback(async () => {
    // Generate new session generation token
    const thisSessionId = ++sessionIdRef.current;

    // Check environment support
    if (typeof window === 'undefined' || !navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      setCameraStatus('unsupported');
      setErrorInfo({
        name: 'TypeError',
        message: 'Camera API (navigator.mediaDevices.getUserMedia) is not available in this browser or context.',
        origin: typeof window !== 'undefined' ? window.location.origin : '',
        isSecureContext: typeof window !== 'undefined' ? window.isSecureContext : false,
        status: 'unsupported',
      });
      return;
    }

    // Stop any existing stream before starting a new one
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => {
        try {
          track.stop();
        } catch {
          // ignore
        }
      });
      streamRef.current = null;
    }

    setCameraStatus('requesting');
    setErrorInfo(null);
    updateDeviceAndPermissionDiagnostics();

    // Preferred camera constraints
    const primaryConstraints: MediaStreamConstraints = {
      audio: false, // Never request audio
      video: {
        facingMode: { ideal: 'user' },
        width: { ideal: 1280 },
        height: { ideal: 720 },
      },
    };

    let stream: MediaStream | null = null;

    try {
      stream = await navigator.mediaDevices.getUserMedia(primaryConstraints);
    } catch (err: any) {
      console.warn('Initial camera constraint failed:', err?.name, err?.message);

      // If overconstrained, retry ONCE with simple fallback constraint { audio: false, video: true }
      if (err?.name === 'OverconstrainedError') {
        try {
          stream = await navigator.mediaDevices.getUserMedia({ audio: false, video: true });
        } catch (retryErr: any) {
          err = retryErr;
        }
      }

      // Check if session changed while getUserMedia was pending
      if (sessionIdRef.current !== thisSessionId) {
        if (stream) {
          stream.getTracks().forEach((t) => t.stop());
        }
        return;
      }

      // If still no stream, classify the exact failure
      if (!stream) {
        const errName = err?.name || 'Error';
        const errMsg = err?.message || 'Failed to acquire camera stream.';
        let status: CameraStatus = 'error';

        if (errName === 'NotAllowedError' || errName === 'PermissionDeniedError') {
          status = 'permission-denied';
        } else if (errName === 'NotFoundError' || errName === 'DevicesNotFoundError') {
          status = 'camera-not-found';
        } else if (errName === 'NotReadableError' || errName === 'TrackStartError') {
          status = 'camera-busy';
        } else if (errName === 'OverconstrainedError') {
          status = 'overconstrained';
        } else if (errName === 'SecurityError') {
          status = 'error';
        } else if (errName === 'AbortError') {
          status = 'error';
        }

        setCameraStatus(status);
        setErrorInfo({
          name: errName,
          message: errMsg,
          origin: window.location.origin,
          isSecureContext: window.isSecureContext,
          status,
        });
        return;
      }
    }

    // Check if session was cancelled/superseded during async prompt
    if (sessionIdRef.current !== thisSessionId) {
      if (stream) {
        stream.getTracks().forEach((t) => t.stop());
      }
      return;
    }

    streamRef.current = stream;
    setCameraStatus('stream-ready');

    // Attach stream to video element
    const video = videoRef.current;
    if (!video) {
      console.error('Video element ref is null while attaching camera stream');
      setCameraStatus('error');
      setErrorInfo({
        name: 'ElementError',
        message: 'Internal error: Video element was not mounted in DOM.',
        origin: window.location.origin,
        isSecureContext: window.isSecureContext,
        status: 'error',
      });
      return;
    }

    try {
      video.srcObject = stream;

      // Wait for video metadata so videoWidth and videoHeight are populated
      await new Promise<void>((resolve, reject) => {
        if (video.readyState >= 2 && video.videoWidth > 0) {
          return resolve();
        }

        const onLoaded = () => {
          cleanupListeners();
          resolve();
        };

        const onError = (e: any) => {
          cleanupListeners();
          reject(new Error(`Video element load error: ${e?.message || 'unknown'}`));
        };

        const cleanupListeners = () => {
          video.removeEventListener('loadedmetadata', onLoaded);
          video.removeEventListener('canplay', onLoaded);
          video.removeEventListener('error', onError);
        };

        video.addEventListener('loadedmetadata', onLoaded);
        video.addEventListener('canplay', onLoaded);
        video.addEventListener('error', onError);

        // Fallback safety timeout (6s)
        setTimeout(() => {
          cleanupListeners();
          if (video.videoWidth > 0) resolve();
          else reject(new Error('Video metadata loading timed out'));
        }, 6000);
      });

      // Check session again
      if (sessionIdRef.current !== thisSessionId) {
        if (stream) stream.getTracks().forEach((t) => t.stop());
        return;
      }

      await video.play();

      if (sessionIdRef.current === thisSessionId) {
        setCameraStatus('video-ready');
        setErrorInfo(null);
        updateDeviceAndPermissionDiagnostics();
      }
    } catch (playErr: any) {
      if (sessionIdRef.current !== thisSessionId) return;

      console.warn('Video playback failed:', playErr);
      setCameraStatus('playback-failed');
      setErrorInfo({
        name: playErr?.name || 'PlaybackError',
        message: playErr?.message || 'Failed to start video playback on camera stream.',
        origin: window.location.origin,
        isSecureContext: window.isSecureContext,
        status: 'playback-failed',
      });
    }
  }, [videoRef, updateDeviceAndPermissionDiagnostics]);

  // Clean up on component unmount
  useEffect(() => {
    return () => {
      stopCamera();
    };
  }, [stopCamera]);

  return {
    cameraStatus,
    errorInfo,
    stream: streamRef.current,
    startCamera,
    stopCamera,
    permissionQueryState,
    deviceCount,
  };
}
