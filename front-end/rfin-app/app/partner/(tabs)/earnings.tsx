import { useCommission, usePointsLedger } from "@/api/hooks";
import { PAYOUT } from "@/domain/states";
import { formatINR } from "@/lib/format";
import { AmountText, Card, DisclosureBlock, QueryView, Row, Screen, Section, StatusChip, Text } from "@/ui";

/**
 * Money Centre — three ledgers, never summed (report #53, #88):
 * business commission, RFIN Points, promotional benefits.
 */
export default function Earnings() {
  const commission = useCommission();
  const points = usePointsLedger();
  return (
    <Screen eyebrow="Money centre" title="Three ledgers. Never mixed." subtitle="Commission is money. Points and promotional benefits are tracked separately.">
      <Section title="Business commission">
        <QueryView query={commission} empty={{ title: "No commission yet", body: "Earnings appear when a case converts." }}>
          {(list) =>
            list.map((e) => (
              <Card key={e.id} style={{ gap: 6 }}>
                <Row style={{ justifyContent: "space-between" }}>
                  <Text variant="code">{e.caseId ?? e.id}</Text>
                  <StatusChip label={PAYOUT.label[e.state]} tone={PAYOUT.tone(e.state)} />
                </Row>
                <Text variant="title">{e.description}</Text>
                <AmountText size={26}>{formatINR(e.amount)}</AmountText>
              </Card>
            ))
          }
        </QueryView>
      </Section>
      <Section title="RFIN Points">
        <QueryView query={points}>
          {(list) => (
            <Card>
              <AmountText size={30}>{list.reduce((s, e) => s + e.points, 0).toLocaleString("en-IN")} pts</AmountText>
              <Text variant="caption">Not cash. Can't be withdrawn.</Text>
            </Card>
          )}
        </QueryView>
      </Section>
      <Section title="Promotional benefits">
        <Card>
          <Text variant="muted">No active campaign benefits. Partner campaigns will show up here.</Text>
        </Card>
      </Section>
      <DisclosureBlock title="Payout terms" items={["Commission becomes available after the provider confirms the case", "TDS is deducted as applicable before payout", "Reversed cases reverse their commission"]} />
    </Screen>
  );
}
