import { PuzzleTileData } from './types';
import { DOGESH_ASSETS } from '../../data/assetManifest';

/**
 * Center-crops a video, image, or canvas element into a square 1:1 canvas.
 * Optionally mirrors horizontally to match the mirrored camera preview.
 */
export function cropToSquare(
  source: HTMLVideoElement | HTMLImageElement | HTMLCanvasElement,
  targetSize = 640,
  mirror = true
): HTMLCanvasElement {
  const canvas = document.createElement('canvas');
  canvas.width = targetSize;
  canvas.height = targetSize;
  const ctx = canvas.getContext('2d');
  if (!ctx) return canvas;

  const sourceWidth = 'videoWidth' in source ? source.videoWidth : source.width;
  const sourceHeight = 'videoHeight' in source ? source.videoHeight : source.height;

  if (sourceWidth === 0 || sourceHeight === 0) {
    return canvas;
  }

  const minDim = Math.min(sourceWidth, sourceHeight);
  const sx = (sourceWidth - minDim) / 2;
  const sy = (sourceHeight - minDim) / 2;

  ctx.save();
  if (mirror) {
    ctx.translate(targetSize, 0);
    ctx.scale(-1, 1);
  }

  ctx.drawImage(source, sx, sy, minDim, minDim, 0, 0, targetSize, targetSize);
  ctx.restore();

  return canvas;
}

/**
 * Slices a square canvas (e.g. 640x640) into 16 square tile data URLs (4x4 grid).
 */
export function sliceIntoTiles(sourceCanvas: HTMLCanvasElement): PuzzleTileData[] {
  const tiles: PuzzleTileData[] = [];
  const gridSize = 4;
  const tileSize = Math.floor(sourceCanvas.width / gridSize);

  for (let row = 0; row < gridSize; row++) {
    for (let col = 0; col < gridSize; col++) {
      const index = row * gridSize + col;
      const tileCanvas = document.createElement('canvas');
      tileCanvas.width = tileSize;
      tileCanvas.height = tileSize;
      const ctx = tileCanvas.getContext('2d');

      if (ctx) {
        ctx.drawImage(
          sourceCanvas,
          col * tileSize,
          row * tileSize,
          tileSize,
          tileSize,
          0,
          0,
          tileSize,
          tileSize
        );
      }

      tiles.push({
        id: index,
        originalIndex: index,
        currentPosition: index,
        dataUrl: tileCanvas.toDataURL('image/jpeg', 0.92),
      });
    }
  }

  return tiles;
}

/**
 * Fisher-Yates shuffle for tiles, guaranteeing the puzzle doesn't start already solved.
 */
export function createScrambledTiles(sourceTiles: PuzzleTileData[]): PuzzleTileData[] {
  let scrambled = [...sourceTiles];
  let attempts = 0;

  do {
    for (let i = scrambled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [scrambled[i], scrambled[j]] = [scrambled[j], scrambled[i]];
    }
    attempts++;
  } while (
    (isPuzzleSolved(scrambled) || countCorrectTiles(scrambled) > 3) &&
    attempts < 25
  );

  return scrambled.map((tile, pos) => ({
    ...tile,
    currentPosition: pos,
  }));
}

/**
 * Swaps two tiles by grid position.
 */
export function swapTiles(
  tiles: PuzzleTileData[],
  posA: number,
  posB: number
): PuzzleTileData[] {
  if (
    posA === posB ||
    posA < 0 ||
    posB < 0 ||
    posA >= tiles.length ||
    posB >= tiles.length
  ) {
    return tiles;
  }

  const next = [...tiles];
  const temp = next[posA];
  next[posA] = { ...next[posB], currentPosition: posA };
  next[posB] = { ...temp, currentPosition: posB };
  return next;
}

/**
 * Checks whether all 16 tiles are in their original positions.
 */
export function isPuzzleSolved(tiles: PuzzleTileData[]): boolean {
  if (tiles.length !== 16) return false;
  return tiles.every((tile, index) => tile.originalIndex === index);
}

/**
 * Counts how many tiles are currently in their correct cells.
 */
export function countCorrectTiles(tiles: PuzzleTileData[]): number {
  return tiles.filter((tile) => tile.originalIndex === tile.currentPosition).length;
}

