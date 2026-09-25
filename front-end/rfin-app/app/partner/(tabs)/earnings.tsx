import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useEffect } from "react";
import { api } from "@/api/client";
import { useCommission, usePayouts, usePointsLedger } from "@/api/hooks";
import { PARTNER_CONFIG as P } from "@rfin/shared";
import { PAYOUT } from "@/domain/states";
import { useTheme } from "@/design";
import { formatINR } from "@/lib/format";
import { ago } from "@/features/notify";
import { AmountText, Button, Card, DisclosureBlock, QueryView, Row, Screen, Section, StatusChip, Text, useToast } from "@/ui";

/** Money Centre — three ledgers, never summed; payouts with TDS (report #53, #88, #89). */
export default function Earnings() {
  const qc = useQueryClient();
  const toast = useToast();
  const { colors } = useTheme();
  const commission = useCommission();
  const payouts = usePayouts();
  const points = usePointsLedger();

  // A payout turning paid settles its commissions — refresh them right away.
  const paidCount = (payouts.data ?? []).filter((p) => p.state === "paid").length;
  useEffect(() => {
    if (paidCount) qc.invalidateQueries({ queryKey: ["commission"] });
  }, [paidCount, qc]);
  const available = (commission.data ?? []).filter((c) => c.state === "available").reduce((s, c) => s + c.amount, 0);
  const request = useMutation({
    mutationFn: () => api("payouts.request", undefined),
    onSuccess: (p) => {
      toast(`${formatINR(p.net)} payout requested`, "success");
      qc.invalidateQueries({ queryKey: ["commission"] });
      qc.invalidateQueries({ queryKey: ["payouts"] });
    },
    onError: (e: Error) => toast(e.message, "danger"),
  });

  return (
    <Screen eyebrow="Money centre" title="Three ledgers. Never mixed." subtitle="Commission is money. Points and promotional benefits are tracked separately.">
      <Card style={{ gap: 6 }}>
        <Text variant="label">Available to pay out</Text>
        <AmountText size={40}>{formatINR(available)}</AmountText>
        <Text variant="caption">After {P.tdsPct}% TDS: {formatINR(Math.round(available * (1 - P.tdsPct / 100)))}</Text>
        <Button label="Request payout" disabled={available < P.payoutThreshold} loading={request.isPending} event="payout_generated" onPress={() => request.mutate()} />
        {available < P.payoutThreshold ? <Text variant="xs">Minimum payout {formatINR(P.payoutThreshold)}.</Text> : null}
      </Card>

      <Section title="Business commission">
        <QueryView query={commission} empty={{ title: "No commission yet", body: "Earnings appear when a case completes." }}>
          {(list) =>
            list.map((e) => (
              <Row key={e.id} style={{ justifyContent: "space-between", paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: colors.lineSoft }} gap={12}>
                <Text variant="title" style={{ flex: 1 }}>{e.description}</Text>
                <View2 amount={formatINR(e.amount)} label={PAYOUT.label[e.state]} tone={PAYOUT.tone(e.state)} />
              </Row>
            ))
          }
        </QueryView>
      </Section>

      <Section title="Payouts">
        <QueryView query={payouts} empty={{ title: "No payouts yet" }}>
          {(list) =>
            list.map((p) => (
              <Card key={p.id} style={{ gap: 4 }}>
                <Row style={{ justifyContent: "space-between" }}>
                  <Text variant="code">{p.id}</Text>
                  <StatusChip label={p.state === "paid" ? "Paid" : "Processing"} tone={p.state === "paid" ? "success" : "pending"} />
                </Row>
                <AmountText size={24}>{formatINR(p.net)}</AmountText>
                <Text variant="xs">Gross {formatINR(p.gross)} · TDS {formatINR(p.tds)} · {p.bank} · {ago(p.at)}</Text>
              </Card>
            ))
          }
        </QueryView>
      </Section>

      <Section title="RFIN Points">
        <QueryView query={points}>{(list) => <Text variant="title">{list.reduce((s, e) => s + e.points, 0).toLocaleString("en-IN")} pts · not cash</Text>}</QueryView>
      </Section>
      <DisclosureBlock title="Payout terms" items={["Commission becomes available after the provider confirms the case", `${P.tdsPct}% TDS is deducted as applicable before payout`, "Reversed cases reverse their commission"]} />
    </Screen>
  );
}

function View2({ amount, label, tone }: { amount: string; label: string; tone: Parameters<typeof StatusChip>[0]["tone"] }) {
  return (
    <Row gap={8}>
      <Text variant="title">{amount}</Text>
      <StatusChip label={label} tone={tone} />
    </Row>
  );
}
