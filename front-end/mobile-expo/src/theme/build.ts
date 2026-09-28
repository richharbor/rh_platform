import { Platform, StyleSheet, type TextStyle, type ViewStyle } from "react-native";
import { fonts, radius } from "./tokens";
import {
  darkColors,
  darkGradients,
  lightColors,
  lightGradients,
  type Gradients,
  type Palette,
} from "./palette";

export type Scheme = "light" | "dark";

/** Everything whose value depends on the active colour scheme. */
export type Theme = {
  scheme: Scheme;
  colors: Palette;
  gradients: Gradients;
  shadowCard: ViewStyle;
  shadowElevated: ViewStyle;
  shadowGlowEarn: ViewStyle;
  surface: ViewStyle;
  t: ReturnType<typeof makeText>;
  num: (fontSize: number, color?: string) => TextStyle;
  display: (fontSize: number, weight?: "bold" | "extrabold", color?: string) => TextStyle;
  textTone: (tone?: "earn" | "gold" | "navy" | "light" | "muted") => TextStyle;
};

function makeText(c: Palette) {
  return StyleSheet.create({
    /** @utility eyebrow — 0.6875rem / 600 / 0.08em / uppercase */
    eyebrow: {
      fontSize: 11,
      fontFamily: fonts.semibold,
      letterSpacing: 0.88,
      textTransform: "uppercase",
    },
    body: { fontFamily: fonts.regular, color: c.foreground },
    /** page titles: `text-2xl font-extrabold` on an h1 */
    h1: { fontFamily: fonts.displayBold, fontSize: 24, letterSpacing: -0.48, color: c.foreground },
    /** section titles: `text-base font-bold` on an h2 */
    h2: { fontFamily: fonts.display, fontSize: 16, letterSpacing: -0.32, color: c.foreground },
    muted: { fontFamily: fonts.regular, fontSize: 14, lineHeight: 20, color: c.mutedForeground },
    xs: { fontFamily: fonts.regular, fontSize: 12, lineHeight: 16, color: c.mutedForeground },
  });
}

function buildTheme(scheme: Scheme): Theme {
  const colors = scheme === "dark" ? darkColors : lightColors;
  const gradients = scheme === "dark" ? darkGradients : lightGradients;
  const dark = scheme === "dark";

  /** --shadow-card */
  const shadowCard = Platform.select({
    ios: {
      shadowColor: colors.shadowInk,
      shadowOpacity: dark ? 0.5 : 0.1,
      shadowRadius: 10,
      shadowOffset: { width: 0, height: 4 },
    },
    android: { elevation: 2 },
    default: dark
      ? { boxShadow: "0 1px 2px rgba(0,0,0,0.3), 0 6px 20px -8px rgba(0,0,0,0.5)" }
      : { boxShadow: "0 1px 2px rgba(13,21,40,0.04), 0 6px 20px -8px rgba(13,21,40,0.1)" },
  }) as ViewStyle;

  /** --shadow-elevated */
  const shadowElevated = Platform.select({
    ios: {
      shadowColor: colors.shadowInkDeep,
      shadowOpacity: dark ? 0.7 : 0.32,
      shadowRadius: 20,
      shadowOffset: { width: 0, height: 10 },
    },
    android: { elevation: 10 },
    default: dark
      ? { boxShadow: "0 12px 40px -12px rgba(0,0,0,0.8)" }
      : { boxShadow: "0 12px 40px -12px rgba(7,13,37,0.45)" },
  }) as ViewStyle;

  /** --shadow-glow-earn */
  const shadowGlowEarn = Platform.select({
    ios: {
      shadowColor: colors.earn,
      shadowOpacity: dark ? 0.35 : 0.45,
      shadowRadius: 16,
      shadowOffset: { width: 0, height: 8 },
    },
    android: { elevation: 8 },
    default: dark
      ? { boxShadow: "0 10px 30px -10px rgba(61,220,151,0.35)" }
      : { boxShadow: "0 10px 30px -10px rgba(0,148,86,0.55)" },
  }) as ViewStyle;

  /** @utility surface */
  const surface: ViewStyle = {
    backgroundColor: colors.card,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    ...shadowCard,
  };

  /**
   * `@utility num` — Manrope 800, tabular, tracking -0.035em.
   * Tracking in CSS is an em value, so it has to scale with the font size; a fixed
   * pixel value made large hero numbers read far too loose.
   */
  const num = (fontSize: number, color: string = colors.foreground): TextStyle => ({
    fontFamily: fonts.displayBold,
    fontSize,
    letterSpacing: fontSize * -0.035,
    fontVariant: ["tabular-nums"],
    includeFontPadding: false,
    color,
  });

  /** `h1,h2,h3 { font-family: display; letter-spacing: -0.02em }` */
  const display = (
    fontSize: number,
    weight: "bold" | "extrabold" = "extrabold",
    color: string = colors.foreground,
  ): TextStyle => ({
    fontFamily: weight === "bold" ? fonts.display : fonts.displayBold,
    fontSize,
    letterSpacing: fontSize * -0.02,
    color,
  });

  const textTone = (tone?: "earn" | "gold" | "navy" | "light" | "muted"): TextStyle => {
    switch (tone) {
      case "earn":
        return { color: colors.earn };
      case "gold":
        return { color: colors.goldForeground };
      case "navy":
        return { color: colors.brandText };
      case "light":
        return { color: colors.navyForeground };
      case "muted":
        return { color: colors.mutedForeground };
      default:
        return {};
    }
  };

  return {
    scheme,
    colors,
    gradients,
    shadowCard,
    shadowElevated,
    shadowGlowEarn,
    surface,
    t: makeText(colors),
    num,
    display,
    textTone,
  };
}

/** Built once per scheme — StyleSheet registration is not free. */
export const themes: Record<Scheme, Theme> = {
  light: buildTheme("light"),
  dark: buildTheme("dark"),
};
