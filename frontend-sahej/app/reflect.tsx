import { router, useLocalSearchParams } from "expo-router";
import { useCallback, useEffect, useRef, useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { StatusBar } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { CalmInterventionOverlay } from "../src/components/CalmInterventionOverlay";
import { GlassCard } from "../src/components/GlassCard";
import { LockCountdown } from "../src/components/LockCountdown";
import { copy } from "../src/constants/copy";
import { startCalmHeartbeat } from "../src/features/haptics/startCalmHeartbeat";
import { useSahajLock } from "../src/features/lock/useSahajLock";
import { reflectThought } from "../src/features/reflection/api";
import { fallbackReflectionResult } from "../src/features/reflection/mock";
import { useStillnessGate } from "../src/features/stillness/useStillnessGate";
import { appendJournalEntry } from "../src/lib/journalStore";
import { LatestReflectionState, setLatestReflection } from "../src/lib/latestReflection";
import { getRouteText } from "../src/lib/routeParams";
import { spacing } from "../src/theme/spacing";
import { useThemePreference } from "../src/theme/ThemeProvider";
import { typography } from "../src/theme/typography";

const CALM_INTERVENTION_MS = 2_400;
const REFLECTION_TIMEOUT_MS = 5_000;

export default function ReflectScreen() {
  const params = useLocalSearchParams<{ thought?: string | string[] }>();
  const thought = getRouteText(params.thought).trim();
  const [isRequesting, setIsRequesting] = useState(false);
  const [isCalming, setIsCalming] = useState(false);
  const isScreenMountedRef = useRef(true);
  const requestStartedRef = useRef(false);
  const navigationHandledRef = useRef(false);
  const calmRestartTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const stopCalmHeartbeatRef = useRef<(() => void) | null>(null);
  const { secondsLeft, isRunning, isComplete, reset, start, stop } = useSahajLock();
  const { theme, statusBarStyle } = useThemePreference();

  const hasThought = thought.length > 0;

  const clearCalmRestartTimeout = useCallback(() => {
    if (!calmRestartTimeoutRef.current) {
      return;
    }

    clearTimeout(calmRestartTimeoutRef.current);
    calmRestartTimeoutRef.current = null;
  }, []);

  const handleStillnessBreak = useCallback(() => {
    if (!hasThought || isRequesting || isCalming) {
      return;
    }

    stop();
    reset();
    setIsCalming(true);
  }, [hasThought, isCalming, isRequesting, reset, stop]);

  const { isSupported } = useStillnessGate({
    enabled: hasThought && isRunning && !isRequesting && !isCalming,
    onStillnessBreak: handleStillnessBreak
  });

  useEffect(() => {
    if (!isCalming) {
      return;
    }

    stopCalmHeartbeatRef.current?.();
    stopCalmHeartbeatRef.current = startCalmHeartbeat({
      durationMs: CALM_INTERVENTION_MS,
      intervalMs: 760
    });
    console.log("[sahej:haptics] calm overlay visible");

    clearCalmRestartTimeout();
    calmRestartTimeoutRef.current = setTimeout(() => {
      calmRestartTimeoutRef.current = null;
      setIsCalming(false);
      reset();
      start();
    }, CALM_INTERVENTION_MS);

    return () => {
      stopCalmHeartbeatRef.current?.();
      stopCalmHeartbeatRef.current = null;
      clearCalmRestartTimeout();
    };
  }, [clearCalmRestartTimeout, isCalming, reset, start]);

  const finishReflection = useCallback(
    async (reflection: LatestReflectionState) => {
      if (!isScreenMountedRef.current || navigationHandledRef.current) {
        return;
      }

      navigationHandledRef.current = true;
      setLatestReflection(reflection);
      setIsRequesting(false);

      await appendJournalEntry({
        source: "reflection",
        originalThought: thought,
        verdict: reflection.result.verdict,
        primaryPattern: reflection.result.primaryPattern,
        intensity: reflection.result.intensity,
        mirrorLine: reflection.result.mirrorLine,
        reframePrompt: reflection.result.reframePrompt,
        dopamineDrain: reflection.result.dopamineDrain,
        emotionProfile: reflection.result.emotionProfile,
        journalEntry: reflection.result.journalEntry
      });

      if (!isScreenMountedRef.current) {
        return;
      }

      router.replace({
        pathname: "/result",
        params: {
          thought
        }
      });
    },
    [thought]
  );

  useEffect(() => {
    isScreenMountedRef.current = true;
    requestStartedRef.current = false;
    navigationHandledRef.current = false;
    setIsRequesting(false);
    setIsCalming(false);
    clearCalmRestartTimeout();
    stop();
    reset();

    if (hasThought) {
      start();
    }
  }, [clearCalmRestartTimeout, hasThought, reset, start, stop, thought]);

  useEffect(() => {
    return () => {
      isScreenMountedRef.current = false;
      stopCalmHeartbeatRef.current?.();
      stopCalmHeartbeatRef.current = null;
      clearCalmRestartTimeout();
      stop();
    };
  }, [clearCalmRestartTimeout, stop]);

  useEffect(() => {
    if (!hasThought || !isComplete || isCalming || requestStartedRef.current) {
      return;
    }

    let isActive = true;
    let timeoutId: ReturnType<typeof setTimeout> | null = null;
    const abortController =
      typeof AbortController === "function" ? new AbortController() : null;

    requestStartedRef.current = true;
    setIsRequesting(true);

    const clearRequestTimeout = () => {
      if (!timeoutId) {
        return;
      }

      clearTimeout(timeoutId);
      timeoutId = null;
    };

    const completeReflection = async (reflection: LatestReflectionState) => {
      clearRequestTimeout();

      if (!isActive) {
        return;
      }

      await finishReflection(reflection);
    };

    timeoutId = setTimeout(() => {
      abortController?.abort();
      void completeReflection({
        thought,
        result: fallbackReflectionResult,
        isFallback: true,
        errorMessage:
          "The reflection service took too long to respond. A safe fallback reflection is shown."
      });
    }, REFLECTION_TIMEOUT_MS);

    const runReflection = async () => {
      try {
        const result = await reflectThought(thought, abortController?.signal);

        await completeReflection({
          thought,
          result,
          isFallback: false
        });
      } catch (error) {
        await completeReflection({
          thought,
          result: fallbackReflectionResult,
          isFallback: true,
          errorMessage:
            error instanceof Error
              ? error.message
              : "The reflection service could not be reached."
        });
      }
    };

    void runReflection();

    return () => {
      isActive = false;
      clearRequestTimeout();
      abortController?.abort();
    };
  }, [finishReflection, hasThought, isCalming, isComplete, thought]);

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: theme.background }]}>
      <StatusBar barStyle={statusBarStyle} />
      <View pointerEvents="none" style={[styles.aura, { backgroundColor: theme.aura }]} />
      <View style={styles.container}>
        <Text style={[styles.eyebrow, { color: theme.textMuted }]}>{copy.reflect.eyebrow}</Text>
        <Text style={[styles.title, { color: theme.textPrimary }]}>{copy.reflect.title}</Text>
        <Text style={[styles.subtitle, { color: theme.textSecondary }]}>{copy.reflect.subtitle}</Text>

        {!hasThought ? (
          <GlassCard theme={theme}>
            <Text style={[styles.sectionLabel, { color: theme.textMuted }]}>
              {copy.reflect.missingThoughtTitle}
            </Text>
            <Text style={[styles.thoughtText, { color: theme.textPrimary }]}>
              {copy.reflect.missingThoughtBody}
            </Text>
          </GlassCard>
        ) : (
          <LockCountdown
            count={isRequesting ? undefined : String(secondsLeft)}
            helperText={!isSupported ? copy.reflect.unsupportedSensors : null}
            isLoading={isRequesting}
            label={isRequesting ? copy.reflect.listeningLabel : copy.reflect.countdownLabel}
            theme={theme}
          />
        )}

        {hasThought ? (
          <GlassCard theme={theme}>
            <Text style={[styles.sectionLabel, { color: theme.textMuted }]}>
              {copy.shared.capturedThought}
            </Text>
            <Text style={[styles.thoughtText, { color: theme.textPrimary }]}>{thought}</Text>
          </GlassCard>
        ) : null}

        {!hasThought ? (
          <Pressable
            onPress={() => {
              router.replace("/");
            }}
            style={[styles.primaryButton, { backgroundColor: theme.accent }]}
          >
            <Text style={[styles.primaryButtonText, { color: theme.textPrimary }]}>
              {copy.reflect.missingThoughtAction}
            </Text>
          </Pressable>
        ) : null}
      </View>

      <CalmInterventionOverlay
        body={copy.reflect.stillnessBody}
        title={copy.reflect.stillnessTitle}
        theme={theme}
        visible={isCalming}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1
  },
  container: {
    flex: 1,
    justifyContent: "center",
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.xxl
  },
  eyebrow: {
    fontSize: typography.caption.fontSize,
    fontWeight: typography.caption.fontWeight,
    letterSpacing: 2,
    marginBottom: spacing.sm,
    textTransform: "uppercase"
  },
  title: {
    fontSize: typography.title.fontSize,
    fontWeight: typography.title.fontWeight,
    marginBottom: spacing.sm
  },
  subtitle: {
    fontSize: typography.body.fontSize,
    lineHeight: typography.body.lineHeight,
    marginBottom: spacing.xl
  },
  sectionLabel: {
    fontSize: typography.caption.fontSize,
    fontWeight: typography.caption.fontWeight,
    letterSpacing: 1,
    marginBottom: spacing.sm,
    textTransform: "uppercase"
  },
  thoughtText: {
    fontSize: typography.body.fontSize,
    lineHeight: typography.body.lineHeight
  },
  primaryButton: {
    alignItems: "center",
    borderRadius: 18,
    marginTop: spacing.xl,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md
  },
  primaryButtonText: {
    fontSize: typography.button.fontSize,
    fontWeight: typography.button.fontWeight,
    letterSpacing: typography.button.letterSpacing
  },
  aura: {
    position: "absolute",
    top: 80,
    right: -120,
    width: 320,
    height: 320,
    borderRadius: 999
  }
});
