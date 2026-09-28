"use client";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { PARTNER_CONFIG as P, type CapabilityLevel, type PartnerProfile } from "@rfin/shared";
import { BadgeCheck, Check } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { api, track } from "@/lib/api";
import { cn } from "@/lib/cn";
import { useBanks, usePartnerProfile } from "@/lib/hooks";
import { useSession } from "@/stores/session";
import { Page } from "@/components/shell";
import { useToast } from "@/components/toast";
import { Button, Chips, Field, PageTitle, ProgressRing, QueryView, SectionLabel, StatusCode, Stepper, TrustBanner } from "@/components/ui";

type Patch = Parameters<typeof api<"partner.update">>[1];

function Option({ label, on, onClick }: { label: string; on: boolean; onClick: () => void }) {
  return (
    <button type="button" role="radio" aria-checked={on} onClick={onClick} className={cn("flex w-full items-center gap-3 rounded-2xl p-4 text-left", on ? "border-2 border-rfin-text" : "border border-rfin-line/10 hover:bg-rfin-text/5")}>
      <span className={cn("size-[18px] shrink-0 rounded-full", on ? "border-[6px] border-rfin-text" : "border-[1.5px] border-rfin-line/25")} />
      <span className="text-sm font-semibold">{label}</span>
    </button>
  );
}

function Multi({ items, value, onChange }: { items: string[]; value: string[]; onChange: (v: string[]) => void }) {
  return (
    <div className="flex flex-wrap gap-2">
      {items.map((i) => {
        const on = value.includes(i);
        return (
          <button key={i} type="button" role="checkbox" aria-checked={on} onClick={() => onChange(on ? value.filter((x) => x !== i) : [...value, i])} className={cn("rounded-full border px-4 py-2 text-[13px] font-semibold", on ? "border-rfin-inverse bg-rfin-inverse text-rfin-on-inverse" : "border-rfin-line/15 hover:bg-rfin-text/5")}>
            {i}
          </button>
        );
      })}
    </div>
  );
}

