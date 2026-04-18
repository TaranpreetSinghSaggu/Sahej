import { router } from "expo-router";
import { useState } from "react";
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

import { ThoughtInput } from "../../src/components/ThoughtInput";
import { copy } from "../../src/constants/copy";
import { spacing } from "../../src/theme/spacing";
import { useThemePreference } from "../../src/theme/ThemeProvider";
import { typography } from "../../src/theme/typography";

export default function HomeScreen() {
  const { theme, statusBarStyle } = useThemePreference();
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

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: theme.background }]}>
      <StatusBar barStyle={statusBarStyle} />
      <View pointerEvents="none" style={[styles.auraTop, { backgroundColor: theme.aura }]} />
      <View pointerEvents="none" style={[styles.auraBottom, { backgroundColor: theme.auraSoft }]} />
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        style={styles.flex}
      >
        <ScrollView bounces={false} contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
          <View style={styles.headerRow}>
            <View style={styles.hero}>
              <Text style={[styles.title, { color: theme.textPrimary }]}>{copy.home.title}</Text>
              <Text style={[styles.subtitle, { color: theme.textSecondary }]}>
                {copy.home.subtitle}
              </Text>
            </View>
            <Pressable
              onPress={() => {
                router.push("/settings");
              }}
              style={[styles.settingsButton, { borderColor: theme.borderStrong }]}
            >
              <Text style={[styles.settingsText, { color: theme.textPrimary }]}>⚙</Text>
            </Pressable>
          </View>

          <ThoughtInput
            error={showError ? copy.home.validation : undefined}
            onChangeText={(value) => {
              setThought(value);

              if (showError && value.trim()) {
                setShowError(false);
              }
            }}
            placeholder={copy.home.placeholder}
            theme={theme}
            value={thought}
          />

          <Pressable
            accessibilityState={{ disabled: isReflectDisabled }}
            disabled={isReflectDisabled}
            onPress={handleReflect}
            style={[
              styles.primaryButton,
              {
                backgroundColor: theme.accent,
                shadowColor: theme.accent
              },
              isReflectDisabled && styles.primaryButtonDisabled
            ]}
          >
            <Text style={[styles.primaryButtonText, { color: theme.textPrimary }]}>
              {copy.home.primaryAction}
            </Text>
          </Pressable>

          <Text style={[styles.footerNote, { color: theme.textMuted }]}>{copy.home.footer}</Text>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1
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
  headerRow: {
    alignItems: "flex-start",
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: spacing.xl
  },
  hero: {
    flex: 1,
    marginRight: spacing.md
  },
  title: {
    fontSize: typography.display.fontSize,
    fontWeight: typography.display.fontWeight,
    letterSpacing: typography.display.letterSpacing,
    marginBottom: spacing.sm
  },
  subtitle: {
    fontSize: typography.body.fontSize,
    lineHeight: typography.body.lineHeight
  },
  settingsButton: {
    alignItems: "center",
    borderRadius: 14,
    borderWidth: 1,
    height: 42,
    justifyContent: "center",
    width: 42
  },
  settingsText: {
    fontSize: 18
  },
  primaryButton: {
    alignItems: "center",
    borderRadius: 18,
    marginTop: spacing.lg,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
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
    fontSize: typography.button.fontSize,
    fontWeight: typography.button.fontWeight,
    letterSpacing: typography.button.letterSpacing
  },
  footerNote: {
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
    borderRadius: 999
  },
  auraBottom: {
    position: "absolute",
    bottom: -160,
    left: -80,
    width: 280,
    height: 280,
    borderRadius: 999
  }
});
