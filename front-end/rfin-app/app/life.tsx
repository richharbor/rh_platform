import { useRouter } from "expo-router";
import { Briefcase, HeartPulse, Landmark, Plus, TrendingUp, Users } from "lucide-react-native";
import { Pressable, View } from "react-native";
import { useLife } from "@/api/hooks";
import { useTheme } from "@/design";
import { formatCompact, formatINR } from "@/lib/format";
import { PageHeader } from "@/features/PageHeader";
import { ActivityRow, AmountText, Button, Card, IndicativeBadge, ProgressBar, QueryView, Row, Screen, Section, Text, toneColors } from "@/ui";

/** My Financial Life (report #45, Phase 2) with portfolio intelligence (Phase 3). */
export default function Life() {
  const router = useRouter();
  const th = useTheme();
  const life = useLife();
  return (
    <Screen header={<PageHeader label="My financial life" />} eyebrow="Customer 360" title="Everything, in one view." subtitle="What you hold on RFIN and elsewhere, what protects you, what you owe, and where you're heading.">
      <QueryView query={life}>
        {(l) => (
          <>
            <Card style={{ gap: 6 }}>
              <Row style={{ justifyContent: "space-between" }}>
                <Text variant="label">Net worth</Text>
                <IndicativeBadge />
              </Row>
              <AmountText size={40}>{formatCompact(l.netWorth)}</AmountText>
              <Text variant="xs">{l.note}</Text>
            </Card>
            <Row gap={12}>
              <Card style={{ flex: 1, gap: 2 }}><Text variant="label">Invested</Text><AmountText size={20}>{formatCompact(l.totals.investments)}</AmountText></Card>
              <Card style={{ flex: 1, gap: 2 }}><Text variant="label">Cover</Text><AmountText size={20}>{formatCompact(l.totals.cover)}</AmountText></Card>
              <Card style={{ flex: 1, gap: 2 }}><Text variant="label">Loans</Text><AmountText size={20}>{formatCompact(l.totals.loans)}</AmountText></Card>
            </Row>

            {l.insights.length ? (
              <Section title="Worth a look">
                {l.insights.map((i) => {
                  const c = toneColors(th, i.tone === "success" ? "success" : i.tone);
                  return (
                    <View key={i.title} style={{ padding: 14, borderRadius: 18, backgroundColor: c.soft, gap: 4 }}>
                      <Text variant="title">{i.title}</Text>
                      <Text variant="caption">{i.detail}</Text>
                    </View>
                  );
                })}
              </Section>
            ) : null}

            <Section title="Holdings" gap={14} action={<Button label="Add →" variant="link" onPress={() => router.push("/profile/financial")} />}>
              {l.holdings.length ? (
                <Pressable onPress={() => router.push("/portfolio")}>
                  <ActivityRow icon={Briefcase} title={`Unlisted shares · ${formatCompact(l.totals.unlisted)}`} detail={`${l.holdings.map((h) => h.name).join(", ")} · indicative`} tone="blue" />
                </Pressable>
              ) : null}
              {l.items.map((i) => (
                <ActivityRow
                  key={i.id}
                  icon={i.kind === "insurance" ? HeartPulse : i.kind === "loan" ? Landmark : TrendingUp}
                  title={`${i.name} · ${formatINR(i.value)}`}
                  detail={`${i.kind === "insurance" ? "Cover" : i.kind === "loan" ? "Borrowed" : "Invested"} · ${i.provider ?? ""} · ${i.source === "rfin" ? "on RFIN" : "held elsewhere"}`}
                  tone={i.kind === "loan" ? "amber" : i.kind === "insurance" ? "green" : "blue"}
                />
              ))}
              {!l.items.length && !l.holdings.length ? <Text variant="muted">Nothing yet — add what you hold elsewhere for a full picture.</Text> : null}
            </Section>

            <Section title="Goals" action={<Button label="All →" variant="link" onPress={() => router.push("/goals")} />}>
              {l.goals.length ? (
                l.goals.filter((g) => g.state !== "archived").map((g) => (
                  <Card key={g.id} onPress={() => router.push(`/goals/${g.id}`)} style={{ gap: 6 }}>
                    <Row style={{ justifyContent: "space-between" }}>
                      <Text variant="title">{g.title}</Text>
                      <Text variant="code" style={{ color: g.onTrack ? th.colors.green : th.colors.red }}>{g.onTrack ? "ON TRACK" : "BEHIND"}</Text>
                    </Row>
                    <ProgressBar value={g.pct} tone={g.onTrack ? "success" : "action"} />
                    <Text variant="xs">{formatINR(g.saved)} of {formatINR(g.target)} · by {g.targetDate}</Text>
                  </Card>
                ))
              ) : (
                <Button label="Set a goal" icon={<Plus size={16} color={th.colors.onInverse} />} onPress={() => router.push("/goals")} />
              )}
            </Section>

            <Section title="Family" action={<Button label="Manage →" variant="link" onPress={() => router.push("/family")} />}>
              <Pressable onPress={() => router.push("/family")}>
                <ActivityRow icon={Users} title={l.family.length ? l.family.map((f) => f.name).join(", ") : "Add your family"} detail={l.family.length ? `${l.family.filter((f) => !f.cover.health).length} without health cover` : "See who's covered and where the gaps are"} tone="amber" />
              </Pressable>
            </Section>
          </>
        )}
      </QueryView>
    </Screen>
  );
}
