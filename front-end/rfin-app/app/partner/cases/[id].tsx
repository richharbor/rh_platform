import { useLocalSearchParams, useRouter } from "expo-router";
import { useCase } from "@/api/hooks";
import { PARTNER_CONFIG as P } from "@rfin/shared";
import { formatINR } from "@/lib/format";
import { dayMonth } from "@rfin/shared/greeting";
import { PageHeader } from "@/features/PageHeader";
import { AmountText, Card, Display, QueryView, Row, Screen, Section, StatusChip, Stepper, SupportPanel, Text, Timeline } from "@/ui";

/** Case 360 — reference, stage, owner, next action, SLA, timeline (report #86). */
export default function Case360() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const kase = useCase(id);
  return (
    <Screen header={<PageHeader label={id} />}>
      <QueryView query={kase}>
        {(k) => {
          const idx = P.caseStages.findIndex((s) => s.id === k.stage);
          const done = k.stage === "completed";
          return (
            <>
              <StatusChip label={k.stageLabel} tone={done ? "success" : "pending"} />
              <Display size={40}>{k.client}</Display>
              <Text variant="muted">{k.subject}</Text>
              <Stepper steps={P.caseStages.map((s) => s.label)} current={Math.max(0, idx)} />
              <Row gap={12}>
                <Card style={{ flex: 1, gap: 2 }}>
                  <Text variant="label">Value</Text>
                  <AmountText size={22}>{formatINR(k.value)}</AmountText>
                </Card>
                <Card style={{ flex: 1, gap: 2 }}>
                  <Text variant="label">SLA</Text>
                  <Text variant="title">{done ? "Met" : k.slaDue ? `By ${dayMonth(k.slaDue)}` : "—"}</Text>
                </Card>
              </Row>
              <Card style={{ gap: 4 }}>
                <Text variant="label">Owner · next</Text>
                <Text variant="title">{k.owner}</Text>
                <Text variant="caption">{k.nextAction ?? "Nothing pending — case closed."}</Text>
              </Card>
              <Section title="Timeline">
                <Timeline steps={[...k.timeline, ...(done ? [] : [{ at: "", label: P.caseStages[idx + 1]?.label ?? "Completion", done: false, actor: "provider" as const }])]} />
              </Section>
              <SupportPanel body={`Stuck on ${k.id}? RFIN ops can see the whole case.`} onPress={() => router.push({ pathname: "/support", params: { contextType: "general", contextId: k.id, subject: `Case ${k.id}` } })} />
            </>
          );
        }}
      </QueryView>
    </Screen>
  );
}
