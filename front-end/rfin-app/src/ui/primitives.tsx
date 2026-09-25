import type { ReactNode } from "react";
import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Text as RNText,
  View,
  type PressableProps,
  type StyleProp,
  type TextProps,
  type TextStyle,
  type ViewStyle,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { fonts, radius, useTheme, useThemedStyles, type Theme } from "@/design";
import { track, type EventName } from "@/analytics";

type Variant = keyof Theme["t"];

export function Text({ variant = "body", style, ...rest }: TextProps & { variant?: Variant }) {
  const { t } = useTheme();
  return <RNText {...rest} style={[t[variant], style]} />;
}

/** `RFIN.` — every display word can end in the red brand dot. */
export function Display({ children, dot, size = 36, color, style }: { children: ReactNode; dot?: boolean; size?: number; color?: string; style?: StyleProp<TextStyle> }) {
  const { figure, colors } = useTheme();
  return (
    <RNText style={[figure(size, color), style]}>
      {children}
      {dot ? <RNText style={{ color: colors.red }}>.</RNText> : null}
    </RNText>
  );
}

/** Anton figure for money / points (`font-display text-4xl tracking-tight`). */
export function AmountText({ children, size = 36, tone }: { children: ReactNode; size?: number; tone?: "green" | "mute" }) {
  const { figure, colors } = useTheme();
  const color = tone === "green" ? colors.green : tone === "mute" ? colors.mute : colors.foreground;
  return <RNText style={figure(size, color)}>{children}</RNText>;
}

/** `rounded-2xl border border-rfin-line/10 p-4` */
export function Card({ children, style, onPress, tint }: { children: ReactNode; style?: StyleProp<ViewStyle>; onPress?: () => void; tint?: "amber" }) {
  const s = useThemedStyles(makeStyles);
  const base = [s.card, tint === "amber" && s.cardAmber];
  if (!onPress) return <View style={[base, style]}>{children}</View>;
  return (
    <Pressable onPress={onPress} style={({ pressed }) => [base, pressed && s.cardPressed, style]}>
      {children}
    </Pressable>
  );
}

type ButtonProps = Omit<PressableProps, "children"> & {
  label: string;
  /**
   * ink    bg-rfin-ink text-rfin-paper (primary on paper)
   * paper  bg-rfin-paper text-rfin-ink (primary on an ink card)
   * red    bg-rfin-red — the single urgent action
   * outline border only
   * link   text-xs font-semibold text-rfin-red "Open recommendation →"
   */
  variant?: "ink" | "paper" | "red" | "outline" | "link";
  loading?: boolean;
  icon?: ReactNode;
  trailingIcon?: ReactNode;
  block?: boolean;
  /** every important CTA is measured (report #95) */
  event?: EventName;
  eventProps?: Record<string, unknown>;
};

export function Button({ label, variant = "ink", loading, disabled, icon, trailingIcon, block, event, eventProps, onPress, style, ...rest }: ButtonProps) {
  const s = useThemedStyles(makeStyles);
  const { colors } = useTheme();
  const look = {
    ink: { bg: colors.inverse, fg: colors.onInverse, pressedBg: colors.red },
    paper: { bg: colors.onInverse, fg: colors.inverse, pressedBg: colors.amber },
    red: { bg: colors.red, fg: colors.onRed, pressedBg: colors.inverse },
    outline: { bg: "transparent", fg: colors.foreground, pressedBg: colors.pressed },
    link: { bg: "transparent", fg: colors.red, pressedBg: "transparent" },
  }[variant];
  // Locked while loading so a double-tap can never double-submit (report #37).
  const inert = disabled || loading;
  const isLink = variant === "link";
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ disabled: !!inert, busy: !!loading }}
      disabled={inert}
      onPress={(e) => {
        if (event) track(event, eventProps);
        onPress?.(e);
      }}
      style={(st) => [
        isLink ? s.link : s.button,
        variant === "outline" && s.outline,
        block && { alignSelf: "stretch" },
        { backgroundColor: st.pressed ? look.pressedBg : look.bg, opacity: inert ? 0.5 : 1 },
        typeof style === "function" ? style(st) : style,
      ]}
      {...rest}
    >
      {({ pressed }) => {
        const fg = pressed && (variant === "ink" || variant === "red") ? colors.paper : pressed && variant === "paper" ? colors.ink : look.fg;
        return (
          <>
            {loading ? <ActivityIndicator color={fg} size="small" /> : icon}
            <RNText style={[isLink ? s.linkLabel : s.label, { color: fg }, isLink && pressed && { textDecorationLine: "underline" }]}>{label}</RNText>
            {trailingIcon}
          </>
        );
      }}
    </Pressable>
  );
}

/** One primary CTA per decision step, pinned above the home indicator. */
export function StickyCTA({ children, note }: { children: ReactNode; note?: string }) {
  const s = useThemedStyles(makeStyles);
  const insets = useSafeAreaInsets();
  return (
    <View style={[s.sticky, { paddingBottom: Math.max(insets.bottom, 14) }]}>
      {note ? <Text variant="xs" style={{ textAlign: "center", marginBottom: 10 }}>{note}</Text> : null}
      {children}
    </View>
  );
}

export function Row({ children, gap = 8, style }: { children: ReactNode; gap?: number; style?: StyleProp<ViewStyle> }) {
  return <View style={[{ flexDirection: "row", alignItems: "center", gap }, style]}>{children}</View>;
}

/** `SectionLabel` — mono uppercase label followed by a hairline rule. */
export function SectionLabel({ children, action }: { children: string; action?: ReactNode }) {
  const { colors } = useTheme();
  return (
    <Row gap={12}>
      <Text variant="label" accessibilityRole="header">{children}</Text>
      <View style={{ flex: 1, height: 1, backgroundColor: colors.line }} />
      {action}
    </Row>
  );
}

export function Section({ title, action, children, gap = 12 }: { title: string; action?: ReactNode; children: ReactNode; gap?: number }) {
  return (
    <View style={{ gap }}>
      <SectionLabel action={action}>{title}</SectionLabel>
      {children}
    </View>
  );
}

/** `h-px bg-rfin-line/15` */
export function Divider({ style }: { style?: StyleProp<ViewStyle> }) {
  const { colors } = useTheme();
  return <View style={[{ height: 1, backgroundColor: colors.line }, style]} />;
}

const makeStyles = (th: Theme) =>
  StyleSheet.create({
    card: { ...th.surface, padding: 16 },
    cardAmber: { backgroundColor: th.colors.amberSoft },
    cardPressed: { backgroundColor: th.colors.pressed },
    button: {
      minHeight: 44,
      borderRadius: radius.full,
      paddingHorizontal: 20,
      paddingVertical: 12,
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      alignSelf: "flex-start",
      gap: 8,
    },
    outline: { borderWidth: 1, borderColor: th.colors.line },
    label: { fontFamily: fonts.semibold, fontSize: 14 },
    link: { flexDirection: "row", alignItems: "center", gap: 4, alignSelf: "flex-start", paddingVertical: 4 },
    linkLabel: { fontFamily: fonts.semibold, fontSize: 12 },
    sticky: {
      paddingHorizontal: 20,
      paddingTop: 14,
      backgroundColor: th.colors.background,
      borderTopWidth: 1,
      borderTopColor: th.colors.line,
    },
  });
