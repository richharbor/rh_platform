import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useLocalSearchParams, useRouter } from "expo-router";
import { Check, Minus, Plus } from "lucide-react-native";
import { useRef, useState } from "react";
import { Pressable, View } from "react-native";
import { api, newIdempotencyKey } from "@/api/client";
import { useCompany, useKycLive, useQuote } from "@/api/hooks";
import { track } from "@/analytics";
import { KYC } from "@/domain/states";
import { radius, useTheme } from "@/design";
import { formatINR } from "@/lib/format";
import { PageHeader } from "@/features/PageHeader";
import { AmountText, Button, Card, DisclosureBlock, Display, IndicativeBadge, QueryView, Row, Screen, StatusChip, Stepper, StickyCTA, Text, TrustBanner } from "@/ui";

const STEPS = ["Quantity", "Review", "Consent", "KYC", "Pay"];
const KYC_NEEDED = ["pan", "address", "bank"];
const CONSENTS = [
  "I understand unlisted shares may be hard to sell and prices are indicative",
  "I've read the transfer restrictions, including ROFR and approvals",
  "I understand returns are not guaranteed",
];

/** Select → Quantity → Review → KYC → Pay → Transfer → Portfolio (report #92). */
export default function Buy() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const qc = useQueryClient();
  const { colors } = useTheme();
  const company = useCompany(id);
  const kyc = useKycLive();
  const [step, setStep] = useState(0);
  const [lots, setLots] = useState(1);
  const [consents, setConsents] = useState<boolean[]>([]);
  const [method, setMethod] = useState<string>();
  const idem = useRef(newIdempotencyKey());
  const minLot = company.data?.minLot ?? 1;
  const quantity = lots * minLot;
  const quote = useQuote(id, company.data ? quantity : 0);
  const missing = (kyc.data ?? []).filter((k) => KYC_NEEDED.includes(k.id) && k.state !== "verified");

  const consent = useMutation({
    mutationFn: () => api("consent.record", { subject: `${company.data!.name} · private-market buy`, items: CONSENTS }),
    onSuccess: () => setStep(3),
  });
  const pay = useMutation({
    mutationFn: () => api("orders.create", { kind: "pm_buy", subjectId: id, quantity, pay: true }, { idempotencyKey: idem.current }),
    onSuccess: (o) => {
      track("payment_started", { id, order: o.id, quantity });
      qc.invalidateQueries({ queryKey: ["orders"] });
      router.replace(`/order/${o.id}`);
    },
  });

  const q = quote.data;
  const cta = [
    <Button key="q" label={`Review ${quantity} shares`} block onPress={() => setStep(1)} />,
    <Button key="r" label="Looks right" block disabled={!q} onPress={() => setStep(2)} />,
    <Button key="c" label="I agree" block disabled={consents.filter(Boolean).length < CONSENTS.length} loading={consent.isPending} onPress={() => consent.mutate()} />,
    missing.length ? (
      <Button key="k" label={`Complete ${missing[0].label}`} block onPress={() => router.push(missing[0].id === "bank" ? "/bank" : "/kyc")} />
    ) : (
      <Button key="k" label="Continue" block onPress={() => setStep(4)} />
    ),
    <Button key="p" label={q ? `Pay ${formatINR(q.total)}` : "Pay"} block disabled={!method || !q} loading={pay.isPending} onPress={() => pay.mutate()} />,
  ][step];

  return (
    <Screen
      header={<PageHeader close label={company.data?.name} onBack={step ? () => setStep(step - 1) : undefined} />}
      footer={
        <StickyCTA>
          {pay.isError ? <Text variant="xs" style={{ color: colors.red, textAlign: "center", marginBottom: 8 }}>{pay.error.message}</Text> : null}
          {cta}
        </StickyCTA>
      }
    >
      <Stepper steps={STEPS} current={step} />
      <QueryView query={company}>
        {(c) => (
          <>
            {step === 0 ? (
              <>
                <Display size={40}>How many shares?</Display>
                <Text variant="muted">{c.name} trades in lots of {c.minLot}.</Text>
                <Row style={{ justifyContent: "center" }} gap={24}>
                  <Pressable accessibilityLabel="Fewer" disabled={lots <= 1} onPress={() => setLots(lots - 1)} style={{ width: 52, height: 52, borderRadius: 26, borderWidth: 1, borderColor: colors.line, alignItems: "center", justifyContent: "center", opacity: lots <= 1 ? 0.4 : 1 }}>
                    <Minus size={20} color={colors.foreground} />
                  </Pressable>
                  <View style={{ alignItems: "center" }}>
                    <AmountText size={56}>{quantity}</AmountText>
                    <Text variant="code">{lots} LOT{lots > 1 ? "S" : ""}</Text>
                  </View>
                  <Pressable accessibilityLabel="More" onPress={() => setLots(lots + 1)} style={{ width: 52, height: 52, borderRadius: 26, borderWidth: 1, borderColor: colors.line, alignItems: "center", justifyContent: "center" }}>
                    <Plus size={20} color={colors.foreground} />
                  </Pressable>
                </Row>
                {q ? (
                  <Card style={{ gap: 4 }}>
                    <Row style={{ justifyContent: "space-between" }}>
                      <Text variant="label">Estimated total</Text>
                      <IndicativeBadge />
                    </Row>
                    <AmountText size={30}>{formatINR(q.total)}</AmountText>
                    <Text variant="xs">{formatINR(q.unitPrice)} per share · incl. fees</Text>
                  </Card>
                ) : null}
              </>
            ) : null}

            {step === 1 && q ? (
              <>
                <Display size={40}>Check the details.</Display>
                <Card style={{ padding: 0 }}>
                  {[
                    ["Price per share", formatINR(q.unitPrice)],
                    ["Quantity", `${q.quantity} shares`],
                    ["Consideration", formatINR(q.consideration)],
                    ["Platform fee · 0.5%", formatINR(q.platformFee)],
                    ["Stamp duty · 0.015%", formatINR(q.stampDuty)],
                    ["Total", formatINR(q.total)],
                  ].map(([k, v], i, a) => (
                    <Row key={k} style={{ justifyContent: "space-between", padding: 16, borderTopWidth: i ? 1 : 0, borderTopColor: colors.lineSoft }}>
                      <Text variant={i === a.length - 1 ? "title" : "caption"}>{k}</Text>
                      <Text variant="title">{v}</Text>
                    </Row>
                  ))}
                </Card>
                <Text variant="xs">Expected timeline: {q.settlement}. Shares arrive in your demat and show up in Portfolio.</Text>
                <DisclosureBlock items={[...c.risks.slice(0, 2), ...c.transferRestrictions]} />
              </>
            ) : null}

            {step === 2 ? (
              <>
                <Display size={40}>Your consent.</Display>
                {CONSENTS.map((txt, i) => {
                  const on = !!consents[i];
                  return (
                    <Pressable key={txt} accessibilityRole="checkbox" accessibilityState={{ checked: on }} onPress={() => { const n = CONSENTS.map((_, j) => !!consents[j]); n[i] = !on; setConsents(n); }} style={{ flexDirection: "row", gap: 12, padding: 16, borderRadius: radius["2xl"], borderWidth: 1, borderColor: on ? colors.foreground : colors.lineSoft }}>
                      <View style={{ width: 22, height: 22, borderRadius: 6, borderWidth: 1.5, borderColor: on ? colors.inverse : colors.line, backgroundColor: on ? colors.inverse : "transparent", alignItems: "center", justifyContent: "center" }}>{on ? <Check size={14} color={colors.onInverse} /> : null}</View>
                      <Text variant="body" style={{ flex: 1 }}>{txt}</Text>
                    </Pressable>
                  );
                })}
              </>
            ) : null}

            {step === 3 ? (
              <>
                <Display size={40}>{missing.length ? "A few checks first." : "You're verified."}</Display>
                <Text variant="muted">Share transfers need your PAN, address and a verified bank account for the demat and payout.</Text>
                <Card style={{ padding: 0 }}>
                  {(kyc.data ?? []).filter((k) => KYC_NEEDED.includes(k.id)).map((k, i) => (
                    <Row key={k.id} style={{ justifyContent: "space-between", padding: 16, borderTopWidth: i ? 1 : 0, borderTopColor: colors.lineSoft }}>
                      <Text variant="title">{k.label}</Text>
                      <StatusChip label={KYC.label[k.state]} tone={KYC.tone(k.state)} />
                    </Row>
                  ))}
                </Card>
              </>
            ) : null}

            {step === 4 && q ? (
              <>
                <View>
                  <Text variant="label">Amount</Text>
                  <AmountText size={48}>{formatINR(q.total)}</AmountText>
                </View>
                {["UPI", "Net banking"].map((m) => (
                  <Pressable key={m} accessibilityRole="radio" accessibilityState={{ selected: method === m }} onPress={() => setMethod(m)} style={{ padding: 16, borderRadius: radius["2xl"], borderWidth: method === m ? 2 : 1, borderColor: method === m ? colors.foreground : colors.lineSoft }}>
                    <Text variant="title">{m}</Text>
                  </Pressable>
                ))}
                <TrustBanner>Your money is held until the seller's shares are transferred. If the transfer fails, it's refunded in full.</TrustBanner>
              </>
            ) : null}
          </>
        )}
      </QueryView>
    </Screen>
  );
}

