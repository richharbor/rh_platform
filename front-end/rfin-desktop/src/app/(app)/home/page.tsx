"use client";
import { accentAt, dateline, formatCompact, NEEDS, ORDER, type Need } from "@rfin/shared";
import { Check, FileText, Sparkles, Trophy } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useDraws, useKyc, useNotifications, useOrders, usePoints, usePortfolio, useRecommendations } from "@/lib/hooks";
import { ago } from "@/lib/time";
import { useSession } from "@/stores/session";
import { Page } from "@/components/shell";
import { useToast } from "@/components/toast";
import { ActivityRow, FocusCard, GoalTile, HeroCard, PageTitle, ProgressRing, QueryView, SectionLabel, StatusRow, SupportPanel } from "@/components/ui";

const RECOMMENDATION: Partial<Record<Need, { label: string; title: string; detail: string; href: string }>> = {
  grow_wealth: { label: "Matched for your goal", title: "AA Bond Basket · 9.2%", detail: "Indicative yield for a 2–3 year horizon. Not guaranteed.", href: "/product/corp-bond-aa" },
  protect_family: { label: "Protection, made clearer", title: "Term cover · ₹1 crore", detail: "Compare cover, exclusions and premiums before you decide.", href: "/product/term-shield" },
  need_funding: { label: "Indicative eligibility", title: "Personal loan · up to ₹25L", detail: "See your indicative rate and next steps in under two minutes.", href: "/product/personal-loan" },
  invest_surplus: { label: "Matched for your horizon", title: "Bonds · from ₹10,000", detail: "Regular income while your surplus works harder.", href: "/product/corp-bond-aa" },
  sell_asset: { label: "Private markets", title: "Sell unlisted shares", detail: "See indicative prices and buyer interest before you list.", href: "/explore" },
  save_plan: { label: "Plan ahead", title: "Family Health · ₹10L", detail: "Cover shared across the family, from ₹1,420/month.", href: "/product/family-health" },
  find_opportunity: { label: "New supply", title: "Zepto · pre-IPO", detail: "Indicative ₹520/share. Transfer restrictions apply.", href: "/explore" },
  refer_someone: { label: "Refer & earn", title: "Invite someone you trust", detail: "Track every referral from invite to reward.", href: "/rewards" },
};

