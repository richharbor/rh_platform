import { dayMonth, longDate } from "@rfin/shared/greeting";
import { useRouter } from "expo-router";
import { Gift, Users } from "lucide-react-native";
import { Pressable, View } from "react-native";
import { useBenefits, useDraws, useReferrals, useRewardsSummary } from "@/api/hooks";
import { GIFT_CARD } from "@/domain/states";
import { useTheme } from "@/design";
import { formatINR } from "@/lib/format";
import { ActivityRow, AmountText, Button, Card, DisclosureBlock, HeroCard, LuckyDrawCard, ProgressBar, QueryView, Row, Screen, Section, StatusChip, Text } from "@/ui";

/** Rewards hub — Available now · Pending · Unlock next (report #51, #59). Financial info always comes first elsewhere; rewards never obscure risk. */
export default function Rewards() {
  const router = useRouter();
  const { colors } = useTheme();
  const summary = useRewardsSummary();
  const benefits = useBenefits();
  const draws = useDraws();
  const referrals = useReferrals();

  return (
    <Screen eyebrow="Rewards" title="Earned, not promised." subtitle="Points, benefits and draws — with the rules in plain sight.">
      <QueryView query={summary}>
        {(s) => {
          const next = s.tier.next;
          const span = next ? next.minPoints - s.tier.minPoints : 1;
          const into = s.points.lifetime - s.tier.minPoints;
          return (
            <Card onPress={() => router.push("/rewards/points")} style={{ gap: 8 }}>
              <Row style={{ justifyContent: "space-between" }}>
                <Text variant="label">RFIN Points</Text>
                <StatusChip label={s.tier.name} tone="pending" />
              </Row>
              <AmountText size={44}>{s.points.available.toLocaleString("en-IN")}</AmountText>
              <Text variant="caption">{s.points.locked ? `${s.points.locked.toLocaleString("en-IN")} locked · ` : ""}{s.points.lifetime.toLocaleString("en-IN")} earned in total</Text>
              {next ? (
                <View style={{ gap: 6 }}>
                  <ProgressBar value={(into / span) * 100} tone="pending" />
                  <Text variant="xs">{next.pointsToGo.toLocaleString("en-IN")} to {next.name} · {next.perks[0]}</Text>
                </View>
              ) : null}
            </Card>
          );
        }}
      </QueryView>

      <Section title="Benefits">
        <QueryView query={benefits} empty={{ title: "No benefits yet", body: "Your first eligible transaction unlocks a gift card." }}>
          {(list) => (
            <View style={{ gap: 12 }}>
              {list.map((b) => (
                <Card key={b.id} onPress={() => router.push(`/rewards/benefit/${b.id}`)} style={{ gap: 4 }}>
                  <Row style={{ justifyContent: "space-between" }}>
                    <Text variant="label">{b.issuer}</Text>
                    <StatusChip label={GIFT_CARD.label[b.state]} tone={GIFT_CARD.tone(b.state)} />
                  </Row>
                  <AmountText size={28}>{formatINR(b.value)}</AmountText>
                  <Text variant="caption">{b.title}{b.expiresAt ? ` · valid till ${dayMonth(b.expiresAt)}` : ""}</Text>
                </Card>
              ))}
            </View>
          )}
        </QueryView>
      </Section>

      <Section title="Lucky draws">
        <QueryView query={draws}>{(list) => <View style={{ gap: 12 }}>{list.map((d) => <LuckyDrawCard key={d.id} draw={d} onPress={() => router.push(`/rewards/draw/${d.id}`)} />)}</View>}</QueryView>
      </Section>

      <QueryView query={summary}>
        {(s) => <HeroCard label="Refer & earn" title={`${formatINR(s.referral.reward)} per friend`} detail={s.referral.rule} cta="Invite" icon={<Users size={28} color={colors.amber} />} onPress={() => router.push("/refer")} />}
      </QueryView>
      <QueryView query={referrals}>
        {(list) =>
          list.length ? (
            <Pressable onPress={() => router.push("/refer")}>
              <ActivityRow icon={Gift} title={`${list.length} referral${list.length > 1 ? "s" : ""} · ${list.filter((r) => r.state === "paid").length} paid`} detail="Tap to track them" tone="amber" />
            </Pressable>
          ) : null
        }
      </QueryView>

      <Section title="Tiers">
        <QueryView query={summary}>
          {(s) =>
            s.tiers.map((t) => (
              <Row key={t.id} style={{ justifyContent: "space-between", paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: colors.lineSoft }}>
                <View style={{ flex: 1 }}>
                  <Text variant="title" style={{ color: t.id === s.tier.id ? colors.red : colors.foreground }}>{t.name}{t.id === s.tier.id ? " · you" : ""}</Text>
                  <Text variant="xs">{t.perks.join(" · ")}</Text>
                </View>
                <Text variant="code">{t.minPoints.toLocaleString("en-IN")}+</Text>
              </Row>
            ))
          }
        </QueryView>
        <QueryView query={summary}>{(s) => <Text variant="xs">{s.note}</Text>}</QueryView>
      </Section>

      <DisclosureBlock title="How rewards work" items={["Points aren't cash and can't be withdrawn", "Rewards are issued only after a transaction is confirmed", "Reversed or cancelled transactions reverse their rewards"]} />
      <Button label="Points history" variant="outline" onPress={() => router.push("/rewards/points")} />
    </Screen>
  );
}
