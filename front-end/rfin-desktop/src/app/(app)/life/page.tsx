"use client";
import { formatCompact, formatINR } from "@rfin/shared";
import { Briefcase, HeartPulse, Landmark, TrendingUp, Users } from "lucide-react";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/cn";
import { useLife } from "@/lib/hooks";
import { Page } from "@/components/shell";
import { ActivityRow, Button, IndicativeBadge, PageTitle, ProgressBar, QueryView, SectionLabel, TONE_SOFT } from "@/components/ui";

/** My Financial Life (report #45) with portfolio intelligence (Phase 3). */
export default function Life() {
  const router = useRouter();
  const life = useLife();
  const rail = (
    <QueryView query={life}>
      {(l) => (
        <>
          <SectionLabel action={<button type="button" className="text-xs font-semibold text-rfin-red hover:underline" onClick={() => router.push("/goals")}>All →</button>}>Goals</SectionLabel>
          <div className="space-y-3">
            {l.goals.filter((g) => g.state !== "archived").map((g) => (
              <button key={g.id} type="button" onClick={() => router.push(`/goals/${g.id}`)} className="w-full space-y-2 rounded-2xl border border-rfin-line/10 p-4 text-left hover:bg-rfin-text/5">
                <div className="flex justify-between gap-2"><span className="text-sm font-semibold">{g.title}</span><span className={cn("font-mono text-[10px]", g.onTrack ? "text-rfin-green" : "text-rfin-red")}>{g.onTrack ? "ON TRACK" : "BEHIND"}</span></div>
                <ProgressBar value={g.pct} tone={g.onTrack ? "success" : "action"} />
                <p className="text-xs text-rfin-mute">{formatINR(g.saved)} of {formatINR(g.target)}</p>
              </button>
            ))}
            {!l.goals.length ? <Button variant="outline" onClick={() => router.push("/goals")}>Set a goal</Button> : null}
          </div>
          <div className="mt-auto border-t border-rfin-line/15 pt-6">
            <button type="button" onClick={() => router.push("/family")} className="block w-full text-left">
              <ActivityRow icon={<Users className="size-4" />} tone="pending" title={l.family.length ? l.family.map((f) => f.name).join(", ") : "Add your family"} detail={l.family.length ? `${l.family.filter((f) => !f.cover.health).length} without health cover` : "See who's covered"} />
            </button>
          </div>
        </>
      )}
    </QueryView>
  );
  return (
    <Page rail={rail}>
      <PageTitle eyebrow="Customer 360" title="Everything, in one view." lede="What you hold on RFIN and elsewhere, what protects you, what you owe, and where you're heading." />
      <QueryView query={life}>
        {(l) => (
          <>
            <div className="grid gap-3 sm:grid-cols-4">
              <div className="rounded-2xl bg-rfin-inverse p-5 text-rfin-on-inverse sm:col-span-1">
                <div className="flex items-center justify-between"><span className="font-mono text-[11px] uppercase tracking-[.18em] text-rfin-amber">Net worth</span></div>
                <p className="mt-1 font-display text-4xl">{formatCompact(l.netWorth)}</p>
                <div className="mt-2"><IndicativeBadge /></div>
              </div>
              {([["Invested", l.totals.investments], ["Cover", l.totals.cover], ["Loans", l.totals.loans]] as const).map(([k, v]) => (
                <div key={k} className="rounded-2xl border border-rfin-line/10 p-5"><p className="font-mono text-[11px] uppercase tracking-[.18em] text-rfin-mute">{k}</p><p className="mt-1 font-display text-3xl">{formatCompact(v)}</p></div>
              ))}
            </div>
            <p className="text-xs text-rfin-mute">{l.note}</p>
            {l.insights.length ? (
              <section className="space-y-3">
                <SectionLabel>Worth a look</SectionLabel>
                <div className="grid gap-3 md:grid-cols-2">
                  {l.insights.map((i) => <div key={i.title} className={cn("space-y-1 rounded-2xl p-4", TONE_SOFT[i.tone])}><p className="text-sm font-semibold">{i.title}</p><p className="text-[13px] text-rfin-mute">{i.detail}</p></div>)}
                </div>
              </section>
            ) : null}
            <section className="space-y-4">
              <SectionLabel action={<button type="button" className="text-xs font-semibold text-rfin-red hover:underline" onClick={() => router.push("/profile/financial")}>Add held elsewhere →</button>}>Holdings</SectionLabel>
              <div className="grid gap-4 md:grid-cols-2">
                {l.holdings.length ? <button type="button" onClick={() => router.push("/portfolio")} className="block text-left"><ActivityRow icon={<Briefcase className="size-4" />} tone="info" title={`Unlisted shares · ${formatCompact(l.totals.unlisted)}`} detail={`${l.holdings.map((h) => h.name).join(", ")} · indicative`} /></button> : null}
                {l.items.map((i) => (
                  <ActivityRow key={i.id} icon={i.kind === "insurance" ? <HeartPulse className="size-4" /> : i.kind === "loan" ? <Landmark className="size-4" /> : <TrendingUp className="size-4" />} tone={i.kind === "loan" ? "pending" : i.kind === "insurance" ? "success" : "info"} title={`${i.name} · ${formatINR(i.value)}`} detail={`${i.kind === "insurance" ? "Cover" : i.kind === "loan" ? "Borrowed" : "Invested"} · ${i.provider ?? ""} · ${i.source === "rfin" ? "on RFIN" : "held elsewhere"}`} />
                ))}
              </div>
              {!l.items.length && !l.holdings.length ? <p className="text-sm text-rfin-mute">Nothing yet — add what you hold elsewhere for a full picture.</p> : null}
            </section>
          </>
        )}
      </QueryView>
    </Page>
  );
}
