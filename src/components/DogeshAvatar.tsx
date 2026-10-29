import React from 'react';

export type DogeshState =
  | 'idle'
  | 'talk'
  | 'laugh'
  | 'angry'
  | 'smug'
  | 'point'
  | 'sleep'
  | 'rolling';

export interface DogeshAvatarProps {
  state?: DogeshState;
  size?: number;
  onClick?: () => void;
  className?: string;
}

export const DogeshAvatar: React.FC<DogeshAvatarProps> = ({
  state = 'idle',
  size = 110,
  onClick,
  className = ''
}) => {
  // Dynamic features based on emotional state
  const isLaughing = state === 'laugh' || state === 'rolling';
  const isAngry = state === 'angry';
  const isSmug = state === 'smug';
  const isSleeping = state === 'sleep';
  const isPointing = state === 'point';
  const isRolling = state === 'rolling';

  return (
    <div
      onClick={onClick}
      role="button"
      tabIndex={0}
      title="Instructor Dogesh (Click to shoo away)"
      className={`relative cursor-pointer select-none transition-transform duration-300 hover:scale-105 ${
        isRolling ? 'rotate-90 scale-95' : ''
      } ${state === 'idle' ? 'animate-bounce-subtle' : ''} ${className}`}
      style={{ width: size, height: size }}
    >
      <svg
        viewBox="0 0 120 120"
        width={size}
        height={size}
        className="drop-shadow-[4px_4px_0px_#111111]"
      >
        {/* Crown / Knight Helmet Top */}
        <path
          d="M 38 24 L 50 10 L 60 22 L 70 10 L 82 24 Z"
          fill="#FFD21F"
          stroke="#111111"
          strokeWidth="3"
          strokeLinejoin="round"
        />
        <circle cx="60" cy="18" r="3" fill="#EF4444" stroke="#111111" strokeWidth="1.5" />

        {/* Dog Ears */}
        <polygon
          points="26,45 15,18 42,32"
          fill="#D97706"
          stroke="#111111"
          strokeWidth="3.5"
          strokeLinejoin="round"
        />
        <polygon
          points="24,40 18,24 36,33"
          fill="#FDE68A"
        />
        <polygon
          points="94,45 105,18 78,32"
          fill="#D97706"
          stroke="#111111"
          strokeWidth="3.5"
          strokeLinejoin="round"
        />
        <polygon
          points="96,40 102,24 84,33"
          fill="#FDE68A"
        />

        {/* Head Base */}
        <ellipse
          cx="60"
          cy="62"
          rx="38"
          ry="34"
          fill="#F59E0B"
          stroke="#111111"
          strokeWidth="3.5"
        />

        {/* White / Cream Cheek Fluffs */}
        <ellipse cx="40" cy="68" rx="16" ry="18" fill="#FEF3C7" />
        <ellipse cx="80" cy="68" rx="16" ry="18" fill="#FEF3C7" />
        <ellipse cx="60" cy="74" rx="20" ry="16" fill="#FEF3C7" />

        {/* Eyebrows */}
        {isAngry ? (
          <>
            <line x1="36" y1="45" x2="48" y2="52" stroke="#111111" strokeWidth="4" strokeLinecap="round" />
            <line x1="84" y1="45" x2="72" y2="52" stroke="#111111" strokeWidth="4" strokeLinecap="round" />
          </>
        ) : isSmug ? (
          <>
            <path d="M 36 46 Q 42 42 48 47" fill="none" stroke="#111111" strokeWidth="3" strokeLinecap="round" />
            <path d="M 72 49 Q 78 44 84 48" fill="none" stroke="#111111" strokeWidth="3" strokeLinecap="round" />
          </>
        ) : (
          <>
            <circle cx="42" cy="46" r="3" fill="#B45309" />
            <circle cx="78" cy="46" r="3" fill="#B45309" />
          </>
        )}

        {/* Eyes */}
        {isSleeping ? (
          <>
            <path d="M 36 55 Q 42 59 48 55" fill="none" stroke="#111111" strokeWidth="3.5" strokeLinecap="round" />
            <path d="M 72 55 Q 78 59 84 55" fill="none" stroke="#111111" strokeWidth="3.5" strokeLinecap="round" />
            <text x="88" y="42" fontSize="14" fontWeight="bold" fill="#8B5CF6">Z</text>
            <text x="96" y="32" fontSize="11" fontWeight="bold" fill="#8B5CF6">z</text>
          </>
        ) : isLaughing ? (
          <>
            <path d="M 36 57 Q 43 49 50 57" fill="none" stroke="#111111" strokeWidth="4" strokeLinecap="round" />
            <path d="M 70 57 Q 77 49 84 57" fill="none" stroke="#111111" strokeWidth="4" strokeLinecap="round" />
          </>
        ) : (
          <>
            <ellipse cx="43" cy="56" rx="5" ry="6" fill="#111111" />
            <circle cx="41.5" cy="54" r="2" fill="#FFFFFF" />
            <ellipse cx="77" cy="56" rx="5" ry="6" fill="#111111" />
            <circle cx="75.5" cy="54" r="2" fill="#FFFFFF" />
          </>
        )}

        {/* Snout & Nose */}
        <ellipse cx="60" cy="72" rx="7" ry="5" fill="#111111" />

        {/* Mouth */}
        {isLaughing ? (
          <>
            <path
              d="M 50 78 Q 60 92 70 78 Z"
              fill="#EF4444"
              stroke="#111111"
              strokeWidth="3"
            />
            <path d="M 54 84 Q 60 88 66 84" fill="#F43F97" />
          </>
        ) : isAngry ? (
          <path d="M 52 82 Q 60 76 68 82" fill="none" stroke="#111111" strokeWidth="3" strokeLinecap="round" />
        ) : isSmug ? (
          <path d="M 52 79 Q 63 83 70 75" fill="none" stroke="#111111" strokeWidth="3" strokeLinecap="round" />
        ) : (
          <path
            d="M 52 76 Q 56 81 60 76 Q 64 81 68 76"
            fill="none"
            stroke="#111111"
            strokeWidth="2.5"
            strokeLinecap="round"
          />
        )}

        {/* Shield (Left) */}
        <g transform="translate(6, 68)">
          <path
            d="M 0 0 L 22 0 C 22 18 11 26 0 30 C -11 26 -22 18 -22 0 Z"
            fill="#8B5CF6"
            stroke="#111111"
            strokeWidth="3"
            transform="translate(15, 0)"
          />
          {/* Potato emblem on shield */}
          <ellipse cx="15" cy="12" rx="7" ry="5" fill="#FFD21F" stroke="#111111" strokeWidth="1.5" />
        </g>

        {/* Sword (Right) */}
        <g transform={isPointing ? "translate(88, 52) rotate(45)" : "translate(92, 58) rotate(15)"}>
          {/* Blade */}
          <rect x="-3" y="-30" width="6" height="30" fill="#E2E8F0" stroke="#111111" strokeWidth="2.5" />
          <polygon points="-3,-30 0,-36 3,-30" fill="#E2E8F0" stroke="#111111" strokeWidth="2.5" />
          {/* Guard & Grip */}
          <rect x="-8" y="0" width="16" height="4" fill="#FFD21F" stroke="#111111" strokeWidth="2" />
          <rect x="-2" y="4" width="4" height="8" fill="#92400E" stroke="#111111" strokeWidth="2" />
          <circle cx="0" cy="14" r="3" fill="#FFD21F" stroke="#111111" strokeWidth="1.5" />
        </g>
      </svg>
    </div>
  );
};
