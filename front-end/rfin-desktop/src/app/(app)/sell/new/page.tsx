"use client";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { formatINR } from "@rfin/shared";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useState } from "react";
import { api } from "@/lib/api";
import { useCompany, usePortfolio, usePriceDiscovery } from "@/lib/hooks";
import { BackLink, Page } from "@/components/shell";
import { Button, Disclosure, Field, IndicativeBadge, PRICE_KIND_LABEL, QueryView, Stepper, TrustBanner } from "@/components/ui";

const STEPS = ["Verify holding", "Price discovery", "List"];

/** Verify Holding → Discover → List (report #93). */
function NewListing() {
  const id = useSearchParams().get("company") ?? "";
  const router = useRouter();
  const qc = useQueryClient();
  const company = useCompany(id);
  const portfolio = usePortfolio();
  const discovery = usePriceDiscovery(id);
  const [step, setStep] = useState(0);
  const [qty, setQty] = useState("");
  const [ask, setAsk] = useState("");
  const holding = portfolio.data?.holdings.find((h) => h.companyId === id);
  const free = holding ? holding.quantity - holding.reserved : 0;
  const qtyN = Number(qty);
  const askPaise = Math.round(Number(ask) * 100);
  const create = useMutation({
    mutationFn: () => api("listings.create", { companyId: id, quantity: qtyN, ask: askPaise }),
    onSuccess: (l) => {
      qc.invalidateQueries({ queryKey: ["listings"] });
      qc.invalidateQueries({ queryKey: ["portfolio"] });
      router.replace(`/sell/${l.id}`);
    },
  });

  return (
    <Page back={<BackLink href={`/company/${id}`} label={company.data?.name ?? "Company"} />}>
      <Stepper steps={STEPS} current={step} />
      {step === 0 ? (
        <>
          <h1 className="font-display text-5xl tracking-tight">Your holding.</h1>
          <QueryView query={portfolio}>
            {() =>
              holding ? (
                <div className="rounded-2xl border border-rfin-line/10 p-5">
                  <p className="font-mono text-[11px] uppercase tracking-[.18em] text-rfin-mute">{holding.name} · verified in your demat</p>
                  <p className="mt-1 font-display text-5xl">{holding.quantity} shares</p>
                  <p className="text-[13px] text-rfin-mute">{holding.reserved ? `${holding.reserved} already listed · ` : ""}{free} available · avg cost {formatINR(holding.avgCost)}</p>
                </div>
              ) : (
                <p className="text-sm text-rfin-mute">You don&apos;t hold this company on RFIN.</p>
              )
            }
          </QueryView>
          <Button disabled={!free} onClick={() => setStep(1)}>Continue</Button>
        </>
      ) : null}
      {step === 1 ? (
        <>
          <h1 className="font-display text-5xl tracking-tight">What it&apos;s worth.</h1>
          <QueryView query={discovery}>
            {(d) => (
              <>
                <div className="grid gap-3 md:grid-cols-2">
                  {d.prices.map((p) => (
                    <div key={p.kind} className="rounded-2xl border border-rfin-line/10 p-4">
                      <div className="flex justify-between"><span className="font-mono text-[11px] uppercase tracking-[.18em] text-rfin-mute">{PRICE_KIND_LABEL[p.kind]}</span><span className="text-xs text-rfin-mute">{p.asOf}</span></div>
                      <p className="mt-1 font-display text-3xl">{formatINR(p.perShare)}</p>
                    </div>
                  ))}
                </div>
                {d.bidAsk ? <p className="text-sm font-semibold">Indicative bid {formatINR(d.bidAsk.bid)} · ask {formatINR(d.bidAsk.ask)}</p> : null}
                <p className="text-sm font-semibold">{d.buyerInterest} buyers are watching this company</p>
                <p className="text-xs text-rfin-mute">{d.note}</p>
                <Disclosure title="Transfer restrictions" items={d.transferRestrictions} />
              </>
            )}
          </QueryView>
          <Button onClick={() => setStep(2)}>Set my price</Button>
        </>
      ) : null}
      {step === 2 ? (
        <form className="grid gap-5 sm:grid-cols-2" onSubmit={(e) => { e.preventDefault(); create.mutate(); }}>
          <h1 className="font-display text-5xl tracking-tight sm:col-span-2">List your shares.</h1>
          <Field label={`Shares to sell · up to ${free}`} value={qty} onChange={(e) => setQty(e.target.value.replace(/\D/g, ""))} inputMode="numeric" placeholder={String(free)} error={qtyN > free ? `You can list up to ${free}` : undefined} />
          <Field label="Asking price per share · ₹" value={ask} onChange={(e) => setAsk(e.target.value.replace(/[^\d.]/g, ""))} inputMode="decimal" placeholder={discovery.data?.bidAsk ? String(discovery.data.bidAsk.ask / 100) : "1750"} why="Pricing near the indicative ask sells faster." error={create.error?.message} />
          {qtyN > 0 && askPaise > 0 ? (
            <div className="rounded-2xl border border-rfin-line/10 p-4 sm:col-span-2">
              <div className="flex items-center justify-between"><span className="font-mono text-[11px] uppercase tracking-[.18em] text-rfin-mute">You&apos;d receive</span><IndicativeBadge label="Before approvals" /></div>
              <p className="mt-1 font-display text-4xl">{formatINR(qtyN * askPaise)}</p>
            </div>
          ) : null}
          <div className="sm:col-span-2"><TrustBanner>Shares stay in your demat until a buyer is matched and the company approves the transfer. You can cancel until then.</TrustBanner></div>
          <Button type="submit" disabled={!(qtyN > 0 && qtyN <= free && askPaise > 0)} loading={create.isPending}>List shares</Button>
        </form>
      ) : null}
    </Page>
  );
}

export default function NewListingPage() {
  return (
    <Suspense>
      <NewListing />
    </Suspense>
  );
}
