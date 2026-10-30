import React, { useRef, useEffect, useState, useCallback } from 'react';
import { handTracking } from './HandTracking';
import { drawAnimatedDemoSource } from './webcamPuzzle';
import { InputMode, CameraStatus, HandTrackingStatus } from './types';

interface LiveMosaicBoardProps {
  videoRef: React.RefObject<HTMLVideoElement | null>;
  permutation: number[];
  onSwap: (posA: number, posB: number) => void;
  isLiveWebcam: boolean;
  inputMode: InputMode;
  disabled?: boolean;
  cameraStatus: CameraStatus;
  handStatus: HandTrackingStatus;
  onInteractionStateChange?: (isInteracting: boolean) => void;
}

export const LiveMosaicBoard: React.FC<LiveMosaicBoardProps> = ({
  videoRef,
  permutation,
  onSwap,
  isLiveWebcam,
  inputMode,
  disabled = false,
  cameraStatus,
  handStatus,
  onInteractionStateChange,
}) => {

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const offscreenCanvasRef = useRef<HTMLCanvasElement | null>(null);

  // Interaction refs (kept in refs for high-frequency 60 FPS animation loop without React re-renders)
  const grabbedPosRef = useRef<number | null>(null);
  const hoverPosRef = useRef<number | null>(null);
  const pointerRef = useRef<{ x: number; y: number }>({ x: 480, y: 360 });
  const grabOffsetRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });
  const wasPinchingRef = useRef<boolean>(false);
  const permutationRef = useRef<number[]>(permutation);
  const selectedMousePosRef = useRef<number | null>(null);
  const [selectedMousePos, setSelectedMousePos] = useState<number | null>(null);

  useEffect(() => {
    permutationRef.current = permutation;
  }, [permutation]);

  useEffect(() => {
    selectedMousePosRef.current = selectedMousePos;
  }, [selectedMousePos]);

  // Main 60 FPS Canvas Rendering & Gesture Interaction Loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    if (!offscreenCanvasRef.current) {
      offscreenCanvasRef.current = document.createElement('canvas');
      offscreenCanvasRef.current.width = 960;
      offscreenCanvasRef.current.height = 720;
    }
    const offscreenCanvas = offscreenCanvasRef.current;
    const offscreenCtx = offscreenCanvas.getContext('2d');

    let animId: number;

    const render = (timeMs: number) => {
      const video = videoRef.current;

      // 1. Prepare 60 FPS live frame on offscreen canvas
      const hasLiveVideo =
        isLiveWebcam &&
        video &&
        video.readyState >= 2 &&
        video.videoWidth > 0 &&
        video.videoHeight > 0 &&
        offscreenCtx;

      if (hasLiveVideo && offscreenCtx) {
        // Draw mirrored webcam frame so movements naturally mirror the player
        offscreenCtx.save();
        offscreenCtx.translate(960, 0);
        offscreenCtx.scale(-1, 1);

        // Center-crop video to 4:3 aspect ratio
        const vRatio = video.videoWidth / video.videoHeight;
        const targetRatio = 4 / 3;
        let sx = 0;
        let sy = 0;
        let sw = video.videoWidth;
        let sh = video.videoHeight;

        if (vRatio > targetRatio) {
          sw = video.videoHeight * targetRatio;
          sx = (video.videoWidth - sw) / 2;
        } else {
          sh = video.videoWidth / targetRatio;
          sy = (video.videoHeight - sh) / 2;
        }

        offscreenCtx.drawImage(video, sx, sy, sw, sh, 0, 0, 960, 720);
        offscreenCtx.restore();
      } else if (offscreenCtx) {
        // Fallback animated live video simulation
        drawAnimatedDemoSource(offscreenCtx, 960, 720, timeMs);
      }

      // 2. Process Hand Tracking gestures directly inside the loop
      const handState = handTracking.getCurrentState();

      if (inputMode === 'hand' && !disabled) {
        if (handState.hasHand) {
          const px = handState.boardNormX * 960;
          const py = handState.boardNormY * 720;
          pointerRef.current = { x: px, y: py };

          const col = Math.min(3, Math.max(0, Math.floor(handState.boardNormX * 4)));
          const row = Math.min(3, Math.max(0, Math.floor(handState.boardNormY * 4)));
          const currentSlot = row * 4 + col;
          hoverPosRef.current = currentSlot;

          const isPinching = handState.isPinching;
          const wasPinching = wasPinchingRef.current;

          // PINCH START -> Grab tile
          if (isPinching && !wasPinching) {
            if (currentSlot >= 0 && currentSlot < 16) {
              grabbedPosRef.current = currentSlot;
              onInteractionStateChange?.(true);
              const cellCenter = {
                x: (col + 0.5) * (960 / 4),
                y: (row + 0.5) * (720 / 4),
              };
              grabOffsetRef.current = {
                x: cellCenter.x - px,
                y: cellCenter.y - py,
              };
            }
          }
          // PINCH RELEASE -> Drop / Swap tile
          else if (!isPinching && wasPinching) {
            const activeGrab = grabbedPosRef.current;
            if (activeGrab !== null) {
              if (currentSlot >= 0 && currentSlot < 16 && currentSlot !== activeGrab) {
                onSwap(activeGrab, currentSlot);
              }
              grabbedPosRef.current = null;
              onInteractionStateChange?.(false);
            }
          }

          wasPinchingRef.current = isPinching;
        } else {
          // Hand lost mid-drag -> safely cancel drag
          if (grabbedPosRef.current !== null) {
            grabbedPosRef.current = null;
            onInteractionStateChange?.(false);
          }
          wasPinchingRef.current = false;
        }
      }

      // 3. Clear canvas
      ctx.fillStyle = '#0a0a0a';
      ctx.fillRect(0, 0, 960, 720);

      const cellW = 960 / 4; // 240
      const cellH = 720 / 4; // 180
      const gap = 4;
      const perm = permutationRef.current;
      const activeGrab = grabbedPosRef.current;
      const hoverPos = hoverPosRef.current;
      const mouseSelected = selectedMousePosRef.current;

      // 4. Render 16 video tiles
      for (let pos = 0; pos < 16; pos++) {
        const targetCol = pos % 4;
        const targetRow = Math.floor(pos / 4);
        const destX = targetCol * cellW + gap / 2;
        const destY = targetRow * cellH + gap / 2;
        const destW = cellW - gap;
        const destH = cellH - gap;

        // If this tile is currently lifted/grabbed, draw an empty placeholder
        if (pos === activeGrab) {
          ctx.fillStyle = 'rgba(255, 255, 255, 0.08)';
          ctx.fillRect(destX, destY, destW, destH);
          ctx.strokeStyle = '#facc15';
          ctx.lineWidth = 3;
          ctx.setLineDash([8, 6]);
          ctx.strokeRect(destX, destY, destW, destH);
          ctx.setLineDash([]);
          continue;
        }

        // Draw live video slice assigned by permutation mapping
        const sourceTileId = perm[pos];
        const srcCol = sourceTileId % 4;
        const srcRow = Math.floor(sourceTileId / 4);
        const srcX = srcCol * (960 / 4);
        const srcY = srcRow * (720 / 4);
        const srcW = 960 / 4;
        const srcH = 720 / 4;

        ctx.drawImage(offscreenCanvas, srcX, srcY, srcW, srcH, destX, destY, destW, destH);

        const isCorrect = sourceTileId === pos;
        const isHoverTarget = hoverPos === pos && activeGrab !== null && activeGrab !== pos;
        const isMouseSel = mouseSelected === pos;

        // Border feedback
        if (isMouseSel) {
          ctx.strokeStyle = '#facc15';
          ctx.lineWidth = 5;
          ctx.strokeRect(destX, destY, destW, destH);
        } else if (isHoverTarget) {
          ctx.strokeStyle = '#a855f7';
          ctx.lineWidth = 5;
          ctx.strokeRect(destX, destY, destW, destH);
        } else if (isCorrect) {
          ctx.strokeStyle = '#22c55e';
          ctx.lineWidth = 3.5;
          ctx.strokeRect(destX, destY, destW, destH);

          // Subtle green checkmark badge in top-right corner
          ctx.fillStyle = '#22c55e';
          ctx.beginPath();
          ctx.arc(destX + destW - 14, destY + 14, 9, 0, Math.PI * 2);
          ctx.fill();
          ctx.strokeStyle = '#000000';
          ctx.lineWidth = 1.5;
          ctx.stroke();

          ctx.fillStyle = '#ffffff';
          ctx.font = 'bold 12px sans-serif';
          ctx.fillText('✓', destX + destW - 18, destY + 18);
        } else {
          ctx.strokeStyle = '#ffffff';
          ctx.lineWidth = 2;
          ctx.strokeRect(destX, destY, destW, destH);
        }
      }

      // 5. Render floating grabbed tile on top if active
      if (activeGrab !== null) {
        const sourceTileId = perm[activeGrab];
        const srcCol = sourceTileId % 4;
        const srcRow = Math.floor(sourceTileId / 4);
        const srcX = srcCol * (960 / 4);
        const srcY = srcRow * (720 / 4);
        const srcW = 960 / 4;
        const srcH = 720 / 4;

        const floatX = pointerRef.current.x + grabOffsetRef.current.x - cellW / 2;
        const floatY = pointerRef.current.y + grabOffsetRef.current.y - cellH / 2;
        const destW = cellW - gap;
        const destH = cellH - gap;

        // Offset hard black shadow
        ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
        ctx.fillRect(floatX + 8, floatY + 8, destW, destH);

        // Moving video fragment
        ctx.drawImage(offscreenCanvas, srcX, srcY, srcW, srcH, floatX, floatY, destW, destH);

        // Highlight border
        ctx.strokeStyle = '#facc15';
        ctx.lineWidth = 5;
        ctx.strokeRect(floatX, floatY, destW, destH);
      }

      // 6. Render Virtual Reticle Cursor for hand tracking
      if (inputMode === 'hand' && handState.hasHand && !disabled) {
        const cx = pointerRef.current.x;
        const cy = pointerRef.current.y;
        const isPinch = handState.isPinching;

        ctx.save();
        ctx.translate(cx, cy);

        // Reticle ring
        ctx.beginPath();
        ctx.arc(0, 0, isPinch ? 18 : 24, 0, Math.PI * 2);
        ctx.fillStyle = isPinch ? 'rgba(168, 85, 247, 0.85)' : 'rgba(250, 204, 21, 0.75)';
        ctx.fill();
        ctx.lineWidth = 3;
        ctx.strokeStyle = '#000000';
        ctx.stroke();

        // Crosshairs
        ctx.strokeStyle = '#000000';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(-30, 0);
        ctx.lineTo(30, 0);
        ctx.moveTo(0, -30);
        ctx.lineTo(0, 30);
        ctx.stroke();

        // Center dot
        ctx.fillStyle = isPinch ? '#ffffff' : '#ef4444';
        ctx.beginPath();
        ctx.arc(0, 0, 4, 0, Math.PI * 2);
        ctx.fill();

        // State Badge
        ctx.fillStyle = isPinch ? '#c084fc' : '#fde047';
        ctx.fillRect(-28, -42, 56, 16);
        ctx.strokeStyle = '#000000';
        ctx.lineWidth = 1.5;
        ctx.strokeRect(-28, -42, 56, 16);
        ctx.fillStyle = '#000000';
        ctx.font = 'bold 9px monospace';
        ctx.textAlign = 'center';
        ctx.fillText(isPinch ? 'GRABBED' : 'POINTING', 0, -30);

        ctx.restore();
      }

      // 7. Draw thick neo-brutalist outer frame
      ctx.strokeStyle = '#000000';
      ctx.lineWidth = 8;
      ctx.strokeRect(0, 0, 960, 720);

      animId = requestAnimationFrame(render);
    };

    animId = requestAnimationFrame(render);
    return () => cancelAnimationFrame(animId);
  }, [isLiveWebcam, inputMode, disabled, onSwap]);

  // Mouse & Touch Fallback Event Handlers
  const getCanvasCoords = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0, slot: 0 };
    const rect = canvas.getBoundingClientRect();
    const scaleX = 960 / rect.width;
    const scaleY = 720 / rect.height;
    const x = (e.clientX - rect.left) * scaleX;
    const y = (e.clientY - rect.top) * scaleY;
    const col = Math.min(3, Math.max(0, Math.floor(x / (960 / 4))));
    const row = Math.min(3, Math.max(0, Math.floor(y / (720 / 4))));
    return { x, y, slot: row * 4 + col };
  };

  const handlePointerDown = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (disabled) return;
    const { x, y, slot } = getCanvasCoords(e);
    pointerRef.current = { x, y };

    if (inputMode === 'mouse') {
      (e.target as HTMLElement).setPointerCapture?.(e.pointerId);

      // Click-to-swap logic
      const prevSelected = selectedMousePosRef.current;
      if (prevSelected === null) {
        setSelectedMousePos(slot);
        grabbedPosRef.current = slot;
        onInteractionStateChange?.(true);
      } else if (prevSelected === slot) {
        setSelectedMousePos(null);
        grabbedPosRef.current = null;
        onInteractionStateChange?.(false);
      } else {
        onSwap(prevSelected, slot);
        setSelectedMousePos(null);
        grabbedPosRef.current = null;
        onInteractionStateChange?.(false);
      }
    }
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (disabled || inputMode !== 'mouse') return;
    const { x, y, slot } = getCanvasCoords(e);
    pointerRef.current = { x, y };
    hoverPosRef.current = slot;
  };

  const handlePointerUp = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (disabled || inputMode !== 'mouse') return;
    const { slot } = getCanvasCoords(e);
    const activeGrab = grabbedPosRef.current;

    if (activeGrab !== null && activeGrab !== slot) {
      onSwap(activeGrab, slot);
      setSelectedMousePos(null);
    }
    grabbedPosRef.current = null;
    onInteractionStateChange?.(false);
  };

  return (
    <div className="relative w-full max-w-[880px] aspect-[4/3] mx-auto select-none">
      <canvas
        ref={canvasRef}
        width={960}
        height={720}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        className="w-full h-full rounded-xl bg-black border-4 border-black shadow-[8px_8px_0px_#000] cursor-crosshair touch-none"
      />
    </div>
  );
};
