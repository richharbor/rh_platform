import { StyleSheet, type TextStyle, type ViewStyle } from "react-native";
import { darkColors, lightColors, type Palette } from "./palette";
import { fonts, radius } from "./tokens";

export type Scheme = "light" | "dark";

/**
 * Anton's box is 1.5em tall (ascent 1.18em). CSS lets glyphs overflow a tight
 * line box, but React Native clips to it, so the web's `leading-[.92]` would
 * behead every headline on iOS. 1.25em is the tightest leading that clears the
 * ascenders; every Anton style goes through this.
 */
export const displayLeading = (fontSize: number) => Math.ceil(fontSize * 1.25);

/** Text styles lifted from the reference's Tailwind classes. */
function makeText(c: Palette) {
  return StyleSheet.create({
    /** font-display text-5xl leading-[.92] tracking-tight — page headline */
    hero: { fontFamily: fonts.display, fontSize: 48, lineHeight: displayLeading(48), letterSpacing: -0.5, color: c.foreground },
    /** font-display text-3xl/4xl — card titles, big figures */
    h1: { fontFamily: fonts.display, fontSize: 36, lineHeight: displayLeading(36), letterSpacing: -0.4, color: c.foreground },
    /** font-display text-2xl tracking-tight */
    h2: { fontFamily: fonts.display, fontSize: 24, lineHeight: displayLeading(24), letterSpacing: -0.3, color: c.foreground },
    /** text-sm font-semibold — row titles */
    title: { fontFamily: fonts.semibold, fontSize: 14, lineHeight: 20, color: c.foreground },
    /** text-sm / 15px body */
    body: { fontFamily: fonts.regular, fontSize: 15, lineHeight: 22, color: c.foreground },
    /** text-sm leading-relaxed text-rfin-mute */
    muted: { fontFamily: fonts.regular, fontSize: 14, lineHeight: 23, color: c.mute },
    /** text-[13px] text-rfin-mute */
    caption: { fontFamily: fonts.regular, fontSize: 13, lineHeight: 18, color: c.mute },
    /** text-xs text-rfin-mute */
    xs: { fontFamily: fonts.regular, fontSize: 12, lineHeight: 16, color: c.mute },
    /** font-mono text-[11px] uppercase tracking-[.18em] text-rfin-mute — SectionLabel */
    label: { fontFamily: fonts.mono, fontSize: 11, letterSpacing: 11 * 0.18, textTransform: "uppercase", color: c.mute },
    /** font-mono text-[11px] uppercase tracking-[.2em] text-rfin-red — dateline eyebrow */
    eyebrow: { fontFamily: fonts.mono, fontSize: 11, letterSpacing: 11 * 0.2, textTransform: "uppercase", color: c.red },
    /** font-mono text-[11px] — status codes like APPROVED / 01 */
    code: { fontFamily: fonts.mono, fontSize: 11, letterSpacing: 0.4, color: c.mute },
  });
}

export type Theme = {
  scheme: Scheme;
  colors: Palette;
  t: ReturnType<typeof makeText>;
  /** rounded-2xl border border-rfin-line/10 — the reference's default card */
  surface: ViewStyle;
  shadowElevated: ViewStyle;
  /** Anton figure — `font-display text-4xl tracking-tight` for money and points */
  figure: (fontSize: number, color?: string) => TextStyle;
};

function buildTheme(scheme: Scheme): Theme {
  const colors = scheme === "dark" ? darkColors : lightColors;
  return {
    scheme,
    colors,
    t: makeText(colors),
    surface: {
      backgroundColor: colors.card,
      borderRadius: radius["2xl"],
      borderWidth: 1,
      borderColor: colors.lineSoft,
    },
    shadowElevated: {
      shadowColor: colors.shadowInk,
      shadowOpacity: scheme === "dark" ? 0.6 : 0.18,
      shadowRadius: 24,
      shadowOffset: { width: 0, height: 12 },
      elevation: 10,
    },
    figure: (fontSize, color = colors.foreground) => ({
      fontFamily: fonts.display,
      fontSize,
      lineHeight: displayLeading(fontSize),
      includeFontPadding: false,
      letterSpacing: fontSize * -0.012,
      fontVariant: ["tabular-nums"],
      color,
    }),
  };
}

export const themes: Record<Scheme, Theme> = {
  light: buildTheme("light"),
  dark: buildTheme("dark"),
};
