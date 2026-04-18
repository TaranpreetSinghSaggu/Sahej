import { useEffect, useRef } from "react";
import { Animated, StyleSheet, Text, View } from "react-native";

import { GlassCard } from "./GlassCard";
import { spacing } from "../theme/spacing";
import { AppTheme, defaultTheme } from "../theme/theme";
import { typography } from "../theme/typography";

interface CalmInterventionOverlayProps {
  body: string;
  title: string;
  theme?: AppTheme;
  visible: boolean;
}

export function CalmInterventionOverlay({
  body,
  title,
  theme = defaultTheme,
  visible
}: CalmInterventionOverlayProps) {
  const pulse = useRef(new Animated.Value(0)).current;
  const shimmer = useRef(new Animated.Value(0)).current;
  const isLight = theme.background.startsWith("#f");

  useEffect(() => {
    if (!visible) {
      pulse.stopAnimation();
      shimmer.stopAnimation();
      pulse.setValue(0);
      shimmer.setValue(0);
      return;
    }

    const animation = Animated.loop(
      Animated.sequence([
        Animated.timing(pulse, {
          toValue: 1,
          duration: 900,
          useNativeDriver: true
        }),
        Animated.timing(pulse, {
          toValue: 0,
          duration: 900,
          useNativeDriver: true
        })
      ])
    );

    const shimmerAnimation = Animated.loop(
      Animated.sequence([
        Animated.timing(shimmer, {
          toValue: 1,
          duration: 1200,
          useNativeDriver: true
        }),
        Animated.timing(shimmer, {
          toValue: 0,
          duration: 1200,
          useNativeDriver: true
        })
      ])
    );

    animation.start();
    shimmerAnimation.start();

    return () => {
      animation.stop();
      shimmerAnimation.stop();
      pulse.stopAnimation();
      shimmer.stopAnimation();
      pulse.setValue(0);
      shimmer.setValue(0);
    };
  }, [pulse, shimmer, visible]);

  if (!visible) {
    return null;
  }

  const pulseScale = pulse.interpolate({
    inputRange: [0, 1],
    outputRange: [0.92, 1.08]
  });
  const pulseOpacity = pulse.interpolate({
    inputRange: [0, 1],
    outputRange: [0.2, 0.38]
  });
  const shimmerOpacity = shimmer.interpolate({
    inputRange: [0, 1],
    outputRange: [0.24, 0.46]
  });

  return (
    <View
      pointerEvents="none"
      style={[
        styles.overlay,
        {
          backgroundColor: isLight ? "rgba(246, 241, 235, 0.93)" : "rgba(8, 7, 10, 0.95)"
        }
      ]}
    >
      <Animated.View
        style={[
          styles.warmAuraLarge,
          {
            backgroundColor: isLight ? "rgba(250, 165, 176, 0.3)" : "rgba(255, 122, 173, 0.26)",
            opacity: shimmerOpacity
          }
        ]}
      />
      <Animated.View
        style={[
          styles.warmAuraSmall,
          {
            backgroundColor: isLight ? "rgba(255, 198, 155, 0.34)" : "rgba(255, 197, 168, 0.3)",
            opacity: pulseOpacity
          }
        ]}
      />
      <Animated.View
        style={[
          styles.pulse,
          {
            backgroundColor: theme.aura,
            opacity: pulseOpacity,
            transform: [{ scale: pulseScale }]
          }
        ]}
      />
      <GlassCard style={styles.card} theme={theme}>
        <Text style={[styles.title, { color: theme.textPrimary }]}>{title}</Text>
        <Text style={[styles.body, { color: theme.textSecondary }]}>{body}</Text>
        <Text style={[styles.supportLine, { color: theme.textMuted }]}>breathe | soften | return</Text>
      </GlassCard>
    </View>
  );
}

const styles = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFillObject,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: spacing.xl
  },
  warmAuraLarge: {
    borderRadius: 999,
    height: 420,
    position: "absolute",
    top: "26%",
    width: 420
  },
  warmAuraSmall: {
    borderRadius: 999,
    height: 280,
    position: "absolute",
    top: "35%",
    width: 280
  },
  pulse: {
    borderRadius: 999,
    height: 360,
    position: "absolute",
    width: 360
  },
  card: {
    alignItems: "center",
    maxWidth: 360,
    paddingVertical: spacing.xxxl
  },
  title: {
    fontSize: 50,
    fontWeight: typography.display.fontWeight,
    letterSpacing: 0.5,
    marginBottom: spacing.md,
    textAlign: "center"
  },
  body: {
    fontSize: 20,
    lineHeight: 30,
    maxWidth: 300,
    textAlign: "center"
  },
  supportLine: {
    fontSize: 12,
    letterSpacing: 1.8,
    marginTop: spacing.lg,
    textAlign: "center",
    textTransform: "uppercase"
  }
});
