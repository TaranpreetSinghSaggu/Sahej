import { useCallback, useEffect, useRef, useState } from "react";

const LOCK_DURATION_SECONDS = 3;

export function useSahajLock() {
  const [secondsLeft, setSecondsLeft] = useState(LOCK_DURATION_SECONDS);
  const [isRunning, setIsRunning] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const clearTimer = useCallback(() => {
    if (!timerRef.current) {
      return;
    }

    clearTimeout(timerRef.current);
    timerRef.current = null;
  }, []);

  const start = useCallback(() => {
    clearTimer();
    setSecondsLeft((current) => (current === 0 ? LOCK_DURATION_SECONDS : current));
    setIsRunning(true);
  }, [clearTimer]);

  const stop = useCallback(() => {
    clearTimer();
    setIsRunning(false);
  }, [clearTimer]);

  const reset = useCallback(() => {
    clearTimer();
    setSecondsLeft(LOCK_DURATION_SECONDS);
    setIsRunning(false);
  }, [clearTimer]);

  useEffect(() => {
    if (!isRunning) {
      clearTimer();
      return;
    }

    if (secondsLeft <= 0) {
      clearTimer();
      setIsRunning(false);
      return;
    }

    timerRef.current = setTimeout(() => {
      setSecondsLeft((current) => Math.max(current - 1, 0));
    }, 1000);

    return () => {
      clearTimer();
    };
  }, [clearTimer, isRunning, secondsLeft]);

  return {
    secondsLeft,
    isRunning,
    isComplete: secondsLeft === 0,
    start,
    stop,
    reset
  };
}
