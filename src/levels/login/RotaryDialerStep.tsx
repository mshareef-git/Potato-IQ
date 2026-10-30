import React, { useState, useRef, useEffect, useCallback } from 'react';
import { NeoButton } from '../../components/NeoButton';
import { Delete, RotateCcw, PhoneCall } from 'lucide-react';

export interface RotaryDialerStepProps {
  onComplete: () => void;
  onDogeshReaction: (comment: string, state: 'talk' | 'laugh' | 'smug' | 'angry') => void;
}

interface HoleConfig {
  digit: string;
  angle: number; // Resting angle in degrees around the circle
}

// Finger stop is fixed at angle 135 degrees (lower right)
const STOP_ANGLE = 135;

// Standard rotary phone layout:
// '1' is closest to the stop, proceeding counter-clockwise through 9 and 0
const HOLES: HoleConfig[] = [
  { digit: '1', angle: 105 },
  { digit: '2', angle: 75 },
  { digit: '3', angle: 45 },
  { digit: '4', angle: 15 },
  { digit: '5', angle: 345 },
  { digit: '6', angle: 315 },
  { digit: '7', angle: 285 },
  { digit: '8', angle: 255 },
  { digit: '9', angle: 225 },
  { digit: '0', angle: 195 },
];

export const RotaryDialerStep: React.FC<RotaryDialerStepProps> = ({ onComplete, onDogeshReaction }) => {
  const [digits, setDigits] = useState<string[]>([]);
  const [rotation, setRotation] = useState<number>(0);
  const [isSpinningBack, setIsSpinningBack] = useState<boolean>(false);
  const [activeDigit, setActiveDigit] = useState<string | null>(null);
  const [showPity, setShowPity] = useState<boolean>(false);
  const [isSuccess, setIsSuccess] = useState<boolean>(false);

  const dialRef = useRef<HTMLDivElement>(null);
  const isDraggingRef = useRef<boolean>(false);
  const startAngleRef = useRef<number>(0);
  const currentRotationRef = useRef<number>(0);
  const targetStopRotationRef = useRef<number>(0);

  // Show pity fallback after 40 seconds
  useEffect(() => {
    const timer = setTimeout(() => setShowPity(true), 40000);
    return () => clearTimeout(timer);
  }, []);

  const getAngleFromCenter = (clientX: number, clientY: number): number => {
    if (!dialRef.current) return 0;
    const rect = dialRef.current.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    const dx = clientX - centerX;
    const dy = clientY - centerY;
    let deg = (Math.atan2(dy, dx) * 180) / Math.PI;
    if (deg < 0) deg += 360;
    return deg;
  };

  // Dial spinning animation and digit addition
  const completeDialForDigit = useCallback(
    (digit: string) => {
      setDigits((prev) => (prev.length < 15 ? [...prev, digit] : prev));
      setIsSpinningBack(true);
      setRotation(0);
      currentRotationRef.current = 0;
      setActiveDigit(null);

      setTimeout(() => {
        setIsSpinningBack(false);
      }, 450);
    },
    []
  );

  // Trigger spin on click/tap of a hole
  const handleHoleClick = (hole: HoleConfig) => {
    if (isSpinningBack || isSuccess) return;

    let targetRot = STOP_ANGLE - hole.angle;
    if (targetRot < 0) targetRot += 360;

    setActiveDigit(hole.digit);
    setIsSpinningBack(false);
    setRotation(targetRot);

    // After rotating to stop, spring back and register digit
    setTimeout(() => {
      completeDialForDigit(hole.digit);
    }, 320);
  };

  // Drag interaction with Pointer Events
  const handlePointerDownHole = (e: React.PointerEvent, hole: HoleConfig) => {
    if (isSpinningBack || isSuccess) return;
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
    isDraggingRef.current = true;
    startAngleRef.current = getAngleFromCenter(e.clientX, e.clientY);
    setActiveDigit(hole.digit);

    let needed = STOP_ANGLE - hole.angle;
    if (needed < 0) needed += 360;
    targetStopRotationRef.current = needed;
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!isDraggingRef.current) return;
    e.preventDefault();
    const currentAngle = getAngleFromCenter(e.clientX, e.clientY);
    let delta = currentAngle - startAngleRef.current;
    if (delta < 0) delta += 360;

    // Constrain rotation to not exceed stop
    const clamped = Math.min(delta, targetStopRotationRef.current);
    currentRotationRef.current = clamped;
    setRotation(clamped);
  };

  const handlePointerUp = (e: React.PointerEvent) => {
    if (!isDraggingRef.current) return;
    isDraggingRef.current = false;

    // Check if reached close enough to stop (within 15 degrees)
    const reached = currentRotationRef.current >= targetStopRotationRef.current - 15;
    if (reached && activeDigit) {
      completeDialForDigit(activeDigit);
    } else {
      // Revert back without adding digit
      setIsSpinningBack(true);
      setRotation(0);
      currentRotationRef.current = 0;
      setActiveDigit(null);
      setTimeout(() => setIsSpinningBack(false), 300);
    }
  };

  const handleBackspace = () => {
    if (isSuccess) return;
    setDigits((prev) => prev.slice(0, -1));
  };

  const handleClear = () => {
    if (isSuccess) return;
    setDigits([]);
  };

  const handleSubmit = () => {
    if (digits.length < 7) {
      onDogeshReaction("Fewer than 7 digits? Even a rotary phone needs a real fake number.", 'smug');
      return;
    }

    setIsSuccess(true);
    onDogeshReaction("Rotary transmission complete. Proceeding to age.", 'talk');

    setTimeout(() => {
      setDigits([]);
      onComplete();
    }, 1200);
  };

  const DIAL_RADIUS = 135;
  const HOLE_ORBIT_RADIUS = 96;

  return (
    <div className="space-y-5 max-w-lg mx-auto py-2">
      <div className="text-center">
        <h2 className="font-heading text-2xl md:text-3xl text-black mb-1">
          STEP 3: ROTARY PHONE DIAL
        </h2>
        <p className="text-sm text-neutral-900 font-semibold">
          Dial a fictional phone number (7–15 digits) using the rotary wheel.
        </p>
      </div>

      {/* Phone Number Display Slots */}
      <div className="p-3 bg-neutral-100 border-4 border-black rounded-xl shadow-[4px_4px_0px_#000] text-center">
        <div className="text-[11px] font-heading uppercase tracking-wider text-neutral-900 font-bold mb-1">
          NUMBER SLOTS ({digits.length}/15)
        </div>
        <div className="flex justify-center items-center gap-1.5 flex-wrap min-h-[44px]">
          {digits.length === 0 ? (
            <span className="text-xs text-neutral-700 font-bold uppercase tracking-wider">
              [ SPIN DIGITS TOWARDS THE STOPPER ]
            </span>
          ) : (
            digits.map((d, i) => (
              <span
                key={i}
                className="inline-flex items-center justify-center w-7 h-9 bg-[var(--yellow)] text-black border-2 border-black rounded shadow-[2px_2px_0px_#000] font-mono text-xl font-black"
              >
                {d}
              </span>
            ))
          )}
        </div>
      </div>

      {/* Rotary Dial Container */}
      <div className="relative flex justify-center items-center my-3 select-none touch-none">
        {/* Fixed Base Plate */}
        <div
          ref={dialRef}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          onPointerCancel={handlePointerUp}
          className="relative rounded-full border-4 border-black bg-[#E5E0D8] shadow-[6px_6px_0px_#000]"
          style={{ width: DIAL_RADIUS * 2, height: DIAL_RADIUS * 2 }}
        >
          {/* Numbers printed on base underneath holes */}
          {HOLES.map((h) => {
            const rad = (h.angle * Math.PI) / 180;
            const x = DIAL_RADIUS + HOLE_ORBIT_RADIUS * Math.cos(rad);
            const y = DIAL_RADIUS + HOLE_ORBIT_RADIUS * Math.sin(rad);

            return (
              <div
                key={`base-${h.digit}`}
                className="absolute flex items-center justify-center font-heading text-lg font-black text-black pointer-events-none"
                style={{
                  width: 32,
                  height: 32,
                  left: x - 16,
                  top: y - 16,
                }}
              >
                {h.digit}
              </div>
            );
          })}

          {/* Fixed Finger Stop Bracket (around angle 135) */}
          <div
            className="absolute z-20 pointer-events-none"
            style={{
              left: DIAL_RADIUS + (HOLE_ORBIT_RADIUS + 2) * Math.cos((STOP_ANGLE * Math.PI) / 180) - 10,
              top: DIAL_RADIUS + (HOLE_ORBIT_RADIUS + 2) * Math.sin((STOP_ANGLE * Math.PI) / 180) - 10,
            }}
          >
            <div className="w-6 h-7 bg-neutral-900 border-2 border-white rounded-r-md shadow-[2px_2px_0px_#000] flex items-center justify-center">
              <span className="w-2 h-4 bg-yellow-400 rounded-sm" />
            </div>
          </div>

          {/* Rotating Wheel Overlay */}
          <div
            className={`absolute inset-0 rounded-full ${
              isSpinningBack ? 'transition-transform duration-400 ease-out' : ''
            }`}
            style={{
              transform: `rotate(${rotation}deg)`,
              transformOrigin: 'center center',
            }}
          >
            {/* Center wheel plate */}
            <div className="absolute inset-4 rounded-full border-3 border-black bg-white/70 backdrop-blur-[1px]">
              {/* Center emblem / rotary hub */}
              <div className="absolute inset-[36%] rounded-full bg-[var(--yellow)] border-3 border-black shadow-[2px_2px_0px_#000] flex items-center justify-center">
                <span className="text-xl">☎️</span>
              </div>
            </div>

            {/* Finger Holes */}
            {HOLES.map((h) => {
              const rad = (h.angle * Math.PI) / 180;
              const x = DIAL_RADIUS + HOLE_ORBIT_RADIUS * Math.cos(rad);
              const y = DIAL_RADIUS + HOLE_ORBIT_RADIUS * Math.sin(rad);

              return (
                <div
                  key={`hole-${h.digit}`}
                  onPointerDown={(e) => handlePointerDownHole(e, h)}
                  onClick={() => handleHoleClick(h)}
                  className="absolute cursor-pointer rounded-full border-3 border-black bg-[#FDFBF7] hover:bg-yellow-200 shadow-[inset_0px_2px_4px_rgba(0,0,0,0.3)] flex items-center justify-center active:scale-95 transition-transform"
                  style={{
                    width: 38,
                    height: 38,
                    left: x - 19,
                    top: y - 19,
                  }}
                  title={`Dial ${h.digit}`}
                >
                  <span className="font-heading text-sm font-black text-black">
                    {h.digit}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Clear & Back Controls */}
      <div className="flex gap-2.5 max-w-xs mx-auto">
        <button
          type="button"
          onClick={handleClear}
          disabled={digits.length === 0 || isSuccess}
          className="flex-1 py-2 flex items-center justify-center gap-1.5 text-xs font-heading border-2 border-black rounded-lg bg-white text-black shadow-[2px_2px_0px_#000] hover:bg-red-100 disabled:opacity-40 cursor-pointer"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>CLEAR</span>
        </button>

        <button
          type="button"
          onClick={handleBackspace}
          disabled={digits.length === 0 || isSuccess}
          className="flex-1 py-2 flex items-center justify-center gap-1.5 text-xs font-heading border-2 border-black rounded-lg bg-white text-black shadow-[2px_2px_0px_#000] hover:bg-yellow-100 disabled:opacity-40 cursor-pointer"
        >
          <Delete className="w-3.5 h-3.5" />
          <span>BACKSPACE</span>
        </button>
      </div>

      {/* Confirm Action */}
      <NeoButton
        type="button"
        variant={digits.length >= 7 ? 'yellow' : 'white'}
        fullWidth
        size="lg"
        disabled={digits.length < 7 || isSuccess}
        onClick={handleSubmit}
      >
        <PhoneCall className="w-5 h-5 mr-2 inline" />
        {isSuccess ? 'NUMBER REGISTERED ✓' : `CONFIRM NUMBER (${digits.length}/15)`}
      </NeoButton>

      {showPity && !isSuccess && (
        <div className="text-center pt-1">
          <button
            type="button"
            onClick={() => {
              setDigits(['5', '5', '5', '0', '1', '9', '9']);
              onDogeshReaction("Dogesh pity dialer activated.", 'talk');
            }}
            className="text-xs underline font-bold text-neutral-800 hover:text-black cursor-pointer"
          >
            🐕 Dogesh Pity: Auto-fill fake rotary number
          </button>
        </div>
      )}
    </div>
  );
};
