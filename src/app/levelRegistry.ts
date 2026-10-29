import React from 'react';
import { ScreenId } from './gameFlow';
import { LoginGauntlet } from '../levels/login/LoginGauntlet';
import { TrolleyLevel } from '../levels/trolley/TrolleyLevel';
import { ReverseHangmanLevel } from '../levels/hangman/ReverseHangmanLevel';
import { MazeLevel } from '../levels/maze/MazeLevel';
import { QuizFromHellLevel } from '../levels/quiz/QuizFromHellLevel';
import { RiddlesSection } from '../levels/riddles/RiddlesSection';
import { ReverseCaptchaIntermission } from '../levels/reverseCaptcha/ReverseCaptchaIntermission';
import { Certificate } from '../components/Certificate';

export interface LevelComponentProps {
  onDogeshReaction: (comment: string, state: 'talk' | 'laugh' | 'smug' | 'angry') => void;
}

export const LEVEL_REGISTRY: Record<ScreenId, React.ComponentType<LevelComponentProps>> = {
  login: LoginGauntlet,
  trolley: TrolleyLevel,
  hangman: ReverseHangmanLevel,
  maze: MazeLevel,
  quiz: QuizFromHellLevel,
  riddles: RiddlesSection,
  captcha: ReverseCaptchaIntermission,
  result: Certificate as unknown as React.ComponentType<LevelComponentProps>
};
