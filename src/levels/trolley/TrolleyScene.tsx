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

  // Trolley positions along tracks:
  // Initial: x=80, y=160
  // Paused: x=190, y=160
  // Diverted: x=650, y=80 (hits 1 person)
  // DefaultHit: x=650, y=240 (hits 5 people)
  // Split: two trolleys, one at (650, 80) and one at (650, 240)

  return (
    <div className="relative w-full h-[320px] md:h-[380px] bg-[#6EC6FF] dark:bg-[#102a43] border-4 border-black rounded-xl overflow-hidden shadow-[6px_6px_0px_#000]">
      {/* Sky & Distant Hills */}
      <div className="absolute inset-x-0 bottom-24 h-28 bg-[#93c5fd] dark:bg-[#1e3a8a] opacity-40 rounded-t-[100%]" />

      {/* Ground & Rails Bed */}
      <div className="absolute inset-x-0 bottom-0 h-44 bg-[#86efac] dark:bg-[#14532d] border-t-4 border-black" />

      {/* Full SVG Scene (Tracks, Sleepers, Lever, Illustrated Figures) */}
      <svg className="absolute inset-0 w-full h-full" viewBox="0 0 900 380" preserveAspectRatio="xMidYMid slice">
        {/* Track 1: Main Approach Ties */}
        {Array.from({ length: 14 }).map((_, i) => (
          <line
            key={`tie-main-${i}`}
            x1={20 + i * 22}
            y1={200}
            x2={20 + i * 22}
            y2={236}
            stroke="#5c2c16"
            strokeWidth="7"
          />
        ))}

        {/* Fork Junction Switch Ties */}
        {Array.from({ length: 18 }).map((_, i) => (
          <line
            key={`tie-upper-${i}`}
            x1={330 + i * 28}
            y1={175 - i * 4}
            x2={330 + i * 28}
            y2={205 - i * 4}
            stroke="#5c2c16"
            strokeWidth="7"
          />
        ))}

        {Array.from({ length: 18 }).map((_, i) => (
          <line
            key={`tie-lower-${i}`}
            x1={330 + i * 28}
            y1={235 + i * 3}
            x2={330 + i * 28}
            y2={265 + i * 3}
            stroke="#5c2c16"
            strokeWidth="7"
          />
        ))}

        {/* Rails (Double Steel Lines) */}
        {/* Approach Rails */}
        <line x1="0" y1="208" x2="330" y2="208" stroke="#111111" strokeWidth="5" />
        <line x1="0" y1="228" x2="330" y2="228" stroke="#111111" strokeWidth="5" />

        {/* Switch Junction point */}
        <circle cx="330" cy="218" r="8" fill="#FFD21F" stroke="#111111" strokeWidth="3" />

        {/* Upper Diverted Track -> 1 Person */}
        <path d="M 330 208 Q 450 190 890 100" stroke="#111111" strokeWidth="5" fill="none" />
        <path d="M 330 228 Q 450 210 890 120" stroke="#111111" strokeWidth="5" fill="none" />

        {/* Lower Default Track -> 5 People */}
        <path d="M 330 208 Q 450 225 890 280" stroke="#111111" strokeWidth="5" fill="none" />
        <path d="M 330 228 Q 450 245 890 300" stroke="#111111" strokeWidth="5" fill="none" />

        {/* Mechanical Switch Lever Base & Arm */}
        <rect x="315" y="140" width="28" height="16" rx="4" fill="#111111" />
        <line
          x1="329"
          y1="148"
          x2={choice === 'pull' ? '310' : '348'}
          y2="115"
          stroke="#EF4444"
          strokeWidth="6"
          strokeLinecap="round"
        />
        <circle
          cx={choice === 'pull' ? '310' : '348'}
          cy="115"
          r="8"
          fill={choice === 'pull' ? '#A3E635' : '#EF4444'}
          stroke="#111111"
          strokeWidth="2.5"
        />
        <text x="329" y="100" textAnchor="middle" fontSize="11" fontWeight="900" fill="#111111" fontFamily="sans-serif">
          LEVER
        </text>

        {/* High-Contrast Clear Track Labels */}
        <g transform="translate(680, 60)">
          <rect x="0" y="0" width="180" height="28" rx="6" fill="#FFD21F" stroke="#111111" strokeWidth="3" />
          <text x="90" y="19" textAnchor="middle" fontSize="12" fontWeight="900" fill="#111111" fontFamily="sans-serif">
            SIDE TRACK: 1 PERSON
          </text>
        </g>

        <g transform="translate(660, 330)">
          <rect x="0" y="0" width="210" height="28" rx="6" fill="#EF4444" stroke="#111111" strokeWidth="3" />
          <text x="105" y="19" textAnchor="middle" fontSize="12" fontWeight="900" fill="#FFFFFF" fontFamily="sans-serif">
            DEFAULT TRACK: 5 PEOPLE ⚠️
          </text>
        </g>

        {/* Illustrated Vector Figures */}
        {/* 1 Person on Side Track */}
        <g
          transform="translate(760, 95)"
          className={`transition-all duration-500 ${
            isDiverted || isSplit ? 'opacity-40 rotate-90 scale-90' : ''
          }`}
        >
          {/* Tied rope around figure */}
          <ellipse cx="15" cy="22" rx="14" ry="18" fill="none" stroke="#78350f" strokeWidth="3" strokeDasharray="4,2" />
          {/* Head */}
          <circle cx="15" cy="5" r="9" fill="#FDE047" stroke="#111111" strokeWidth="2.5" />
          {/* Eyes & mouth */}
          <circle cx="12" cy="4" r="1.5" fill="#111111" />
          <circle cx="18" cy="4" r="1.5" fill="#111111" />
          <path d="M 12 9 Q 15 12 18 9" stroke="#111111" strokeWidth="1.5" fill="none" />
          {/* Body */}
          <line x1="15" y1="14" x2="15" y2="34" stroke="#111111" strokeWidth="3.5" />
          {/* Arms tied */}
          <line x1="5" y1="22" x2="25" y2="22" stroke="#111111" strokeWidth="3" />
          {/* Legs tied */}
          <line x1="15" y1="34" x2="10" y2="48" stroke="#111111" strokeWidth="3" />
          <line x1="15" y1="34" x2="20" y2="48" stroke="#111111" strokeWidth="3" />
          {/* Poof cloud on hit */}
          {(isDiverted || isSplit) && (
            <text x="15" y="25" textAnchor="middle" fontSize="24">
              💥
            </text>
          )}
        </g>

        {/* 5 Distinct Figures in a row on Default Track */}
        {[0, 1, 2, 3, 4].map((idx) => {
          const posX = 640 + idx * 46;
          const isHit = isDefaultHit || isSplit;
          return (
            <g
              key={`person-five-${idx}`}
              transform={`translate(${posX}, 265)`}
              className={`transition-all duration-500 ${isHit ? 'opacity-40 rotate-90 scale-90' : ''}`}
            >
              {/* Tied ropes */}
              <ellipse cx="12" cy="20" rx="12" ry="16" fill="none" stroke="#78350f" strokeWidth="2.5" strokeDasharray="3,2" />
              {/* Head */}
              <circle cx="12" cy="4" r="8" fill="#FDE047" stroke="#111111" strokeWidth="2.5" />
              <circle cx="10" cy="3" r="1.2" fill="#111111" />
              <circle cx="15" cy="3" r="1.2" fill="#111111" />
              <path d="M 10 7 Q 12 10 15 7" stroke="#111111" strokeWidth="1.5" fill="none" />
              {/* Body */}
              <line x1="12" y1="12" x2="12" y2="30" stroke="#111111" strokeWidth="3" />
              {/* Arms tied */}
              <line x1="4" y1="18" x2="20" y2="18" stroke="#111111" strokeWidth="2.5" />
              {/* Legs tied */}
              <line x1="12" y1="30" x2="7" y2="44" stroke="#111111" strokeWidth="2.5" />
              <line x1="12" y1="30" x2="17" y2="44" stroke="#111111" strokeWidth="2.5" />
              {/* Poof on hit */}
              {isHit && (
                <text x="12" y="22" textAnchor="middle" fontSize="20">
                  💥
                </text>
              )}
            </g>
          );
        })}

        {/* Illustrated Vector Trolley (Original Side-View Cable Car) */}
        {!isSplit && (
          <g
            className="transition-all duration-700 ease-out"
            transform={
              isDiverted
                ? 'translate(620, 35)'
                : isDefaultHit
                ? 'translate(600, 205)'
                : isPaused
                ? 'translate(190, 140)'
                : 'translate(60, 140)'
            }
          >
            {/* Trolley Body */}
            {/* Cowcatcher / Front Grill */}
            <polygon points="120,45 138,58 120,58" fill="#111111" stroke="#111111" strokeWidth="2" />
            {/* Main Carriage Box */}
            <rect x="0" y="10" width="124" height="48" rx="6" fill="#EF4444" stroke="#111111" strokeWidth="4" />
            {/* Gold Trim Stripe */}
            <rect x="0" y="36" width="124" height="8" fill="#FFD21F" stroke="#111111" strokeWidth="2" />
            {/* Roof Canopy */}
            <rect x="-4" y="2" width="132" height="10" rx="3" fill="#B91C1C" stroke="#111111" strokeWidth="3" />
            {/* Trolley Pole / Pantograph */}
            <line x1="60" y1="2" x2="40" y2="-18" stroke="#111111" strokeWidth="3" />
            <circle cx="40" cy="-18" r="3" fill="#FFD21F" stroke="#111111" strokeWidth="2" />

            {/* Passenger Windows */}
            <rect x="10" y="16" width="18" height="16" rx="2" fill="#E0F2FE" stroke="#111111" strokeWidth="2" />
            <rect x="36" y="16" width="18" height="16" rx="2" fill="#E0F2FE" stroke="#111111" strokeWidth="2" />
            <rect x="62" y="16" width="18" height="16" rx="2" fill="#E0F2FE" stroke="#111111" strokeWidth="2" />
            <rect x="88" y="16" width="24" height="16" rx="2" fill="#E0F2FE" stroke="#111111" strokeWidth="2" />

            {/* Headlight */}
            <circle cx="125" cy="40" r="5" fill="#FEF08A" stroke="#111111" strokeWidth="2" />

            {/* Steel Wheels */}
            <circle cx="26" cy="62" r="10" fill="#71717A" stroke="#111111" strokeWidth="3.5" />
            <circle cx="26" cy="62" r="4" fill="#111111" />
            <circle cx="98" cy="62" r="10" fill="#71717A" stroke="#111111" strokeWidth="3.5" />
            <circle cx="98" cy="62" r="4" fill="#111111" />
            {/* Wheel Axis bar */}
            <line x1="26" y1="62" x2="98" y2="62" stroke="#111111" strokeWidth="3" />
          </g>
        )}

        {/* Split Failure Outcome: Two Runaway Half-Trolleys on Both Tracks! */}
        {isSplit && (
          <>
            {/* Upper Split Trolley hitting 1 Person */}
            <g className="transition-all duration-700 ease-out" transform="translate(620, 35)">
              <rect x="0" y="12" width="70" height="38" rx="4" fill="#EF4444" stroke="#111111" strokeWidth="3.5" />
              <rect x="6" y="18" width="16" height="12" rx="2" fill="#E0F2FE" stroke="#111111" strokeWidth="2" />
              <rect x="28" y="18" width="16" height="12" rx="2" fill="#E0F2FE" stroke="#111111" strokeWidth="2" />
              <circle cx="18" cy="54" r="8" fill="#71717A" stroke="#111111" strokeWidth="3" />
              <circle cx="52" cy="54" r="8" fill="#71717A" stroke="#111111" strokeWidth="3" />
              <text x="35" y="-5" textAnchor="middle" fontSize="11" fontWeight="bold" fill="#EF4444">
                SPLIT BOGIE A ⚠️
              </text>
            </g>

            {/* Lower Split Trolley hitting 5 People */}
            <g className="transition-all duration-700 ease-out" transform="translate(600, 205)">
              <rect x="0" y="12" width="70" height="38" rx="4" fill="#EF4444" stroke="#111111" strokeWidth="3.5" />
              <rect x="6" y="18" width="16" height="12" rx="2" fill="#E0F2FE" stroke="#111111" strokeWidth="2" />
              <rect x="28" y="18" width="16" height="12" rx="2" fill="#E0F2FE" stroke="#111111" strokeWidth="2" />
              <circle cx="18" cy="54" r="8" fill="#71717A" stroke="#111111" strokeWidth="3" />
              <circle cx="52" cy="54" r="8" fill="#71717A" stroke="#111111" strokeWidth="3" />
              <text x="35" y="-5" textAnchor="middle" fontSize="11" fontWeight="bold" fill="#EF4444">
                SPLIT BOGIE B ⚠️
              </text>
            </g>
          </>
        )}
      </svg>
    </div>
  );
};
