import { useState, useEffect, useCallback, useRef } from 'react';
import { DogeshState } from '../components/DogeshAvatar';
import { DogeshEvent, getRandomComment } from '../data/dogeshComments';

export type DogeshAnchor = 'right-card' | 'left-card' | 'top-right' | 'bottom-right';

export interface UseDogeshOptions {
  currentScreen: string;
  allowBlocker?: boolean;
}

export function useDogeshInterruptions({ currentScreen, allowBlocker = true }: UseDogeshOptions) {
  const [dogeshState, setDogeshState] = useState<DogeshState>('idle');
  const [comment, setComment] = useState<string>('Look at you trying your best.');
  const [anchor, setAnchor] = useState<DogeshAnchor>('right-card');
  const [isBlocking, setIsBlocking] = useState<boolean>(false);
  
  const screenStartTime = useRef<number>(Date.now());
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const blockerTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Trigger a specific comment/state from level actions
  const triggerComment = useCallback((event: DogeshEvent, state: DogeshState = 'talk') => {
    const text = getRandomComment(event);
    setComment(text);
    setDogeshState(state);

    // Auto-revert from talk/laugh/angry back to idle after 4 seconds
    setTimeout(() => {
      setDogeshState((prev) => (prev === state ? 'idle' : prev));
    }, 4000);
  }, []);

  // Player clicks Dogesh to shoo him away
  const shooDogesh = useCallback(() => {
    setIsBlocking(false);
    triggerComment('shooed', 'angry');
    // Move away to corner
    setAnchor('bottom-right');
  }, [triggerComment]);

  // Screen change reset
  useEffect(() => {
    screenStartTime.current = Date.now();
    setIsBlocking(false);
    setDogeshState('idle');
  }, [currentScreen]);

  // Background random scheduler
  useEffect(() => {
    // Check if dogesh interruptions are disabled via URL query param
    const params = new URLSearchParams(window.location.search);
    if (params.get('dogesh') === 'off') {
      return;
    }

    const scheduleNext = () => {
      // 8 to 14 seconds
      const delay = Math.floor(Math.random() * 6000) + 8000;
      timerRef.current = setTimeout(() => {
        const elapsed = (Date.now() - screenStartTime.current) / 1000;
        const roll = Math.random();

        // 50% idle comment
        if (roll < 0.5) {
          triggerComment('idle', 'talk');
        }
        // 30% wander to another anchor
        else if (roll < 0.8) {
          const anchors: DogeshAnchor[] = ['right-card', 'left-card', 'top-right', 'bottom-right'];
          const next = anchors[Math.floor(Math.random() * anchors.length)];
          setAnchor(next);
        }
        // 20% temporary blocker (only if allowed and not in first 5s)
        else if (allowBlocker && elapsed > 5) {
          setIsBlocking(true);
          setDogeshState('point');
          setComment("Don't mind me, just inspecting your choices.");
          
          // Clear block after 2.5 seconds automatically
          blockerTimerRef.current = setTimeout(() => {
            setIsBlocking(false);
            setDogeshState('idle');
          }, 2500);
        }

        scheduleNext();
      }, delay);
    };

    scheduleNext();

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
      if (blockerTimerRef.current) clearTimeout(blockerTimerRef.current);
    };
  }, [triggerComment, allowBlocker]);

  return {
    dogeshState,
    comment,
    anchor,
    isBlocking,
    triggerComment,
    shooDogesh,
    setDogeshState
  };
}
