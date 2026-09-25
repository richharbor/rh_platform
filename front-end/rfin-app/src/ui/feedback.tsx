import type { UseQueryResult } from "@tanstack/react-query";
import { AlertTriangle, CircleHelp, Info, Lock, ShieldCheck } from "lucide-react-native";
import { useEffect, useRef, type ReactNode } from "react";
import { Animated, StyleSheet, View } from "react-native";
import type { PriceKind } from "@/domain/models";
import { radius, useTheme, useThemedStyles, type Theme } from "@/design";
import { Button, Row, Text } from "./primitives";

export function Skeleton({ height = 14, width = "100%" as number | `${number}%`, round }: { height?: number; width?: number | `${number}%`; round?: boolean }) {
  const { colors } = useTheme();
  const pulse = useRef(new Animated.Value(0.5)).current;
  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(pulse, { toValue: 1, duration: 700, useNativeDriver: true }),
        Animated.timing(pulse, { toValue: 0.5, duration: 700, useNativeDriver: true }),
      ]),
    );
    loop.start();
    return () => loop.stop();
  }, [pulse]);
  return <Animated.View style={{ height, width, borderRadius: round ? height : 6, backgroundColor: colors.track, opacity: pulse }} />;
}

export function SkeletonCard() {
  const s = useThemedStyles(makeStyles);
  return (
    <View style={[s.panel, { gap: 12 }]}>
      <Skeleton height={10} width="30%" />
      <Skeleton height={28} width="65%" />
      <Skeleton height={6} round />
    </View>
  );
}

type StateProps = { title: string; body?: string; action?: { label: string; onPress: () => void } };

function StatePanel({ icon, iconBg, title, body, action }: StateProps & { icon: ReactNode; iconBg: string }) {
  const s = useThemedStyles(makeStyles);
  return (
    <View style={[s.panel, { gap: 12 }]}>
      <View style={[s.iconCircle, { backgroundColor: iconBg }]}>{icon}</View>
      <Text style={useTheme().figure(24)}>{title}</Text>
      {body ? <Text variant="muted">{body}</Text> : null}
      {action ? <Button label={action.label} onPress={action.onPress} style={{ marginTop: 4 }} /> : null}
    </View>
  );
}

export function EmptyState(p: StateProps) {
  const { colors } = useTheme();
  return <StatePanel icon={<Info size={16} color={colors.mute} />} iconBg={colors.pressed} {...p} />;
}

export function ErrorState(p: StateProps) {
  const { colors } = useTheme();
  return <StatePanel icon={<AlertTriangle size={16} color={colors.red} />} iconBg={colors.redSoft} {...p} />;
}

export function LockedState(p: StateProps) {
  const { colors } = useTheme();
  return <StatePanel icon={<Lock size={16} color={colors.blue} />} iconBg={colors.blueSoft} {...p} />;
}

/**
 * Loading / error / empty handled the same way everywhere, so no screen hides a
 * status behind a bare spinner (UX rules 3, 10).
 */
export function QueryView<T>({
  query,
  empty,
  isEmpty = (d) => Array.isArray(d) && d.length === 0,
  children,
}: {
  query: UseQueryResult<T>;
  empty?: StateProps;
  isEmpty?: (d: T) => boolean;
  children: (data: T) => ReactNode;
}) {
  if (query.isPending) return <SkeletonCard />;
  if (query.isError)
    return <ErrorState title="This didn't load" body={query.error.message} action={{ label: "Try again", onPress: () => query.refetch() }} />;
  if (empty && isEmpty(query.data)) return <EmptyState {...empty} />;
  return <>{children(query.data)}</>;
}

export function TrustBanner({ children }: { children: ReactNode }) {
  const s = useThemedStyles(makeStyles);
  const { colors } = useTheme();
  return (
    <Row gap={12} style={s.trust}>
      <View style={[s.iconCircle, { backgroundColor: colors.greenSoft }]}>
        <ShieldCheck size={16} color={colors.green} />
      </View>
      <Text variant="caption" style={{ flex: 1 }}>{children}</Text>
    </Row>
  );
}

/** `Need a hand?` — amber support panel with a human path (report #9). */
export function SupportPanel({ title = "Need a hand?", body, requested, onPress }: { title?: string; body: string; requested?: boolean; onPress: () => void }) {
  const s = useThemedStyles(makeStyles);
  const { colors } = useTheme();
  return (
    <View style={s.support}>
      <Row gap={12}>
        <Text variant="label">{title}</Text>
        <View style={{ flex: 1, height: 1, backgroundColor: colors.line }} />
      </Row>
      <Text variant="muted" style={{ marginTop: 12 }}>{body}</Text>
      <Button
        label={requested ? "Advisor requested" : "Talk to a human"}
        icon={<CircleHelp size={16} color={colors.onInverse} />}
        onPress={onPress}
        style={{ marginTop: 20 }}
      />
      {requested ? <Text variant="xs" style={{ marginTop: 12, color: colors.green, fontFamily: "Inter_500Medium" }}>Someone from the RFIN team will be in touch shortly.</Text> : null}
    </View>
  );
}

export const PRICE_KIND_LABEL: Record<PriceKind, string> = {
  current_indicative: "Current indicative",
  latest_funding_round: "Latest funding round",
  secondary_trade: "Secondary trade",
  indicative_mark: "Indicative mark",
};

/** Marks a number as not-a-firm-quote (report #27, #91, UX rule 5). */
export function IndicativeBadge({ label = "Indicative" }: { label?: string }) {
  const { colors } = useTheme();
  return (
    <View style={{ borderWidth: 1, borderColor: colors.blue, borderRadius: radius.full, paddingHorizontal: 8, paddingVertical: 2, alignSelf: "flex-start" }}>
      <Text variant="code" style={{ color: colors.blue, fontSize: 10, textTransform: "uppercase" }}>{label}</Text>
    </View>
  );
}

/** Risk / limitation block — always above reward content (report #10). Red-dot list like "Today's focus". */
export function DisclosureBlock({ title = "Risks & limitations", items }: { title?: string; items: string[] }) {
  const s = useThemedStyles(makeStyles);
  const { colors } = useTheme();
  return (
    <View style={s.disclosure}>
      <Text variant="label">{title}</Text>
      {items.map((it) => (
        <Row key={it} gap={12} style={{ alignItems: "flex-start" }}>
          <View style={{ marginTop: 8, width: 6, height: 6, borderRadius: 3, backgroundColor: colors.red }} />
          <Text variant="muted" style={{ flex: 1 }}>{it}</Text>
        </Row>
      ))}
    </View>
  );
}

const makeStyles = (th: Theme) =>
  StyleSheet.create({
    panel: { ...th.surface, padding: 20 },
    iconCircle: { width: 32, height: 32, borderRadius: 16, alignItems: "center", justifyContent: "center" },
    trust: { ...th.surface, padding: 14 },
    support: { ...th.surface, backgroundColor: th.colors.amberSoft, padding: 20 },
    disclosure: { ...th.surface, padding: 16, gap: 10 },
  });
