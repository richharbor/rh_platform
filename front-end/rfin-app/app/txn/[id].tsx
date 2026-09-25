import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useFocusEffect, useLocalSearchParams, useRouter } from "expo-router";
import { Check, CreditCard, Landmark, Smartphone, type LucideIcon } from "lucide-react-native";
import { useCallback, useEffect, useRef } from "react";
import { Pressable, View } from "react-native";
import { api, newIdempotencyKey } from "@/api/client";
import { useKycLive, useProduct } from "@/api/hooks";
import { track } from "@/analytics";
import { KYC } from "@/domain/states";
import { fonts, radius, useTheme } from "@/design";
import { defaultAmount, flowFor, STEP_LABEL } from "@/features/flows";
import { PageHeader } from "@/features/PageHeader";
import { formatINR } from "@/lib/format";
import { useDrafts } from "@/stores/drafts";
import {
  AmountText,
  Button,
  Card,
  DisclosureBlock,
  Display,
  QueryView,
  Row,
  Screen,
  StatusChip,
  Stepper,
  StickyCTA,
  Text,
  TrustBanner,
} from "@/ui";

const PAY_METHODS: { id: string; label: string; detail: string; icon: LucideIcon }[] = [
  { id: "upi", label: "UPI", detail: "Any UPI app", icon: Smartphone },
  { id: "netbanking", label: "Net banking", detail: "All major banks", icon: Landmark },
  { id: "card", label: "Debit card", detail: "Visa, Mastercard, RuPay", icon: CreditCard },
];

