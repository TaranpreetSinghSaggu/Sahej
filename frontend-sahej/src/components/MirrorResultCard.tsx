import { StyleSheet, Text, View } from "react-native";

import { ReflectionResult } from "../features/reflection/types";
import { GlassCard } from "./GlassCard";
import { spacing } from "../theme/spacing";
import { AppTheme, defaultTheme } from "../theme/theme";
import { typography } from "../theme/typography";

interface MirrorResultCardProps {
  result: ReflectionResult;
  theme?: AppTheme;
}

const formatPattern = (value: ReflectionResult["primaryPattern"]) =>
  value
    .split("_")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");

export function MirrorResultCard({
  result,
  theme = defaultTheme
}: MirrorResultCardProps) {
  return (
    <GlassCard theme={theme}>
      <Text style={[styles.heading, { color: theme.textPrimary }]}>Mirror</Text>

      <View style={[styles.row, { borderBottomColor: theme.border }]}>
        <Text style={[styles.label, { color: theme.textMuted }]}>verdict</Text>
        <Text style={[styles.value, { color: theme.textPrimary }]}>{result.verdict}</Text>
      </View>

      <View style={[styles.row, { borderBottomColor: theme.border }]}>
        <Text style={[styles.label, { color: theme.textMuted }]}>primaryPattern</Text>
        <Text style={[styles.value, { color: theme.textPrimary }]}>
          {formatPattern(result.primaryPattern)}
        </Text>
      </View>

      <View style={[styles.row, { borderBottomColor: theme.border }]}>
        <Text style={[styles.label, { color: theme.textMuted }]}>intensity</Text>
        <Text style={[styles.value, { color: theme.textPrimary }]}>{result.intensity} / 5</Text>
      </View>

      <View style={[styles.block, { borderBottomColor: theme.border }]}>
        <Text style={[styles.label, { color: theme.textMuted }]}>mirrorLine</Text>
        <Text style={[styles.body, { color: theme.textSecondary }]}>{result.mirrorLine}</Text>
      </View>

      <View style={[styles.block, { borderBottomColor: theme.border }]}>
        <Text style={[styles.label, { color: theme.textMuted }]}>reframePrompt</Text>
        <Text style={[styles.body, { color: theme.textSecondary }]}>
          {result.reframePrompt}
        </Text>
      </View>

      <View style={styles.row}>
        <Text style={[styles.label, { color: theme.textMuted }]}>dopamineDrain</Text>
        <Text style={[styles.value, { color: theme.textPrimary }]}>
          {result.dopamineDrain ? "Yes" : "No"}
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
  row: {
    borderBottomWidth: StyleSheet.hairlineWidth,
    paddingVertical: spacing.md
  },
  block: {
    borderBottomWidth: StyleSheet.hairlineWidth,
    paddingVertical: spacing.md
  },
  label: {
    fontSize: typography.caption.fontSize,
    fontWeight: typography.caption.fontWeight,
    letterSpacing: 1,
    marginBottom: spacing.xs
  },
  value: {
    fontSize: typography.body.fontSize,
    fontWeight: "600",
    lineHeight: typography.body.lineHeight
  },
  body: {
    fontSize: typography.body.fontSize,
    lineHeight: typography.body.lineHeight
  }
});
