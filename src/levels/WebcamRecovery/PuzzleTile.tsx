import React from 'react';
import { PuzzleTileData } from './types';
import { Check } from 'lucide-react';

interface PuzzleTileProps {
  tile: PuzzleTileData;
  isCorrect: boolean;
  isDragged: boolean;
  isHoverTarget: boolean;
  isSelectedMouse: boolean;
  onClick: () => void;
  onPointerDown?: (e: React.PointerEvent) => void;
}

export const PuzzleTile: React.FC<PuzzleTileProps> = ({
  tile,
  isCorrect,
  isDragged,
  isHoverTarget,
  isSelectedMouse,
  onClick,
  onPointerDown,
}) => {
  return (
    <div
      data-position={tile.currentPosition}
      data-original={tile.originalIndex}
      onClick={onClick}
      onPointerDown={onPointerDown}
      className={`relative aspect-square w-full select-none cursor-pointer rounded-sm overflow-hidden transition-all duration-100 touch-none ${
        isDragged
          ? 'z-30 scale-105 border-4 border-[var(--purple,#9333ea)] shadow-[8px_8px_0px_#000] rotate-1 ring-4 ring-yellow-400'
          : isSelectedMouse
          ? 'z-20 scale-102 border-4 border-yellow-400 shadow-[4px_4px_0px_#000] animate-pulse'
          : isHoverTarget
          ? 'border-4 border-dashed border-yellow-400 scale-98 shadow-inner bg-yellow-200/40'
          : isCorrect
          ? 'border-2 border-green-600 shadow-[2px_2px_0px_#000]'
          : 'border-2 border-black shadow-[2px_2px_0px_#000] hover:border-neutral-700'
      }`}
    >
      {/* Tile image fragment */}
      <img
        src={tile.dataUrl}
        alt={`Tile ${tile.originalIndex}`}
        draggable={false}
        className="w-full h-full object-cover pointer-events-none"
      />

      {/* Correct placement subtle indicator */}
      {isCorrect && !isDragged && (
        <div
          className="absolute top-1 right-1 p-0.5 bg-green-500 text-white rounded-full border border-black shadow-[1px_1px_0px_#000] pointer-events-none"
          title="Piece in place"
        >
          <Check className="w-2.5 h-2.5 stroke-[3]" />
        </div>
      )}

      {/* Selected for mouse swap badge */}
      {isSelectedMouse && (
        <div className="absolute bottom-1 left-1 px-1 py-0.2 bg-yellow-300 text-black text-[9px] font-heading border border-black rounded shadow-[1px_1px_0px_#000]">
          SELECTED
        </div>
      )}
    </div>
  );
};
