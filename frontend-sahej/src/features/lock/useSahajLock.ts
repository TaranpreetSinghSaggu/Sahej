import { useCallback, useEffect, useState } from "react";

const LOCK_DURATION_SECONDS = 3;

export function useSahajLock() {
  const [secondsLeft, setSecondsLeft] = useState(LOCK_DURATION_SECONDS);
  const [cycle, setCycle] = useState(0);

  const reset = useCallback(() => {
    setCycle((value) => value + 1);
  }, []);

  useEffect(() => {
    setSecondsLeft(LOCK_DURATION_SECONDS);

    const timer = setInterval(() => {
      setSecondsLeft((current) => {
        if (current <= 1) {
          clearInterval(timer);
          return 0;
        }

        return current - 1;
      });
    }, 1000);

    return () => {
      clearInterval(timer);
    };
  }, [cycle]);

  return {
    secondsLeft,
    isRunning: secondsLeft > 0,
    isComplete: secondsLeft === 0,
    reset
  };
}
