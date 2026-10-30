import React, { useState, useEffect, useRef, useCallback } from 'react';
import { NeoCard } from '../../components/NeoCard';
import { NeoButton } from '../../components/NeoButton';
import { LiveMosaicBoard } from './LiveMosaicBoard';
import { handTracking } from './HandTracking';
import { useCameraSession } from './useCameraSession';
import {
  createScrambledPermutation,
  swapMosaicTiles,
  isMosaicSolved,
  countCorrectTiles,
} from './webcamPuzzle';
import { InputMode, HandTrackingStatus } from './types';
import { useGameStore } from '../../store/gameStore';
import {
  ShieldCheck,
  MousePointer,
  Hand,
  ArrowRight,
  CameraOff,
  RefreshCw,
  Terminal,
  AlertCircle,
  HelpCircle,
} from 'lucide-react';
import './webcamRecovery.css';

export interface WebcamRecoveryProps {
  onDogeshReaction: (comment: string, state: 'talk' | 'laugh' | 'smug' | 'angry', priority?: number) => void;
  onDogeshActivityChange?: (isBusy: boolean) => void;
}

export const WebcamRecovery: React.FC<WebcamRecoveryProps> = ({
  onDogeshReaction,
  onDogeshActivityChange,
}) => {
  const completeCaptcha = useGameStore((state) => state.completeCaptcha);

  // States
  const [inputMode, setInputMode] = useState<InputMode>('hand');
  const [permutation, setPermutation] = useState<number[]>(() => createScrambledPermutation());
  const [handTrackingStatus, setHandTrackingStatus] = useState<HandTrackingStatus>('not-started');
  const [isCompleted, setIsCompleted] = useState(false);
  const [isDemoFallback, setIsDemoFallback] = useState(false);
  const [showDebug, setShowDebug] = useState(false);
  const [isInteracting, setIsInteracting] = useState(false);

  // Video element ref mounted stably for the lifetime of this component
  const videoRef = useRef<HTMLVideoElement>(null);

  // Camera session manager with single owner and idempotent lifecycle
  const {
    cameraStatus,
    errorInfo,
    stream,
    startCamera,
    stopCamera,
    permissionQueryState,
    deviceCount,
  } = useCameraSession(videoRef);

  // Report busy state to Dogesh scheduler (pause idle comments during camera init or active tile drag)
  const isInitializing = cameraStatus === 'requesting' || handTrackingStatus === 'loading';
  useEffect(() => {
    onDogeshActivityChange?.(isInitializing || isInteracting);
  }, [isInitializing, isInteracting, onDogeshActivityChange]);

  // Initial Dogesh greeting — runs strictly once on mount
  const initialGreetingDone = useRef(false);
  useEffect(() => {
    if (!initialGreetingDone.current) {
      initialGreetingDone.current = true;
      onDogeshReaction("Let's see if those hands are more useful than your brain.", 'talk', 3);
    }
  }, [onDogeshReaction]);

  // Critical camera error reaction (Priority 1)
  const errorReactionFired = useRef<string | null>(null);
  useEffect(() => {
    if (cameraStatus !== 'video-ready' && cameraStatus !== 'requesting' && cameraStatus !== 'idle' && !isDemoFallback) {
      if (errorReactionFired.current !== cameraStatus) {
        errorReactionFired.current = cameraStatus;
        onDogeshReaction("Webcam failure! Dogesh requires visual verification.", 'angry', 1);
      }
    }
  }, [cameraStatus, isDemoFallback, onDogeshReaction]);

  // Hand tracking detected reaction (Priority 3)
  const handDetectedFired = useRef(false);
  useEffect(() => {
    if (handTrackingStatus === 'hand-detected' && !handDetectedFired.current) {
      handDetectedFired.current = true;
      onDogeshReaction("Hand detected. Organic fingers located.", 'talk', 3);
    }
  }, [handTrackingStatus, onDogeshReaction]);

  // Start camera ONCE on mount
  useEffect(() => {
    startCamera();
    return () => {
      stopCamera();
      handTracking.dispose();
    };
  }, [startCamera, stopCamera]);

  // When camera video is ready, start hand tracking
  useEffect(() => {
    if (cameraStatus === 'video-ready' && videoRef.current && !isDemoFallback) {
      let isMounted = true;

      const initHandTracking = async () => {
        setHandTrackingStatus('loading');
        const ready = await handTracking.initialize((status) => {
          if (isMounted) setHandTrackingStatus(status);
        });

        if (!isMounted) return;

        if (ready && videoRef.current) {
          handTracking.start(videoRef.current, (status) => {
            if (isMounted) setHandTrackingStatus(status);
          });
        } else {
          // If ML model fails, switch to mouse fallback while keeping the live camera mosaic running!
          setInputMode('mouse');
          setHandTrackingStatus('error');
        }
      };

      initHandTracking();

      return () => {
        isMounted = false;
        handTracking.stop();
      };
    }
  }, [cameraStatus, isDemoFallback]);

  // Handle tile swapping
  const handleSwap = useCallback((posA: number, posB: number) => {
    setPermutation((prev) => {
      const next = swapMosaicTiles(prev, posA, posB);
      const correct = countCorrectTiles(next);

      if (isMosaicSolved(next)) {
        setTimeout(() => {
          stopCamera();
          handTracking.dispose();
          setIsCompleted(true);
          onDogeshReaction("Human detected. Unfortunately.", 'laugh', 3);
        }, 350);
      } else if (correct > countCorrectTiles(prev)) {
        const lines = [
          "Accidentally placed one correctly? Don't celebrate yet.",
          "That is not where your face goes. Impressive.",
          "You have fingers. Fourteen of them are probably confused.",
        ];
        onDogeshReaction(lines[Math.floor(Math.random() * lines.length)], 'smug', 3);
      }

      return next;
    });
  }, [onDogeshReaction, stopCamera]);

  const handleSkip = () => {
    stopCamera();
    handTracking.dispose();
    onDogeshReaction("Skipping? Your brain gave up before your webcam.", 'laugh', 3);
    completeCaptcha();
  };


  const handleContinueToCertificate = () => {
    stopCamera();
    handTracking.dispose();
    completeCaptcha();
  };

  const handleRetryCamera = () => {
    setIsDemoFallback(false);
    startCamera();
  };

  const handleUseDemoSimulator = () => {
    setIsDemoFallback(true);
    setInputMode('mouse');
    onDogeshReaction("Live test simulator running. Drag pieces with your mouse.", 'talk');
  };

  const correctPiecesCount = countCorrectTiles(permutation);
  const currentOrigin = typeof window !== 'undefined' ? window.location.origin : '';
  const isLocalhost = currentOrigin.includes('localhost');
  const is127 = currentOrigin.includes('127.0.0.1');

  // Video track settings for debug display
  const videoTrack = stream ? stream.getVideoTracks()[0] : null;
  const trackSettings = videoTrack && videoTrack.getSettings ? videoTrack.getSettings() : null;

  // Status badge text
  let statusBadgeText = 'INITIALISING...';
  if (isDemoFallback) {
    statusBadgeText = 'SIMULATION FEED (MOUSE)';
  } else if (cameraStatus === 'requesting') {
    statusBadgeText = 'REQUESTING PERMISSION...';
  } else if (cameraStatus === 'video-ready') {
    if (inputMode === 'mouse') {
      statusBadgeText = 'MOUSE MODE';
    } else if (handTrackingStatus === 'hand-detected') {
      statusBadgeText = 'HAND DETECTED';
    } else if (handTrackingStatus === 'pinching') {
      statusBadgeText = 'PINCHING (GRABBED)';
    } else if (handTrackingStatus === 'loading') {
      statusBadgeText = 'LOADING HAND TRACKING...';
    } else if (handTrackingStatus === 'error') {
      statusBadgeText = 'HAND TRACKING FAILED (USE MOUSE)';
    } else {
      statusBadgeText = 'SHOW YOUR HAND';
    }
  }

  return (
    <div className="w-full max-w-6xl mx-auto space-y-4">
      {/* Mounted hidden video element with stable lifecycle */}
      <video
        ref={videoRef}
        playsInline
        autoPlay
        muted
        className="hidden"
      />

      <NeoCard size="large" className="p-0 overflow-hidden text-center relative border-4 border-black">
        {/* Retro Blue Header Strip */}
        <div className="retro-title-strip flex items-center justify-between flex-wrap gap-2 px-4 py-3">
          <div className="flex items-center gap-2.5">
            <span className="retro-badge">HUMAN VERIFICATION // 01</span>
            <span className="font-heading text-sm md:text-base tracking-wide text-white drop-shadow-[1px_1px_0px_#000]">
              PUT YOUR WEBCAM BACK IN ORDER
            </span>
          </div>

          <div className="flex items-center gap-2 text-xs font-mono">
            {!isCompleted && cameraStatus === 'video-ready' && (
              <span className="bg-black/50 text-yellow-300 px-3 py-1 rounded border-2 border-yellow-400 font-bold">
                {correctPiecesCount} / 16 TILES CORRECT
              </span>
            )}
            <span className="text-[11px] bg-yellow-400 text-black px-2.5 py-1 rounded border border-black font-bold uppercase flex items-center gap-1.5">
              <span
                className={`w-2 h-2 rounded-full ${
                  cameraStatus === 'video-ready' && !isDemoFallback
                    ? 'bg-red-600 animate-ping'
                    : 'bg-green-600'
                }`}
              />
              {cameraStatus === 'video-ready' && !isDemoFallback ? 'LIVE WEBCAM' : 'SIMULATOR'}
            </span>
          </div>
        </div>

        {/* Content Body */}
        <div className="p-4 md:p-6 space-y-4">
          {/* Main Title & Description */}
          <div className="space-y-1">
            <h2 className="font-heading text-xl md:text-3xl text-black uppercase tracking-tight">
              PUT YOUR WEBCAM BACK IN ORDER
            </h2>
            <p className="text-xs md:text-sm text-neutral-800 font-bold max-w-2xl mx-auto">
              Your webcam is live. Use your hand to put the moving image fragments back in order.
            </p>
          </div>

          {/* INITIALISING / REQUESTING CAMERA STATE */}
          {cameraStatus === 'requesting' && (
            <div className="py-12 space-y-4 max-w-md mx-auto animate-pulse">
              <div className="w-14 h-14 rounded-full border-4 border-black bg-yellow-300 mx-auto flex items-center justify-center animate-spin">
                <RefreshCw className="w-7 h-7 text-black" />
              </div>
              <div className="font-heading text-lg text-black uppercase">
                REQUESTING CAMERA PERMISSION...
              </div>
              <p className="text-xs text-neutral-700 font-bold">
                Please allow camera access in the browser prompt above.
              </p>
            </div>
          )}

          {/* CAMERA ERROR & DIAGNOSTICS RECOVERY STATE */}
          {cameraStatus !== 'video-ready' && cameraStatus !== 'requesting' && !isDemoFallback && !isCompleted && (
            <div className="p-6 bg-red-100 border-3 border-black rounded-xl max-w-xl mx-auto space-y-4 text-center shadow-[4px_4px_0px_#000]">
              <div className="w-12 h-12 bg-red-500 text-white rounded-full mx-auto flex items-center justify-center border-2 border-black">
                <CameraOff className="w-6 h-6" />
              </div>

              <div>
                <h3 className="font-heading text-lg text-red-950 uppercase mb-1">
                  {cameraStatus === 'permission-denied'
                    ? 'CAMERA PERMISSION DENIED FOR THIS ORIGIN'
                    : cameraStatus === 'camera-busy'
                    ? 'CAMERA IS BUSY OR IN USE'
                    : cameraStatus === 'camera-not-found'
                    ? 'NO CAMERA DEVICE FOUND'
                    : cameraStatus === 'overconstrained'
                    ? 'CAMERA CONSTRAINTS UNSUPPORTED'
                    : cameraStatus === 'playback-failed'
                    ? 'VIDEO PLAYBACK REJECTED'
                    : 'UNABLE TO START CAMERA'}
                </h3>
                <p className="text-xs text-red-900 font-bold">
                  {errorInfo?.message || 'The browser could not open your camera device.'}
                </p>
              </div>

              {/* Hostname scope warning if on 127.0.0.1 or localhost */}
              {(isLocalhost || is127) && cameraStatus === 'permission-denied' && (
                <div className="p-3 bg-amber-100 border-2 border-black rounded-lg text-left text-xs text-neutral-900 space-y-1">
                  <div className="flex items-center gap-1.5 font-bold text-amber-900">
                    <AlertCircle className="w-4 h-4 text-amber-700" />
                    <span>Origin Permission Notice:</span>
                  </div>
                  <p>
                    You are currently visiting on <code className="bg-white px-1.5 py-0.5 rounded border border-black font-mono font-bold">{currentOrigin}</code>.
                  </p>
                  <p className="text-[11px] text-neutral-700">
                    {is127
                      ? 'Browser permissions granted to http://localhost:5173 do not apply to http://127.0.0.1:5173! Click the lock/camera icon in your address bar to allow camera for this exact address.'
                      : 'Browser permissions granted to http://127.0.0.1:5173 do not apply to http://localhost:5173! Click the lock/camera icon in your address bar to allow camera for this exact address.'}
                  </p>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex gap-2.5 justify-center flex-wrap pt-1">
                <NeoButton
                  variant="yellow"
                  size="md"
                  onClick={handleRetryCamera}
                >
                  <RefreshCw className="w-4 h-4 mr-1.5 inline" />
                  <span>RETRY CAMERA</span>
                </NeoButton>

                <NeoButton
                  variant="green"
                  size="md"
                  onClick={handleUseDemoSimulator}
                >
                  <MousePointer className="w-4 h-4 mr-1.5 inline" />
                  <span>PLAY WITH LIVE SIMULATOR</span>
                </NeoButton>
              </div>
            </div>
          )}

          {/* ACTIVE PLAYING STATE: 16 LIVE MOVING VIDEO TILES */}
          {(cameraStatus === 'video-ready' || isDemoFallback) && !isCompleted && (
            <div className="space-y-3">
              {/* Controls and Feedback Strip */}
              <div className="flex flex-wrap items-center justify-between gap-2.5 p-2.5 bg-neutral-100 border-2 border-black rounded-xl shadow-[3px_3px_0px_#000]">
                {/* Gesture instruction strip */}
                <div className="flex items-center gap-2 text-xs font-heading text-neutral-900 flex-wrap">
                  <span className="bg-yellow-300 px-2 py-0.5 rounded border border-black">
                    POINT = MOVE
                  </span>
                  <span>·</span>
                  <span className="bg-purple-300 px-2 py-0.5 rounded border border-black">
                    PINCH = GRAB
                  </span>
                  <span>·</span>
                  <span className="bg-green-300 px-2 py-0.5 rounded border border-black">
                    RELEASE = SWAP
                  </span>
                </div>

                {/* Tracking Status & Input Mode Controls */}
                <div className="flex items-center gap-2 flex-wrap">
                  {/* Status Indicator */}
                  <span
                    className={`text-[10px] font-mono font-bold px-2.5 py-1 rounded border border-black ${
                      handTrackingStatus === 'hand-detected' || handTrackingStatus === 'pinching'
                        ? 'bg-green-400 text-black'
                        : 'bg-yellow-300 text-black'
                    }`}
                  >
                    {statusBadgeText}
                  </span>

                  {/* Toggle Input Mode */}
                  <button
                    type="button"
                    onClick={() => {
                      const next = inputMode === 'hand' ? 'mouse' : 'hand';
                      setInputMode(next);
                      onDogeshReaction(
                        next === 'mouse'
                          ? 'Mouse mode. Relinquishing computer vision supremacy.'
                          : 'Hand tracking engaged. Move your fingers in front of the lens.',
                        'talk'
                      );
                    }}
                    className="px-2.5 py-1 text-xs font-heading border-2 border-black rounded bg-white hover:bg-yellow-200 text-black shadow-[1px_1px_0px_#000] inline-flex items-center gap-1 cursor-pointer"
                  >
                    {inputMode === 'hand' ? (
                      <>
                        <MousePointer className="w-3.5 h-3.5 text-blue-600" />
                        <span>SWITCH TO MOUSE</span>
                      </>
                    ) : (
                      <>
                        <Hand className="w-3.5 h-3.5 text-purple-600" />
                        <span>SWITCH TO HAND TRACKING</span>
                      </>
                    )}
                  </button>

                  {/* Debug Panel Toggle Button */}
                  <button
                    type="button"
                    onClick={() => setShowDebug((prev) => !prev)}
                    className="px-2 py-1 text-xs font-mono font-bold border-2 border-black rounded bg-neutral-200 hover:bg-neutral-300 text-neutral-800"
                    title="Toggle Camera Debug Diagnostic Panel"
                  >
                    <Terminal className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* Development Diagnostic Panel */}
              {showDebug && (
                <div className="p-3 bg-neutral-900 text-green-400 font-mono text-[11px] border-2 border-black rounded-lg text-left space-y-1.5 shadow-[4px_4px_0px_#000] animate-slide-down">
                  <div className="flex items-center justify-between border-b border-neutral-700 pb-1">
                    <span className="font-bold text-yellow-300">[ CAMERA & HAND TRACKING DIAGNOSTICS ]</span>
                    <span className="text-neutral-400">ORIGIN: {currentOrigin}</span>
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-[10px]">
                    <div>SECURE CONTEXT: {String(typeof window !== 'undefined' ? window.isSecureContext : false)}</div>
                    <div>PERM QUERY: {permissionQueryState}</div>
                    <div>CAMERAS FOUND: {deviceCount}</div>
                    <div>CAMERA STATUS: {cameraStatus}</div>
                    <div>HAND STATUS: {handTrackingStatus}</div>
                    <div>STREAM: {stream ? 'ACTIVE' : 'NONE'}</div>
                    <div>TRACK: {videoTrack ? `${videoTrack.readyState} (muted: ${videoTrack.muted})` : 'NONE'}</div>
                    <div>
                      TRACK RES: {trackSettings ? `${trackSettings.width}x${trackSettings.height} @${trackSettings.frameRate}fps` : 'N/A'}
                    </div>
                    <div>
                      VIDEO ELEM: {videoRef.current ? `${videoRef.current.videoWidth}x${videoRef.current.videoHeight} (ready: ${videoRef.current.readyState})` : 'N/A'}
                    </div>
                    <div>DETECTOR READY: {String(handTracking.isReady)}</div>
                    <div>LAST ERROR: {handTracking.lastError || errorInfo?.message || 'NONE'}</div>
                    <div>ACTIVE LOOPS: 1 (LiveMosaicBoard 60fps)</div>
                  </div>
                </div>
              )}

              {/* 16 Live Moving Video Tiles Board */}
              <LiveMosaicBoard
                videoRef={videoRef}
                permutation={permutation}
                onSwap={handleSwap}
                isLiveWebcam={cameraStatus === 'video-ready' && !isDemoFallback}
                inputMode={inputMode}
                cameraStatus={cameraStatus}
                handStatus={handTrackingStatus}
                onInteractionStateChange={setIsInteracting}
              />


              {/* Bottom Instructions & Skip Round */}
              <div className="pt-2 flex justify-between items-center text-xs text-neutral-700 flex-wrap gap-2">
                <span className="font-semibold flex items-center gap-1">
                  <HelpCircle className="w-3.5 h-3.5" />
                  Move your head or hand in front of the lens to spot contiguous motion.
                </span>
                <button
                  type="button"
                  onClick={handleSkip}
                  className="font-heading uppercase text-neutral-700 hover:text-black underline cursor-pointer"
                >
                  SKIP ROUND
                </button>
              </div>
            </div>
          )}

          {/* COMPLETED STATE: VERDICT & CERTIFICATE TRANSITION */}
          {isCompleted && (
            <div className="space-y-6 max-w-lg mx-auto py-6 animate-slide-down">
              <div className="puzzle-snap-anim p-6 bg-green-100 border-4 border-black rounded-xl shadow-[8px_8px_0px_#000] space-y-3 ring-4 ring-green-500">
                <div className="w-16 h-16 bg-green-500 text-white rounded-full mx-auto flex items-center justify-center border-3 border-black shadow-[3px_3px_0px_#000]">
                  <ShieldCheck className="w-10 h-10" />
                </div>
                <h3 className="font-heading text-2xl text-green-950 uppercase">
                  HUMAN DETECTED. THAT'S DISAPPOINTING.
                </h3>
                <p className="text-sm text-neutral-800 font-bold">
                  All 16 live webcam fragments restored in spatial order. Dogesh is thoroughly displeased that your organic fingers succeeded.
                </p>
              </div>

              <div className="pt-2">
                <NeoButton
                  variant="green"
                  size="lg"
                  fullWidth
                  onClick={handleContinueToCertificate}
                  className="text-base md:text-lg"
                >
                  <span>CONTINUE TO CERTIFICATE</span>
                  <ArrowRight className="w-5 h-5 ml-2 inline" />
                </NeoButton>
              </div>
            </div>
          )}
        </div>
      </NeoCard>
    </div>
  );
};
