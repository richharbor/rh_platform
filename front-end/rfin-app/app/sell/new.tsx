import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useState } from "react";
import { KeyboardAvoidingView, Platform, View } from "react-native";
import { api } from "@/api/client";
import { useCompany, usePortfolio, usePriceDiscovery } from "@/api/hooks";
import { useTheme } from "@/design";
import { formatINR } from "@/lib/format";
import { PageHeader } from "@/features/PageHeader";
import { AmountText, Button, Card, DisclosureBlock, Display, FormField, IndicativeBadge, PRICE_KIND_LABEL, QueryView, Row, Screen, Stepper, StickyCTA, Text, TrustBanner } from "@/ui";

const STEPS = ["Verify holding", "Price discovery", "List"];

/** Verify Holding → Discover → List (report #93); matching onwards is tracked on /sell/[id]. */
export default function NewListing() {
  const { company: id } = useLocalSearchParams<{ company: string }>();
  const router = useRouter();
  const qc = useQueryClient();
  const { colors } = useTheme();
  const company = useCompany(id);
  const portfolio = usePortfolio();
  const discovery = usePriceDiscovery(id);
  const [step, setStep] = useState(0);
  const holding = portfolio.data?.holdings.find((h) => h.companyId === id);
  const free = holding ? holding.quantity - holding.reserved : 0;
  const [qty, setQty] = useState("");
  const [ask, setAsk] = useState("");
  const qtyN = Number(qty);
  const askPaise = Math.round(Number(ask) * 100);

  const create = useMutation({
    mutationFn: () => api("listings.create", { companyId: id, quantity: qtyN, ask: askPaise }),
    onSuccess: (l) => {
      qc.invalidateQueries({ queryKey: ["listings"] });
      qc.invalidateQueries({ queryKey: ["portfolio"] });
      router.replace(`/sell/${l.id}`);
    },
  });

  const cta = [
    <Button key="v" label="Continue" block disabled={!free} onPress={() => setStep(1)} />,
    <Button key="d" label="Set my price" block onPress={() => setStep(2)} />,
    <Button key="l" label="List shares" block disabled={!(qtyN > 0 && qtyN <= free && askPaise > 0)} loading={create.isPending} onPress={() => create.mutate()} />,
  ][step];

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === "ios" ? "padding" : undefined}>
      <Screen header={<PageHeader close label={company.data?.name} onBack={step ? () => setStep(step - 1) : undefined} />} footer={<StickyCTA>{cta}</StickyCTA>}>
        <Stepper steps={STEPS} current={step} />
        {step === 0 ? (
          <>
            <Display size={40}>Your holding.</Display>
            <QueryView query={portfolio}>
              {() =>
                holding ? (
                  <Card style={{ gap: 6 }}>
                    <Text variant="label">{holding.name} · verified in your demat</Text>
                    <AmountText size={36}>{holding.quantity} shares</AmountText>
                    <Text variant="caption">{holding.reserved ? `${holding.reserved} already listed · ` : ""}{free} available to sell · avg cost {formatINR(holding.avgCost)}</Text>
                  </Card>
                ) : (
                  <Text variant="muted">You don't hold this company on RFIN.</Text>
                )
              }
            </QueryView>
          </>
        ) : null}

        {step === 1 ? (
          <>
            <Display size={40}>What it's worth.</Display>
            <QueryView query={discovery}>
              {(d) => (
                <>
                  {d.prices.map((p) => (
                    <Card key={p.kind} style={{ gap: 2 }}>
                      <Row style={{ justifyContent: "space-between" }}>
                        <Text variant="label">{PRICE_KIND_LABEL[p.kind]}</Text>
                        <Text variant="xs">{p.asOf}</Text>
                      </Row>
                      <AmountText size={26}>{formatINR(p.perShare)}</AmountText>
                    </Card>
                  ))}
                  {d.bidAsk ? <Text variant="title">Indicative bid {formatINR(d.bidAsk.bid)} · ask {formatINR(d.bidAsk.ask)}</Text> : null}
                  <Text variant="title">{d.buyerInterest} buyers are watching this company</Text>
                  <Text variant="xs">{d.note}</Text>
                  <DisclosureBlock title="Transfer restrictions" items={d.transferRestrictions} />
                </>
              )}
            </QueryView>
          </>
        ) : null}

        {step === 2 ? (
          <View style={{ gap: 16 }}>
            <Display size={40}>List your shares.</Display>
            <FormField label={`Shares to sell · up to ${free}`} value={qty} onChangeText={(t) => setQty(t.replace(/\D/g, ""))} keyboardType="number-pad" placeholder={String(free)} error={qtyN > free ? `You can list up to ${free}` : undefined} />
            <FormField label="Asking price per share · ₹" value={ask} onChangeText={(t) => setAsk(t.replace(/[^\d.]/g, ""))} keyboardType="decimal-pad" placeholder={discovery.data?.bidAsk ? String(discovery.data.bidAsk.ask / 100) : "1,750"} why="Buyers see this. Pricing near the indicative ask sells faster." error={create.error?.message} />
            {qtyN > 0 && askPaise > 0 ? (
              <Card style={{ gap: 2 }}>
                <Row style={{ justifyContent: "space-between" }}>
                  <Text variant="label">You'd receive</Text>
                  <IndicativeBadge label="Before approvals" />
                </Row>
                <AmountText size={30}>{formatINR(qtyN * askPaise)}</AmountText>
              </Card>
            ) : null}
            <TrustBanner>Shares stay in your demat until a buyer is matched and the company approves the transfer. You can cancel until then.</TrustBanner>
          </View>
        ) : null}
        {create.isError && step !== 2 ? <Text variant="xs" style={{ color: colors.red }}>{create.error.message}</Text> : null}
      </Screen>
    </KeyboardAvoidingView>
  );
}
