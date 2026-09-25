import { useRouter } from "expo-router";
import { BookOpen, Plus, Sparkles } from "lucide-react-native";
import { Pressable, View } from "react-native";
import { useCases, useCommission, useLeads, useOpportunities, usePartnerInsights } from "@/api/hooks";
import { LEAD } from "@/domain/states";
import { useTheme } from "@/design";
import { dateline } from "@/features/greeting";
import { formatCompact } from "@/lib/format";
import { useSession } from "@/stores/session";
import { ActivityRow, Card, EarningsCard, FocusCard, HeroCard, QueryView, Rise, Row, Screen, Section, StatusChip, StatusRow, Text } from "@/ui";

/** Partner Home — leads needing action, cases in flight, value, earnings, next best action (report #82). */
export default function PartnerHome() {
  const router = useRouter();
  const { colors } = useTheme();
  const name = useSession((s) => s.profile.name.split(" ")[0]);
  const leads = useLeads();
  const cases = useCases();
  const ops = useOpportunities();
  const commission = useCommission();
  const perf = usePartnerInsights();

  return (
    <Screen eyebrow={dateline()} title={name ? `${name}, who needs you today?` : "Who needs you today?"} subtitle="Leads, cases and earnings — with the next move on each.">
      <Rise delay={1}>
        <HeroCard label="Add a lead" title="60 seconds, start to submit" detail="Client → need → product → documents. We handle the rest." cta="Add lead" icon={<Plus size={28} color={colors.amber} />} onPress={() => router.push("/partner/leads/new")} />
      </Rise>

      <QueryView query={leads}>
        {(list) => {
          const q = list.find((l) => l.state === "qualified");
          return q ? <FocusCard title={q.nextAction} detail={`${q.client} is qualified and ready to move.`} cta="Open lead" onPress={() => router.push(`/partner/leads/${q.id}`)} /> : null;
        }}
      </QueryView>

      <Section title="Opportunities">
        <QueryView query={ops} empty={{ title: "Nothing new", body: "Signals from your clients and the market show up here." }}>
          {(list) =>
            list.slice(0, 3).map((o) => (
              <Pressable key={o.id} onPress={() => router.push(`/partner/clients/${o.clientKey}`)}>
                <ActivityRow icon={Sparkles} title={o.title} detail={`${o.reason} · ${o.action}`} tone="amber" />
              </Pressable>
            ))
          }
        </QueryView>
      </Section>

      <Section title="Cases in flight">
        <QueryView query={cases} empty={{ title: "No cases yet", body: "Move a qualified lead to processing to open one." }}>
          {(list) => (
            <View style={{ gap: 10 }}>
              {list.slice(0, 3).map((k) => (
                <Card key={k.id} onPress={() => router.push(`/partner/cases/${k.id}`)} style={{ gap: 4 }}>
                  <Row style={{ justifyContent: "space-between" }}>
                    <Text variant="code">{k.id}</Text>
                    <StatusChip label={k.stageLabel} tone={k.stage === "completed" ? "success" : "pending"} />
                  </Row>
                  <Text variant="title">{k.client} · {k.subject}</Text>
                  {k.nextAction ? <Text variant="caption">Next · {k.nextAction}</Text> : null}
                </Card>
              ))}
            </View>
          )}
        </QueryView>
      </Section>

      <QueryView query={leads}>
        {(list) => (
          <Section title="Pipeline">
            {LEAD.states.map((st) => {
              const n = list.filter((l) => l.state === st).length;
              return <StatusRow key={st} title={LEAD.label[st]} status={`${n} lead${n === 1 ? "" : "s"}`} tone={LEAD.tone(st)} progress={list.length ? (n / list.length) * 100 : 0} />;
            })}
          </Section>
        )}
      </QueryView>

      <Section title="Earnings">
        <QueryView query={commission}>
          {(list) => {
            const sum = (st: string) => list.filter((e) => e.state === st).reduce((s, e) => s + e.amount, 0);
            return (
              <Row gap={12}>
                <EarningsCard label="Available" amount={sum("available")} />
                <EarningsCard label="Pending" amount={sum("pending")} sub={`Paid ${formatCompact(sum("paid"))}`} />
              </Row>
            );
          }}
        </QueryView>
      </Section>

      <Section title="Performance">
        <QueryView query={perf}>
          {(p) => (
            <>
              <Row gap={12}>
                <Card style={{ flex: 1, gap: 4 }}>
                  <Text variant="label">Conversion</Text>
                  <Text variant="h1">{p.conversionRate}%</Text>
                  <Text variant="xs">of closed leads</Text>
                </Card>
                <EarningsCard label="Avg ticket" amount={p.avgTicket} sub={`${p.leads} leads · ${formatCompact(p.openPipeline)} open`} />
              </Row>
              {p.tips.map((t) => <Text key={t} variant="xs">• {t}</Text>)}
            </>
          )}
        </QueryView>
      </Section>

      <Pressable onPress={() => router.push("/partner/resources")}>
        <ActivityRow icon={BookOpen} title="Training & marketing kit" detail="Short courses and material to share" tone="blue" />
      </Pressable>
    </Screen>
  );
}
