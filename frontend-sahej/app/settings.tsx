import { useEffect, useRef, useState } from "react";
import { StatusBar } from "react-native";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { GlassCard } from "../src/components/GlassCard";
import { copy } from "../src/constants/copy";
import { startCalmHeartbeat } from "../src/features/haptics/startCalmHeartbeat";
import { triggerReflectionHaptic } from "../src/features/haptics/triggerReflectionHaptic";
import { ReflectionResult } from "../src/features/reflection/types";
import { seedDemoData } from "../src/lib/demoSeed";
import { spacing } from "../src/theme/spacing";
import { useThemePreference } from "../src/theme/ThemeProvider";
import { typography } from "../src/theme/typography";

const STRONG_TEST_RESULT: ReflectionResult = {
  verdict: "AUTOPILOT",
  primaryPattern: "venting",
  intensity: 5,
  mirrorLine: "test",
  reframePrompt: "test",
  dopamineDrain: false,
  emotionProfile: {
    primaryEmotion: "anger",
    secondaryEmotion: "hurt",
    underlyingNeed: "respect",
    bodyColor: "#FF6B6B",
    colorName: "test",
    explanation: "test"
  },
  journalEntry: {
    summary: "test",
    awarenessPrompt: "test"
  }
};

const LIGHT_TEST_RESULT: ReflectionResult = {
  verdict: "AUTHENTIC",
  primaryPattern: "grounded",
  intensity: 2,
  mirrorLine: "test",
  reframePrompt: "test",
  dopamineDrain: false,
  emotionProfile: {
    primaryEmotion: "calm clarity",
    secondaryEmotion: "openness",
    underlyingNeed: "truth",
    bodyColor: "#5B6CFF",
    colorName: "test",
    explanation: "test"
  },
  journalEntry: {
    summary: "test",
    awarenessPrompt: "test"
  }
};

