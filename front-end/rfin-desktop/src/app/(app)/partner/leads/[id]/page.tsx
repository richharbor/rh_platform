"use client";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { formatINR, LEAD, needLabel, type LeadState } from "@rfin/shared";
import { useParams, useRouter } from "next/navigation";
import { useState } from "react";
import { api, track } from "@/lib/api";
import { useLead } from "@/lib/hooks";
import { ago } from "@/lib/time";
import { BackLink, Page } from "@/components/shell";
import { useToast } from "@/components/toast";
import { Button, Field, FocusCard, QueryView, SectionLabel, StatusCode } from "@/components/ui";

const VERB: Partial<Record<LeadState, string>> = { contacted: "Mark contacted", qualified: "Mark qualified", processing: "Open case", lost: "Mark lost" };

/** Lead detail — next action and only allowed moves (report #84). */
export default function LeadDetail() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const qc = useQueryClient();
  const toast = useToast();
  const lead = useLead(id);
  const [note, setNote] = useState("");
  const update = useMutation({
    mutationFn: (patch: { state?: LeadState; note?: string }) => api("leads.update", { id, ...patch }),
    onSuccess: (l, v) => {
      if (v.state === "qualified") track("lead_qualified");
      if (v.state === "processing") track("case_created");
      qc.setQueryData(["lead", id], l);
      for (const k of ["leads", "clients", "cases"]) qc.invalidateQueries({ queryKey: [k] });
      setNote("");
    },
    onError: (e: Error) => toast(e.message, "danger"),
  });

  const rail = lead.data ? (
    <>
      <SectionLabel>Notes</SectionLabel>
      <form className="space-y-2" onSubmit={(e) => { e.preventDefault(); if (note.trim()) update.mutate({ note: note.trim() }); }}>
        <Field label="Add a note" value={note} onChange={(e) => setNote(e.target.value)} placeholder="Called — wants 100 shares" />
        <Button type="submit" variant="outline" disabled={!note.trim()}>Save note</Button>
      </form>
      <div className="space-y-3">
        {[...lead.data.notes].reverse().map((n, i) => (
          <div key={i}><p className="text-sm">{n.text}</p><p className="text-xs text-rfin-mute">{ago(n.at)}</p></div>
        ))}
      </div>
    </>
  ) : null;

  return (
    <Page rail={rail} back={<BackLink href="/partner/leads" label="Leads" />}>
      <QueryView query={lead}>
        {(l) => (
          <>
            <header className="space-y-3">
              <StatusCode label={LEAD.label[l.state]} tone={LEAD.tone(l.state)} />
              <h1 className="font-display text-6xl tracking-tight">{l.client}</h1>
              <p className="text-sm text-rfin-mute">{[needLabel(l.need), l.city, l.segment, l.phone ? `+91 ${l.phone}` : null].filter(Boolean).join(" · ")}</p>
            </header>
            <div className="rounded-2xl border border-rfin-line/10 p-5">
              <p className="font-mono text-[11px] uppercase tracking-[.18em] text-rfin-mute">Potential</p>
              <p className="font-display text-5xl">{formatINR(l.potential)}</p>
              {l.quantity ? <p className="text-xs text-rfin-mute">{l.quantity} shares</p> : null}
            </div>
            <FocusCard title={l.nextAction} detail="Next action on this lead." cta={l.caseId ? "Open case" : "Add a note"} onClick={() => (l.caseId ? router.push(`/partner/cases/${l.caseId}`) : undefined)} />
            {l.allowedNext.filter((s) => s !== "converted").length ? (
              <div className="flex flex-wrap gap-2">
                {l.allowedNext.filter((s) => s !== "converted").map((s) => (
                  <Button key={s} variant={s === "lost" ? "outline" : "ink"} loading={update.isPending && update.variables?.state === s} onClick={() => update.mutate({ state: s })}>{VERB[s] ?? s}</Button>
                ))}
              </div>
            ) : null}
            {l.documents.length ? <section className="space-y-2"><SectionLabel>Documents</SectionLabel>{l.documents.map((d) => <p key={d} className="text-sm text-rfin-mute">• {d}</p>)}</section> : null}
          </>
        )}
      </QueryView>
    </Page>
  );
}
