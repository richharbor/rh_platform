import { useRouter } from "expo-router";
import { Plus } from "lucide-react-native";
import { useCommission, useLeads } from "@/api/hooks";
import { LEAD } from "@/domain/states";
import { useTheme } from "@/design";
import { dateline } from "@/features/greeting";
import { formatCompact } from "@/lib/format";
import { useSession } from "@/stores/session";
import { EarningsCard, FocusCard, HeroCard, LeadCard, QueryView, Rise, Row, Screen, Section, StatusRow } from "@/ui";

/** Partner Home — leads needing action, cases in flight, earnings, next best action (report #82). */
export default function PartnerHome() {
  const router = useRouter();
  const { colors } = useTheme();
  const name = useSession((s) => s.profile.name.split(" ")[0]);
  const leads = useLeads();
  const commission = useCommission();

  return (
    <Screen eyebrow={dateline()} title={name ? `${name}, who needs you today?` : "Who needs you today?"} subtitle="Leads, cases and earnings — with the next move on each.">
      <Rise delay={1}>
        <HeroCard label="Add a lead" title="60 seconds, start to submit" detail="Client → need → product → documents. We handle the rest." cta="Add lead" icon={<Plus size={28} color={colors.amber} />} onPress={() => router.push("/partner/leads")} />
      </Rise>

      <QueryView query={leads}>
        {(list) => {
          const qualified = list.find((l) => l.state === "qualified");
          const active = list.filter((l) => !LEAD.isTerminal(l.state));
          const potential = active.reduce((s, l) => s + l.potential, 0);
          return (
            <>
              {qualified ? (
                <Rise delay={2}>
                  <FocusCard title={qualified.nextAction} detail={`${qualified.client} is qualified and ready to move.`} cta="Open lead" onPress={() => router.push("/partner/leads")} />
                </Rise>
              ) : null}
              <Section title="Pipeline">
                {(["new", "contacted", "qualified", "processing", "converted"] as const).map((st) => {
                  const n = list.filter((l) => l.state === st).length;
                  return <StatusRow key={st} title={LEAD.label[st]} status={`${n} lead${n === 1 ? "" : "s"}`} tone={LEAD.tone(st)} progress={(n / list.length) * 100} />;
                })}
              </Section>
              <Section title="Active leads">
                {active.slice(0, 2).map((l) => (
                  <LeadCard key={l.id} lead={l} />
                ))}
              </Section>
              <Section title="Potential">
                <EarningsCard label="Open pipeline value" amount={potential} sub={`${active.length} active leads`} />
              </Section>
            </>
          );
        }}
      </QueryView>

      <Section title="Earnings">
        <QueryView query={commission}>
          {(list) => {
            const sum = (st: string) => list.filter((e) => e.state === st).reduce((s, e) => s + e.amount, 0);
            return (
              <Row gap={12}>
                <EarningsCard label="Available" amount={sum("available")} />
                <EarningsCard label="Pending" amount={sum("pending")} sub={`Paid so far ${formatCompact(sum("paid"))}`} />
              </Row>
            );
          }}
        </QueryView>
      </Section>
    </Screen>
  );
}
