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

  const hasTyped = password.length > 0;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const result = isPasswordAccepted(password);

    if (result.accepted) {
      setIsSuccess(true);
      setFeedback({ message: "Password accepted! Weakness verified.", isError: false });
      onDogeshReaction("Password strength: wet tissue. Perfect.", 'talk');

      // Clear local memory and advance
      setTimeout(() => {
        setPassword('');
        onComplete();
      }, 1500);
    } else {
      setFeedback({ message: "Too strong! Dumb it down.", isError: true });
      onDogeshReaction("Too strong. Dumb it down.", 'smug');
    }
  };

  return (
    <div className="space-y-5 max-w-md mx-auto py-2">
      <div className="text-center">
        <h2 className="font-heading text-2xl md:text-3xl text-[var(--ink)] mb-2">
          STEP 2: SET PASSWORD
        </h2>
        <p className="text-base text-neutral-700 dark:text-neutral-300">
          Create the strongest password possible.
        </p>
      </div>

      {/* Only revealed AFTER user types */}
      {hasTyped && (
        <div className="p-3.5 bg-[var(--pink)] text-white border-3 border-black shadow-[4px_4px_0px_#000] rounded-xl text-xs md:text-sm font-bold text-center animate-slide-down">
          ⚠️ PLOT TWIST: Only notoriously WEAK passwords are accepted!
          <div className="text-xs font-normal text-pink-100 mt-1">
            Try something like 1234 or admin.
          </div>
        </div>
      )}

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
            className="neo-input text-center text-xl font-mono tracking-widest py-3"
          />
          <Lock className="w-5 h-5 absolute right-3 top-4 text-neutral-400 pointer-events-none" />
        </div>

        {feedback && (
          <div
            className={`flex items-center justify-center gap-1.5 text-xs md:text-sm font-bold text-center p-2.5 rounded-lg border-2 border-black ${
              feedback.isError
                ? 'bg-red-100 text-red-700 dark:bg-red-950/60 dark:text-red-300'
                : 'bg-green-100 text-green-800 dark:bg-green-950/60 dark:text-green-300'
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
