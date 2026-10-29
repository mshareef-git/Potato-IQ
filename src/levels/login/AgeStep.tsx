import React, { useState } from 'react';
import { NeoButton } from '../../components/NeoButton';

export interface AgeStepProps {
  onComplete: (age: number) => void;
  onDogeshReaction: (comment: string, state: 'talk' | 'laugh' | 'smug' | 'angry') => void;
}

export const AgeStep: React.FC<AgeStepProps> = ({ onComplete, onDogeshReaction }) => {
  const [ageInput, setAgeInput] = useState('');
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const parsed = parseInt(ageInput.trim(), 10);

    if (isNaN(parsed) || !/^\d+$/.test(ageInput.trim())) {
      setError("Whole integers only. No decimals, no fractions, no hieroglyphics.");
      onDogeshReaction("Decimals? Are you 21.75 years old? Be serious.", 'smug');
      return;
    }

    if (parsed < 13 || parsed > 99) {
      setError("Age must be between 13 and 99.");
      if (parsed < 13) {
        onDogeshReaction("Too young! Go play outside before Dogesh reports you.", 'angry');
      } else {
        onDogeshReaction("Over 99? If you are a centenarian playing this, maximum respect.", 'laugh');
      }
      return;
    }

    onDogeshReaction("Remember that number. You'll need it. Sadly.", 'talk');

    // Onboarding complete transition
    setTimeout(() => {
      onComplete(parsed);
    }, 1500);
  };

  return (
    <div className="space-y-4">
      <div className="text-center">
        <h2 className="font-heading text-xl md:text-2xl text-[var(--ink)] mb-1">
          STEP 4: AGE DECLARATION
        </h2>
        <p className="text-sm text-neutral-600 dark:text-neutral-400">
          Enter your current age (13–99).
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4 max-w-[260px] mx-auto">
        <div>
          <input
            type="number"
            autoFocus
            min={13}
            max={99}
            value={ageInput}
            onChange={(e) => {
              setAgeInput(e.target.value);
              if (error) setError(null);
            }}
            placeholder="e.g. 24"
            className="neo-input text-center text-3xl font-heading"
          />
          {error && (
            <p className="text-xs font-bold text-[var(--red)] mt-1.5 text-center animate-shake">
              {error}
            </p>
          )}
        </div>

        <NeoButton type="submit" variant="yellow" fullWidth size="lg">
          START THE TEST 🚀
        </NeoButton>
      </form>
    </div>
  );
};
