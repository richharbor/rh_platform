"use client";
import { useMutation } from "@tanstack/react-query";
import { dayMonth } from "@rfin/shared/greeting";
import { formatINR } from "@rfin/shared";
import { BookOpen, CalendarDays, Sparkles } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { api } from "@/lib/api";
import { useAlerts, useC360Invalidate, useContent } from "@/lib/hooks";
import { Page } from "@/components/shell";
import { ActivityRow, Button, Card, Chips, PageTitle, QueryView, SectionLabel, StatusCode } from "@/components/ui";

const KIND = { price_above: "Price above", price_below: "Price below", new_supply: "New supply" } as Record<string, string>;

/** Research feed, education, events and your alerts (report #94) — decision-oriented, not social. */
export default function Research() {
  const router = useRouter();
  const content = useContent();
  const alerts = useAlerts();
  const refresh = useC360Invalidate();
  const [tab, setTab] = useState<"research" | "learn" | "events" | "alerts">("research");
  const remove = useMutation({ mutationFn: (id: number) => api("alerts.remove", { id }), onSuccess: refresh });
  const rail = (
    <>
      <SectionLabel>Ask</SectionLabel>
      <button type="button" onClick={() => router.push("/assistant")} className="block w-full text-left">
        <ActivityRow icon={<Sparkles className="size-4" />} title="Ask the RFIN Assistant" detail="Questions about a company, a term or your holdings" tone="success" />
      </button>
    </>
  );
  return (
    <Page rail={rail}>
      <PageTitle eyebrow="Private markets" title="Know before you act." lede="Research notes, short explainers, events — and the alerts you've set." />
      <Chips value={tab} onChange={setTab} items={[{ id: "research", label: "Research" }, { id: "learn", label: "Learn" }, { id: "events", label: "Events" }, { id: "alerts", label: "My alerts", count: alerts.data?.filter((a) => a.active).length }]} />
      {tab !== "alerts" ? (
        <QueryView query={content}>
          {(c) => (
            <div className="grid gap-3 md:grid-cols-2">
              {tab === "research" ? c.research.map((r) => (
                <Card key={r.id} onClick={() => router.push(`/company/${r.companyId}`)} className="space-y-2">
                  <p className="font-mono text-[11px] uppercase tracking-[.18em] text-rfin-mute">{r.kind} · {r.minutes} min</p>
                  <p className="font-display text-2xl">{r.title}</p>
                  <p className="text-sm text-rfin-mute">{r.summary}</p>
                  <ul className="list-disc space-y-1 pl-4 text-xs">{r.points.map((p) => <li key={p}>{p}</li>)}</ul>
                </Card>
              )) : null}
              {tab === "learn" ? c.education.map((e) => <ActivityRow key={e.id} icon={<BookOpen className="size-4" />} tone="info" title={e.title} detail={`${e.minutes} min · ${e.summary}`} />) : null}
              {tab === "events" ? c.events.map((e) => <ActivityRow key={e.id} icon={<CalendarDays className="size-4" />} tone="pending" title={e.title} detail={`${dayMonth(e.date)} · ${e.format} · ${e.host}`} />) : null}
            </div>
          )}
        </QueryView>
      ) : (
        <QueryView query={alerts} empty={{ title: "No alerts yet", body: "Open a company and use the bell to set one.", action: { label: "Browse companies", onClick: () => router.push("/markets") } }}>
          {(list) => (
            <div className="grid gap-3 md:grid-cols-2">
              {list.map((a) => (
                <Card key={a.id} className="space-y-2">
                  <div className="flex items-center justify-between gap-2"><p className="font-semibold">{a.companyName}</p><StatusCode label={a.active ? "Watching" : "Fired"} tone={a.active ? "pending" : "success"} small /></div>
                  <p className="text-xs text-rfin-mute">{KIND[a.kind] ?? a.kind}{a.threshold ? ` ${formatINR(a.threshold)}` : ""}{a.triggeredAt ? ` · fired ${dayMonth(a.triggeredAt)}` : ""}</p>
                  <div className="flex gap-2"><Button variant="outline" onClick={() => router.push(`/company/${a.companyId}`)}>Open company</Button><Button variant="link" onClick={() => remove.mutate(a.id)}>Delete</Button></div>
                </Card>
              ))}
            </div>
          )}
        </QueryView>
      )}
    </Page>
  );
}
