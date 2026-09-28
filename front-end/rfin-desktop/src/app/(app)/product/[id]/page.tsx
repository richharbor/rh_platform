"use client";
import { can } from "@rfin/shared";
import { Check } from "lucide-react";
import { useParams, useRouter } from "next/navigation";
import { useEffect } from "react";
import { track } from "@/lib/api";
import { useProduct, useProducts } from "@/lib/hooks";
import { useSession } from "@/stores/session";
import { BackLink, Page } from "@/components/shell";
import { Button, Disclosure, QueryView, SectionLabel, TrustBanner } from "@/components/ui";

const CATEGORY = { insurance: "Protect", loans: "Borrow", investments: "Invest", private_markets: "Private markets" } as const;

/** Five questions in order (report #25); risk above any reward (report #10). */
export default function ProductDetail() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const roles = useSession((s) => s.roles);
  const product = useProduct(id);
  const siblings = useProducts({ category: product.data?.category });
  useEffect(() => track("product_viewed", { id }), [id]);

  const p = product.data;
  const needsEligibility = p?.category === "loans" || p?.category === "insurance";
  const others = (siblings.data ?? []).filter((x) => x.id !== id);
  const canApply = can(roles, "applications", "create");

  const rail = p ? (
    <>
      <SectionLabel>At a glance</SectionLabel>
      <div className="space-y-3">
        {p.costs.map((c) => (
          <div key={c.label} className="rounded-2xl border border-rfin-line/10 p-4">
            <p className="font-mono text-[11px] uppercase tracking-[.18em] text-rfin-mute">{c.label}</p>
            <p className="mt-1 font-display text-2xl">{c.value}</p>
          </div>
        ))}
      </div>
      <div className="mt-auto space-y-3 border-t border-rfin-line/15 pt-6">
        {p.transactable && canApply ? (
          <Button block onClick={() => { track(needsEligibility ? "eligibility_started" : "application_started", { id }); router.push(needsEligibility ? `/eligibility/${id}` : `/txn/${id}`); }}>
            {needsEligibility ? "Check eligibility" : "Continue"} <span aria-hidden>↗</span>
          </Button>
        ) : (
          <p className="text-xs text-rfin-mute">Applying isn&apos;t available for your role.</p>
        )}
        {needsEligibility ? <p className="text-center text-xs text-rfin-mute">Checking eligibility doesn&apos;t affect your credit score.</p> : null}
      </div>
    </>
  ) : null;

  return (
    <Page rail={rail} back={<BackLink href="/explore" label="Discover" />}>
      <QueryView query={product}>
        {(p) => (
          <>
            <header className="rfin-rise rfin-delay-1">
              <div className="font-mono text-[11px] uppercase tracking-[.2em] text-rfin-red">
                {CATEGORY[p.category]} · {p.provider}
              </div>
              <h1 className="mt-2 font-display text-5xl leading-[.92] tracking-tight sm:text-6xl">{p.name}</h1>
              <p className="mt-4 max-w-xl text-sm leading-relaxed text-rfin-mute">{p.tagline}</p>
            </header>

            <section className="space-y-3">
              <SectionLabel>01 · Who it&apos;s for</SectionLabel>
              <p className="text-[15px]">{p.whoFor}</p>
            </section>

            <section className="space-y-3">
              <SectionLabel>02 · What it costs</SectionLabel>
              <div className="divide-y divide-rfin-line/10 rounded-2xl border border-rfin-line/10">
                {p.costs.map((c) => (
                  <div key={c.label} className="flex justify-between p-4">
                    <span className="text-[13px] text-rfin-mute">{c.label}</span>
                    <span className="text-sm font-semibold">{c.value}</span>
                  </div>
                ))}
              </div>
            </section>

            <section className="space-y-3">
              <SectionLabel>03 · What you&apos;ll need</SectionLabel>
              {p.requirements.map((r) => (
                <div key={r} className="flex items-center gap-2.5 text-[15px]">
                  <Check className="size-4 text-rfin-green" aria-hidden /> {r}
                </div>
              ))}
              <p className="text-xs text-rfin-mute">We&apos;ll only ask for these when you apply, and tell you why each one is needed.</p>
            </section>

            <section className="space-y-3">
              <SectionLabel>04 · Risks &amp; limitations</SectionLabel>
              <Disclosure title="Read before you decide" items={p.risks} />
            </section>

            <section className="space-y-3">
              <SectionLabel>05 · What happens next</SectionLabel>
              {p.whatNext.map((w, i) => (
                <div key={w} className="flex gap-3 text-[15px]">
                  <span className="w-5 font-mono text-[11px] leading-6 text-rfin-mute">{String(i + 1).padStart(2, "0")}</span>
                  {w}
                </div>
              ))}
            </section>

            {others.length && can(roles, "products", "compare") ? (
              <section className="space-y-3">
                <SectionLabel>Compare</SectionLabel>
                <p className="text-sm text-rfin-mute">
                  See {p.name} side by side with {others.length} similar option{others.length > 1 ? "s" : ""}.
                </p>
                <Button variant="outline" onClick={() => { track("compare_started"); router.push(`/compare?ids=${[p.id, ...others.map((o) => o.id)].join(",")}`); }}>
                  Compare options
                </Button>
              </section>
            ) : null}

            {/* Rail holds the CTA on xl; below that, show it inline. */}
            <div className="xl:hidden">
              {p.transactable && canApply ? (
                <Button block onClick={() => router.push(needsEligibility ? `/eligibility/${id}` : `/txn/${id}`)}>
                  {needsEligibility ? "Check eligibility" : "Continue"} <span aria-hidden>↗</span>
                </Button>
              ) : null}
            </div>

            <TrustBanner>Earn RFIN Points on your first eligible transaction. Points never change the product&apos;s terms or risk.</TrustBanner>
          </>
        )}
      </QueryView>
    </Page>
  );
}
