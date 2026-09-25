"use client";
import { dateline, formatCompact, formatINR, LEAD } from "@rfin/shared";
import { Plus, Sparkles } from "lucide-react";
import { useRouter } from "next/navigation";
import { useCases, useCommission, useLeads, useOpportunities, usePartnerInsights } from "@/lib/hooks";
import { useSession } from "@/stores/session";
import { Page } from "@/components/shell";
import { ActivityRow, Card, FocusCard, HeroCard, PageTitle, QueryView, SectionLabel, StatusCode, StatusRow } from "@/components/ui";

/** Partner Home (report #82). */
export default function PartnerHome() {
  const router = useRouter();
  const name = useSession((s) => s.profile.name.split(" ")[0]);
  const perf = usePartnerInsights();
  const leads = useLeads();
  const cases = useCases();
  const ops = useOpportunities();
  const commission = useCommission();

  const rail = (
    <>
      <SectionLabel>Earnings</SectionLabel>
      <QueryView query={commission}>
        {(list) => {
          const sum = (st: string) => list.filter((e) => e.state === st).reduce((s, e) => s + e.amount, 0);
          return (
            <div className="space-y-3">
              {([["Available", sum("available"), "info"], ["Pending", sum("pending") + sum("on_hold"), "pending"], ["Paid", sum("paid"), "success"]] as const).map(([l, v, t]) => (
                <button key={l} type="button" onClick={() => router.push("/partner/earnings")} className="w-full rounded-2xl border border-rfin-line/10 p-4 text-left hover:bg-rfin-text/5">
                  <StatusCode label={l} tone={t} small />
                  <p className="mt-1 font-display text-3xl">{formatCompact(v)}</p>
                </button>
              ))}
            </div>
          );
        }}
      </QueryView>
      <div className="mt-auto border-t border-rfin-line/15 pt-6">
        <SectionLabel>Cases in flight</SectionLabel>
        <QueryView query={cases} empty={{ title: "No cases yet" }}>
          {(list) => (
            <div className="mt-3 space-y-2">
              {list.slice(0, 4).map((k) => (
                <button key={k.id} type="button" onClick={() => router.push(`/partner/cases/${k.id}`)} className="w-full rounded-2xl border border-rfin-line/10 p-3 text-left hover:bg-rfin-text/5">
                  <div className="flex justify-between"><span className="text-sm font-semibold">{k.client}</span><StatusCode label={k.stageLabel} tone={k.stage === "completed" ? "success" : "pending"} small /></div>
                  <p className="text-xs text-rfin-mute">{k.subject}</p>
                </button>
              ))}
            </div>
          )}
        </QueryView>
      </div>
    </>
  );

  return (
    <Page rail={rail}>
      <PageTitle eyebrow={dateline()} title={name ? `${name}, who needs you today?` : "Who needs you today?"} lede="Leads, cases and earnings — with the next move on each." />
      <div className="rfin-rise rfin-delay-2">
        <HeroCard label="Add a lead" title="60 seconds, start to submit" detail="Client → need → product → documents. We handle the rest." cta="Add lead" icon={<Plus className="size-7 text-rfin-amber" />} onClick={() => router.push("/partner/leads/new")} />
      </div>
      <QueryView query={leads}>
        {(list) => {
          const q = list.find((l) => l.state === "qualified");
          return q ? <FocusCard title={q.nextAction} detail={`${q.client} is qualified and ready to move.`} cta="Open lead" onClick={() => router.push(`/partner/leads/${q.id}`)} /> : null;
        }}
      </QueryView>
      <section className="space-y-4">
        <SectionLabel>Opportunities</SectionLabel>
        <QueryView query={ops} empty={{ title: "Nothing new", body: "Signals from your clients and the market show up here." }}>
          {(list) => <div className="grid gap-4 md:grid-cols-2">{list.slice(0, 4).map((o) => <button key={o.id} type="button" onClick={() => router.push(`/partner/clients/${o.clientKey}`)} className="block text-left"><ActivityRow icon={<Sparkles className="size-4" />} tone="pending" title={o.title} detail={`${o.reason} · ${o.action}`} /></button>)}</div>}
        </QueryView>
      </section>
      <QueryView query={leads}>
        {(list) => (
          <section className="space-y-4">
            <SectionLabel>Pipeline</SectionLabel>
            {LEAD.states.map((st) => {
              const n = list.filter((l) => l.state === st).length;
              return <StatusRow key={st} title={LEAD.label[st]} status={`${n} lead${n === 1 ? "" : "s"}`} tone={LEAD.tone(st)} progress={list.length ? (n / list.length) * 100 : 0} onClick={() => router.push("/partner/leads")} />;
            })}
          </section>
        )}
      </QueryView>
      <section className="space-y-3" aria-labelledby="perf-heading">
        <SectionLabel id="perf-heading">Performance</SectionLabel>
        <QueryView query={perf}>
          {(p) => (
            <>
              <div className="grid gap-3 sm:grid-cols-3">
                <Card className="space-y-1"><p className="font-mono text-[11px] uppercase tracking-[.18em] text-rfin-mute">Conversion</p><p className="font-display text-4xl">{p.conversionRate}%</p><p className="text-xs text-rfin-mute">of closed leads</p></Card>
                <Card className="space-y-1"><p className="font-mono text-[11px] uppercase tracking-[.18em] text-rfin-mute">Avg ticket</p><p className="font-display text-4xl">{formatINR(p.avgTicket)}</p><p className="text-xs text-rfin-mute">{p.leads} leads</p></Card>
                <Card className="space-y-1"><p className="font-mono text-[11px] uppercase tracking-[.18em] text-rfin-mute">Open pipeline</p><p className="font-display text-4xl">{formatCompact(p.openPipeline)}</p><p className="text-xs text-rfin-mute">{p.commissionPct}% commission rate</p></Card>
              </div>
              <ul className="list-disc space-y-1 pl-4 text-xs text-rfin-mute">{p.tips.map((t) => <li key={t}>{t}</li>)}</ul>
            </>
          )}
        </QueryView>
      </section>
    </Page>
  );
}
