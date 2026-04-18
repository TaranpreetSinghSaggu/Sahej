import { router } from "expo-router";
import { useMemo, useState } from "react";
import { StatusBar } from "react-native";
import { Pressable, ScrollView, StyleSheet, Text, TextInput, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { GlassCard } from "../../src/components/GlassCard";
import { copy } from "../../src/constants/copy";
import { EMOTION_CATALOG } from "../../src/features/journal/emotionCatalog";
import { buildEmotionLogEntry } from "../../src/features/journal/emotionLog";
import { appendJournalEntry } from "../../src/lib/journalStore";
import { spacing } from "../../src/theme/spacing";
import { useThemePreference } from "../../src/theme/ThemeProvider";
import { typography } from "../../src/theme/typography";

const INTENSITY_OPTIONS: Array<1 | 2 | 3 | 4 | 5> = [1, 2, 3, 4, 5];

export default function LogFeelingScreen() {
  const { theme, statusBarStyle } = useThemePreference();
  const [selectedEmotionId, setSelectedEmotionId] = useState<string | null>(null);
  const [selectedIntensity, setSelectedIntensity] = useState<1 | 2 | 3 | 4 | 5>(3);
  const [note, setNote] = useState("");
  const [feedback, setFeedback] = useState("");

  const selectedEmotion = useMemo(
    () => EMOTION_CATALOG.find((emotion) => emotion.id === selectedEmotionId) ?? null,
    [selectedEmotionId]
  );

  const canSave = selectedEmotion !== null;

  const handleSave = async () => {
    if (!selectedEmotion) {
      return;
    }

    await appendJournalEntry(
      buildEmotionLogEntry({
        emotion: selectedEmotion,
        intensity: selectedIntensity,
        note
      })
    );

    setFeedback(copy.logFeeling.savedMessage);
    setSelectedEmotionId(null);
    setSelectedIntensity(3);
    setNote("");
  };

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: theme.background }]}>
      <StatusBar barStyle={statusBarStyle} />
      <View pointerEvents="none" style={[styles.aura, { backgroundColor: theme.auraSoft }]} />
      <ScrollView bounces={false} contentContainerStyle={styles.content}>
        <Text style={[styles.title, { color: theme.textPrimary }]}>{copy.logFeeling.title}</Text>
        <Text style={[styles.subtitle, { color: theme.textSecondary }]}>{copy.logFeeling.subtitle}</Text>

        <GlassCard style={styles.card} theme={theme}>
          <Text style={[styles.sectionLabel, { color: theme.textMuted }]}>{copy.logFeeling.pickEmotion}</Text>
          <View style={styles.chipWrap}>
            {EMOTION_CATALOG.map((emotion) => {
              const isSelected = emotion.id === selectedEmotionId;

              return (
                <Pressable
                  key={emotion.id}
                  onPress={() => {
                    setSelectedEmotionId(emotion.id);
                    setFeedback("");
                  }}
                  style={[
                    styles.emotionChip,
                    {
                      borderColor: isSelected ? emotion.color : theme.borderStrong,
                      backgroundColor: isSelected ? `${emotion.color}26` : theme.card
                    }
                  ]}
                >
                  <View style={[styles.emotionDot, { backgroundColor: emotion.color }]} />
                  <Text style={[styles.emotionText, { color: theme.textPrimary }]}>{emotion.label}</Text>
                </Pressable>
              );
            })}
          </View>

          <Text style={[styles.sectionLabel, styles.spacingTop, { color: theme.textMuted }]}>
            {copy.logFeeling.pickIntensity}
          </Text>
          <View style={styles.intensityRow}>
            {INTENSITY_OPTIONS.map((value) => {
              const isSelected = selectedIntensity === value;

              return (
                <Pressable
                  key={value}
                  onPress={() => {
                    setSelectedIntensity(value);
                    setFeedback("");
                  }}
                  style={[
                    styles.intensityChip,
                    {
                      borderColor: isSelected ? theme.accent : theme.borderStrong,
                      backgroundColor: isSelected ? `${theme.accent}2A` : theme.card
                    }
                  ]}
                >
                  <Text style={[styles.intensityText, { color: theme.textPrimary }]}>{value}</Text>
                </Pressable>
              );
            })}
          </View>

          <TextInput
            multiline
            onChangeText={(value) => {
              setNote(value);
              setFeedback("");
            }}
            placeholder={copy.logFeeling.notePlaceholder}
            placeholderTextColor={theme.textMuted}
            selectionColor={theme.accent}
            style={[
              styles.noteInput,
              {
                color: theme.textPrimary,
                borderColor: theme.border
              }
            ]}
            textAlignVertical="top"
            value={note}
          />

          <Pressable
            disabled={!canSave}
            onPress={handleSave}
            style={[
              styles.primaryButton,
              {
                backgroundColor: theme.accent
              },
              !canSave && styles.disabledButton
            ]}
          >
            <Text style={[styles.primaryButtonText, { color: theme.textPrimary }]}>
              {copy.logFeeling.saveAction}
            </Text>
          </Pressable>

          <Pressable
            onPress={() => {
              router.push("/journal");
            }}
            style={[styles.secondaryButton, { borderColor: theme.borderStrong }]}
          >
            <Text style={[styles.secondaryButtonText, { color: theme.textPrimary }]}>
              {copy.logFeeling.viewJournalAction}
            </Text>
          </Pressable>

          {feedback ? (
            <Text style={[styles.feedback, { color: theme.textMuted }]}>{feedback}</Text>
          ) : null}
        </GlassCard>
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
    paddingTop: spacing.xl,
    paddingBottom: spacing.xxxl
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
  card: {
    marginBottom: spacing.md
  },
  sectionLabel: {
    fontSize: typography.caption.fontSize,
    fontWeight: typography.caption.fontWeight,
    letterSpacing: 0.8,
    textTransform: "uppercase"
  },
  spacingTop: {
    marginTop: spacing.md
  },
  chipWrap: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.sm,
    marginTop: spacing.sm
  },
  emotionChip: {
    alignItems: "center",
    borderRadius: 14,
    borderWidth: 1,
    flexDirection: "row",
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs
  },
  emotionDot: {
    width: 10,
    height: 10,
    borderRadius: 999,
    marginRight: spacing.xs
  },
  emotionText: {
    fontSize: typography.caption.fontSize,
    fontWeight: typography.caption.fontWeight
  },
  intensityRow: {
    flexDirection: "row",
    marginTop: spacing.sm
  },
  intensityChip: {
    alignItems: "center",
    borderRadius: 12,
    borderWidth: 1,
    marginRight: spacing.sm,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs
  },
  intensityText: {
    fontSize: typography.caption.fontSize,
    fontWeight: "700"
  },
  noteInput: {
    borderRadius: 14,
    borderWidth: 1,
    fontSize: typography.body.fontSize,
    lineHeight: typography.body.lineHeight,
    marginTop: spacing.md,
    minHeight: 96,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm
  },
  primaryButton: {
    alignItems: "center",
    borderRadius: 14,
    marginTop: spacing.md,
    paddingVertical: spacing.md
  },
  primaryButtonText: {
    fontSize: typography.button.fontSize,
    fontWeight: typography.button.fontWeight,
    letterSpacing: typography.button.letterSpacing
  },
  secondaryButton: {
    alignItems: "center",
    borderRadius: 14,
    borderWidth: 1,
    marginTop: spacing.sm,
    paddingVertical: spacing.md
  },
  secondaryButtonText: {
    fontSize: typography.caption.fontSize,
    fontWeight: typography.caption.fontWeight
  },
  feedback: {
    fontSize: typography.caption.fontSize,
    lineHeight: typography.caption.lineHeight,
    marginTop: spacing.sm,
    textAlign: "center"
  },
  disabledButton: {
    opacity: 0.42
  },
  aura: {
    position: "absolute",
    top: -110,
    left: -100,
    width: 280,
    height: 280,
    borderRadius: 999
  }
});
