import { router, useLocalSearchParams } from "expo-router";
import { useEffect, useMemo, useRef } from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { StatusBar } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { GlassCard } from "../src/components/GlassCard";
import { MirrorResultCard } from "../src/components/MirrorResultCard";
import { copy } from "../src/constants/copy";
import { triggerReflectionHaptic } from "../src/features/haptics/triggerReflectionHaptic";
import { clearLatestReflection, getLatestReflection } from "../src/lib/latestReflection";
import { getRouteText } from "../src/lib/routeParams";
import { spacing } from "../src/theme/spacing";
import { defaultTheme, drainedTheme } from "../src/theme/theme";
import { typography } from "../src/theme/typography";

export default function ResultScreen() {
  const params = useLocalSearchParams<{ thought?: string | string[] }>();
  const thought = getRouteText(params.thought).trim();
  const latestReflection = getLatestReflection();
  const hapticTriggeredRef = useRef(false);
  const theme = useMemo(() => {
    if (latestReflection?.result.dopamineDrain) {
      return drainedTheme;
    }

    return defaultTheme;
  }, [latestReflection?.result.dopamineDrain]);

  useEffect(() => {
    if (!latestReflection || hapticTriggeredRef.current) {
      return;
    }

    hapticTriggeredRef.current = true;
    triggerReflectionHaptic(latestReflection.result.verdict);
  }, [latestReflection]);

  const handleBackHome = () => {
    clearLatestReflection();
    router.replace("/");
  };

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: theme.background }]}>
      <StatusBar barStyle="light-content" />
      <View pointerEvents="none" style={[styles.auraTop, { backgroundColor: theme.auraSoft }]} />
      <ScrollView bounces={false} contentContainerStyle={styles.content}>
        <Text style={[styles.eyebrow, { color: theme.textMuted }]}>{copy.result.eyebrow}</Text>
        <Text style={[styles.title, { color: theme.textPrimary }]}>{copy.result.title}</Text>
        <Text style={[styles.subtitle, { color: theme.textSecondary }]}>{copy.result.subtitle}</Text>

        {latestReflection?.isFallback ? (
          <GlassCard style={styles.infoCard} theme={theme}>
            <Text style={[styles.sectionLabel, { color: theme.textMuted }]}>
              {copy.result.fallbackTitle}
            </Text>
            <Text style={[styles.thoughtText, { color: theme.textPrimary }]}>
              {latestReflection.errorMessage ??
                "A fallback reflection is being shown because the live service was unavailable."}
            </Text>
          </GlassCard>
        ) : null}

        {thought ? (
          <GlassCard style={styles.thoughtCard} theme={theme}>
            <Text style={[styles.sectionLabel, { color: theme.textMuted }]}>
              {copy.shared.capturedThought}
            </Text>
            <Text style={[styles.thoughtText, { color: theme.textPrimary }]}>{thought}</Text>
          </GlassCard>
        ) : null}

        {latestReflection ? (
          <MirrorResultCard result={latestReflection.result} theme={theme} />
        ) : (
          <GlassCard theme={theme}>
            <Text style={[styles.sectionLabel, { color: theme.textMuted }]}>
              {copy.result.missingTitle}
            </Text>
            <Text style={[styles.thoughtText, { color: theme.textPrimary }]}>
              {copy.result.missingBody}
            </Text>
          </GlassCard>
        )}

        <Pressable
          onPress={handleBackHome}
          style={[styles.secondaryButton, { borderColor: theme.borderStrong }]}
        >
          <Text style={[styles.secondaryButtonText, { color: theme.textPrimary }]}>
            {copy.result.primaryAction}
          </Text>
        </Pressable>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1
  },
  content: {
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.xxl,
    paddingBottom: spacing.xxxl
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
  infoCard: {
    marginBottom: spacing.lg
  },
  thoughtCard: {
    marginBottom: spacing.lg
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
  secondaryButton: {
    alignItems: "center",
    borderRadius: 18,
    borderWidth: 1,
    marginTop: spacing.xl,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md
  },
  secondaryButtonText: {
    fontSize: typography.button.fontSize,
    fontWeight: typography.button.fontWeight,
    letterSpacing: typography.button.letterSpacing
  },
  auraTop: {
    position: "absolute",
    top: -140,
    left: -60,
    width: 260,
    height: 260,
    borderRadius: 999
  }
});
