"use client";
import { REWARD } from "@rfin/shared";
import { cn } from "@/lib/cn";
import { usePoints, useRewardsSummary } from "@/lib/hooks";
import { ago } from "@/lib/time";
import { BackLink, Page } from "@/components/shell";
import { PageTitle, QueryView, SectionLabel, StatusCode } from "@/components/ui";

/** Points ledger — audit-friendly reward timeline (report #56, #68). */
export default function Points() {
  const summary = useRewardsSummary();
  const ledger = usePoints();
  return (
    <Page back={<BackLink href="/rewards" label="Rewards" />}>
      <PageTitle eyebrow="RFIN Points" title="Every point, accounted for." lede="Separate from cash and commission — points only ever unlock benefits." />
      <QueryView query={summary}>
        {(s) => (
          <div className="grid grid-cols-2 gap-4">
            <div className="rounded-2xl border border-rfin-line/10 p-4"><p className="font-mono text-[11px] uppercase tracking-[.18em] text-rfin-mute">Available</p><p className="font-display text-4xl">{s.points.available.toLocaleString("en-IN")}</p></div>
            <div className="rounded-2xl border border-rfin-line/10 p-4"><p className="font-mono text-[11px] uppercase tracking-[.18em] text-rfin-mute">Locked</p><p className="font-display text-4xl text-rfin-mute">{s.points.locked.toLocaleString("en-IN")}</p></div>
          </div>
        )}
      </QueryView>
      <section className="space-y-3">
        <SectionLabel>History</SectionLabel>
        <QueryView query={ledger} empty={{ title: "No points yet" }}>
          {(list) => (
            <div className="divide-y divide-rfin-line/10 rounded-2xl border border-rfin-line/10">
              {list.map((e) => (
                <div key={e.id} className="flex items-center justify-between gap-4 p-4">
                  <div><p className="text-sm font-semibold">{e.description}</p><p className="text-xs text-rfin-mute">{ago(e.at)}{e.ref ? ` · ${e.ref}` : ""}</p></div>
                  <div className="text-right"><p className={cn("text-sm font-semibold", e.state === "reversed" ? "text-rfin-red" : "text-rfin-green")}>{e.state === "reversed" ? "−" : "+"}{e.points.toLocaleString("en-IN")}</p><StatusCode label={REWARD.label[e.state]} tone={REWARD.tone(e.state)} small /></div>
                </div>
              ))}
            </div>
          )}
        </QueryView>
      </section>
    </Page>
  );
}
