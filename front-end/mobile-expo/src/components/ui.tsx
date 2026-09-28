import { LinearGradient } from "expo-linear-gradient";
import { useRouter, type Href } from "expo-router";
import { ArrowLeft, ChevronRight, type LucideIcon } from "lucide-react-native";
import { Children, type ReactNode } from "react";
import {
  Animated,
  Pressable,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  View,
  type StyleProp,
  type TextInputProps,
  type TextStyle,
  type ViewStyle,
} from "react-native";
import { useAnimatedWidth } from "./motion";
import { Touchable } from "./Touchable";
import {
  fonts,
  fontScale,
  radius,
  useTheme,
  useThemedStyles,
  type Palette,
  type Theme,
} from "@/theme";

/* ------------------------------------------------------------------ surfaces */

/** @utility surface */
export function Surface({
  children,
  style,
}: {
  children?: ReactNode;
  style?: StyleProp<ViewStyle>;
}) {
  const { surface } = useTheme();
  return <View style={[surface, style]}>{children}</View>;
}

type GradientTone = "navy" | "earn" | "gold";

/** @utility surface-navy / surface-earn / surface-gold */
export function GradientSurface({
  tone,
  children,
  style,
}: {
  tone: GradientTone;
  children?: ReactNode;
  style?: StyleProp<ViewStyle>;
}) {
  const { colors, gradients, shadowCard, shadowElevated, shadowGlowEarn } = useTheme();
  const shadow = tone === "navy" ? shadowElevated : tone === "earn" ? shadowGlowEarn : shadowCard;
  return (
    <LinearGradient
      colors={[...gradients[tone]]}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={[{ borderRadius: radius["2xl"], overflow: "hidden" }, shadow, style]}
    >
      {children}
    </LinearGradient>
  );
}

/** A vertically divided list container (`surface divide-y`) */
export function DividedSurface({
  children,
  style,
}: {
  children: ReactNode;
  style?: StyleProp<ViewStyle>;
}) {
  const { colors } = useTheme();
  const items = Children.toArray(children);
  return (
    <Surface style={[{ overflow: "hidden" }, style]}>
      {items.map((child, i) => (
        <View key={i} style={i > 0 ? { borderTopWidth: 1, borderTopColor: colors.border } : null}>
          {child}
        </View>
      ))}
    </Surface>
  );
}

/* -------------------------------------------------------------------- header */

export function PageHeader({
  title,
  subtitle,
  back = "/",
  action,
}: {
  title: string;
  subtitle?: string;
  back?: Href;
  action?: ReactNode;
}) {
  const { colors, t } = useTheme();
  const styles = useThemedStyles(makeStyles);
  const router = useRouter();
  return (
    <View style={styles.pageHeader}>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Back"
        onPress={() => {
          if (router.canGoBack()) router.back();
          else router.replace(back);
        }}
        style={({ pressed }) => [styles.backBtn, pressed && { opacity: 0.7 }]}
        hitSlop={6}
      >
        <ArrowLeft size={20} color={colors.foreground} />
      </Pressable>
      <View style={{ flex: 1, minWidth: 0 }}>
        <Text numberOfLines={1} style={styles.pageTitle}>
          {title}
        </Text>
        {subtitle ? (
          <Text numberOfLines={1} style={t.xs}>
            {subtitle}
          </Text>
        ) : null}
      </View>
      {action}
    </View>
  );
}

export function SectionHeader({
  title,
  to,
  linkLabel = "See all",
}: {
  title: string;
  to?: Href;
  linkLabel?: string;
}) {
  const { t } = useTheme();
  const styles = useThemedStyles(makeStyles);
  return (
    <View style={styles.sectionHeader}>
      <Text style={t.h2}>{title}</Text>
      {to ? (
        <Touchable href={to} hitSlop={8}>
          <Text style={styles.sectionLink}>{linkLabel}</Text>
        </Touchable>
      ) : null}
    </View>
  );
}

/* ------------------------------------------------------------------- numbers */

/** `text-5xl` / `text-4xl` / `text-2xl` on the `num` utility */
export function BigNumber({
  value,
  style,
  size = "lg",
}: {
  value: string;
  style?: StyleProp<TextStyle>;
  size?: "md" | "lg" | "xl";
}) {
  const { num } = useTheme();
  const scale =
    size === "xl" ? fontScale["5xl"] : size === "lg" ? fontScale["4xl"] : fontScale["2xl"];
  return (
    <Text
      style={[num(scale.fontSize), { lineHeight: scale.lineHeight }, style]}
      numberOfLines={1}
      adjustsFontSizeToFit
      minimumFontScale={0.6}
    >
      {value}
    </Text>
  );
}

