import { DOGESH_ASSETS } from '../../data/assetManifest';

/**
 * Generates an initial scrambled permutation array for the 16 tiles (0..15).
 * permutation[displayPosition] = sourceTileId
 * Guarantees the puzzle does not start already solved or trivially close.
 */
export function createScrambledPermutation(): number[] {
  let perm = Array.from({ length: 16 }, (_, i) => i);
  let attempts = 0;

  do {
    for (let i = perm.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [perm[i], perm[j]] = [perm[j], perm[i]];
    }
    attempts++;
  } while (
    (isMosaicSolved(perm) || countCorrectTiles(perm) > 3) &&
    attempts < 30
  );

  return perm;
}

/**
 * Swaps two tile positions in the permutation array.
 */
export function swapMosaicTiles(
  perm: number[],
  posA: number,
  posB: number
): number[] {
  if (
    posA === posB ||
    posA < 0 ||
    posB < 0 ||
    posA >= perm.length ||
    posB >= perm.length
  ) {
    return perm;
  }
  const next = [...perm];
  [next[posA], next[posB]] = [next[posB], next[posA]];
  return next;
}

/**
 * Checks whether all 16 tiles are in their correct spatial positions.
 */
export function isMosaicSolved(perm: number[]): boolean {
  if (perm.length !== 16) return false;
  return perm.every((sourceId, pos) => sourceId === pos);
}

/**
 * Counts how many tiles are currently in their correct cells.
 */
export function countCorrectTiles(perm: number[]): number {
  return perm.filter((sourceId, pos) => sourceId === pos).length;
}

let cachedDogeshImg: HTMLImageElement | null = null;
function getDogeshImage(): HTMLImageElement {
  if (!cachedDogeshImg) {
    cachedDogeshImg = new Image();
    cachedDogeshImg.src = DOGESH_ASSETS.base;
  }
  return cachedDogeshImg;
}

/**
 * Draws a moving, lively 60 FPS animated simulation canvas when
 * camera permission is denied or no webcam is found.
 */
export function drawAnimatedDemoSource(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  timeMs: number
) {
  const t = timeMs * 0.001;

  // Background quadrant colors with animated brightness
  const pulse = Math.sin(t * 2) * 15;
  ctx.fillStyle = `rgb(${250 + pulse}, ${204 + pulse}, 21)`;
  ctx.fillRect(0, 0, width / 2, height / 2);

  ctx.fillStyle = `rgb(${244 + pulse}, ${114 + pulse}, 182)`;
  ctx.fillRect(width / 2, 0, width / 2, height / 2);

  ctx.fillStyle = `rgb(${167 + pulse}, ${139 + pulse}, 250)`;
  ctx.fillRect(0, height / 2, width / 2, height / 2);

  ctx.fillStyle = `rgb(${74 + pulse}, ${222 + pulse}, 128)`;
  ctx.fillRect(width / 2, height / 2, width / 2, height / 2);

  // Moving scanline
  const scanY = (timeMs * 0.2) % height;
  ctx.fillStyle = 'rgba(255, 255, 255, 0.25)';
  ctx.fillRect(0, scanY, width, 12);

  // Bouncing geometric shapes
  const bounceX = (Math.sin(t * 1.5) * 0.35 + 0.5) * width;
  const bounceY = (Math.cos(t * 1.8) * 0.35 + 0.5) * height;

  ctx.fillStyle = '#ef4444';
  ctx.beginPath();
  ctx.arc(bounceX, bounceY, 40, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = '#000000';
  ctx.lineWidth = 4;
  ctx.stroke();

  // Draw Dogesh mascot in center with breathing/bobbing animation
  const dogesh = getDogeshImage();
  const dogeshSize = height * 0.55;
  const bobY = Math.sin(t * 3) * 15;
  const dx = (width - dogeshSize) / 2;
  const dy = (height - dogeshSize) / 2 + bobY;

  if (dogesh.complete && dogesh.naturalWidth > 0) {
    ctx.drawImage(dogesh, dx, dy, dogeshSize, dogeshSize);
  } else {
    ctx.fillStyle = '#fbbf24';
    ctx.beginPath();
    ctx.arc(width / 2, height / 2 + bobY, 80, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#000000';
    ctx.lineWidth = 6;
    ctx.stroke();
  }

  // Live timestamp & watermark
  ctx.fillStyle = '#000000';
  ctx.font = '900 24px "Archivo Black", sans-serif';
  ctx.fillText('LIVE VIDEO SIMULATOR', 30, 45);

  ctx.font = '700 16px "Space Grotesk", monospace';
  const timeStr = new Date().toLocaleTimeString();
  ctx.fillText(`STREAM TIME: ${timeStr} .${Math.floor((timeMs % 1000) / 100)}`, 30, 75);

  ctx.fillStyle = '#1e3a8a';
  ctx.fillText('DEMO FALLBACK FEED · MADHACKD CV', width - 360, height - 25);
}
