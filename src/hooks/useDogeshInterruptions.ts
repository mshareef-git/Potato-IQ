import { useState, useEffect, useCallback, useRef } from 'react';
import { DogeshState } from '../components/DogeshAvatar';
import { DogeshEvent, getRandomComment } from '../data/dogeshComments';
import { GIF_ASSETS, GifAssetDef } from '../data/assetManifest';
import { FloatingGifInstance, GifSizeBand } from '../components/DraggableGif';
import { audioController } from '../utils/audioController';

export interface UseDogeshOptions {
  currentScreen: string;
  allowBlocker?: boolean;
}

// Track recently spawned GIFs to prevent duplicate ads or rapid repetition
const recentGifIds: string[] = [];

const PUNCH_OFFENDED_COMMENTS = [
  "OW! MY REGAL SNOUT! TAKE THIS CURSED GIF AS RETALIATION!",
  "PHYSICAL VIOLENCE?! EAT FLOATING GIF DISTRACTION, PEASANT!",
  "A DIRECT HIT! I'M UNLEASHING MY SPECIAL WEAPON GIF!",
  "HOW UNCOUTH! YOU STRIKE DOGESH, DOGESH SENDS RETALIATION!",
  "MY PAWS! MY DIGNITY! TASTE MY PETTY REVENGE GIF!",
];

