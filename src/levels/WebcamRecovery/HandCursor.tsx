import React from 'react';
import { HandCoords } from './types';

interface HandCursorProps {
  coords: HandCoords;
  containerRect: DOMRect | null;
  visible: boolean;
}

export const HandCursor: React.FC<HandCursorProps> = ({
  coords,
  containerRect,
  visible,
}) => {
  if (!visible || !coords.hasHand || !containerRect) {
    return null;
  }

  // Map 0..1 coordinates into container pixel space
  const cursorX = coords.x * containerRect.width;
  const cursorY = coords.y * containerRect.height;

  const isPinching = coords.isPinching;

  return (
    <div
      className="pointer-events-none absolute z-50 transition-transform duration-75 ease-out select-none"
      style={{
        left: `${cursorX}px`,
        top: `${cursorY}px`,
        transform: 'translate(-50%, -50%)',
      }}
    >
      {/* Reticle Circle */}
      <div
        className={`relative flex items-center justify-center transition-all duration-150 ${
          isPinching
            ? 'w-10 h-10 bg-[var(--purple,#9333ea)] border-3 border-black rounded-full shadow-[2px_2px_0px_#000] scale-95'
            : 'w-12 h-12 bg-yellow-300/80 border-3 border-black rounded-full shadow-[3px_3px_0px_#000] scale-100'
        }`}
      >
        {/* Crosshair ticks */}
        <div className="absolute w-full h-[2px] bg-black pointer-events-none opacity-60" />
        <div className="absolute h-full w-[2px] bg-black pointer-events-none opacity-60" />

        {/* Center Fingertip Target Dot */}
        <div
          className={`w-3.5 h-3.5 rounded-full border-2 border-black ${
            isPinching ? 'bg-white animate-pulse' : 'bg-red-500'
          }`}
        />

        {/* Gesture State Tooltip Badge */}
        <div
          className={`absolute -top-7 px-1.5 py-0.5 text-[10px] font-heading border-2 border-black rounded shadow-[1px_1px_0px_#000] whitespace-nowrap ${
            isPinching
              ? 'bg-purple-300 text-purple-950 font-black'
              : 'bg-yellow-200 text-yellow-950 font-bold'
          }`}
        >
          {isPinching ? 'GRABBED' : 'POINTING'}
        </div>
      </div>
    </div>
  );
};
