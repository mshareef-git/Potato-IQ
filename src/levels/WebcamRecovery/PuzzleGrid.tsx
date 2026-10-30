import React, { useRef, useState, useEffect, useCallback } from 'react';
import { PuzzleTileData, HandCoords, InputMode } from './types';
import { PuzzleTile } from './PuzzleTile';
import { HandCursor } from './HandCursor';

interface PuzzleGridProps {
  tiles: PuzzleTileData[];
  handCoords: HandCoords;
  inputMode: InputMode;
  onSwap: (posA: number, posB: number) => void;
  onTileAction?: (action: 'grab' | 'swap' | 'drop-miss') => void;
  disabled?: boolean;
}

export const PuzzleGrid: React.FC<PuzzleGridProps> = ({
  tiles,
  handCoords,
  inputMode,
  onSwap,
  onTileAction,
  disabled = false,
}) => {
  const gridContainerRef = useRef<HTMLDivElement>(null);
  const [containerRect, setContainerRect] = useState<DOMRect | null>(null);

  // Hand tracking drag state
  const [draggedHandPos, setDraggedHandPos] = useState<number | null>(null);
  const [hoverTargetPos, setHoverTargetPos] = useState<number | null>(null);
  const wasPinchingRef = useRef<boolean>(false);
  const draggedHandPosRef = useRef<number | null>(null);

  // Mouse fallback selection state
  const [selectedMousePos, setSelectedMousePos] = useState<number | null>(null);
  const [mouseDragStartPos, setMouseDragStartPos] = useState<number | null>(null);

  // Update container bounding rectangle on resize/scroll
  const updateRect = useCallback(() => {
    if (gridContainerRef.current) {
      setContainerRect(gridContainerRef.current.getBoundingClientRect());
    }
  }, []);

  useEffect(() => {
    updateRect();
    window.addEventListener('resize', updateRect);
    window.addEventListener('scroll', updateRect);
    return () => {
      window.removeEventListener('resize', updateRect);
      window.removeEventListener('scroll', updateRect);
    };
  }, [updateRect]);

  // Sync ref
  useEffect(() => {
    draggedHandPosRef.current = draggedHandPos;
  }, [draggedHandPos]);

  // Handle hand tracking gestures mapped to 4x4 grid cells
  useEffect(() => {
    if (disabled || inputMode !== 'hand') {
      if (draggedHandPos !== null) {
        setDraggedHandPos(null);
        setHoverTargetPos(null);
      }
      return;
    }

    if (!handCoords.hasHand) {
      // Safe cancellation if hand tracking lost mid-drag
      if (draggedHandPosRef.current !== null) {
        setDraggedHandPos(null);
        setHoverTargetPos(null);
        onTileAction?.('drop-miss');
      }
      wasPinchingRef.current = false;
      return;
    }

    // Determine which cell (0..15) the cursor is currently over
    let currentCell: number | null = null;
    if (
      handCoords.x >= 0 &&
      handCoords.x <= 1 &&
      handCoords.y >= 0 &&
      handCoords.y <= 1
    ) {
      const col = Math.min(3, Math.max(0, Math.floor(handCoords.x * 4)));
      const row = Math.min(3, Math.max(0, Math.floor(handCoords.y * 4)));
      currentCell = row * 4 + col;
    }

    const isPinching = handCoords.isPinching;
    const wasPinching = wasPinchingRef.current;

    // PINCH START: Grab tile
    if (isPinching && !wasPinching) {
      if (currentCell !== null && currentCell >= 0 && currentCell < 16) {
        setDraggedHandPos(currentCell);
        setHoverTargetPos(currentCell);
        onTileAction?.('grab');
      }
    }
    // PINCH CONTINUE: Update hover target
    else if (isPinching && wasPinching) {
      if (draggedHandPosRef.current !== null) {
        setHoverTargetPos(currentCell);
      }
    }
    // PINCH RELEASE: Drop/Swap tile
    else if (!isPinching && wasPinching) {
      const activeDrag = draggedHandPosRef.current;
      if (activeDrag !== null) {
        if (
          currentCell !== null &&
          currentCell >= 0 &&
          currentCell < 16 &&
          currentCell !== activeDrag
        ) {
          onSwap(activeDrag, currentCell);
          onTileAction?.('swap');
        } else {
          onTileAction?.('drop-miss');
        }
        setDraggedHandPos(null);
        setHoverTargetPos(null);
      }
    }

    wasPinchingRef.current = isPinching;
  }, [handCoords, disabled, inputMode, onSwap, onTileAction]);

  // Mouse / Touch Fallback handlers
  const handleTileClick = (pos: number) => {
    if (disabled) return;

    if (selectedMousePos === null) {
      setSelectedMousePos(pos);
      onTileAction?.('grab');
    } else if (selectedMousePos === pos) {
      setSelectedMousePos(null);
    } else {
      onSwap(selectedMousePos, pos);
      onTileAction?.('swap');
      setSelectedMousePos(null);
    }
  };

  const handlePointerDown = (pos: number, e: React.PointerEvent) => {
    if (disabled) return;
    setMouseDragStartPos(pos);
    (e.target as HTMLElement).setPointerCapture?.(e.pointerId);
  };

  const handlePointerUp = (pos: number) => {
    if (mouseDragStartPos !== null && mouseDragStartPos !== pos) {
      onSwap(mouseDragStartPos, pos);
      onTileAction?.('swap');
    }
    setMouseDragStartPos(null);
  };

  return (
    <div className="relative w-full max-w-[500px] md:max-w-[540px] aspect-square mx-auto">
      {/* Outer neo-brutalist puzzle frame */}
      <div
        ref={gridContainerRef}
        onPointerLeave={() => setMouseDragStartPos(null)}
        className="relative w-full h-full bg-neutral-900 border-4 border-black rounded-lg p-2 md:p-3 shadow-[8px_8px_0px_#000] grid grid-cols-4 grid-rows-4 gap-1.5 md:gap-2 select-none overflow-hidden"
      >
        {tiles.map((tile, pos) => {
          const isCorrect = tile.originalIndex === pos;
          const isDragged =
            draggedHandPos === pos || mouseDragStartPos === pos;
          const isHover =
            hoverTargetPos === pos && draggedHandPos !== null && draggedHandPos !== pos;
          const isSelected = selectedMousePos === pos;

          return (
            <div
              key={tile.id}
              onPointerUp={() => handlePointerUp(pos)}
              className="relative w-full h-full"
            >
              <PuzzleTile
                tile={tile}
                isCorrect={isCorrect}
                isDragged={isDragged}
                isHoverTarget={isHover}
                isSelectedMouse={isSelected}
                onClick={() => handleTileClick(pos)}
                onPointerDown={(e) => handlePointerDown(pos, e)}
              />
            </div>
          );
        })}

        {/* Virtual Fingertip Cursor Overlay */}
        <HandCursor
          coords={handCoords}
          containerRect={containerRect}
          visible={inputMode === 'hand' && !disabled}
        />
      </div>
    </div>
  );
};
