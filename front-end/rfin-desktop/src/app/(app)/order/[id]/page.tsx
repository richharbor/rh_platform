"use client";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { can, formatINR, ORDER, PAYMENT } from "@rfin/shared";
import { Check, Clock, RotateCcw } from "lucide-react";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { api, track } from "@/lib/api";
import { cn } from "@/lib/cn";
import { useOrder } from "@/lib/hooks";
import { useSession } from "@/stores/session";
import { BackLink, Page } from "@/components/shell";
import { useToast } from "@/components/toast";
import { Button, FocusCard, QueryView, SectionLabel, StatusCode, SupportPanel, Timeline, TrustBanner } from "@/components/ui";

/** Never leave the user wondering (report #8, #38–#40). */
export default function OrderStatus() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const qc = useQueryClient();
  const toast = useToast();
  const roles = useSession((s) => s.roles);
  const order = useOrder(id);
  const [advisor, setAdvisor] = useState(false);
  const seen = useRef<string | undefined>(undefined);
  const o = order.data;

  useEffect(() => {
    if (!o || seen.current === o.state) return;
    seen.current = o.state;
    if (o.state === "fulfilled") {
      track("order_completed", { id: o.id });
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
  const failed = o?.payment === "failed";

  const rail = o ? (
    <>
      <SectionLabel>Reference</SectionLabel>
      <div className="rounded-2xl border border-rfin-line/10 p-4">
        <div className="flex items-center justify-between">
          <span className="font-mono text-[11px] uppercase tracking-[.18em] text-rfin-mute">{o.payment ? "Amount" : "Requested"}</span>
          {o.payment ? <StatusCode label={PAYMENT.label[o.payment]} tone={PAYMENT.tone(o.payment)} /> : null}
        </div>
        <p className="mt-1 font-display text-4xl">{formatINR(o.amount)}</p>
        <p className="mt-2 font-mono text-[11px] text-rfin-mute">REF · {o.id}</p>
      </div>
      <div className="mt-auto border-t border-rfin-line/15 pt-6">
        {failed && can(roles, "orders", "retry_payment") ? (
          <Button variant="red" block loading={retry.isPending} onClick={() => retry.mutate()}>
            <RotateCcw className="size-4" /> Retry payment
          </Button>
        ) : (
          <Button block onClick={() => router.push(done ? "/home" : "/activity")}>{done ? "Back to home" : "All applications"}</Button>
        )}
      </div>
    </>
  ) : null;

  return (
    <Page rail={rail} back={<BackLink href="/activity" label="Applications" />}>
      <QueryView query={order}>
        {(o) => (
          <>
            <header className="rfin-rise space-y-3">
              <div className={cn("grid size-14 place-items-center rounded-full", done ? "bg-rfin-green/15 text-rfin-green" : failed ? "bg-rfin-red/15 text-rfin-red" : "bg-rfin-amber/20 text-rfin-amber")}>
                {done ? <Check className="size-6" /> : failed ? <RotateCcw className="size-6" /> : <Clock className="size-6" />}
              </div>
              <StatusCode label={ORDER.label[o.state]} tone={ORDER.tone(o.state)} />
              <h1 className="font-display text-5xl leading-[.95] tracking-tight sm:text-6xl">{done ? "All done." : failed ? "Payment didn't go through." : o.state === "submitted" ? "Sent. Hang tight." : "Working on it."}</h1>
              <p className="max-w-xl text-sm leading-relaxed text-rfin-mute">
                {done ? `${o.title} is confirmed. Your reference is ${o.id}.` : failed ? "No money left your account. Retry with the same or a different method." : "This updates on its own — you can leave and come back anytime."}
              </p>
            </header>

            {o.action && !failed ? <FocusCard title={o.action.label} detail={o.action.reason} cta="Do it now" onClick={() => toast("Order actions arrive in step 4", "info")} /> : null}

            <section className="space-y-4">
              <SectionLabel>Timeline</SectionLabel>
              <Timeline steps={[...o.timeline, ...(done ? [] : [{ at: "", label: o.payment ? "Confirmation & documents" : "Provider decision", done: false, actor: "provider" as const }])]} />
            </section>

            <div className="xl:hidden">
              {failed ? (
                <Button variant="red" block loading={retry.isPending} onClick={() => retry.mutate()}>
                  <RotateCcw className="size-4" /> Retry payment
                </Button>
              ) : null}
            </div>

            {done ? (
              <TrustBanner>Your documents are in Applications. If this was an eligible transaction, your reward shows in Rewards once it&apos;s confirmed.</TrustBanner>
            ) : (
              <SupportPanel body={`Questions about ${o.id}? An advisor already has the details, so you won't need to explain from scratch.`} requested={advisor} onClick={() => { setAdvisor(true); toast(`Advisor requested for ${o.id}`, "success"); }} />
            )}
          </>
        )}
      </QueryView>
    </Page>
  );
}