/** The unified transaction engine (report #31–#40), one screen, config-driven steps. */
export default function Transaction() {
  const { id, amount: amountParam } = useLocalSearchParams<{ id: string; amount?: string }>();
  const router = useRouter();
  const qc = useQueryClient();
  const { colors } = useTheme();
  const product = useProduct(id);
  const kyc = useKycLive();
  const draft = useDrafts((s) => s.drafts[id]);
  const save = useDrafts((s) => s.save);
  const clear = useDrafts((s) => s.clear);
  // Stable for this attempt, so a double-tap or retry can't create a second order (report #37).
  const idem = useRef(newIdempotencyKey());

  const p = product.data;
  const flow = p ? flowFor(p) : null;
  const step = Math.min(draft?.step ?? 0, (flow?.steps.length ?? 1) - 1);
  const amount = Number(amountParam) || draft?.amount || (p ? defaultAmount(p) : 0);
  const consents = draft?.consents ?? [];

  // Coming back from KYC / bank screens: refresh what's still missing.
  const refetchKyc = kyc.refetch;
  useFocusEffect(
    useCallback(() => {
      refetchKyc();
    }, [refetchKyc]),
  );

  useEffect(() => {
    if (p && !draft) save(id, { step: 0, amount });
  }, [p, draft, id, amount, save]);

  const consent = useMutation({
    mutationFn: () => api("consent.record", { subject: `${p!.name} · ${p!.provider}`, items: flow!.consents }),
    onSuccess: () => save(id, { step: step + 1 }),
  });

  const submit = useMutation({
    mutationFn: () => api("orders.create", { kind: flow!.kind, subjectId: id, amount, pay: flow!.steps.includes("pay") }, { idempotencyKey: idem.current }),
    onSuccess: (order) => {
      track(flow!.steps.includes("pay") ? "payment_started" : "order_submitted", { id, order: order.id, method: draft?.payMethod });
      qc.invalidateQueries({ queryKey: ["orders"] });
      clear(id);
      router.replace(`/order/${order.id}`);
    },
  });

  if (!p || !flow) {
    return (
      <Screen>
        <PageHeader close />
        <QueryView query={product}>{() => null}</QueryView>
      </Screen>
    );
  }

  const current = flow.steps[step];
  const missing = (kyc.data ?? []).filter((k) => flow.kycRequired.includes(k.id) && k.state !== "verified");
  const next = () => save(id, { step: step + 1 });

  const cta = (() => {
    switch (current) {
      case "review":
        return <Button label="Looks right" block onPress={next} />;
      case "consent":
        return <Button label="I agree" block disabled={consents.filter(Boolean).length < flow.consents.length} loading={consent.isPending} onPress={() => consent.mutate()} />;
      case "kyc":
        return missing.length ? (
          <Button label={`Complete ${missing[0].label}`} block event="kyc_started" onPress={() => router.push(missing[0].id === "bank" ? "/bank" : "/kyc")} />
        ) : (
          <Button label="Continue" block onPress={next} />
        );
      case "pay":
        return <Button label={`${flow.cta} · ${formatINR(amount)}`} block disabled={!draft?.payMethod} loading={submit.isPending} onPress={() => submit.mutate()} />;
      case "submit":
        return <Button label={flow.cta} block loading={submit.isPending} onPress={() => submit.mutate()} />;
    }
  })();

  return (
    <Screen
      footer={
        <StickyCTA note={draft && step > 0 ? "Progress saved — you can come back anytime." : undefined}>
          {submit.isError ? <Text variant="xs" style={{ color: colors.red, marginBottom: 8, textAlign: "center" }}>{submit.error.message}</Text> : null}
          {cta}
        </StickyCTA>
      }
    >
      <PageHeader close label={p.name} onBack={step > 0 ? () => save(id, { step: step - 1 }) : undefined} />
      <Stepper steps={flow.steps.map((s) => STEP_LABEL[s])} current={step} />

      {current === "review" ? (
        <>
          <Display size={40}>Check the details.</Display>
          <Card style={{ gap: 0, padding: 0 }}>
            {[
              ["Product", p.name],
              ["Provider", p.provider],
              [flow.steps.includes("pay") ? "You pay now" : "Amount requested", formatINR(amount)],
              ...p.costs.map((c) => [c.label, c.value]),
            ].map(([k, v], i) => (
              <Row key={k} style={{ justifyContent: "space-between", padding: 16, borderTopWidth: i ? 1 : 0, borderTopColor: colors.lineSoft }}>
                <Text variant="caption">{k}</Text>
                <Text variant="title" style={{ flexShrink: 1, textAlign: "right" }}>{v}</Text>
              </Row>
            ))}
          </Card>
          <DisclosureBlock items={p.risks} />
          <Text variant="label">What happens after you submit</Text>
          {p.whatNext.map((w, i) => (
            <Row key={w} gap={12}>
              <Text variant="code" style={{ width: 20 }}>{String(i + 1).padStart(2, "0")}</Text>
              <Text variant="body" style={{ flex: 1 }}>{w}</Text>
            </Row>
          ))}
        </>
      ) : null}

      {current === "consent" ? (
        <>
          <Display size={40}>Your consent.</Display>
          <Text variant="muted">Each one is recorded with a timestamp. You can see them anytime in Profile → Security & consent.</Text>
          {flow.consents.map((c, i) => {
            const on = !!consents[i];
            return (
              <Pressable
                key={c}
                accessibilityRole="checkbox"
                accessibilityState={{ checked: on }}
                onPress={() => {
                  const nextC = [...flow.consents.map((_, j) => !!consents[j])];
                  nextC[i] = !on;
                  save(id, { consents: nextC });
                }}
                style={{ flexDirection: "row", gap: 12, alignItems: "flex-start", padding: 16, borderRadius: radius["2xl"], borderWidth: 1, borderColor: on ? colors.foreground : colors.lineSoft }}
              >
                <View style={{ width: 22, height: 22, borderRadius: 6, borderWidth: 1.5, borderColor: on ? colors.inverse : colors.line, backgroundColor: on ? colors.inverse : "transparent", alignItems: "center", justifyContent: "center", marginTop: 1 }}>
                  {on ? <Check size={14} color={colors.onInverse} /> : null}
                </View>
                <Text variant="body" style={{ flex: 1 }}>{c}</Text>
              </Pressable>
            );
          })}
        </>
      ) : null}

      {current === "kyc" ? (
        <>
          <Display size={40}>{missing.length ? "A few checks first." : "You're verified."}</Display>
          <Text variant="muted">{p.provider} needs these before it can {flow.steps.includes("pay") ? "issue your policy" : "review your application"}. We only ask once — they're reused for everything else on RFIN.</Text>
          <QueryView query={kyc}>
            {(items) => (
              <Card style={{ gap: 0, padding: 0 }}>
                {items
                  .filter((k) => flow.kycRequired.includes(k.id))
                  .map((k, i) => (
                    <View key={k.id} style={{ padding: 16, gap: 4, borderTopWidth: i ? 1 : 0, borderTopColor: colors.lineSoft }}>
                      <Row style={{ justifyContent: "space-between" }}>
                        <Text variant="title">{k.label}</Text>
                        <StatusChip label={KYC.label[k.state]} tone={KYC.tone(k.state)} />
                      </Row>
                      <Text variant="xs">{k.rejectionReason ?? k.why}</Text>
                    </View>
                  ))}
              </Card>
            )}
          </QueryView>
          {missing.length ? null : <TrustBanner>Everything this product needs is verified.</TrustBanner>}
        </>
      ) : null}

      {current === "pay" ? (
        <>
          <View>
            <Text variant="label">Amount</Text>
            <AmountText size={48}>{formatINR(amount)}</AmountText>
          </View>
          <Text variant="label">Pay with</Text>
          {PAY_METHODS.map((m) => {
            const on = draft?.payMethod === m.id;
            return (
              <Pressable
                key={m.id}
                accessibilityRole="radio"
                accessibilityState={{ selected: on }}
                onPress={() => save(id, { payMethod: m.id })}
                style={{ flexDirection: "row", alignItems: "center", gap: 12, padding: 16, borderRadius: radius["2xl"], borderWidth: on ? 2 : 1, borderColor: on ? colors.foreground : colors.lineSoft }}
              >
                <m.icon size={18} color={colors.foreground} />
                <View style={{ flex: 1 }}>
                  <Text variant="title">{m.label}</Text>
                  <Text variant="xs">{m.detail}</Text>
                </View>
                <View style={{ width: 18, height: 18, borderRadius: 9, borderWidth: on ? 6 : 1.5, borderColor: on ? colors.foreground : colors.line }} />
              </Pressable>
            );
          })}
          <TrustBanner>You'll only be charged once. If a payment fails, no money leaves your account and you can retry.</TrustBanner>
        </>
      ) : null}

      {current === "submit" ? (
        <>
          <Display size={40}>Ready to send.</Display>
          <Text variant="muted">
            We'll send your application to {p.provider} for {formatINR(amount)}. There's nothing to pay now — any processing fee is deducted from the loan amount.
          </Text>
          <Card style={{ gap: 4 }}>
            <Text variant="label">You'll hear back</Text>
            <Text style={{ fontFamily: fonts.semibold, fontSize: 16, color: colors.foreground }}>Within 48 hours, with every step in Activity.</Text>
          </Card>
        </>
      ) : null}

    </Screen>
  );
}
