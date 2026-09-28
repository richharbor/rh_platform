"use client";
import { LUCKY_DRAW } from "@rfin/shared";
import { useParams } from "next/navigation";
import { cn } from "@/lib/cn";
import { useDraw } from "@/lib/hooks";
import { shortDate } from "@/lib/markets";
import { BackLink, Page } from "@/components/shell";
import { Disclosure, ProgressRing, QueryView, SectionLabel, StatusCode } from "@/components/ui";

/** Campaign detail, rules, entry and result (report #62–#64). */
export default function DrawDetail() {
  const { id } = useParams<{ id: string }>();
  const draw = useDraw(id);
  return (
    <Page back={<BackLink href="/rewards" label="Rewards" />}>
      <QueryView query={draw}>
        {(d) => {
          const left = Math.max(0, d.threshold - d.progress);
          const mine = d.results?.winners.find((w) => w.entryId === d.entryId);
          return (
            <>
              <StatusCode label={LUCKY_DRAW.label[d.state]} tone={LUCKY_DRAW.tone(d.state)} />
              <h1 className="font-display text-6xl tracking-tight">{d.name}</h1>
              <div className="flex items-center gap-6">
                <ProgressRing value={d.progress} total={d.threshold} size={110} />
                <div className="space-y-1">
                  <p className="text-sm font-semibold">{d.results ? "Draw complete" : left ? `${left} more eligible transaction${left > 1 ? "s" : ""}` : "You're in"}</p>
                  <p className="text-[13px] text-rfin-mute">Draw on {shortDate(d.drawDate)}</p>
                  {d.entryId ? <p className="font-mono text-xs">ENTRY · {d.entryId}</p> : null}
                </div>
              </div>
              <div className="rounded-2xl border border-rfin-line/10 p-4"><p className="font-mono text-[11px] uppercase tracking-[.18em] text-rfin-mute">Prize</p><p className="font-display text-3xl">{d.prize}</p></div>
              {d.results ? (
                <section className="space-y-3">
                  <SectionLabel>Result</SectionLabel>
                  <p className={cn("text-sm font-semibold", mine && "text-rfin-green")}>{mine ? `You won: ${mine.prize}` : d.entryId ? "Your entry wasn't picked this time." : "You didn't enter this draw."}</p>
                  <div className="divide-y divide-rfin-line/10 rounded-2xl border border-rfin-line/10">{d.results.winners.map((w) => <div key={w.entryId} className="flex justify-between p-3"><span className="font-mono text-xs">{w.entryId}</span><span className="text-[13px] text-rfin-mute">{w.prize}</span></div>)}</div>
                </section>
              ) : null}
              <Disclosure title="Rules" items={[d.terms, "Only confirmed transactions count; cancelled or reversed ones don't.", "No purchase of a product is required solely to enter."]} />
            </>
          );
        }}
      </QueryView>
    </Page>
  );
}
