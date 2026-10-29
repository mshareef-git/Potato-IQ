import React, { useState } from 'react';
import { useGameStore } from '../store/gameStore';
import { LEVEL_REGISTRY } from './levelRegistry';
import { isScoredRound, FLOW_ORDER } from './gameFlow';
import { ProgressIndicator } from '../components/ProgressIndicator';
import { SkipRoundButton } from '../components/SkipRoundButton';
import { ThemeToggle } from '../components/ThemeToggle';
import { DogeshAvatar } from '../components/DogeshAvatar';
import { DogeshComment } from '../components/DogeshComment';
import { DogeshBlocker } from '../components/DogeshBlocker';
import { useDogeshInterruptions } from '../hooks/useDogeshInterruptions';
import { Terminal } from 'lucide-react';

export const App: React.FC = () => {
  const currentScreen = useGameStore((state) => state.screen);
  const currentRoundId = useGameStore((state) => state.currentRoundId);
  const setScreen = useGameStore((state) => state.setScreen);
  const theme = useGameStore((state) => state.theme);
  const toggleTheme = useGameStore((state) => state.toggleTheme);

  const [showDevNav, setShowDevNav] = useState(false);

  const isBlankDarkMode = theme === 'dark';

  // Dogesh interruptions and character state
  const {
    dogeshState,
    comment,
    anchor,
    isBlocking,
    triggerComment,
    shooDogesh,
  } = useDogeshInterruptions({
    currentScreen,
    allowBlocker: currentScreen !== 'login' && currentScreen !== 'result' && !isBlankDarkMode
  });

  const ActiveComponent = LEVEL_REGISTRY[currentScreen];

  const handleDogeshReaction = (text: string, state: 'talk' | 'laugh' | 'smug' | 'angry') => {
    triggerComment(currentScreen as any, state);
  };

  const getAnchorClasses = () => {
    switch (anchor) {
      case 'left-card':
        return 'fixed left-4 bottom-12 md:bottom-20 z-20 flex flex-col items-center';
      case 'top-right':
        return 'fixed right-4 top-16 md:top-20 z-20 flex flex-col items-end';
      case 'bottom-right':
        return 'fixed right-4 bottom-4 md:bottom-8 z-20 flex flex-col items-end';
      case 'right-card':
      default:
        return 'fixed right-4 bottom-12 md:bottom-20 z-20 flex flex-col items-end';
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#F7F4EF] text-[#111111] neo-grid-bg transition-colors duration-200">
      {/* 
        ========================================================================
        SATIRICAL DARK MODE OVERLAY:
        When dark mode is active, the entire viewport is completely blank black!
        Nothing is visible. The button in the top-right remains an invisible click target
        in the exact same position, toggling light mode back when clicked!
        ========================================================================
      */}
      {isBlankDarkMode && (
        <div className="fixed inset-0 z-50 bg-black cursor-default select-none pointer-events-auto">
          {/* Invisible interactive target at top-right (matching original position) */}
          <button
            onClick={toggleTheme}
            aria-label="Toggle light mode"
            className="fixed top-3 right-4 w-32 h-10 opacity-0 cursor-pointer"
            title=""
          />
        </div>
      )}

      {/* Top Global Navigation Bar */}
      <header className="sticky top-0 z-40 bg-white border-b-4 border-black px-4 py-3 shadow-[0px_4px_0px_#000]">
        <div className="max-w-6xl mx-auto flex items-center justify-between gap-2 flex-wrap">
          {/* Logo / Title */}
          <div className="flex items-center gap-2.5">
            <span className="text-3xl select-none">🥔</span>
            <div>
              <div className="font-heading text-base md:text-lg leading-tight tracking-tight text-black">
                BRAIN TESTER: POTATO IQ
              </div>
              <div className="text-[10px] text-neutral-600 font-bold uppercase tracking-wider">
                MadHackd Assessment
              </div>
            </div>
          </div>

          {/* Center: Round Indicator & Skip button (Scored rounds only) */}
          <div className="flex items-center gap-3">
            {currentRoundId && isScoredRound(currentRoundId) && (
              <>
                <ProgressIndicator currentRoundId={currentRoundId} />
                <SkipRoundButton roundId={currentRoundId} />
              </>
            )}
          </div>

          {/* Right: Theme Toggle & Dev Nav Button */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowDevNav((prev) => !prev)}
              className="p-1.5 text-xs border-2 border-black rounded bg-neutral-100 hover:bg-yellow-200 text-black transition-colors"
              title="Dev Navigation Panel"
            >
              <Terminal className="w-4 h-4" />
            </button>
            <ThemeToggle />
          </div>
        </div>
      </header>

      {/* Dev Navigation Quick-Jump Panel */}
      {showDevNav && (
        <div className="bg-yellow-100 border-b-3 border-black p-2.5 z-40 animate-slide-down">
          <div className="max-w-6xl mx-auto flex items-center justify-between gap-2 flex-wrap text-xs">
            <span className="font-heading text-neutral-800">
              🛠️ DEV JUMP:
            </span>
            <div className="flex gap-1.5 flex-wrap">
              {FLOW_ORDER.map((screen) => (
                <button
                  key={screen}
                  onClick={() => {
                    setScreen(screen);
                    setShowDevNav(false);
                  }}
                  className={`px-2.5 py-1 rounded border-2 border-black text-xs font-bold ${
                    currentScreen === screen
                      ? 'bg-black text-white'
                      : 'bg-white text-black hover:bg-yellow-300'
                  }`}
                >
                  {screen}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Main Challenge Arena (Enlarged to 85–90% width, ~1100–1200px max) */}
      <main className="flex-1 max-w-6xl w-full mx-auto px-4 py-6 md:py-8 flex flex-col justify-center items-center relative">
        <ActiveComponent onDogeshReaction={handleDogeshReaction} />

        {/* Dogesh Comedic Blocker (if active) */}
        <DogeshBlocker active={isBlocking} onDismiss={shooDogesh} />
      </main>

      {/* Persistent Dogesh Avatar & Speech Bubble Overlay */}
      <div className={getAnchorClasses()}>
        {comment && (
          <DogeshComment comment={comment} className="mb-2" />
        )}
        <DogeshAvatar
          state={dogeshState}
          size={110}
          onClick={shooDogesh}
        />
      </div>

      {/* Minimal Footer Strip */}
      <footer className="text-center py-2.5 text-xs text-neutral-500 font-semibold border-t-2 border-dashed border-neutral-300">
        <span>Instructor Dogesh · MadHackd</span>
      </footer>
    </div>
  );
};
