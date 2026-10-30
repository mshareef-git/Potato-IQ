import React from 'react';
import { TrolleyChoice, TrolleyOutcome } from '../../store/gameStore';

export interface TrolleySceneProps {
  choice: TrolleyChoice;
  outcome: TrolleyOutcome;
  isPaused: boolean;
}

export const TrolleyScene: React.FC<TrolleySceneProps> = ({ choice, outcome, isPaused }) => {
  const isDiverted = outcome === 'five-saved-one-hit';
  const isSplit = outcome === 'both-groups-hit';
  const isDefaultHit = outcome === 'five-hit';

  return (
    <div className="relative w-full h-[340px] md:h-[400px] bg-[#6EC6FF] border-4 border-black rounded-xl overflow-hidden shadow-[6px_6px_0px_#000] game-scene select-none">
      {/* Sky & Distant Mountain Layers */}
      <div className="absolute inset-x-0 bottom-28 h-32 bg-[#93c5fd] opacity-50 rounded-t-[100%]" />
      <div className="absolute inset-x-0 bottom-24 h-24 bg-[#60a5fa] opacity-30 rounded-t-[80%]" />

      {/* Ground & Grass Bed */}
      <div className="absolute inset-x-0 bottom-0 h-48 bg-[#86efac] border-t-4 border-black" />

      {/* Full SVG Scene (Tracks, Sleepers, Lever, Figures, Trolley) */}
      <svg className="absolute inset-0 w-full h-full" viewBox="0 0 920 400" preserveAspectRatio="xMidYMid meet">
        {/* Track 1: Main Approach Ties */}
        {Array.from({ length: 15 }).map((_, i) => (
          <line
            key={`tie-main-${i}`}
            x1={15 + i * 22}
            y1={210}
            x2={15 + i * 22}
            y2={250}
            stroke="#5c2c16"
            strokeWidth="7"
          />
        ))}

        {/* Upper Diverted Track Ties (to 1 person) */}
        {Array.from({ length: 19 }).map((_, i) => (
          <line
            key={`tie-upper-${i}`}
            x1={340 + i * 28}
            y1={185 - i * 4.2}
            x2={340 + i * 28}
            y2={218 - i * 4.2}
            stroke="#5c2c16"
            strokeWidth="7"
          />
        ))}

        {/* Lower Default Track Ties (to 5 people) */}
        {Array.from({ length: 19 }).map((_, i) => (
          <line
            key={`tie-lower-${i}`}
            x1={340 + i * 28}
            y1={245 + i * 3.5}
            x2={340 + i * 28}
            y2={278 + i * 3.5}
            stroke="#5c2c16"
            strokeWidth="7"
          />
        ))}

        {/* Rails (Double Heavy Steel Lines) */}
        {/* Main Approach */}
        <line x1="0" y1="220" x2="340" y2="220" stroke="#111111" strokeWidth="5" />
        <line x1="0" y1="240" x2="340" y2="240" stroke="#111111" strokeWidth="5" />

        {/* Switch Junction point */}
        <circle cx="340" cy="230" r="9" fill="#FFD21F" stroke="#111111" strokeWidth="3.5" />

        {/* Upper Diverted Track -> 1 Person */}
        <path d="M 340 220 Q 480 200 910 100" stroke="#111111" strokeWidth="5.5" fill="none" />
        <path d="M 340 240 Q 480 220 910 120" stroke="#111111" strokeWidth="5.5" fill="none" />

        {/* Lower Default Track -> 5 People */}
        <path d="M 340 220 Q 480 240 910 300" stroke="#111111" strokeWidth="5.5" fill="none" />
        <path d="M 340 240 Q 480 260 910 320" stroke="#111111" strokeWidth="5.5" fill="none" />

        {/* Mechanical Switch Lever */}
        <g transform="translate(325, 130)">
          <rect x="0" y="24" width="30" height="18" rx="4" fill="#111111" stroke="#FFFFFF" strokeWidth="1.5" />
          <line
            x1="15"
            y1="30"
            x2={choice === 'pull' ? '-4' : '34'}
            y2="0"
            stroke="#EF4444"
            strokeWidth="7"
            strokeLinecap="round"
          />
          <circle
            cx={choice === 'pull' ? '-4' : '34'}
            cy="0"
            r="9"
            fill={choice === 'pull' ? '#22C55E' : '#EF4444'}
            stroke="#111111"
            strokeWidth="3"
          />
          <g transform="translate(-10, -22)">
            <rect x="0" y="0" width="50" height="16" rx="4" fill="#FFFFFF" stroke="#111111" strokeWidth="2" />
            <text x="25" y="12" textAnchor="middle" fontSize="10" fontWeight="900" fill="#111111" fontFamily="sans-serif">
              LEVER
            </text>
          </g>
        </g>

        {/* Track Outcome Signboards */}
        <g transform="translate(680, 50)">
          <rect x="0" y="0" width="190" height="30" rx="6" fill="#FFD21F" stroke="#111111" strokeWidth="3" />
          <text x="95" y="20" textAnchor="middle" fontSize="12" fontWeight="900" fill="#111111" fontFamily="sans-serif">
            SIDE TRACK: 1 PERSON
          </text>
        </g>

        <g transform="translate(670, 350)">
          <rect x="0" y="0" width="220" height="30" rx="6" fill="#EF4444" stroke="#111111" strokeWidth="3" />
          <text x="110" y="20" textAnchor="middle" fontSize="12" fontWeight="900" fill="#FFFFFF" fontFamily="sans-serif">
            DEFAULT TRACK: 5 PEOPLE ⚠️
          </text>
        </g>

        {/* 1 Person Tied to Upper Track */}
        <g
          transform="translate(780, 95)"
          className={`transition-all duration-500 ${
            isDiverted || isSplit ? 'opacity-40 rotate-90 scale-90' : ''
          }`}
        >
          <ellipse cx="16" cy="24" rx="15" ry="20" fill="none" stroke="#78350f" strokeWidth="3.5" strokeDasharray="4,2" />
          <circle cx="16" cy="6" r="10" fill="#FDE047" stroke="#111111" strokeWidth="3" />
          <circle cx="13" cy="5" r="1.5" fill="#111111" />
          <circle cx="19" cy="5" r="1.5" fill="#111111" />
          <path d="M 13 10 Q 16 13 19 10" stroke="#111111" strokeWidth="2" fill="none" />
          <line x1="16" y1="16" x2="16" y2="38" stroke="#111111" strokeWidth="4" />
          <line x1="5" y1="25" x2="27" y2="25" stroke="#111111" strokeWidth="3.5" />
          <line x1="16" y1="38" x2="10" y2="52" stroke="#111111" strokeWidth="3.5" />
          <line x1="16" y1="38" x2="22" y2="52" stroke="#111111" strokeWidth="3.5" />
          {(isDiverted || isSplit) && (
            <text x="16" y="28" textAnchor="middle" fontSize="26">
              💥
            </text>
          )}
        </g>

        {/* 5 People Tied in Row to Lower Track */}
        {[0, 1, 2, 3, 4].map((idx) => {
          const posX = 640 + idx * 48;
          const isHit = isDefaultHit || isSplit;
          return (
            <g
              key={`person-five-${idx}`}
              transform={`translate(${posX}, 285)`}
              className={`transition-all duration-500 ${isHit ? 'opacity-40 rotate-90 scale-90' : ''}`}
            >
              <ellipse cx="14" cy="22" rx="13" ry="18" fill="none" stroke="#78350f" strokeWidth="3" strokeDasharray="3,2" />
              <circle cx="14" cy="5" r="9" fill="#FDE047" stroke="#111111" strokeWidth="2.5" />
              <circle cx="11" cy="4" r="1.3" fill="#111111" />
              <circle cx="17" cy="4" r="1.3" fill="#111111" />
              <path d="M 11 8 Q 14 11 17 8" stroke="#111111" strokeWidth="1.8" fill="none" />
              <line x1="14" y1="14" x2="14" y2="34" stroke="#111111" strokeWidth="3.5" />
              <line x1="4" y1="21" x2="24" y2="21" stroke="#111111" strokeWidth="3" />
              <line x1="14" y1="34" x2="9" y2="48" stroke="#111111" strokeWidth="3" />
              <line x1="14" y1="34" x2="19" y2="48" stroke="#111111" strokeWidth="3" />
              {isHit && (
                <text x="14" y="24" textAnchor="middle" fontSize="22">
                  💥
                </text>
              )}
            </g>
          );
        })}

        {/* Side-View Illustrated Trolley Car (Original Vector Illustration) */}
        {!isSplit && (
          <g
            className="transition-all duration-700 ease-out"
            transform={
              isDiverted
                ? 'translate(630, 45)'
                : isDefaultHit
                ? 'translate(610, 225)'
                : isPaused
                ? 'translate(200, 150)'
                : 'translate(60, 150)'
            }
          >
            {/* Front Cowcatcher Grill */}
            <polygon points="126,48 146,62 126,62" fill="#111111" stroke="#111111" strokeWidth="2" />
            {/* Main Carriage Body */}
            <rect x="0" y="10" width="130" height="52" rx="6" fill="#EF4444" stroke="#111111" strokeWidth="4" />
            {/* Gold Accent Stripe */}
            <rect x="0" y="38" width="130" height="8" fill="#FFD21F" stroke="#111111" strokeWidth="2" />
            {/* Roof Canopy */}
            <rect x="-4" y="2" width="138" height="11" rx="3" fill="#B91C1C" stroke="#111111" strokeWidth="3" />
            {/* Trolley Pantograph */}
            <line x1="65" y1="2" x2="45" y2="-18" stroke="#111111" strokeWidth="3.5" />
            <circle cx="45" cy="-18" r="3.5" fill="#FFD21F" stroke="#111111" strokeWidth="2" />

            {/* Windows */}
            <rect x="12" y="16" width="18" height="18" rx="2" fill="#E0F2FE" stroke="#111111" strokeWidth="2" />
            <rect x="38" y="16" width="18" height="18" rx="2" fill="#E0F2FE" stroke="#111111" strokeWidth="2" />
            <rect x="64" y="16" width="18" height="18" rx="2" fill="#E0F2FE" stroke="#111111" strokeWidth="2" />
            <rect x="90" y="16" width="24" height="18" rx="2" fill="#E0F2FE" stroke="#111111" strokeWidth="2" />

            {/* Headlight Beam */}
            <circle cx="131" cy="44" r="5" fill="#FEF08A" stroke="#111111" strokeWidth="2" />

            {/* Wheels & Axle */}
            <circle cx="28" cy="66" r="11" fill="#71717A" stroke="#111111" strokeWidth="3.5" />
            <circle cx="28" cy="66" r="4" fill="#111111" />
            <circle cx="102" cy="66" r="11" fill="#71717A" stroke="#111111" strokeWidth="3.5" />
            <circle cx="102" cy="66" r="4" fill="#111111" />
            <line x1="28" y1="66" x2="102" y2="66" stroke="#111111" strokeWidth="3.5" />
          </g>
        )}

        {/* Split Outcome: Both Tracks Hit! */}
        {isSplit && (
          <>
            {/* Bogie A on Upper Track */}
            <g className="transition-all duration-700 ease-out" transform="translate(630, 45)">
              <rect x="0" y="14" width="76" height="42" rx="4" fill="#EF4444" stroke="#111111" strokeWidth="3.5" />
              <rect x="8" y="20" width="18" height="14" rx="2" fill="#E0F2FE" stroke="#111111" strokeWidth="2" />
              <rect x="32" y="20" width="18" height="14" rx="2" fill="#E0F2FE" stroke="#111111" strokeWidth="2" />
              <circle cx="20" cy="58" r="9" fill="#71717A" stroke="#111111" strokeWidth="3" />
              <circle cx="56" cy="58" r="9" fill="#71717A" stroke="#111111" strokeWidth="3" />
              <text x="38" y="-4" textAnchor="middle" fontSize="12" fontWeight="900" fill="#EF4444" stroke="#FFFFFF" strokeWidth="0.5">
                BOGIE A ⚠️
              </text>
            </g>

            {/* Bogie B on Lower Track */}
            <g className="transition-all duration-700 ease-out" transform="translate(610, 225)">
              <rect x="0" y="14" width="76" height="42" rx="4" fill="#EF4444" stroke="#111111" strokeWidth="3.5" />
              <rect x="8" y="20" width="18" height="14" rx="2" fill="#E0F2FE" stroke="#111111" strokeWidth="2" />
              <rect x="32" y="20" width="18" height="14" rx="2" fill="#E0F2FE" stroke="#111111" strokeWidth="2" />
              <circle cx="20" cy="58" r="9" fill="#71717A" stroke="#111111" strokeWidth="3" />
              <circle cx="56" cy="58" r="9" fill="#71717A" stroke="#111111" strokeWidth="3" />
              <text x="38" y="-4" textAnchor="middle" fontSize="12" fontWeight="900" fill="#EF4444" stroke="#FFFFFF" strokeWidth="0.5">
                BOGIE B ⚠️
              </text>
            </g>
          </>
        )}
      </svg>
    </div>
  );
};
