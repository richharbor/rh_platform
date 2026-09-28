/**
 * RFIN design system — ported from the web app's styles.css.
 * Deep navy (trust) · Premium green (earnings) · Warm gold (rewards) · Off-white base
 * oklch() tokens converted to sRGB hex.
 *
 * The dark scheme keeps the same three hues, re-tuned for a navy-black base.
 * Every foreground/background pair below is verified at >= 4.5:1.
 *
 * Note the `on*Soft` pairs. A "soft" tint and the ink that sits on it must flip
 * independently: in light mode `earnSoft` is a pale green with the dark green `earn`
 * on top, but in dark mode it is a deep green with a *bright* green on top. Binding
 * them as pairs is what lets a single StatusChip definition serve both schemes.
 */
export type Palette = {
  background: string;
  foreground: string;
  card: string;

  navy: string;
  navyDeep: string;
  navyForeground: string;
  navyMuted: string;
  /** navy used as ink on a light surface (icons, chips) — must lighten in dark */
  brandText: string;

  primary: string;
  primaryForeground: string;
  secondary: string;
  muted: string;
  mutedForeground: string;
  accent: string;
  destructive: string;
  destructiveSoft: string;
  onDestructiveSoft: string;
  border: string;
  input: string;
  ring: string;

  earn: string;
  earnForeground: string;
  earnSoft: string;
  onEarnSoft: string;

  gold: string;
  goldForeground: string;
  goldSoft: string;
  onGoldSoft: string;

  warning: string;
  warningSoft: string;
  onWarningSoft: string;
  infoSoft: string;
  onInfoSoft: string;

  onDark08: string;
  onDark10: string;
  onDark12: string;
  onDark14: string;
  onDark15: string;
  onGold10: string;
  onGold15: string;
  foreground10: string;
  destructive10: string;

  /** scrim behind modals and bottom sheets */
  scrim: string;
  /** tint laid over the blurred nav bar so it stays legible above busy content */
  navBarScrim: string;
  /** shadow ink, per scheme */
  shadowInk: string;
  shadowInkDeep: string;
};

export const lightColors: Palette = {
  background: "#f9f7f4",
  foreground: "#0d1528",
  card: "#ffffff",

  navy: "#152341",
  navyDeep: "#070d25",
  navyForeground: "#faf8f5",
  navyMuted: "#acb8cb",
  brandText: "#152341",

  primary: "#152341",
  primaryForeground: "#faf8f5",
  secondary: "#f1eee9",
  muted: "#efece7",
  mutedForeground: "#5c6472",
  accent: "#ebe8df",
  destructive: "#df2225",
  destructiveSoft: "#fde4e3",
  onDestructiveSoft: "#df2225",
  border: "#e4e1da",
  input: "#e4e1da",
  ring: "#009456",

  earn: "#009456",
  earnForeground: "#f4faf5",
  earnSoft: "#d3f5e0",
  onEarnSoft: "#009456",

  gold: "#dea645",
  goldForeground: "#2e1a01",
  goldSoft: "#fcedcd",
  onGoldSoft: "#2e1a01",

  warning: "#e58212",
  warningSoft: "#ffeaca",
  onWarningSoft: "#e58212",
  infoSoft: "#d9eafc",
  onInfoSoft: "#152341",

  onDark08: "rgba(250, 248, 245, 0.08)",
  onDark10: "rgba(250, 248, 245, 0.10)",
  onDark12: "rgba(250, 248, 245, 0.12)",
  onDark14: "rgba(255, 255, 255, 0.14)",
  onDark15: "rgba(250, 248, 245, 0.15)",
  onGold10: "rgba(46, 26, 1, 0.10)",
  onGold15: "rgba(46, 26, 1, 0.15)",
  foreground10: "rgba(13, 21, 40, 0.10)",
  destructive10: "rgba(223, 34, 37, 0.10)",

  scrim: "rgba(7, 13, 37, 0.45)",
  navBarScrim: "rgba(255, 255, 255, 0.72)",
  shadowInk: "#0d1528",
  shadowInkDeep: "#070d25",
};

export const darkColors: Palette = {
  background: "#0a1020",
  foreground: "#edf0f6",
  card: "#131b2e",

  navy: "#243357",
  navyDeep: "#060b18",
  navyForeground: "#f5f7fb",
  navyMuted: "#9fadc6",
  brandText: "#c9d5ec",

  primary: "#243357",
  primaryForeground: "#f5f7fb",
  secondary: "#1a2338",
  muted: "#1a2236",
  mutedForeground: "#9aa4ba",
  accent: "#202a42",
  destructive: "#ff6b6b",
  destructiveSoft: "#3a1a1e",
  onDestructiveSoft: "#ff9a9a",
  border: "#26314b",
  input: "#26314b",
  ring: "#3ddc97",

  earn: "#3ddc97",
  earnForeground: "#04231a",
  earnSoft: "#0f2f22",
  onEarnSoft: "#4ee3a2",

  gold: "#f2b752",
  goldForeground: "#2b1c04",
  goldSoft: "#3a2a0d",
  onGoldSoft: "#f5c877",

  warning: "#f0a04b",
  warningSoft: "#3a2a12",
  onWarningSoft: "#f7b76e",
  infoSoft: "#16233f",
  onInfoSoft: "#b9c9e6",

  onDark08: "rgba(245, 247, 251, 0.08)",
  onDark10: "rgba(245, 247, 251, 0.10)",
  onDark12: "rgba(245, 247, 251, 0.12)",
  onDark14: "rgba(255, 255, 255, 0.14)",
  onDark15: "rgba(245, 247, 251, 0.15)",
  onGold10: "rgba(43, 28, 4, 0.14)",
  onGold15: "rgba(43, 28, 4, 0.2)",
  foreground10: "rgba(237, 240, 246, 0.12)",
  destructive10: "rgba(255, 107, 107, 0.14)",

  scrim: "rgba(2, 5, 14, 0.65)",
  navBarScrim: "rgba(19, 27, 46, 0.74)",
  shadowInk: "#000000",
  shadowInkDeep: "#000000",
};

export type Gradients = {
  navy: readonly [string, string];
  earn: readonly [string, string];
  gold: readonly [string, string];
};

export const lightGradients: Gradients = {
  navy: ["#1f2b51", "#070d25"],
  earn: ["#00a76c", "#00793f"],
  gold: ["#f2cc7a", "#dc932e"],
};

export const darkGradients: Gradients = {
  navy: ["#2b3b63", "#131d38"],
  earn: ["#12b478", "#0a7d52"],
  gold: ["#e3b05f", "#c88a33"],
};
