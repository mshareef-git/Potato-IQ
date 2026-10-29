import { useState, useEffect, useRef, useCallback } from 'react';

export interface UseCountdownOptions {
  initialSeconds: number;
  onTimeout?: () => void;
  autoStart?: boolean;
}

export function useCountdown({ initialSeconds, onTimeout, autoStart = false }: UseCountdownOptions) {
  const [secondsLeft, setSecondsLeft] = useState<number>(initialSeconds);
  const [isRunning, setIsRunning] = useState<boolean>(autoStart);
  
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const onTimeoutRef = useRef(onTimeout);
  onTimeoutRef.current = onTimeout;

  const hasTimedOutRef = useRef<boolean>(false);

  const start = useCallback(() => {
    setIsRunning(true);
    hasTimedOutRef.current = false;
  }, []);

  const stop = useCallback(() => {
    setIsRunning(false);
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  const reset = useCallback((newSeconds?: number) => {
    stop();
    setSecondsLeft(newSeconds ?? initialSeconds);
    hasTimedOutRef.current = false;
  }, [initialSeconds, stop]);

  useEffect(() => {
    if (!isRunning) return;

    timerRef.current = setInterval(() => {
      setSecondsLeft((prev) => {
        if (prev <= 0.1) {
          if (!hasTimedOutRef.current) {
            hasTimedOutRef.current = true;
            setIsRunning(false);
            if (timerRef.current) clearInterval(timerRef.current);
            // Execute timeout callback once
            if (onTimeoutRef.current) {
              onTimeoutRef.current();
            }
          }
          return 0;
        }
        return Math.max(0, prev - 0.1);
      });
    }, 100);

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    };
  }, [isRunning]);

  return {
    secondsLeft,
    isRunning,
    start,
    stop,
    reset
  };
}
