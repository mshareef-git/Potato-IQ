import { useState, useEffect, useCallback, useRef } from 'react';
import { DogeshState } from '../components/DogeshAvatar';
import { DogeshEvent, getRandomComment, getRandomCaptchaComment } from '../data/dogeshComments';
import { GIF_ASSETS, GifAssetDef } from '../data/assetManifest';
import { FloatingGifInstance, GifSizeBand } from '../components/DraggableGif';
import { audioController } from '../utils/audioController';

export interface UseDogeshOptions {
  currentScreen: string;
  allowBlocker?: boolean;
}

export type CaptchaCommentPriority = 1 | 2 | 3 | 4 | 5;

// Track recently spawned GIFs to prevent duplicate ads or rapid repetition
const recentGifIds: string[] = [];

const PUNCH_OFFENDED_COMMENTS = [
  "HEY! THAT WAS UNCALLED FOR!",
  "OW! MY REGAL SNOUT! TAKE THIS CURSED GIF AS RETALIATION!",
  "PHYSICAL VIOLENCE?! EAT FLOATING GIF DISTRACTION, PEASANT!",
  "A DIRECT HIT! I'M UNLEASHING MY SPECIAL WEAPON GIF!",
  "HOW UNCOUTH! YOU STRIKE DOGESH, DOGESH SENDS RETALIATION!",
  "MY PAWS! MY DIGNITY! TASTE MY PETTY REVENGE GIF!",
];

// Double the previous base size (~280px-320px), with random variation from small to gigantic
export function getRandomDogeshSize(isMobile: boolean): number {
  const rand = Math.random();
  if (isMobile) {
    if (rand < 0.25) return Math.floor(Math.random() * 25) + 140; // 140 - 165 (small on mobile)
    if (rand < 0.70) return Math.floor(Math.random() * 30) + 195; // 195 - 225 (double on mobile)
    return Math.floor(Math.random() * 30) + 245;                  // 245 - 275 (giant on mobile)
  } else {
    if (rand < 0.25) return Math.floor(Math.random() * 35) + 185; // 185 - 220 (small)
    if (rand < 0.70) return Math.floor(Math.random() * 45) + 285; // 285 - 330 (double standard)
    return Math.floor(Math.random() * 50) + 380;                  // 380 - 430 (giant)
  }
}

