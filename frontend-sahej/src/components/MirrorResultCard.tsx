import { StyleSheet, Text, View } from "react-native";

import { ReflectionResult } from "../features/reflection/types";
import { spacing } from "../theme/spacing";
import { AppTheme, defaultTheme } from "../theme/theme";
import { typography } from "../theme/typography";
import { GlassCard } from "./GlassCard";

interface MirrorResultCardProps {
  result: ReflectionResult;
  theme?: AppTheme;
}

const formatPattern = (value: ReflectionResult["primaryPattern"]) =>
  value
    .split("_")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");

function titleCase(value: string) {
  return value
    .split("_")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

function hexToRgba(hexColor: string, alpha: number) {
  const normalizedColor = hexColor.replace("#", "");
  const red = parseInt(normalizedColor.slice(0, 2), 16);
  const green = parseInt(normalizedColor.slice(2, 4), 16);
  const blue = parseInt(normalizedColor.slice(4, 6), 16);

  return `rgba(${red}, ${green}, ${blue}, ${alpha})`;
}

export function MirrorResultCard({
  result,
  theme = defaultTheme
}: MirrorResultCardProps) {
  const emotionAccentSurface = hexToRgba(result.emotionProfile.bodyColor, 0.14);
  const emotionAccentBorder = hexToRgba(result.emotionProfile.bodyColor, 0.34);

  return (
    <GlassCard theme={theme}>
      <Text style={[styles.heading, { color: theme.textPrimary }]}>Mirror</Text>

      <View style={styles.topMeta}>
        <View style={[styles.metaPill, { borderColor: theme.borderStrong, backgroundColor: theme.infoSurface }]}>
          <Text style={[styles.metaLabel, { color: theme.textMuted }]}>Verdict</Text>
          <Text style={[styles.metaValue, { color: theme.textPrimary }]}>{result.verdict}</Text>
        </View>
        <View style={[styles.metaPill, { borderColor: theme.borderStrong, backgroundColor: theme.infoSurface }]}>
          <Text style={[styles.metaLabel, { color: theme.textMuted }]}>Pattern</Text>
          <Text style={[styles.metaValue, { color: theme.textPrimary }]}>{formatPattern(result.primaryPattern)}</Text>
        </View>
        <View style={[styles.metaPill, { borderColor: theme.borderStrong, backgroundColor: theme.infoSurface }]}>
          <Text style={[styles.metaLabel, { color: theme.textMuted }]}>Intensity</Text>
          <Text style={[styles.metaValue, { color: theme.textPrimary }]}>{result.intensity} / 5</Text>
        </View>
      </View>

      <View
        style={[
          styles.emotionCard,
          {
            backgroundColor: emotionAccentSurface,
            borderColor: emotionAccentBorder
          }
        ]}
      >
        <View style={styles.emotionHeader}>
          <View
            style={[
              styles.colorSwatch,
              {
                backgroundColor: result.emotionProfile.bodyColor,
                borderColor: emotionAccentBorder
              }
            ]}
          />
          <View>
            <Text style={[styles.sectionTitle, { color: theme.textMuted }]}>What you are feeling</Text>
            <Text style={[styles.sectionBodyStrong, { color: theme.textPrimary }]}>
              {titleCase(result.emotionProfile.primaryEmotion)} to {titleCase(result.emotionProfile.secondaryEmotion)}
            </Text>
          </View>
        </View>

        <Text style={[styles.sectionTitle, { color: theme.textMuted }]}>What you need</Text>
        <Text style={[styles.sectionBodyStrong, { color: theme.textPrimary }]}>
          {titleCase(result.emotionProfile.underlyingNeed)}
        </Text>
        <Text style={[styles.sectionBody, { color: theme.textSecondary }]}>
          {result.emotionProfile.explanation}
        </Text>
      </View>

      <View style={[styles.block, { borderBottomColor: theme.border }]}>
        <Text style={[styles.sectionTitle, { color: theme.textMuted }]}>Mirror line</Text>
        <Text style={[styles.sectionBodyStrong, { color: theme.textPrimary }]}>{result.mirrorLine}</Text>
      </View>

      <View style={[styles.block, { borderBottomColor: theme.border }]}>
        <Text style={[styles.sectionTitle, { color: theme.textMuted }]}>Next step</Text>
        <Text style={[styles.sectionBodyStrong, { color: theme.textPrimary }]}>{result.reframePrompt}</Text>
      </View>

      <View style={[styles.block, { borderBottomColor: theme.border }]}>
        <Text style={[styles.sectionTitle, { color: theme.textMuted }]}>Journal summary</Text>
        <Text style={[styles.sectionBody, { color: theme.textSecondary }]}>
          {result.journalEntry.summary}
        </Text>
      </View>

      <View style={styles.block}>
        <Text style={[styles.sectionTitle, { color: theme.textMuted }]}>Awareness prompt</Text>
        <Text style={[styles.sectionBody, { color: theme.textSecondary }]}>
          {result.journalEntry.awarenessPrompt}
        </Text>
      </View>
    </GlassCard>
  );
}

const styles = StyleSheet.create({
  heading: {
    fontSize: typography.title.fontSize,
    fontWeight: typography.title.fontWeight,
    marginBottom: spacing.lg
  },
  topMeta: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginBottom: spacing.md
  },
  metaPill: {
    borderRadius: 14,
    borderWidth: 1,
    marginBottom: spacing.xs,
    marginRight: spacing.sm,
    minWidth: 94,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs
  },
  metaLabel: {
    fontSize: 10,
    letterSpacing: 0.8,
    textTransform: "uppercase"
  },
  metaValue: {
    fontSize: 13,
    fontWeight: "700"
  },
  emotionCard: {
    borderRadius: 20,
    borderWidth: 1,
    marginBottom: spacing.md,
    padding: spacing.lg
  },
  emotionHeader: {
    alignItems: "center",
    flexDirection: "row",
    marginBottom: spacing.md
  },
  colorSwatch: {
    borderRadius: 999,
    borderWidth: 1,
    height: 34,
    marginRight: spacing.md,
    width: 34
  },
  block: {
    borderBottomWidth: StyleSheet.hairlineWidth,
    paddingVertical: spacing.md
  },
  sectionTitle: {
    fontSize: typography.caption.fontSize,
    fontWeight: typography.caption.fontWeight,
    letterSpacing: 0.9,
    marginBottom: spacing.xs,
    textTransform: "uppercase"
  },
  sectionBody: {
    fontSize: typography.body.fontSize,
    lineHeight: typography.body.lineHeight
  },
  sectionBodyStrong: {
    fontSize: typography.body.fontSize,
    fontWeight: "600",
    lineHeight: typography.body.lineHeight
  }
});
