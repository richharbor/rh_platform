"use client";
import { useMutation } from "@tanstack/react-query";
import { formatINR } from "@rfin/shared";
import { useParams, useRouter } from "next/navigation";
import { useState } from "react";
import { api } from "@/lib/api";
import { useProduct } from "@/lib/hooks";
import { BackLink, Page } from "@/components/shell";
import { Button, Field, IndicativeBadge, PageTitle, StatusCode } from "@/components/ui";

const digits = (s: string) => s.replace(/\D/g, "").slice(0, 9);
const grouped = (s: string) => (s ? Number(s).toLocaleString("en-IN") : "");

/** Always labelled indicative until the provider confirms (report #27). */
export default function Eligibility() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const product = useProduct(id);
  const isLoan = product.data?.category === "loans";
  const [income, setIncome] = useState("");
  const [amount, setAmount] = useState("");
  const check = useMutation({
    mutationFn: () => api("eligibility.check", { productId: id, monthlyIncome: Number(income), amount: amount ? Number(amount) * 100 : undefined }),
  });
  const r = check.data;
  const ready = Number(income) > 0 && (!isLoan || Number(amount) > 0);

  return (
    <Page back={<BackLink href={`/product/${id}`} label={product.data?.name ?? "Product"} />}>
      <PageTitle eyebrow={product.data?.name ?? "Eligibility"} title="Are you eligible?" lede="Two numbers and we'll give you an indicative answer. Nothing is shared with a lender yet." />
      <form
        className="grid gap-5 sm:grid-cols-2"
        onSubmit={(e) => {
          e.preventDefault();
          if (ready) check.mutate();
        }}
      >
        <Field label="Monthly take-home income · ₹" value={grouped(income)} onChange={(e) => { setIncome(digits(e.target.value)); check.reset(); }} inputMode="numeric" placeholder="75,000" why="Lenders and insurers size what they offer to your income." />
        {isLoan ? <Field label="How much do you need · ₹" value={grouped(amount)} onChange={(e) => { setAmount(digits(e.target.value)); check.reset(); }} inputMode="numeric" placeholder="5,00,000" why="You can change this before you apply." /> : null}
        <div className="sm:col-span-2">
          {r?.eligible ? (
            <Button onClick={() => router.push(`/txn/${id}${amount ? `?amount=${Number(amount) * 100}` : ""}`)}>Apply now ↗</Button>
          ) : (
            <Button type="submit" disabled={!ready} loading={check.isPending}>
              {r ? "Check again" : "Check eligibility"}
            </Button>
          )}
        </div>
      </form>
      {check.isError ? <p className="text-xs text-rfin-red">{check.error.message}</p> : null}
      {r ? (
        <div className="rfin-rise space-y-3 rounded-2xl border border-rfin-line/10 p-5">
          <div className="flex items-center justify-between">
            <StatusCode label={r.eligible ? "Likely eligible" : "Not eligible yet"} tone={r.eligible ? "success" : "action"} />
            <IndicativeBadge label={r.kind === "confirmed" ? "Confirmed by provider" : "Indicative"} />
          </div>
          {r.maxAmount ? (
            <div>
              <p className="font-mono text-[11px] uppercase tracking-[.18em] text-rfin-mute">Up to</p>
              <p className="font-display text-5xl">{formatINR(r.maxAmount)}</p>
            </div>
          ) : null}
          {r.rate ? <p className="text-sm font-semibold">Indicative rate · {r.rate}</p> : null}
          {r.reasons.map((x) => (
            <p key={x} className="text-sm text-rfin-mute">
              • {x}
            </p>
          ))}
          <p className="text-xs text-rfin-mute">This is RFIN&apos;s estimate. The provider confirms eligibility after checking your documents.</p>
        </div>
      ) : null}
    </Page>
  );
}
