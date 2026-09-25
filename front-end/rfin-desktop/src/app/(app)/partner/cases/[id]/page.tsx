"use client";
import { dayMonth, formatINR, PARTNER_CONFIG as P } from "@rfin/shared";
import { useParams, useRouter } from "next/navigation";
import { useCase } from "@/lib/hooks";
import { BackLink, Page } from "@/components/shell";
import { QueryView, SectionLabel, StatusCode, Stepper, SupportPanel, Timeline } from "@/components/ui";

/** Case 360 — reference, stage, owner, next action, SLA, timeline (report #86). */
export default function Case360() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const kase = useCase(id);
  return (
    <Page back={<BackLink href="/partner/home" label="Partner home" />}>
      <QueryView query={kase}>
        {(k) => {
          const idx = P.caseStages.findIndex((s) => s.id === k.stage);
          const done = k.stage === "completed";
          return (
            <>
              <header className="space-y-3">
                <div className="flex items-center gap-3"><StatusCode label={k.stageLabel} tone={done ? "success" : "pending"} /><span className="font-mono text-[11px] text-rfin-mute">{k.id}</span></div>
                <h1 className="font-display text-6xl tracking-tight">{k.client}</h1>
                <p className="text-sm text-rfin-mute">{k.subject}</p>
              </header>
              <Stepper steps={P.caseStages.map((s) => s.label)} current={Math.max(0, idx)} />
              <div className="grid gap-3 sm:grid-cols-3">
                <div className="rounded-2xl border border-rfin-line/10 p-4"><p className="font-mono text-[11px] uppercase tracking-[.18em] text-rfin-mute">Value</p><p className="font-display text-3xl">{formatINR(k.value)}</p></div>
                <div className="rounded-2xl border border-rfin-line/10 p-4"><p className="font-mono text-[11px] uppercase tracking-[.18em] text-rfin-mute">SLA</p><p className="text-lg font-semibold">{done ? "Met" : k.slaDue ? `By ${dayMonth(k.slaDue)}` : "—"}</p></div>
                <div className="rounded-2xl border border-rfin-line/10 p-4"><p className="font-mono text-[11px] uppercase tracking-[.18em] text-rfin-mute">Owner</p><p className="text-sm font-semibold">{k.owner}</p><p className="text-xs text-rfin-mute">{k.nextAction ?? "Case closed"}</p></div>
              </div>
              <section className="space-y-4">
                <SectionLabel>Timeline</SectionLabel>
                <Timeline steps={[...k.timeline, ...(done ? [] : [{ at: "", label: P.caseStages[idx + 1]?.label ?? "Completion", done: false, actor: "provider" as const }])]} />
              </section>
              <SupportPanel body={`Stuck on ${k.id}? RFIN ops can see the whole case.`} onClick={() => router.push(`/support?contextType=general&contextId=${k.id}&subject=${encodeURIComponent(`Case ${k.id}`)}`)} />
            </>
          );
        }}
      </QueryView>
    </Page>
  );
}
