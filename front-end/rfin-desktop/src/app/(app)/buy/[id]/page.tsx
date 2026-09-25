"use client";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { formatINR, KYC } from "@rfin/shared";
import { Check, Minus, Plus } from "lucide-react";
import { useParams, useRouter } from "next/navigation";
import { useRef, useState } from "react";
import { api, newIdempotencyKey, track } from "@/lib/api";
import { cn } from "@/lib/cn";
import { useCompany, useKyc, useQuote } from "@/lib/hooks";
import { BackLink, Page } from "@/components/shell";
import { Button, Disclosure, IndicativeBadge, QueryView, SectionLabel, StatusCode, Stepper, TrustBanner } from "@/components/ui";

const STEPS = ["Quantity", "Review", "Consent", "KYC", "Pay"];
const KYC_NEEDED = ["pan", "address", "bank"];
const CONSENTS = [
  "I understand unlisted shares may be hard to sell and prices are indicative",
  "I've read the transfer restrictions, including ROFR and approvals",
  "I understand returns are not guaranteed",
];

/** Select → Quantity → Review → KYC → Pay → Transfer → Portfolio (report #92). */
export default function Buy() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const qc = useQueryClient();
  const company = useCompany(id);
  const kyc = useKyc();
  const [step, setStep] = useState(0);
  const [lots, setLots] = useState(1);
  const [consents, setConsents] = useState<boolean[]>([]);
  const [method, setMethod] = useState<string>();
  const idem = useRef(newIdempotencyKey());
  const minLot = company.data?.minLot ?? 1;
  const quantity = lots * minLot;
  const quote = useQuote(id, company.data ? quantity : 0);
  const q = quote.data;
  const missing = (kyc.data ?? []).filter((k) => KYC_NEEDED.includes(k.id) && k.state !== "verified");

  const consent = useMutation({ mutationFn: () => api("consent.record", { subject: `${company.data!.name} · private-market buy`, items: CONSENTS }), onSuccess: () => setStep(3) });
  const pay = useMutation({
    mutationFn: () => api("orders.create", { kind: "pm_buy", subjectId: id, quantity, pay: true }, { idempotencyKey: idem.current }),
    onSuccess: (o) => {
      track("payment_started", { id, order: o.id, quantity });
      qc.invalidateQueries({ queryKey: ["orders"] });
      router.replace(`/order/${o.id}`);
    },
  });

  const cta = [
    <Button key="q" block onClick={() => setStep(1)}>Review {quantity} shares</Button>,
    <Button key="r" block disabled={!q} onClick={() => setStep(2)}>Looks right</Button>,
    <Button key="c" block disabled={consents.filter(Boolean).length < CONSENTS.length} loading={consent.isPending} onClick={() => consent.mutate()}>I agree</Button>,
    missing.length ? <Button key="k" block onClick={() => router.push(missing[0].id === "bank" ? "/bank" : "/kyc")}>Complete {missing[0].label}</Button> : <Button key="k" block onClick={() => setStep(4)}>Continue</Button>,
    <Button key="p" block disabled={!method || !q} loading={pay.isPending} onClick={() => pay.mutate()}>{q ? `Pay ${formatINR(q.total)}` : "Pay"}</Button>,
  ][step];

  const rail = (
    <>
      <SectionLabel>Summary</SectionLabel>
      <div className="rounded-2xl border border-rfin-line/10 p-4">
        <p className="font-display text-2xl">{company.data?.name}</p>
        <p className="text-sm text-rfin-mute">{quantity} shares</p>
        {q ? <p className="mt-3 font-display text-4xl">{formatINR(q.total)}</p> : null}
        <div className="mt-2"><IndicativeBadge label="Incl. fees" /></div>
      </div>
      <div className="mt-auto space-y-2 border-t border-rfin-line/15 pt-6">
        {pay.isError ? <p className="text-center text-xs text-rfin-red">{pay.error.message}</p> : null}
        {cta}
      </div>
    </>
  );

  return (
    <Page rail={rail} back={<BackLink href={`/company/${id}`} label={company.data?.name ?? "Company"} />}>
      <Stepper steps={STEPS} current={step} />
      <QueryView query={company}>
        {(c) => (
          <>
            {step === 0 ? (
              <>
                <h1 className="font-display text-5xl tracking-tight">How many shares?</h1>
                <p className="text-sm text-rfin-mute">{c.name} trades in lots of {c.minLot}.</p>
                <div className="flex items-center gap-8">
                  <button type="button" aria-label="Fewer" disabled={lots <= 1} onClick={() => setLots(lots - 1)} className="grid size-14 place-items-center rounded-full border border-rfin-line/20 disabled:opacity-40"><Minus className="size-5" /></button>
                  <div className="text-center"><p className="font-display text-7xl">{quantity}</p><p className="font-mono text-[11px] text-rfin-mute">{lots} LOT{lots > 1 ? "S" : ""}</p></div>
                  <button type="button" aria-label="More" onClick={() => setLots(lots + 1)} className="grid size-14 place-items-center rounded-full border border-rfin-line/20"><Plus className="size-5" /></button>
                </div>
              </>
            ) : null}
            {step === 1 && q ? (
              <>
                <h1 className="font-display text-5xl tracking-tight">Check the details.</h1>
                <div className="divide-y divide-rfin-line/10 rounded-2xl border border-rfin-line/10">
                  {[["Price per share", formatINR(q.unitPrice)], ["Quantity", `${q.quantity} shares`], ["Consideration", formatINR(q.consideration)], ["Platform fee · 0.5%", formatINR(q.platformFee)], ["Stamp duty · 0.015%", formatINR(q.stampDuty)], ["Total", formatINR(q.total)]].map(([k, v], i, a) => (
                    <div key={k} className="flex justify-between p-4"><span className={cn(i === a.length - 1 ? "text-sm font-semibold" : "text-[13px] text-rfin-mute")}>{k}</span><span className="text-sm font-semibold">{v}</span></div>
                  ))}
                </div>
                <p className="text-xs text-rfin-mute">Expected timeline: {q.settlement}. Shares arrive in your demat and show up in Portfolio.</p>
                <Disclosure items={[...c.risks.slice(0, 2), ...c.transferRestrictions]} />
              </>
            ) : null}
            {step === 2 ? (
              <>
                <h1 className="font-display text-5xl tracking-tight">Your consent.</h1>
                <div className="space-y-3">
                  {CONSENTS.map((t, i) => {
                    const on = !!consents[i];
                    return (
                      <button key={t} type="button" role="checkbox" aria-checked={on} onClick={() => { const n = CONSENTS.map((_, j) => !!consents[j]); n[i] = !on; setConsents(n); }} className={cn("flex w-full items-start gap-3 rounded-2xl border p-4 text-left", on ? "border-rfin-text" : "border-rfin-line/10 hover:bg-rfin-text/5")}>
                        <span className={cn("mt-0.5 grid size-5 shrink-0 place-items-center rounded-md border-[1.5px]", on ? "border-rfin-inverse bg-rfin-inverse text-rfin-on-inverse" : "border-rfin-line/25")}>{on ? <Check className="size-3.5" /> : null}</span>
                        <span className="text-[15px]">{t}</span>
                      </button>
                    );
                  })}
                </div>
              </>
            ) : null}
            {step === 3 ? (
              <>
                <h1 className="font-display text-5xl tracking-tight">{missing.length ? "A few checks first." : "You're verified."}</h1>
                <p className="text-sm text-rfin-mute">Share transfers need your PAN, address and a verified bank account.</p>
                <div className="divide-y divide-rfin-line/10 rounded-2xl border border-rfin-line/10">
                  {(kyc.data ?? []).filter((k) => KYC_NEEDED.includes(k.id)).map((k) => (
                    <div key={k.id} className="flex justify-between p-4"><span className="text-sm font-semibold">{k.label}</span><StatusCode label={KYC.label[k.state]} tone={KYC.tone(k.state)} /></div>
                  ))}
                </div>
              </>
            ) : null}
            {step === 4 && q ? (
              <>
                <div><p className="font-mono text-[11px] uppercase tracking-[.18em] text-rfin-mute">Amount</p><p className="font-display text-6xl">{formatINR(q.total)}</p></div>
                <div role="radiogroup" className="grid gap-3 sm:grid-cols-2">
                  {["UPI", "Net banking"].map((m) => (
                    <button key={m} type="button" role="radio" aria-checked={method === m} onClick={() => setMethod(m)} className={cn("rounded-2xl p-4 text-left text-sm font-semibold", method === m ? "border-2 border-rfin-text" : "border border-rfin-line/10 hover:bg-rfin-text/5")}>{m}</button>
                  ))}
                </div>
                <TrustBanner>Your money is held until the seller&apos;s shares are transferred. If the transfer fails, it&apos;s refunded in full.</TrustBanner>
              </>
            ) : null}
            <div className="xl:hidden">{cta}</div>
            {step > 0 ? <button type="button" onClick={() => setStep(step - 1)} className="text-xs font-semibold text-rfin-mute hover:text-rfin-text">← Back to {STEPS[step - 1]}</button> : null}
          </>
        )}
      </QueryView>
    </Page>
  );
}