/* --------------------------------------------------------------------- chips */

/**
 * Chip colours, as a factory over the palette.
 *
 * Each entry pairs a soft background with the ink meant to sit on it. The pair has
 * to flip together between schemes — a pale green tint takes dark green ink, a deep
 * green tint takes bright green ink — which is what the `on*Soft` tokens encode.
 */
const chipTone = (c: Palette): Record<string, { bg: string; fg: string }> => ({
  New: { bg: c.infoSoft, fg: c.onInfoSoft },
  Contacted: { bg: c.infoSoft, fg: c.onInfoSoft },
  Documents: { bg: c.warningSoft, fg: c.onWarningSoft },
  Processing: { bg: c.warningSoft, fg: c.onWarningSoft },
  Successful: { bg: c.earnSoft, fg: c.onEarnSoft },
  Payout: { bg: c.goldSoft, fg: c.onGoldSoft },
  Shared: { bg: c.muted, fg: c.mutedForeground },
  Enquired: { bg: c.infoSoft, fg: c.onInfoSoft },
  "In progress": { bg: c.warningSoft, fg: c.onWarningSoft },
  Converted: { bg: c.earnSoft, fg: c.onEarnSoft },
  Paid: { bg: c.earnSoft, fg: c.onEarnSoft },
  Pending: { bg: c.warningSoft, fg: c.onWarningSoft },
  Scheduled: { bg: c.infoSoft, fg: c.onInfoSoft },
  Credit: { bg: c.earnSoft, fg: c.onEarnSoft },
  Released: { bg: c.earnSoft, fg: c.onEarnSoft },
  Debit: { bg: c.muted, fg: c.foreground },
  Reversed: { bg: c.destructiveSoft, fg: c.onDestructiveSoft },
  Expired: { bg: c.muted, fg: c.mutedForeground },
  Adjustment: { bg: c.goldSoft, fg: c.onGoldSoft },
  Verified: { bg: c.earnSoft, fg: c.onEarnSoft },
  "Action needed": { bg: c.destructiveSoft, fg: c.onDestructiveSoft },
  "Not started": { bg: c.muted, fg: c.mutedForeground },
  Uploaded: { bg: c.earnSoft, fg: c.onEarnSoft },
  Requested: { bg: c.warningSoft, fg: c.onWarningSoft },
  "In review": { bg: c.infoSoft, fg: c.onInfoSoft },
  Open: { bg: c.warningSoft, fg: c.onWarningSoft },
  Resolved: { bg: c.earnSoft, fg: c.onEarnSoft },
  Primary: { bg: c.goldSoft, fg: c.onGoldSoft },
});

export function StatusChip({ label, style }: { label: string; style?: StyleProp<ViewStyle> }) {
  const { colors } = useTheme();
  const styles = useThemedStyles(makeStyles);
  const tone = chipTone(colors)[label] ?? { bg: colors.muted, fg: colors.mutedForeground };
  return (
    <View style={[styles.chip, { backgroundColor: tone.bg }, style]}>
      <Text style={[styles.chipText, { color: tone.fg }]}>{label}</Text>
    </View>
  );
}

/* ----------------------------------------------------------------- progress */

export function ProgressBar({
  value,
  tone = "earn",
  trackColor,
  style,
}: {
  value: number;
  tone?: "earn" | "gold" | "navy" | "light";
  trackColor?: string;
  style?: StyleProp<ViewStyle>;
}) {
  const { colors } = useTheme();
  const styles = useThemedStyles(makeStyles);
  const width = useAnimatedWidth(value);
  const fill =
    tone === "earn"
      ? colors.earn
      : tone === "gold"
        ? colors.gold
        : tone === "navy"
          ? colors.navy
          : colors.navyForeground;
  return (
    <View style={[styles.track, { backgroundColor: trackColor ?? colors.foreground10 }, style]}>
      <Animated.View style={[styles.trackFill, { backgroundColor: fill, width }]} />
    </View>
  );
}

/* --------------------------------------------------------------------- rows */

export function ListRow({
  icon: Icon,
  title,
  subtitle,
  right,
  to,
  onPress,
}: {
  icon?: LucideIcon;
  title: string;
  subtitle?: string;
  right?: ReactNode;
  to?: Href;
  onPress?: () => void;
}) {
  const { colors, t } = useTheme();
  const styles = useThemedStyles(makeStyles);
  const body = (
    <>
      {Icon ? (
        <View style={styles.rowIcon}>
          <Icon size={20} color={colors.brandText} />
        </View>
      ) : null}
      <View style={{ flex: 1, minWidth: 0 }}>
        <Text numberOfLines={1} style={styles.rowTitle}>
          {title}
        </Text>
        {subtitle ? (
          <Text numberOfLines={1} style={t.xs}>
            {subtitle}
          </Text>
        ) : null}
      </View>
      {right ?? <ChevronRight size={16} color={colors.mutedForeground} />}
    </>
  );

  return (
    <Touchable href={to} onPress={onPress} style={styles.row} pressedStyle={styles.pressedRow}>
      {body}
    </Touchable>
  );
}

