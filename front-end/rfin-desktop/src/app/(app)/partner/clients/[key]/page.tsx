"use client";
import { formatCompact, formatINR, LEAD, needLabel } from "@rfin/shared";
import { useParams, useRouter } from "next/navigation";
import { useClient } from "@/lib/hooks";
import { BackLink, Page } from "@/components/shell";
import { FocusCard, QueryView, SectionLabel, StatusCode } from "@/components/ui";

/** Client 360 (report #85). */
export default function Client360() {
  const { key } = useParams<{ key: string }>();
  const router = useRouter();
  const client = useClient(key);
  return (
    <Page back={<BackLink href="/partner/clients" label="Clients" />}>
      <QueryView query={client}>
        {(c) => (
          <>
            <header className="space-y-2">
              <p className="font-mono text-[11px] uppercase tracking-[.2em] text-rfin-red">Client 360</p>
              <h1 className="font-display text-6xl tracking-tight">{c.name}</h1>
              <p className="text-sm text-rfin-mute">{[c.segment, c.city, c.phone ? `+91 ${c.phone}` : null].filter(Boolean).join(" · ")}</p>
            </header>
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="rounded-2xl border border-rfin-line/10 p-4"><p className="font-mono text-[11px] uppercase tracking-[.18em] text-rfin-mute">Open value</p><p className="font-display text-3xl">{formatCompact(c.openValue)}</p></div>
              <div className="rounded-2xl border border-rfin-line/10 p-4"><p className="font-mono text-[11px] uppercase tracking-[.18em] text-rfin-mute">Needs</p><p className="text-sm font-semibold">{c.needs.map(needLabel).join(", ")}</p></div>
            </div>
            <FocusCard title={c.nextAction} detail="Next best action for this client." cta="Open latest lead" onClick={() => router.push(`/partner/leads/${c.leads[c.leads.length - 1].id}`)} />
            <section className="space-y-3">
              <SectionLabel>Leads</SectionLabel>
              <div className="divide-y divide-rfin-line/10 rounded-2xl border border-rfin-line/10">
                {c.leads.map((l) => (
                  <button key={l.id} type="button" onClick={() => router.push(`/partner/leads/${l.id}`)} className="flex w-full items-center justify-between gap-4 p-4 text-left hover:bg-rfin-text/5">
                    <div><p className="text-sm font-semibold">{needLabel(l.need)}</p><p className="text-xs text-rfin-mute">{l.nextAction}</p></div>
                    <div className="text-right"><p className="font-display text-xl">{formatINR(l.potential)}</p><StatusCode label={LEAD.label[l.state]} tone={LEAD.tone(l.state)} small /></div>
                  </button>
                ))}
              </div>
            </section>
            {c.cases?.length ? (
              <section className="space-y-3">
                <SectionLabel>Cases</SectionLabel>
                {c.cases.map((k) => (
                  <button key={k.id} type="button" onClick={() => router.push(`/partner/cases/${k.id}`)} className="flex w-full items-center justify-between rounded-2xl border border-rfin-line/10 p-4 text-left hover:bg-rfin-text/5">
                    <span className="text-sm font-semibold">{k.id} · {k.subject}</span>
                    <StatusCode label={k.stageLabel} tone={k.stage === "completed" ? "success" : "pending"} />
                  </button>
                ))}
              </section>
            ) : null}
          </>
        )}
      </QueryView>
    </Page>
  );
}
