import { ReactNode } from "react";
import { StyleProp, StyleSheet, View, ViewStyle } from "react-native";

import { spacing } from "../theme/spacing";
import { AppTheme, defaultTheme } from "../theme/theme";

interface GlassCardProps {
  children: ReactNode;
  style?: StyleProp<ViewStyle>;
  theme?: AppTheme;
}

export function GlassCard({
  children,
  style,
  theme = defaultTheme
}: GlassCardProps) {
  return <View style={[styles.card, createCardStyle(theme), style]}>{children}</View>;
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 24,
    borderWidth: 1,
    padding: spacing.lg,
    shadowOffset: {
      width: 0,
      height: 14
    },
    shadowOpacity: 0.2,
    shadowRadius: 28,
    elevation: 8
  }
});

function createCardStyle(theme: AppTheme): ViewStyle {
  return {
    backgroundColor: theme.card,
    borderColor: theme.border,
    shadowColor: theme.shadow
  };
}
