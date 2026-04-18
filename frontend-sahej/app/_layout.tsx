import { Stack } from "expo-router";

import { defaultTheme } from "../src/theme/theme";

export default function RootLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        animation: "fade_from_bottom",
        contentStyle: {
          backgroundColor: defaultTheme.background
        }
      }}
    />
  );
}
