import React, { useState, useEffect, useCallback } from 'react';
import { NeoCard } from '../../components/NeoCard';
import { NeoButton } from '../../components/NeoButton';
import { getRandomWord, HangmanWord } from './wordBank';
import { useGameStore } from '../../store/gameStore';
import { useCountdown } from '../../hooks/useCountdown';
import { Skull, ShieldCheck, ArrowRight, RotateCcw, Clock } from 'lucide-react';

export interface ReverseHangmanLevelProps {
  onDogeshReaction: (comment: string, state: 'talk' | 'laugh' | 'smug' | 'angry') => void;
}

const MAX_MISTAKES = 6;
const KEYBOARD_ROWS = [
  ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I'],
  ['J', 'K', 'L', 'M', 'N', 'O', 'P', 'Q', 'R'],
  ['S', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z'],
];

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
        onDogeshReaction("Time's up! The captive broke free and is hunting you down!", 'angry');
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
      onDogeshReaction("You contained the captive! The hidden word was solved.", 'talk');
    }
  }, [guessedLetters, word, isResolved, finishRound, onDogeshReaction, stopTimer]);

  // Check escape/failure condition (6 mistakes)
  useEffect(() => {
    if (isResolved) return;

    if (mistakeCount >= MAX_MISTAKES) {
      stopTimer();
      setIsEscaped(true);
      finishRound('hangman', 'failed');
      onDogeshReaction("HE'S BROKEN FREE! ALL CHAINS SHATTERED!", 'angry');
    }
  }, [mistakeCount, isResolved, finishRound, onDogeshReaction, stopTimer]);

  const handleGuess = useCallback(
    (letter: string) => {
      if (isResolved || guessedLetters.has(letter)) return;

      setGuessedLetters((prev) => new Set([...prev, letter]));
      recordAttempt('hangman');

      if (!word.includes(letter)) {
        const remaining = MAX_MISTAKES - (mistakeCount + 1);
        if (remaining > 0) {
          onDogeshReaction(`Wrong letter! Another restraint snapped! ${remaining} left!`, 'smug');
        }
      }
    },
    [isResolved, guessedLetters, word, recordAttempt, onDogeshReaction, mistakeCount]
  );

  // Physical keyboard listener
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (['INPUT', 'TEXTAREA'].includes((e.target as HTMLElement).tagName)) return;
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

  return (
    <div className="w-full max-w-4xl mx-auto space-y-4">
      <NeoCard size="large" className={`p-5 md:p-8 ${isEscaped ? 'animate-shake' : ''}`}>
        {/* Top Header Bar */}
        <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
          <div className="flex items-center gap-2">
            <Skull className="w-6 h-6 text-red-600 flex-shrink-0" />
            <h2 className="font-heading text-lg md:text-2xl text-neutral-900 tracking-tight">
              REVERSE HANGMAN: HANG HIM OR GET HUNTED
            </h2>
          </div>
          <div className="flex items-center gap-2">
            <span className="flex items-center gap-1 text-xs font-bold px-3 py-1 bg-pink-600 text-white border-2 border-black rounded shadow-[2px_2px_0px_#000]">
              <Clock className="w-3.5 h-3.5" />
              <span>TIME: {Math.ceil(secondsLeft)}s</span>
            </span>
            <span className="text-xs font-bold px-3 py-1 bg-[var(--yellow)] text-black border-2 border-black rounded shadow-[2px_2px_0px_#000]">
              ROUND 2 OF 4
            </span>
          </div>
        </div>

        {/* Escape Progress Bar with 6 clear progression stages */}
        <div className="mb-4 bg-white p-3 border-3 border-black rounded-xl shadow-[3px_3px_0px_#000]">
          <div className="flex justify-between items-center text-xs font-heading uppercase text-neutral-900 mb-1.5 flex-wrap gap-1">
            <span>CAPTIVE ESCAPE PROGRESS (6 MISTAKES = BREAKOUT)</span>
            <span className={`text-sm font-bold ${mistakeCount >= 4 ? 'text-red-600' : 'text-neutral-800'}`}>
              {mistakeCount} / {MAX_MISTAKES} RESTRAINTS BROKEN
            </span>
          </div>

          {/* 6-segment progression meter */}
          <div className="grid grid-cols-6 gap-1 w-full h-4 bg-neutral-200 border-2 border-black rounded p-0.5">
            {[0, 1, 2, 3, 4, 5].map((step) => {
              const isBroken = mistakeCount > step;
              return (
                <div
                  key={step}
                  className={`h-full rounded-sm transition-colors duration-300 ${
                    isBroken
                      ? step < 2
                        ? 'bg-yellow-400'
                        : step < 4
                        ? 'bg-orange-500'
                        : 'bg-red-600'
                      : 'bg-neutral-300'
                  }`}
                />
              );
            })}
          </div>
        </div>

        {/* 
          Illustrated Gallows & Captive Scene (High-Contrast Clean Vector Composition)
          - Solid timber gallows with vertical post, top beam, cross brace, and platform floor
          - Captive is physically suspended by rope from the beam from the start of the round
          - Visual swinging animation while hanging
          - 6 visually distinct restraint breakage progression steps
          - Breakout chase animation on failure, lockdown on victory
        */}
        <div className="relative w-full h-[270px] md:h-[310px] bg-[#E2E8F0] border-4 border-black rounded-xl overflow-hidden shadow-[5px_5px_0px_#000] flex items-center justify-center game-scene select-none">
          {/* Subtle background stones and sky */}
          <div className="absolute inset-0 bg-gradient-to-b from-[#CBD5E1] to-[#94A3B8] opacity-60" />

          <svg className="w-full h-full relative z-10" viewBox="0 0 680 320" preserveAspectRatio="xMidYMid meet">
            {/* Wooden Base Platform */}
            <rect x="50" y="260" width="580" height="30" rx="3" fill="#78350F" stroke="#111111" strokeWidth="4" />
            {/* Platform timber plank lines */}
            <line x1="140" y1="260" x2="140" y2="290" stroke="#111111" strokeWidth="3" />
            <line x1="230" y1="260" x2="230" y2="290" stroke="#111111" strokeWidth="3" />
            <line x1="320" y1="260" x2="320" y2="290" stroke="#111111" strokeWidth="3" />
            <line x1="410" y1="260" x2="410" y2="290" stroke="#111111" strokeWidth="3" />
            <line x1="500" y1="260" x2="500" y2="290" stroke="#111111" strokeWidth="3" />
            {/* Support platform legs under floor */}
            <rect x="90" y="290" width="24" height="25" fill="#451A03" stroke="#111111" strokeWidth="3" />
            <rect x="330" y="290" width="24" height="25" fill="#451A03" stroke="#111111" strokeWidth="3" />
            <rect x="570" y="290" width="24" height="25" fill="#451A03" stroke="#111111" strokeWidth="3" />

            {/* Gallows Timber Structure */}
            {/* Main vertical upright post */}
            <rect x="130" y="30" width="32" height="230" rx="3" fill="#92400E" stroke="#111111" strokeWidth="4" />
            {/* Iron reinforcement straps on vertical post */}
            <rect x="127" y="65" width="38" height="12" fill="#334155" stroke="#111111" strokeWidth="2" />
            <circle cx="132" cy="71" r="2" fill="#E2E8F0" />
            <circle cx="160" cy="71" r="2" fill="#E2E8F0" />
            <rect x="127" y="215" width="38" height="12" fill="#334155" stroke="#111111" strokeWidth="2" />
            <circle cx="132" cy="221" r="2" fill="#E2E8F0" />
            <circle cx="160" cy="221" r="2" fill="#E2E8F0" />

            {/* Horizontal Top Beam */}
            <rect x="115" y="24" width="350" height="28" rx="3" fill="#92400E" stroke="#111111" strokeWidth="4" />
            {/* Diagonal Timber Brace */}
            <line x1="162" y1="105" x2="225" y2="52" stroke="#111111" strokeWidth="12" strokeLinecap="round" />
            <line x1="162" y1="105" x2="225" y2="52" stroke="#B45309" strokeWidth="8" strokeLinecap="round" />

            {/* Rope Attachment & Gallows Rope */}
            {/* Iron hook/pulley bracket */}
            <rect x="352" y="20" width="16" height="10" fill="#334155" stroke="#111111" strokeWidth="2" />
            <circle cx="360" cy="52" r="5" fill="#334155" stroke="#111111" strokeWidth="2" />

            {!isEscaped ? (
              /* CAPTIVE SUSPENDED IN MID-AIR (Restrained swinging animation) */
              <g className="animate-hangman-swing">
                {/* Braided Rope running from top beam straight to captive neck */}
                <line x1="360" y1="52" x2="360" y2="120" stroke="#B45309" strokeWidth="6" strokeLinecap="round" />
                <line x1="360" y1="52" x2="360" y2="120" stroke="#FDE68A" strokeWidth="2" strokeDasharray="3,3" />

                {/* Visible Rope Noose Knot connecting seamlessly to upper chest */}
                <ellipse cx="360" cy="122" rx="11" ry="8" fill="#B45309" stroke="#111111" strokeWidth="3" />
                {mistakeCount >= 5 && (
                  /* Rope fraying warning before snap! */
                  <g transform="translate(372, 85)">
                    <text x="0" y="0" fontSize="11" fontWeight="900" fill="#DC2626" stroke="#FFFFFF" strokeWidth="0.5">
                      *CREAK!*
                    </text>
                  </g>
                )}

                {/* The Cartoon Captive Character (Feet hang at y=228, well above platform at 260) */}
                <g id="hanging-captive">
                  {/* Head */}
                  <circle cx="360" cy="100" r="18" fill="#FED7AA" stroke="#111111" strokeWidth="3.5" />
                  {/* Cartoon Robber Domino Mask */}
                  <path d="M 344 95 Q 360 98 376 95 Q 376 103 360 105 Q 344 103 344 95 Z" fill="#111111" />
                  {/* Nervous cartoon eyes */}
                  <circle cx="353" cy="98" r="3" fill="#FFFFFF" />
                  <circle cx={mistakeCount >= 4 ? '354' : '352'} cy="98" r="1.5" fill="#111111" />
                  <circle cx="367" cy="98" r="3" fill="#FFFFFF" />
                  <circle cx={mistakeCount >= 4 ? '368' : '366'} cy="98" r="1.5" fill="#111111" />

                  {/* Mouth: wavy/grimace */}
                  <path d="M 353 111 Q 360 108 367 111" stroke="#111111" strokeWidth="2.5" fill="none" />
                  {/* Sweat drops on mistake */}
                  {mistakeCount > 0 && (
                    <ellipse cx="379" cy="96" rx="2.5" ry="4" fill="#38BDF8" />
                  )}

                  {/* Torso (Black and white horizontal prison stripes) */}
                  <rect x="338" y="124" width="44" height="52" rx="4" fill="#FFFFFF" stroke="#111111" strokeWidth="3.5" />
                  <rect x="339" y="132" width="42" height="7" fill="#111111" />
                  <rect x="339" y="146" width="42" height="7" fill="#111111" />
                  <rect x="339" y="160" width="42" height="7" fill="#111111" />

                  {/* Left Arm: Step 1 progression */}
                  {mistakeCount < 1 ? (
                    /* Bound tightly to torso by iron chain */
                    <g>
                      <line x1="338" y1="134" x2="330" y2="160" stroke="#111111" strokeWidth="6" strokeLinecap="round" />
                      <line x1="330" y1="160" x2="338" y2="170" stroke="#111111" strokeWidth="6" strokeLinecap="round" />
                      <line x1="335" y1="145" x2="345" y2="145" stroke="#475569" strokeWidth="4" strokeDasharray="3,2" />
                    </g>
                  ) : (
                    /* Left arm free & swinging! */
                    <g>
                      <line x1="338" y1="134" x2="312" y2="150" stroke="#111111" strokeWidth="6" strokeLinecap="round" />
                      <line x1="312" y1="150" x2="300" y2="136" stroke="#111111" strokeWidth="6" strokeLinecap="round" />
                      <circle cx="298" cy="134" r="5" fill="#FED7AA" stroke="#111111" strokeWidth="2" />
                      <text x="314" y="168" fontSize="13">💥</text>
                    </g>
                  )}

                  {/* Right Arm: Step 2 progression */}
                  {mistakeCount < 2 ? (
                    /* Bound tightly to torso by iron chain */
                    <g>
                      <line x1="382" y1="134" x2="390" y2="160" stroke="#111111" strokeWidth="6" strokeLinecap="round" />
                      <line x1="390" y1="160" x2="382" y2="170" stroke="#111111" strokeWidth="6" strokeLinecap="round" />
                      <line x1="375" y1="145" x2="385" y2="145" stroke="#475569" strokeWidth="4" strokeDasharray="3,2" />
                    </g>
                  ) : (
                    /* Right arm reaching up to untie the rope knot! */
                    <g>
                      <line x1="382" y1="134" x2="395" y2="120" stroke="#111111" strokeWidth="6" strokeLinecap="round" />
                      <line x1="395" y1="120" x2="375" y2="114" stroke="#111111" strokeWidth="6" strokeLinecap="round" />
                      <circle cx="373" cy="114" r="5" fill="#FED7AA" stroke="#111111" strokeWidth="2" />
                      <text x="398" y="132" fontSize="13">💥</text>
                    </g>
                  )}

                  {/* Waist Restraint: Step 3 progression */}
                  {mistakeCount < 3 ? (
                    /* Heavy golden padlock & belly belt */
                    <g>
                      <rect x="338" y="166" width="44" height="6" fill="#334155" />
                      <circle cx="360" cy="169" r="6" fill="#F59E0B" stroke="#111111" strokeWidth="2" />
                      <path d="M 357 165 A 3 3 0 0 1 363 165" stroke="#111111" strokeWidth="2" fill="none" />
                    </g>
                  ) : (
                    /* Padlock shattered open! */
                    <g transform="translate(365, 172)">
                      <text x="0" y="0" fontSize="14">🔓</text>
                    </g>
                  )}

                  {/* Left Leg: Step 4 progression */}
                  {mistakeCount < 4 ? (
                    /* Shackled down */
                    <g>
                      <line x1="350" y1="176" x2="348" y2="218" stroke="#111111" strokeWidth="6" strokeLinecap="round" />
                      <rect x="342" y="210" width="12" height="8" rx="2" fill="#475569" stroke="#111111" strokeWidth="2" />
                      <ellipse cx="346" cy="224" rx="7" ry="5" fill="#111111" />
                    </g>
                  ) : (
                    /* Left leg kicked loose */
                    <g>
                      <line x1="350" y1="176" x2="330" y2="208" stroke="#111111" strokeWidth="6" strokeLinecap="round" />
                      <line x1="330" y1="208" x2="318" y2="216" stroke="#111111" strokeWidth="6" strokeLinecap="round" />
                      <ellipse cx="314" cy="218" rx="7" ry="5" fill="#111111" />
                      <text x="324" y="235" fontSize="13">💥</text>
                    </g>
                  )}

                  {/* Right Leg: Step 5 progression */}
                  {mistakeCount < 5 ? (
                    /* Shackled down */
                    <g>
                      <line x1="370" y1="176" x2="372" y2="218" stroke="#111111" strokeWidth="6" strokeLinecap="round" />
                      <rect x="366" y="210" width="12" height="8" rx="2" fill="#475569" stroke="#111111" strokeWidth="2" />
                      <ellipse cx="374" cy="224" rx="7" ry="5" fill="#111111" />
                    </g>
                  ) : (
                    /* Right leg kicked loose */
                    <g>
                      <line x1="370" y1="176" x2="388" y2="208" stroke="#111111" strokeWidth="6" strokeLinecap="round" />
                      <line x1="388" y1="208" x2="402" y2="216" stroke="#111111" strokeWidth="6" strokeLinecap="round" />
                      <ellipse cx="406" cy="218" rx="7" ry="5" fill="#111111" />
                      <text x="390" y="235" fontSize="13">💥</text>
                    </g>
                  )}

                  {/* Victory overlay on captive: Maximum security containment */}
                  {isWon && (
                    <g transform="translate(315, 110)">
                      <rect x="0" y="0" width="90" height="42" rx="8" fill="#22C55E" stroke="#111111" strokeWidth="3" />
                      <text x="45" y="18" textAnchor="middle" fontSize="11" fontWeight="900" fill="#000000">
                        🔒 LOCKED 🔒
                      </text>
                      <text x="45" y="32" textAnchor="middle" fontSize="9" fontWeight="900" fill="#000000">
                        CONTAINED!
                      </text>
                    </g>
                  )}
                </g>
              </g>
            ) : (
              /* 
                STEP 6 / BREAKOUT FAILURE ANIMATION:
                Rope breaks with snapped fibers, captive lands on the platform and charges in full sprint!
              */
              <g>
                {/* Snapped rope remnant hanging from top beam */}
                <line x1="360" y1="52" x2="360" y2="78" stroke="#B45309" strokeWidth="6" strokeLinecap="round" />
                <line x1="357" y1="78" x2="355" y2="85" stroke="#B45309" strokeWidth="2" />
                <line x1="360" y1="78" x2="361" y2="87" stroke="#B45309" strokeWidth="2" />
                <line x1="363" y1="78" x2="365" y2="84" stroke="#B45309" strokeWidth="2" />
                <text x="375" y="80" fontSize="12" fontWeight="900" fill="#EF4444" stroke="#FFFFFF" strokeWidth="0.5">
                  *SNAP!*
                </text>

                {/* Animated Escaped Captive Running Across the Platform */}
                <g className="animate-captive-run" transform="translate(360, 160)">
                  {/* Dust cloud behind runner */}
                  <circle cx="-32" cy="78" r="10" fill="#CBD5E1" opacity="0.8" />
                  <circle cx="-46" cy="74" r="8" fill="#CBD5E1" opacity="0.6" />
                  <circle cx="-56" cy="80" r="6" fill="#CBD5E1" opacity="0.4" />

                  {/* Angry head charging forward */}
                  <circle cx="22" cy="18" r="19" fill="#FCA5A5" stroke="#111111" strokeWidth="3.5" />
                  {/* Fierce angled robber mask */}
                  <path d="M 6 12 Q 22 17 38 12 Q 38 21 22 23 Q 6 21 6 12 Z" fill="#111111" />
                  {/* Glowing red angry eyes */}
                  <circle cx="16" cy="16" r="3" fill="#EF4444" />
                  <circle cx="28" cy="16" r="3" fill="#EF4444" />
                  {/* Shouting angry mouth with teeth */}
                  <path d="M 12 28 Q 22 36 32 28 Z" fill="#FFFFFF" stroke="#111111" strokeWidth="2" />

                  {/* Striped Torso leaning forward in full sprint */}
                  <rect
                    x="0"
                    y="36"
                    width="42"
                    height="46"
                    rx="4"
                    fill="#FFFFFF"
                    stroke="#111111"
                    strokeWidth="3.5"
                    transform="skewX(-15)"
                  />
                  <rect x="2" y="44" width="40" height="6" fill="#111111" transform="skewX(-15)" />
                  <rect x="4" y="56" width="40" height="6" fill="#111111" transform="skewX(-15)" />
                  <rect x="6" y="68" width="40" height="6" fill="#111111" transform="skewX(-15)" />

                  {/* Running Arms (pumping fists) */}
                  <line x1="8" y1="46" x2="-22" y2="28" stroke="#111111" strokeWidth="7" strokeLinecap="round" />
                  <circle cx="-24" cy="26" r="6" fill="#FED7AA" stroke="#111111" strokeWidth="2" />
                  <line x1="36" y1="46" x2="58" y2="62" stroke="#111111" strokeWidth="7" strokeLinecap="round" />
                  <circle cx="60" cy="64" r="6" fill="#FED7AA" stroke="#111111" strokeWidth="2" />

                  {/* Running Legs */}
                  <line x1="6" y1="80" x2="-20" y2="100" stroke="#111111" strokeWidth="7" strokeLinecap="round" />
                  <ellipse cx="-24" cy="102" rx="8" ry="5" fill="#111111" />
                  <line x1="28" y1="80" x2="48" y2="98" stroke="#111111" strokeWidth="7" strokeLinecap="round" />
                  <ellipse cx="52" cy="100" rx="8" ry="5" fill="#111111" />

                  {/* Speech alert above runner */}
                  <g transform="translate(-45, -28)">
                    <rect x="0" y="0" width="150" height="26" rx="6" fill="#EF4444" stroke="#111111" strokeWidth="2.5" />
                    <text x="75" y="17" textAnchor="middle" fontSize="11" fontWeight="900" fill="#FFFFFF">
                      HUNTING YOU DOWN! 💀
                    </text>
                  </g>
                </g>
              </g>
            )}
          </svg>
        </div>

        {/* Word Display Letter Slots (Ultra-High Contrast) */}
        <div className="flex justify-center items-center gap-2 md:gap-3 my-5 flex-wrap">
          {word.split('').map((letter, idx) => {
            const isRevealed = guessedLetters.has(letter) || isEscaped;
            return (
              <div
                key={idx}
                className={`w-11 h-16 md:w-14 md:h-20 flex items-center justify-center font-heading text-2xl md:text-4xl border-4 border-black rounded-xl shadow-[4px_4px_0px_#000] select-none ${
                  isRevealed
                    ? 'bg-[var(--yellow)] text-black'
                    : 'bg-white text-neutral-400 font-black border-dashed'
                }`}
              >
                {isRevealed ? letter : '_'}
              </div>
            );
          })}
        </div>

        {/* Clue Banner */}
        <div className="max-w-md mx-auto p-2.5 bg-yellow-100 border-2 border-black rounded-lg text-center text-xs md:text-sm text-neutral-900 font-bold mb-5 shadow-[2px_2px_0px_#000]">
          💡 CLUE: {currentWordObj.hint}
        </div>

        {/* Readable A-Z Keyboard in 3 balanced rows */}
        <div className="space-y-2 max-w-2xl mx-auto mb-4">
          {KEYBOARD_ROWS.map((row, rowIdx) => (
            <div key={rowIdx} className="flex justify-center gap-1.5 md:gap-2">
              {row.map((letter) => {
                const isGuessed = guessedLetters.has(letter);
                const isMatch = isGuessed && word.includes(letter);
                const isWrong = isGuessed && !word.includes(letter);

                return (
                  <button
                    key={letter}
                    type="button"
                    disabled={isGuessed || isResolved}
                    onClick={() => handleGuess(letter)}
                    className={`flex-1 max-w-[54px] py-2.5 text-sm md:text-base font-heading border-2 border-black rounded-lg shadow-[2px_2px_0px_#000] active:translate-x-0.5 active:translate-y-0.5 transition-all cursor-pointer ${
                      isMatch
                        ? 'bg-[var(--green)] text-black font-black'
                        : isWrong
                        ? 'bg-neutral-200 text-neutral-400 line-through opacity-50 cursor-not-allowed border-neutral-400'
                        : 'bg-white text-black hover:bg-yellow-200'
                    }`}
                  >
                    {letter}
                  </button>
                );
              })}
            </div>
          ))}
        </div>

        {/* Outcome Results Panel */}
        {isResolved && (
          <div
            className={`p-5 border-4 border-black rounded-xl shadow-[6px_6px_0px_#000] space-y-3 text-center animate-slide-down ${
              isWon ? 'bg-green-100' : 'bg-red-100'
            }`}
          >
            <div className="font-heading text-lg md:text-2xl">
              {isWon ? (
                <span className="text-green-900 flex items-center justify-center gap-2">
                  <ShieldCheck className="w-6 h-6 text-green-700" />
                  YOU CONTAINED THE CAPTIVE! VICTORY!
                </span>
              ) : (
                <span className="text-red-800 flex items-center justify-center gap-2">
                  <Skull className="w-6 h-6 text-red-600" />
                  THE CAPTIVE BROKE FREE & HUNTED YOU DOWN!
                </span>
              )}
            </div>

            <p className="text-sm md:text-base text-neutral-900 font-bold">
              The secret word was: <span className="underline uppercase tracking-wider">{word}</span>.
            </p>

            <div className="flex justify-center gap-3 pt-2 flex-wrap">
              <NeoButton variant="yellow" size="lg" onClick={() => goNext()}>
                <span>CONTINUE TO THE LABYRINTH</span>
                <ArrowRight className="w-5 h-5 ml-1.5 inline" />
              </NeoButton>

              <button
                type="button"
                onClick={handleRestart}
                className="px-4 py-2 text-xs font-heading border-2 border-black rounded-lg bg-white text-black shadow-[2px_2px_0px_#000] hover:bg-neutral-200 transition-colors inline-flex items-center gap-1.5 cursor-pointer"
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
