"use client";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { can, defaultAmount, flowFor, formatINR, KYC, STEP_LABEL } from "@rfin/shared";
import { Check, CreditCard, Landmark, Smartphone } from "lucide-react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { Suspense, useEffect, useRef } from "react";
import { api, newIdempotencyKey, track } from "@/lib/api";
import { cn } from "@/lib/cn";
import { useKyc, useProduct } from "@/lib/hooks";
import { useDrafts } from "@/stores/drafts";
import { useSession } from "@/stores/session";
import { BackLink, Page } from "@/components/shell";
import { Button, Disclosure, QueryView, SectionLabel, StatusCode, Stepper, TrustBanner } from "@/components/ui";

const PAY = [
  { id: "upi", label: "UPI", detail: "Any UPI app", icon: Smartphone },
  { id: "netbanking", label: "Net banking", detail: "All major banks", icon: Landmark },
  { id: "card", label: "Debit card", detail: "Visa, Mastercard, RuPay", icon: CreditCard },
];

/** Unified transaction engine (report #31–#40) — same flow config as the Expo app. */
function Transaction() {
  const { id } = useParams<{ id: string }>();
  const amountParam = useSearchParams().get("amount");
  const router = useRouter();
  const qc = useQueryClient();
  const roles = useSession((s) => s.roles);
  const product = useProduct(id);
  const kyc = useKyc();
  const draft = useDrafts((s) => s.drafts[id]);
  const save = useDrafts((s) => s.save);
  const clear = useDrafts((s) => s.clear);
  const idem = useRef(newIdempotencyKey()); // one order per attempt (report #37)

  const p = product.data;
  const flow = p ? flowFor(p) : null;
  const step = Math.min(draft?.step ?? 0, (flow?.steps.length ?? 1) - 1);
  const amount = Number(amountParam) || draft?.amount || (p ? defaultAmount(p) : 0);
  const consents = draft?.consents ?? [];

  useEffect(() => {
    if (p && !draft) save(id, { step: 0, amount });
  }, [p, draft, id, amount, save]);

  // Returning from KYC / bank (another tab or back nav): refresh what's missing.
  useEffect(() => {
    const onFocus = () => kyc.refetch();
    window.addEventListener("focus", onFocus);
    return () => window.removeEventListener("focus", onFocus);
  }, [kyc]);

  const consent = useMutation({
    mutationFn: () => api("consent.record", { subject: `${p!.name} · ${p!.provider}`, items: flow!.consents }),
    onSuccess: () => save(id, { step: step + 1 }),
  });
  const submit = useMutation({
    mutationFn: () => api("orders.create", { kind: flow!.kind, subjectId: id, amount, pay: flow!.steps.includes("pay") }, { idempotencyKey: idem.current }),
    onSuccess: (order) => {
      track(flow!.steps.includes("pay") ? "payment_started" : "order_submitted", { id, order: order.id });
      qc.invalidateQueries({ queryKey: ["orders"] });
      clear(id);
      router.replace(`/order/${order.id}`);
    },
  });

  if (!p || !flow) return <Page><QueryView query={product}>{() => null}</QueryView></Page>;

  const current = flow.steps[step];
  const missing = (kyc.data ?? []).filter((k) => flow.kycRequired.includes(k.id) && k.state !== "verified");
  const next = () => save(id, { step: step + 1 });
  const canPay = can(roles, "applications", "pay");

  const cta = (() => {
    switch (current) {
      case "review":
        return <Button block onClick={next}>Looks right</Button>;
      case "consent":
        return <Button block disabled={consents.filter(Boolean).length < flow.consents.length} loading={consent.isPending} onClick={() => consent.mutate()}>I agree</Button>;
      case "kyc":
        return missing.length ? (
          <Button block onClick={() => { track("kyc_started"); router.push(missing[0].id === "bank" ? "/bank" : "/kyc"); }}>Complete {missing[0].label}</Button>
        ) : (
          <Button block onClick={next}>Continue</Button>
        );
      case "pay":
        return <Button block disabled={!draft?.payMethod || !canPay} loading={submit.isPending} onClick={() => submit.mutate()}>{flow.cta} · {formatINR(amount)}</Button>;
      case "submit":
        return <Button block loading={submit.isPending} onClick={() => submit.mutate()}>{flow.cta}</Button>;
    }
  })();

  const rail = (
    <>
      <SectionLabel>Summary</SectionLabel>
      <div className="rounded-2xl border border-rfin-line/10 p-4">
        <p className="font-mono text-[11px] uppercase tracking-[.18em] text-rfin-mute">{p.provider}</p>
        <p className="mt-1 font-display text-2xl">{p.name}</p>
        <p className="mt-4 font-mono text-[11px] uppercase tracking-[.18em] text-rfin-mute">{flow.steps.includes("pay") ? "You pay now" : "Requested"}</p>
        <p className="font-display text-4xl">{formatINR(amount)}</p>
      </div>
      <div className="mt-auto space-y-3 border-t border-rfin-line/15 pt-6">
        {submit.isError ? <p className="text-center text-xs text-rfin-red">{submit.error.message}</p> : null}
        {cta}
        {step > 0 ? <p className="text-center text-xs text-rfin-mute">Progress saved — you can come back anytime.</p> : null}
      </div>
    </>
  );

  return (
    <Page rail={rail} back={<BackLink href={`/product/${id}`} label={p.name} />}>
      <div className="rfin-rise">
        <Stepper steps={flow.steps.map((s) => STEP_LABEL[s])} current={step} />
      </div>

      {current === "review" ? (
        <>
          <h1 className="font-display text-5xl tracking-tight">Check the details.</h1>
          <div className="divide-y divide-rfin-line/10 rounded-2xl border border-rfin-line/10">
            {[["Product", p.name], ["Provider", p.provider], [flow.steps.includes("pay") ? "You pay now" : "Amount requested", formatINR(amount)], ...p.costs.map((c) => [c.label, c.value])].map(([k, v]) => (
              <div key={k} className="flex justify-between gap-4 p-4">
                <span className="text-[13px] text-rfin-mute">{k}</span>
                <span className="text-right text-sm font-semibold">{v}</span>
              </div>
            ))}
          </div>
          <Disclosure items={p.risks} />
          <section className="space-y-3">
            <SectionLabel>What happens after you submit</SectionLabel>
            {p.whatNext.map((w, i) => (
              <div key={w} className="flex gap-3 text-[15px]">
                <span className="w-5 font-mono text-[11px] leading-6 text-rfin-mute">{String(i + 1).padStart(2, "0")}</span>
                {w}
              </div>
            ))}
          </section>
        </>
      ) : null}

      {current === "consent" ? (
        <>
          <h1 className="font-display text-5xl tracking-tight">Your consent.</h1>
          <p className="text-sm text-rfin-mute">Each one is recorded with a timestamp. You can see them anytime in your profile.</p>
          <div className="space-y-3">
            {flow.consents.map((c, i) => {
              const on = !!consents[i];
              return (
                <button
                  key={c}
                  type="button"
                  role="checkbox"
                  aria-checked={on}
                  onClick={() => {
                    const nextC = flow.consents.map((_, j) => !!consents[j]);
                    nextC[i] = !on;
                    save(id, { consents: nextC });
                  }}
                  className={cn("flex w-full items-start gap-3 rounded-2xl border p-4 text-left", on ? "border-rfin-text" : "border-rfin-line/10 hover:bg-rfin-text/5")}
                >
                  <span className={cn("mt-0.5 grid size-5 shrink-0 place-items-center rounded-md border-[1.5px]", on ? "border-rfin-inverse bg-rfin-inverse text-rfin-on-inverse" : "border-rfin-line/25")}>{on ? <Check className="size-3.5" /> : null}</span>
                  <span className="text-[15px]">{c}</span>
                </button>
              );
            })}
          </div>
        </>
      ) : null}

      {current === "kyc" ? (
        <>
          <h1 className="font-display text-5xl tracking-tight">{missing.length ? "A few checks first." : "You're verified."}</h1>
          <p className="text-sm text-rfin-mute">{p.provider} needs these before it can {flow.steps.includes("pay") ? "issue your policy" : "review your application"}. We only ask once — they&apos;re reused everywhere on RFIN.</p>
          <QueryView query={kyc}>
            {(items) => (
              <div className="divide-y divide-rfin-line/10 rounded-2xl border border-rfin-line/10">
                {items.filter((k) => flow.kycRequired.includes(k.id)).map((k) => (
                  <div key={k.id} className="space-y-1 p-4">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-semibold">{k.label}</span>
                      <StatusCode label={k.state === "in_progress" ? "In review" : KYC.label[k.state]} tone={KYC.tone(k.state)} />
                    </div>
                    <p className={cn("text-xs", k.rejectionReason ? "text-rfin-red" : "text-rfin-mute")}>{k.rejectionReason ?? k.why}</p>
                  </div>
                ))}
              </div>
            )}
          </QueryView>
          {!missing.length ? <TrustBanner>Everything this product needs is verified.</TrustBanner> : null}
        </>
      ) : null}

      {current === "pay" ? (
        <>
          <div>
            <p className="font-mono text-[11px] uppercase tracking-[.18em] text-rfin-mute">Amount</p>
            <p className="font-display text-6xl">{formatINR(amount)}</p>
          </div>
          <div role="radiogroup" aria-label="Pay with" className="grid gap-3 sm:grid-cols-3">
            {PAY.map((m) => {
              const on = draft?.payMethod === m.id;
              return (
                <button key={m.id} type="button" role="radio" aria-checked={on} onClick={() => save(id, { payMethod: m.id })} className={cn("rounded-2xl p-4 text-left transition-colors", on ? "border-2 border-rfin-text" : "border border-rfin-line/10 hover:bg-rfin-text/5")}>
                  <m.icon className="size-5" aria-hidden />
                  <p className="mt-3 text-sm font-semibold">{m.label}</p>
                  <p className="text-xs text-rfin-mute">{m.detail}</p>
                </button>
              );
            })}
          </div>
          {!canPay ? <p className="text-xs text-rfin-red">Your role can&apos;t make payments.</p> : null}
          <TrustBanner>You&apos;ll only be charged once. If a payment fails, no money leaves your account and you can retry.</TrustBanner>
        </>
      ) : null}

      {current === "submit" ? (
        <>
          <h1 className="font-display text-5xl tracking-tight">Ready to send.</h1>
          <p className="text-sm leading-relaxed text-rfin-mute">We&apos;ll send your application to {p.provider} for {formatINR(amount)}. There&apos;s nothing to pay now — any processing fee is deducted from the loan amount.</p>
          <div className="rounded-2xl border border-rfin-line/10 p-4">
            <p className="font-mono text-[11px] uppercase tracking-[.18em] text-rfin-mute">You&apos;ll hear back</p>
            <p className="mt-1 font-semibold">Within 48 hours, with every step in Applications.</p>
          </div>
        </>
      ) : null}

      {/* The rail holds the CTA on xl screens; inline below that. */}
      <div className="space-y-2 xl:hidden">
        {cta}
        {step > 0 ? <p className="text-center text-xs text-rfin-mute">Progress saved — you can come back anytime.</p> : null}
      </div>
      {step > 0 ? (
        <button type="button" onClick={() => save(id, { step: step - 1 })} className="text-xs font-semibold text-rfin-mute hover:text-rfin-text">
          ← Back to {STEP_LABEL[flow.steps[step - 1]]}
        </button>
      ) : null}
    </Page>
  );
}

export default function TxnPage() {
  return (
    <Suspense>
      <Transaction />
    </Suspense>
  );
}
