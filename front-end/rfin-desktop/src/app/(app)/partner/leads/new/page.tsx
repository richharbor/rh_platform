"use client";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { formatINR, NEEDS, type Need } from "@rfin/shared";
import { Minus, Plus } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { api, track } from "@/lib/api";
import { useCompanies, useProducts } from "@/lib/hooks";
import { BackLink, Page } from "@/components/shell";
import { Button, Chips, Field, PageTitle, SectionLabel } from "@/components/ui";

/** Client → Need → Company/Product → Quantity → Documents → Submit, in ~60 s (report #83). */
export default function NewLead() {
  const router = useRouter();
  const qc = useQueryClient();
  const products = useProducts();
  const companies = useCompanies();
  const [client, setClient] = useState("");
  const [phone, setPhone] = useState("");
  const [need, setNeed] = useState<Need>("grow_wealth");
  const [subject, setSubject] = useState("");
  const [lots, setLots] = useState(1);
  const [docs, setDocs] = useState<string[]>([]);
  const started = useRef(Date.now());
  const [secs, setSecs] = useState(0);
  useEffect(() => {
    const t = setInterval(() => setSecs(Math.floor((Date.now() - started.current) / 1000)), 1000);
    return () => clearInterval(t);
  }, []);
  const company = companies.data?.find((c) => c.id === subject);
  const quantity = company ? lots * company.minLot : undefined;
  const create = useMutation({
    mutationFn: () => api("leads.create", { client: client.trim(), phone: phone || undefined, need, companyId: company?.id, productId: company ? undefined : subject || undefined, quantity, documents: docs }),
    onSuccess: (l) => {
      track("lead_created", { seconds: secs, need });
      for (const k of ["leads", "clients"]) qc.invalidateQueries({ queryKey: [k] });
      router.replace(`/partner/leads/${l.id}`);
    },
  });
  const options = [...(companies.data ?? []).filter((c) => c.available).map((c) => ({ id: c.id, label: c.name })), ...(products.data ?? []).map((p) => ({ id: p.id, label: p.name }))];

  return (
    <Page back={<BackLink href="/partner/leads" label="Leads" />}>
      <div className="flex items-start justify-between gap-4">
        <PageTitle eyebrow="Add a lead" title="Sixty seconds." lede="Just enough to start. RFIN ops take it from here." />
        <span className="font-mono text-2xl tabular-nums text-rfin-mute" aria-label={`${secs} seconds`}>0:{String(Math.min(secs, 59)).padStart(2, "0")}{secs > 59 ? "+" : ""}</span>
      </div>
      <form className="space-y-8" onSubmit={(e) => { e.preventDefault(); create.mutate(); }}>
        <section className="space-y-3">
          <SectionLabel>01 · Client</SectionLabel>
          <div className="grid gap-5 sm:grid-cols-2">
            <Field label="Name" value={client} onChange={(e) => setClient(e.target.value)} placeholder="Sameer Kulkarni" autoFocus />
            <Field label="Mobile · optional" value={phone} onChange={(e) => setPhone(e.target.value.replace(/\D/g, "").slice(0, 10))} inputMode="numeric" placeholder="98220 12345" error={create.error?.message} />
          </div>
        </section>
        <section className="space-y-3"><SectionLabel>02 · Need</SectionLabel><Chips value={need} onChange={setNeed} items={NEEDS.filter((n) => n.id !== "refer_someone").map((n) => ({ id: n.id, label: n.label }))} /></section>
        <section className="space-y-3"><SectionLabel>03 · Company or product · optional</SectionLabel><Chips value={subject} onChange={(v) => { setSubject(v === subject ? "" : v); setLots(1); }} items={options} /></section>
        {company ? (
          <section className="space-y-3">
            <SectionLabel>04 · Quantity</SectionLabel>
            <div className="flex items-center gap-6">
              <button type="button" aria-label="Fewer" disabled={lots <= 1} onClick={() => setLots(lots - 1)} className="grid size-11 place-items-center rounded-full border border-rfin-line/20 disabled:opacity-40"><Minus className="size-4" /></button>
              <span className="font-display text-4xl">{quantity}</span>
              <button type="button" aria-label="More" onClick={() => setLots(lots + 1)} className="grid size-11 place-items-center rounded-full border border-rfin-line/20"><Plus className="size-4" /></button>
              {company.prices[0] ? <span className="text-xs text-rfin-mute">≈ {formatINR(company.prices[0].perShare * (quantity ?? 0))} indicative</span> : null}
            </div>
          </section>
        ) : null}
        <section className="space-y-3">
          <SectionLabel>05 · Documents · optional</SectionLabel>
          <input type="file" multiple aria-label="Attach documents" onChange={(e) => setDocs([...docs, ...Array.from(e.target.files ?? []).map((f) => f.name)])} className="block text-sm file:mr-4 file:rounded-full file:border file:border-rfin-line/15 file:bg-transparent file:px-4 file:py-2 file:text-[13px] file:font-semibold" />
          {docs.map((d) => <p key={d} className="text-xs text-rfin-mute">• {d}</p>)}
        </section>
        <Button type="submit" disabled={client.trim().length < 2} loading={create.isPending}>Submit lead</Button>
      </form>
    </Page>
  );
}
