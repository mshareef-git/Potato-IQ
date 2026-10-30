// @vitest-environment jsdom
import { describe, it, expect } from 'vitest';
import {
  createScrambledPermutation,
  swapMosaicTiles,
  isMosaicSolved,
  countCorrectTiles,
} from '../../src/levels/WebcamRecovery/webcamPuzzle';

describe('Live Webcam Mosaic Mechanics', () => {
  it('generates a 16-element permutation array that is not already solved', () => {
    const perm = createScrambledPermutation();
    expect(perm.length).toBe(16);
    expect(isMosaicSolved(perm)).toBe(false);
    expect(countCorrectTiles(perm)).toBeLessThanOrEqual(3);

    // Contains all numbers 0..15
    const sorted = [...perm].sort((a, b) => a - b);
    expect(sorted).toEqual(Array.from({ length: 16 }, (_, i) => i));
  });

  it('detects solved vs unsolved permutations accurately', () => {
    const solved = Array.from({ length: 16 }, (_, i) => i);
    expect(isMosaicSolved(solved)).toBe(true);
    expect(countCorrectTiles(solved)).toBe(16);

    const unsolved = [1, 0, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15];
    expect(isMosaicSolved(unsolved)).toBe(false);
    expect(countCorrectTiles(unsolved)).toBe(14);
  });

  it('correctly swaps two tile positions in the permutation array', () => {
    const perm = Array.from({ length: 16 }, (_, i) => i);
    const swapped = swapMosaicTiles(perm, 2, 7);
    expect(swapped[2]).toBe(7);
    expect(swapped[7]).toBe(2);
    expect(swapped[0]).toBe(0);
    expect(isMosaicSolved(swapped)).toBe(false);
    expect(countCorrectTiles(swapped)).toBe(14);

    // Swap back
    const restored = swapMosaicTiles(swapped, 2, 7);
    expect(isMosaicSolved(restored)).toBe(true);
    expect(countCorrectTiles(restored)).toBe(16);
  });

  it('ignores invalid swap bounds safely', () => {
    const perm = Array.from({ length: 16 }, (_, i) => i);
    const invalid = swapMosaicTiles(perm, -1, 20);
    expect(invalid).toEqual(perm);
  });
});
