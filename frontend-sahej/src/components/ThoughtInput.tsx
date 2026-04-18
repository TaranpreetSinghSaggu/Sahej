import { StyleSheet, Text, TextInput } from "react-native";

import { GlassCard } from "./GlassCard";
import { spacing } from "../theme/spacing";
import { AppTheme, defaultTheme } from "../theme/theme";
import { typography } from "../theme/typography";

interface ThoughtInputProps {
  value: string;
  onChangeText: (value: string) => void;
  placeholder: string;
  error?: string;
  theme?: AppTheme;
}

export function ThoughtInput({
  value,
  onChangeText,
  placeholder,
  error,
  theme = defaultTheme
}: ThoughtInputProps) {
  return (
    <GlassCard theme={theme}>
      <Text style={[styles.label, { color: theme.textMuted }]}>Thought</Text>
      <TextInput
        multiline
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={theme.textMuted}
        selectionColor={theme.accent}
        style={[styles.input, { color: theme.textPrimary }]}
        textAlignVertical="top"
        value={value}
      />
      {error ? <Text style={[styles.error, { color: theme.danger }]}>{error}</Text> : null}
    </GlassCard>
  );
}

const styles = StyleSheet.create({
  label: {
    fontSize: typography.caption.fontSize,
    fontWeight: typography.caption.fontWeight,
    letterSpacing: 1.2,
    marginBottom: spacing.md,
    textTransform: "uppercase"
  },
  input: {
    fontSize: typography.body.fontSize,
    lineHeight: typography.body.lineHeight,
    minHeight: 160
  },
  error: {
    fontSize: typography.caption.fontSize,
    lineHeight: typography.caption.lineHeight,
    marginTop: spacing.md
  }
});
