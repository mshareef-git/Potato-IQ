import React, { useState, useEffect, useCallback, useRef } from 'react';
import { NeoCard } from '../../components/NeoCard';
import { NeoButton } from '../../components/NeoButton';
import { MAZE_1, MAZE_2, MazeMap } from './mazeMaps';
import { useGameStore } from '../../store/gameStore';
import { Compass, RotateCcw, ArrowRight, ArrowUp, ArrowDown, ArrowLeft } from 'lucide-react';

export interface MazeLevelProps {
  onDogeshReaction: (comment: string, state: 'talk' | 'laugh' | 'smug' | 'angry') => void;
}

export const MazeLevel: React.FC<MazeLevelProps> = ({ onDogeshReaction }) => {
  const [currentMazeNum, setCurrentMazeNum] = useState<1 | 2>(1);
  const activeMap: MazeMap = currentMazeNum === 1 ? MAZE_1 : MAZE_2;

  const [playerPos, setPlayerPos] = useState<{ x: number; y: number }>(activeMap.start);
  const [isTransitioning, setIsTransitioning] = useState<boolean>(false);
  const [isSolvedFinal, setIsSolvedFinal] = useState<boolean>(false);

  const finishRound = useGameStore((state) => state.finishRound);
  const goNext = useGameStore((state) => state.goNext);

  const startTimeRef = useRef<number>(Date.now());
  const hintGivenRef = useRef<boolean>(false);

  // Reset coordinates on map change
  useEffect(() => {
    setPlayerPos(currentMazeNum === 1 ? MAZE_1.start : MAZE_2.start);
    setIsTransitioning(false);
    startTimeRef.current = Date.now();
    hintGivenRef.current = false;
  }, [currentMazeNum]);

  // Dogesh cryptic hint after 45-60s in Maze 2
  useEffect(() => {
    if (currentMazeNum !== 2) return;

    const interval = setInterval(() => {
      const elapsed = (Date.now() - startTimeRef.current) / 1000;
      if (elapsed > 45 && !hintGivenRef.current && !isSolvedFinal) {
        hintGivenRef.current = true;
        onDogeshReaction("Who said you had to respect the walls?", 'smug');
      }
    }, 4000);

    return () => clearInterval(interval);
  }, [currentMazeNum, isSolvedFinal, onDogeshReaction]);

  const movePlayer = useCallback(
    (dx: number, dy: number) => {
      if (isTransitioning || isSolvedFinal) return;

      const newX = playerPos.x + dx;
      const newY = playerPos.y + dy;

      // Check boundary limits
      if (newX < 0 || newX >= activeMap.width || newY < 0 || newY >= activeMap.height) {
        return;
      }

      // Check walls (1 = wall, 0 = walkable path)
      if (activeMap.grid[newY][newX] === 1) {
        return;
      }

      setPlayerPos({ x: newX, y: newY });

      // Check exit reached
      if (newX === activeMap.exit.x && newY === activeMap.exit.y) {
        if (currentMazeNum === 1) {
          // Smooth, natural progression from Stage 1 to Stage 2 with NO "Tutorial Complete" screen
          setIsTransitioning(true);
          onDogeshReaction("Stage 1 cleared. Expanding to the deep labyrinth...", 'talk');
          setTimeout(() => {
            setCurrentMazeNum(2);
          }, 1100);
        } else {
          setIsSolvedFinal(true);
          finishRound('maze', 'solved');
          onDogeshReaction("You stepped outside the walls! Pure lateral thinking.", 'laugh');
        }
      }
    },
    [isTransitioning, isSolvedFinal, playerPos, activeMap, currentMazeNum, finishRound, onDogeshReaction]
  );

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (['INPUT', 'TEXTAREA'].includes((e.target as HTMLElement).tagName)) return;

      if (['ArrowUp', 'KeyW'].includes(e.code)) {
        e.preventDefault();
        movePlayer(0, -1);
      } else if (['ArrowDown', 'KeyS'].includes(e.code)) {
        e.preventDefault();
        movePlayer(0, 1);
      } else if (['ArrowLeft', 'KeyA'].includes(e.code)) {
        e.preventDefault();
        movePlayer(-1, 0);
      } else if (['ArrowRight', 'KeyD'].includes(e.code)) {
        e.preventDefault();
        movePlayer(1, 0);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [movePlayer]);

  const handleResetPosition = () => {
    setPlayerPos(activeMap.start);
  };

  return (
    <div className="w-full max-w-5xl mx-auto space-y-4">
      <NeoCard size="large" className="p-6 md:p-8">
        {/* Header Bar */}
        <div className="flex items-center justify-between mb-3 flex-wrap gap-2">
          <div className="flex items-center gap-2">
            <Compass className="w-6 h-6 text-[var(--purple)]" />
            <h2 className="font-heading text-xl md:text-2xl text-[var(--ink)]">
              THE IMPOSSIBLE MAZE {currentMazeNum === 2 ? '— STAGE 2' : '— STAGE 1'}
            </h2>
          </div>
          <span className="text-xs font-bold px-3 py-1 bg-[var(--yellow)] text-black border-2 border-black rounded shadow-[2px_2px_0px_#000]">
            ROUND 3 OF 4
          </span>
        </div>

        <p className="text-sm md:text-base text-neutral-900 font-bold mb-3">
          Navigate your explorer from the START (🟢) to the EXIT (🏁). Use Arrow keys, WASD, or the D-pad controls.
        </p>

        {/* Maze Grid View */}
        <div className="flex justify-center my-4 overflow-x-auto game-scene">
          <div
            className="grid border-4 border-black bg-neutral-900 rounded-xl shadow-[6px_6px_0px_#000] p-1 gap-px select-none"
            style={{
              gridTemplateColumns: `repeat(${activeMap.width}, minmax(0, 1fr))`,
              width: currentMazeNum === 1 ? '380px' : '520px',
              maxWidth: '100%',
              aspectRatio: '1 / 1'
            }}
          >
            {activeMap.grid.map((row, y) =>
              row.map((cell, x) => {
                const isWall = cell === 1;
                const isPlayer = playerPos.x === x && playerPos.y === y;
                const isStart = activeMap.start.x === x && activeMap.start.y === y;
                const isExit = activeMap.exit.x === x && activeMap.exit.y === y;

                // Subtle outside margin for Stage 2 without bright giveaway borders
                const isOuterBoundary =
                  currentMazeNum === 2 &&
                  (x === 0 || x === activeMap.width - 1 || y === 0 || y === activeMap.height - 1);

                return (
                  <div
                    key={`${x}-${y}`}
                    className={`relative flex items-center justify-center font-bold text-xs transition-colors ${
                      isWall
                        ? 'bg-neutral-800'
                        : isOuterBoundary
                        ? 'bg-neutral-900/95' // Subtle dark margin, not highlighted in yellow!
                        : 'bg-neutral-100'
                    }`}
                  >
                    {isPlayer ? (
                      /* Illustrated Human / Explorer Sprite */
                      <div className="w-full h-full flex items-center justify-center z-10 animate-pulse" title="Explorer">
                        <svg viewBox="0 0 24 24" className="w-full h-full p-0.5 drop-shadow-[1px_1px_0px_#000]">
                          <circle cx="12" cy="5" r="3.5" fill="#FDE047" stroke="#111111" strokeWidth="1.5" />
                          <line x1="12" y1="8.5" x2="12" y2="16" stroke="#EF4444" strokeWidth="2.5" />
                          <line x1="7" y1="11" x2="17" y2="11" stroke="#111111" strokeWidth="2" strokeLinecap="round" />
                          <line x1="12" y1="16" x2="8" y2="22" stroke="#111111" strokeWidth="2" strokeLinecap="round" />
                          <line x1="12" y1="16" x2="16" y2="22" stroke="#111111" strokeWidth="2" strokeLinecap="round" />
                        </svg>
                      </div>
                    ) : isStart ? (
                      <span className="text-[10px] md:text-xs text-green-500 font-bold" title="Start">
                        🟢
                      </span>
                    ) : isExit ? (
                      <span className="text-[10px] md:text-xs font-bold" title="Exit">
                        🏁
                      </span>
                    ) : null}
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Mobile / On-Screen D-Pad Controls */}
        <div className="flex flex-col items-center gap-2 my-3">
          <button
            type="button"
            onClick={() => movePlayer(0, -1)}
            disabled={isTransitioning || isSolvedFinal}
            className="w-14 h-11 flex items-center justify-center bg-white border-3 border-black rounded-lg shadow-[3px_3px_0px_#000] active:translate-y-0.5 cursor-pointer"
            aria-label="Up"
          >
            <ArrowUp className="w-6 h-6 text-black" />
          </button>
          <div className="flex gap-6">
            <button
              type="button"
              onClick={() => movePlayer(-1, 0)}
              disabled={isTransitioning || isSolvedFinal}
              className="w-14 h-11 flex items-center justify-center bg-white border-3 border-black rounded-lg shadow-[3px_3px_0px_#000] active:translate-x-0.5 cursor-pointer"
              aria-label="Left"
            >
              <ArrowLeft className="w-6 h-6 text-black" />
            </button>
            <button
              type="button"
              onClick={() => movePlayer(0, 1)}
              disabled={isTransitioning || isSolvedFinal}
              className="w-14 h-11 flex items-center justify-center bg-white border-3 border-black rounded-lg shadow-[3px_3px_0px_#000] active:translate-y-0.5 cursor-pointer"
              aria-label="Down"
            >
              <ArrowDown className="w-6 h-6 text-black" />
            </button>
            <button
              type="button"
              onClick={() => movePlayer(1, 0)}
              disabled={isTransitioning || isSolvedFinal}
              className="w-14 h-11 flex items-center justify-center bg-white border-3 border-black rounded-lg shadow-[3px_3px_0px_#000] active:translate-x-0.5 cursor-pointer"
              aria-label="Right"
            >
              <ArrowRight className="w-6 h-6 text-black" />
            </button>
          </div>
        </div>

        {/* Solved Final Dialog */}
        {isSolvedFinal && (
          <div className="p-5 bg-green-100 border-4 border-black rounded-xl text-center space-y-3 animate-slide-down">
            <div className="font-heading text-xl md:text-2xl text-green-800">
              🎉 LABYRINTH COMPLETE!
            </div>
            <p className="text-sm md:text-base text-neutral-800 font-bold">
              You discovered the path outside the walls and escaped the impossible labyrinth!
            </p>
            <div className="pt-2">
              <NeoButton variant="green" size="lg" onClick={() => goNext()}>
                <span>CONTINUE TO RIDDLES</span>
                <ArrowRight className="w-5 h-5 ml-1.5 inline" />
              </NeoButton>
            </div>
          </div>
        )}

        {/* Reset position button */}
        {!isSolvedFinal && (
          <div className="text-center pt-2">
            <button
              type="button"
              onClick={handleResetPosition}
              className="text-xs font-bold text-neutral-600 hover:text-black inline-flex items-center gap-1.5 cursor-pointer"
            >
              <RotateCcw className="w-4 h-4" />
              <span>Reset Position</span>
            </button>
          </div>
        )}
      </NeoCard>
    </div>
  );
};
