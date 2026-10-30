import React, { useState, useEffect, useRef, useCallback } from 'react';
import { NeoCard } from '../../components/NeoCard';
import { NeoButton } from '../../components/NeoButton';
import { CameraSetup } from './CameraSetup';
import { PuzzleGrid } from './PuzzleGrid';
import { handTracking } from './HandTracking';
import {
  sliceIntoTiles,
  createScrambledTiles,
  swapTiles,
  isPuzzleSolved,
  countCorrectTiles,
} from './webcamPuzzle';
import { PuzzleTileData, HandCoords, InputMode } from './types';
import { useGameStore } from '../../store/gameStore';
import {
  ShieldCheck,
  MousePointer,
  Hand,
  ArrowRight,
  Eye,
  CheckCircle2,
  AlertTriangle,
  RotateCcw,
} from 'lucide-react';
import './webcamRecovery.css';

export interface WebcamRecoveryProps {
  onDogeshReaction: (comment: string, state: 'talk' | 'laugh' | 'smug' | 'angry') => void;
}

export const WebcamRecovery: React.FC<WebcamRecoveryProps> = ({ onDogeshReaction }) => {
  const completeCaptcha = useGameStore((state) => state.completeCaptcha);
  const goNext = useGameStore((state) => state.goNext);

  // States
  const [stage, setStage] = useState<'setup' | 'calibrating' | 'puzzle' | 'completed'>('setup');
  const [inputMode, setInputMode] = useState<InputMode>('hand');
  const [tiles, setTiles] = useState<PuzzleTileData[]>([]);
  const [restoredImageUrl, setRestoredImageUrl] = useState<string | null>(null);
  const [isDemo, setIsDemo] = useState(false);

  // Hand tracking state
  const [handCoords, setHandCoords] = useState<HandCoords>({
    x: 0.5,
    y: 0.5,
    isPinching: false,
    pinchDistance: 1,
    hasHand: false,
  });
  const [hasDetectedHandOnce, setHasDetectedHandOnce] = useState(false);
  const [isModelLoading, setIsModelLoading] = useState(false);
  const [calibrationTime, setCalibrationTime] = useState(0);

  // Camera references
  const streamRef = useRef<MediaStream | null>(null);
  const videoElementRef = useRef<HTMLVideoElement | null>(null);
  const cornerVideoRef = useRef<HTMLVideoElement | null>(null);

  // Thorough cleanup function
  const cleanupCameraAndTracking = useCallback(() => {
    handTracking.dispose();

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

    if (videoElementRef.current) {
      videoElementRef.current.pause();
      videoElementRef.current.srcObject = null;
      videoElementRef.current = null;
    }

    if (cornerVideoRef.current) {
      cornerVideoRef.current.pause();
      cornerVideoRef.current.srcObject = null;
    }
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      cleanupCameraAndTracking();
    };
  }, [cleanupCameraAndTracking]);

  // Initial Dogesh greeting
  useEffect(() => {
    onDogeshReaction("Let's see if those hands are more useful than your brain.", 'talk');
  }, [onDogeshReaction]);

  // When camera stream is ready from CameraSetup
  const handleStreamReady = (stream: MediaStream, videoEl: HTMLVideoElement) => {
    streamRef.current = stream;
    videoElementRef.current = videoEl;
  };

  // When image is captured
  const handleImageCaptured = async (canvas: HTMLCanvasElement, demoMode: boolean) => {
    setIsDemo(demoMode);
    setRestoredImageUrl(canvas.toDataURL('image/jpeg', 0.95));

    // Slice into 16 square tiles and scramble
    const rawTiles = sliceIntoTiles(canvas);
    const scrambled = createScrambledTiles(rawTiles);
    setTiles(scrambled);

    // If demo mode was chosen without a live webcam stream, switch straight to mouse mode
    if (demoMode && !streamRef.current) {
      setInputMode('mouse');
      setStage('puzzle');
      onDogeshReaction("Use your mouse to fix the pieces. Try not to embarrass yourself.", 'talk');
      return;
    }

    // Otherwise, transition to calibration for hand tracking
    setStage('calibrating');
    setIsModelLoading(true);

    try {
      await handTracking.initialize();
      setIsModelLoading(false);

      if (videoElementRef.current) {
        handTracking.start(videoElementRef.current, (coords) => {
          setHandCoords(coords);
          if (coords.hasHand) {
            setHasDetectedHandOnce(true);
          }
        });
      }
    } catch (err) {
      console.warn('MediaPipe initialization warning:', err);
      setIsModelLoading(false);
      setInputMode('mouse');
    }
  };

  // Calibration timer (to prompt recovery if hand not detected after 10s)
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (stage === 'calibrating') {
      timer = setInterval(() => {
        setCalibrationTime((prev) => prev + 1);
      }, 1000);
    } else {
      setCalibrationTime(0);
    }
    return () => clearInterval(timer);
  }, [stage]);

  // Transition from calibration to puzzle
  const handleStartPuzzle = () => {
    setStage('puzzle');
    onDogeshReaction("Pinch the tile. No, the actual tile. With your hand.", 'talk');
  };

  const handleUseMouseInstead = () => {
    setInputMode('mouse');
    setStage('puzzle');
    onDogeshReaction("Fell back to the mouse? Predictable fleshbag behaviour.", 'smug');
  };

  // Handle tile swapping
  const handleSwap = (posA: number, posB: number) => {
    setTiles((prev) => {
      const next = swapTiles(prev, posA, posB);
      const correct = countCorrectTiles(next);

      // Dogesh snarky comments on progress
      if (isPuzzleSolved(next)) {
        setTimeout(() => {
          cleanupCameraAndTracking();
          setStage('completed');
          onDogeshReaction("Human detected. Unfortunately.", 'laugh');
        }, 400);
      } else if (correct > countCorrectTiles(prev)) {
        const lines = [
          "Accidentally placed one correctly? Don't celebrate yet.",
          "That is not where your face goes. Impressive.",
          "You have fingers. Fourteen of them are probably confused.",
        ];
        onDogeshReaction(lines[Math.floor(Math.random() * lines.length)], 'smug');
      }

      return next;
    });
  };

  const handleSkip = () => {
    cleanupCameraAndTracking();
    onDogeshReaction("Skipping? Your brain gave up before your webcam.", 'laugh');
    completeCaptcha();
  };

  const handleContinueToCertificate = () => {
    cleanupCameraAndTracking();
    completeCaptcha();
  };

  const correctPiecesCount = countCorrectTiles(tiles);

  return (
    <div className="w-full max-w-4xl mx-auto space-y-4">
      <NeoCard size="large" className="p-0 overflow-hidden text-center relative border-4 border-black">
        {/* Retro Blue Header Strip */}
        <div className="retro-title-strip flex items-center justify-between flex-wrap gap-2">
          <div className="flex items-center gap-2">
            <span className="retro-badge">HUMAN VERIFICATION // 01</span>
            <span className="font-heading text-xs md:text-sm tracking-wide text-blue-100">
              WEBCAM RECOVERY TEST
            </span>
          </div>

          <div className="flex items-center gap-2 text-xs font-mono">
            {stage === 'puzzle' && (
              <span className="bg-black/40 px-2.5 py-1 rounded border border-white/20 font-bold">
                {correctPiecesCount} / 16 IN PLACE
              </span>
            )}
            <span className="text-[11px] bg-yellow-400 text-black px-2 py-0.5 rounded font-bold uppercase">
              REVERSE TEST
            </span>
          </div>
        </div>

        {/* Content Body */}
        <div className="p-5 md:p-8 space-y-6">
          {/* Main Title & Description */}
          <div>
            <h2 className="font-heading text-2xl md:text-3xl text-black mb-2 uppercase tracking-tight">
              PUT YOUR WEBCAM BACK IN ORDER
            </h2>
            <p className="text-sm md:text-base text-neutral-800 font-bold max-w-xl mx-auto">
              Your webcam image has been scrambled. Use your actual hand to put the pieces back where they belong.
            </p>
          </div>

          {/* STAGES A & B: SETUP / PERMISSION / CAPTURE */}
          {stage === 'setup' && (
            <CameraSetup
              onStreamReady={handleStreamReady}
              onImageCaptured={handleImageCaptured}
              onDogeshComment={onDogeshReaction}
              onSkip={handleSkip}
            />
          )}

          {/* STAGE C: HAND TRACKING CALIBRATION */}
          {stage === 'calibrating' && (
            <div className="space-y-6 max-w-md mx-auto py-2">
              <div className="p-4 bg-yellow-100 border-3 border-black rounded-xl shadow-[4px_4px_0px_#000] text-left space-y-3">
                <div className="flex items-center justify-between">
                  <span className="font-heading text-sm text-black uppercase">
                    CALIBRATING HAND TRACKING
                  </span>
                  <span
                    className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded border border-black ${
                      hasDetectedHandOnce
                        ? 'bg-green-400 text-black'
                        : 'bg-yellow-300 text-black animate-pulse'
                    }`}
                  >
                    {isModelLoading
                      ? 'LOADING MODEL...'
                      : hasDetectedHandOnce
                      ? 'HAND DETECTED'
                      : 'LOOKING FOR YOUR HAND...'}
                  </span>
                </div>

                {/* Calibration Mirrored Preview Window */}
                <div className="relative w-full aspect-video bg-black border-2 border-black rounded-lg overflow-hidden">
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

                  {/* Hand reticle indicator on preview */}
                  {handCoords.hasHand && (
                    <div
                      className="absolute w-8 h-8 -translate-x-1/2 -translate-y-1/2 pointer-events-none rounded-full border-2 border-yellow-400 bg-yellow-400/40 shadow-sm transition-all"
                      style={{
                        left: `${handCoords.x * 100}%`,
                        top: `${handCoords.y * 100}%`,
                      }}
                    >
                      <div className="w-2 h-2 rounded-full bg-red-500 m-auto mt-2.5" />
                    </div>
                  )}
                </div>

                {/* Gesture Instructions */}
                <div className="text-xs text-neutral-800 space-y-1 font-semibold">
                  <p className="font-bold flex items-center gap-1.5 text-black">
                    <Hand className="w-4 h-4 text-purple-700" />
                    <span>Gesture instructions:</span>
                  </p>
                  <ul className="list-disc list-inside space-y-0.5 text-neutral-700 text-[11px]">
                    <li>Raise your hand in front of the camera.</li>
                    <li>Move your index finger to aim the cursor reticle.</li>
                    <li>Pinch your thumb and index finger together to grab a tile.</li>
                    <li>Release pinch to drop and swap!</li>
                  </ul>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="space-y-3">
                <NeoButton
                  variant="yellow"
                  size="lg"
                  fullWidth
                  onClick={handleStartPuzzle}
                  disabled={!hasDetectedHandOnce}
                >
                  <Hand className="w-5 h-5 mr-2 inline" />
                  <span>START WEBCAM PUZZLE</span>
                </NeoButton>

                <button
                  type="button"
                  onClick={handleUseMouseInstead}
                  className="w-full py-2 px-3 text-xs font-heading border-2 border-black rounded-lg bg-neutral-100 hover:bg-neutral-200 text-neutral-900 shadow-[2px_2px_0px_#000] flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <MousePointer className="w-4 h-4" />
                  <span>USE MOUSE / TOUCH INSTEAD</span>
                </button>
              </div>

              {/* Recovery prompt after 10s */}
              {calibrationTime >= 10 && !hasDetectedHandOnce && (
                <div className="p-3 bg-amber-50 border-2 border-black rounded-lg text-xs text-neutral-800 text-left flex items-start gap-2 animate-slide-down">
                  <AlertTriangle className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
                  <p>
                    Camera taking a while to track your hand? Ensure your room is well lit and your hand is within frame, or switch to <strong>Mouse Mode</strong> above.
                  </p>
                </div>
              )}
            </div>
          )}

          {/* STAGE D: SCRAMBLED 4x4 PUZZLE */}
          {stage === 'puzzle' && (
            <div className="space-y-4">
              {/* Controls & Quick Reference Bar */}
              <div className="flex flex-wrap items-center justify-between gap-3 p-2.5 bg-neutral-100 border-2 border-black rounded-xl shadow-[3px_3px_0px_#000]">
                {/* Instruction Strip */}
                <div className="flex items-center gap-2 text-xs font-heading text-neutral-900 flex-wrap">
                  <span className="bg-yellow-300 px-2 py-0.5 rounded border border-black">
                    {inputMode === 'hand' ? 'POINT = MOVE' : 'CLICK = SELECT'}
                  </span>
                  <span>·</span>
                  <span className="bg-purple-300 px-2 py-0.5 rounded border border-black">
                    {inputMode === 'hand' ? 'PINCH = GRAB' : 'DRAG = MOVE'}
                  </span>
                  <span>·</span>
                  <span className="bg-green-300 px-2 py-0.5 rounded border border-black">
                    RELEASE = SWAP
                  </span>
                </div>

                {/* Input Switch Toggle */}
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      const nextMode = inputMode === 'hand' ? 'mouse' : 'hand';
                      setInputMode(nextMode);
                      onDogeshReaction(
                        nextMode === 'mouse'
                          ? 'Mouse mode engaged. Safe and boring.'
                          : 'Hand tracking back on. Show me your coordination.',
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

                  <span className="text-xs font-bold text-neutral-800 font-mono">
                    {correctPiecesCount} / 16 SOLVED
                  </span>
                </div>
              </div>

              {/* Main Puzzle Area with Corner Webcam Preview */}
              <div className="relative">
                {/* 4x4 Puzzle Grid */}
                <PuzzleGrid
                  tiles={tiles}
                  handCoords={handCoords}
                  inputMode={inputMode}
                  onSwap={handleSwap}
                  onTileAction={(action) => {
                    if (action === 'drop-miss') {
                      onDogeshReaction("Missed! That tile belongs in your grid, not thin air.", 'talk');
                    }
                  }}
                />

                {/* Corner Mirrored Camera Preview for Reference */}
                {streamRef.current && (
                  <div className="hidden lg:block absolute -top-2 -right-2 w-48 bg-black border-3 border-black rounded-lg overflow-hidden shadow-[4px_4px_0px_#000] z-20">
                    <div className="px-2 py-0.5 bg-neutral-900 border-b border-neutral-700 text-[10px] font-mono text-green-400 flex items-center justify-between">
                      <span className="flex items-center gap-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-ping" />
                        WEBCAM
                      </span>
                      <span>{inputMode === 'hand' ? 'TRACKING' : 'PREVIEW'}</span>
                    </div>

                    <div className="relative aspect-video">
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

                      {/* Small cursor pip in corner preview */}
                      {handCoords.hasHand && (
                        <div
                          className="absolute w-3 h-3 rounded-full bg-yellow-400 border border-black -translate-x-1/2 -translate-y-1/2 pointer-events-none"
                          style={{
                            left: `${handCoords.x * 100}%`,
                            top: `${handCoords.y * 100}%`,
                          }}
                        />
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* Bottom Skip Control */}
              <div className="pt-2 flex justify-between items-center text-xs text-neutral-600">
                <span>Tip: Place pieces matching borders and faces</span>
                <button
                  type="button"
                  onClick={handleSkip}
                  className="font-heading uppercase text-neutral-600 hover:text-black underline cursor-pointer"
                >
                  SKIP ROUND
                </button>
              </div>
            </div>
          )}

          {/* STAGE E: COMPLETION & VERDICT */}
          {stage === 'completed' && restoredImageUrl && (
            <div className="space-y-6 max-w-md mx-auto py-3 animate-slide-down">
              {/* Tile Snap Restored Photo */}
              <div className="puzzle-snap-anim relative aspect-square w-72 mx-auto rounded-xl border-4 border-black overflow-hidden shadow-[8px_8px_0px_#000] ring-4 ring-green-500">
                <img
                  src={restoredImageUrl}
                  alt="Restored Webcam"
                  className="w-full h-full object-cover"
                />

                <div className="absolute top-2 right-2 px-2 py-0.5 bg-green-500 text-white border-2 border-black font-heading text-xs rounded shadow flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>16 / 16 RESTORED</span>
                </div>
              </div>

              {/* Parody Verification Verdict Card */}
              <div className="p-4 bg-green-100 border-3 border-black rounded-xl shadow-[4px_4px_0px_#000] space-y-2">
                <div className="font-heading text-lg md:text-xl text-green-950 flex items-center justify-center gap-2">
                  <ShieldCheck className="w-6 h-6 text-green-700" />
                  <span>HUMAN DETECTED. THAT'S DISAPPOINTING.</span>
                </div>
                <p className="text-xs md:text-sm text-neutral-800 font-bold">
                  You successfully unscrambled your face using real biological digits. Dogesh begrudgingly certifies your organic existence.
                </p>
              </div>

              {/* Continue to Certificate Button */}
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
