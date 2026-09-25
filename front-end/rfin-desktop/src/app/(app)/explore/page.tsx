"use client";
import { can, formatINR, type ProductCategory } from "@rfin/shared";
import { ArrowUpRight } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { track } from "@/lib/api";
import { cn } from "@/lib/cn";
import { useCompanies, useProducts } from "@/lib/hooks";
import { useSession } from "@/stores/session";
import { Page } from "@/components/shell";
import { Card, Field, IndicativeBadge, PageTitle, PRICE_KIND_LABEL, QueryView, SectionLabel, StatusCode } from "@/components/ui";

const CATS: { id: ProductCategory | "all"; label: string }[] = [
  { id: "all", label: "All" },
  { id: "insurance", label: "Protect" },
  { id: "loans", label: "Borrow" },
  { id: "investments", label: "Invest" },
  { id: "private_markets", label: "Private markets" },
];

/** Explore hub (report #21, #23, #24, #29). */
export default function Explore() {
  const router = useRouter();
  const roles = useSession((s) => s.roles);
  const [cat, setCat] = useState<(typeof CATS)[number]["id"]>("all");
  const [q, setQ] = useState("");
  const products = useProducts({ category: cat === "all" || cat === "private_markets" ? undefined : cat, q: q || undefined });
  const companies = useCompanies({ q: q || undefined });
  const showPM = can(roles, "private_markets", "view") && (cat === "all" || cat === "private_markets");

  return (
    <Page>
      <PageTitle eyebrow="Discover" title="Find what fits." lede="Protection, loans, investments and private markets — compared on what matters." />
      <div className="rfin-rise rfin-delay-2 space-y-4">
        <Field label="Search" value={q} onChange={(e) => setQ(e.target.value)} onKeyDown={(e) => e.key === "Enter" && track("search_used", { q })} placeholder="Term cover, bonds, Zepto…" />
        <div className="flex flex-wrap gap-2" role="tablist" aria-label="Category">
          {CATS.filter((c) => c.id !== "private_markets" || can(roles, "private_markets", "view")).map((c) => (
            <button
              key={c.id}
              role="tab"
              aria-selected={c.id === cat}
              onClick={() => {
                setCat(c.id);
                track("category_selected", { category: c.id });
              }}
              className={cn("rounded-full border px-4 py-2.5 text-[13px] font-semibold transition-colors", c.id === cat ? "border-rfin-inverse bg-rfin-inverse text-rfin-on-inverse" : "border-rfin-line/15 hover:bg-rfin-text/5")}
            >
              {c.label}
            </button>
          ))}
        </div>
      </div>

      {cat !== "private_markets" ? (
        <section className="space-y-4">
          <SectionLabel>Products</SectionLabel>
          <QueryView query={products} empty={{ title: "No matches", body: "Try a different search or category." }}>
            {(list) => (
              <div className="grid gap-3 md:grid-cols-2">
                {list.map((p) => (
                  <Card key={p.id} onClick={() => router.push(`/product/${p.id}`)} className="space-y-1.5">
                    <div className="flex items-center justify-between">
                      <span className="font-mono text-[11px] uppercase tracking-[.18em] text-rfin-mute">{p.provider}</span>
                      <ArrowUpRight className="size-4 text-rfin-mute" aria-hidden />
                    </div>
                    <p className="font-display text-2xl">{p.name}</p>
                    <p className="text-[13px] text-rfin-mute">{p.tagline}</p>
                    <p className="border-t border-rfin-line/10 pt-2.5 font-mono text-[11px] uppercase text-rfin-mute">
                      {p.costs[0]?.label} · {p.costs[0]?.value}
                    </p>
                  </Card>
                ))}
              </div>
            )}
          </QueryView>
        </section>
      ) : null}

      {showPM ? (
        <section className="space-y-4">
          <SectionLabel>Private markets</SectionLabel>
          <QueryView query={companies} empty={{ title: "No companies match", body: "Try another name or sector." }}>
            {(list) => (
              <div className="grid gap-3 md:grid-cols-2">
                {list.map((c) => {
                  const lead = c.prices[0];
                  return (
                    <Card key={c.id} className="space-y-1.5">
                      <div className="flex items-center justify-between">
                        <span className="font-mono text-[11px] uppercase tracking-[.18em] text-rfin-mute">{c.sector}</span>
                        {c.isNewSupply ? <StatusCode label="New supply" tone="info" /> : !c.available ? <StatusCode label="Unavailable" tone="neutral" /> : null}
                      </div>
                      <p className="font-display text-2xl">{c.name}</p>
                      {lead ? (
                        <div className="flex items-center justify-between pt-1">
                          <span className="font-display text-2xl">{formatINR(lead.perShare)}</span>
                          <IndicativeBadge label={PRICE_KIND_LABEL[lead.kind]} />
                        </div>
                      ) : null}
                      <p className="text-xs text-rfin-mute">Company pages and buy / sell open in step 5.</p>
                    </Card>
                  );
                })}
              </div>
            )}
          </QueryView>
        </section>
      ) : null}
    </Page>
  );
}
