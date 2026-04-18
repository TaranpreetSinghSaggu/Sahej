import { ActivityIndicator, StyleSheet, Text } from "react-native";

import { GlassCard } from "./GlassCard";
import { spacing } from "../theme/spacing";
import { AppTheme, defaultTheme } from "../theme/theme";
import { typography } from "../theme/typography";

interface LockCountdownProps {
  label: string;
  count?: string;
  helperText?: string | null;
  isLoading?: boolean;
  theme?: AppTheme;
}

export function LockCountdown({
  label,
  count,
  helperText,
  isLoading = false,
  theme = defaultTheme
}: LockCountdownProps) {
  return (
    <GlassCard style={styles.card} theme={theme}>
      <Text style={[styles.label, { color: theme.textSecondary }]}>{label}</Text>
      {isLoading ? (
        <ActivityIndicator color={theme.accent} size="large" />
      ) : count ? (
        <Text style={[styles.count, { color: theme.textPrimary }]}>{count}</Text>
      ) : null}
      {helperText ? (
        <Text style={[styles.helperText, { color: theme.textMuted }]}>{helperText}</Text>
      ) : null}
    </GlassCard>
  );
}

const styles = StyleSheet.create({
  card: {
    alignItems: "center",
    marginBottom: spacing.lg,
    paddingVertical: spacing.xxl
  },
  label: {
    fontSize: typography.title.fontSize,
    fontWeight: typography.title.fontWeight,
    marginBottom: spacing.md
  },
  count: {
    fontSize: 72,
    fontWeight: "700",
    letterSpacing: -2
  },
  helperText: {
    fontSize: typography.caption.fontSize,
    lineHeight: typography.caption.lineHeight,
    marginTop: spacing.md,
    textAlign: "center"
  }
});
