import { Stack } from "expo-router";

import { ThemeProvider, useThemePreference } from "../src/theme/ThemeProvider";

function RootStack() {
  const { theme } = useThemePreference();

  return (
    <Stack
      screenOptions={{
        headerShown: false,
        animation: "fade_from_bottom",
        contentStyle: {
          backgroundColor: theme.background
        }
      }}
    >
      <Stack.Screen name="(tabs)" />
      <Stack.Screen name="reflect" />
      <Stack.Screen name="result" />
      <Stack.Screen name="journal/[id]" />
      <Stack.Screen name="note/[id]" />
      <Stack.Screen name="settings" />
    </Stack>
  );
}

export default function RootLayout() {
  return (
    <ThemeProvider>
      <RootStack />
    </ThemeProvider>
  );
}
