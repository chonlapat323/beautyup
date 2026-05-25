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
  // ─── Jade foundation ───────────────────────────────────────────────
  background: "#046340",
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
  borderSoft: "rgba(255, 255, 255, 0.12)",
  borderStrong: "rgba(255, 255, 255, 0.22)",

  // ─── Gold accent — หยกน้ำ × ทองคำแท้ ──────────────────────────────
  gold: "#D4AF37",           // ทองคำแท้ — icons, borders, buttons
  goldDeep: "#B8962E",       // ทองเข้ม — text บน surface ขาว
  goldSoft: "rgba(212, 175, 55, 0.14)",  // พื้นหลัง subtle
  goldMuted: "rgba(212, 175, 55, 0.07)", // เส้นขอบบาง / hover
  goldDark: "#1A0F00",       // ข้อความบนปุ่มทอง (contrast ดี)
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
    lineHeight: 42,
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