/* --------------------------------------------------------------------- stats */

export function Stat({
  label,
  value,
  tone = "default",
  style,
}: {
  label: string;
  value: string;
  tone?: "default" | "earn" | "gold";
  style?: StyleProp<ViewStyle>;
}) {
  const { colors, t, num } = useTheme();
  const color =
    tone === "earn" ? colors.earn : tone === "gold" ? colors.goldForeground : colors.foreground;
  return (
    <Surface style={[{ padding: 16 }, style]}>
      <Text style={[t.eyebrow, { color: colors.mutedForeground }]}>{label}</Text>
      <Text style={[num(24), { marginTop: 4 }]}>{value}</Text>
    </Surface>
  );
}

export function EmptyState({ title, body }: { title: string; body: string }) {
  const { colors, t } = useTheme();
  return (
    <Surface style={{ marginHorizontal: 20, padding: 32, alignItems: "center" }}>
      <Text style={{ fontFamily: fonts.semibold, fontSize: 15, color: colors.foreground }}>
        {title}
      </Text>
      <Text style={[t.muted, { marginTop: 4, textAlign: "center" }]}>{body}</Text>
    </Surface>
  );
}

/** A labelled toggle row, sized like ListRow. */
export function SwitchRow({
  icon: Icon,
  title,
  subtitle,
  value,
  onValueChange,
  disabled,
}: {
  icon?: LucideIcon;
  title: string;
  subtitle?: string;
  value: boolean;
  onValueChange: (v: boolean) => void;
  disabled?: boolean;
}) {
  const { colors, t } = useTheme();
  const styles = useThemedStyles(makeStyles);
  return (
    <View style={[styles.row, disabled ? { opacity: 0.5 } : null]}>
      {Icon ? (
        <View style={styles.rowIcon}>
          <Icon size={20} color={colors.brandText} />
        </View>
      ) : null}
      <View style={{ flex: 1, minWidth: 0 }}>
        <Text style={styles.rowTitle}>{title}</Text>
        {subtitle ? <Text style={t.xs}>{subtitle}</Text> : null}
      </View>
      <Switch
        value={value}
        onValueChange={onValueChange}
        disabled={disabled}
        trackColor={{ false: colors.border, true: colors.earn }}
        thumbColor={colors.card}
        ios_backgroundColor={colors.border}
      />
    </View>
  );
}

/* ------------------------------------------------------------------- buttons */

type BtnVariant = "primary" | "earn" | "gold" | "ghost" | "onDark";

const btnBg = (c: Palette): Record<BtnVariant, string> => ({
  primary: c.navy,
  earn: c.earn,
  gold: c.gold,
  ghost: c.muted,
  onDark: c.onDark14,
});
const btnFg = (c: Palette): Record<BtnVariant, string> => ({
  primary: c.navyForeground,
  earn: c.earnForeground,
  gold: c.goldForeground,
  ghost: c.foreground,
  onDark: c.navyForeground,
});

/** @utility btn + btn-{variant} */
export function Btn({
  label,
  variant = "primary",
  icon: Icon,
  to,
  onPress,
  disabled,
  glow,
  style,
}: {
  label: string;
  variant?: BtnVariant;
  icon?: LucideIcon;
  to?: Href;
  onPress?: () => void;
  disabled?: boolean;
  glow?: boolean;
  style?: StyleProp<ViewStyle>;
}) {
  const { colors, shadowGlowEarn } = useTheme();
  const styles = useThemedStyles(makeStyles);
  return (
    <Touchable
      href={disabled ? undefined : to}
      onPress={onPress}
      disabled={disabled}
      style={[
        styles.btn,
        { backgroundColor: btnBg(colors)[variant] },
        glow ? shadowGlowEarn : null,
        style,
      ]}
      pressedStyle={{ transform: [{ scale: 0.97 }] }}
    >
      {Icon ? <Icon size={16} color={btnFg(colors)[variant]} /> : null}
      <Text style={[styles.btnText, { color: btnFg(colors)[variant] }]} numberOfLines={1}>
        {label}
      </Text>
    </Touchable>
  );
}

/* -------------------------------------------------------------------- inputs */

