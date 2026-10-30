import React, { useState } from 'react';
import { NeoButton } from '../../components/NeoButton';
import { isPasswordAccepted } from './WeakPasswordRules';
import { Lock, AlertCircle, CheckCircle2 } from 'lucide-react';

export interface PasswordStepProps {
  onComplete: () => void;
  onDogeshReaction: (comment: string, state: 'talk' | 'laugh' | 'smug' | 'angry') => void;
}

export const PasswordStep: React.FC<PasswordStepProps> = ({ onComplete, onDogeshReaction }) => {
  const [password, setPassword] = useState('');
  const [feedback, setFeedback] = useState<{ message: string; isError: boolean } | null>(null);
  const [isSuccess, setIsSuccess] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!password.trim()) {
      setFeedback({ message: "Blank passwords are not permitted. Even potato security has standards.", isError: true });
      onDogeshReaction("Blank? You couldn't even type '123'?", 'angry');
      return;
    }

    const result = isPasswordAccepted(password);

    if (result.accepted) {
      setIsSuccess(true);
      setFeedback({ message: "Password accepted! Weakness verified.", isError: false });
      onDogeshReaction("Password strength: wet tissue. Perfect.", 'talk');

      // Clear local memory and advance
      setTimeout(() => {
        setPassword('');
        onComplete();
      }, 1400);
    } else {
      setFeedback({ message: "Too strong! Dumb it down.", isError: true });
      onDogeshReaction("Too strong! Dumb it down.", 'smug');
    }
  };

  return (
    <div className="space-y-5 max-w-md mx-auto py-2">
      <div className="text-center">
        <h2 className="font-heading text-2xl md:text-3xl text-black mb-2">
          STEP 2: SET PASSWORD
        </h2>
        <p className="text-base text-neutral-900 font-semibold">
          Create the strongest password possible.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="relative">
          <input
            type="password"
            autoFocus
            value={password}
            onChange={(e) => {
              setPassword(e.target.value);
              if (feedback) setFeedback(null);
            }}
            placeholder="Enter password..."
            disabled={isSuccess}
            className="neo-input text-center text-xl font-mono tracking-widest py-3 bg-white text-black"
          />
          <Lock className="w-5 h-5 absolute right-3 top-4 text-neutral-500 pointer-events-none" />
        </div>

        {feedback && (
          <div
            className={`flex items-center justify-center gap-1.5 text-xs md:text-sm font-bold text-center p-2.5 rounded-lg border-2 border-black ${
              feedback.isError
                ? 'bg-red-100 text-red-800'
                : 'bg-green-100 text-green-900'
            }`}
          >
            {feedback.isError ? (
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
            ) : (
              <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
            )}
            <span>{feedback.message}</span>
          </div>
        )}

        <NeoButton
          type="submit"
          variant={isSuccess ? 'green' : 'yellow'}
          fullWidth
          size="lg"
          disabled={isSuccess}
        >
          {isSuccess ? 'PASSWORD ACCEPTED ✓' : 'VERIFY STRENGTH'}
        </NeoButton>
      </form>
    </div>
  );
};
