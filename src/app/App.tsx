import React, { useState, useEffect, useCallback } from 'react';
import { useGameStore } from '../store/gameStore';
import { LEVEL_REGISTRY } from './levelRegistry';
import { isScoredRound, FLOW_ORDER } from './gameFlow';
import { ProgressIndicator } from '../components/ProgressIndicator';
import { SkipRoundButton } from '../components/SkipRoundButton';
import { ThemeToggle } from '../components/ThemeToggle';
import { AudioHeaderControl } from '../components/AudioHeaderControl';
import { DogeshAvatar } from '../components/DogeshAvatar';
import { DogeshComment } from '../components/DogeshComment';
import { DogeshBlocker } from '../components/DogeshBlocker';
import { FloatingGifManager } from '../components/FloatingGifManager';
import { SpaceBackground } from '../components/SpaceBackground';
import { useDogeshInterruptions } from '../hooks/useDogeshInterruptions';
import { Terminal } from 'lucide-react';

export const App: React.FC = () => {
  const currentScreen = useGameStore((state) => state.screen);
  const currentRoundId = useGameStore((state) => state.currentRoundId);
  const setScreen = useGameStore((state) => state.setScreen);
  const theme = useGameStore((state) => state.theme);
  const toggleTheme = useGameStore((state) => state.toggleTheme);

  const [showDevNav, setShowDevNav] = useState(false);
  const [toggleRect, setToggleRect] = useState<{ top: number; left: number; width: number; height: number }>({
    top: 12,
    left: typeof window !== 'undefined' ? window.innerWidth - 140 : 900,
    width: 120,
    height: 38,
  });

  const isBlankDarkMode = theme === 'dark';

  const updateToggleRect = useCallback(() => {
    const el = document.getElementById('theme-toggle-btn');
    if (el) {
      const r = el.getBoundingClientRect();
      setToggleRect({ top: r.top, left: r.left, width: r.width, height: r.height });
    }
  }, []);

  useEffect(() => {
    updateToggleRect();
    window.addEventListener('resize', updateToggleRect);
    return () => window.removeEventListener('resize', updateToggleRect);
  }, [updateToggleRect]);

  // Support Escape key to exit dark mode gag
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isBlankDarkMode) {
        toggleTheme();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isBlankDarkMode, toggleTheme]);

  // Dogesh interruptions and character state (coordinated with GIF summons)
  const {
    dogeshState,
    comment,
    dogeshPos,
    dogeshSize,
    isMoving,
    isBlocking,
    floatingGifs,
    triggerComment,
    triggerCustomReaction,
    triggerEventReaction,
    triggerCaptchaComment,
    setCaptchaBusy,
    closeGif,
    updateGifPosition,
    shooDogesh,
  } = useDogeshInterruptions({
    currentScreen,
    allowBlocker: currentScreen !== 'intro' && currentScreen !== 'login' && currentScreen !== 'result' && !isBlankDarkMode
  });

  const ActiveComponent = LEVEL_REGISTRY[currentScreen] || LEVEL_REGISTRY.intro;

  const handleDogeshReaction = useCallback(
    (text: string, state: 'talk' | 'laugh' | 'smug' | 'angry', priority?: number) => {
      if (currentScreen === 'captcha') {
        triggerCaptchaComment(text, state, (priority || 3) as any);
      } else {
        const spawnCategory = state === 'angry' ? 'brain' : undefined;
        triggerCustomReaction(text, state, spawnCategory);
      }
    },
    [currentScreen, triggerCaptchaComment, triggerCustomReaction]
  );


  return (
    <div className="min-h-screen flex flex-col bg-transparent text-[#111111] transition-colors duration-200 relative">
      {/* 3D Fast-Moving Monochrome Space Starfield */}
      <SpaceBackground />

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
          {/* Invisible interactive target matching ThemeToggle position at exact coordinates */}
          <button
            id="blank-mode-restore-btn"
            onClick={toggleTheme}
            aria-label="Toggle light mode"
            style={{
              position: 'fixed',
              top: `${toggleRect.top}px`,
              left: `${toggleRect.left}px`,
              width: `${toggleRect.width}px`,
              height: `${toggleRect.height}px`,
            }}
            className="opacity-0 cursor-pointer z-50"
            title="Restore Light Mode"
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
                MadHackd Assessment · Instructor Dogesh
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

          {/* Right: Audio Control, Dev Nav & Theme Toggle */}
          <div className="flex items-center gap-2">
            <AudioHeaderControl />
            <button
              onClick={() => setShowDevNav((prev) => !prev)}
              className="p-1.5 text-xs border-2 border-black rounded bg-neutral-100 hover:bg-yellow-200 text-black transition-colors"
              title="Dev Navigation Panel"
              aria-label="Open Dev Nav"
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

      {/* Main Challenge Arena */}
      <main className="flex-1 max-w-6xl w-full mx-auto px-4 py-6 md:py-8 flex flex-col justify-center items-center relative game-surface">
        <ActiveComponent
          onDogeshReaction={handleDogeshReaction}
          onDogeshActivityChange={setCaptchaBusy}
        />

        {/* Dogesh Localized Shield Blocker (if active) */}
        <DogeshBlocker active={isBlocking} onDismiss={() => shooDogesh()} />
      </main>

      {/* Movable Floating GIFs Summoned Exclusively By Dogesh */}
      <FloatingGifManager
        instances={floatingGifs}
        onCloseGif={closeGif}
        onPositionChange={updateGifPosition}
      />

      {/* Persistent Dogesh Avatar & Speech Bubble Overlay (only after intro) */}
      {currentScreen !== 'intro' && (
        <div
          style={{
            position: 'fixed',
            left: `${dogeshPos.x}px`,
            top: `${dogeshPos.y}px`,
            width: `${dogeshSize}px`,
            transition: isMoving
              ? 'left 3.2s cubic-bezier(0.25, 1, 0.5, 1), top 3.2s cubic-bezier(0.25, 1, 0.5, 1), width 1.2s cubic-bezier(0.34, 1.56, 0.64, 1)'
              : 'left 0.8s ease-out, top 0.8s ease-out, width 1.2s cubic-bezier(0.34, 1.56, 0.64, 1)',
            zIndex: 35,
          }}
          className="dogesh-floating-container flex flex-col items-center pointer-events-auto"
        >
          {comment && (
            <DogeshComment comment={comment} className="mb-2 max-w-[280px]" />
          )}
          <DogeshAvatar
            state={dogeshState}
            size={dogeshSize}
            isSpeaking={Boolean(comment && (dogeshState === 'talk' || dogeshState === 'smug' || dogeshState === 'laugh'))}
            onClick={() => {}}
            onPunchReaction={(insult) => shooDogesh(insult)}
          />
        </div>
      )}

      {/* Minimal Footer Strip */}
      <footer className="text-center py-2.5 text-xs text-neutral-400 font-semibold border-t-2 border-dashed border-neutral-700 bg-black/60 backdrop-blur-sm z-10">
        <span>Instructor Dogesh · MadHackd Institute</span>
      </footer>
    </div>
  );
};