/** Partner registration (report #71–#81): saved as you go, then verification → Partner ID. */
export default function PartnerOnboarding() {
  const router = useRouter();
  const qc = useQueryClient();
  const toast = useToast();
  const profile = usePartnerProfile();
  const banks = useBanks();
  const sync = useSession((s) => s.sync);
  const setMode = useSession((s) => s.setMode);
  const [step, setStep] = useState(0);
  const [d, setD] = useState<PartnerProfile | null>(null);

  useEffect(() => {
    if (profile.data && !d) {
      setD(profile.data);
      setStep(profile.data.step);
    }
  }, [profile.data, d]);
  useEffect(() => {
    if (profile.data?.state === "active") api("me.get", undefined).then(sync).catch(() => {});
  }, [profile.data?.state, sync]);

  const save = useMutation({ mutationFn: (patch: Patch) => api("partner.update", patch), onSuccess: (p) => qc.setQueryData(["partnerProfile"], p), onError: (e: Error) => toast(e.message, "danger") });
  const submit = useMutation({ mutationFn: () => api("partner.submit", undefined), onSuccess: (p) => { track("partner_profile_completed"); qc.setQueryData(["partnerProfile"], p); } });
  const p = profile.data;

  if (p?.state === "verifying" || p?.state === "active") {
    const active = p.state === "active";
    return (
      <Page>
        <div className="space-y-4">
          {active ? <BadgeCheck className="size-12 text-rfin-green" /> : <ProgressRing value={1} total={2} size={80} />}
          <StatusCode label={active ? "Active" : "Verifying"} tone={active ? "success" : "pending"} />
          <h1 className="font-display text-6xl tracking-tight">{active ? "You're a partner." : "We're verifying you."}</h1>
          <p className="max-w-xl text-sm text-rfin-mute">{active ? "Your Partner ID works across leads, cases and payouts." : "PAN, bank and agreement checks usually take a few minutes. This page updates on its own."}</p>
          {active ? (
            <>
              <div className="inline-block rounded-2xl border border-rfin-line/10 p-5"><p className="font-mono text-[11px] uppercase tracking-[.18em] text-rfin-mute">Partner ID</p><p className="font-display text-4xl">{p.partnerId}</p></div>
              <div><Button onClick={() => { track("partner_activated"); setMode("partner"); router.push("/partner/home"); }}>Open partner dashboard ↗</Button></div>
            </>
          ) : null}
        </div>
      </Page>
    );
  }
  if (!d) return <Page><QueryView query={profile}>{() => null}</QueryView></Page>;

  const set = <K extends keyof PartnerProfile>(k: K, v: object) => setD({ ...d, [k]: { ...(d[k] as object), ...v } });
  const persist = (next: number) =>
    save.mutate({ partnerType: d.partnerType, basic: d.basic, professional: d.professional, capabilities: d.capabilities, network: d.network, business: d.business, compliance: d.compliance, payout: d.payout, step: next }, { onSuccess: () => setStep(next) });
  const verifiedBank = (banks.data ?? []).some((b) => b.state === "verified");
  const panOk = /^[A-Z]{5}\d{4}[A-Z]$/.test(d.compliance.pan ?? "");
  const canNext = [!!d.partnerType, !!(d.basic.organisation && d.basic.city), true, Object.values(d.capabilities).some((v) => v !== "none"), !!d.network.clientBase, !!d.business.annualBusiness, panOk && !!d.compliance.declarations, !!d.payout.tdsAcknowledged && verifiedBank, !!d.agreementSignedAt, true][step];
  const last = step === P.steps.length - 1;

  const rail = (
    <>
      <SectionLabel>Partner 360</SectionLabel>
      <div className="space-y-2">
        {Object.entries(p?.dimensions ?? {}).map(([k, v]) => (
          <div key={k} className="flex items-center justify-between rounded-xl px-3 py-2">
            <span className="text-sm font-semibold capitalize">{k}</span>
            {v ? <Check className="size-4 text-rfin-green" /> : <span className="size-2 rounded-full bg-rfin-text/15" />}
          </div>
        ))}
      </div>
      <div className="mt-auto space-y-2 border-t border-rfin-line/15 pt-6">
        {submit.isError ? <p className="text-center text-xs text-rfin-red">{submit.error.message}</p> : null}
        {last ? <Button block loading={submit.isPending} onClick={() => submit.mutate()}>Submit for verification</Button> : <Button block disabled={!canNext} loading={save.isPending} onClick={() => persist(step + 1)}>Continue</Button>}
        <p className="text-center text-xs text-rfin-mute">Saved as you go — about 5 minutes in total.</p>
      </div>
    </>
  );

  return (
    <Page rail={rail}>
      <PageTitle eyebrow="Become a partner" title={P.steps[step]} />
      <Stepper steps={P.steps} current={step} />

      {step === 0 ? <div className="grid gap-2 md:grid-cols-2">{P.types.map((t) => <Option key={t.id} label={t.label} on={d.partnerType === t.id} onClick={() => setD({ ...d, partnerType: t.id })} />)}</div> : null}
      {step === 1 ? (
        <div className="grid gap-5 sm:grid-cols-2">
          <Field label="Organisation / firm" value={d.basic.organisation ?? ""} onChange={(e) => set("basic", { organisation: e.target.value })} placeholder="Rao Wealth" />
          <Field label="Designation" value={d.basic.designation ?? ""} onChange={(e) => set("basic", { designation: e.target.value })} placeholder="Founder" />
          <Field label="Years in financial services" value={d.basic.experienceYears ? String(d.basic.experienceYears) : ""} onChange={(e) => set("basic", { experienceYears: Number(e.target.value.replace(/\D/g, "")) || undefined })} inputMode="numeric" placeholder="8" />
          <Field label="City" value={d.basic.city ?? ""} onChange={(e) => set("basic", { city: e.target.value })} placeholder="Pune" />
          <Field label="State" value={d.basic.state ?? ""} onChange={(e) => set("basic", { state: e.target.value })} placeholder="Maharashtra" />
        </div>
      ) : null}
      {step === 2 ? (
        <div className="space-y-5">
          <Field label="Previous organisations · optional" value={d.professional.previousOrgs ?? ""} onChange={(e) => set("professional", { previousOrgs: e.target.value })} placeholder="HDFC Securities" />
          <p className="font-mono text-[11px] uppercase tracking-[.18em] text-rfin-mute">Certifications · optional</p>
          <Multi items={["NISM-VA", "NISM-XA", "IRDAI", "AMFI ARN", "CFP", "CA"]} value={d.professional.certifications ?? []} onChange={(v) => set("professional", { certifications: v })} />
          <p className="font-mono text-[11px] uppercase tracking-[.18em] text-rfin-mute">Team size</p>
          <Chips value={d.professional.teamSize ?? ""} onChange={(v) => set("professional", { teamSize: v })} items={["Just me", "2–5", "6–20", "20+"].map((x) => ({ id: x, label: x }))} />
          <Field label="LinkedIn or website · optional" value={d.professional.profileLink ?? ""} onChange={(e) => set("professional", { profileLink: e.target.value })} placeholder="linkedin.com/in/…" />
        </div>
      ) : null}
      {step === 3 ? (
        <div className="divide-y divide-rfin-line/10 rounded-2xl border border-rfin-line/10">
          {P.capabilityCategories.map((c) => (
            <div key={c.id} className="flex flex-wrap items-center justify-between gap-3 p-4">
              <span className="text-sm font-semibold">{c.label}</span>
              <Chips<CapabilityLevel> value={d.capabilities[c.id] ?? "none"} onChange={(v) => set("capabilities", { [c.id]: v })} items={[{ id: "none", label: "Not yet" }, { id: "interested", label: "Interested" }, { id: "experienced", label: "Experienced" }]} />
            </div>
          ))}
        </div>
      ) : null}
      {step === 4 ? (
        <div className="space-y-5">
          <p className="text-sm text-rfin-mute">Ranges only — we never need your client list.</p>
          <p className="font-mono text-[11px] uppercase tracking-[.18em] text-rfin-mute">Active clients</p>
          <Chips value={d.network.clientBase ?? ""} onChange={(v) => set("network", { clientBase: v })} items={P.clientBaseRanges.map((x) => ({ id: x, label: x }))} />
          <p className="font-mono text-[11px] uppercase tracking-[.18em] text-rfin-mute">Segments you serve</p>
          <Multi items={P.segments} value={d.network.segments ?? []} onChange={(v) => set("network", { segments: v })} />
          <Field label="Cities you cover" value={(d.network.geographies ?? []).join(", ")} onChange={(e) => set("network", { geographies: e.target.value.split(",").map((x) => x.trim()).filter(Boolean) })} placeholder="Pune, Mumbai" />
        </div>
      ) : null}
      {step === 5 ? (
        <div className="space-y-5">
          <p className="font-mono text-[11px] uppercase tracking-[.18em] text-rfin-mute">Annual business you handle</p>
          <Chips value={d.business.annualBusiness ?? ""} onChange={(v) => set("business", { annualBusiness: v })} items={P.annualBusinessRanges.map((x) => ({ id: x, label: x }))} />
          <Field label="Leads you could refer per month" value={d.business.monthlyLeads ? String(d.business.monthlyLeads) : ""} onChange={(e) => set("business", { monthlyLeads: Number(e.target.value.replace(/\D/g, "")) || undefined })} inputMode="numeric" placeholder="10" />
        </div>
      ) : null}
      {step === 6 ? (
        <div className="grid gap-5 sm:grid-cols-2">
          <Field label="PAN" value={d.compliance.pan ?? ""} onChange={(e) => set("compliance", { pan: e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, "").slice(0, 10) })} placeholder="ABCPR1234K" why="Needed for commission payouts and TDS." error={d.compliance.pan?.length === 10 && !panOk ? "That doesn't look like a PAN" : undefined} />
          <Field label="GSTIN · if registered" value={d.compliance.gstin ?? ""} onChange={(e) => set("compliance", { gstin: e.target.value.toUpperCase() })} placeholder="27ABCPR1234K1Z5" />
          <Field label="ARN / licence no. · if any" value={d.compliance.licence ?? ""} onChange={(e) => set("compliance", { licence: e.target.value })} placeholder="ARN-123456" />
          <div className="sm:col-span-2"><Option label="I declare the information above is true and I'm not barred by any regulator" on={!!d.compliance.declarations} onClick={() => set("compliance", { declarations: !d.compliance.declarations })} /></div>
        </div>
      ) : null}
      {step === 7 ? (
        <div className="space-y-5">
          <QueryView query={banks} empty={{ title: "Verify a bank account", body: "Commission is paid to a verified account in your name.", action: { label: "Add bank", onClick: () => router.push("/bank") } }}>
            {(list) => {
              const b = list.find((x) => x.state === "verified");
              return b ? <TrustBanner>Payouts go to {b.bank} •••• {b.last4}.</TrustBanner> : <Button variant="outline" onClick={() => router.push("/bank")}>Verify a bank account first</Button>;
            }}
          </QueryView>
          <p className="font-mono text-[11px] uppercase tracking-[.18em] text-rfin-mute">How often</p>
          <Chips value={d.payout.preference ?? "monthly"} onChange={(v) => set("payout", { preference: v })} items={[{ id: "on_request", label: "When I request" }, { id: "monthly", label: "Monthly" }]} />
          <Option label={`I understand ${P.tdsPct}% TDS is deducted from commission as applicable`} on={!!d.payout.tdsAcknowledged} onClick={() => set("payout", { tdsAcknowledged: !d.payout.tdsAcknowledged })} />
        </div>
      ) : null}
      {step === 8 ? (
        <div className="space-y-5">
          <ul className="space-y-2 rounded-2xl border border-rfin-line/10 p-5 text-sm text-rfin-mute">
            {["You introduce clients; RFIN and providers do suitability, KYC and servicing.", `Commission is ${P.commissionPct}% of completed case value, paid after provider confirmation.`, "No guarantees of returns may be made to clients.", "Either side can end the agreement with 30 days' notice."].map((t) => <li key={t}>• {t}</li>)}
          </ul>
          {d.agreementSignedAt ? <p className="flex items-center gap-2 text-sm font-semibold"><Check className="size-4 text-rfin-green" /> Signed</p> : <Button loading={save.isPending} onClick={() => save.mutate({ signAgreement: true }, { onSuccess: (pp) => setD({ ...d, agreementSignedAt: pp.agreementSignedAt }) })}>Sign with Aadhaar eSign (mock)</Button>}
        </div>
      ) : null}
      {step === 9 ? (
        <div className="divide-y divide-rfin-line/10 rounded-2xl border border-rfin-line/10">
          {[["Type", P.types.find((t) => t.id === d.partnerType)?.label], ["Organisation", `${d.basic.organisation ?? "—"} · ${d.basic.city ?? ""}`], ["Capabilities", Object.entries(d.capabilities).filter(([, v]) => v !== "none").map(([k]) => P.capabilityCategories.find((c) => c.id === k)?.label).join(", ")], ["Network", `${d.network.clientBase ?? "—"} clients · ${(d.network.segments ?? []).join(", ")}`], ["Business", d.business.annualBusiness], ["PAN", d.compliance.pan], ["Agreement", d.agreementSignedAt ? "Signed" : "Not signed"]].map(([k, v]) => (
            <div key={k} className="flex justify-between gap-4 p-4"><span className="text-[13px] text-rfin-mute">{k}</span><span className="text-right text-sm font-semibold">{v || "—"}</span></div>
          ))}
        </div>
      ) : null}

      <div className="flex items-center gap-4 xl:hidden">
        {last ? <Button loading={submit.isPending} onClick={() => submit.mutate()}>Submit for verification</Button> : <Button disabled={!canNext} loading={save.isPending} onClick={() => persist(step + 1)}>Continue</Button>}
      </div>
      {step > 0 ? <button type="button" onClick={() => setStep(step - 1)} className="text-xs font-semibold text-rfin-mute hover:text-rfin-text">← Back to {P.steps[step - 1]}</button> : null}
    </Page>
  );
}
