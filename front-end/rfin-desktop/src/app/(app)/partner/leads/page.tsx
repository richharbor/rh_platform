"use client";
import { formatCompact, LEAD, type LeadState } from "@rfin/shared";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useLeads } from "@/lib/hooks";
import { Page } from "@/components/shell";
import { Button, Chips, PageTitle, QueryView, StatusCode } from "@/components/ui";

/** Pipeline New → … → Converted / Lost, always with the next action (report #84). */
export default function Leads() {
  const router = useRouter();
  const [stage, setStage] = useState<LeadState | "all">("all");
  const leads = useLeads();
  const list = leads.data ?? [];
  return (
    <Page>
      <div className="flex flex-wrap items-end justify-between gap-4">
        <PageTitle eyebrow="Leads" title="Every lead, one next step." lede="Filter by stage. Each row shows what moves it forward." />
        <Button onClick={() => router.push("/partner/leads/new")}>New lead</Button>
      </div>
      <Chips value={stage} onChange={setStage} items={[{ id: "all" as const, label: "All" }, ...LEAD.states.map((s) => ({ id: s, label: LEAD.label[s], count: list.filter((l) => l.state === s).length }))]} />
      <QueryView query={leads} empty={{ title: "No leads yet", body: "Add your first lead — it takes a minute." }}>
        {(all) => {
          const shown = all.filter((l) => stage === "all" || l.state === stage);
          return shown.length ? (
            <div className="divide-y divide-rfin-line/10 rounded-2xl border border-rfin-line/10">
              {shown.map((l) => (
                <button key={l.id} type="button" onClick={() => router.push(`/partner/leads/${l.id}`)} className="grid w-full grid-cols-[1fr_auto] gap-x-6 gap-y-1 p-4 text-left hover:bg-rfin-text/5 sm:grid-cols-[1fr_140px_120px]">
                  <span className="text-sm font-semibold">{l.client}</span>
                  <span className="font-display text-xl sm:text-right">{formatCompact(l.potential)}</span>
                  <span className="sm:text-right"><StatusCode label={LEAD.label[l.state]} tone={LEAD.tone(l.state)} /></span>
                  <span className="col-span-full text-xs text-rfin-mute">Next · {l.nextAction}</span>
                </button>
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