/** Home — the pixel-perfect-main dashboard, wired to the session and mock API (report #41, #42). */
export default function Home() {
  const router = useRouter();
  const toast = useToast();
  const { profile, needs } = useSession();
  const goals = (needs.length ? NEEDS.filter((n) => needs.includes(n.id)) : NEEDS).slice(0, 4);
  const [focus, setFocus] = useState<Need>(goals[0]?.id ?? "grow_wealth");
  const [advisor, setAdvisor] = useState(false);
  const orders = useOrders();
  const kyc = useKyc();
  const points = usePoints();
  const draws = useDraws();
  const notes = useNotifications();
  const portfolio = usePortfolio();
  const recs = useRecommendations();
  const alert = recs.data?.alerts[0];
  const rec = RECOMMENDATION[focus] ?? RECOMMENDATION.grow_wealth!;
  const first = profile.name.split(" ")[0];
  const due = orders.data?.find((o) => o.state === "action_required" && o.action);

  const rail = (
    <>
      <SectionLabel>Applications</SectionLabel>
      <div className="space-y-3">
        <QueryView query={orders} empty={{ title: "Nothing yet", body: "Applications show up here." }}>
          {(list) =>
            list.slice(0, 4).map((o) => (
              <StatusRow key={o.id} boxed title={o.title} status={ORDER.label[o.state]} tone={ORDER.tone(o.state)} progress={(o.timeline.filter((t) => t.done).length / Math.max(o.timeline.length, 3)) * 100} onClick={() => router.push(`/order/${o.id}`)} />
            ))
          }
        </QueryView>
      </div>
      <div className="mt-auto border-t border-rfin-line/15 pt-6">
        <SectionLabel>Today&apos;s focus</SectionLabel>
        <div className="mt-3">
          {alert ? (
            <FocusCard title={alert.title} detail={alert.detail} cta="Do it now" onClick={() => router.push(alert.route)} />
          ) : due?.action ? (
            <FocusCard title={due.action.label} detail={`${due.title} · ${due.action.reason}`} cta="Do it now" onClick={() => router.push(`/order/${due.id}`)} />
          ) : (
            <FocusCard title="Review your recommendation" detail="A quick comparison can help you decide with confidence." cta="Open recommendation" onClick={() => router.push(rec.href)} />
          )}
        </div>
      </div>
    </>
  );

  return (
    <Page rail={rail}>
      <PageTitle eyebrow={dateline()} title={first ? `${first}, what are you deciding today?` : "What are you deciding today?"} lede="One home for your goals, applications and financial life. Start with what matters now." />

      <section className="rfin-rise rfin-delay-2" aria-labelledby="goal-heading">
        <div className="mb-3">
          <SectionLabel id="goal-heading">Your goals</SectionLabel>
        </div>
        <div className="grid grid-cols-2 gap-3 sm:gap-4">
          {goals.map((g, i) => (
            <GoalTile key={g.id} label={g.label} index={i + 1} accent={accentAt(i)} selected={focus === g.id} onClick={() => setFocus(g.id)} />
          ))}
        </div>
      </section>

      <div className="rfin-rise rfin-delay-3">
        <HeroCard label={rec.label} title={rec.title} detail={rec.detail} onClick={() => router.push(rec.href)} />
      </div>

      {recs.data && recs.data.alerts.length + recs.data.forYou.length > 1 ? (
        <section aria-labelledby="foryou-heading" className="space-y-3">
          <SectionLabel id="foryou-heading" action={<button type="button" aria-label="Ask the assistant" className="text-rfin-mute hover:text-rfin-red" onClick={() => router.push("/assistant")}><Sparkles className="size-4" /></button>}>For you</SectionLabel>
          <div className="grid items-start gap-3 md:grid-cols-2">
            {[...recs.data.alerts.slice(1), ...recs.data.forYou].slice(0, 4).map((x) => (
              <button key={x.id} type="button" onClick={() => router.push(x.route)} className="space-y-2 rounded-2xl border border-rfin-line/10 p-4 text-left hover:bg-rfin-text/5">
                <p className="text-sm font-semibold">{x.title}</p>
                <p className="text-[13px] text-rfin-mute">{x.detail}</p>
                <div className="flex flex-wrap gap-1.5">{x.reasons.map((r) => <span key={r} className="rounded-full bg-rfin-blue/10 px-2.5 py-1 font-mono text-[10px] uppercase tracking-wider text-rfin-blue">{r}</span>)}</div>
              </button>
            ))}
          </div>
          <p className="text-xs text-rfin-mute">{recs.data.note}</p>
        </section>
      ) : null}

      <div className="grid gap-8 xl:grid-cols-[minmax(0,1fr)_240px]">
        <section aria-labelledby="kyc-heading">
          <SectionLabel id="kyc-heading">KYC</SectionLabel>
          <div className="mt-4 space-y-3">
            <QueryView query={kyc}>
              {(items) => {
                const done = items.filter((i) => i.state === "verified").length;
                const next = items.find((i) => i.state !== "verified");
                return <StatusRow title={next ? `Next: ${next.label}` : "All verified"} status={`${done}/${items.length} done`} tone={next?.state === "action_required" ? "action" : done === items.length ? "success" : "info"} progress={(done / items.length) * 100} onClick={() => router.push("/kyc")} />;
              }}
            </QueryView>
            <QueryView query={draws}>
              {(d) =>
                d[0] ? (
                  <button type="button" onClick={() => router.push("/rewards")} className="flex w-full items-center gap-4 rounded-2xl border border-rfin-line/10 p-4 text-left hover:bg-rfin-text/5">
                    <ProgressRing value={d[0].progress} total={d[0].threshold} size={64} />
                    <div>
                      <p className="font-mono text-[11px] uppercase text-rfin-amber">Lucky draw</p>
                      <p className="font-display text-xl">{d[0].name}</p>
                      <p className="text-xs text-rfin-mute">{d[0].threshold - d[0].progress} more eligible transactions to enter</p>
                    </div>
                  </button>
                ) : null
              }
            </QueryView>
          </div>
        </section>

        <aside className="border-t border-rfin-line/15 pt-6 xl:border-l xl:border-t-0 xl:pl-7 xl:pt-0">
          <SectionLabel action={<button className="text-xs font-semibold text-rfin-red hover:underline" onClick={() => router.push("/portfolio")}>Open →</button>}>Portfolio</SectionLabel>
          <QueryView query={portfolio}>
            {(p) =>
              p.holdings.length ? (
                <>
                  <div className="mt-3 font-display text-4xl tracking-tight">{formatCompact(p.totals.indicativeValue)}</div>
                  <div className={`mt-1 text-[13px] font-medium ${p.totals.indicativeGain >= 0 ? "text-rfin-green" : "text-rfin-red"}`}>{p.totals.indicativeGain >= 0 ? "+" : "−"}{formatCompact(Math.abs(p.totals.indicativeGain))} · indicative</div>
                  <div className="mt-5 flex h-2 overflow-hidden rounded-full bg-rfin-text/10">
                    {p.sectors.map((s, i) => <div key={s.sector} className={["bg-rfin-green", "bg-rfin-blue", "bg-rfin-amber", "bg-rfin-red"][i % 4]} style={{ width: `${s.pct}%` }} />)}
                  </div>
                  <div className="mt-2 flex flex-wrap justify-between gap-x-3 text-[11px] text-rfin-mute">{p.sectors.slice(0, 3).map((s) => <span key={s.sector}>{s.sector.split(" ")[0]} {s.pct}%</span>)}</div>
                </>
              ) : (
                <p className="mt-3 text-[13px] text-rfin-mute">No holdings yet. <button className="font-semibold text-rfin-red hover:underline" onClick={() => router.push("/markets")}>Explore private markets →</button></p>
              )
            }
          </QueryView>
          <div className="mt-8">
            <SectionLabel>RFIN Points</SectionLabel>
            <QueryView query={points}>
              {(ledger) => (
                <div className="mt-3 flex items-end justify-between">
                  <div className="font-display text-4xl tracking-tight">{ledger.reduce((s, e) => s + e.points, 0).toLocaleString("en-IN")}</div>
                  <span className="text-[13px] text-rfin-mute">{ledger.some((e) => e.state === "locked") ? "Locked" : "Ready"}</span>
                </div>
              )}
            </QueryView>
          </div>
        </aside>
      </div>

      <div className="grid gap-8 border-t border-rfin-line/15 pt-7 md:grid-cols-2">
        <section aria-labelledby="activity-heading">
          <SectionLabel id="activity-heading" action={<button className="text-xs font-semibold text-rfin-red hover:underline" onClick={() => router.push("/notifications")}>All →</button>}>Recent activity</SectionLabel>
          <div className="mt-4 space-y-4">
            <QueryView query={notes} empty={{ title: "Nothing yet" }}>
              {(d) =>
                d.items.slice(0, 3).map((n) => (
                  <button key={n.id} type="button" onClick={() => n.route && router.push(n.route)} className="block w-full text-left">
                    <ActivityRow icon={n.category === "rewards" ? <Trophy className="size-4" /> : n.category === "kyc" ? <FileText className="size-4" /> : <Check className="size-4" />} tone={n.tone} title={n.title} detail={`${ago(n.at)} · ${n.body}`} />
                  </button>
                ))
              }
            </QueryView>
          </div>
        </section>
        <SupportPanel
          body="A human advisor can help you understand your options before you decide."
          onClick={() => router.push("/support")}
        />
      </div>
    </Page>
  );
}