/**
 * Generates a colorful, high-contrast demo test card with Dogesh,
 * retro calibration markings, and quadrant labels so players who use the demo
 * have a distinct, solvable puzzle.
 */
export async function generateDemoImage(targetSize = 640): Promise<HTMLCanvasElement> {
  const canvas = document.createElement('canvas');
  canvas.width = targetSize;
  canvas.height = targetSize;
  const ctx = canvas.getContext('2d');
  if (!ctx) return canvas;

  // Background quadrant stripes & patterns
  const colors = ['#fde047', '#f472b6', '#a78bfa', '#4ade80']; // yellow, pink, purple, green
  const half = targetSize / 2;

  // Q1 (Top-Left) - Yellow with stripes
  ctx.fillStyle = colors[0];
  ctx.fillRect(0, 0, half, half);
  ctx.fillStyle = '#facc15';
  for (let i = 0; i < half; i += 24) {
    ctx.fillRect(i, 0, 12, half);
  }

  // Q2 (Top-Right) - Pink with polka dots
  ctx.fillStyle = colors[1];
  ctx.fillRect(half, 0, half, half);
  ctx.fillStyle = '#ec4899';
  for (let x = half + 20; x < targetSize; x += 32) {
    for (let y = 20; y < half; y += 32) {
      ctx.beginPath();
      ctx.arc(x, y, 8, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  // Q3 (Bottom-Left) - Purple with checkerboard
  ctx.fillStyle = colors[2];
  ctx.fillRect(0, half, half, half);
  ctx.fillStyle = '#8b5cf6';
  for (let x = 0; x < half; x += 32) {
    for (let y = half; y < targetSize; y += 32) {
      if ((x / 32 + y / 32) % 2 === 0) {
        ctx.fillRect(x, y, 32, 32);
      }
    }
  }

  // Q4 (Bottom-Right) - Green with diagonal lines
  ctx.fillStyle = colors[3];
  ctx.fillRect(half, half, half, half);
  ctx.strokeStyle = '#22c55e';
  ctx.lineWidth = 6;
  for (let d = half - 100; d < targetSize + 100; d += 28) {
    ctx.beginPath();
    ctx.moveTo(half, d);
    ctx.lineTo(d, half);
    ctx.stroke();
  }

  // Outer border & crosshairs
  ctx.strokeStyle = '#000000';
  ctx.lineWidth = 12;
  ctx.strokeRect(0, 0, targetSize, targetSize);

  ctx.lineWidth = 4;
  ctx.beginPath();
  ctx.moveTo(half, 0);
  ctx.lineTo(half, targetSize);
  ctx.moveTo(0, half);
  ctx.lineTo(targetSize, half);
  ctx.stroke();

  // Load Dogesh PNG in center
  try {
    const dogeshImg = new Image();
    dogeshImg.src = DOGESH_ASSETS.base;
    await new Promise<void>((resolve, reject) => {
      dogeshImg.onload = () => resolve();
      dogeshImg.onerror = () => resolve(); // fallback gracefully if image fails
    });

    if (dogeshImg.complete && dogeshImg.naturalWidth > 0) {
      const dogeshSize = targetSize * 0.58;
      const dx = (targetSize - dogeshSize) / 2;
      const dy = (targetSize - dogeshSize) / 2;
      ctx.drawImage(dogeshImg, dx, dy, dogeshSize, dogeshSize);
    }
  } catch {
    // If image fails, draw a round cartoon face
    ctx.fillStyle = '#fbbf24';
    ctx.beginPath();
    ctx.arc(half, half, 120, 0, Math.PI * 2);
    ctx.fill();
    ctx.lineWidth = 6;
    ctx.stroke();
  }

  // Verification Stamps
  ctx.fillStyle = '#000000';
  ctx.font = '900 20px "Archivo Black", sans-serif';
  ctx.fillText('HUMAN VERIFICATION // CALIBRATION CARD', 28, 40);

  ctx.fillStyle = '#000000';
  ctx.font = '800 14px "Space Grotesk", monospace';
  ctx.fillText('MADHACKD LABS · MODEL 042-DEMO', targetSize - 280, targetSize - 25);

  return canvas;
}
