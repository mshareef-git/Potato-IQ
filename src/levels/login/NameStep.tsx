import React, { useState } from 'react';
import { NeoButton } from '../../components/NeoButton';
import { getRandomNickname } from '../../data/insultNicknames';

export interface NameStepProps {
  onComplete: (assignedNickname: string) => void;
  onDogeshReaction: (comment: string, state: 'talk' | 'laugh' | 'smug' | 'angry') => void;
}

export const NameStep: React.FC<NameStepProps> = ({ onComplete, onDogeshReaction }) => {
  const [typedName, setTypedName] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [assignedNickname, setAssignedNickname] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = typedName.trim();
    if (!trimmed) {
      setError("Please enter a name, even a fake one.");
      return;
    }
    if (trimmed.length > 30) {
      setError("Name too long. Dogesh can't read more than 30 characters.");
      return;
    }

    const nickname = getRandomNickname();
    setAssignedNickname(nickname);
    onDogeshReaction("I've renamed you. You're welcome.", 'laugh');

    // Remain visible for 2.8 seconds before advancing automatically
    setTimeout(() => {
      onComplete(nickname);
    }, 2800);
  };

  return (
    <div className="space-y-6 py-2">
      {assignedNickname ? (
        /* Full-Focus Large Reveal State */
        <div className="p-8 md:p-12 bg-[var(--yellow)] text-black border-4 border-black shadow-[8px_8px_0px_#000] rounded-2xl text-center space-y-4 animate-scale-in">
          <div className="font-heading text-lg md:text-2xl uppercase tracking-widest text-neutral-800">
            YOUR NAME IS…
          </div>
          <div className="text-3xl md:text-5xl lg:text-6xl font-heading text-black tracking-tight leading-tight uppercase">
            {assignedNickname}
          </div>
          <p className="text-sm md:text-base font-bold text-neutral-800 italic pt-2">
            "That name was too functional. Fixed it."
          </p>
        </div>
      ) : (
        <>
          <div className="text-center">
            <h2 className="font-heading text-2xl md:text-3xl text-[var(--ink)] mb-2">
              STEP 1: IDENTIFY YOURSELF
            </h2>
            <p className="text-base text-neutral-700 dark:text-neutral-300">
              Enter your name, future genius.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5 max-w-md mx-auto">
            <div>
              <input
                type="text"
                autoFocus
                value={typedName}
                onChange={(e) => {
                  setTypedName(e.target.value);
                  if (error) setError(null);
                }}
                placeholder="e.g. Arthur Dent"
                maxLength={30}
                className="neo-input text-center text-xl md:text-2xl font-bold uppercase py-3"
              />
              {error && (
                <p className="text-xs font-bold text-[var(--red)] mt-1.5 text-center animate-shake">
                  {error}
                </p>
              )}
            </div>

            <NeoButton type="submit" variant="yellow" fullWidth size="lg">
              SUBMIT IDENTITY
            </NeoButton>
          </form>
        </>
      )}
    </div>
  );
};
