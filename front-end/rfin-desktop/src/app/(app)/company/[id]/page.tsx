"use client";
import { can, formatINR } from "@rfin/shared";
import { useMutation } from "@tanstack/react-query";
import { BellPlus, FileText, Star } from "lucide-react";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { api, track } from "@/lib/api";
import { cn } from "@/lib/cn";
import { useC360Invalidate, useCompany, usePortfolio, useToggleWatch, useWatchlist } from "@/lib/hooks";
import { leadPrice } from "@/lib/markets";
import { useSession } from "@/stores/session";
import { BackLink, Page } from "@/components/shell";
import { useToast } from "@/components/toast";
import { ActivityRow, Button, Chips, Dialog, Disclosure, Field, IndicativeBadge, PRICE_KIND_LABEL, QueryView, SectionLabel, StatusCode, SupportPanel } from "@/components/ui";

type Tab = "overview" | "business" | "financials" | "valuation" | "peers" | "risks" | "documents";
const TABS: { id: Tab; label: string }[] = ["overview", "business", "financials", "valuation", "peers", "risks", "documents"].map((id) => ({ id: id as Tab, label: id[0].toUpperCase() + id.slice(1) }));

/** Company research page (report #91). */
export default function CompanyPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const roles = useSession((s) => s.roles);
  const company = useCompany(id);
  const watch = useWatchlist();
  const toggle = useToggleWatch();
  const portfolio = usePortfolio();
  const [tab, setTab] = useState<Tab>("overview");
  const toast = useToast();
  const refresh = useC360Invalidate();
  const [alertOpen, setAlertOpen] = useState(false);
  const [alertKind, setAlertKind] = useState<"price_above" | "price_below" | "new_supply">("price_above");
  const [alertPrice, setAlertPrice] = useState("");
  const setAlert = useMutation({
    mutationFn: () => api("alerts.create", { companyId: id, kind: alertKind, threshold: alertKind === "new_supply" ? undefined : Number(alertPrice) * 100 }),
    onSuccess: (list) => {
      refresh();
      setAlertOpen(false);
      toast(list[0] && !list[0].active ? "Alert fired already — check notifications" : "Alert set", "success");
    },
  });
  useEffect(() => track("company_viewed", { id }), [id]);
  const watching = !!watch.data?.some((c) => c.id === id);
  const holding = portfolio.data?.holdings.find((h) => h.companyId === id);
  const c = company.data;
  const canBuy = !!c?.available && can(roles, "private_markets", "buy");
  const canSell = !!holding && holding.quantity - holding.reserved > 0 && can(roles, "private_markets", "sell");
  const lead = c ? leadPrice(c) : undefined;

  const rail = c ? (
    <>
      <SectionLabel>Price</SectionLabel>
      {lead ? (
        <div className="rounded-2xl border border-rfin-line/10 p-4">
          <p className="font-display text-4xl">{formatINR(lead.perShare)}</p>
          <div className="mt-2"><IndicativeBadge label={PRICE_KIND_LABEL[lead.kind]} /></div>
          <p className="mt-3 text-xs text-rfin-mute">Min lot {c.minLot} shares</p>
        </div>
      ) : null}
      {holding ? (
        <div className="rounded-2xl border border-rfin-line/10 bg-rfin-amber/15 p-4">
          <p className="font-mono text-[11px] uppercase tracking-[.18em] text-rfin-mute">You hold</p>
          <p className="font-display text-3xl">{holding.quantity} shares</p>
          <p className="text-xs text-rfin-mute">Avg cost {formatINR(holding.avgCost)}</p>
        </div>
      ) : null}
      <div className="mt-auto space-y-2 border-t border-rfin-line/15 pt-6">
        {canBuy ? <Button block onClick={() => { track("application_started", { id }); router.push(`/buy/${id}`); }}>Buy</Button> : null}
        {canSell ? <Button block variant="outline" onClick={() => router.push(`/sell/new?company=${id}`)}>Sell</Button> : null}
        {!canBuy && !canSell ? <p className="text-xs text-rfin-mute">{c.available ? "Your role can't trade here." : "No supply right now — add it to your watchlist to hear first."}</p> : null}
        <p className="text-center text-xs text-rfin-mute">Prices are indicative until matched.</p>
      </div>
    </>
  ) : null;

  return (
    <Page rail={rail} back={<BackLink href="/markets" label="Private markets" />}>
      <QueryView query={company}>
        {(c) => (
          <>
            <header className="rfin-rise space-y-3">
              <div className="flex items-start justify-between gap-4">
                <div className="font-mono text-[11px] uppercase tracking-[.2em] text-rfin-red">{c.sector}{c.hq ? ` · ${c.hq}` : ""}{c.founded ? ` · est. ${c.founded}` : ""}</div>
                <div className="flex gap-2">
                <button type="button" aria-label="Set an alert" onClick={() => setAlertOpen(true)} className="flex items-center gap-2 rounded-full border border-rfin-line/15 px-4 py-2 text-[13px] font-semibold hover:bg-rfin-text/5"><BellPlus className="size-4" /> Alert</button>
                <button type="button" aria-pressed={watching} aria-label={watching ? "Remove from watchlist" : "Add to watchlist"} onClick={() => { if (!watching) track("watchlist_added", { id }); toggle.mutate({ companyId: id, on: !watching }); }} className="flex items-center gap-2 rounded-full border border-rfin-line/15 px-4 py-2 text-[13px] font-semibold hover:bg-rfin-text/5">
                  <Star className={cn("size-4", watching && "fill-rfin-amber text-rfin-amber")} /> {watching ? "Watching" : "Watch"}
                </button>
                </div>
              </div>
              <h1 className="font-display text-6xl leading-[.95] tracking-tight">{c.name}</h1>
              <p className="max-w-xl text-sm leading-relaxed text-rfin-mute">{c.summary}</p>
              <div className="flex gap-3">
                {c.isNewSupply ? <StatusCode label="New supply" tone="info" /> : null}
                {!c.available ? <StatusCode label="No supply now" tone="neutral" /> : null}
              </div>
            </header>
            <Chips value={tab} onChange={setTab} items={TABS} />

            {tab === "overview" ? (
              <section className="space-y-4">
                <p className="text-[15px] leading-relaxed">{c.business?.model ?? c.summary}</p>
                <div className="flex flex-wrap gap-2">{c.themes.map((t) => <span key={t} className="rounded-full border border-rfin-line/15 px-3 py-1 text-xs font-semibold">{t}</span>)}</div>
                <Disclosure title="Before you invest" items={[c.risks[0] ?? "Unlisted shares can be hard to sell", c.transferRestrictions[0] ?? "Transfers need approval"]} />
              </section>
            ) : null}
            {tab === "business" && c.business ? (
              <section className="grid gap-6 md:grid-cols-2">
                <div className="space-y-2"><SectionLabel>Model</SectionLabel><p className="text-[15px] leading-relaxed">{c.business.model}</p></div>
                <div className="space-y-2"><SectionLabel>Edge</SectionLabel><p className="text-[15px] leading-relaxed">{c.business.moat}</p></div>
                <div className="space-y-2 md:col-span-2"><SectionLabel>Segments</SectionLabel><div className="flex flex-wrap gap-2">{c.business.segments.map((s) => <span key={s} className="rounded-2xl border border-rfin-line/10 px-4 py-2 text-sm">{s}</span>)}</div></div>
              </section>
            ) : null}
            {tab === "financials" ? (
              <section className="space-y-3">
                <SectionLabel>₹ crore</SectionLabel>
                <table className="w-full text-left text-sm">
                  <thead><tr className="border-b border-rfin-line/15">{["Year", "Revenue", "Profit", "Margin"].map((h) => <th key={h} className="py-3 font-mono text-[11px] font-normal uppercase tracking-[.18em] text-rfin-mute">{h}</th>)}</tr></thead>
                  <tbody>
                    {c.financials.map((f) => (
                      <tr key={f.year} className="border-b border-rfin-line/10">
                        <td className="py-3 font-mono text-xs">{f.year}</td>
                        <td className="py-3 font-semibold">{f.revenue.toLocaleString("en-IN")}</td>
                        <td className={cn("py-3 font-semibold", f.profit < 0 && "text-rfin-red")}>{f.profit.toLocaleString("en-IN")}</td>
                        <td className="py-3 text-rfin-mute">{f.margin}%</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                <div className="flex h-28 items-end gap-2" aria-hidden>
                  {c.financials.map((f) => {
                    const max = Math.max(...c.financials.map((x) => x.revenue));
                    return (
                      <div key={f.year} className="flex flex-1 flex-col items-center justify-end gap-1">
                        <div className="w-full rounded-t-md bg-rfin-blue" style={{ height: Math.max(4, Math.round((f.revenue / max) * 96)) }} />
                        <span className="font-mono text-[10px] text-rfin-mute">{f.year}</span>
                      </div>
                    );
                  })}
                </div>
                <p className="text-xs text-rfin-mute">Revenue by year, from company filings.</p>
              </section>
            ) : null}
            {tab === "valuation" ? (
              <section className="space-y-3">
                <p className="text-sm text-rfin-mute">These are different kinds of number — we never merge them into one &quot;price&quot;.</p>
                <div className="grid gap-3 md:grid-cols-2">
                  {c.prices.map((p) => (
                    <div key={p.kind + p.asOf} className="rounded-2xl border border-rfin-line/10 p-4">
                      <div className="flex justify-between"><span className="font-mono text-[11px] uppercase tracking-[.18em] text-rfin-mute">{PRICE_KIND_LABEL[p.kind]}</span><span className="text-xs text-rfin-mute">{p.asOf}</span></div>
                      <p className="mt-1 font-display text-3xl">{formatINR(p.perShare)}</p>
                      <p className="text-xs text-rfin-mute">{p.source}</p>
                    </div>
                  ))}
                  {c.bidAsk ? (
                    <div className="rounded-2xl border border-rfin-line/10 p-4 md:col-span-2">
                      <span className="font-mono text-[11px] uppercase tracking-[.18em] text-rfin-mute">Indicative bid / ask</span>
                      <p className="mt-1 font-display text-3xl">{formatINR(c.bidAsk.bid)} <span className="text-rfin-mute">/</span> {formatINR(c.bidAsk.ask)}</p>
                    </div>
                  ) : null}
                </div>
              </section>
            ) : null}
            {tab === "peers" ? (
              <section className="divide-y divide-rfin-line/10 rounded-2xl border border-rfin-line/10">
                {c.peers.map((p) => (
                  <div key={p.name} className="flex items-center justify-between p-4">
                    <div><p className="text-sm font-semibold">{p.name}</p><p className="text-xs text-rfin-mute">{p.listed ? "Listed" : "Private"}</p></div>
                    <span className="font-mono text-xs">{p.metric}</span>
                  </div>
                ))}
              </section>
            ) : null}
            {tab === "risks" ? (
              <section className="grid gap-4 md:grid-cols-2">
                <Disclosure title="Risks" items={c.risks} />
                <Disclosure title="Transfer restrictions" items={c.transferRestrictions} />
              </section>
            ) : null}
            {tab === "documents" ? (
              <section className="space-y-4">{c.documents.map((d) => <ActivityRow key={d.title} icon={<FileText className="size-4" />} tone="info" title={d.title} detail={d.kind.replace(/_/g, " ")} />)}</section>
            ) : null}

            <div className="space-y-2 xl:hidden">
              {canBuy ? <Button block onClick={() => router.push(`/buy/${id}`)}>Buy</Button> : null}
              {canSell ? <Button block variant="outline" onClick={() => router.push(`/sell/new?company=${id}`)}>Sell</Button> : null}
            </div>
            <SupportPanel body={`Questions about ${c.name}? An advisor can walk you through the numbers and the transfer process.`} onClick={() => router.push(`/support?contextType=company&contextId=${c.id}&subject=${encodeURIComponent(`About ${c.name}`)}`)} />
          </>
        )}
      </QueryView>
      <Dialog open={alertOpen} onClose={() => setAlertOpen(false)} title="Set an alert">
        <form className="space-y-4" onSubmit={(e) => { e.preventDefault(); setAlert.mutate(); }}>
          <Chips value={alertKind} onChange={setAlertKind} items={[{ id: "price_above", label: "Price above" }, { id: "price_below", label: "Price below" }, { id: "new_supply", label: "New supply" }]} />
          {alertKind !== "new_supply" ? <Field label="Indicative price · ₹" value={alertPrice} onChange={(e) => setAlertPrice(e.target.value.replace(/\D/g, ""))} inputMode="numeric" placeholder={lead ? String(Math.round(lead.perShare / 100)) : ""} error={setAlert.error?.message} /> : <p className="text-sm text-rfin-mute">We&apos;ll tell you when {c?.name} shares are available to buy.</p>}
          <Button type="submit" block disabled={alertKind !== "new_supply" && !(Number(alertPrice) > 0)} loading={setAlert.isPending}>Set alert</Button>
        </form>
      </Dialog>
    </Page>
  );
}
