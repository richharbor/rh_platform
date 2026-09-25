"use client";
import { formatCompact, LEAD, type LeadState } from "@rfin/shared";
import { useState } from "react";
import { cn } from "@/lib/cn";
import { useLeads } from "@/lib/hooks";
import { Page } from "@/components/shell";
import { PageTitle, QueryView, StatusCode } from "@/components/ui";

/** Pipeline New → … → Converted / Lost, always with the next action (report #84). */
export default function Leads() {
  const [stage, setStage] = useState<LeadState | "all">("all");
  const leads = useLeads();
  return (
    <Page>
      <PageTitle eyebrow="Leads" title="Every lead, one next step." lede="Filter by stage. Each row shows what moves it forward." />
      <div className="flex flex-wrap gap-2" role="tablist">
        {(["all", ...LEAD.states] as const).map((s) => (
          <button key={s} role="tab" aria-selected={s === stage} onClick={() => setStage(s)} className={cn("rounded-full border px-4 py-2.5 text-[13px] font-semibold", s === stage ? "border-rfin-inverse bg-rfin-inverse text-rfin-on-inverse" : "border-rfin-line/15 hover:bg-rfin-text/5")}>
            {s === "all" ? "All" : LEAD.label[s]}
          </button>
        ))}
      </div>
      <QueryView query={leads} empty={{ title: "No leads yet" }}>
        {(list) => {
          const shown = list.filter((l) => stage === "all" || l.state === stage);
          return shown.length ? (
            <div className="divide-y divide-rfin-line/10 rounded-2xl border border-rfin-line/10">
              {shown.map((l) => (
                <div key={l.id} className="grid grid-cols-[1fr_auto] gap-x-6 gap-y-1 p-4 sm:grid-cols-[1fr_140px_120px]">
                  <span className="text-sm font-semibold">{l.client}</span>
                  <span className="font-display text-xl sm:text-right">{formatCompact(l.potential)}</span>
                  <span className="sm:text-right"><StatusCode label={LEAD.label[l.state]} tone={LEAD.tone(l.state)} /></span>
                  <span className="col-span-full text-xs text-rfin-mute">Next · {l.nextAction}</span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-rfin-mute">No leads at this stage.</p>
          );
        }}
      </QueryView>
    </Page>
  );
}
