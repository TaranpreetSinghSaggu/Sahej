import { useFocusEffect } from "@react-navigation/native";
import { useCallback, useMemo, useState } from "react";
import { StatusBar } from "react-native";
import { ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { GlassCard } from "../../src/components/GlassCard";
import {
  EMOTION_CATALOG,
  EmotionCatalogItem,
  getEmotionDiscovery
} from "../../src/features/journal/emotionCatalog";
import { JournalRecord, listJournalEntries } from "../../src/lib/journalStore";
import { spacing } from "../../src/theme/spacing";
import { useThemePreference } from "../../src/theme/ThemeProvider";
import { typography } from "../../src/theme/typography";

function normalizeEmotion(value: string) {
  return value.trim().toLowerCase().replace(/\s+/g, "_");
}

function toGrayscale(hexColor: string) {
  const normalized = hexColor.replace("#", "");
  const red = parseInt(normalized.slice(0, 2), 16);
  const green = parseInt(normalized.slice(2, 4), 16);
  const blue = parseInt(normalized.slice(4, 6), 16);
  const average = Math.round((red + green + blue) / 3);
  const grayscale = average.toString(16).padStart(2, "0").toUpperCase();
  return `#${grayscale}${grayscale}${grayscale}`;
}

function isRecentlyFelt(item: EmotionCatalogItem, recentEmotionIds: Set<string>) {
  return recentEmotionIds.has(item.id) || recentEmotionIds.has(normalizeEmotion(item.label));
}

export default function EmotionsScreen() {
  const { theme, statusBarStyle } = useThemePreference();
  const [entries, setEntries] = useState<JournalRecord[]>([]);

  useFocusEffect(
    useCallback(() => {
      let isMounted = true;

      const loadEntries = async () => {
        const nextEntries = await listJournalEntries(120);

        if (isMounted) {
          setEntries(nextEntries);
        }
      };

      void loadEntries();

      return () => {
        isMounted = false;
      };
    }, [])
  );

  const discovery = useMemo(() => getEmotionDiscovery(entries), [entries]);

  const recentEmotionIds = useMemo(() => {
    return entries.slice(0, 6).reduce((set, entry) => {
      set.add(normalizeEmotion(entry.emotionProfile.primaryEmotion));
      set.add(normalizeEmotion(entry.emotionProfile.secondaryEmotion));
      return set;
    }, new Set<string>());
  }, [entries]);

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: theme.background }]}>
      <StatusBar barStyle={statusBarStyle} />
      <View pointerEvents="none" style={[styles.aura, { backgroundColor: theme.auraSoft }]} />
      <ScrollView bounces={false} contentContainerStyle={styles.content}>
        <Text style={[styles.title, { color: theme.textPrimary }]}>Emotion Library</Text>
        <Text style={[styles.subtitle, { color: theme.textSecondary }]}>
          Awareness brings color to inner life. Emotions appear in color when you have met them in reflection.
        </Text>

        <GlassCard style={styles.sectionCard} theme={theme}>
          <Text style={[styles.sectionTitle, { color: theme.textPrimary }]}>Found</Text>
          <Text style={[styles.sectionBody, { color: theme.textMuted }]}>
            {discovery.discovered.length} of {EMOTION_CATALOG.length} emotional states recognized.
          </Text>
          <View style={styles.cardList}>
            {discovery.discovered.map((item) => {
              const recent = isRecentlyFelt(item, recentEmotionIds);

              return (
                <View
                  key={item.id}
                  style={[
                    styles.emotionCard,
                    {
                      borderColor: recent ? item.color : theme.borderStrong,
                      backgroundColor: `${item.color}18`
                    }
                  ]}
                >
                  <View style={styles.headerRow}>
                    <View style={[styles.colorChip, { backgroundColor: item.color }]} />
                    <Text style={[styles.emotionLabel, { color: theme.textPrimary }]}>{item.label}</Text>
                    {recent ? <Text style={[styles.recentLabel, { color: theme.textMuted }]}>Recent</Text> : null}
                  </View>
                  <Text style={[styles.emotionMeta, { color: theme.textMuted }]}>
                    {item.category} | {item.shapeFamily} form
                  </Text>
                  <Text style={[styles.emotionBody, { color: theme.textSecondary }]}>{item.description}</Text>
                  <Text style={[styles.distinction, { color: theme.textMuted }]}>{item.distinction}</Text>
                </View>
              );
            })}
          </View>
        </GlassCard>

        <GlassCard theme={theme}>
          <Text style={[styles.sectionTitle, { color: theme.textPrimary }]}>Still hidden</Text>
          <Text style={[styles.sectionBody, { color: theme.textMuted }]}>
            These tones are muted until they appear in your journal.
          </Text>
          <View style={styles.cardList}>
            {discovery.hidden.map((item) => {
              const mutedColor = toGrayscale(item.color);

              return (
                <View
                  key={item.id}
                  style={[
                    styles.emotionCard,
                    {
                      borderColor: theme.border,
                      backgroundColor: `${mutedColor}18`
                    }
                  ]}
                >
                  <View style={styles.headerRow}>
                    <View style={[styles.colorChip, { backgroundColor: mutedColor }]} />
                    <Text style={[styles.emotionLabel, { color: theme.textSecondary }]}>{item.label}</Text>
                  </View>
                  <Text style={[styles.emotionMeta, { color: theme.textMuted }]}>
                    {item.category} | {item.shapeFamily} form
                  </Text>
                  <Text style={[styles.emotionBody, { color: theme.textMuted }]}>{item.description}</Text>
                </View>
              );
            })}
          </View>
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
  sectionCard: {
    marginBottom: spacing.lg
  },
  sectionTitle: {
    fontSize: typography.body.fontSize,
    fontWeight: "700",
    marginBottom: spacing.xs
  },
  sectionBody: {
    fontSize: typography.caption.fontSize,
    lineHeight: typography.caption.lineHeight,
    marginBottom: spacing.md
  },
  cardList: {
    gap: spacing.sm
  },
  emotionCard: {
    borderRadius: 16,
    borderWidth: 1,
    padding: spacing.md
  },
  headerRow: {
    alignItems: "center",
    flexDirection: "row",
    marginBottom: spacing.xs
  },
  colorChip: {
    width: 12,
    height: 12,
    borderRadius: 999,
    marginRight: spacing.xs
  },
  emotionLabel: {
    flex: 1,
    fontSize: typography.body.fontSize,
    fontWeight: "600"
  },
  recentLabel: {
    fontSize: 10,
    textTransform: "uppercase",
    letterSpacing: 0.8
  },
  emotionMeta: {
    fontSize: typography.caption.fontSize,
    lineHeight: typography.caption.lineHeight,
    marginBottom: spacing.xs,
    textTransform: "capitalize"
  },
  emotionBody: {
    fontSize: typography.body.fontSize,
    lineHeight: typography.body.lineHeight
  },
  distinction: {
    fontSize: typography.caption.fontSize,
    lineHeight: typography.caption.lineHeight,
    marginTop: spacing.sm
  },
  aura: {
    position: "absolute",
    top: -110,
    right: -90,
    width: 300,
    height: 300,
    borderRadius: 999
  }
});
