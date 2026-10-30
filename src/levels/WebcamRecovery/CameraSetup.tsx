import React, { useState, useRef, useEffect } from 'react';
import { Camera, RefreshCw, Sparkles, Video, ShieldAlert, Image as ImageIcon } from 'lucide-react';
import { NeoButton } from '../../components/NeoButton';
import { CameraErrorInfo } from './types';
import { cropToSquare, generateDemoImage } from './webcamPuzzle';

interface CameraSetupProps {
  onStreamReady: (stream: MediaStream, videoElement: HTMLVideoElement) => void;
  onImageCaptured: (canvas: HTMLCanvasElement, isDemo: boolean) => void;
  onDogeshComment: (text: string, pose: 'talk' | 'laugh' | 'smug' | 'angry') => void;
  onSkip: () => void;
}

export const CameraSetup: React.FC<CameraSetupProps> = ({
  onStreamReady,
  onImageCaptured,
  onDogeshComment,
  onSkip,
}) => {
  const [setupState, setSetupState] = useState<'prompt' | 'preview' | 'error'>('prompt');
  const [errorInfo, setErrorInfo] = useState<CameraErrorInfo | null>(null);
  const [countdown, setCountdown] = useState<number | null>(null);
  const [isFlashing, setIsFlashing] = useState(false);

  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  // Stop stream if component unmounts while in setup
  useEffect(() => {
    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop());
        streamRef.current = null;
      }
    };
  }, []);

  const handleActivateWebcam = async () => {
    // Check secure context
    if (
      typeof window !== 'undefined' &&
      !window.isSecureContext &&
      window.location.hostname !== 'localhost' &&
      window.location.hostname !== '127.0.0.1'
    ) {
      setErrorInfo({
        type: 'insecure',
        message: 'Webcam requires a secure context (HTTPS or localhost).',
      });
      setSetupState('error');
      onDogeshComment('Security violation. Your browser thinks you are suspicious.', 'smug');
      return;
    }

    // Check mediaDevices support
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      setErrorInfo({
        type: 'unsupported',
        message: 'Your browser does not support webcam media access.',
      });
      setSetupState('error');
      onDogeshComment('Ancient browser detected. Update to this century.', 'laugh');
      return;
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: 'user',
          width: { ideal: 1280 },
          height: { ideal: 720 },
        },
        audio: false,
      });

      streamRef.current = stream;

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
        onStreamReady(stream, videoRef.current);
      }

      setSetupState('preview');
      onDogeshComment('Look at that face. Truly the apex of natural evolution.', 'talk');
    } catch (err: any) {
      console.warn('getUserMedia error:', err);
      let errorType: CameraErrorInfo['type'] = 'denied';
      let msg = 'Camera access was denied or cancelled.';

      if (err.name === 'NotFoundError' || err.name === 'DevicesNotFoundError') {
        errorType = 'not-found';
        msg = 'No camera device found on this system.';
      } else if (err.name === 'NotReadableError' || err.name === 'TrackStartError') {
        errorType = 'in-use';
        msg = 'Camera is already in use by another application.';
      } else if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
        errorType = 'denied';
        msg = 'Webcam permission was denied. Please allow camera access in browser.';
      }

      setErrorInfo({ type: errorType, message: msg });
      setSetupState('error');
      onDogeshComment('Camera rejected! Too cowardly to show your human face?', 'laugh');
    }
  };

  const handleCapture = () => {
    if (countdown !== null) return;

    // Start 3-second countdown: 3... 2... 1... SNAP!
    setCountdown(3);
    onDogeshComment('Hold still. Try to look like a sapient life form.', 'talk');

    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev === null) {
          clearInterval(timer);
          return null;
        }
        if (prev <= 1) {
          clearInterval(timer);
          // Snap flash!
          setIsFlashing(true);
          setTimeout(() => setIsFlashing(false), 200);

          if (videoRef.current) {
            const squareCanvas = cropToSquare(videoRef.current, 640, true);
            onImageCaptured(squareCanvas, false);
          }
          return null;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const handleUseDemoImage = async () => {
    onDogeshComment('Using the official Dogesh test card. Much more dignified.', 'smug');
    const demoCanvas = await generateDemoImage(640);
    onImageCaptured(demoCanvas, true);
  };

  return (
    <div className="w-full space-y-6">
      {/* Hidden/Mounted Video Element for preview and stream */}
      <video
        ref={videoRef}
        playsInline
        muted
        className={setupState === 'preview' ? 'hidden' : 'hidden'}
      />

      {/* STATE A: INTRO / PERMISSION PROMPT */}
      {setupState === 'prompt' && (
        <div className="space-y-6 text-center max-w-lg mx-auto py-4">
          {/* Retro Empty Preview Frame / Graphic */}
          <div className="w-full max-w-sm mx-auto aspect-video bg-neutral-900 border-4 border-black rounded-xl p-4 shadow-[6px_6px_0px_#000] flex flex-col items-center justify-center text-neutral-300 relative overflow-hidden">
            <div className="absolute inset-0 opacity-15 bg-[radial-gradient(#fff_1px,transparent_1px)] bg-[size:16px_16px]" />
            <div className="w-16 h-16 rounded-full border-3 border-dashed border-yellow-400 flex items-center justify-center mb-3 animate-pulse bg-yellow-400/10">
              <Camera className="w-8 h-8 text-yellow-400" />
            </div>
            <span className="font-heading text-xs tracking-wider text-neutral-400">
              [ OPTICAL SENSOR OFFLINE ]
            </span>
            <span className="text-[11px] text-neutral-300 font-mono mt-1">
              CLICK BELOW TO INITIALIZE
            </span>
          </div>

          {/* Action Buttons */}
          <div className="space-y-3 pt-2">
            <NeoButton
              variant="yellow"
              size="lg"
              fullWidth
              onClick={handleActivateWebcam}
              className="text-base md:text-lg"
            >
              <Video className="w-5 h-5 mr-2 inline" />
              <span>ACTIVATE WEBCAM</span>
            </NeoButton>

            <button
              type="button"
              onClick={handleUseDemoImage}
              className="w-full py-2.5 px-4 text-xs font-heading border-2 border-black rounded-lg bg-neutral-100 hover:bg-neutral-200 text-neutral-800 shadow-[2px_2px_0px_#000] flex items-center justify-center gap-2 cursor-pointer transition-colors"
            >
              <ImageIcon className="w-4 h-4" />
              <span>OR USE DEMO CALIBRATION IMAGE</span>
            </button>
          </div>

          {/* Privacy Disclaimer */}
          <div className="p-3 bg-neutral-100 border-2 border-black rounded-lg text-left text-xs text-neutral-700 shadow-[2px_2px_0px_#000]">
            <p className="font-bold">🔒 Privacy Guarantee:</p>
            <p className="text-[11px] text-neutral-600">
              Your video stream is processed 100% locally in your browser. No photos or video frames are ever recorded, saved, or uploaded to any server.
            </p>
          </div>

          <div className="pt-2">
            <button
              onClick={onSkip}
              className="text-xs font-heading uppercase text-neutral-600 hover:text-black underline cursor-pointer"
            >
              Skip Challenge
            </button>
          </div>
        </div>
      )}

      {/* STATE B: LIVE FRAMING & CAPTURE */}
      {setupState === 'preview' && (
        <div className="space-y-6 text-center max-w-lg mx-auto py-2">
          {/* Framed Mirrored Video Preview with Face Guide */}
          <div className="relative w-full max-w-md mx-auto aspect-[4/3] bg-black border-4 border-black rounded-xl overflow-hidden shadow-[8px_8px_0px_#000]">
            {/* Live mirrored video */}
            <video
              ref={(el) => {
                if (el && streamRef.current && el.srcObject !== streamRef.current) {
                  el.srcObject = streamRef.current;
                  el.play().catch(() => {});
                }
              }}
              playsInline
              muted
              autoPlay
              style={{ transform: 'scaleX(-1)' }}
              className="w-full h-full object-cover"
            />

            {/* Subtle Face Framing Guide */}
            <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
              <div className="w-52 h-64 border-2 border-dashed border-yellow-300/80 rounded-[45%] flex items-center justify-center">
                <div className="text-[10px] font-heading text-yellow-300/90 bg-black/60 px-2 py-0.5 rounded border border-yellow-300/40">
                  POSITION FACE HERE
                </div>
              </div>
            </div>

            {/* Retro Status Badge */}
            <div className="absolute top-3 left-3 px-2 py-1 bg-black/80 text-green-400 font-mono text-[10px] font-bold rounded border border-green-500 flex items-center gap-1.5 shadow">
              <span className="w-2 h-2 rounded-full bg-green-500 animate-ping inline-block" />
              <span>LIVE CAM // 30 FPS</span>
            </div>

            {/* Snap Flash Overlay */}
            {isFlashing && (
              <div className="absolute inset-0 bg-white z-50 pointer-events-none animate-fade-out" />
            )}

            {/* 3-Second Countdown Display */}
            {countdown !== null && (
              <div className="absolute inset-0 bg-black/50 backdrop-blur-[2px] flex flex-col items-center justify-center z-40 animate-scale-up">
                <span className="font-heading text-7xl md:text-8xl text-yellow-300 drop-shadow-[4px_4px_0px_#000]">
                  {countdown}
                </span>
                <span className="font-heading text-sm md:text-base text-white mt-2 bg-black px-3 py-1 border-2 border-white rounded">
                  HOLD STILL!
                </span>
              </div>
            )}
          </div>

          {/* Capture Controls */}
          <div className="space-y-3">
            <NeoButton
              variant="yellow"
              size="lg"
              fullWidth
              onClick={handleCapture}
              disabled={countdown !== null}
              className="text-base md:text-lg"
            >
              <Sparkles className="w-5 h-5 mr-2 inline" />
              <span>{countdown !== null ? 'CAPTURING...' : 'CAPTURE IMAGE (3s)'}</span>
            </NeoButton>

            <button
              type="button"
              onClick={handleUseDemoImage}
              className="text-xs font-heading text-neutral-600 hover:text-black underline cursor-pointer"
            >
              Or switch to demo calibration image
            </button>
          </div>
        </div>
      )}

      {/* ERROR RECOVERY STATE */}
      {setupState === 'error' && (
        <div className="p-6 bg-red-100 border-4 border-black rounded-xl max-w-md mx-auto space-y-4 text-center shadow-[6px_6px_0px_#000]">
          <div className="w-12 h-12 bg-red-500 text-white rounded-full mx-auto flex items-center justify-center border-2 border-black shadow-[2px_2px_0px_#000]">
            <ShieldAlert className="w-6 h-6" />
          </div>

          <div>
            <h3 className="font-heading text-xl text-red-900 mb-1">
              CAMERA ACCESS FAILED
            </h3>
            <p className="text-xs md:text-sm text-red-800 font-bold">
              {errorInfo?.message || 'Could not initialize optical sensor.'}
            </p>
          </div>

          <div className="space-y-2 pt-2">
            <NeoButton
              variant="yellow"
              fullWidth
              size="md"
              onClick={handleActivateWebcam}
            >
              <RefreshCw className="w-4 h-4 mr-1.5 inline" />
              <span>TRY AGAIN</span>
            </NeoButton>

            <NeoButton
              variant="green"
              fullWidth
              size="md"
              onClick={handleUseDemoImage}
            >
              <ImageIcon className="w-4 h-4 mr-1.5 inline" />
              <span>USE DEMO CALIBRATION IMAGE</span>
            </NeoButton>
          </div>

          <div className="pt-2">
            <button
              onClick={onSkip}
              className="text-xs font-heading text-neutral-600 hover:text-black underline cursor-pointer"
            >
              Skip this round
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
