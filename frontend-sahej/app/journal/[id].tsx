import { router, useLocalSearchParams } from "expo-router";
import { useFocusEffect } from "@react-navigation/native";
import { useCallback, useState } from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { StatusBar } from "react-native";

import { GlassCard } from "../../src/components/GlassCard";
import { copy } from "../../src/constants/copy";
import { getJournalEntryById, JournalRecord } from "../../src/lib/journalStore";
import { getRouteText } from "../../src/lib/routeParams";
import { spacing } from "../../src/theme/spacing";
import { useThemePreference } from "../../src/theme/ThemeProvider";
import { typography } from "../../src/theme/typography";

function formatTimestamp(value: string) {
  return new Date(value).toLocaleString();
}

export default function JournalDetailScreen() {
  const params = useLocalSearchParams<{ id?: string | string[] }>();
  const id = getRouteText(params.id);
  const { theme, statusBarStyle } = useThemePreference();
  const [entry, setEntry] = useState<JournalRecord | null>(null);

  useFocusEffect(
    useCallback(() => {
      let isMounted = true;

      const loadEntry = async () => {
        const nextEntry = await getJournalEntryById(id);

        if (isMounted) {
          setEntry(nextEntry);
        }
      };

      void loadEntry();

      return () => {
        isMounted = false;
      };
    }, [id])
  );

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: theme.background }]}>
      <StatusBar barStyle={statusBarStyle} />
      <ScrollView bounces={false} contentContainerStyle={styles.content}>
        <Pressable
          onPress={() => {
            router.back();
          }}
          style={[styles.backButton, { borderColor: theme.borderStrong }]}
        >
          <Text style={[styles.backButtonText, { color: theme.textPrimary }]}>Back</Text>
        </Pressable>

        {!entry ? (
          <GlassCard theme={theme}>
            <Text style={[styles.title, { color: theme.textPrimary }]}>Journal entry not found.</Text>
          </GlassCard>
        ) : (
          <>
            <GlassCard style={styles.card} theme={theme}>
              <Text style={[styles.sectionLabel, { color: theme.textMuted }]}>Timestamp</Text>
              <Text style={[styles.body, { color: theme.textPrimary }]}>
                {formatTimestamp(entry.timestamp)}
              </Text>
            </GlassCard>

            <GlassCard style={styles.card} theme={theme}>
              <Text style={[styles.sectionLabel, { color: theme.textMuted }]}>Thought</Text>
              <Text style={[styles.body, { color: theme.textPrimary }]}>{entry.originalThought}</Text>
            </GlassCard>

            <GlassCard style={styles.card} theme={theme}>
              <View style={styles.emotionHeader}>
                <Text style={[styles.sectionLabel, { color: theme.textMuted }]}>Emotion profile</Text>
                <View style={[styles.colorChip, { backgroundColor: entry.emotionProfile.bodyColor }]} />
              </View>
              <Text style={[styles.bodyStrong, { color: theme.textPrimary }]}>
                {entry.emotionProfile.primaryEmotion} to {entry.emotionProfile.secondaryEmotion}
              </Text>
              <Text style={[styles.body, { color: theme.textSecondary }]}>
                Need: {entry.emotionProfile.underlyingNeed}
              </Text>
              <Text style={[styles.body, { color: theme.textSecondary }]}>
                {entry.emotionProfile.colorName}
              </Text>
              <Text style={[styles.body, { color: theme.textSecondary }]}>
                {entry.emotionProfile.explanation}
              </Text>
            </GlassCard>

            <GlassCard style={styles.card} theme={theme}>
              <Text style={[styles.sectionLabel, { color: theme.textMuted }]}>Mirror line</Text>
              <Text style={[styles.body, { color: theme.textPrimary }]}>{entry.mirrorLine}</Text>
              <Text style={[styles.sectionLabel, { color: theme.textMuted, marginTop: spacing.md }]}>
                Reframe prompt
              </Text>
              <Text style={[styles.body, { color: theme.textPrimary }]}>{entry.reframePrompt}</Text>
            </GlassCard>

            <GlassCard style={styles.card} theme={theme}>
              <Text style={[styles.sectionLabel, { color: theme.textMuted }]}>Journal summary</Text>
              <Text style={[styles.body, { color: theme.textPrimary }]}>{entry.journalEntry.summary}</Text>
              <Text style={[styles.sectionLabel, { color: theme.textMuted, marginTop: spacing.md }]}>
                Awareness prompt
              </Text>
              <Text style={[styles.body, { color: theme.textPrimary }]}>
                {entry.journalEntry.awarenessPrompt}
              </Text>
            </GlassCard>

            <Pressable
              onPress={() => {
                router.push({
                  pathname: "/note/[id]",
                  params: {
                    id: "new",
                    linkedReflectionId: entry.id
                  }
                });
              }}
              style={[styles.expandButton, { backgroundColor: theme.accent }]}
            >
              <Text style={[styles.expandButtonText, { color: theme.textPrimary }]}>
                {copy.journal.detailAction}
              </Text>
            </Pressable>
          </>
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
    paddingTop: spacing.lg,
    paddingBottom: spacing.xxxl
  },
  backButton: {
    alignSelf: "flex-start",
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: spacing.lg,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm
  },
  backButtonText: {
    fontSize: typography.caption.fontSize,
    fontWeight: typography.caption.fontWeight
  },
  title: {
    fontSize: typography.title.fontSize,
    fontWeight: typography.title.fontWeight
  },
  card: {
    marginBottom: spacing.md
  },
  sectionLabel: {
    fontSize: typography.caption.fontSize,
    fontWeight: typography.caption.fontWeight,
    letterSpacing: 0.8,
    marginBottom: spacing.sm,
    textTransform: "uppercase"
  },
  body: {
    fontSize: typography.body.fontSize,
    lineHeight: typography.body.lineHeight
  },
  bodyStrong: {
    fontSize: typography.body.fontSize,
    fontWeight: "600",
    lineHeight: typography.body.lineHeight,
    marginBottom: spacing.xs
  },
  emotionHeader: {
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "space-between"
  },
  colorChip: {
    width: 18,
    height: 18,
    borderRadius: 999
  },
  expandButton: {
    alignItems: "center",
    borderRadius: 16,
    marginTop: spacing.sm,
    paddingVertical: spacing.md
  },
  expandButtonText: {
    fontSize: typography.button.fontSize,
    fontWeight: typography.button.fontWeight,
    letterSpacing: typography.button.letterSpacing
  }
});