export default function SettingsScreen() {
  const { mode, toggleMode, theme, statusBarStyle } = useThemePreference();
  const [devMessage, setDevMessage] = useState("");
  const stopCalmTestRef = useRef<(() => void) | null>(null);

  useEffect(() => {
    return () => {
      stopCalmTestRef.current?.();
      stopCalmTestRef.current = null;
    };
  }, []);

  const runCalmTest = () => {
    stopCalmTestRef.current?.();
    stopCalmTestRef.current = startCalmHeartbeat({
      durationMs: 2_400,
      intervalMs: 760
    });
    setDevMessage("Calm heartbeat test triggered.");
  };

  const runStrongTest = async () => {
    await triggerReflectionHaptic(STRONG_TEST_RESULT);
    setDevMessage("Strong warning haptic test triggered.");
  };

  const runLightTest = async () => {
    await triggerReflectionHaptic(LIGHT_TEST_RESULT);
    setDevMessage("Light reassurance haptic test triggered.");
  };

  const handleSeedDemo = async () => {
    const result = await seedDemoData();
    setDevMessage(
      `Reset complete. Seeded ${result.reflections} reflections, ${result.notes} notes, and ${result.emotionLogs} feeling logs.`
    );
  };

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: theme.background }]}>
      <StatusBar barStyle={statusBarStyle} />
      <View pointerEvents="none" style={[styles.aura, { backgroundColor: theme.auraSoft }]} />
      <ScrollView bounces={false} contentContainerStyle={styles.content}>
        <Text style={[styles.title, { color: theme.textPrimary }]}>{copy.settings.title}</Text>
        <Text style={[styles.subtitle, { color: theme.textSecondary }]}>{copy.settings.subtitle}</Text>

        <GlassCard style={styles.cardSpacing} theme={theme}>
          <Text style={[styles.sectionTitle, { color: theme.textPrimary }]}>
            {copy.settings.themeTitle}
          </Text>
          <Text style={[styles.sectionBody, { color: theme.textSecondary }]}>
            {copy.settings.themeBody}
          </Text>

          <Pressable
            onPress={toggleMode}
            style={[styles.toggleButton, { borderColor: theme.borderStrong }]}
          >
            <Text style={[styles.toggleButtonText, { color: theme.textPrimary }]}>
              {copy.settings.toggleAction} ({mode})
            </Text>
          </Pressable>
        </GlassCard>

        <GlassCard style={styles.cardSpacing} theme={theme}>
          <Text style={[styles.sectionTitle, { color: theme.textPrimary }]}>
            {copy.settings.hapticsTitle}
          </Text>
          <Text style={[styles.sectionBody, { color: theme.textSecondary }]}>
            {copy.settings.hapticsBody}
          </Text>

          <View style={styles.devButtonRow}>
            <Pressable
              onPress={runCalmTest}
              style={[styles.devButton, { borderColor: theme.borderStrong }]}
            >
              <Text style={[styles.devButtonText, { color: theme.textPrimary }]}>
                {copy.settings.hapticsCalmAction}
              </Text>
            </Pressable>
            <Pressable
              onPress={() => {
                void runStrongTest();
              }}
              style={[styles.devButton, { borderColor: theme.borderStrong }]}
            >
              <Text style={[styles.devButtonText, { color: theme.textPrimary }]}>
                {copy.settings.hapticsStrongAction}
              </Text>
            </Pressable>
            <Pressable
              onPress={() => {
                void runLightTest();
              }}
              style={[styles.devButton, { borderColor: theme.borderStrong }]}
            >
              <Text style={[styles.devButtonText, { color: theme.textPrimary }]}>
                {copy.settings.hapticsLightAction}
              </Text>
            </Pressable>
          </View>
        </GlassCard>

        <GlassCard style={styles.cardSpacing} theme={theme}>
          <Text style={[styles.sectionTitle, { color: theme.textPrimary }]}>
            {copy.settings.demoSeedTitle}
          </Text>
          <Text style={[styles.sectionBody, { color: theme.textSecondary }]}>
            {copy.settings.demoSeedBody}
          </Text>

          <Pressable
            onPress={() => {
              void handleSeedDemo();
            }}
            style={[styles.toggleButton, { borderColor: theme.borderStrong }]}
          >
            <Text style={[styles.toggleButtonText, { color: theme.textPrimary }]}>
              {copy.settings.demoSeedAction}
            </Text>
          </Pressable>
        </GlassCard>

        {devMessage ? (
          <Text style={[styles.devMessage, { color: theme.textMuted }]}>{devMessage}</Text>
        ) : null}
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
    paddingVertical: spacing.xl
  },
  title: {
    fontSize: typography.title.fontSize,
    fontWeight: typography.title.fontWeight,
    marginBottom: spacing.sm
  },
  subtitle: {
    fontSize: typography.body.fontSize,
    lineHeight: typography.body.lineHeight,
    marginBottom: spacing.lg
  },
  cardSpacing: {
    marginBottom: spacing.lg
  },
  sectionTitle: {
    fontSize: typography.body.fontSize,
    fontWeight: "700",
    marginBottom: spacing.sm
  },
  sectionBody: {
    fontSize: typography.body.fontSize,
    lineHeight: typography.body.lineHeight
  },
  toggleButton: {
    alignItems: "center",
    borderRadius: 14,
    borderWidth: 1,
    marginTop: spacing.lg,
    paddingVertical: spacing.md
  },
  toggleButtonText: {
    fontSize: typography.button.fontSize,
    fontWeight: typography.button.fontWeight,
    letterSpacing: typography.button.letterSpacing
  },
  devButtonRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginTop: spacing.md
  },
  devButton: {
    borderRadius: 12,
    borderWidth: 1,
    marginRight: spacing.sm,
    marginTop: spacing.xs,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm
  },
  devButtonText: {
    fontSize: typography.caption.fontSize,
    fontWeight: typography.caption.fontWeight
  },
  devMessage: {
    fontSize: typography.caption.fontSize,
    lineHeight: typography.caption.lineHeight,
    marginTop: spacing.sm,
    textAlign: "center"
  },
  aura: {
    position: "absolute",
    top: -120,
    right: -120,
    width: 300,
    height: 300,
    borderRadius: 999
  }
});
