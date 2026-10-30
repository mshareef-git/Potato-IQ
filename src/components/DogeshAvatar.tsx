import React, { useState, useRef, useEffect, useCallback } from 'react';
import { DOGESH_ASSETS, DogeshPose } from '../data/assetManifest';
import { audioController } from '../utils/audioController';

export type DogeshState = 'idle' | 'attack' | 'guard' | 'laugh' | 'cry' | 'talk' | 'smug' | 'angry' | 'rolling' | 'walk';

export interface DogeshAvatarProps {
  state?: DogeshState;
  size?: number;
  isSpeaking?: boolean;
  onClick?: () => void;
  onPunchReaction?: (comment: string) => void;
  className?: string;
  allowPunch?: boolean;
}

const PUNCH_OFFENDED_COMMENTS = [
  "HEY! THAT WAS UNCALLED FOR!",
  "HOW DARE YOU STRIKE YOUR ROYAL INSTRUCTOR?!",
  "PHYSICAL VIOLENCE?! THAT'S A 50-POINT DEDUCTION FROM YOUR POTATO IQ!",
  "OW! MY REGAL SNOUT! YOU WILL HEAR FROM MY LAWYERS!",
  "A DIRECT HIT! I'M TELLING THE BOARD OF EXAMINERS!",
  "HOW UNCOUTH! DOGESH DEMANDS AN OFFICIAL APOLOGY!",
];

export const DogeshAvatar: React.FC<DogeshAvatarProps> = ({
  state = 'idle',
  size = 280,
  isSpeaking = false,
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

    // ~2.0s cooldown to prevent click/reaction spam
    setTimeout(() => {
      cooldownRef.current = false;
    }, 2000);

    onClick?.();
  }, [allowPunch, onClick, onPunchReaction]);

  // Restrained speaking scale target (1.07), slight bob and tilt, smooth 300ms transition
  const speakingTransform = isSpeaking
    ? 'scale-[1.07] -translate-y-1.5 rotate-[1.5deg]'
    : 'scale-100 translate-y-0 rotate-0';

  return (
    <div
      onClick={handlePointerDown}
      role="button"
      tabIndex={0}
      title={state === 'cry' ? "Dogesh is crying! How could you?!" : "Instructor Dogesh (Click to interact / poke)"}
      className={`relative cursor-pointer select-none transition-all duration-700 ease-out motion-reduce:transform-none pointer-events-auto ${
        isShaking
          ? 'animate-shake scale-110'
          : `${speakingTransform} hover:scale-105 active:scale-95`
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

