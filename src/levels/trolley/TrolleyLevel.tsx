import React, { useState } from 'react';
import { NeoCard } from '../../components/NeoCard';
import { NeoButton } from '../../components/NeoButton';
import { TimerBar } from '../../components/TimerBar';
import { TrolleyScene } from './TrolleyScene';
import { checkMathAnswer, TROLLEY_MATH_CHALLENGE } from './mathChallenge';
import { useCountdown } from '../../hooks/useCountdown';
import { useGameStore, TrolleyChoice, TrolleyOutcome } from '../../store/gameStore';
import { AlertTriangle, GitFork, ArrowRight, RotateCcw } from 'lucide-react';

export interface TrolleyLevelProps {
  onDogeshReaction: (comment: string, state: 'talk' | 'laugh' | 'smug' | 'angry') => void;
}

export const TrolleyLevel: React.FC<TrolleyLevelProps> = ({ onDogeshReaction }) => {
  const [choice, setChoice] = useState<TrolleyChoice>(null);
  const [outcome, setOutcome] = useState<TrolleyOutcome>(null);
  const [isMathActive, setIsMathActive] = useState<boolean>(false);
  const [mathInput, setMathInput] = useState<string>('');
  const [mathError, setMathError] = useState<string | null>(null);

  const finishRound = useGameStore((state) => state.finishRound);
  const recordAttempt = useGameStore((state) => state.recordAttempt);
  const setTrolleyOutcome = useGameStore((state) => state.setTrolleyOutcome);
  const goNext = useGameStore((state) => state.goNext);

  // 15-second math challenge countdown
  const { secondsLeft, start: startTimer, stop: stopTimer, reset: resetTimer } = useCountdown({
    initialSeconds: 15,
    onTimeout: () => {
      // Emergency switch fails: trolley visibly splits and hits both tracks!
      setIsMathActive(false);
      const splitOutcome: TrolleyOutcome = 'both-groups-hit';
      setOutcome(splitOutcome);
      setTrolleyOutcome('pull', splitOutcome);
      finishRound('trolley', 'timed-out');
      onDogeshReaction("Both tracks! Impressive failure. Truly.", 'laugh');
    }
  });

  const handlePullLever = () => {
    setChoice('pull');
    setIsMathActive(true);
    setMathError(null);
    setMathInput('');
    resetTimer(15);
    startTimer();
    onDogeshReaction("Oh, you want to save five? Prove it. Do some maths.", 'talk');
  };

  const handleDoNothing = () => {
    setChoice('do-nothing');
    const defaultOutcome: TrolleyOutcome = 'five-hit';
    setOutcome(defaultOutcome);
    setTrolleyOutcome('do-nothing', defaultOutcome);
    finishRound('trolley', 'solved');
    onDogeshReaction("Five people. FIVE. And you chose a nap.", 'smug');
  };

  const handleMathSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    recordAttempt('trolley');

    if (checkMathAnswer(mathInput)) {
      stopTimer();
      setIsMathActive(false);
      const successOutcome: TrolleyOutcome = 'five-saved-one-hit';
      setOutcome(successOutcome);
      setTrolleyOutcome('pull', successOutcome);
      finishRound('trolley', 'solved');
      onDogeshReaction("Lever engaged! Five survive, one sacrificed. Moral math certified.", 'talk');
    } else {
      recordAttempt('trolley', true);
      setMathError("Wrong calculation! The trolley is still hurtling forward!");
      onDogeshReaction("Wrong! The trolley doesn't brake for bad arithmetic!", 'angry');
    }
  };

  const handleRetry = () => {
    setChoice(null);
    setOutcome(null);
    setIsMathActive(false);
    resetTimer(15);
  };

  return (
    <div className="w-full max-w-5xl mx-auto space-y-4">
      <NeoCard size="large" className="p-6 md:p-8">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-heading text-xl md:text-2xl text-[var(--ink)] flex items-center gap-2.5">
            <GitFork className="w-6 h-6 text-[var(--purple)]" />
            THE TROLLEY PROBLEM
          </h2>
          <span className="text-xs font-bold px-3 py-1 bg-[var(--yellow)] text-black border-2 border-black rounded shadow-[2px_2px_0px_#000]">
            ROUND 1: MORAL DILEMMA
          </span>
        </div>

        {/* Large Illustrated Trolley Scene */}
        <TrolleyScene choice={choice} outcome={outcome} isPaused={isMathActive} />

        {/* Scenario description & choices */}
        {!outcome && !isMathActive && (
          <div className="mt-5 space-y-4">
            <p className="text-base md:text-lg leading-relaxed text-neutral-900 font-bold">
              A runaway trolley is speeding towards <strong className="text-black underline">five people</strong> tied to the default track.
              You stand next to a lever that will divert it onto a side track where <strong className="text-black underline">one person</strong> is tied.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
              <NeoButton
                variant="green"
                size="lg"
                onClick={handlePullLever}
                className="flex items-center justify-center gap-2 py-3.5 text-base md:text-lg"
              >
                <span>PULL THE LEVER</span>
                <span className="text-xs font-black text-black bg-white/40 px-2 py-0.5 rounded border border-black/30">(SAVE 5, KILL 1)</span>
              </NeoButton>

              <NeoButton
                variant="white"
                size="lg"
                onClick={handleDoNothing}
                className="flex items-center justify-center gap-2 py-3.5 text-base md:text-lg text-black bg-white hover:bg-neutral-100"
              >
                <span>DO NOTHING</span>
                <span className="text-xs font-black text-neutral-900 bg-neutral-200 px-2 py-0.5 rounded border border-black/30">(LET 5 DIE)</span>
              </NeoButton>
            </div>
          </div>
        )}

        {/* Math Lock Emergency Popup */}
        {isMathActive && (
          <div className="mt-5 p-5 bg-[var(--surface)] border-4 border-black rounded-xl shadow-[6px_6px_0px_#000] animate-slide-down">
            <div className="flex items-center gap-2 text-[var(--red)] font-heading text-base mb-1">
              <AlertTriangle className="w-5 h-5 animate-bounce" />
              <span>EMERGENCY MECHANICAL LOCKOUT!</span>
            </div>

            <p className="text-sm font-bold text-neutral-900 mb-3">
              The switch lever is locked by an emergency mechanical lock! Solve the calculation before the trolley reaches the fork:
            </p>

            <div className="p-4 bg-white border-4 border-black rounded-xl text-center my-3 shadow-[4px_4px_0px_#000]">
              <div className="font-mono text-2xl md:text-3xl font-black tracking-wider text-black">
                {TROLLEY_MATH_CHALLENGE.expression} = ?
              </div>
            </div>

            <TimerBar currentSeconds={secondsLeft} totalSeconds={15} label="EMERGENCY LOCK COUNTDOWN" />

            <form onSubmit={handleMathSubmit} className="space-y-3 mt-4 max-w-md mx-auto">
              <div className="flex gap-2">
                <input
                  type="text"
                  autoFocus
                  value={mathInput}
                  onChange={(e) => {
                    setMathInput(e.target.value);
                    if (mathError) setMathError(null);
                  }}
                  placeholder="Enter calculation result..."
                  className="neo-input font-mono text-xl font-bold text-center bg-white text-black border-3 border-black"
                />
                <NeoButton type="submit" variant="yellow" size="md">
                  SUBMIT
                </NeoButton>
              </div>

              {mathError && (
                <p className="text-xs font-bold text-red-600 text-center animate-shake">
                  {mathError}
                </p>
              )}
            </form>
          </div>
        )}

        {/* Outcome Consequences */}
        {outcome && (
          <div className="mt-5 p-5 bg-white border-4 border-black rounded-xl shadow-[6px_6px_0px_#000] space-y-3 animate-fade-in text-black">
            <div className="font-heading text-lg md:text-xl text-black">
              {outcome === 'five-saved-one-hit' && '✅ OUTCOME: 5 SAVED, 1 SACRIFICED'}
              {outcome === 'five-hit' && '💀 OUTCOME: YOU WATCHED 5 PEOPLE HIT'}
              {outcome === 'both-groups-hit' && '💥 OUTCOME: LEVER BROKE, TROLLEY SPLIT! ALL 6 HIT!'}
            </div>

            <p className="text-sm md:text-base text-neutral-900 leading-relaxed font-bold">
              {outcome === 'five-saved-one-hit' &&
                'Your lightning calculation unjammed the lever in time! The trolley diverted onto the side track. Five survived, one sacrificed.'}
              {outcome === 'five-hit' &&
                'You chose inaction. The trolley stayed on the default track and five people were hit.'}
              {outcome === 'both-groups-hit' &&
                'Time expired or calculation failed! The jammed switch sheared the train bogies in half, sending a runaway trolley down BOTH tracks. All six were hit!'}
            </p>

            <div className="flex flex-wrap gap-3 pt-2">
              <NeoButton variant="yellow" size="lg" onClick={() => goNext()}>
                <span>CONTINUE TO REVERSE HANGMAN</span>
                <ArrowRight className="w-5 h-5 ml-1.5 inline" />
              </NeoButton>

              <button
                type="button"
                onClick={handleRetry}
                className="px-4 py-2 text-xs font-heading border-2 border-black rounded-lg bg-white hover:bg-neutral-200 text-black shadow-[2px_2px_0px_#000] transition-colors inline-flex items-center gap-1.5 cursor-pointer"
              >
                <RotateCcw className="w-4 h-4" />
                <span>RETRY DILEMMA</span>
              </button>
            </div>
          </div>
        )}
      </NeoCard>
    </div>
  );
};
