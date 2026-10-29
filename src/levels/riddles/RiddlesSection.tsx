import React, { useState } from 'react';
import { NeoCard } from '../../components/NeoCard';
import { NeoButton } from '../../components/NeoButton';
import { TimerBar } from '../../components/TimerBar';
import { DateDropdown } from './DateDropdown';
import { useCountdown } from '../../hooks/useCountdown';
import { useGameStore } from '../../store/gameStore';
import { Sparkles, Bus, Calendar, Lock, AlertCircle, ArrowRight, FastForward } from 'lucide-react';

export interface RiddlesSectionProps {
  onDogeshReaction: (comment: string, state: 'talk' | 'laugh' | 'smug' | 'angry') => void;
}

export const RiddlesSection: React.FC<RiddlesSectionProps> = ({ onDogeshReaction }) => {
  const currentSub = useGameStore((state) => state.riddleSubIndex);
  const setRiddleSubIndex = useGameStore((state) => state.setRiddleSubIndex);
  const skipRiddleSub = useGameStore((state) => state.skipRiddleSub);
  const profile = useGameStore((state) => state.profile);
  const finishRound = useGameStore((state) => state.finishRound);
  const recordAttempt = useGameStore((state) => state.recordAttempt);
  const goNext = useGameStore((state) => state.goNext);

  const expectedAge = profile?.age ?? 25;

  // -------------------------------------------------------------
  // RIDDLE 1 STATE (Bus Driver)
  // -------------------------------------------------------------
  const [r1Phase, setR1Phase] = useState<'reading' | 'answering'>('reading');
  const [r1AgeInput, setR1AgeInput] = useState<string>('');
  const [r1Error, setR1Error] = useState<string | null>(null);

  const { secondsLeft: r1Seconds, stop: stopR1Timer } = useCountdown({
    initialSeconds: 30,
    autoStart: true,
    onTimeout: () => {
      setR1Phase('answering');
      onDogeshReaction("Story memorization period expired. Calculate now.", 'smug');
    }
  });

  const handleR1Proceed = () => {
    stopR1Timer();
    setR1Phase('answering');
    onDogeshReaction("Confident are we? Calculate.", 'talk');
  };

  const handleR1Submit = (e: React.FormEvent) => {
    e.preventDefault();
    recordAttempt('riddles');

    const parsed = parseInt(r1AgeInput.trim(), 10);
    if (parsed === expectedAge) {
      setR1Error(null);
      onDogeshReaction("YOU REMEMBERED! You were driving the bus.", 'talk');
      setRiddleSubIndex(2);
    } else {
      recordAttempt('riddles', true);
      setR1Error("Wrong! Did you solve the equation? Too bad, that equation was a distraction.");
      onDogeshReaction("Wrong. Read the very first four words of the story again.", 'laugh');
    }
  };

  // -------------------------------------------------------------
  // RIDDLE 2 STATE (Mary's Children)
  // -------------------------------------------------------------
  const [r2Input, setR2Input] = useState<string>('');
  const [r2LockedOut, setR2LockedOut] = useState<boolean>(false);

  const { secondsLeft: lockoutSeconds, start: startLockout, reset: resetLockout } = useCountdown({
    initialSeconds: 10,
    onTimeout: () => {
      setR2LockedOut(false);
      onDogeshReaction("Lockout expired. You may retry now.", 'talk');
    }
  });

  const handleR2Submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (r2LockedOut) return;

    recordAttempt('riddles');
    const trimmed = r2Input.trim();

    // 1. Secret Blank Submit Shortcut
    if (trimmed === '') {
      onDogeshReaction("You submitted NOTHING! Silence is the highest form of mathematics.", 'laugh');
      setRiddleSubIndex(3);
      return;
    }

    // 2. Mathematical value 14/27 ≈ 51.85%
    const normalized = trimmed.replace('%', '');
    const validMath = ['51.8', '51.85', '51.9', '14/27', '0.518', '0.5185'];

    if (validMath.includes(normalized)) {
      onDogeshReaction("Whoa, actual math competence? 14/27 is spot on.", 'talk');
      setRiddleSubIndex(3);
      return;
    }

    // 3. Incorrect non-empty -> 10-second shame lockout!
    recordAttempt('riddles', true);
    setR2LockedOut(true);
    resetLockout(10);
    startLockout();
    onDogeshReaction("WRONG! 10-second penalty box for guessing without doing Bayesian probability!", 'laugh');
  };

  // -------------------------------------------------------------
  // RIDDLE 3 STATE (Logician's Birthday)
  // -------------------------------------------------------------
  const [selectedDate, setSelectedDate] = useState<string>('January 1');
  const [r3Error, setR3Error] = useState<string | null>(null);
  const [r3Solved, setR3Solved] = useState<boolean>(false);

  const handleR3Submit = (e: React.FormEvent) => {
    e.preventDefault();
    recordAttempt('riddles');

    if (selectedDate === 'December 31') {
      setR3Solved(true);
      setR3Error(null);
      finishRound('riddles', 'solved');
      onDogeshReaction("December 31! You cracked the temporal logic. Even I'm impressed.", 'talk');
    } else {
      recordAttempt('riddles', true);
      setR3Error(`Wrong date (${selectedDate}). Think carefully about what today must be.`);
      onDogeshReaction("Wrong! Think about what today's date must be if 'two days ago was last year'.", 'laugh');
    }
  };

  return (
    <div className="w-full max-w-5xl mx-auto space-y-4">
      <NeoCard size="large" className="p-6 md:p-8">
        {/* Header Strip with Sub-question Tracker */}
        <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
          <div className="flex items-center gap-2.5">
            <Sparkles className="w-6 h-6 text-[var(--purple)]" />
            <h2 className="font-heading text-xl md:text-2xl text-[var(--ink)]">
              RIDDLE SECTION — QUESTION {currentSub} OF 3
            </h2>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs font-bold px-3 py-1 bg-[var(--yellow)] text-black border-2 border-black rounded shadow-[2px_2px_0px_#000]">
              ROUND 4: LATERAL LOGIC
            </span>
            <button
              type="button"
              onClick={skipRiddleSub}
              className="text-xs font-heading px-2.5 py-1 bg-neutral-200 dark:bg-neutral-800 text-[var(--ink)] border-2 border-black rounded shadow-[2px_2px_0px_#000] hover:bg-neutral-300 dark:hover:bg-neutral-700 flex items-center gap-1"
              title="Skip this individual riddle"
            >
              <FastForward className="w-3.5 h-3.5" />
              <span>SKIP RIDDLE</span>
            </button>
          </div>
        </div>

        {/* ========================================================================= */}
        {/* SUB-QUESTION 1: BUS DRIVER'S AGE                                          */}
        {/* ========================================================================= */}
        {currentSub === 1 && (
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-sm font-heading text-[var(--purple)]">
              <Bus className="w-4 h-4" />
              <span>RIDDLE 1 OF 3: THE COMMUTER EXPRESS</span>
            </div>

            {r1Phase === 'reading' ? (
              <div className="space-y-4 animate-fade-in">
                <div className="p-5 bg-neutral-100 dark:bg-neutral-900 border-4 border-black rounded-xl shadow-[4px_4px_0px_#000] text-base leading-relaxed text-neutral-900 dark:text-neutral-100">
                  <p className="font-bold mb-3 text-lg">
                    You are driving a bus.
                  </p>
                  <ul className="list-disc list-inside space-y-1.5 text-sm md:text-base font-medium">
                    <li>At the first stop, 12 passengers get on.</li>
                    <li>At the second stop, 5 passengers get off and 8 get on.</li>
                    <li>At the third stop, 4 passengers get off and 11 get on.</li>
                    <li>At the fourth stop, 7 passengers get off and 3 get on.</li>
                    <li>At the fifth stop, 9 passengers get off and 6 get on.</li>
                    <li>At the sixth stop, 4 passengers get off.</li>
                  </ul>
                  <p className="mt-4 font-bold">
                    You then drive the bus to its final destination.
                  </p>
                </div>

                <TimerBar currentSeconds={r1Seconds} totalSeconds={30} label="STORY MEMORIZATION TIMER (30s)" />

                <div className="flex justify-end pt-1">
                  <NeoButton variant="yellow" size="md" onClick={handleR1Proceed}>
                    <span>I'M READY TO ANSWER NOW</span>
                    <ArrowRight className="w-4 h-4 ml-1.5 inline" />
                  </NeoButton>
                </div>
              </div>
            ) : (
              /* Answering panel: Story is completely hidden, decoy math shown */
              <div className="space-y-4 animate-slide-down">
                <div className="p-4 bg-[var(--surface)] border-4 border-black rounded-xl shadow-[4px_4px_0px_#000] text-center">
                  <div className="text-xs font-bold text-neutral-500 uppercase tracking-widest mb-2">
                    CALCULATE FINAL PASSENGER HARMONIC:
                  </div>
                  <div className="p-3 bg-neutral-100 dark:bg-neutral-900 border-2 border-black rounded-lg font-mono text-xl md:text-2xl font-black text-[var(--purple)]">
                    (x² - 9) / (x - 3) + √144 = 2x + 9, &nbsp; x ≠ 3
                  </div>
                </div>

                <div className="text-center font-heading text-xl md:text-2xl text-[var(--ink)] my-3">
                  WHAT IS THE BUS DRIVER'S AGE?
                </div>

                <form onSubmit={handleR1Submit} className="space-y-4 max-w-sm mx-auto">
                  <input
                    type="text"
                    autoFocus
                    value={r1AgeInput}
                    onChange={(e) => {
                      setR1AgeInput(e.target.value);
                      if (r1Error) setR1Error(null);
                    }}
                    placeholder="Enter driver's age..."
                    className="neo-input font-mono text-center text-2xl font-black py-3"
                  />

                  {r1Error && (
                    <div className="flex items-center gap-1.5 p-3 bg-red-100 dark:bg-red-950/60 text-red-700 dark:text-red-300 border-2 border-black rounded-lg text-xs md:text-sm font-bold animate-shake">
                      <AlertCircle className="w-4 h-4 flex-shrink-0" />
                      <span>{r1Error}</span>
                    </div>
                  )}

                  <NeoButton type="submit" variant="yellow" fullWidth size="lg">
                    SUBMIT AGE
                  </NeoButton>
                </form>
              </div>
            )}
          </div>
        )}

        {/* ========================================================================= */}
        {/* SUB-QUESTION 2: MARY'S TWO CHILDREN                                       */}
        {/* ========================================================================= */}
        {currentSub === 2 && (
          <div className="space-y-5">
            <div className="flex items-center gap-2 text-sm font-heading text-[var(--purple)]">
              <Sparkles className="w-4 h-4" />
              <span>RIDDLE 2 OF 3: PROBABILITY PUZZLE</span>
            </div>

            <div className="p-5 bg-neutral-100 dark:bg-neutral-900 border-4 border-black rounded-xl shadow-[4px_4px_0px_#000] text-base md:text-lg leading-relaxed text-neutral-900 dark:text-neutral-100 font-medium">
              <p className="mb-2">
                Mary has <strong>2 children</strong>.
              </p>
              <p className="mb-2">
                She tells you that <strong>one is a boy born on a Tuesday</strong>.
              </p>
              <p className="font-heading text-lg md:text-xl text-[var(--ink)] mt-4">
                What's the probability the other child is a girl?
              </p>
            </div>

            {r2LockedOut ? (
              <div className="p-5 bg-red-100 dark:bg-red-950/70 border-4 border-black rounded-xl text-center space-y-3 animate-shake">
                <div className="flex items-center justify-center gap-2 text-[var(--red)] font-heading text-lg">
                  <Lock className="w-5 h-5 animate-pulse" />
                  <span>10-SECOND SHAME LOCKOUT!</span>
                </div>
                <p className="text-sm font-bold text-neutral-800 dark:text-neutral-200">
                  Wrong answer! Savor 10 seconds of Dogesh laughing at your statistics skills.
                </p>
                <TimerBar currentSeconds={lockoutSeconds} totalSeconds={10} label="LOCKOUT TIMER" />
              </div>
            ) : (
              /* No hint underneath! Clean input only. */
              <form onSubmit={handleR2Submit} className="space-y-4 max-w-sm mx-auto">
                <input
                  type="text"
                  autoFocus
                  value={r2Input}
                  onChange={(e) => setR2Input(e.target.value)}
                  placeholder="Enter percentage (e.g. 51.8%)"
                  className="neo-input text-center font-mono text-xl font-bold py-3"
                />

                <NeoButton type="submit" variant="yellow" fullWidth size="lg">
                  SUBMIT ANSWER
                </NeoButton>
              </form>
            )}
          </div>
        )}

        {/* ========================================================================= */}
        {/* SUB-QUESTION 3: THE LOGICIAN'S BIRTHDAY                                   */}
        {/* ========================================================================= */}
        {currentSub === 3 && (
          <div className="space-y-5">
            <div className="flex items-center gap-2 text-sm font-heading text-[var(--purple)]">
              <Calendar className="w-4 h-4" />
              <span>RIDDLE 3 OF 3: THE TEMPORAL PARADOX</span>
            </div>

            <div className="p-5 bg-neutral-100 dark:bg-neutral-900 border-4 border-black rounded-xl shadow-[4px_4px_0px_#000] text-base md:text-lg leading-relaxed text-neutral-900 dark:text-neutral-100">
              <p className="mb-2 italic text-neutral-600 dark:text-neutral-400">
                Earlier this year, a logician friend told me a fun fact. She said:
              </p>
              <blockquote className="border-l-4 border-[var(--purple)] pl-3 my-3 font-heading text-lg md:text-xl text-[var(--ink)]">
                "Two days ago, I was 13 years old, but next year I will have my 16th birthday."
              </blockquote>
              <p className="font-heading text-lg text-[var(--ink)] mt-4">
                When is the logician's birthday?
              </p>
            </div>

            {r3Solved ? (
              <div className="p-5 bg-green-100 dark:bg-green-950/70 border-4 border-black rounded-xl text-center space-y-3 animate-slide-down">
                <div className="font-heading text-xl md:text-2xl text-green-800 dark:text-green-300">
                  🎉 ALL RIDDLES SOLVED!
                </div>
                <p className="text-base text-neutral-800 dark:text-neutral-200 font-bold">
                  December 31 is correct! You saw right through the January 1 paradox.
                </p>
                <div className="pt-2">
                  <NeoButton variant="green" size="lg" onClick={() => goNext()}>
                    <span>CONTINUE TO REVERSE CAPTCHA</span>
                    <ArrowRight className="w-5 h-5 ml-1.5 inline" />
                  </NeoButton>
                </div>
              </div>
            ) : (
              <form onSubmit={handleR3Submit} className="space-y-4 max-w-sm mx-auto">
                <div>
                  <label className="block text-xs font-heading uppercase text-neutral-700 dark:text-neutral-300 mb-1.5">
                    Select Birth Date:
                  </label>
                  {/* Single combined date dropdown with subtle December 31 underline */}
                  <DateDropdown value={selectedDate} onChange={setSelectedDate} />
                </div>

                {r3Error && (
                  <div className="flex items-center gap-1.5 p-3 bg-red-100 dark:bg-red-950/60 text-red-700 dark:text-red-300 border-2 border-black rounded-lg text-xs md:text-sm font-bold animate-shake">
                    <AlertCircle className="w-4 h-4 flex-shrink-0" />
                    <span>{r3Error}</span>
                  </div>
                )}

                <NeoButton type="submit" variant="yellow" fullWidth size="lg">
                  VERIFY BIRTHDAY
                </NeoButton>
              </form>
            )}
          </div>
        )}
      </NeoCard>
    </div>
  );
};
