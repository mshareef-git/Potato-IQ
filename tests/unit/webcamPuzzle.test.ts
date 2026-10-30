// @vitest-environment jsdom
import { describe, it, expect, beforeAll } from 'vitest';
import {
  sliceIntoTiles,
  createScrambledTiles,
  swapTiles,
  isPuzzleSolved,
  countCorrectTiles,
} from '../../src/levels/WebcamRecovery/webcamPuzzle';
import { PuzzleTileData } from '../../src/levels/WebcamRecovery/types';

describe('Webcam Puzzle Mechanics', () => {
  beforeAll(() => {
    HTMLCanvasElement.prototype.getContext = () => ({
      drawImage: () => {},
    }) as any;
    HTMLCanvasElement.prototype.toDataURL = () => 'data:image/jpeg;base64,mockTile';
  });
  it('slices a canvas into exactly 16 square tiles', () => {
    // Mock canvas
    const canvas = document.createElement('canvas');
    canvas.width = 640;
    canvas.height = 640;

    const tiles = sliceIntoTiles(canvas);
    expect(tiles.length).toBe(16);
    expect(tiles[0].originalIndex).toBe(0);
    expect(tiles[15].originalIndex).toBe(15);
    expect(isPuzzleSolved(tiles)).toBe(true);
    expect(countCorrectTiles(tiles)).toBe(16);
  });

  it('scrambles tiles so that puzzle does not start already solved', () => {
    const mockTiles: PuzzleTileData[] = Array.from({ length: 16 }, (_, i) => ({
      id: i,
      originalIndex: i,
      currentPosition: i,
      dataUrl: `data:image/jpeg;base64,mock${i}`,
    }));

    const scrambled = createScrambledTiles(mockTiles);
    expect(scrambled.length).toBe(16);
    expect(isPuzzleSolved(scrambled)).toBe(false);
    expect(countCorrectTiles(scrambled)).toBeLessThan(16);
  });

  it('correctly swaps tiles and updates positions', () => {
    const mockTiles: PuzzleTileData[] = Array.from({ length: 16 }, (_, i) => ({
      id: i,
      originalIndex: i,
      currentPosition: i,
      dataUrl: `data:image/jpeg;base64,mock${i}`,
    }));

    const swapped = swapTiles(mockTiles, 0, 5);
    expect(swapped[0].originalIndex).toBe(5);
    expect(swapped[0].currentPosition).toBe(0);
    expect(swapped[5].originalIndex).toBe(0);
    expect(swapped[5].currentPosition).toBe(5);
    expect(isPuzzleSolved(swapped)).toBe(false);
    expect(countCorrectTiles(swapped)).toBe(14);

    // Swap back
    const restored = swapTiles(swapped, 0, 5);
    expect(isPuzzleSolved(restored)).toBe(true);
    expect(countCorrectTiles(restored)).toBe(16);
  });
});
