import React, { useState } from 'react';
import { NeoCard } from '../../components/NeoCard';
import { NeoButton } from '../../components/NeoButton';
import { QUIZ_QUESTIONS, QuizQuestion } from '../../data/quizQuestions';
import { useGameStore } from '../../store/gameStore';
import { HelpCircle, AlertCircle, ArrowRight, Lightbulb } from 'lucide-react';

export interface QuizFromHellLevelProps {
  onDogeshReaction: (comment: string, state: 'talk' | 'laugh' | 'smug' | 'angry') => void;
}

export const QuizFromHellLevel: React.FC<QuizFromHellLevelProps> = ({ onDogeshReaction }) => {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState<number>(0);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [showHint, setShowHint] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isQuestionPassed, setIsQuestionPassed] = useState<boolean>(false);

  const finishRound = useGameStore((state) => state.finishRound);
  const recordAttempt = useGameStore((state) => state.recordAttempt);
  const goNext = useGameStore((state) => state.goNext);

  const question: QuizQuestion = QUIZ_QUESTIONS[currentQuestionIndex];
  const isLastQuestion = currentQuestionIndex === QUIZ_QUESTIONS.length - 1;

  const handleSelectOption = (option: string) => {
    setSelectedOption(option);
    setErrorMsg(null);
  };

  const handleToggleHint = () => {
    setShowHint((prev) => !prev);
    onDogeshReaction(question.hint, 'smug');
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedOption) return;

    recordAttempt('quiz');

    if (selectedOption === question.correctAnswer) {
      setIsQuestionPassed(true);
      setErrorMsg(null);
      onDogeshReaction("Correct! You didn't fall for the obvious trap.", 'talk');
    } else {
      recordAttempt('quiz', true);
      setErrorMsg("INCORRECT! Think through the words carefully.");
      onDogeshReaction("That's wrong! Read the question again without jumping to conclusions.", 'laugh');
    }
  };

  const handleNextQuestion = () => {
    if (isLastQuestion) {
      finishRound('quiz', 'solved', showHint);
      onDogeshReaction("Weird quiz survived. Now prepare for the official riddles.", 'talk');
      goNext();
    } else {
      setCurrentQuestionIndex((prev) => prev + 1);
      setSelectedOption(null);
      setShowHint(false);
      setErrorMsg(null);
      setIsQuestionPassed(false);
    }
  };

  return (
    <div className="w-full max-w-5xl mx-auto space-y-4">
      <NeoCard size="large" className="p-6 md:p-8">
        {/* Header Strip */}
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-heading text-xl md:text-2xl text-[var(--ink)] flex items-center gap-2.5">
            <HelpCircle className="w-6 h-6 text-[var(--purple)]" />
            WEIRD QUIZ
          </h2>
          <span className="text-xs font-bold px-3 py-1 bg-[var(--purple)] text-white border-2 border-black rounded shadow-[2px_2px_0px_#000]">
            QUESTION {currentQuestionIndex + 1} OF {QUIZ_QUESTIONS.length}
          </span>
        </div>

        {/* Question Prompt */}
        <div className="my-5 p-4 bg-neutral-100 dark:bg-neutral-900 border-3 border-black rounded-xl shadow-[4px_4px_0px_#000]">
          <p className="font-heading text-lg md:text-xl text-[var(--ink)] leading-snug">
            {question.prompt}
          </p>
        </div>

        {/* Options */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {question.options.map((opt) => {
              const isSelected = selectedOption === opt;
              return (
                <button
                  key={opt}
                  type="button"
                  disabled={isQuestionPassed}
                  onClick={() => handleSelectOption(opt)}
                  className={`p-4 text-left font-heading text-sm md:text-base border-3 border-black rounded-xl transition-all ${
                    isSelected
                      ? 'bg-[var(--purple)] text-white shadow-[5px_5px_0px_#000] translate-x-1'
                      : 'bg-white dark:bg-neutral-800 text-[var(--ink)] hover:bg-neutral-100 dark:hover:bg-neutral-700 shadow-[4px_4px_0px_#000]'
                  }`}
                >
                  <span className="inline-block w-7 text-neutral-400 font-mono text-lg">
                    {isSelected ? '▶' : '○'}
                  </span>
                  <span>{opt}</span>
                </button>
              );
            })}
          </div>

          {/* Sarcastic Hint Box (Shown only when requested) */}
          {showHint && (
            <div className="p-3.5 bg-yellow-100 dark:bg-yellow-950/60 border-3 border-black rounded-xl text-xs md:text-sm font-bold text-neutral-900 dark:text-yellow-200 animate-slide-down">
              💡 <strong>DOGESH HINT:</strong> "{question.hint}"
            </div>
          )}

          {/* Error Message */}
          {errorMsg && (
            <div className="flex items-center gap-2 p-3 bg-red-100 dark:bg-red-950/60 text-red-700 dark:text-red-300 border-2 border-black rounded-lg text-xs md:text-sm font-bold animate-shake">
              <AlertCircle className="w-5 h-5 flex-shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Action Row */}
          <div className="flex items-center justify-between pt-4 border-t-3 border-black">
            <button
              type="button"
              onClick={handleToggleHint}
              className="text-xs md:text-sm font-bold text-neutral-600 dark:text-neutral-400 hover:text-black dark:hover:text-white inline-flex items-center gap-1.5"
            >
              <Lightbulb className="w-4 h-4 text-yellow-500" />
              <span>{showHint ? 'Hide Hint' : 'Free Unhelpful Hint'}</span>
            </button>

            {isQuestionPassed ? (
              <NeoButton type="button" variant="green" size="lg" onClick={handleNextQuestion}>
                <span>{isLastQuestion ? 'PROCEED TO RIDDLES' : 'NEXT QUESTION'}</span>
                <ArrowRight className="w-5 h-5 ml-1.5 inline" />
              </NeoButton>
            ) : (
              <NeoButton
                type="submit"
                variant="yellow"
                size="lg"
                disabled={!selectedOption}
              >
                SUBMIT ANSWER
              </NeoButton>
            )}
          </div>
        </form>
      </NeoCard>
    </div>
  );
};