export function useDogeshInterruptions({ currentScreen, allowBlocker = true }: UseDogeshOptions) {
  const [dogeshState, setDogeshState] = useState<DogeshState>('idle');
  const [comment, setComment] = useState<string>(
    currentScreen === 'captcha' ? '' : 'Look at you trying your best.'
  );
  const [isMoving, setIsMoving] = useState<boolean>(false);
  const [isBlocking, setIsBlocking] = useState<boolean>(false);
  const [floatingGifs, setFloatingGifs] = useState<FloatingGifInstance[]>([]);

  const isInitialMobile = typeof window !== 'undefined' && window.innerWidth < 640;
  const initialBaseSize = isInitialMobile ? 200 : 290;

  // Safe Roaming coordinates and dynamic scale (modest size, never stretched)
  const [dogeshPos, setDogeshPos] = useState<{ x: number; y: number }>({
    x: typeof window !== 'undefined' ? Math.max(20, window.innerWidth - (isInitialMobile ? 220 : 330)) : 800,
    y: typeof window !== 'undefined' ? Math.max(90, window.innerHeight - (isInitialMobile ? 260 : 390)) : 400,
  });
  const [dogeshSize, setDogeshSize] = useState<number>(initialBaseSize);

  const screenStartTime = useRef<number>(Date.now());
  const movementTimerRef = useRef<NodeJS.Timeout | null>(null);
  const arrivalTimerRef = useRef<NodeJS.Timeout | null>(null);
  const blockerTimerRef = useRef<NodeJS.Timeout | null>(null);
  const poseResetTimerRef = useRef<NodeJS.Timeout | null>(null);
  const punchCooldownRef = useRef<boolean>(false);
  const gifExpiryIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Dedicated CAPTCHA-scoped comment controller refs (isolated to screen === 'captcha')
  const captchaIdleTimerRef = useRef<NodeJS.Timeout | null>(null);
  const captchaDismissTimerRef = useRef<NodeJS.Timeout | null>(null);
  const captchaActivePriorityRef = useRef<number>(99); // 1=critical error/ready, 2=punch, 3=important event, 4=gif, 5=idle, 99=none
  const captchaIsBusyRef = useRef<boolean>(false); // camera initializing or active dragging
  const captchaLastCommentRef = useRef<string>('');

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

  // Spawn GIF method — EXCLUSIVELY summoned by Dogesh actions
  const spawnGifByDogesh = useCallback((preferredCategory?: GifAssetDef['category']) => {
    setFloatingGifs((prev) => {
      const maxGifs = currentScreen === 'result' ? 5 : 3;

      let candidates = GIF_ASSETS.filter((g) => !recentGifIds.slice(-3).includes(g.id));
      if (preferredCategory) {
        const catFiltered = candidates.filter((g) => g.category === preferredCategory);
        if (catFiltered.length > 0) candidates = catFiltered;
      }
      if (!candidates.length) candidates = GIF_ASSETS;

      const picked = candidates[Math.floor(Math.random() * candidates.length)];
      recentGifIds.push(picked.id);
      if (recentGifIds.length > 8) recentGifIds.shift();

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
        width = isMobile ? 140 : 200;
        height = isMobile ? 140 : 200;
      }

      const screenW = typeof window !== 'undefined' ? window.innerWidth : 1000;
      const screenH = typeof window !== 'undefined' ? window.innerHeight : 700;

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

      const updated = prev.length >= maxGifs ? prev.slice(prev.length - maxGifs + 1) : prev;
      return [...updated, newInstance];
    });
  }, [currentScreen]);

  // Standard non-CAPTCHA comment trigger (preserves timing for non-CAPTCHA screens)
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

  // Custom text reaction for non-CAPTCHA levels
  const triggerCustomReaction = useCallback(
    (text: string, state: DogeshState = 'talk', spawnCategory?: GifAssetDef['category']) => {
      setComment(text);
      setDogeshState(state);

      if (poseResetTimerRef.current) clearTimeout(poseResetTimerRef.current);
      poseResetTimerRef.current = setTimeout(() => {
        setDogeshState((prev) => (prev === 'cry' || prev === 'walk' ? prev : 'idle'));
      }, 3500);

      if (spawnCategory && currentScreen !== 'intro' && currentScreen !== 'login') {
        spawnGifByDogesh(spawnCategory);
      }
    },
    [spawnGifByDogesh, currentScreen]
  );

  // Trigger event reaction by event name
  const triggerEventReaction = useCallback(
    (event: DogeshEvent, state: DogeshState = 'talk', spawnCategory?: GifAssetDef['category']) => {
      triggerComment(event, state);
      if (spawnCategory && currentScreen !== 'intro' && currentScreen !== 'login') {
        spawnGifByDogesh(spawnCategory);
      }
    },
    [triggerComment, spawnGifByDogesh, currentScreen]
  );

  // --------------------------------------------------------------------------
  // WEBCAM RECOVERY TEST (CAPTCHA) DEDICATED COMMENT CONTROLLER
  // Priority order:
  // 1: Critical camera/hand-tracking error or ready-state message
  // 2: Player clicks/punches Dogesh
  // 3: Important CAPTCHA event (hand detected, puzzle solved, timeout, skip)
  // 4: GIF interruption reaction
  // 5: Random idle comment
  // Lower priority NEVER overwrites currently visible higher priority.
  // --------------------------------------------------------------------------
  const triggerCaptchaCommentRef = useRef<
    (text: string, state: DogeshState, priority: CaptchaCommentPriority, durationMs?: number) => void
  >(() => {});

  const scheduleNextCaptchaIdle = useCallback((delayMs?: number) => {
    if (captchaIdleTimerRef.current) {
      clearTimeout(captchaIdleTimerRef.current);
      captchaIdleTimerRef.current = null;
    }

    // 18–30 seconds interval between idle comments
    const waitTime = delayMs ?? Math.floor(Math.random() * 12000) + 18000;

    captchaIdleTimerRef.current = setTimeout(() => {
      // Pause or defer if camera is initializing or player is actively pinching/dragging
      if (captchaIsBusyRef.current) {
        scheduleNextCaptchaIdle(6000);
        return;
      }

      const idleText = getRandomCaptchaComment();
      triggerCaptchaCommentRef.current(idleText, 'talk', 5, 5500);
    }, waitTime);
  }, []);

  const triggerCaptchaComment = useCallback(
    (text: string, state: DogeshState = 'talk', priority: CaptchaCommentPriority = 3, durationMs = 5500) => {
      // Guard against lower priority overwriting higher priority
      if (captchaActivePriorityRef.current <= 5 && priority > captchaActivePriorityRef.current) {
        return;
      }

      // Clear any pending dismissal and idle timers
      if (captchaDismissTimerRef.current) {
        clearTimeout(captchaDismissTimerRef.current);
        captchaDismissTimerRef.current = null;
      }
      if (captchaIdleTimerRef.current) {
        clearTimeout(captchaIdleTimerRef.current);
        captchaIdleTimerRef.current = null;
      }

      captchaActivePriorityRef.current = priority;
      captchaLastCommentRef.current = text;
      setComment(text);
      setDogeshState(state);

      // Auto-dismiss after 5–7 seconds (durationMs)
      captchaDismissTimerRef.current = setTimeout(() => {
        setComment('');
        captchaActivePriorityRef.current = 99;
        setDogeshState((prev) => (prev === 'cry' || prev === 'walk' ? prev : 'idle'));

        // Quiet gap of 18–30 seconds before next idle comment
        scheduleNextCaptchaIdle();
      }, durationMs);
    },
    [scheduleNextCaptchaIdle]
  );

  useEffect(() => {
    triggerCaptchaCommentRef.current = triggerCaptchaComment;
  }, [triggerCaptchaComment]);

  // Set whether CAPTCHA is busy (camera initializing or active drag/pinch)
  const setCaptchaBusy = useCallback((isBusy: boolean) => {
    captchaIsBusyRef.current = isBusy;
  }, []);

  // CAPTCHA lifecycle: start once on enter, clean up on exit
  useEffect(() => {
    if (currentScreen === 'captcha') {
      setComment('');
      captchaActivePriorityRef.current = 99;
      // Start scheduler: 20 seconds quiet delay before first idle comment
      scheduleNextCaptchaIdle(20000);
    } else {
      if (captchaIdleTimerRef.current) {
        clearTimeout(captchaIdleTimerRef.current);
        captchaIdleTimerRef.current = null;
      }
      if (captchaDismissTimerRef.current) {
        clearTimeout(captchaDismissTimerRef.current);
        captchaDismissTimerRef.current = null;
      }
      captchaActivePriorityRef.current = 99;
    }

    return () => {
      if (captchaIdleTimerRef.current) {
        clearTimeout(captchaIdleTimerRef.current);
        captchaIdleTimerRef.current = null;
      }
      if (captchaDismissTimerRef.current) {
        clearTimeout(captchaDismissTimerRef.current);
        captchaDismissTimerRef.current = null;
      }
    };
  }, [currentScreen, scheduleNextCaptchaIdle]);

  // Click / punch Dogesh interaction:
  // 1. Switch to existing crying Dogesh asset (dogesh cry.png)
  // 2. Show reaction: "HEY! THAT WAS UNCALLED FOR!"
  // 3. Retreat to safe screen corner / edge
  // 4. Settle at slightly smaller size
  // 5. Resume normal roaming after 3.5s
  // 6. ~2.0s cooldown so repeated clicks do not spam
  // 7. Spawn exactly ONE retaliation GIF
  const shooDogesh = useCallback(
    (customInsult?: string) => {
      if (punchCooldownRef.current) return;
      punchCooldownRef.current = true;

      setIsBlocking(false);
      if (blockerTimerRef.current) clearTimeout(blockerTimerRef.current);

      setDogeshState('cry');
      audioController.playSoundEffect('cry');

      const insult =
        customInsult ||
        PUNCH_OFFENDED_COMMENTS[Math.floor(Math.random() * PUNCH_OFFENDED_COMMENTS.length)];

      // Retreat to safe viewport corner outside the game controls/mosaic
      if (typeof window !== 'undefined') {
        const isMobile = window.innerWidth < 640;
        const retreatSize = isMobile ? 140 : 185;
        const retreatToLeft = Math.random() < 0.5;
        const cornerX = retreatToLeft ? 24 : Math.max(24, window.innerWidth - retreatSize - 25);
        const cornerY = Math.max(80, window.innerHeight - retreatSize - 100);
        setDogeshPos({ x: cornerX, y: cornerY });
        setDogeshSize(retreatSize); // settle slightly smaller when hurt
      }

      // On CAPTCHA, punch has Priority 2 with auto-dismiss after 5s
      if (currentScreen === 'captcha') {
        triggerCaptchaCommentRef.current(insult, 'cry', 2, 5000);
      } else {
        setComment(insult);
        if (poseResetTimerRef.current) clearTimeout(poseResetTimerRef.current);
        poseResetTimerRef.current = setTimeout(() => {
          setDogeshState('idle');
          if (typeof window !== 'undefined') {
            const isMobile = window.innerWidth < 640;
            setDogeshSize(isMobile ? 200 : 290);
          }
        }, 3000);
      }

      // Petty revenge: spawn ONE retaliation GIF after short retreat delay
      setTimeout(() => {
        spawnGifByDogesh();
      }, 400);

      // Restore normal size after 3.5s
      setTimeout(() => {
        if (typeof window !== 'undefined') {
          const isMobile = window.innerWidth < 640;
          setDogeshSize(isMobile ? 200 : 290);
        }
      }, 3500);

      // Cooldown reset after 2.0s
      setTimeout(() => {
        punchCooldownRef.current = false;
      }, 2000);
    },
    [currentScreen, spawnGifByDogesh]
  );

  // When round/screen changes, clean up active GIFs and reset blocker
  useEffect(() => {
    screenStartTime.current = Date.now();
    setIsBlocking(false);
    setDogeshState('idle');
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

  // RANDOM SIZE MORPHING SCHEDULER:
  // Randomly grows big and shrinks small dynamically throughout the whole game
  useEffect(() => {
    if (currentScreen === 'intro') return;

    let sizeTimer: NodeJS.Timeout | null = null;

    const scheduleNextSizeMorph = () => {
      // Morph size every 4 to 8 seconds
      const delay = Math.floor(Math.random() * 4500) + 4000;
      sizeTimer = setTimeout(() => {
        if (typeof window !== 'undefined') {
          const isMobile = window.innerWidth < 640;
          const nextSize = getRandomDogeshSize(isMobile);

          setDogeshSize(nextSize);

          // Keep within safe viewport boundaries if growing
          setDogeshPos((prev) => {
            const maxX = Math.max(20, window.innerWidth - nextSize - 20);
            const maxY = Math.max(80, window.innerHeight - nextSize - 100);
            return {
              x: Math.min(prev.x, maxX),
              y: Math.min(prev.y, maxY),
            };
          });
        }
        scheduleNextSizeMorph();
      }, delay);
    };

    scheduleNextSizeMorph();

    return () => {
      if (sizeTimer) clearTimeout(sizeTimer);
    };
  }, [currentScreen]);

  // DOGESH ROAMING SCHEDULER:
  // Non-CAPTCHA screens roam and make occasional arrival comments.
  // On CAPTCHA screen, roaming is quiet (comments are handled by CAPTCHA scheduler).
  useEffect(() => {
    if (currentScreen === 'intro') return;

    const prefersReducedMotion =
      typeof window !== 'undefined' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    const scheduleNextMove = () => {
      const delay = Math.floor(Math.random() * 8000) + 14000;
      movementTimerRef.current = setTimeout(() => {
        if (prefersReducedMotion) {
          if (currentScreen !== 'captcha') {
            triggerComment('idle', 'talk');
          }
          scheduleNextMove();
          return;
        }

        const screenW = window.innerWidth;
        const screenH = window.innerHeight;
        const isMobile = screenW < 640;
        const nextSize = getRandomDogeshSize(isMobile);

        const safeWaypoints = [
          { x: Math.max(20, screenW - nextSize - 25), y: Math.max(90, screenH - nextSize - 120) }, // Bottom-right
          { x: 25, y: Math.max(90, screenH - nextSize - 120) },                                    // Bottom-left
          { x: Math.max(20, screenW - nextSize - 25), y: 85 },                                     // Top-right
          { x: 25, y: 85 },                                                                        // Top-left
          { x: Math.max(20, screenW - nextSize - 25), y: Math.floor(screenH / 2) - Math.floor(nextSize / 2) }, // Mid-right
          { x: 25, y: Math.floor(screenH / 2) - Math.floor(nextSize / 2) },                        // Mid-left
        ];

        const target = safeWaypoints[Math.floor(Math.random() * safeWaypoints.length)];

        setIsMoving(true);
        setDogeshState('walk');
        setDogeshPos(target);
        setDogeshSize(nextSize);

        if (Math.random() < 0.50) {
          setTimeout(() => {
            spawnGifByDogesh();
          }, 900);
        }

        if (arrivalTimerRef.current) clearTimeout(arrivalTimerRef.current);
        arrivalTimerRef.current = setTimeout(() => {
          setIsMoving(false);
          setDogeshState('idle');

          // Occasional comment upon arrival (disabled on CAPTCHA to respect CAPTCHA comment timing)
          if (currentScreen !== 'captcha' && Math.random() < 0.45) {
            triggerComment('idle', 'talk');
          }

          // Rare shield block (only if allowed and not on result/intro/captcha)
          if (allowBlocker && Math.random() < 0.12 && currentScreen !== 'result' && currentScreen !== 'captcha') {
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
    triggerCustomReaction,
    triggerEventReaction,
    triggerCaptchaComment,
    setCaptchaBusy,
    spawnGifByDogesh,
    closeGif,
    updateGifPosition,
    shooDogesh,
    setDogeshState,
  };
}

