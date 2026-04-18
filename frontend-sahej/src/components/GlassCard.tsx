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
    borderRadius: 26,
    borderWidth: 1,
    padding: spacing.lg,
    shadowOffset: {
      width: 0,
      height: 16
    },
    shadowOpacity: 0.22,
    shadowRadius: 34,
    elevation: 10
  }
});

function createCardStyle(theme: AppTheme): ViewStyle {
  const isLightSurface = theme.background.startsWith("#f");

  return {
    backgroundColor: theme.card,
    borderColor: theme.border,
    shadowColor: theme.shadow,
    ...(isLightSurface
      ? {
          borderWidth: 1,
          shadowOpacity: 0.14
        }
      : {
          shadowOpacity: 0.24
        })
  };
}
