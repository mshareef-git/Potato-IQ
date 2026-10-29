import React, { useState, useEffect, useCallback } from 'react';
import { NeoCard } from '../../components/NeoCard';
import { NeoButton } from '../../components/NeoButton';
import { getRandomWord, HangmanWord } from './wordBank';
import { useGameStore } from '../../store/gameStore';
import { useCountdown } from '../../hooks/useCountdown';
import { Skull, ShieldCheck, ArrowRight, RotateCcw } from 'lucide-react';

export interface ReverseHangmanLevelProps {
  onDogeshReaction: (comment: string, state: 'talk' | 'laugh' | 'smug' | 'angry') => void;
}

const MAX_MISTAKES = 6;
const ALPHABET = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');

export const ReverseHangmanLevel: React.FC<ReverseHangmanLevelProps> = ({ onDogeshReaction }) => {
  const [currentWordObj, setCurrentWordObj] = useState<HangmanWord>(getRandomWord());
  const [guessedLetters, setGuessedLetters] = useState<Set<string>>(new Set());
  const [isEscaped, setIsEscaped] = useState<boolean>(false);
  const [isWon, setIsWon] = useState<boolean>(false);

  const finishRound = useGameStore((state) => state.finishRound);
  const recordAttempt = useGameStore((state) => state.recordAttempt);
  const goNext = useGameStore((state) => state.goNext);

  const word = currentWordObj.word.toUpperCase();
  const mistakeCount = Array.from(guessedLetters).filter((letter) => !word.includes(letter)).length;

  const isResolved = isWon || isEscaped;

  // 60-second round timer
  const { secondsLeft, stop: stopTimer, reset: resetTimer } = useCountdown({
    initialSeconds: 60,
    autoStart: true,
    onTimeout: () => {
      if (!isResolved) {
        setIsEscaped(true);
        finishRound('hangman', 'failed');
        onDogeshReaction("Time's up! The captive broke free and escaped into the dark!", 'angry');
      }
    }
  });

  // Check victory condition
  useEffect(() => {
    if (isResolved) return;

    const allLettersGuessed = word.split('').every((letter) => guessedLetters.has(letter));
    if (allLettersGuessed) {
      stopTimer();
      setIsWon(true);
      finishRound('hangman', 'solved');
      onDogeshReaction("You survived. The word was easy. You were not.", 'talk');
    }
  }, [guessedLetters, word, isResolved, finishRound, onDogeshReaction, stopTimer]);

  // Check escape/failure condition
  useEffect(() => {
    if (isResolved) return;

    if (mistakeCount >= MAX_MISTAKES) {
      stopTimer();
      setIsEscaped(true);
      finishRound('hangman', 'failed');
      onDogeshReaction("HE'S OUT! HE'S ESCAPED! RUN!", 'angry');
    }
  }, [mistakeCount, isResolved, finishRound, onDogeshReaction, stopTimer]);

  const handleGuess = useCallback(
    (letter: string) => {
      if (isResolved || guessedLetters.has(letter)) return;

      setGuessedLetters((prev) => new Set([...prev, letter]));
      recordAttempt('hangman');

      if (!word.includes(letter)) {
        onDogeshReaction("Wrong letter! A chain snapped!", 'smug');
      }
    },
    [isResolved, guessedLetters, word, recordAttempt, onDogeshReaction]
  );

  // Physical keyboard listener
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const key = e.key.toUpperCase();
      if (/^[A-Z]$/.test(key)) {
        handleGuess(key);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleGuess]);

  const handleRestart = () => {
    setCurrentWordObj(getRandomWord());
    setGuessedLetters(new Set());
    setIsEscaped(false);
    setIsWon(false);
    resetTimer(60);
  };

  // 6 Chains that break one by one
  const remainingChains = MAX_MISTAKES - mistakeCount;

  return (
    <div className="w-full max-w-5xl mx-auto space-y-4">
      <NeoCard size="large" className={`p-6 md:p-8 ${isEscaped ? 'animate-shake' : ''}`}>
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-heading text-xl md:text-2xl text-[var(--ink)] flex items-center gap-2">
            <Skull className="w-6 h-6 text-[var(--red)]" />
            REVERSE HANGMAN — HANG HIM OR GET HUNTED
          </h2>
          <span className="text-xs font-bold px-3 py-1 bg-[var(--pink)] text-white border-2 border-black rounded shadow-[2px_2px_0px_#000]">
            TIME: {Math.ceil(secondsLeft)}s
          </span>
        </div>

        {/* Escape Progress Bar */}
        <div className="mb-4">
          <div className="flex justify-between items-center text-xs font-heading uppercase text-neutral-700 dark:text-neutral-300 mb-1">
            <span>ESCAPE PROGRESS (WRONG GUESSES)</span>
            <span className="text-sm font-bold text-[var(--red)]">
              {mistakeCount} / {MAX_MISTAKES}
            </span>
          </div>
          <div className="w-full h-5 bg-neutral-200 dark:bg-neutral-800 border-3 border-black rounded-md overflow-hidden p-0.5 shadow-[2px_2px_0px_#000]">
            <div
              className="h-full bg-gradient-to-r from-yellow-400 via-orange-500 to-red-600 transition-all duration-300 rounded-sm"
              style={{ width: `${(mistakeCount / MAX_MISTAKES) * 100}%` }}
            />
          </div>
        </div>

        {/* SVG Wooden Scaffold & Illustrated Captive */}
        <div className="relative w-full h-[240px] md:h-[280px] bg-neutral-100 dark:bg-neutral-900 border-4 border-black rounded-xl overflow-hidden shadow-[4px_4px_0px_#000] flex items-center justify-center">
          <svg className="w-full h-full" viewBox="0 0 600 280">
            {/* Wooden Gallows / Scaffold */}
            {/* Platform Floor */}
            <rect x="80" y="240" width="440" height="24" rx="4" fill="#78350f" stroke="#111111" strokeWidth="4" />
            <line x1="140" y1="240" x2="140" y2="264" stroke="#111111" strokeWidth="3" />
            <line x1="280" y1="240" x2="280" y2="264" stroke="#111111" strokeWidth="3" />
            <line x1="420" y1="240" x2="420" y2="264" stroke="#111111" strokeWidth="3" />

            {/* Vertical Timber Beam */}
            <rect x="120" y="30" width="24" height="210" rx="3" fill="#92400e" stroke="#111111" strokeWidth="4" />
            {/* Top Horizontal Timber Beam */}
            <rect x="120" y="24" width="220" height="22" rx="3" fill="#92400e" stroke="#111111" strokeWidth="4" />
            {/* Diagonal Timber Brace */}
            <line x1="144" y1="90" x2="190" y2="46" stroke="#111111" strokeWidth="6" strokeLinecap="round" />

            {/* Hanging Rope & Loop */}
            <line x1="300" y1="46" x2="300" y2="95" stroke="#d97706" strokeWidth="5" />
            <ellipse cx="300" cy="112" rx="14" ry="18" fill="none" stroke="#d97706" strokeWidth="4" />

            {/* The Stylized Captive (Restrained or Escaping) */}
            {!isEscaped ? (
              <g transform="translate(300, 115)">
                {/* Head */}
                <circle cx="0" cy="22" r="16" fill="#FED7AA" stroke="#111111" strokeWidth="3.5" />
                {/* Mask / Blindfold */}
                <rect x="-16" y="16" width="32" height="10" fill="#111111" />
                <path d="-6 32 Q 0 28 6 32" stroke="#111111" strokeWidth="2.5" fill="none" />

                {/* Torso */}
                <rect x="-14" y="38" width="28" height="42" rx="4" fill="#3B82F6" stroke="#111111" strokeWidth="3.5" />

                {/* Chains / Restraints */}
                {/* Chain 1: Left wrist (removed if mistakeCount >= 1) */}
                {mistakeCount < 1 && (
                  <line x1="-14" y1="52" x2="-35" y2="52" stroke="#64748B" strokeWidth="6" strokeDasharray="4,2" />
                )}
                {/* Chain 2: Right wrist (removed if mistakeCount >= 2) */}
                {mistakeCount < 2 && (
                  <line x1="14" y1="52" x2="35" y2="52" stroke="#64748B" strokeWidth="6" strokeDasharray="4,2" />
                )}
                {/* Chain 3: Waist padlock (removed if mistakeCount >= 3) */}
                {mistakeCount < 3 && (
                  <circle cx="0" cy="62" r="6" fill="#F59E0B" stroke="#111111" strokeWidth="2.5" />
                )}
                {/* Chain 4: Left ankle shackle (removed if mistakeCount >= 4) */}
                {mistakeCount < 4 && (
                  <ellipse cx="-8" cy="112" rx="7" ry="5" fill="#64748B" stroke="#111111" strokeWidth="2.5" />
                )}
                {/* Chain 5: Right ankle shackle (removed if mistakeCount >= 5) */}
                {mistakeCount < 5 && (
                  <ellipse cx="8" cy="112" rx="7" ry="5" fill="#64748B" stroke="#111111" strokeWidth="2.5" />
                )}
                {/* Chain 6: Main tether post (removed if mistakeCount >= 6) */}
                {mistakeCount < 6 && (
                  <line x1="0" y1="78" x2="0" y2="124" stroke="#64748B" strokeWidth="4" strokeDasharray="3,2" />
                )}

                {/* Legs */}
                <line x1="-8" y1="80" x2="-8" y2="124" stroke="#111111" strokeWidth="4" />
                <line x1="8" y1="80" x2="8" y2="124" stroke="#111111" strokeWidth="4" />
              </g>
            ) : (
              /* Escaped Captive Charging at Player! */
              <g transform="translate(420, 80)" className="animate-bounce">
                <circle cx="0" cy="30" r="22" fill="#FED7AA" stroke="#111111" strokeWidth="4" />
                {/* Angry Eyes */}
                <line x1="-12" y1="20" x2="-2" y2="28" stroke="#EF4444" strokeWidth="4" />
                <line x1="12" y1="20" x2="2" y2="28" stroke="#EF4444" strokeWidth="4" />
                <path d="-10 42 Q 0 52 10 42" stroke="#111111" strokeWidth="4" fill="none" />
                <rect x="-18" y="52" width="36" height="50" rx="5" fill="#EF4444" stroke="#111111" strokeWidth="4" />
                {/* Running Arms & Broken Chains */}
                <line x1="-18" y1="65" x2="-45" y2="40" stroke="#111111" strokeWidth="6" strokeLinecap="round" />
                <line x1="18" y1="65" x2="50" y2="70" stroke="#111111" strokeWidth="6" strokeLinecap="round" />
                <text x="0" y="-10" textAnchor="middle" fontSize="18" fontWeight="900" fill="#EF4444">
                  HUNTS YOU DOWN! 💀
                </text>
              </g>
            )}
          </svg>
        </div>

        {/* Word Display Slots */}
        <div className="flex justify-center items-center gap-2 md:gap-3 my-6 flex-wrap">
          {word.split('').map((letter, idx) => {
            const isRevealed = guessedLetters.has(letter) || isEscaped;
            return (
              <div
                key={idx}
                className={`w-11 h-16 md:w-14 md:h-20 flex items-center justify-center font-heading text-2xl md:text-4xl border-4 border-black rounded-xl shadow-[4px_4px_0px_#000] select-none ${
                  isRevealed
                    ? 'bg-[var(--yellow)] text-black'
                    : 'bg-white dark:bg-neutral-800 text-transparent border-dashed'
                }`}
              >
                {isRevealed ? letter : '_'}
              </div>
            );
          })}
        </div>

        {/* Word Hint */}
        <p className="text-sm text-center text-neutral-800 dark:text-neutral-200 font-bold mb-5">
          💡 CLUE: {currentWordObj.hint}
        </p>

        {/* On-Screen Keyboard */}
        <div className="grid grid-cols-7 sm:grid-cols-9 gap-2 max-w-2xl mx-auto mb-4">
          {ALPHABET.map((letter) => {
            const isGuessed = guessedLetters.has(letter);
            const isMatch = isGuessed && word.includes(letter);
            const isWrong = isGuessed && !word.includes(letter);

            return (
              <button
                key={letter}
                type="button"
                disabled={isGuessed || isResolved}
                onClick={() => handleGuess(letter)}
                className={`py-2.5 text-sm md:text-base font-heading border-3 border-black rounded-lg shadow-[3px_3px_0px_#000] active:translate-x-0.5 active:translate-y-0.5 transition-all ${
                  isMatch
                    ? 'bg-[var(--green)] text-black'
                    : isWrong
                    ? 'bg-neutral-300 dark:bg-neutral-700 text-neutral-400 line-through opacity-50'
                    : 'bg-white dark:bg-neutral-800 text-[var(--ink)] hover:bg-neutral-100 dark:hover:bg-neutral-700'
                }`}
              >
                {letter}
              </button>
            );
          })}
        </div>

        {/* Victory / Defeat Outcome Dialog */}
        {isResolved && (
          <div
            className={`p-5 border-4 border-black rounded-xl shadow-[6px_6px_0px_#000] space-y-3 text-center animate-slide-down ${
              isWon ? 'bg-green-100 dark:bg-green-950/70' : 'bg-red-100 dark:bg-red-950/70'
            }`}
          >
            <div className="font-heading text-xl md:text-2xl">
              {isWon ? (
                <span className="text-green-800 dark:text-green-300 flex items-center justify-center gap-2">
                  <ShieldCheck className="w-6 h-6" />
                  YOU CONTAINED THE CAPTIVE! YOU SURVIVED!
                </span>
              ) : (
                <span className="text-red-700 dark:text-red-300 flex items-center justify-center gap-2">
                  <Skull className="w-6 h-6" />
                  THE CAPTIVE ESCAPED & HUNTED YOU DOWN!
                </span>
              )}
            </div>

            <p className="text-sm md:text-base text-neutral-800 dark:text-neutral-200 font-bold">
              The secret word was: <span className="underline">{word}</span>.
            </p>

            <div className="flex justify-center gap-3 pt-2">
              <NeoButton variant="yellow" size="lg" onClick={() => goNext()}>
                <span>CONTINUE TO THE MAZE</span>
                <ArrowRight className="w-5 h-5 ml-1.5 inline" />
              </NeoButton>

              <button
                type="button"
                onClick={handleRestart}
                className="px-4 py-2 text-xs font-heading border-2 border-black rounded-lg bg-white dark:bg-neutral-800 text-[var(--ink)] shadow-[2px_2px_0px_#000] hover:bg-neutral-200 transition-colors inline-flex items-center gap-1.5"
              >
                <RotateCcw className="w-4 h-4" />
                <span>TRY ANOTHER WORD</span>
              </button>
            </div>
          </div>
        )}
      </NeoCard>
    </div>
  );
};
