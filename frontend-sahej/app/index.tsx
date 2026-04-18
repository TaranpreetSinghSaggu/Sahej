import { router } from "expo-router";
import { StatusBar } from "react-native";
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useState } from "react";

import { ThoughtInput } from "../src/components/ThoughtInput";
import { copy } from "../src/constants/copy";
import { spacing } from "../src/theme/spacing";
import { defaultTheme } from "../src/theme/theme";
import { typography } from "../src/theme/typography";

export default function HomeScreen() {
  const [thought, setThought] = useState("");
  const [showError, setShowError] = useState(false);
  const isReflectDisabled = thought.trim().length === 0;

  const handleReflect = () => {
    const trimmedThought = thought.trim();

    if (!trimmedThought) {
      setShowError(true);
      return;
    }

    setShowError(false);
    router.push({
      pathname: "/reflect",
      params: {
        thought: trimmedThought
      }
    });
  };

  const handleThoughtChange = (value: string) => {
    setThought(value);

    if (showError && value.trim()) {
      setShowError(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="light-content" />
      <View pointerEvents="none" style={styles.auraTop} />
      <View pointerEvents="none" style={styles.auraBottom} />
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        style={styles.flex}
      >
        <ScrollView
          bounces={false}
          contentContainerStyle={styles.content}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.hero}>
            <Text style={styles.title}>{copy.home.title}</Text>
            <Text style={styles.subtitle}>{copy.home.subtitle}</Text>
          </View>

          <ThoughtInput
            error={showError ? copy.home.validation : undefined}
            onChangeText={handleThoughtChange}
            placeholder={copy.home.placeholder}
            theme={defaultTheme}
            value={thought}
          />

          <Pressable
            accessibilityState={{ disabled: isReflectDisabled }}
            disabled={isReflectDisabled}
            onPress={handleReflect}
            style={[styles.primaryButton, isReflectDisabled && styles.primaryButtonDisabled]}
          >
            <Text style={styles.primaryButtonText}>{copy.home.primaryAction}</Text>
          </Pressable>

          <Text style={styles.footerNote}>{copy.home.footer}</Text>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: defaultTheme.background
  },
  flex: {
    flex: 1
  },
  content: {
    flexGrow: 1,
    justifyContent: "center",
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.xxl
  },
  hero: {
    marginBottom: spacing.xl
  },
  title: {
    color: defaultTheme.textPrimary,
    fontSize: typography.display.fontSize,
    fontWeight: typography.display.fontWeight,
    letterSpacing: typography.display.letterSpacing,
    marginBottom: spacing.sm
  },
  subtitle: {
    color: defaultTheme.textSecondary,
    fontSize: typography.body.fontSize,
    lineHeight: typography.body.lineHeight
  },
  primaryButton: {
    alignItems: "center",
    backgroundColor: defaultTheme.accent,
    borderRadius: 18,
    marginTop: spacing.lg,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    shadowColor: defaultTheme.accent,
    shadowOffset: {
      width: 0,
      height: 10
    },
    shadowOpacity: 0.28,
    shadowRadius: 22,
    elevation: 6
  },
  primaryButtonDisabled: {
    opacity: 0.45
  },
  primaryButtonText: {
    color: defaultTheme.textPrimary,
    fontSize: typography.button.fontSize,
    fontWeight: typography.button.fontWeight,
    letterSpacing: typography.button.letterSpacing
  },
  footerNote: {
    color: defaultTheme.textMuted,
    fontSize: typography.caption.fontSize,
    lineHeight: typography.caption.lineHeight,
    marginTop: spacing.lg,
    textAlign: "center"
  },
  auraTop: {
    position: "absolute",
    top: -120,
    right: -40,
    width: 240,
    height: 240,
    borderRadius: 999,
    backgroundColor: defaultTheme.aura
  },
  auraBottom: {
    position: "absolute",
    bottom: -160,
    left: -80,
    width: 280,
    height: 280,
    borderRadius: 999,
    backgroundColor: defaultTheme.auraSoft
  }
});
