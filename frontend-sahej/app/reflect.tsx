import { router, useLocalSearchParams } from "expo-router";
import { useEffect, useMemo, useRef, useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { StatusBar } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { GlassCard } from "../src/components/GlassCard";
import { LockCountdown } from "../src/components/LockCountdown";
import { copy } from "../src/constants/copy";
import { useSahajLock } from "../src/features/lock/useSahajLock";
import { reflectThought } from "../src/features/reflection/api";
import { fallbackReflectionResult } from "../src/features/reflection/mock";
import { useStillnessGate } from "../src/features/stillness/useStillnessGate";
import { setLatestReflection } from "../src/lib/latestReflection";
import { getRouteText } from "../src/lib/routeParams";
import { spacing } from "../src/theme/spacing";
import { defaultTheme } from "../src/theme/theme";
import { typography } from "../src/theme/typography";

export default function ReflectScreen() {
  const params = useLocalSearchParams<{ thought?: string | string[] }>();
  const thought = getRouteText(params.thought).trim();
  const [isRequesting, setIsRequesting] = useState(false);
  const requestStartedRef = useRef(false);
  const { secondsLeft, isRunning, isComplete, reset } = useSahajLock();
  const { isSupported, message } = useStillnessGate({
    enabled: Boolean(thought) && isRunning && !isRequesting,
    onStillnessBreak: reset
  });

  const hasThought = thought.length > 0;
  const helperText = useMemo(() => {
    if (message) {
      return message;
    }

    if (!isSupported) {
      return copy.reflect.unsupportedSensors;
    }

    return null;
  }, [isSupported, message]);

  useEffect(() => {
    if (!hasThought || !isComplete || requestStartedRef.current) {
      return;
    }

    let isActive = true;

    requestStartedRef.current = true;
    setIsRequesting(true);

    const runReflection = async () => {
      try {
        const result = await reflectThought(thought);

        if (!isActive) {
          return;
        }

        setLatestReflection({
          thought,
          result,
          isFallback: false
        });
      } catch (error) {
        if (!isActive) {
          return;
        }

        setLatestReflection({
          thought,
          result: fallbackReflectionResult,
          isFallback: true,
          errorMessage:
            error instanceof Error
              ? error.message
              : "The reflection service could not be reached."
        });
      } finally {
        if (!isActive) {
          return;
        }

        setIsRequesting(false);
        router.replace({
          pathname: "/result",
          params: {
            thought
          }
        });
      }
    };

    runReflection();

    return () => {
      isActive = false;
    };
  }, [hasThought, isComplete, thought]);

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="light-content" />
      <View pointerEvents="none" style={styles.aura} />
      <View style={styles.container}>
        <Text style={styles.eyebrow}>{copy.reflect.eyebrow}</Text>
        <Text style={styles.title}>{copy.reflect.title}</Text>
        <Text style={styles.subtitle}>{copy.reflect.subtitle}</Text>

        {!hasThought ? (
          <GlassCard theme={defaultTheme}>
            <Text style={styles.sectionLabel}>{copy.reflect.missingThoughtTitle}</Text>
            <Text style={styles.thoughtText}>{copy.reflect.missingThoughtBody}</Text>
          </GlassCard>
        ) : (
          <LockCountdown
            count={isRequesting ? undefined : String(secondsLeft)}
            helperText={helperText}
            isLoading={isRequesting}
            label={isRequesting ? copy.reflect.listeningLabel : copy.reflect.countdownLabel}
            theme={defaultTheme}
          />
        )}

        {hasThought ? (
          <GlassCard theme={defaultTheme}>
            <Text style={styles.sectionLabel}>{copy.shared.capturedThought}</Text>
            <Text style={styles.thoughtText}>{thought}</Text>
          </GlassCard>
        ) : null}

        {!hasThought ? (
          <Pressable
            onPress={() => {
              router.replace("/");
            }}
            style={styles.primaryButton}
          >
            <Text style={styles.primaryButtonText}>{copy.reflect.missingThoughtAction}</Text>
          </Pressable>
        ) : null}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: defaultTheme.background
  },
  container: {
    flex: 1,
    justifyContent: "center",
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.xxl
  },
  eyebrow: {
    color: defaultTheme.textMuted,
    fontSize: typography.caption.fontSize,
    fontWeight: typography.caption.fontWeight,
    letterSpacing: 2,
    marginBottom: spacing.sm,
    textTransform: "uppercase"
  },
  title: {
    color: defaultTheme.textPrimary,
    fontSize: typography.title.fontSize,
    fontWeight: typography.title.fontWeight,
    marginBottom: spacing.sm
  },
  subtitle: {
    color: defaultTheme.textSecondary,
    fontSize: typography.body.fontSize,
    lineHeight: typography.body.lineHeight,
    marginBottom: spacing.xl
  },
  sectionLabel: {
    color: defaultTheme.textMuted,
    fontSize: typography.caption.fontSize,
    fontWeight: typography.caption.fontWeight,
    letterSpacing: 1,
    marginBottom: spacing.sm,
    textTransform: "uppercase"
  },
  thoughtText: {
    color: defaultTheme.textPrimary,
    fontSize: typography.body.fontSize,
    lineHeight: typography.body.lineHeight
  },
  primaryButton: {
    alignItems: "center",
    backgroundColor: defaultTheme.accent,
    borderRadius: 18,
    marginTop: spacing.xl,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md
  },
  primaryButtonText: {
    color: defaultTheme.textPrimary,
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
    borderRadius: 999,
    backgroundColor: defaultTheme.aura
  }
});
