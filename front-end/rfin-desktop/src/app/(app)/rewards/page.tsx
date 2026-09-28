"use client";
import { formatINR, GIFT_CARD, LUCKY_DRAW } from "@rfin/shared";
import { Users } from "lucide-react";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/cn";
import { useBenefits, useDraws, useReferrals, useRewardsSummary } from "@/lib/hooks";
import { shortDate } from "@/lib/markets";
import { Page } from "@/components/shell";
import { Disclosure, HeroCard, PageTitle, ProgressBar, ProgressRing, QueryView, SectionLabel, StatusCode } from "@/components/ui";

/** Rewards hub — Available now · Pending · Unlock next (report #51, #59, #69). */
export default function Rewards() {
  const router = useRouter();
  const summary = useRewardsSummary();
  const benefits = useBenefits();
  const draws = useDraws();
  const referrals = useReferrals();

  const rail = (
    <>
      <SectionLabel>Tiers</SectionLabel>
      <QueryView query={summary}>
        {(s) => (
          <div className="space-y-2">
            {s.tiers.map((t) => (
              <div key={t.id} className={cn("rounded-2xl border p-3", t.id === s.tier.id ? "border-rfin-text" : "border-rfin-line/10")}>
                <div className="flex justify-between"><span className="text-sm font-semibold">{t.name}{t.id === s.tier.id ? " · you" : ""}</span><span className="font-mono text-xs">{t.minPoints.toLocaleString("en-IN")}+</span></div>
                <p className="text-xs text-rfin-mute">{t.perks.join(" · ")}</p>
              </div>
            ))}
            <p className="text-xs text-rfin-mute">{s.note}</p>
          </div>
        )}
      </QueryView>
    </>
  );

  return (
    <Page rail={rail}>
      <PageTitle eyebrow="Rewards" title="Earned, not promised." lede="Points, benefits and draws — with the rules in plain sight." />
      <QueryView query={summary}>
        {(s) => {
          const next = s.tier.next;
          const pct = next ? ((s.points.lifetime - s.tier.minPoints) / (next.minPoints - s.tier.minPoints)) * 100 : 100;
          return (
            <button type="button" onClick={() => router.push("/rewards/points")} className="block w-full space-y-3 rounded-2xl border border-rfin-line/10 p-5 text-left hover:bg-rfin-text/5">
              <div className="flex justify-between"><span className="font-mono text-[11px] uppercase tracking-[.18em] text-rfin-mute">RFIN Points</span><StatusCode label={s.tier.name} tone="pending" /></div>
              <p className="font-display text-6xl">{s.points.available.toLocaleString("en-IN")}</p>
              <p className="text-[13px] text-rfin-mute">{s.points.locked ? `${s.points.locked.toLocaleString("en-IN")} locked · ` : ""}{s.points.lifetime.toLocaleString("en-IN")} earned in total · history →</p>
              {next ? (
                <>
                  <ProgressBar value={pct} tone="pending" thick />
                  <p className="text-xs text-rfin-mute">{next.pointsToGo.toLocaleString("en-IN")} to {next.name} · {next.perks[0]}</p>
                </>
              ) : null}
            </button>
          );
        }}
      </QueryView>

      <section className="space-y-3">
        <SectionLabel>Benefits</SectionLabel>
        <QueryView query={benefits} empty={{ title: "No benefits yet", body: "Your first eligible transaction unlocks a gift card." }}>
          {(list) => (
            <div className="grid gap-3 md:grid-cols-2">
              {list.map((b) => (
                <button key={b.id} type="button" onClick={() => router.push(`/rewards/benefit/${b.id}`)} className="space-y-1.5 rounded-2xl border border-rfin-line/10 p-4 text-left hover:bg-rfin-text/5">
                  <div className="flex justify-between"><span className="font-mono text-[11px] uppercase tracking-[.18em] text-rfin-mute">{b.issuer}</span><StatusCode label={GIFT_CARD.label[b.state]} tone={GIFT_CARD.tone(b.state)} /></div>
                  <p className="font-display text-3xl">{formatINR(b.value)}</p>
                  <p className="text-[13px] text-rfin-mute">{b.title}{b.expiresAt ? ` · valid till ${shortDate(b.expiresAt)}` : ""}</p>
                </button>
              ))}
            </div>
          )}
        </QueryView>
      </section>

      <section className="space-y-3">
        <SectionLabel>Lucky draws</SectionLabel>
        <QueryView query={draws}>
          {(list) => (
            <div className="grid gap-3 md:grid-cols-2">
              {list.map((d) => (
                <button key={d.id} type="button" onClick={() => router.push(`/rewards/draw/${d.id}`)} className="flex items-center gap-4 rounded-2xl border border-rfin-line/10 p-4 text-left hover:bg-rfin-text/5">
                  <ProgressRing value={d.progress} total={d.threshold} size={68} />
                  <div className="space-y-1"><StatusCode label={LUCKY_DRAW.label[d.state]} tone={LUCKY_DRAW.tone(d.state)} /><p className="font-display text-xl">{d.name}</p><p className="text-xs text-rfin-mute">{d.results ? "Result published" : `Draw on ${shortDate(d.drawDate)}`}</p></div>
                </button>
              ))}
            </div>
          )}
        </QueryView>
      </section>

      <QueryView query={summary}>
        {(s) => <HeroCard label="Refer & earn" title={`${formatINR(s.referral.reward)} per friend`} detail={s.referral.rule} cta="Invite" icon={<Users className="size-7 text-rfin-amber" />} onClick={() => router.push("/refer")} />}
      </QueryView>
      <QueryView query={referrals}>{(list) => (list.length ? <p className="text-sm text-rfin-mute">{list.length} referrals · {list.filter((r) => r.state === "paid").length} paid · <button className="font-semibold text-rfin-red hover:underline" onClick={() => router.push("/refer")}>track →</button></p> : null)}</QueryView>
      <Disclosure title="How rewards work" items={["Points aren't cash and can't be withdrawn", "Rewards are issued only after a transaction is confirmed", "Reversed or cancelled transactions reverse their rewards"]} />
    </Page>
  );
}
