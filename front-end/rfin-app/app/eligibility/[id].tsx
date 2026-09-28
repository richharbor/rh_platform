import { useMutation } from "@tanstack/react-query";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useState } from "react";
import { KeyboardAvoidingView, Platform, View } from "react-native";
import { api } from "@/api/client";
import { useProduct } from "@/api/hooks";
import { useTheme } from "@/design";
import { PageHeader } from "@/features/PageHeader";
import { formatINR } from "@/lib/format";
import { AmountText, Button, Card, FormField, IndicativeBadge, Row, Screen, StatusChip, StickyCTA, Text } from "@/ui";

const digits = (s: string) => s.replace(/\D/g, "").slice(0, 9);
const grouped = (s: string) => (s ? Number(s).toLocaleString("en-IN") : "");

/** Dedicated eligibility step; the result is always labelled indicative until the provider confirms (report #27). */
export default function EligibilityCheck() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { colors } = useTheme();
  const product = useProduct(id);
  const isLoan = product.data?.category === "loans";
  const [income, setIncome] = useState("");
  const [amount, setAmount] = useState("");

  const check = useMutation({
    mutationFn: () => api("eligibility.check", { productId: id, monthlyIncome: Number(income), amount: amount ? Number(amount) * 100 : undefined }),
  });
  const r = check.data;
  const ready = Number(income) > 0 && (!isLoan || Number(amount) > 0);

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === "ios" ? "padding" : undefined}>
      <Screen
        header={<PageHeader label="Eligibility" />}
        eyebrow={product.data?.name ?? "Eligibility"}
        title="Are you eligible?"
        subtitle="Two numbers and we'll give you an indicative answer. Nothing is shared with a lender yet."
        footer={
          <StickyCTA>
            {r?.eligible ? (
              <Button label="Apply now" block event="application_started" eventProps={{ id }} onPress={() => router.push({ pathname: "/txn/[id]", params: { id, amount: amount ? String(Number(amount) * 100) : "" } })} />
            ) : (
              <Button label={r ? "Check again" : "Check eligibility"} block disabled={!ready} loading={check.isPending} onPress={() => check.mutate()} />
            )}
          </StickyCTA>
        }
      >
        <FormField label="Monthly take-home income · ₹" value={grouped(income)} onChangeText={(t) => { setIncome(digits(t)); check.reset(); }} keyboardType="number-pad" placeholder="75,000" why="Lenders and insurers size what they offer to your income." />
        {isLoan ? (
          <FormField label="How much do you need · ₹" value={grouped(amount)} onChangeText={(t) => { setAmount(digits(t)); check.reset(); }} keyboardType="number-pad" placeholder="5,00,000" why="You can change this before you apply." />
        ) : null}

        {check.isError ? <Text variant="xs" style={{ color: colors.red }}>{check.error.message}</Text> : null}

        {r ? (
          <Card style={{ gap: 12 }}>
            <Row style={{ justifyContent: "space-between" }}>
              <StatusChip label={r.eligible ? "Likely eligible" : "Not eligible yet"} tone={r.eligible ? "success" : "action"} />
              <IndicativeBadge label={r.kind === "confirmed" ? "Confirmed by provider" : "Indicative"} />
            </Row>
            {r.maxAmount ? (
              <View>
                <Text variant="label">Up to</Text>
                <AmountText size={40}>{formatINR(r.maxAmount)}</AmountText>
              </View>
            ) : null}
            {r.rate ? <Text variant="title">Indicative rate · {r.rate}</Text> : null}
            {r.reasons.map((x) => (
              <Text key={x} variant="muted">• {x}</Text>
            ))}
            <Text variant="xs">This is RFIN's estimate. The provider confirms eligibility after checking your documents.</Text>
          </Card>
        ) : null}
      </Screen>
    </KeyboardAvoidingView>
  );
}
