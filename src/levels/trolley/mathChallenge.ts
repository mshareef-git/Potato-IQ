export interface MathChallenge {
  prompt: string;
  expression: string;
  correctAnswer: number;
  acceptedVariants: string[];
}

export const TROLLEY_MATH_CHALLENGE: MathChallenge = {
  prompt: "EMERGENCY OVERRIDE CALCULATION:",
  expression: "(8 × 7) - (36 ÷ 4) + 13",
  correctAnswer: 60,
  acceptedVariants: ["60"]
};

export function checkMathAnswer(input: string): boolean {
  const normalized = input.trim();
  const parsed = parseInt(normalized, 10);
  return parsed === TROLLEY_MATH_CHALLENGE.correctAnswer || TROLLEY_MATH_CHALLENGE.acceptedVariants.includes(normalized);
}
