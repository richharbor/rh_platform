"use client";
import { formatCompact, formatINR } from "@rfin/shared";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/cn";
import { useListings, usePortfolio } from "@/lib/hooks";
import { LISTING, signed } from "@/lib/markets";
import { Page } from "@/components/shell";
import { Button, Disclosure, IndicativeBadge, PageTitle, ProgressBar, QueryView, SectionLabel, StatusCode } from "@/components/ui";

/** Portfolio — indicative value and gain never presented as realised (report #45, #94). */
export default function Portfolio() {
  const router = useRouter();
  const portfolio = usePortfolio();
  const listings = useListings();

  const rail = (
    <>
      <SectionLabel>Sell listings</SectionLabel>
      <QueryView query={listings} empty={{ title: "Nothing listed", body: "Open a holding and choose Sell." }}>
        {(list) => (
          <div className="space-y-3">
            {list.map((l) => (
              <button key={l.id} type="button" onClick={() => router.push(`/sell/${l.id}`)} className="w-full rounded-2xl border border-rfin-line/10 p-4 text-left hover:bg-rfin-text/5">
                <div className="flex justify-between"><span className="font-mono text-[11px] text-rfin-mute">{l.id}</span><StatusCode label={LISTING[l.state].label} tone={LISTING[l.state].tone} small /></div>
                <p className="mt-1 text-sm font-semibold">{l.companyName} · {l.quantity} at {formatINR(l.ask)}</p>
              </button>
            ))}
          </div>
        )}
      </QueryView>
      <div className="mt-auto"><Disclosure title="Liquidity" items={["Unlisted shares can take days or weeks to sell", "Indicative prices aren't quotes", "Company approval or ROFR can block a transfer"]} /></div>
    </>
  );

  return (
    <Page rail={rail}>
      <PageTitle eyebrow="Portfolio" title="What you own." lede="Private-market holdings at indicative prices, with what you've actually realised kept separate." />
      <QueryView query={portfolio}>
        {(p) =>
          !p.holdings.length ? (
            <div className="space-y-3"><p className="text-sm text-rfin-mute">No holdings yet.</p><Button onClick={() => router.push("/markets")}>Explore private markets</Button></div>
          ) : (
            <>
              <div className="grid gap-4 sm:grid-cols-3">
                <div className="rounded-2xl border border-rfin-line/10 p-4 sm:col-span-1">
                  <div className="flex items-center justify-between"><span className="font-mono text-[11px] uppercase tracking-[.18em] text-rfin-mute">Indicative value</span><IndicativeBadge /></div>
                  <p className="mt-1 font-display text-4xl">{formatCompact(p.totals.indicativeValue)}</p>
                  <p className="text-xs text-rfin-mute">on {formatCompact(p.totals.costBasis)} invested</p>
                </div>
                <div className="rounded-2xl border border-rfin-line/10 p-4">
                  <span className="font-mono text-[11px] uppercase tracking-[.18em] text-rfin-mute">Indicative gain</span>
                  <p className={cn("mt-1 font-display text-4xl", p.totals.indicativeGain >= 0 ? "text-rfin-green" : "text-rfin-red")}>{signed(p.totals.indicativeGain, formatCompact)}</p>
                  <p className="text-xs text-rfin-mute">Not realised until you sell</p>
                </div>
                <div className="rounded-2xl border border-rfin-line/10 p-4">
                  <span className="font-mono text-[11px] uppercase tracking-[.18em] text-rfin-mute">Realised gain</span>
                  <p className="mt-1 font-display text-4xl">{signed(p.totals.realizedGain, formatCompact)}</p>
                  <p className="text-xs text-rfin-mute">From completed sales</p>
                </div>
              </div>
              <section className="space-y-3">
                <SectionLabel>Concentration</SectionLabel>
                {p.sectors.map((s) => (
                  <div key={s.sector} className="space-y-1.5">
                    <div className="flex justify-between text-sm"><span className="font-semibold">{s.sector}</span><span className="font-mono text-xs">{s.pct}%</span></div>
                    <ProgressBar value={s.pct} tone={s.pct > 60 ? "action" : "info"} />
                  </div>
                ))}
                {p.sectors[0]?.pct > 60 ? <p className="text-xs text-rfin-red">Over 60% in one sector — consider how concentrated you want to be.</p> : null}
              </section>
              <section className="space-y-3">
                <SectionLabel>Holdings</SectionLabel>
                <div className="overflow-x-auto rounded-2xl border border-rfin-line/10">
                  <table className="w-full min-w-[640px] text-left text-sm">
                    <thead><tr className="border-b border-rfin-line/10">{["Company", "Shares", "Avg cost", "Indicative", "Value", "Indicative gain", "Realised"].map((h) => <th key={h} className="p-3 font-mono text-[11px] font-normal uppercase tracking-[.12em] text-rfin-mute">{h}</th>)}</tr></thead>
                    <tbody>
                      {p.holdings.map((h) => (
                        <tr key={h.companyId} onClick={() => router.push(`/company/${h.companyId}`)} className="cursor-pointer border-b border-rfin-line/10 last:border-0 hover:bg-rfin-text/5">
                          <td className="p-3 font-semibold">{h.name}</td>
                          <td className="p-3">{h.quantity}{h.reserved ? <span className="text-xs text-rfin-mute"> · {h.reserved} listed</span> : null}</td>
                          <td className="p-3">{formatINR(h.avgCost)}</td>
                          <td className="p-3">{formatINR(h.indicativePrice)}</td>
                          <td className="p-3 font-semibold">{formatINR(h.indicativeValue)}</td>
                          <td className={cn("p-3", h.indicativeGain >= 0 ? "text-rfin-green" : "text-rfin-red")}>{signed(h.indicativeGain, formatINR)}</td>
                          <td className="p-3 text-rfin-mute">{h.realizedGain ? signed(h.realizedGain, formatINR) : "—"}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </section>
            </>
          )
        }
      </QueryView>
    </Page>
  );
}