export function useDogeshInterruptions({ currentScreen, allowBlocker = true }: UseDogeshOptions) {
  const [dogeshState, setDogeshState] = useState<DogeshState>('idle');
  const [comment, setComment] = useState<string>('Look at you trying your best.');
  const [isMoving, setIsMoving] = useState<boolean>(false);
  const [isBlocking, setIsBlocking] = useState<boolean>(false);
  const [floatingGifs, setFloatingGifs] = useState<FloatingGifInstance[]>([]);

  // Safe Roaming coordinates and dynamic scale (modest size, never stretched)
  const [dogeshPos, setDogeshPos] = useState<{ x: number; y: number }>({
    x: typeof window !== 'undefined' ? Math.max(20, window.innerWidth - 200) : 800,
    y: typeof window !== 'undefined' ? Math.max(100, window.innerHeight - 250) : 500,
  });
  const [dogeshSize, setDogeshSize] = useState<number>(155);

  const screenStartTime = useRef<number>(Date.now());
  const movementTimerRef = useRef<NodeJS.Timeout | null>(null);
  const arrivalTimerRef = useRef<NodeJS.Timeout | null>(null);
  const blockerTimerRef = useRef<NodeJS.Timeout | null>(null);
  const poseResetTimerRef = useRef<NodeJS.Timeout | null>(null);
  const punchCooldownRef = useRef<boolean>(false);
  const gifExpiryIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Close / dismiss individual GIF instance (called immediately on click/tap)
  const closeGif = useCallback((instanceId: string) => {
    setFloatingGifs((prev) => prev.filter((g) => g.instanceId !== instanceId));
  }, []);

  // Update dragged position for that specific GIF
  const updateGifPosition = useCallback((instanceId: string, x: number, y: number) => {
    setFloatingGifs((prev) =>
      prev.map((g) => (g.instanceId === instanceId ? { ...g, x, y } : g))
    );
  }, []);

  // Spawn GIF method — EXCLUSIVELY summoned by Dogesh actions:
  // 1. Dogesh roaming movement
  // 2. Dogesh retaliation when clicked/punched
  // 3. Deliberate game event reactions
  // (NO autonomous independent timer)
  const spawnGifByDogesh = useCallback((preferredCategory?: GifAssetDef['category']) => {
    setFloatingGifs((prev) => {
      // At most three floating GIFs should normally be active at once.
      // A special finale may briefly allow up to 5.
      const maxGifs = currentScreen === 'result' ? 5 : 3;

      // Filter eligible candidates to prevent repetition
      let candidates = GIF_ASSETS.filter((g) => !recentGifIds.slice(-3).includes(g.id));
      if (preferredCategory) {
        const catFiltered = candidates.filter((g) => g.category === preferredCategory);
        if (catFiltered.length > 0) candidates = catFiltered;
      }
      if (!candidates.length) candidates = GIF_ASSETS;

      const picked = candidates[Math.floor(Math.random() * candidates.length)];
      recentGifIds.push(picked.id);
      if (recentGifIds.length > 8) recentGifIds.shift();

      // Varied intentional sizes: small, medium, occasional large (capped)
      const sizeChoices: GifSizeBand[] = ['small', 'medium', 'medium', 'large'];
      const sizeBand = sizeChoices[Math.floor(Math.random() * sizeChoices.length)];

      const isMobile = typeof window !== 'undefined' && window.innerWidth < 640;
      let width = 110;
      let height = 110;

      if (sizeBand === 'small') {
        width = isMobile ? 55 : 75;
        height = isMobile ? 55 : 75;
      } else if (sizeBand === 'medium') {
        width = isMobile ? 90 : 130;
        height = isMobile ? 90 : 130;
      } else {
        // Large, capped so it never covers the whole game
        width = isMobile ? 140 : 200;
        height = isMobile ? 140 : 200;
      }

      const screenW = typeof window !== 'undefined' ? window.innerWidth : 1000;
      const screenH = typeof window !== 'undefined' ? window.innerHeight : 700;

      // Spawn along the visible viewport edges, entering from left or right edge.
      // Avoid center answer fields and top navigation controls.
      const spawnOnLeft = Math.random() < 0.5;
      let spawnX: number;
      if (spawnOnLeft) {
        spawnX = Math.floor(Math.random() * 90) + 16;
      } else {
        spawnX = Math.max(16, screenW - width - Math.floor(Math.random() * 90) - 20);
      }
      const spawnY = Math.floor(Math.random() * Math.max(60, screenH - height - 120)) + 76;

      const newInstance: FloatingGifInstance = {
        instanceId: `gif-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
        asset: picked,
        x: spawnX,
        y: spawnY,
        sizeBand,
        width,
        height,
        createdAt: Date.now(),
      };

      // Cap active GIF count: if limit is reached, remove oldest before adding
      const updated = prev.length >= maxGifs ? prev.slice(prev.length - maxGifs + 1) : prev;
      return [...updated, newInstance];
    });
  }, [currentScreen]);

  // Trigger speech comment and facial pose
  const triggerComment = useCallback(
    (event: DogeshEvent, state: DogeshState = 'talk') => {
      const text = getRandomComment(event);
      setComment(text);
      setDogeshState(state);

      if (poseResetTimerRef.current) clearTimeout(poseResetTimerRef.current);
      poseResetTimerRef.current = setTimeout(() => {
        setDogeshState((prev) => (prev === 'cry' || prev === 'walk' ? prev : 'idle'));
      }, 3500);
    },
    []
  );

  // Trigger event reaction from gameplay (e.g. wrong answer)
  const triggerEventReaction = useCallback(
    (event: DogeshEvent, state: DogeshState = 'talk', spawnCategory?: GifAssetDef['category']) => {
      triggerComment(event, state);
      if (spawnCategory && currentScreen !== 'intro' && currentScreen !== 'login') {
        spawnGifByDogesh(spawnCategory);
      }
    },
    [triggerComment, spawnGifByDogesh, currentScreen]
  );

  // Click / punch Dogesh interaction — EXACT REQUIRED SEQUENCE:
  // 1. Click/tap Dogesh
  // 2. Immediately switch to cry pose and play short hurt reaction
  // 3. Move/retreat to a corner of the viewport
  // 4. Retaliation: spawn ONE deadly GIF interruption from existing collection
  // 5. Cooldown so repeatedly clicking him cannot spawn dozens of GIFs
  const shooDogesh = useCallback(
    (customInsult?: string) => {
      if (punchCooldownRef.current) return;
      punchCooldownRef.current = true;

      setIsBlocking(false);
      if (blockerTimerRef.current) clearTimeout(blockerTimerRef.current);

      // 2. Switch to cry pose and trigger hurt audio
      setDogeshState('cry');
      audioController.playSoundEffect('cry');

      const insult =
        customInsult ||
        PUNCH_OFFENDED_COMMENTS[Math.floor(Math.random() * PUNCH_OFFENDED_COMMENTS.length)];
      setComment(insult);

      // 3. Retreat to a safe viewport corner
      if (typeof window !== 'undefined') {
        const retreatToLeft = Math.random() < 0.5;
        const cornerX = retreatToLeft ? 24 : Math.max(24, window.innerWidth - 190);
        const cornerY = Math.max(80, window.innerHeight - 245);
        setDogeshPos({ x: cornerX, y: cornerY });
      }

      // 4. Petty revenge: spawn ONE retaliation GIF after short retreat delay
      setTimeout(() => {
        spawnGifByDogesh();
      }, 400);

      // Revert from cry pose to idle after 2.2s, reset cooldown after 2.8s
      if (poseResetTimerRef.current) clearTimeout(poseResetTimerRef.current);
      poseResetTimerRef.current = setTimeout(() => {
        setDogeshState('idle');
      }, 2200);

      setTimeout(() => {
        punchCooldownRef.current = false;
      }, 2800);
    },
    [spawnGifByDogesh]
  );

  // When round/screen changes, clean up active GIFs and reset blocker
  useEffect(() => {
    screenStartTime.current = Date.now();
    setIsBlocking(false);
    setDogeshState('idle');
    // Clear floating GIFs between rounds to prevent stuck distractions across screens
    setFloatingGifs([]);
  }, [currentScreen]);

  // Optional lifetime cleaner: remove GIFs older than 25 seconds
  useEffect(() => {
    gifExpiryIntervalRef.current = setInterval(() => {
      const now = Date.now();
      setFloatingGifs((prev) => prev.filter((g) => !g.createdAt || now - g.createdAt < 25000));
    }, 4000);

    return () => {
      if (gifExpiryIntervalRef.current) clearInterval(gifExpiryIntervalRef.current);
    };
  }, []);

  // DOGESH ROAMING SCHEDULER:
  // Dogesh periodically roams between safe corner/edge positions.
  // When he moves, his pose switches to 'walk' (dogesh walk.png).
  // When he stops, he returns to 'idle' or taunt.
  useEffect(() => {
    if (currentScreen === 'intro') return;

    const prefersReducedMotion =
      typeof window !== 'undefined' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    const scheduleNextMove = () => {
      // 14 to 22 seconds between roaming movements
      const delay = Math.floor(Math.random() * 8000) + 14000;
      movementTimerRef.current = setTimeout(() => {
        if (prefersReducedMotion) {
          triggerComment('idle', 'talk');
          scheduleNextMove();
          return;
        }

        const screenW = window.innerWidth;
        const screenH = window.innerHeight;

        // Waypoints: safe corners & sides (avoiding center answer field)
        const safeWaypoints = [
          { x: Math.max(20, screenW - 200), y: Math.max(90, screenH - 240) }, // Bottom-right
          { x: 25, y: Math.max(90, screenH - 240) },                         // Bottom-left
          { x: Math.max(20, screenW - 200), y: 85 },                          // Top-right
          { x: 25, y: 85 },                                                   // Top-left
          { x: Math.max(20, screenW - 190), y: Math.floor(screenH / 2) - 80 },// Mid-right
          { x: 25, y: Math.floor(screenH / 2) - 80 },                         // Mid-left
        ];

        const target = safeWaypoints[Math.floor(Math.random() * safeWaypoints.length)];

        // Modest dynamic size variation (proportions maintained, never stretched)
        const isMobile = screenW < 640;
        const nextSize = isMobile
          ? Math.floor(Math.random() * 30) + 100
          : Math.floor(Math.random() * 50) + 140;

        // Start movement: switch pose to 'walk' (uses dogesh walk.png)
        setIsMoving(true);
        setDogeshState('walk');
        setDogeshPos(target);
        setDogeshSize(nextSize);

        // Movement event has ~50% chance to drop a prank GIF
        if (Math.random() < 0.50) {
          setTimeout(() => {
            spawnGifByDogesh();
          }, 900);
        }

        // Arrival after 2.8s
        if (arrivalTimerRef.current) clearTimeout(arrivalTimerRef.current);
        arrivalTimerRef.current = setTimeout(() => {
          setIsMoving(false);
          setDogeshState('idle');

          // Occasional comment upon arrival
          if (Math.random() < 0.45) {
            triggerComment('idle', 'talk');
          }

          // Rare shield block (only if allowed and not on result/intro)
          if (allowBlocker && Math.random() < 0.12 && currentScreen !== 'result') {
            setIsBlocking(true);
            setDogeshState('guard');
            setComment('HALT! Contemplate your life choices.');
            if (blockerTimerRef.current) clearTimeout(blockerTimerRef.current);
            blockerTimerRef.current = setTimeout(() => {
              setIsBlocking(false);
              setDogeshState('idle');
            }, 2500);
          }
        }, 2800);

        scheduleNextMove();
      }, delay);
    };

    scheduleNextMove();

    return () => {
      if (movementTimerRef.current) clearTimeout(movementTimerRef.current);
      if (arrivalTimerRef.current) clearTimeout(arrivalTimerRef.current);
      if (blockerTimerRef.current) clearTimeout(blockerTimerRef.current);
      if (poseResetTimerRef.current) clearTimeout(poseResetTimerRef.current);
    };
  }, [currentScreen, allowBlocker, triggerComment, spawnGifByDogesh]);

  return {
    dogeshState,
    comment,
    dogeshPos,
    dogeshSize,
    isMoving,
    isBlocking,
    floatingGifs,
    triggerComment,
    triggerEventReaction,
    spawnGifByDogesh,
    closeGif,
    updateGifPosition,
    shooDogesh,
    setDogeshState,
  };
}
