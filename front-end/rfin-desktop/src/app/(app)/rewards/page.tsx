"use client";
import { LUCKY_DRAW, REWARD } from "@rfin/shared";
import { useDraws, usePoints } from "@/lib/hooks";
import { Page } from "@/components/shell";
import { Disclosure, PageTitle, ProgressRing, QueryView, SectionLabel, StatusCode } from "@/components/ui";

/** Rewards hub (report #51–#69). Benefits, gift cards and referral arrive in step 6. */
export default function Rewards() {
  const points = usePoints();
  const draws = useDraws();
  return (
    <Page>
      <PageTitle eyebrow="Rewards" title="Earned, not promised." lede="Points, benefits and draws — with the rules in plain sight." />
      <div className="grid gap-8 md:grid-cols-2">
        <section className="space-y-3">
          <SectionLabel>RFIN Points</SectionLabel>
          <QueryView query={points} empty={{ title: "No points yet" }}>
            {(list) =>
              list.map((e) => (
                <div key={e.id} className="space-y-2 rounded-2xl border border-rfin-line/10 p-5">
                  <div className="flex justify-between">
                    <span className="text-sm font-semibold">{e.description}</span>
                    <StatusCode label={REWARD.label[e.state]} tone={REWARD.tone(e.state)} />
                  </div>
                  <p className="font-display text-5xl">{e.points.toLocaleString("en-IN")}</p>
                  <p className="text-[13px] text-rfin-mute">Unlocks on your first eligible transaction.</p>
                </div>
              ))
            }
          </QueryView>
        </section>
        <section className="space-y-3">
          <SectionLabel>Lucky draw</SectionLabel>
          <QueryView query={draws}>
            {(list) =>
              list.map((d) => (
                <div key={d.id} className="flex items-center gap-5 rounded-2xl border border-rfin-line/10 p-5">
                  <ProgressRing value={d.progress} total={d.threshold} size={84} />
                  <div className="space-y-1">
                    <StatusCode label={LUCKY_DRAW.label[d.state]} tone={LUCKY_DRAW.tone(d.state)} />
                    <p className="font-display text-2xl">{d.name}</p>
                    <p className="text-xs text-rfin-mute">{d.prize} · draw on {new Date(d.drawDate).toLocaleDateString("en-GB", { day: "numeric", month: "short" })}</p>
                  </div>
                </div>
              ))
            }
          </QueryView>
        </section>
      </div>
      <Disclosure title="How rewards work" items={["Points aren't cash and can't be withdrawn", "Rewards are issued only after a transaction is confirmed", "Reversed or cancelled transactions reverse their rewards"]} />
    </Page>
  );
}
