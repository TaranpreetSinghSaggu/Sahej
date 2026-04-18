import { useCallback, useEffect, useRef, useState } from "react";
import { Accelerometer } from "expo-sensors";

interface UseStillnessGateOptions {
  enabled: boolean;
  onStillnessBreak: () => void;
}

interface AccelerometerReading {
  x: number;
  y: number;
  z: number;
}

const SENSOR_INTERVAL_MS = 200;
const MOVEMENT_THRESHOLD = 0.7;
const RESET_COOLDOWN_MS = 900;

export function useStillnessGate({
  enabled,
  onStillnessBreak
}: UseStillnessGateOptions) {
  const [isSupported, setIsSupported] = useState(true);
  const previousReadingRef = useRef<AccelerometerReading | null>(null);
  const cooldownUntilRef = useRef(0);
  const stillnessBreakRef = useRef(onStillnessBreak);

  stillnessBreakRef.current = onStillnessBreak;

  useEffect(() => {
    if (!enabled) {
      previousReadingRef.current = null;
      return;
    }

    let isMounted = true;
    let subscription: { remove: () => void } | null = null;

    const startListening = async () => {
      try {
        const available = await Accelerometer.isAvailableAsync();

        if (!isMounted) {
          return;
        }

        setIsSupported(available);

        if (!available) {
          return;
        }

        Accelerometer.setUpdateInterval(SENSOR_INTERVAL_MS);

        subscription = Accelerometer.addListener((reading) => {
          const previousReading = previousReadingRef.current;

          previousReadingRef.current = reading;

          if (!previousReading) {
            return;
          }

          if (Date.now() < cooldownUntilRef.current) {
            return;
          }

          const movementScore =
            Math.abs(reading.x - previousReading.x) +
            Math.abs(reading.y - previousReading.y) +
            Math.abs(reading.z - previousReading.z);

          if (movementScore < MOVEMENT_THRESHOLD) {
            return;
          }

          cooldownUntilRef.current = Date.now() + RESET_COOLDOWN_MS;
          previousReadingRef.current = null;
          stillnessBreakRef.current();
        });
      } catch {
        if (isMounted) {
          setIsSupported(false);
        }
      }
    };

    startListening();

    return () => {
      isMounted = false;
      previousReadingRef.current = null;
      subscription?.remove();
    };
  }, [enabled]);

  return {
    isSupported
  };
}
