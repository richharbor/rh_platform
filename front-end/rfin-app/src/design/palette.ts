/**
 * RFIN palette — layout from pixel-perfect-main, colours from the Rich Harbor brand
 * (midnight navy, champagne gold, emerald, warm off-white). Slot names are kept from
 * the reference so every component picks the brand up unchanged:
 *
 *   paper  #f6f3ed   warm off-white — page background
 *   ink    #111d38   midnight navy — text, dark surfaces, lines
 *   mute   #6d6860   warm gray — secondary text, labels
 *   red    #a88142   deep gold — brand dot, eyebrows, active nav, "needs action"
 *   blue   #27457e   navy accent — information, docs due
 *   amber  #d9bd82   champagne — insight, pending, support tint
 *   green  #0e7a58   emerald — growth, approved, success
 *   destructive #c2372b — real errors only
 *
 * Accents still run red → blue → amber → green by position. The `/NN` opacity
 * modifiers from the reference are pre-mixed below as named tints. Dark mode puts
 * the same accents on deep midnight and lifts blue and green to stay readable.
 */
export type Palette = {
  paper: string;
  ink: string;
  mute: string;
  red: string;
  amber: string;
  blue: string;
  green: string;

  /** page background */
  background: string;
  /** body text */
  foreground: string;
  /** raised surface (cards sit flat on paper in the reference; borders do the work) */
  card: string;
  /** dark "hero" surface — bg-rfin-ink */
  inverse: string;
  /** text on inverse — text-rfin-paper */
  onInverse: string;
  /** text-rfin-paper/60 */
  onInverseMute: string;
  /** bg-rfin-paper/10 */
  inverseTint: string;
  /** outline-rfin-paper/20 */
  inverseLine: string;

  /** border-rfin-line/15 — section dividers */
  line: string;
  /** border-rfin-line/10 — card outlines */
  lineSoft: string;
  /** bg-rfin-ink/10 — progress tracks */
  track: string;
  /** hover:bg-rfin-ink/5 — pressed rows */
  pressed: string;

  /** bg-rfin-amber/20 */
  amberTint: string;
  /** bg-rfin-amber/15 */
  amberSoft: string;
  /** bg-rfin-green/15 */
  greenSoft: string;
  redSoft: string;
  blueSoft: string;

  /** colours that sit on a solid accent tile */
  onRed: string;
  onBlue: string;
  onAmber: string;
  onGreen: string;

  destructive: string;
  scrim: string;
  shadowInk: string;
};

/** Blend `fg` over `bg` at `alpha` — Tailwind's `/NN` modifier on a known backdrop. */
function mix(fg: string, bg: string, alpha: number) {
  const p = (h: string) => [1, 3, 5].map((i) => parseInt(h.slice(i, i + 2), 16));
  const [a, b] = [p(fg), p(bg)];
  return "#" + a.map((v, i) => Math.round(v * alpha + b[i] * (1 - alpha)).toString(16).padStart(2, "0")).join("");
}

const PAPER = "#f6f3ed";
const INK = "#111d38";
const MUTE = "#6d6860";
const RED = "#a88142";
const AMBER = "#d9bd82";
const BLUE = "#27457e";
const GREEN = "#0e7a58";

export const lightColors: Palette = {
  paper: PAPER,
  ink: INK,
  mute: MUTE,
  red: RED,
  amber: AMBER,
  blue: BLUE,
  green: GREEN,

  background: PAPER,
  foreground: INK,
  card: PAPER,
  inverse: INK,
  onInverse: PAPER,
  onInverseMute: mix(PAPER, INK, 0.6),
  inverseTint: mix(PAPER, INK, 0.1),
  inverseLine: mix(PAPER, INK, 0.2),

  line: mix(INK, PAPER, 0.15),
  lineSoft: mix(INK, PAPER, 0.1),
  track: mix(INK, PAPER, 0.1),
  pressed: mix(INK, PAPER, 0.05),

  amberTint: mix(AMBER, PAPER, 0.2),
  amberSoft: mix(AMBER, PAPER, 0.15),
  greenSoft: mix(GREEN, PAPER, 0.15),
  redSoft: mix(RED, PAPER, 0.15),
  blueSoft: mix(BLUE, PAPER, 0.15),

  onRed: INK,
  onBlue: PAPER,
  onAmber: INK,
  onGreen: PAPER,

  destructive: "#c2372b",
  scrim: "rgba(17,29,56,0.45)",
  shadowInk: INK,
};

const DARK_BG = "#0a1328";
const DARK_FG = PAPER;
const DARK_MUTE = "#a8a296";
const DARK_BLUE = "#5a7ec4"; // navy accent on midnight needs lifting to stay readable
const DARK_GREEN = "#2fa57c";

export const darkColors: Palette = {
  ...lightColors,
  mute: DARK_MUTE,
  blue: DARK_BLUE,
  green: DARK_GREEN,

  background: DARK_BG,
  foreground: DARK_FG,
  card: DARK_BG,
  inverse: PAPER,
  onInverse: INK,
  onInverseMute: mix(INK, PAPER, 0.6),
  inverseTint: mix(INK, PAPER, 0.08),
  inverseLine: mix(INK, PAPER, 0.2),

  line: mix(DARK_FG, DARK_BG, 0.15),
  lineSoft: mix(DARK_FG, DARK_BG, 0.1),
  track: mix(DARK_FG, DARK_BG, 0.12),
  pressed: mix(DARK_FG, DARK_BG, 0.06),

  amberTint: mix(AMBER, DARK_BG, 0.2),
  amberSoft: mix(AMBER, DARK_BG, 0.15),
  greenSoft: mix(DARK_GREEN, DARK_BG, 0.25),
  redSoft: mix(RED, DARK_BG, 0.2),
  blueSoft: mix(DARK_BLUE, DARK_BG, 0.2),

  onBlue: PAPER,
  scrim: "rgba(0,0,0,0.6)",
  shadowInk: "#000000",
};
