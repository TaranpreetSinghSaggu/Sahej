import { router } from "expo-router";
import { useFocusEffect } from "@react-navigation/native";
import { useCallback, useMemo, useState } from "react";
import { StatusBar } from "react-native";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { GlassCard } from "../../src/components/GlassCard";
import { copy } from "../../src/constants/copy";
import { buildJournalSummary } from "../../src/features/journal/summary";
import { JournalRecord, listJournalEntries } from "../../src/lib/journalStore";
import { spacing } from "../../src/theme/spacing";
import { useThemePreference } from "../../src/theme/ThemeProvider";
import { typography } from "../../src/theme/typography";

function formatTimestamp(value: string) {
  return new Date(value).toLocaleString(undefined, {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit"
  });
}

function truncate(value: string, maxLength: number) {
  if (value.length <= maxLength) {
    return value;
  }

  return `${value.slice(0, maxLength).trim()}...`;
}

function titleCase(value: string) {
  return value
    .split("_")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

export default function JournalScreen() {
  const { theme, statusBarStyle } = useThemePreference();
  const [entries, setEntries] = useState<JournalRecord[]>([]);

  const loadEntries = useCallback(async () => {
    const nextEntries = await listJournalEntries(28);
    setEntries(nextEntries);
  }, []);

  useFocusEffect(
    useCallback(() => {
      void loadEntries();
    }, [loadEntries])
  );

  const summary = useMemo(() => buildJournalSummary(entries), [entries]);

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: theme.background }]}>
      <StatusBar barStyle={statusBarStyle} />
      <View pointerEvents="none" style={[styles.auraTop, { backgroundColor: theme.aura }]} />
      <View pointerEvents="none" style={[styles.auraBottom, { backgroundColor: theme.auraSoft }]} />
      <ScrollView bounces={false} contentContainerStyle={styles.content}>
        <Text style={[styles.title, { color: theme.textPrimary }]}>{copy.journal.title}</Text>
        <Text style={[styles.subtitle, { color: theme.textSecondary }]}>{copy.journal.subtitle}</Text>

        <GlassCard style={styles.summaryCard} theme={theme}>
          <Text style={[styles.summaryEyebrow, { color: theme.textMuted }]}>Recent emotional weather</Text>
          <View style={styles.summaryTopRow}>
            <View>
              <Text style={[styles.summaryLabel, { color: theme.textMuted }]}>{copy.journal.topEmotion}</Text>
              <Text style={[styles.summaryValue, { color: theme.textPrimary }]}>{summary.topEmotion}</Text>
            </View>
            <View style={[styles.summaryDivider, { backgroundColor: theme.border }]} />
            <View>
              <Text style={[styles.summaryLabel, { color: theme.textMuted }]}>{copy.journal.topPattern}</Text>
              <Text style={[styles.summaryValue, { color: theme.textPrimary }]}>{titleCase(summary.topPattern)}</Text>
            </View>
          </View>
        </GlassCard>

        {entries.length === 0 ? (
          <GlassCard style={styles.emptyCard} theme={theme}>
            <Text style={[styles.emptyTitle, { color: theme.textPrimary }]}>{copy.journal.emptyTitle}</Text>
            <Text style={[styles.emptyBody, { color: theme.textSecondary }]}>{copy.journal.emptyBody}</Text>
          </GlassCard>
        ) : (
          entries.map((entry) => (
            <Pressable
              key={entry.id}
              onPress={() => {
                router.push(`/journal/${entry.id}`);
              }}
            >
              <GlassCard style={styles.entryCard} theme={theme}>
                <View
                  style={[
                    styles.colorRail,
                    {
                      backgroundColor: entry.emotionProfile.bodyColor
                    }
                  ]}
                />
                <View style={styles.entryHeader}>
                  <Text style={[styles.timestamp, { color: theme.textMuted }]}>{formatTimestamp(entry.timestamp)}</Text>
                  <Text
                    style={[
                      styles.badge,
                      {
                        color: theme.textMuted,
                        borderColor: theme.borderStrong
                      }
                    ]}
                  >
                    {entry.source === "emotion_log" ? copy.journal.logBadge : copy.journal.reflectBadge}
                  </Text>
                </View>

                <Text style={[styles.entrySummary, { color: theme.textPrimary }]}>
                  {truncate(entry.journalEntry.summary, 108)}
                </Text>
                <Text style={[styles.entryThought, { color: theme.textSecondary }]}>
                  {truncate(entry.originalThought, 96)}
                </Text>

                <View style={styles.metaRow}>
                  <Text style={[styles.metaChip, { color: theme.textPrimary }]}>
                    {titleCase(entry.emotionProfile.primaryEmotion)}
                  </Text>
                  <Text style={[styles.metaChip, { color: theme.textSecondary }]}>
                    {titleCase(entry.emotionProfile.secondaryEmotion)}
                  </Text>
                </View>

                <View style={styles.footerRow}>
                  <Text style={[styles.footerText, { color: theme.textMuted }]}>{entry.verdict}</Text>
                  <Text style={[styles.footerText, { color: theme.textMuted }]}>
                    {titleCase(entry.primaryPattern)}
                  </Text>
                  <Text style={[styles.footerText, { color: theme.textMuted }]}>
                    Need: {titleCase(entry.emotionProfile.underlyingNeed)}
                  </Text>
                </View>
              </GlassCard>
            </Pressable>
          ))
        )}
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
    paddingBottom: spacing.xxxl + 60
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
  summaryCard: {
    marginBottom: spacing.lg
  },
  summaryEyebrow: {
    fontSize: 11,
    letterSpacing: 1,
    marginBottom: spacing.sm,
    textTransform: "uppercase"
  },
  summaryTopRow: {
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "space-between"
  },
  summaryLabel: {
    fontSize: typography.caption.fontSize,
    marginBottom: 2
  },
  summaryValue: {
    fontSize: 20,
    fontWeight: "700"
  },
  summaryDivider: {
    height: 34,
    width: 1
  },
  emptyCard: {
    alignItems: "center",
    paddingVertical: spacing.xxl
  },
  emptyTitle: {
    fontSize: typography.title.fontSize,
    fontWeight: typography.title.fontWeight,
    marginBottom: spacing.sm
  },
  emptyBody: {
    fontSize: typography.body.fontSize,
    lineHeight: typography.body.lineHeight,
    textAlign: "center"
  },
  entryCard: {
    marginBottom: spacing.md,
    overflow: "hidden",
    paddingLeft: spacing.xl + 4
  },
  colorRail: {
    borderRadius: 999,
    height: 64,
    left: spacing.md,
    position: "absolute",
    top: spacing.md,
    width: 4
  },
  entryHeader: {
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: spacing.sm
  },
  timestamp: {
    fontSize: typography.caption.fontSize
  },
  badge: {
    borderRadius: 999,
    borderWidth: 1,
    fontSize: 10,
    overflow: "hidden",
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    textTransform: "uppercase"
  },
  entrySummary: {
    fontSize: 17,
    fontWeight: "600",
    lineHeight: 25,
    marginBottom: spacing.xs
  },
  entryThought: {
    fontSize: typography.body.fontSize,
    lineHeight: typography.body.lineHeight,
    marginBottom: spacing.sm
  },
  metaRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginBottom: spacing.sm
  },
  metaChip: {
    borderRadius: 999,
    fontSize: typography.caption.fontSize,
    marginRight: spacing.md
  },
  footerRow: {
    flexDirection: "row",
    flexWrap: "wrap"
  },
  footerText: {
    fontSize: 11,
    marginRight: spacing.md
  },
  auraTop: {
    borderRadius: 999,
    height: 260,
    position: "absolute",
    right: -80,
    top: -100,
    width: 260
  },
  auraBottom: {
    borderRadius: 999,
    bottom: -120,
    height: 240,
    left: -100,
    position: "absolute",
    width: 240
  }
});
