import { describe, it, expect } from 'vitest';
import { MAZE_1, MAZE_2, MazeMap } from '../../src/levels/maze/mazeMaps';

function solveBFS(map: MazeMap, allowOutside: boolean): number {
  const { width: w, height: h, start, exit, grid } = map;
  const q: [number, number, number][] = [[start.x, start.y, 0]];
  const visited = new Set<string>([`${start.x},${start.y}`]);
  const dirs = [
    [0, 1],
    [0, -1],
    [1, 0],
    [-1, 0],
  ];

  while (q.length > 0) {
    const [cx, cy, dist] = q.shift()!;
    if (cx === exit.x && cy === exit.y) return dist;

    for (const [dx, dy] of dirs) {
      const nx = cx + dx;
      const ny = cy + dy;

      if (nx < 0 || nx >= w || ny < 0 || ny >= h) continue;

      // When allowOutside is false, player is strictly forbidden from touching outer border
      if (!allowOutside && (nx === 0 || nx === w - 1 || ny === 0 || ny === h - 1)) {
        continue;
      }

      if (grid[ny][nx] === 1) continue;

      const key = `${nx},${ny}`;
      if (!visited.has(key)) {
        visited.add(key);
        q.push([nx, ny, dist + 1]);
      }
    }
  }

  return -1;
}

describe('Impossible Maze Algorithmic Verification', () => {
  it('Stage 1 is solvable internally', () => {
    const dist = solveBFS(MAZE_1, false);
    expect(dist).toBeGreaterThan(0);
  });

  it('Stage 2 interior has NO valid route to exit', () => {
    // Solvability strictly from inside the walls must be impossible (-1)
    const interiorDist = solveBFS(MAZE_2, false);
    expect(interiorDist).toBe(-1);
  });

  it('Stage 2 IS solvable when taking the outside path', () => {
    // Walking around the outside perimeter must successfully reach the exit
    const outsideDist = solveBFS(MAZE_2, true);
    expect(outsideDist).toBeGreaterThan(0);
  });
});