/** @utility field */
export function Field(props: TextInputProps & { style?: StyleProp<ViewStyle> }) {
  const { colors } = useTheme();
  const styles = useThemedStyles(makeStyles);
  const { style, ...rest } = props;
  return (
    <TextInput
      placeholderTextColor={colors.mutedForeground}
      style={[styles.field, style as StyleProp<TextStyle>]}
      {...rest}
    />
  );
}

/* --------------------------------------------------------------------- misc */

/**
 * Small pill used for roles, docs and categories.
 * `sm` = `px-2.5 py-1 text-[11px]`, `md` = `px-3 py-1 text-xs`.
 */
export function Pill({
  label,
  bg,
  color,
  size = "md",
  weight = "medium",
  style,
}: {
  label: string;
  bg?: string;
  color?: string;
  size?: "sm" | "md";
  weight?: "medium" | "semibold";
  style?: StyleProp<ViewStyle>;
}) {
  const { colors } = useTheme();
  const styles = useThemedStyles(makeStyles);
  return (
    <View
      style={[
        styles.pill,
        size === "sm"
          ? { paddingHorizontal: 10, paddingVertical: 4 }
          : { paddingHorizontal: 12, paddingVertical: 4 },
        { backgroundColor: bg ?? colors.muted },
        style,
      ]}
    >
      <Text
        style={[
          styles.pillText,
          {
            fontSize: size === "sm" ? 11 : 12,
            fontFamily: weight === "semibold" ? fonts.semibold : fonts.medium,
            color,
          },
        ]}
      >
        {label}
      </Text>
    </View>
  );
}

/** Circular icon badge (`grid size-N place-items-center rounded-2xl`) */
export function IconBadge({
  icon: Icon,
  size = 40,
  iconSize = 20,
  bg,
  color,
  round = false,
  style,
}: {
  icon: LucideIcon;
  size?: number;
  iconSize?: number;
  bg?: string;
  color?: string;
  round?: boolean;
  style?: StyleProp<ViewStyle>;
}) {
  const { colors } = useTheme();
  return (
    <View
      style={[
        {
          width: size,
          height: size,
          borderRadius: round ? radius.full : radius["2xl"],
          backgroundColor: bg ?? colors.muted,
          alignItems: "center",
          justifyContent: "center",
        },
        style,
      ]}
    >
      <Icon size={iconSize} color={color ?? colors.brandText} />
    </View>
  );
}

const makeStyles = ({ colors, shadowCard }: Theme) =>
  StyleSheet.create({
    pageHeader: {
      flexDirection: "row",
      alignItems: "center",
      gap: 12,
      paddingHorizontal: 20,
      paddingTop: 20,
      paddingBottom: 12,
    },
    backBtn: {
      width: 40,
      height: 40,
      borderRadius: radius.full,
      backgroundColor: colors.card,
      alignItems: "center",
      justifyContent: "center",
      ...shadowCard,
    },
    pageTitle: {
      fontFamily: fonts.display,
      fontSize: 18,
      lineHeight: 28,
      letterSpacing: -0.36,
      color: colors.foreground,
    },
    sectionHeader: {
      marginBottom: 12,
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      paddingHorizontal: 20,
    },
    sectionLink: { fontFamily: fonts.semibold, fontSize: 12, lineHeight: 16, color: colors.earn },
    chip: {
      alignSelf: "flex-start",
      borderRadius: radius.full,
      paddingHorizontal: 10,
      paddingVertical: 4,
    },
    chipText: { fontSize: 11, fontFamily: fonts.semibold },
    track: { height: 8, width: "100%", borderRadius: radius.full, overflow: "hidden" },
    trackFill: { height: "100%", borderRadius: radius.full },
    row: {
      flexDirection: "row",
      alignItems: "center",
      gap: 12,
      paddingHorizontal: 16,
      paddingVertical: 14,
    },
    pressedRow: { backgroundColor: colors.muted },
    rowIcon: {
      width: 40,
      height: 40,
      borderRadius: radius["2xl"],
      backgroundColor: colors.muted,
      alignItems: "center",
      justifyContent: "center",
    },
    rowTitle: {
      fontFamily: fonts.semibold,
      fontSize: 14,
      lineHeight: 20,
      color: colors.foreground,
    },
    btn: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      gap: 8,
      borderRadius: radius.full,
      paddingHorizontal: 20,
      paddingVertical: 13,
    },
    btnText: { fontFamily: fonts.semibold, fontSize: 15 },
    field: {
      width: "100%",
      borderRadius: radius.md,
      borderWidth: 1,
      borderColor: colors.input,
      backgroundColor: colors.card,
      paddingHorizontal: 16,
      paddingVertical: 13,
      fontSize: 15,
      fontFamily: fonts.regular,
      color: colors.foreground,
    },
    pill: { borderRadius: radius.full },
    pillText: {},
  });
