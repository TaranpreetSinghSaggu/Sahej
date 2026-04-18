export interface AppTheme {
  background: string;
  accent: string;
  textPrimary: string;
  textSecondary: string;
  textMuted: string;
  card: string;
  border: string;
  borderStrong: string;
  shadow: string;
  aura: string;
  auraSoft: string;
  danger: string;
  infoSurface: string;
  infoBorder: string;
}

export type ThemeMode = "dark" | "light";

export const darkTheme: AppTheme = {
  background: "#06070b",
  accent: "#7f5af0",
  textPrimary: "#f5f6fb",
  textSecondary: "#cbcfdf",
  textMuted: "#8f96ad",
  card: "rgba(18, 20, 30, 0.8)",
  border: "rgba(141, 123, 255, 0.2)",
  borderStrong: "rgba(141, 123, 255, 0.36)",
  shadow: "rgba(98, 67, 214, 0.42)",
  aura: "rgba(114, 90, 255, 0.2)",
  auraSoft: "rgba(114, 90, 255, 0.1)",
  danger: "#ff7f7f",
  infoSurface: "rgba(126, 113, 255, 0.11)",
  infoBorder: "rgba(126, 113, 255, 0.24)"
};

export const lightTheme: AppTheme = {
  background: "#f5f2ee",
  accent: "#635bff",
  textPrimary: "#1d2433",
  textSecondary: "#3f475d",
  textMuted: "#70788f",
  card: "rgba(255, 252, 247, 0.88)",
  border: "rgba(122, 128, 166, 0.18)",
  borderStrong: "rgba(108, 118, 166, 0.32)",
  shadow: "rgba(81, 95, 145, 0.18)",
  aura: "rgba(127, 104, 255, 0.12)",
  auraSoft: "rgba(127, 104, 255, 0.07)",
  danger: "#c6515f",
  infoSurface: "rgba(127, 104, 255, 0.1)",
  infoBorder: "rgba(127, 104, 255, 0.2)"
};

export const drainedDarkTheme: AppTheme = {
  background: "#050505",
  accent: "#8a8a90",
  textPrimary: "#f1f1f3",
  textSecondary: "#cacacf",
  textMuted: "#95959b",
  card: "rgba(24, 24, 26, 0.9)",
  border: "rgba(255, 255, 255, 0.12)",
  borderStrong: "rgba(255, 255, 255, 0.22)",
  shadow: "rgba(0, 0, 0, 0.42)",
  aura: "rgba(255, 255, 255, 0.08)",
  auraSoft: "rgba(255, 255, 255, 0.05)",
  danger: "#ffb1b1",
  infoSurface: "rgba(255, 255, 255, 0.08)",
  infoBorder: "rgba(255, 255, 255, 0.14)"
};

export const drainedLightTheme: AppTheme = {
  background: "#f1efec",
  accent: "#777b87",
  textPrimary: "#2b2e34",
  textSecondary: "#545862",
  textMuted: "#7b808b",
  card: "rgba(244, 242, 240, 0.95)",
  border: "rgba(73, 78, 90, 0.12)",
  borderStrong: "rgba(73, 78, 90, 0.2)",
  shadow: "rgba(80, 84, 92, 0.14)",
  aura: "rgba(115, 120, 130, 0.09)",
  auraSoft: "rgba(115, 120, 130, 0.05)",
  danger: "#ca5a63",
  infoSurface: "rgba(70, 75, 86, 0.07)",
  infoBorder: "rgba(70, 75, 86, 0.14)"
};

export const defaultTheme = darkTheme;
export const drainedTheme = drainedDarkTheme;

export function getThemeForMode(mode: ThemeMode, options?: { dopamineDrain?: boolean }) {
  const isDrained = Boolean(options?.dopamineDrain);

  if (mode === "light") {
    return isDrained ? drainedLightTheme : lightTheme;
  }

  return isDrained ? drainedDarkTheme : darkTheme;
}

export function getStatusBarStyleForMode(mode: ThemeMode) {
  return mode === "light" ? "dark-content" : "light-content";
}
