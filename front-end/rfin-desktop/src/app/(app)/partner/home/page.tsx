"use client";
import { dateline, formatCompact, LEAD } from "@rfin/shared";
import { Plus } from "lucide-react";
import { useRouter } from "next/navigation";
import { useCommission, useLeads } from "@/lib/hooks";
import { useSession } from "@/stores/session";
import { Page } from "@/components/shell";
import { useToast } from "@/components/toast";
import { FocusCard, HeroCard, PageTitle, QueryView, SectionLabel, StatusCode, StatusRow } from "@/components/ui";

/** Partner Home (report #82). */
export default function PartnerHome() {
  const router = useRouter();
  const toast = useToast();
  const name = useSession((s) => s.profile.name.split(" ")[0]);
  const leads = useLeads();
  const commission = useCommission();

  const rail = (
    <>
      <SectionLabel>Earnings</SectionLabel>
      <QueryView query={commission}>
        {(list) => {
          const sum = (st: string) => list.filter((e) => e.state === st).reduce((s, e) => s + e.amount, 0);
          return (
            <div className="space-y-3">
              {[["Available", sum("available"), "info"], ["Pending", sum("pending"), "pending"], ["Paid", sum("paid"), "success"]].map(([l, v, t]) => (
                <div key={l as string} className="rounded-2xl border border-rfin-line/10 p-4">
                  <StatusCode label={l as string} tone={t as "info"} small />
                  <p className="mt-1 font-display text-3xl">{formatCompact(v as number)}</p>
                </div>
              ))}
            </div>
          );
        }}
      </QueryView>
    </>
  );

  return (
    <Page rail={rail}>
      <PageTitle eyebrow={dateline()} title={name ? `${name}, who needs you today?` : "Who needs you today?"} lede="Leads, cases and earnings — with the next move on each." />
      <div className="rfin-rise rfin-delay-2">
        <HeroCard label="Add a lead" title="60 seconds, start to submit" detail="Client → need → product → documents. We handle the rest." cta="Add lead" icon={<Plus className="size-7 text-rfin-amber" />} onClick={() => toast("Add-lead flow arrives in step 7", "info")} />
      </div>
      <QueryView query={leads}>
        {(list) => {
          const q = list.find((l) => l.state === "qualified");
          const active = list.filter((l) => !LEAD.isTerminal(l.state));
          return (
            <>
              {q ? <FocusCard title={q.nextAction} detail={`${q.client} is qualified and ready to move.`} cta="Open lead" onClick={() => router.push("/partner/leads")} /> : null}
              <section className="space-y-4">
                <SectionLabel>Pipeline</SectionLabel>
                {(["new", "contacted", "qualified", "processing", "converted"] as const).map((st) => {
                  const n = list.filter((l) => l.state === st).length;
                  return <StatusRow key={st} title={LEAD.label[st]} status={`${n} lead${n === 1 ? "" : "s"}`} tone={LEAD.tone(st)} progress={(n / list.length) * 100} />;
                })}
              </section>
              <section className="space-y-3">
                <SectionLabel>Open pipeline value</SectionLabel>
                <p className="font-display text-5xl">{formatCompact(active.reduce((s, l) => s + l.potential, 0))}</p>
                <p className="text-[13px] text-rfin-mute">{active.length} active leads</p>
              </section>
            </>
          );
        }}
      </QueryView>
    </Page>
  );
}
