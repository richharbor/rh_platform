"use client";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useEffect } from "react";
import { formatINR, PARTNER_CONFIG as P, PAYOUT } from "@rfin/shared";
import { api, track } from "@/lib/api";
import { useCommission, usePayouts, usePoints } from "@/lib/hooks";
import { ago } from "@/lib/time";
import { Page } from "@/components/shell";
import { useToast } from "@/components/toast";
import { Button, Disclosure, PageTitle, QueryView, SectionLabel, StatusCode } from "@/components/ui";

/** Money Centre — three ledgers, never summed; payouts with TDS (report #53, #88, #89). */
export default function Earnings() {
  const qc = useQueryClient();
  const toast = useToast();
  const commission = useCommission();
  const payouts = usePayouts();
  const points = usePoints();

  // A payout turning paid settles its commissions — refresh them right away.
  const paidCount = (payouts.data ?? []).filter((p) => p.state === "paid").length;
  useEffect(() => {
    if (paidCount) qc.invalidateQueries({ queryKey: ["commission"] });
  }, [paidCount, qc]);
  const available = (commission.data ?? []).filter((c) => c.state === "available").reduce((s, c) => s + c.amount, 0);
  const request = useMutation({
    mutationFn: () => api("payouts.request", undefined),
    onSuccess: (p) => {
      track("payout_generated", { id: p.id });
      toast(`${formatINR(p.net)} payout requested`, "success");
      for (const k of ["commission", "payouts"]) qc.invalidateQueries({ queryKey: [k] });
    },
    onError: (e: Error) => toast(e.message, "danger"),
  });

  const rail = (
    <>
      <SectionLabel>Payouts</SectionLabel>
      <QueryView query={payouts} empty={{ title: "No payouts yet" }}>
        {(list) => (
          <div className="space-y-3">
            {list.map((p) => (
              <div key={p.id} className="rounded-2xl border border-rfin-line/10 p-4">
                <div className="flex justify-between"><span className="font-mono text-[11px] text-rfin-mute">{p.id}</span><StatusCode label={p.state === "paid" ? "Paid" : "Processing"} tone={p.state === "paid" ? "success" : "pending"} small /></div>
                <p className="mt-1 font-display text-3xl">{formatINR(p.net)}</p>
                <p className="text-xs text-rfin-mute">Gross {formatINR(p.gross)} · TDS {formatINR(p.tds)} · {p.bank} · {ago(p.at)}</p>
              </div>
            ))}
          </div>
        )}
      </QueryView>
    </>
  );

  return (
    <Page rail={rail}>
      <PageTitle eyebrow="Money centre" title="Three ledgers. Never mixed." lede="Commission is money. Points and promotional benefits are tracked separately." />
      <div className="flex flex-wrap items-end justify-between gap-4 rounded-2xl border border-rfin-line/10 p-5">
        <div>
          <p className="font-mono text-[11px] uppercase tracking-[.18em] text-rfin-mute">Available to pay out</p>
          <p className="font-display text-5xl">{formatINR(available)}</p>
          <p className="text-[13px] text-rfin-mute">After {P.tdsPct}% TDS: {formatINR(Math.round(available * (1 - P.tdsPct / 100)))}{available < P.payoutThreshold ? ` · minimum ${formatINR(P.payoutThreshold)}` : ""}</p>
        </div>
        <Button disabled={available < P.payoutThreshold} loading={request.isPending} onClick={() => request.mutate()}>Request payout</Button>
      </div>
      <section className="space-y-3">
        <SectionLabel>Business commission</SectionLabel>
        <QueryView query={commission} empty={{ title: "No commission yet", body: "Earnings appear when a case completes." }}>
          {(list) => (
            <div className="divide-y divide-rfin-line/10 rounded-2xl border border-rfin-line/10">
              {list.map((e) => (
                <div key={e.id} className="flex items-center justify-between gap-4 p-4">
                  <div><p className="font-mono text-[11px] text-rfin-mute">{e.caseId ?? e.id}</p><p className="text-sm font-semibold">{e.description}</p></div>
                  <div className="text-right"><p className="font-display text-2xl">{formatINR(e.amount)}</p><StatusCode label={PAYOUT.label[e.state]} tone={PAYOUT.tone(e.state)} small /></div>
                </div>
              ))}
            </div>
          )}
        </QueryView>
      </section>
      <section className="space-y-3">
        <SectionLabel>RFIN Points · promotional benefits</SectionLabel>
        <QueryView query={points}>{(list) => <p className="text-sm text-rfin-mute">{list.reduce((s, e) => s + e.points, 0).toLocaleString("en-IN")} points · not cash · no active partner campaigns</p>}</QueryView>
      </section>
      <Disclosure title="Payout terms" items={["Commission becomes available after the provider confirms the case", `${P.tdsPct}% TDS is deducted as applicable before payout`, "Reversed cases reverse their commission"]} />
    </Page>
  );
}
