"use client";
import { can, formatCompact, formatINR, type Company } from "@rfin/shared";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { leadPrice, signed } from "@/lib/markets";
import { useCompanies, usePortfolio, useWatchlist } from "@/lib/hooks";
import { useSession } from "@/stores/session";
import { Page } from "@/components/shell";
import { Card, Chips, Field, IndicativeBadge, PageTitle, PRICE_KIND_LABEL, QueryView, SectionLabel, StatusCode } from "@/components/ui";

function CompanyTile({ c, onClick }: { c: Company; onClick: () => void }) {
  const p = leadPrice(c);
  return (
    <Card onClick={onClick} className="space-y-1.5">
      <div className="flex items-center justify-between">
        <span className="font-mono text-[11px] uppercase tracking-[.18em] text-rfin-mute">{c.sector}</span>
        {c.isNewSupply ? <StatusCode label="New supply" tone="info" /> : !c.available ? <StatusCode label="No supply now" tone="neutral" /> : null}
      </div>
      <p className="font-display text-2xl">{c.name}</p>
      <p className="line-clamp-1 text-[13px] text-rfin-mute">{c.summary}</p>
      {p ? (
        <div className="flex items-center justify-between pt-1">
          <span className="font-display text-2xl">{formatINR(p.perShare)}</span>
          <IndicativeBadge label={PRICE_KIND_LABEL[p.kind]} />
        </div>
      ) : null}
    </Card>
  );
}

/** Private-market home: Discover → Understand → Transact → Manage (report #91). */
export default function Markets() {
  const router = useRouter();
  const roles = useSession((s) => s.roles);
  const [q, setQ] = useState("");
  const [theme, setTheme] = useState("all");
  const companies = useCompanies({ q: q || undefined });
  const watch = useWatchlist();
  const portfolio = usePortfolio();
  const themes = [...new Set((companies.data ?? []).flatMap((c) => c.themes))];

  const rail = (
    <>
      <SectionLabel>Your holdings</SectionLabel>
      <QueryView query={portfolio}>
        {(p) =>
          p.holdings.length ? (
            <button type="button" onClick={() => router.push("/portfolio")} className="w-full rounded-2xl border border-rfin-line/10 p-4 text-left hover:bg-rfin-text/5">
              <p className="font-mono text-[11px] uppercase tracking-[.18em] text-rfin-mute">Indicative value</p>
              <p className="font-display text-4xl">{formatCompact(p.totals.indicativeValue)}</p>
              <p className="text-[13px] text-rfin-mute">{signed(p.totals.indicativeGain, formatCompact)} indicative · {p.holdings.length} companies →</p>
            </button>
          ) : (
            <p className="text-sm text-rfin-mute">No holdings yet.</p>
          )
        }
      </QueryView>
      <SectionLabel>Watchlist</SectionLabel>
      <QueryView query={watch} empty={{ title: "Nothing watched", body: "Star a company to follow it." }}>
        {(list) => (
          <div className="space-y-2">
            {list.map((c) => (
              <button key={c.id} type="button" onClick={() => router.push(`/company/${c.id}`)} className="flex w-full items-center justify-between rounded-xl px-3 py-2 text-left hover:bg-rfin-text/5">
                <span className="text-sm font-semibold">{c.name}</span>
                <span className="font-mono text-xs">{leadPrice(c) ? formatINR(leadPrice(c)!.perShare) : ""}</span>
              </button>
            ))}
          </div>
        )}
      </QueryView>
      {!can(roles, "private_markets", "sell") ? <p className="mt-auto text-xs text-rfin-mute">Holding shares elsewhere? Add the Seller role in Profile to list them.</p> : null}
    </>
  );

  return (
    <Page rail={rail}>
      <PageTitle eyebrow="Private markets" title="Before the IPO." lede="Research unlisted companies, buy in lots, and sell with approvals handled for you." />
      <Field label="Search" value={q} onChange={(e) => setQ(e.target.value)} placeholder="NSE, fintech, pre-IPO…" />
      <Chips value={theme} onChange={setTheme} items={[{ id: "all", label: "All" }, { id: "new", label: "New supply" }, ...themes.map((t) => ({ id: t, label: t }))]} />
      <QueryView query={companies} empty={{ title: "No companies match" }}>
        {(list) => {
          const shown = list.filter((c) => theme === "all" || (theme === "new" ? c.isNewSupply : c.themes.includes(theme)));
          return <div className="grid gap-3 md:grid-cols-2">{shown.map((c) => <CompanyTile key={c.id} c={c} onClick={() => router.push(`/company/${c.id}`)} />)}</div>;
        }}
      </QueryView>
    </Page>
  );
}
