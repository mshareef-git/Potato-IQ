import React, { useState, useRef, useEffect } from 'react';
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
  const timerRef = useRef<NodeJS.Timeout | null>(null);

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

    // Auto-advance after 3 seconds or player can click Continue
    timerRef.current = setTimeout(() => {
      onComplete(nickname);
    }, 3000);
  };

  const handleContinueImmediately = () => {
    if (timerRef.current) clearTimeout(timerRef.current);
    if (assignedNickname) {
      onComplete(assignedNickname);
    }
  };

  useEffect(() => {
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, []);

  return (
    <div className="space-y-6 py-2">
      {assignedNickname ? (
        /* Full-Focus Large Reveal State: YOUR NAME IS: [NAME] */
        <div className="p-8 md:p-12 bg-[var(--yellow)] text-black border-4 border-black shadow-[8px_8px_0px_#000] rounded-2xl text-center space-y-5 animate-scale-in">
          <div className="font-heading text-lg md:text-2xl uppercase tracking-widest text-neutral-800">
            YOUR NAME IS:
          </div>
          <div className="text-3xl md:text-5xl lg:text-6xl font-heading text-black tracking-tight leading-tight uppercase underline decoration-4 decoration-black">
            {assignedNickname}
          </div>
          <p className="text-sm md:text-base font-bold text-neutral-800 italic pt-2">
            "Your previous name was too functional. Fixed it."
          </p>
          <div className="pt-3 max-w-xs mx-auto">
            <NeoButton variant="white" fullWidth size="md" onClick={handleContinueImmediately}>
              CONTINUE →
            </NeoButton>
          </div>
        </div>
      ) : (
        <>
          <div className="text-center">
            <h2 className="font-heading text-2xl md:text-3xl text-black mb-2">
              STEP 1: IDENTIFY YOURSELF
            </h2>
            <p className="text-base text-neutral-900 font-semibold">
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
