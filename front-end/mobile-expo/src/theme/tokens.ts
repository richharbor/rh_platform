/** Scheme-independent design tokens. */

/** 18px cards — `--radius: 1.125rem` */
export const radius = {
  sm: 10,
  md: 14,
  lg: 18,
  xl: 20,
  "2xl": 24,
  "3xl": 28,
  full: 9999,
} as const;

export const fonts = {
  regular: "Inter_400Regular",
  medium: "Inter_500Medium",
  semibold: "Inter_600SemiBold",
  bold: "Inter_700Bold",
  display: "Manrope_700Bold",
  displaySemi: "Manrope_600SemiBold",
  displayBold: "Manrope_800ExtraBold",
} as const;

/**
 * Tailwind's type scale (font-size / line-height), as used by the web app.
 *
 * CSS lets glyphs overflow a short line box (`text-5xl` is `line-height: 1`), but
 * React Native *clips* text to the line box, which beheads the tall ascenders of
 * Manrope ExtraBold. So the two tightest steps get a 1.2x floor: 48/48 -> 48/58 and
 * 36/40 -> 36/44. Every other step already clears 1.2x and matches Tailwind exactly.
 */
export const fontScale = {
  "5xl": { fontSize: 48, lineHeight: 58 },
  "4xl": { fontSize: 36, lineHeight: 44 },
  "3xl": { fontSize: 30, lineHeight: 36 },
  "2xl": { fontSize: 24, lineHeight: 32 },
  xl: { fontSize: 20, lineHeight: 28 },
  lg: { fontSize: 18, lineHeight: 28 },
  base: { fontSize: 16, lineHeight: 24 },
  sm: { fontSize: 14, lineHeight: 20 },
  xs: { fontSize: 12, lineHeight: 16 },
} as const;

/** Max phone-frame width used by the web AppShell (max-w-md) */
export const MAX_WIDTH = 448;

/** Height reserved for the floating bottom nav */
export const NAV_HEIGHT = 76;
