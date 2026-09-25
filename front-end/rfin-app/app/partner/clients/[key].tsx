import { useLocalSearchParams, useRouter } from "expo-router";
import { useClient } from "@/api/hooks";
import { LEAD } from "@/domain/states";
import { formatCompact } from "@/lib/format";
import { needLabel } from "@/features/needs";
import { PageHeader } from "@/features/PageHeader";
import { AmountText, Card, Display, FocusCard, LeadCard, QueryView, Row, Screen, Section, StatusChip, Text } from "@/ui";

/** Client 360 — profile, segment, needs, opportunities, cases, notes, next action (report #85). */
export default function Client360() {
  const { key } = useLocalSearchParams<{ key: string }>();
  const router = useRouter();
  const client = useClient(key);
  return (
    <Screen header={<PageHeader label="Client 360" />}>
      <QueryView query={client}>
        {(c) => (
          <>
            <Display size={44}>{c.name}</Display>
            <Text variant="muted">{[c.segment, c.city, c.phone ? `+91 ${c.phone}` : null].filter(Boolean).join(" · ")}</Text>
            <Row gap={12}>
              <Card style={{ flex: 1, gap: 2 }}>
                <Text variant="label">Open value</Text>
                <AmountText size={24}>{formatCompact(c.openValue)}</AmountText>
              </Card>
              <Card style={{ flex: 1, gap: 2 }}>
                <Text variant="label">Needs</Text>
                <Text variant="title">{c.needs.map(needLabel).join(", ")}</Text>
              </Card>
            </Row>
            <FocusCard title={c.nextAction} detail="Next best action for this client." cta="Open latest lead" onPress={() => router.push(`/partner/leads/${c.leads[c.leads.length - 1].id}`)} />
            <Section title="Leads">
              {c.leads.map((l) => (
                <LeadCard key={l.id} lead={l} onPress={() => router.push(`/partner/leads/${l.id}`)} />
              ))}
            </Section>
            {c.cases?.length ? (
              <Section title="Cases">
                {c.cases.map((k) => (
                  <Card key={k.id} onPress={() => router.push(`/partner/cases/${k.id}`)} style={{ gap: 4 }}>
                    <Row style={{ justifyContent: "space-between" }}>
                      <Text variant="code">{k.id}</Text>
                      <StatusChip label={k.stageLabel} tone={k.stage === "completed" ? "success" : "pending"} />
                    </Row>
                    <Text variant="title">{k.subject}</Text>
                  </Card>
                ))}
              </Section>
            ) : null}
            <Text variant="xs">Leads: {c.leads.map((l) => LEAD.label[l.state]).join(" · ")}</Text>
          </>
        )}
      </QueryView>
    </Screen>
  );
}
