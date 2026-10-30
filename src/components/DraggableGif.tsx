import React, { useRef, useState, useCallback, useEffect } from 'react';
import { GifAssetDef } from '../data/assetManifest';

export type GifSizeBand = 'small' | 'medium' | 'large';

export interface FloatingGifInstance {
  instanceId: string;
  asset: GifAssetDef;
  x: number;
  y: number;
  sizeBand: GifSizeBand;
  width: number;
  height: number;
  createdAt?: number;
}

export interface DraggableGifProps {
  instance: FloatingGifInstance;
  onClose: (instanceId: string) => void;
  onPositionChange: (instanceId: string, x: number, y: number) => void;
}

export const DraggableGif: React.FC<DraggableGifProps> = ({
  instance,
  onClose,
  onPositionChange,
}) => {
  const [pos, setPos] = useState<{ x: number; y: number }>({ x: instance.x, y: instance.y });
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const pointerActiveRef = useRef<boolean>(false);
  const dragStartRef = useRef<{
    pointerX: number;
    pointerY: number;
    startX: number;
    startY: number;
    hasMovedBeyondThreshold: boolean;
  }>({
    pointerX: 0,
    pointerY: 0,
    startX: 0,
    startY: 0,
    hasMovedBeyondThreshold: false,
  });

  const cardRef = useRef<HTMLDivElement>(null);

  // Clamp position to viewport bounds so GIF remains visible & draggable
  const clampPosition = useCallback(
    (x: number, y: number) => {
      const w = instance.width || 100;
      const h = instance.height || 100;

      const minX = 6;
      const maxX = Math.max(minX, window.innerWidth - w - 8);
      const minY = 64; // clear top navigation header
      const maxY = Math.max(minY, window.innerHeight - h - 12);

      return {
        x: Math.min(Math.max(x, minX), maxX),
        y: Math.min(Math.max(y, minY), maxY),
      };
    },
    [instance.width, instance.height]
  );

  const handlePointerDown = (e: React.PointerEvent) => {
    if (e.button !== 0) return;
    e.stopPropagation();
    pointerActiveRef.current = true;

    try {
      (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
    } catch {
      // ignore
    }

    dragStartRef.current = {
      pointerX: e.clientX,
      pointerY: e.clientY,
      startX: pos.x,
      startY: pos.y,
      hasMovedBeyondThreshold: false,
    };
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!pointerActiveRef.current) return;
    e.stopPropagation();

    const dx = e.clientX - dragStartRef.current.pointerX;
    const dy = e.clientY - dragStartRef.current.pointerY;
    const dist = Math.hypot(dx, dy);

    // 7px threshold clearly distinguishes tap/click from drag
    if (dist >= 7) {
      if (!dragStartRef.current.hasMovedBeyondThreshold) {
        dragStartRef.current.hasMovedBeyondThreshold = true;
        setIsDragging(true);
      }
      const nextX = dragStartRef.current.startX + dx;
      const nextY = dragStartRef.current.startY + dy;
      setPos(clampPosition(nextX, nextY));
    }
  };

  const handlePointerUp = (e: React.PointerEvent) => {
    if (!pointerActiveRef.current) return;
    e.stopPropagation();
    pointerActiveRef.current = false;

    try {
      (e.currentTarget as HTMLElement).releasePointerCapture(e.pointerId);
    } catch {
      // ignore
    }

    const wasDrag = dragStartRef.current.hasMovedBeyondThreshold;
    dragStartRef.current = {
      pointerX: 0,
      pointerY: 0,
      startX: 0,
      startY: 0,
      hasMovedBeyondThreshold: false,
    };

    if (!wasDrag) {
      // Click or Tap anywhere on the raw GIF dismisses it immediately!
      onClose(instance.instanceId);
    } else {
      setIsDragging(false);
      onPositionChange(instance.instanceId, pos.x, pos.y);
    }
  };

  useEffect(() => {
    const handleResize = () => {
      setPos((prev) => clampPosition(prev.x, prev.y));
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [clampPosition]);

  return (
    <div
      ref={cardRef}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerCancel={handlePointerUp}
      style={{
        left: `${pos.x}px`,
        top: `${pos.y}px`,
        width: `${instance.width}px`,
        touchAction: 'none',
      }}
      className={`fixed z-30 select-none cursor-pointer active:cursor-grabbing pointer-events-auto transition-transform duration-75 ${
        isDragging
          ? 'scale-105 filter drop-shadow-[0_8px_16px_rgba(0,0,0,0.45)]'
          : 'hover:scale-105 filter drop-shadow-[0_4px_8px_rgba(0,0,0,0.3)]'
      }`}
      title="Click/tap to dismiss, drag to move"
    >
      {/* 
        RAW ANIMATED GIF IMAGE ONLY:
        No yellow card, no bordered modal, no title bar, no fake advertisement frame,
        no shadow panel, no caption, no "DOGESH SENT THIS DISTRACTION", and no tiny (X) button.
      */}
      <img
        src={instance.asset.src}
        alt={instance.asset.alt}
        className="w-full h-auto object-contain pointer-events-none select-none block"
        style={{
          maxHeight: `${instance.height}px`,
          imageRendering: 'auto',
        }}
        draggable={false}
      />
    </div>
  );
};
