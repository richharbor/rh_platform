import { Anton_400Regular } from "@expo-google-fonts/anton";
import { Inter_400Regular, Inter_500Medium, Inter_600SemiBold, Inter_700Bold } from "@expo-google-fonts/inter";
import { JetBrainsMono_400Regular, JetBrainsMono_500Medium } from "@expo-google-fonts/jetbrains-mono";

/**
 * Scheme-independent tokens, from pixel-perfect-main/src/styles.css.
 * `--radius: 0.625rem` (10px) and the calc() steps built on it.
 */
export const radius = {
  sm: 6,
  md: 8,
  lg: 10,
  xl: 14,
  "2xl": 18,
  "3xl": 22,
  "4xl": 26,
  full: 9999,
} as const;

/** Anton (display) · Inter (body) · JetBrains Mono (labels, numbers-as-codes) */
export const fonts = {
  display: "Anton_400Regular",
  regular: "Inter_400Regular",
  medium: "Inter_500Medium",
  semibold: "Inter_600SemiBold",
  bold: "Inter_700Bold",
  mono: "JetBrainsMono_400Regular",
  monoMedium: "JetBrainsMono_500Medium",
} as const;

export const fontAssets = {
  Anton_400Regular,
  Inter_400Regular,
  Inter_500Medium,
  Inter_600SemiBold,
  Inter_700Bold,
  JetBrainsMono_400Regular,
  JetBrainsMono_500Medium,
};

/**
 * `rfin-rise`: 420ms, cubic-bezier(.32,.72,0,1), 12px lift; delays step by 60ms.
 */
export const motion = {
  riseDuration: 420,
  riseDistance: 12,
  riseStagger: 60,
  easing: [0.32, 0.72, 0, 1] as const,
};

export const MAX_WIDTH = 512;
export const NAV_HEIGHT = 64;
