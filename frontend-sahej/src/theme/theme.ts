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

export const defaultTheme: AppTheme = {
  background: "#050505",
  accent: "#8a2be2",
  textPrimary: "#f7f7fb",
  textSecondary: "#d6d1e0",
  textMuted: "#9d97ab",
  card: "rgba(18, 18, 22, 0.78)",
  border: "rgba(138, 43, 226, 0.28)",
  borderStrong: "rgba(138, 43, 226, 0.46)",
  shadow: "rgba(138, 43, 226, 0.35)",
  aura: "rgba(138, 43, 226, 0.18)",
  auraSoft: "rgba(138, 43, 226, 0.1)",
  danger: "#ff8e8e",
  infoSurface: "rgba(138, 43, 226, 0.12)",
  infoBorder: "rgba(138, 43, 226, 0.26)"
};

export const drainedTheme: AppTheme = {
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
