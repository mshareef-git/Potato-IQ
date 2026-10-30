import React, { useState, useRef, useEffect, useCallback } from 'react';
import { DOGESH_ASSETS, DogeshPose } from '../data/assetManifest';
import { audioController } from '../utils/audioController';

export type DogeshState = 'idle' | 'attack' | 'guard' | 'laugh' | 'cry' | 'talk' | 'smug' | 'angry' | 'rolling' | 'walk';

export interface DogeshAvatarProps {
  state?: DogeshState;
  size?: number;
  onClick?: () => void;
  onPunchReaction?: (comment: string) => void;
  className?: string;
  allowPunch?: boolean;
}

const PUNCH_OFFENDED_COMMENTS = [
  "HOW DARE YOU STRIKE YOUR ROYAL INSTRUCTOR?!",
  "PHYSICAL VIOLENCE?! THAT'S A 50-POINT DEDUCTION FROM YOUR POTATO IQ!",
  "OW! MY REGAL SNOUT! YOU WILL HEAR FROM MY LAWYERS!",
  "A DIRECT HIT! I'M TELLING THE BOARD OF EXAMINERS!",
  "HOW UNCOUTH! DOGESH DEMANDS AN OFFICIAL APOLOGY!",
];

export const DogeshAvatar: React.FC<DogeshAvatarProps> = ({
  state = 'idle',
  size = 110,
  onClick,
  onPunchReaction,
  className = '',
  allowPunch = true,
}) => {
  const [isShaking, setIsShaking] = useState<boolean>(false);
  const cooldownRef = useRef<boolean>(false);

  // Map state to actual verified Dogesh asset key
  const resolvePoseKey = (): DogeshPose => {
    switch (state) {
      case 'walk':
        return 'walk';
      case 'attack':
      case 'angry':
        return 'attack';
      case 'guard':
        return 'guard';
      case 'laugh':
      case 'rolling':
      case 'smug':
        return 'laugh';
      case 'cry':
        return 'cry';
      case 'idle':
      case 'talk':
      default:
        return 'base';
    }
  };

  const poseKey = resolvePoseKey();
  const imageSrc = DOGESH_ASSETS[poseKey];

  const handlePointerDown = useCallback(() => {
    if (!allowPunch || cooldownRef.current) {
      onClick?.();
      return;
    }

    // Trigger visual shake and call punch reaction in parent
    cooldownRef.current = true;
    setIsShaking(true);

    const randomInsult =
      PUNCH_OFFENDED_COMMENTS[Math.floor(Math.random() * PUNCH_OFFENDED_COMMENTS.length)];
    onPunchReaction?.(randomInsult);

    // Stop shaking after 400ms
    setTimeout(() => {
      setIsShaking(false);
    }, 400);

    // Cooldown matches Dogesh retreat/retaliation cycle
    setTimeout(() => {
      cooldownRef.current = false;
    }, 2500);

    onClick?.();
  }, [allowPunch, onClick, onPunchReaction]);

  return (
    <div
      onClick={handlePointerDown}
      role="button"
      tabIndex={0}
      title={state === 'cry' ? "Dogesh is crying! How could you?!" : "Instructor Dogesh (Click to interact / poke)"}
      className={`relative cursor-pointer select-none transition-transform duration-200 pointer-events-auto ${
        isShaking ? 'animate-shake scale-110' : 'hover:scale-105 active:scale-95'
      } ${className}`}
      style={{ width: size, height: size }}
    >
      <img
        src={imageSrc}
        alt={`Instructor Dogesh - ${poseKey}`}
        className="w-full h-full object-contain filter drop-shadow-[4px_4px_0px_#111111]"
        draggable={false}
      />

      {/* Impact starburst on hit */}
      {isShaking && (
        <div className="absolute -top-2 -right-2 text-2xl animate-ping select-none pointer-events-none">
          💥
        </div>
      )}
    </div>
  );
};
