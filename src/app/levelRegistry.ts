import React from 'react';
import { ScreenId } from './gameFlow';
import { DogeshIntro } from '../levels/intro/DogeshIntro';
import { LoginGauntlet } from '../levels/login/LoginGauntlet';
import { TrolleyLevel } from '../levels/trolley/TrolleyLevel';
import { ReverseHangmanLevel } from '../levels/hangman/ReverseHangmanLevel';
import { MazeLevel } from '../levels/maze/MazeLevel';
import { RiddlesSection } from '../levels/riddles/RiddlesSection';
import { WebcamRecovery } from '../levels/WebcamRecovery/WebcamRecovery';
import { Certificate } from '../components/Certificate';

export interface LevelComponentProps {
  onDogeshReaction: (comment: string, state: 'talk' | 'laugh' | 'smug' | 'angry', priority?: number) => void;
  onDogeshActivityChange?: (isBusy: boolean) => void;
}


export const LEVEL_REGISTRY: Record<ScreenId, React.ComponentType<LevelComponentProps>> = {
  intro: DogeshIntro as unknown as React.ComponentType<LevelComponentProps>,
  login: LoginGauntlet,
  trolley: TrolleyLevel,
  hangman: ReverseHangmanLevel,
  maze: MazeLevel,
  riddles: RiddlesSection,
  captcha: WebcamRecovery,
  result: Certificate as unknown as React.ComponentType<LevelComponentProps>
};
