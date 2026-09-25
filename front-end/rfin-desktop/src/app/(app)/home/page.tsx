"use client";
import { accentAt, dateline, NEEDS, ORDER, type Need } from "@rfin/shared";
import { Check, FileText, Trophy } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useDraws, useKyc, useOrders, usePoints } from "@/lib/hooks";
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
          {due?.action ? (
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
          <SectionLabel>Portfolio</SectionLabel>
          <div className="mt-3 font-display text-4xl tracking-tight">₹8.4L</div>
          <div className="mt-1 text-[13px] font-medium text-rfin-green">+12.6% this year · indicative</div>
          <div className="mt-5 h-2 overflow-hidden rounded-full bg-rfin-text/10">
            <div className="h-full w-[56%] bg-rfin-green" />
          </div>
          <div className="mt-2 flex justify-between text-[11px] text-rfin-mute">
            <span>Equity 56%</span>
            <span>Debt 28%</span>
            <span>Cash 16%</span>
          </div>
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
          <SectionLabel id="activity-heading">Recent activity</SectionLabel>
          <div className="mt-4 space-y-4">
            <ActivityRow icon={<Trophy className="size-4" />} tone="pending" title="1,000 welcome points issued" detail="Today · Unlock with your first transaction" />
            <ActivityRow icon={<Check className="size-4" />} title="RFIN ID created" detail="Today · Mobile verified" />
            <ActivityRow icon={<FileText className="size-4" />} tone="action" title="Address proof needs a clearer photo" detail="KYC · Re-upload to continue" />
          </div>
        </section>
        <SupportPanel
          body="A human advisor can help you understand your options before you decide."
          requested={advisor}
          onClick={() => {
            setAdvisor(true);
            toast("Advisor requested", "success");
          }}
        />
      </div>
    </Page>
  );
}
