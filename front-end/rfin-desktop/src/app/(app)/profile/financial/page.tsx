"use client";
import { useMutation } from "@tanstack/react-query";
import { formatINR, type ExternalProduct, type FinancialProfile } from "@rfin/shared";
import { useState } from "react";
import { api } from "@/lib/api";
import { useC360Invalidate, useExternal, useFinancial } from "@/lib/hooks";
import { BackLink, Page } from "@/components/shell";
import { useToast } from "@/components/toast";
import { Button, Chips, Dialog, Field, PageTitle, QueryView, SectionLabel, TrustBanner } from "@/components/ui";

const LABEL = { incomeBand: "Annual income", risk: "Risk you're comfortable with", horizon: "Investment horizon", liquidity: "How soon you might need the money" } as const;

/** Customer 360 financial profile (report #15) + products held elsewhere (report #16). */
export default function FinancialProfilePage() {
  const toast = useToast();
  const fin = useFinancial();
  const ext = useExternal();
  const refresh = useC360Invalidate();
  const [open, setOpen] = useState(false);
  const [kind, setKind] = useState<ExternalProduct["kind"]>("investment");
  const [name, setName] = useState("");
  const [value, setValue] = useState("");
  const save = useMutation({ mutationFn: (p: Partial<Omit<FinancialProfile, "options">>) => api("financial.update", p), onSuccess: () => { refresh(); toast("Saved", "success"); } });
  const add = useMutation({ mutationFn: () => api("external.add", { kind, name: name.trim(), value: Number(value) * 100 }), onSuccess: () => { refresh(); setOpen(false); setName(""); setValue(""); } });
  const remove = useMutation({ mutationFn: (id: number) => api("external.remove", { id }), onSuccess: refresh });

  const rail = (
    <>
      <SectionLabel>Held elsewhere</SectionLabel>
      <QueryView query={ext} empty={{ title: "Nothing added", body: "Funds, policies or loans outside RFIN." }}>
        {(list) => <div className="divide-y divide-rfin-line/10">{list.map((e) => <div key={e.id} className="flex items-center justify-between gap-2 py-3"><div><p className="text-sm font-semibold">{e.name}</p><p className="text-xs capitalize text-rfin-mute">{e.kind} · {formatINR(e.value)}</p></div><Button variant="link" onClick={() => remove.mutate(e.id)}>Remove</Button></div>)}</div>}
      </QueryView>
      <Button variant="outline" onClick={() => setOpen(true)}>Add a product</Button>
      <div className="mt-auto"><TrustBanner>RFIN doesn&apos;t pull data from other providers. What you add stays as you entered it.</TrustBanner></div>
    </>
  );
  return (
    <Page rail={rail} back={<BackLink href="/profile" label="Profile" />}>
      <PageTitle eyebrow="Customer 360" title="Your money, in context." lede="Ranges are enough. This only shapes what RFIN suggests — it's never shared without your consent." />
      <QueryView query={fin}>
        {(f) => (
          <div className="space-y-6">
            {(Object.keys(LABEL) as (keyof typeof LABEL)[]).map((k) => (
              <section key={k} className="space-y-2">
                <p className="font-mono text-[11px] uppercase tracking-[.18em] text-rfin-mute">{LABEL[k]}</p>
                <Chips value={(f[k] as string) ?? ""} onChange={(v) => save.mutate({ [k]: v } as never)} items={f.options[k].map((o) => ({ id: o, label: o[0].toUpperCase() + o.slice(1) }))} />
              </section>
            ))}
            <Field label="Investible surplus · ₹" defaultValue={f.investible ? String(f.investible / 100) : ""} onBlur={(e) => save.mutate({ investible: Number(e.target.value.replace(/\D/g, "")) * 100 })} inputMode="numeric" placeholder="300000" why="Money you could invest without touching your emergency fund." />
          </div>
        )}
      </QueryView>
      <Dialog open={open} onClose={() => setOpen(false)} title="Add a product">
        <form className="space-y-4" onSubmit={(e) => { e.preventDefault(); add.mutate(); }}>
          <Chips value={kind} onChange={setKind} items={[{ id: "investment", label: "Investment" }, { id: "insurance", label: "Insurance" }, { id: "loan", label: "Loan" }]} />
          <Field label="Name" value={name} onChange={(e) => setName(e.target.value)} placeholder="Nifty 50 index fund" />
          <Field label={kind === "insurance" ? "Cover · ₹" : kind === "loan" ? "Outstanding · ₹" : "Current value · ₹"} value={value} onChange={(e) => setValue(e.target.value.replace(/\D/g, ""))} inputMode="numeric" error={add.error?.message} />
          <Button type="submit" block disabled={name.trim().length < 2 || !(Number(value) > 0)} loading={add.isPending}>Add</Button>
        </form>
      </Dialog>
    </Page>
  );
}
