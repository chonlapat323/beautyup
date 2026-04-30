// Font family names — must match keys passed to useFonts() in AppRoot
export const fonts = {
  regular:   "NotoSansThai_400Regular",
  medium:    "NotoSansThai_500Medium",
  semiBold:  "NotoSansThai_600SemiBold",
  bold:      "NotoSansThai_700Bold",
  extraBold: "NotoSansThai_800ExtraBold",
  mono:      "JetBrainsMono_500Medium",
  monoSemi:  "JetBrainsMono_600SemiBold",
  monoBold:  "JetBrainsMono_700Bold",
} as const;

export const colors = {
  background: "#fafcfa",
  surface: "#ffffff",
  surfaceMuted: "#eef8f1",
  primary: "#2f7a4f",
  primaryDark: "#1f5236",
  primaryStrong: "#1f5236",
  primarySoft: "#eef8f1",
  sage: "#c8e0d1",
  textPrimary: "#1a1a1a",
  textSecondary: "#6b7280",
  textMuted: "#9ca3af",
  borderSoft: "rgba(15, 40, 25, 0.08)",
  borderStrong: "rgba(15, 40, 25, 0.14)",
} as const;

export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  "2xl": 24,
  "3xl": 32,
} as const;

export const radius = {
  sm: 12,
  md: 16,
  lg: 20,
  xl: 28,
  pill: 999,
} as const;

export const typography = {
  eyebrow: {
    fontSize: 11,
    letterSpacing: 1.8,
    fontFamily: fonts.semiBold,
  },
  title: {
    fontSize: 18,
    fontFamily: fonts.semiBold,
  },
  headline: {
    fontSize: 28,
    lineHeight: 34,
    fontFamily: fonts.semiBold,
  },
  body: {
    fontSize: 15,
    lineHeight: 22,
    fontFamily: fonts.regular,
  },
  caption: {
    fontSize: 13,
    lineHeight: 18,
    fontFamily: fonts.medium,
  },
} as const;
