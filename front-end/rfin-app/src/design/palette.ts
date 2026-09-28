/**
 * RFIN palette — pixel-perfect-main/src/styles.css `--rfin-*`, oklch → sRGB.
 *
 *   paper  oklch(0.958 0.018 92)   #f5f1e4   page background
 *   ink    oklch(0.18 0.018 70)    #171009   text, dark surfaces, lines
 *   mute   oklch(0.49 0.028 76)    #6a5f4f   secondary text, labels
 *   red    oklch(0.62 0.205 31)    #e7422c   brand dot, eyebrows, active nav, focus items
 *   amber  oklch(0.79 0.16 75)     #f5a91f   insight, pending, support tint
 *   blue   oklch(0.46 0.205 265)   #1d47c8   information, docs due
 *   green  oklch(0.54 0.135 158)   #00854f   growth, approved, success
 *
 * The reference uses `ink/NN` and `amber/NN` opacity modifiers everywhere
 * (line/15, line/10, ink/10, ink/5, amber/20, amber/15, green/15, paper/10…),
 * so those are pre-mixed below as named tints.
 *
 * The reference only defines a light RFIN theme. The dark scheme swaps paper and
 * ink and keeps the four accents, so the same components read the same way.
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

const PAPER = "#f5f1e4";
const INK = "#171009";
const MUTE = "#6a5f4f";
const RED = "#e7422c";
const AMBER = "#f5a91f";
const BLUE = "#1d47c8";
const GREEN = "#00854f";

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

  onRed: PAPER,
  onBlue: PAPER,
  onAmber: INK,
  onGreen: PAPER,

  destructive: "#e7000b",
  scrim: "rgba(23,16,9,0.45)",
  shadowInk: INK,
};

const DARK_BG = "#15100a";
const DARK_FG = PAPER;
const DARK_MUTE = "#a89c88";
const DARK_BLUE = "#6f8ff0"; // blue on ink needs lifting to stay readable

export const darkColors: Palette = {
  ...lightColors,
  mute: DARK_MUTE,
  blue: DARK_BLUE,

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
  greenSoft: mix(GREEN, DARK_BG, 0.25),
  redSoft: mix(RED, DARK_BG, 0.2),
  blueSoft: mix(DARK_BLUE, DARK_BG, 0.2),

  onBlue: PAPER,
  scrim: "rgba(0,0,0,0.6)",
  shadowInk: "#000000",
};
