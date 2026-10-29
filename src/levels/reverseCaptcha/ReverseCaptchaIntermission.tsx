import React, { useState, useEffect, useRef } from 'react';
import { NeoCard } from '../../components/NeoCard';
import { NeoButton } from '../../components/NeoButton';
import { TimerBar } from '../../components/TimerBar';
import { useCountdown } from '../../hooks/useCountdown';
import { useGameStore } from '../../store/gameStore';
import { Bot, ArrowRight, RotateCcw, Copy, Check } from 'lucide-react';

export interface ReverseCaptchaIntermissionProps {
  onDogeshReaction: (comment: string, state: 'talk' | 'laugh' | 'smug' | 'angry') => void;
}

// Generate random 160-char string
function generateRobotString(): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*';
  let str = '';
  for (let i = 0; i < 160; i++) {
    str += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return str;
}

export const ReverseCaptchaIntermission: React.FC<ReverseCaptchaIntermissionProps> = ({ onDogeshReaction }) => {
  const [targetString, setTargetString] = useState<string>(generateRobotString());
  const [userInput, setUserInput] = useState<string>('');
  const [isCopied, setIsCopied] = useState<boolean>(false);
  const [outcome, setOutcome] = useState<'idle' | 'success' | 'failed'>('idle');

  const completeCaptcha = useGameStore((state) => state.completeCaptcha);
  const startTimeRef = useRef<number>(Date.now());

  // 5-second countdown timer
  const { secondsLeft, start: startTimer, stop: stopTimer, reset: resetTimer } = useCountdown({
    initialSeconds: 5,
    autoStart: true,
    onTimeout: () => {
      if (outcome === 'idle') {
        setOutcome('failed');
        onDogeshReaction("Time's up! Typing speed: certified fleshbag human.", 'laugh');
      }
    }
  });

  const handleCopy = () => {
    navigator.clipboard.writeText(targetString);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    stopTimer();

    const elapsed = (Date.now() - startTimeRef.current) / 1000;

    // Check match and sub-5-second speed
    if (userInput.trim() === targetString.trim() && elapsed <= 5) {
      setOutcome('success');
      onDogeshReaction("Speed: 1,920 WPM. Definitely a machine. Approved.", 'talk');
    } else {
      setOutcome('failed');
      onDogeshReaction("Failed! You typed like a mortal human with ten slow fingers.", 'smug');
    }
  };

  const handleTryAgain = () => {
    setTargetString(generateRobotString());
    setUserInput('');
    setOutcome('idle');
    startTimeRef.current = Date.now();
    resetTimer(5);
    startTimer();
  };

  return (
    <div className="w-full max-w-4xl mx-auto space-y-4">
      <NeoCard size="large" className="p-6 md:p-8 text-center">
        <div className="inline-flex items-center gap-2 p-2 bg-[var(--yellow)] text-black border-2 border-black rounded-lg shadow-[2px_2px_0px_#000] text-xs font-heading mb-4">
          <Bot className="w-4 h-4" />
          <span>INTERMISSION: REVERSE CAPTCHA</span>
        </div>

        <h2 className="font-heading text-2xl md:text-3xl text-[var(--ink)] mb-2 uppercase">
          PROVE YOU ARE A ROBOT
        </h2>

        <p className="text-sm md:text-base text-neutral-800 dark:text-neutral-200 font-semibold mb-4">
          Complete this task at a speed no human should manage (under 5 seconds).
        </p>

        {outcome === 'idle' && (
          <div className="space-y-4 max-w-2xl mx-auto text-left">
            <TimerBar currentSeconds={secondsLeft} totalSeconds={5} label="ROBOT REACTION TIMER (5s)" />

            {/* Target 160-char string */}
            <div className="relative p-3.5 bg-neutral-100 dark:bg-neutral-900 border-3 border-black rounded-xl font-mono text-xs break-all leading-tight text-neutral-800 dark:text-neutral-200 select-all">
              {targetString}
              <button
                type="button"
                onClick={handleCopy}
                className="absolute right-2 top-2 p-1.5 bg-white dark:bg-neutral-800 border-2 border-black rounded shadow-[2px_2px_0px_#000] hover:bg-yellow-200 text-xs font-heading flex items-center gap-1"
                title="Copy to clipboard"
              >
                {isCopied ? <Check className="w-3.5 h-3.5 text-green-600" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{isCopied ? 'COPIED' : 'COPY'}</span>
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-3">
              <input
                type="text"
                autoFocus
                value={userInput}
                onChange={(e) => setUserInput(e.target.value)}
                placeholder="Paste the string instantly..."
                className="neo-input font-mono text-xs py-3"
              />

              <NeoButton type="submit" variant="yellow" fullWidth size="lg">
                SUBMIT AT ROBOT SPEED
              </NeoButton>
            </form>
          </div>
        )}

        {outcome === 'success' && (
          <div className="p-5 bg-green-100 dark:bg-green-950/70 border-4 border-black rounded-xl max-w-md mx-auto space-y-3 animate-slide-down">
            <div className="font-heading text-xl text-green-800 dark:text-green-300">
              🤖 ROBOT IDENTITY VERIFIED!
            </div>
            <p className="text-sm text-neutral-800 dark:text-neutral-200 font-bold">
              Sub-5-second execution detected. Dogesh acknowledges your synthetic superiority.
            </p>
            <div className="pt-2">
              <NeoButton variant="green" size="lg" fullWidth onClick={() => completeCaptcha()}>
                <span>SEE YOUR ROYAL CERTIFICATE</span>
                <ArrowRight className="w-5 h-5 ml-1.5 inline" />
              </NeoButton>
            </div>
          </div>
        )}

        {outcome === 'failed' && (
          <div className="p-5 bg-red-100 dark:bg-red-950/70 border-4 border-black rounded-xl max-w-md mx-auto space-y-3 animate-slide-down">
            <div className="font-heading text-xl text-red-700 dark:text-red-300">
              ⛔ HUMAN DETECTED (TOO SLOW!)
            </div>
            <p className="text-sm text-neutral-800 dark:text-neutral-200 font-bold">
              You failed to paste and submit in under 5 seconds. Classic human latency.
            </p>
            <div className="flex gap-2 justify-center pt-2">
              <button
                type="button"
                onClick={handleTryAgain}
                className="px-4 py-2 text-xs font-heading border-2 border-black rounded-lg bg-white dark:bg-neutral-800 text-[var(--ink)] shadow-[2px_2px_0px_#000] hover:bg-neutral-200 inline-flex items-center gap-1.5"
              >
                <RotateCcw className="w-4 h-4" />
                <span>TRY AGAIN</span>
              </button>

              <NeoButton variant="yellow" size="md" onClick={() => completeCaptcha()}>
                <span>CONTINUE TO CERTIFICATE</span>
                <ArrowRight className="w-4 h-4 ml-1 inline" />
              </NeoButton>
            </div>
          </div>
        )}
      </NeoCard>
    </div>
  );
};
