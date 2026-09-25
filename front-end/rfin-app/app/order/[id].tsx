import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useLocalSearchParams, useRouter } from "expo-router";
import { Check, Clock, RotateCcw } from "lucide-react-native";
import { useEffect, useRef } from "react";
import { View } from "react-native";
import { api } from "@/api/client";
import { useOrder } from "@/api/hooks";
import { track } from "@/analytics";
import { ORDER, PAYMENT } from "@/domain/states";
import { useTheme } from "@/design";
import { PageHeader } from "@/features/PageHeader";
import { formatINR } from "@/lib/format";
import { AmountText, Button, Card, Display, FocusCard, QueryView, Row, Screen, Section, StatusChip, StickyCTA, SupportPanel, Text, Timeline, TrustBanner, useToast } from "@/ui";

/**
 * After submit: never leave the user wondering (report #8, #38–#40).
 * Live timeline, one next action, confirmation + reference on completion.
 */
export default function OrderStatus() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const qc = useQueryClient();
  const toast = useToast();
  const { colors } = useTheme();
  const order = useOrder(id);
  const o = order.data;
  const announced = useRef<string | undefined>(undefined);

  useEffect(() => {
    if (!o || announced.current === o.state) return;
    announced.current = o.state;
    if (o.state === "fulfilled") {
      track("order_completed", { id: o.id });
      if (o.payment === "success") track("payment_completed", { id: o.id });
      track("eligible_transaction_completed", { id: o.id });
    }
  }, [o]);

  const retry = useMutation({
    mutationFn: () => api("orders.retryPayment", { id }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["order", id] });
      toast("Retrying payment", "info");
    },
  });

  const done = o?.state === "fulfilled";
  const failedPayment = o?.payment === "failed";

  return (
    <Screen
      footer={
        <StickyCTA>
          {failedPayment ? (
            <Button label="Retry payment" block variant="red" loading={retry.isPending} icon={<RotateCcw size={16} color={colors.onRed} />} onPress={() => retry.mutate()} />
          ) : (
            <Button label={done ? "Back to home" : "Track in Activity"} block onPress={() => router.replace(done ? "/home" : "/activity")} />
          )}
        </StickyCTA>
      }
    >
      <PageHeader close label={id} onBack={() => router.replace("/home")} />
      <QueryView query={order}>
        {(o) => (
          <>
            <View style={{ gap: 12 }}>
              <View style={{ width: 56, height: 56, borderRadius: 28, alignItems: "center", justifyContent: "center", backgroundColor: done ? colors.greenSoft : failedPayment ? colors.redSoft : colors.amberSoft }}>
                {done ? <Check size={26} color={colors.green} /> : failedPayment ? <RotateCcw size={24} color={colors.red} /> : <Clock size={24} color={colors.amber} />}
              </View>
              <StatusChip label={ORDER.label[o.state]} tone={ORDER.tone(o.state)} />
              <Display size={44}>{done ? "All done." : failedPayment ? "Payment didn't go through." : o.state === "submitted" ? "Sent. Hang tight." : "Working on it."}</Display>
              <Text variant="muted">
                {done
                  ? `${o.title} is confirmed. Your reference is ${o.id}.`
                  : failedPayment
                    ? "No money left your account. Retry with the same or a different method."
                    : "This updates on its own — you can leave and come back anytime."}
              </Text>
            </View>

            {o.action && !failedPayment ? <FocusCard title={o.action.label} detail={o.action.reason} cta="Do it now" onPress={() => toast("Coming in step 4", "info")} /> : null}

            <Card style={{ gap: 8 }}>
              <Row style={{ justifyContent: "space-between" }}>
                <Text variant="label">{o.payment ? "Amount" : "Requested"}</Text>
                {o.payment ? <StatusChip label={PAYMENT.label[o.payment]} tone={PAYMENT.tone(o.payment)} /> : null}
              </Row>
              <AmountText size={32}>{formatINR(o.amount)}</AmountText>
              <Text variant="code">REF · {o.id}</Text>
            </Card>

            <Section title="Timeline">
              <Timeline steps={[...o.timeline, ...(done ? [] : [{ at: "", label: o.kind === "application" && !o.payment ? "Provider decision" : "Confirmation & documents", done: false, actor: "provider" as const }])]} />
            </Section>

            {done ? (
              <TrustBanner>Your documents are in Activity. If this was an eligible transaction, your reward shows in Rewards once it's confirmed.</TrustBanner>
            ) : (
              <SupportPanel body={`Questions about ${o.id}? An advisor already has the details, so you won't need to explain from scratch.`} onPress={() => toast("Advisor requested for " + o.id, "success")} />
            )}
          </>
        )}
      </QueryView>
    </Screen>
  );
}
