import React, { useState } from 'react';
import { NeoCard } from '../../components/NeoCard';
import { NameStep } from './NameStep';
import { PasswordStep } from './PasswordStep';
import { RotaryDialerStep } from './RotaryDialerStep';
import { AgeStep } from './AgeStep';
import { useGameStore } from '../../store/gameStore';

export interface LoginGauntletProps {
  onDogeshReaction: (comment: string, state: 'talk' | 'laugh' | 'smug' | 'angry') => void;
}

export const LoginGauntlet: React.FC<LoginGauntletProps> = ({ onDogeshReaction }) => {
  const [currentStep, setCurrentStep] = useState<1 | 2 | 3 | 4>(1);
  const [assignedNickname, setAssignedNickname] = useState<string>('');
  const setProfile = useGameStore((state) => state.setProfile);
  const goNext = useGameStore((state) => state.goNext);

  const handleNameComplete = (nickname: string) => {
    setAssignedNickname(nickname);
    setCurrentStep(2);
  };

  const handlePasswordComplete = () => {
    setCurrentStep(3);
  };

  const handlePhoneComplete = () => {
    setCurrentStep(4);
  };

  const handleAgeComplete = (age: number) => {
    setProfile({
      assignedNickname: assignedNickname || 'Smooth Brain',
      age
    });
    goNext();
  };

  return (
    <div className="w-full max-w-2xl mx-auto space-y-4">
      {/* Main Card (No unwanted parody disclaimer banner!) */}
      <NeoCard size="large" className="relative overflow-hidden transition-all duration-300">
        {/* Step indicator */}
        <div className="flex justify-between items-center mb-6 pb-3 border-b-3 border-black">
          <div className="font-heading text-xs md:text-sm uppercase tracking-wider text-[var(--purple)]">
            USELESS LOGIN GAUNTLET — STEP {currentStep} OF 4
          </div>
          <div className="flex gap-2">
            {[1, 2, 3, 4].map((step) => (
              <div
                key={step}
                className={`w-3.5 h-3.5 rounded-full border-2 border-black ${
                  currentStep === step
                    ? 'bg-[var(--yellow)] scale-125 shadow-[1px_1px_0px_#000]'
                    : currentStep > step
                    ? 'bg-[var(--green)]'
                    : 'bg-neutral-300 dark:bg-neutral-700'
                }`}
              />
            ))}
          </div>
        </div>

        {currentStep === 1 && (
          <NameStep
            onComplete={handleNameComplete}
            onDogeshReaction={onDogeshReaction}
          />
        )}

        {currentStep === 2 && (
          <PasswordStep
            onComplete={handlePasswordComplete}
            onDogeshReaction={onDogeshReaction}
          />
        )}

        {currentStep === 3 && (
          <RotaryDialerStep
            onComplete={handlePhoneComplete}
            onDogeshReaction={onDogeshReaction}
          />
        )}

        {currentStep === 4 && (
          <AgeStep
            onComplete={handleAgeComplete}
            onDogeshReaction={onDogeshReaction}
          />
        )}
      </NeoCard>
    </div>
  );
};
