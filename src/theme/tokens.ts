export const colors = {
  background: "#FFF8F7",
  surface: "#FFFFFF",
  surfaceMuted: "#FAF2F1",
  primary: "#7F535C",
  primaryStrong: "#714750",
  textPrimary: "#2F2628",
  textSecondary: "#6B6264",
  textMuted: "#8D8587",
  borderSoft: "#E9E0E0",
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
    fontWeight: "600" as const,
  },
  title: {
    fontSize: 18,
    fontWeight: "600" as const,
  },
  headline: {
    fontSize: 28,
    lineHeight: 34,
    fontWeight: "600" as const,
  },
  body: {
    fontSize: 15,
    lineHeight: 22,
    fontWeight: "400" as const,
  },
  caption: {
    fontSize: 13,
    lineHeight: 18,
    fontWeight: "500" as const,
  },
} as const;
