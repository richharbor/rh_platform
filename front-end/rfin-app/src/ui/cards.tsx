import { ArrowUpRight, Sparkles, UserRound, type LucideIcon } from "lucide-react-native";
import type { ReactNode } from "react";
import { Pressable, StyleSheet, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import type { Company, Lead, LuckyDraw, Order, PointEntry, Product } from "@/domain/models";
import { LEAD, LUCKY_DRAW, ORDER, REWARD } from "@/domain/states";
import { fonts, radius, useTheme, useThemedStyles, type Palette, type Theme } from "@/design";
import { formatCompact, formatINR } from "@/lib/format";
import { AmountText, Button, Card, Display, Row, Text } from "./primitives";
import { IndicativeBadge, PRICE_KIND_LABEL } from "./feedback";
import { ProgressRing, StatusChip } from "./status";

export type Accent = "red" | "blue" | "amber" | "green";

/** "Grow wealth" → [Grow, wealth]; "Sell an asset" → [Sell, an asset] — never more than two lines. */
const twoLines = (label: string) => {
  const [first, ...rest] = label.split(" ");
  return rest.length ? [first, rest.join(" ")] : [first];
};

/**
 * Anton runs up to ~0.5em per glyph; a half-width tile leaves ~104px for text
 * beside the index. Long words step the size down so nothing truncates, and
 * this works on web too, where adjustsFontSizeToFit is ignored.
 */
const tileFontSize = (lines: string[]) => {
  const longest = Math.max(...lines.map((l) => l.length));
  return Math.min(30, Math.floor(104 / (0.5 * longest)));
};

const accentFg = (c: Palette, a: Accent) => ({ red: c.onRed, blue: c.onBlue, amber: c.onAmber, green: c.onGreen })[a];

/**
 * Goal tile — `rounded-3xl p-5 min-h-32`, solid accent, Anton label one word
 * per line, mono index bottom-right. Selected gets the ink ring.
 */
export function GoalTile({ label, index, accent, selected, onPress }: { label: string; index: number; accent: Accent; selected?: boolean; onPress?: () => void }) {
  const s = useThemedStyles(makeStyles);
  const { colors, figure } = useTheme();
  const fg = accentFg(colors, accent);
  const lines = twoLines(label);
  const size = tileFontSize(lines);
  return (
    <View style={[s.tileRing, selected && { borderColor: colors.foreground }]}>
      <Pressable
        accessibilityRole="button"
        accessibilityState={{ selected }}
        onPress={onPress}
        style={({ pressed }) => [s.tile, { backgroundColor: colors[accent] }, pressed && { transform: [{ translateY: -4 }] }]}
      >
        <View style={{ flex: 1, marginRight: 8 }}>
          {lines.map((w) => (
            <Text key={w} numberOfLines={1} adjustsFontSizeToFit minimumFontScale={0.7} style={[figure(size), { color: fg }]}>{w}</Text>
          ))}
        </View>
        <Text style={{ fontFamily: fonts.mono, fontSize: 14, color: fg }}>{String(index).padStart(2, "0")}</Text>
      </Pressable>
    </View>
  );
}

/** Ink recommendation card — sparkles tile, amber mono label, Anton title, paper pill CTA. */
export function HeroCard({ label, title, detail, cta = "Review", onPress, icon }: { label: string; title: string; detail?: string; cta?: string; onPress?: () => void; icon?: ReactNode }) {
  const s = useThemedStyles(makeStyles);
  const { colors, figure, t } = useTheme();
  return (
    <View style={s.hero} accessibilityLiveRegion="polite">
      <View style={s.heroIcon}>{icon ?? <Sparkles size={28} color={colors.amber} />}</View>
      <View style={{ gap: 4 }}>
        <Text style={[t.label, { color: colors.amber, letterSpacing: 1.6 }]}>{label}</Text>
        <Text style={figure(26, colors.onInverse)}>{title}</Text>
        {detail ? <Text variant="caption" style={{ color: colors.onInverseMute }}>{detail}</Text> : null}
      </View>
      {onPress ? <Button label={cta} variant="paper" trailingIcon={<ArrowUpRight size={16} color={colors.inverse} />} onPress={onPress} /> : null}
    </View>
  );
}

/** `ActivityRow` — soft green circle, title, detail. */
export function ActivityRow({ icon: Icon, title, detail, tone = "green" }: { icon: LucideIcon; title: string; detail: string; tone?: Accent }) {
  const { colors } = useTheme();
  const soft = { green: colors.greenSoft, red: colors.redSoft, blue: colors.blueSoft, amber: colors.amberSoft }[tone];
  return (
    <Row gap={12}>
      <View style={{ width: 32, height: 32, borderRadius: 16, backgroundColor: soft, alignItems: "center", justifyContent: "center" }}>
        <Icon size={16} color={colors[tone]} />
      </View>
      <View style={{ flex: 1 }}>
        <Text variant="title">{title}</Text>
        <Text variant="xs" style={{ marginTop: 2 }}>{detail}</Text>
      </View>
    </Row>
  );
}

/** `Today's focus` — red dot, title, detail, red link. */
export function FocusCard({ title, detail, cta, onPress }: { title: string; detail: string; cta: string; onPress: () => void }) {
  const { colors } = useTheme();
  return (
    <Card>
      <Row gap={12} style={{ alignItems: "flex-start" }}>
        <View style={{ marginTop: 6, width: 8, height: 8, borderRadius: 4, backgroundColor: colors.red }} />
        <View style={{ flex: 1 }}>
          <Text variant="title">{title}</Text>
          <Text variant="xs" style={{ marginTop: 4, lineHeight: 19 }}>{detail}</Text>
        </View>
      </Row>
      <Button variant="link" label={`${cta} →`} onPress={onPress} style={{ marginTop: 12 }} />
    </Card>
  );
}

/** Sidebar `One ID` card — amber/20 tint, Anton name with red dot. */
export function IdentityCard({ name, meta, onPress }: { name: string; meta: string; onPress?: () => void }) {
  const s = useThemedStyles(makeStyles);
  const { colors } = useTheme();
  return (
    <View style={s.identity}>
      <Text variant="label">One ID</Text>
      <Display size={30} dot style={{ marginTop: 4 }}>{name}</Display>
      <Text variant="caption" style={{ marginTop: 4 }}>{meta}</Text>
      {onPress ? (
        <Pressable onPress={onPress} style={{ marginTop: 16, flexDirection: "row", alignItems: "center", gap: 8 }}>
          <UserRound size={14} color={colors.foreground} />
          <Text style={{ fontFamily: fonts.semibold, fontSize: 12, color: colors.foreground }}>View profile</Text>
        </Pressable>
      ) : null}
    </View>
  );
}

/** Portfolio block — Anton figure, green delta, allocation bar with legend. */
export function PortfolioSummary({ value, delta, split }: { value: string; delta: string; split: { label: string; pct: number }[] }) {
  const { colors } = useTheme();
  return (
    <View>
      <AmountText size={36}>{value}</AmountText>
      <Text style={{ marginTop: 4, fontFamily: fonts.medium, fontSize: 13, color: colors.green }}>{delta}</Text>
      <View style={{ marginTop: 20, height: 8, borderRadius: 4, backgroundColor: colors.track, overflow: "hidden" }}>
        <View style={{ height: "100%", width: `${split[0]?.pct ?? 0}%`, backgroundColor: colors.green }} />
      </View>
      <Row style={{ marginTop: 8, justifyContent: "space-between" }}>
        {split.map((x) => (
          <Text key={x.label} style={{ fontSize: 11, fontFamily: fonts.regular, color: colors.mute }}>{x.label} {x.pct}%</Text>
        ))}
      </Row>
    </View>
  );
}

export function ProductCard({ product, onPress }: { product: Product; onPress?: () => void }) {
  const { colors } = useTheme();
  return (
    <Card onPress={onPress} style={{ gap: 6 }}>
      <Row style={{ justifyContent: "space-between" }}>
        <Text variant="label">{product.provider}</Text>
        <ArrowUpRight size={16} color={colors.mute} />
      </Row>
      <Display size={24}>{product.name}</Display>
      <Text variant="caption">{product.tagline}</Text>
      <View style={{ marginTop: 8, borderTopWidth: 1, borderTopColor: colors.lineSoft, paddingTop: 10 }}>
        <Text variant="code">{product.costs[0]?.label.toUpperCase()} · {product.costs[0]?.value}</Text>
      </View>
    </Card>
  );
}

export function CompanyCard({ company, onPress }: { company: Company; onPress?: () => void }) {
  const lead = company.prices[0];
  return (
    <Card onPress={onPress} style={{ gap: 6 }}>
      <Row style={{ justifyContent: "space-between" }}>
        <Text variant="label">{company.sector}</Text>
        {company.isNewSupply ? <StatusChip label="New supply" tone="info" /> : !company.available ? <StatusChip label="Unavailable" tone="neutral" /> : null}
      </Row>
      <Display size={24}>{company.name}</Display>
      {lead ? (
        <Row style={{ justifyContent: "space-between", marginTop: 4 }}>
          <AmountText size={26}>{formatINR(lead.perShare)}</AmountText>
          <IndicativeBadge label={PRICE_KIND_LABEL[lead.kind]} />
        </Row>
      ) : null}
    </Card>
  );
}

export function OrderCard({ order, onPress }: { order: Order; onPress?: () => void }) {
  return (
    <Card onPress={onPress} style={{ gap: 6 }}>
      <Row style={{ justifyContent: "space-between" }}>
        <Text variant="code">{order.id}</Text>
        <StatusChip label={ORDER.label[order.state]} tone={ORDER.tone(order.state)} />
      </Row>
      <Text variant="title">{order.title}</Text>
      <AmountText size={24}>{formatINR(order.amount)}</AmountText>
      {order.action ? <Text variant="caption">Next · {order.action.label}</Text> : null}
    </Card>
  );
}

export function LeadCard({ lead, onPress }: { lead: Lead; onPress?: () => void }) {
  return (
    <Card onPress={onPress} style={{ gap: 6 }}>
      <Row style={{ justifyContent: "space-between" }}>
        <Text variant="title">{lead.client}</Text>
        <StatusChip label={LEAD.label[lead.state]} tone={LEAD.tone(lead.state)} />
      </Row>
      <AmountText size={22}>{formatCompact(lead.potential)}</AmountText>
      <Text variant="caption">Next · {lead.nextAction}</Text>
    </Card>
  );
}

/** Points only — never mixed with cash or commission (report #53). */
export function RewardCard({ entry, toNext }: { entry: PointEntry; toNext?: string }) {
  return (
    <Card style={{ gap: 8 }}>
      <Row style={{ justifyContent: "space-between" }}>
        <Text variant="label">RFIN Points</Text>
        <StatusChip label={REWARD.label[entry.state]} tone={REWARD.tone(entry.state)} />
      </Row>
      <Row style={{ justifyContent: "space-between", alignItems: "flex-end" }}>
        <AmountText size={36}>{entry.points.toLocaleString("en-IN")}</AmountText>
        {toNext ? <Text variant="caption">{toNext}</Text> : null}
      </Row>
      <Text variant="caption">{entry.description}</Text>
    </Card>
  );
}

export function LuckyDrawCard({ draw, onPress }: { draw: LuckyDraw; onPress?: () => void }) {
  const left = draw.threshold - draw.progress;
  return (
    <Card onPress={onPress}>
      <Row gap={16}>
        <ProgressRing value={draw.progress} total={draw.threshold} />
        <View style={{ flex: 1, gap: 4 }}>
          <StatusChip label={LUCKY_DRAW.label[draw.state]} tone={LUCKY_DRAW.tone(draw.state)} />
          <Display size={22}>{draw.name}</Display>
          <Text variant="xs">{left > 0 ? `${left} more eligible transaction${left > 1 ? "s" : ""} to enter` : "You're in the draw"}</Text>
        </View>
      </Row>
    </Card>
  );
}

export function EarningsCard({ label, amount, sub }: { label: string; amount: number; sub?: string }) {
  return (
    <Card style={{ gap: 6, flex: 1 }}>
      <Text variant="label">{label}</Text>
      <AmountText size={28}>{formatCompact(amount)}</AmountText>
      {sub ? <Text variant="xs">{sub}</Text> : null}
    </Card>
  );
}

/** Mobile nav from the reference — icon over 10px semibold label, active in red. */
export function BottomNav({ items, active, onChange }: { items: { key: string; label: string; icon: LucideIcon }[]; active: string; onChange: (key: string) => void }) {
  const s = useThemedStyles(makeStyles);
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  return (
    <View style={[s.nav, { paddingBottom: Math.max(insets.bottom, 16) }]}>
      {items.map(({ key, label, icon: Icon }) => {
        const on = key === active;
        const c = on ? colors.red : colors.mute;
        return (
          <Pressable key={key} accessibilityRole="tab" accessibilityState={{ selected: on }} onPress={() => onChange(key)} style={s.navItem}>
            <Icon size={16} color={c} />
            <Text style={{ fontFamily: fonts.semibold, fontSize: 10, color: c }}>{label}</Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const makeStyles = (th: Theme) =>
  StyleSheet.create({
    tileRing: { flex: 1, borderRadius: radius["3xl"] + 4, borderWidth: 2, borderColor: "transparent", padding: 2 },
    tile: {
      minHeight: 128,
      borderRadius: radius["3xl"],
      padding: 20,
      flexDirection: "row",
      alignItems: "flex-end",
      justifyContent: "space-between",
    },
    hero: { backgroundColor: th.colors.inverse, borderRadius: radius["3xl"], padding: 20, gap: 20 },
    heroIcon: {
      width: 96,
      height: 96,
      borderRadius: radius["2xl"],
      backgroundColor: th.colors.inverseTint,
      borderWidth: 1,
      borderColor: th.colors.inverseLine,
      alignItems: "center",
      justifyContent: "center",
    },
    identity: { ...th.surface, backgroundColor: th.colors.amberTint, padding: 20 },
    nav: {
      flexDirection: "row",
      justifyContent: "space-between",
      paddingHorizontal: 20,
      paddingTop: 16,
      borderTopWidth: 1,
      borderTopColor: th.colors.line,
      backgroundColor: th.colors.background,
    },
    navItem: { alignItems: "center", gap: 4, minWidth: 56 },
  });
