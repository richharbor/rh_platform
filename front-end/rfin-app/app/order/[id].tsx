import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useLocalSearchParams, useRouter } from "expo-router";
import { Check, Clock, RotateCcw } from "lucide-react-native";
import { useEffect, useRef, useState } from "react";
import { View } from "react-native";
import { api } from "@/api/client";
import { useDocuments, useOrder } from "@/api/hooks";
import { track } from "@/analytics";
import { ORDER, PAYMENT } from "@/domain/states";
import { useTheme } from "@/design";
import { PageHeader } from "@/features/PageHeader";
import { slotLabel } from "@/features/support";
import { formatINR } from "@/lib/format";
import { ActivityRow, AmountText, BottomSheet, Button, Card, Display, FocusCard, QueryView, Row, Screen, Section, StatusChip, StickyCTA, SupportPanel, Text, Timeline, TrustBanner, useToast } from "@/ui";
import { FileText } from "lucide-react-native";
import { Pressable } from "react-native";

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
  const docs = useDocuments();
  const [picking, setPicking] = useState(false);
  const [slot, setSlot] = useState<string>();
  const act = useMutation({
    mutationFn: () => api("orders.act", { id, choice: slot! }),
    onSuccess: (updated) => {
      qc.setQueryData(["order", id], updated);
      qc.invalidateQueries({ queryKey: ["orders"] });
      setPicking(false);
      toast("Booked — we'll confirm by SMS", "success");
    },
  });
  const orderDocs = (docs.data ?? []).filter((d) => d.orderId === id);

  useEffect(() => {
    if (!o || announced.current === o.state) return;
    announced.current = o.state;
    // A state change on the server can issue documents, notifications, points and draw progress.
    for (const key of ["documents", "notifications", "points", "draws", "orders"]) qc.invalidateQueries({ queryKey: [key] });
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

            {o.action && !failedPayment ? (
              <FocusCard
                title={o.action.label}
                detail={o.action.reason}
                cta={o.action.type === "schedule" ? "Pick a slot" : "Do it now"}
                onPress={() => (o.action?.type === "schedule" ? setPicking(true) : router.push({ pathname: "/support", params: { contextType: "order", contextId: o.id, subject: o.action!.label } }))}
              />
            ) : null}

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

            {orderDocs.length ? (
              <Section title="Documents" gap={14}>
                {orderDocs.map((d) => (
                  <Pressable key={d.id} onPress={() => router.push("/documents")}>
                    <ActivityRow icon={FileText} title={d.title} detail={d.state === "available" ? "Ready to download" : "Being prepared"} />
                  </Pressable>
                ))}
              </Section>
            ) : null}

            {done ? <TrustBanner>If this was an eligible transaction, your reward shows in Rewards once it's confirmed.</TrustBanner> : null}
            <SupportPanel
              body={`Questions about ${o.id}? An advisor already has the details, so you won't need to explain from scratch.`}
              onPress={() => router.push({ pathname: "/support", params: { contextType: "order", contextId: o.id, subject: `About ${o.title}` } })}
            />

            {o.action?.type === "schedule" ? (
              <BottomSheet open={picking} onClose={() => setPicking(false)} title="Pick a slot">
                <View style={{ gap: 10 }}>
                  {o.action.options.map((opt) => {
                    const on = slot === opt;
                    return (
                      <Pressable key={opt} accessibilityRole="radio" accessibilityState={{ selected: on }} onPress={() => setSlot(opt)} style={{ padding: 16, borderRadius: 18, borderWidth: on ? 2 : 1, borderColor: on ? colors.foreground : colors.lineSoft }}>
                        <Text variant="title">{slotLabel(opt)}</Text>
                        <Text variant="xs">At home · about 20 minutes</Text>
                      </Pressable>
                    );
                  })}
                  {act.isError ? <Text variant="xs" style={{ color: colors.red }}>{act.error.message}</Text> : null}
                  <Button label="Book this slot" block disabled={!slot} loading={act.isPending} onPress={() => act.mutate()} />
                </View>
              </BottomSheet>
            ) : null}
          </>
        )}
      </QueryView>
    </Screen>
  );
}
