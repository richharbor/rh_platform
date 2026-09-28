import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "expo-router";
import { BadgeCheck, Check } from "lucide-react-native";
import { useEffect, useState } from "react";
import { KeyboardAvoidingView, Platform, Pressable, View } from "react-native";
import { api } from "@/api/client";
import { useBanks, usePartnerProfile } from "@/api/hooks";
import type { CapabilityLevel, PartnerProfile } from "@/domain/models";
import { PARTNER_CONFIG as P } from "@rfin/shared";
import { fonts, radius, useTheme } from "@/design";
import { PageHeader } from "@/features/PageHeader";
import { useSession } from "@/stores/session";
import { AmountText, Button, Card, Chips, Display, FormField, ProgressRing, QueryView, Row, Screen, Section, StatusChip, Stepper, StickyCTA, Text, TrustBanner, useToast } from "@/ui";

type Patch = Parameters<typeof api<"partner.update">>[1];

function Option({ label, on, onPress }: { label: string; on: boolean; onPress: () => void }) {
  const { colors } = useTheme();
  return (
    <Pressable accessibilityRole="radio" accessibilityState={{ selected: on }} onPress={onPress} style={{ flexDirection: "row", alignItems: "center", gap: 12, padding: 14, borderRadius: radius["2xl"], borderWidth: on ? 2 : 1, borderColor: on ? colors.foreground : colors.lineSoft }}>
      <View style={{ width: 18, height: 18, borderRadius: 9, borderWidth: on ? 6 : 1.5, borderColor: on ? colors.foreground : colors.line }} />
      <Text variant="title" style={{ flex: 1 }}>{label}</Text>
    </Pressable>
  );
}

function Multi({ items, value, onChange }: { items: string[]; value: string[]; onChange: (v: string[]) => void }) {
  const { colors } = useTheme();
  return (
    <Row style={{ flexWrap: "wrap" }}>
      {items.map((i) => {
        const on = value.includes(i);
        return (
          <Pressable key={i} accessibilityRole="checkbox" accessibilityState={{ checked: on }} onPress={() => onChange(on ? value.filter((x) => x !== i) : [...value, i])} style={{ paddingHorizontal: 14, paddingVertical: 9, borderRadius: radius.full, borderWidth: 1, borderColor: on ? colors.inverse : colors.line, backgroundColor: on ? colors.inverse : "transparent" }}>
            <Text style={{ fontFamily: fonts.semibold, fontSize: 13, color: on ? colors.onInverse : colors.foreground }}>{i}</Text>
          </Pressable>
        );
      })}
    </Row>
  );
}

/**
 * Partner registration (report #71–#81): ~5–8 minutes, saved as you go, then
 * progressive verification. Activation issues a Partner ID and the partner role.
 */
export default function PartnerOnboarding() {
  const router = useRouter();
  const qc = useQueryClient();
  const toast = useToast();
  const { colors } = useTheme();
  const profile = usePartnerProfile();
  const banks = useBanks();
  const sync = useSession((s) => s.sync);
  const setMode = useSession((s) => s.setMode);
  const [step, setStep] = useState(0);
  const [draft, setDraft] = useState<PartnerProfile | null>(null);

  useEffect(() => {
    if (profile.data && !draft) {
      setDraft(profile.data);
      setStep(profile.data.step);
    }
  }, [profile.data, draft]);

  // Activation grants the role server-side — pull the new roles.
  useEffect(() => {
    if (profile.data?.state === "active") api("me.get", undefined).then(sync).catch(() => {});
  }, [profile.data?.state, sync]);

  const save = useMutation({
    mutationFn: (patch: Patch) => api("partner.update", patch),
    onSuccess: (p) => qc.setQueryData(["partnerProfile"], p),
    onError: (e: Error) => toast(e.message, "danger"),
  });
  const submit = useMutation({
    mutationFn: () => api("partner.submit", undefined),
    onSuccess: (p) => qc.setQueryData(["partnerProfile"], p),
  });

  const p = profile.data;
  if (p?.state === "verifying" || p?.state === "active") {
    const active = p.state === "active";
    return (
      <Screen header={<PageHeader label="Partner" />}>
        <View style={{ gap: 14, alignItems: "flex-start" }}>
          {active ? <BadgeCheck size={40} color={colors.green} /> : <ProgressRing value={1} total={2} size={72} />}
          <StatusChip label={active ? "Active" : "Verifying"} tone={active ? "success" : "pending"} />
          <Display size={44}>{active ? "You're a partner." : "We're verifying you."}</Display>
          <Text variant="muted">{active ? "Your Partner ID works across leads, cases and payouts." : "PAN, bank and agreement checks usually take a few minutes. This screen updates on its own."}</Text>
        </View>
        {active ? (
          <>
            <Card style={{ gap: 4 }}>
              <Text variant="label">Partner ID</Text>
              <AmountText size={32}>{p.partnerId}</AmountText>
            </Card>
            <Button label="Open partner dashboard" block onPress={() => { setMode("partner"); router.replace("/partner/home"); }} />
          </>
        ) : null}
      </Screen>
    );
  }
  if (!draft) return <Screen header={<PageHeader label="Partner" />}><QueryView query={profile}>{() => null}</QueryView></Screen>;

  const set = <K extends keyof PartnerProfile>(k: K, v: Partial<PartnerProfile[K]> | PartnerProfile[K]) => setDraft({ ...draft, [k]: typeof v === "object" && !Array.isArray(v) ? { ...(draft[k] as object), ...(v as object) } : v });
  const persist = (next: number, extra: Patch = {}) => {
    const patch: Patch = {
      partnerType: draft.partnerType,
      basic: draft.basic,
      professional: draft.professional,
      capabilities: draft.capabilities,
      network: draft.network,
      business: draft.business,
      compliance: draft.compliance,
      payout: draft.payout,
      step: next,
      ...extra,
    };
    save.mutate(patch, { onSuccess: () => setStep(next) });
  };
  const verifiedBank = (banks.data ?? []).some((b) => b.state === "verified");
  const panOk = /^[A-Z]{5}\d{4}[A-Z]$/.test(draft.compliance.pan ?? "");
  const canNext = [
    !!draft.partnerType,
    !!(draft.basic.organisation && draft.basic.city),
    true,
    Object.values(draft.capabilities).some((v) => v !== "none"),
    !!draft.network.clientBase,
    !!draft.business.annualBusiness,
    panOk && !!draft.compliance.declarations,
    !!draft.payout.tdsAcknowledged && verifiedBank,
    !!draft.agreementSignedAt,
    true,
  ][step];
  const last = step === P.steps.length - 1;

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === "ios" ? "padding" : undefined}>
      <Screen
        header={<PageHeader close label="Become a partner" onBack={step ? () => setStep(step - 1) : undefined} />}
        footer={
          <StickyCTA note="Saved as you go — about 5 minutes in total.">
            {submit.isError ? <Text variant="xs" style={{ color: colors.red, textAlign: "center", marginBottom: 8 }}>{submit.error.message}</Text> : null}
            {last ? (
              <Button label="Submit for verification" block event="partner_profile_completed" loading={submit.isPending} onPress={() => submit.mutate()} />
            ) : (
              <Button label="Continue" block disabled={!canNext} loading={save.isPending} onPress={() => persist(step + 1)} />
            )}
          </StickyCTA>
        }
      >
        <Stepper steps={P.steps} current={step} />

        {step === 0 ? (
          <Section title="How do you work with clients?" gap={10}>
            {P.types.map((t) => (
              <Option key={t.id} label={t.label} on={draft.partnerType === t.id} onPress={() => setDraft({ ...draft, partnerType: t.id })} />
            ))}
          </Section>
        ) : null}

        {step === 1 ? (
          <View style={{ gap: 16 }}>
            <Display size={36}>About you.</Display>
            <FormField label="Organisation / firm" value={draft.basic.organisation ?? ""} onChangeText={(t) => set("basic", { organisation: t })} placeholder="Rao Wealth" />
            <FormField label="Designation" value={draft.basic.designation ?? ""} onChangeText={(t) => set("basic", { designation: t })} placeholder="Founder" />
            <FormField label="Years in financial services" value={draft.basic.experienceYears ? String(draft.basic.experienceYears) : ""} onChangeText={(t) => set("basic", { experienceYears: Number(t.replace(/\D/g, "")) || undefined })} keyboardType="number-pad" placeholder="8" />
            <FormField label="City" value={draft.basic.city ?? ""} onChangeText={(t) => set("basic", { city: t })} placeholder="Pune" />
            <FormField label="State" value={draft.basic.state ?? ""} onChangeText={(t) => set("basic", { state: t })} placeholder="Maharashtra" />
          </View>
        ) : null}

        {step === 2 ? (
          <View style={{ gap: 16 }}>
            <Display size={36}>Your experience.</Display>
            <FormField label="Previous organisations · optional" value={draft.professional.previousOrgs ?? ""} onChangeText={(t) => set("professional", { previousOrgs: t })} placeholder="HDFC Securities" />
            <Text variant="label">Certifications · optional</Text>
            <Multi items={["NISM-VA", "NISM-XA", "IRDAI", "AMFI ARN", "CFP", "CA"]} value={draft.professional.certifications ?? []} onChange={(v) => set("professional", { certifications: v })} />
            <Text variant="label">Team size</Text>
            <Chips value={draft.professional.teamSize ?? ""} onChange={(v) => set("professional", { teamSize: v })} items={["Just me", "2–5", "6–20", "20+"].map((x) => ({ id: x, label: x }))} />
            <FormField label="LinkedIn or website · optional" value={draft.professional.profileLink ?? ""} onChangeText={(t) => set("professional", { profileLink: t })} autoCapitalize="none" placeholder="linkedin.com/in/…" />
          </View>
        ) : null}

        {step === 3 ? (
          <Section title="What do you work with?" gap={14}>
            <Text variant="muted">Pick your level for each. You'll see opportunities that fit.</Text>
            {P.capabilityCategories.map((c) => (
              <View key={c.id} style={{ gap: 8 }}>
                <Text variant="title">{c.label}</Text>
                <Chips<CapabilityLevel> value={draft.capabilities[c.id] ?? "none"} onChange={(v) => set("capabilities", { [c.id]: v })} items={[{ id: "none", label: "Not yet" }, { id: "interested", label: "Interested" }, { id: "experienced", label: "Experienced" }]} />
              </View>
            ))}
          </Section>
        ) : null}

        {step === 4 ? (
          <Section title="Your network" gap={14}>
            <Text variant="muted">Ranges only — we never need your client list.</Text>
            <Text variant="label">Active clients</Text>
            <Chips value={draft.network.clientBase ?? ""} onChange={(v) => set("network", { clientBase: v })} items={P.clientBaseRanges.map((x) => ({ id: x, label: x }))} />
            <Text variant="label">Segments you serve</Text>
            <Multi items={P.segments} value={draft.network.segments ?? []} onChange={(v) => set("network", { segments: v })} />
            <FormField label="Cities you cover" value={(draft.network.geographies ?? []).join(", ")} onChangeText={(t) => set("network", { geographies: t.split(",").map((x) => x.trim()).filter(Boolean) })} placeholder="Pune, Mumbai" />
          </Section>
        ) : null}

        {step === 5 ? (
          <Section title="Business potential" gap={14}>
            <Text variant="label">Annual business you handle</Text>
            <Chips value={draft.business.annualBusiness ?? ""} onChange={(v) => set("business", { annualBusiness: v })} items={P.annualBusinessRanges.map((x) => ({ id: x, label: x }))} />
            <FormField label="Leads you could refer per month" value={draft.business.monthlyLeads ? String(draft.business.monthlyLeads) : ""} onChangeText={(t) => set("business", { monthlyLeads: Number(t.replace(/\D/g, "")) || undefined })} keyboardType="number-pad" placeholder="10" />
          </Section>
        ) : null}

        {step === 6 ? (
          <View style={{ gap: 16 }}>
            <Display size={36}>Compliance.</Display>
            <FormField label="PAN" value={draft.compliance.pan ?? ""} onChangeText={(t) => set("compliance", { pan: t.toUpperCase().replace(/[^A-Z0-9]/g, "").slice(0, 10) })} autoCapitalize="characters" placeholder="ABCPR1234K" why="Needed for commission payouts and TDS." error={draft.compliance.pan && draft.compliance.pan.length === 10 && !panOk ? "That doesn't look like a PAN" : undefined} />
            <FormField label="GSTIN · if registered" value={draft.compliance.gstin ?? ""} onChangeText={(t) => set("compliance", { gstin: t.toUpperCase() })} autoCapitalize="characters" placeholder="27ABCPR1234K1Z5" />
            <FormField label="ARN / licence no. · if any" value={draft.compliance.licence ?? ""} onChangeText={(t) => set("compliance", { licence: t })} placeholder="ARN-123456" />
            <Option label="I declare the information above is true and I'm not barred by any regulator" on={!!draft.compliance.declarations} onPress={() => set("compliance", { declarations: !draft.compliance.declarations })} />
          </View>
        ) : null}

        {step === 7 ? (
          <View style={{ gap: 16 }}>
            <Display size={36}>Payouts.</Display>
            <QueryView query={banks} isEmpty={(b) => !b.some((x) => x.state === "verified")} empty={{ title: "Verify a bank account", body: "Commission is paid to a verified account in your name.", action: { label: "Add bank", onPress: () => router.push("/bank") } }}>
              {(list) => {
                const b = list.find((x) => x.state === "verified")!;
                return <TrustBanner>Payouts go to {b.bank} •••• {b.last4}.</TrustBanner>;
              }}
            </QueryView>
            <Text variant="label">How often</Text>
            <Chips value={draft.payout.preference ?? "monthly"} onChange={(v) => set("payout", { preference: v })} items={[{ id: "on_request", label: "When I request" }, { id: "monthly", label: "Monthly" }]} />
            <Option label={`I understand ${P.tdsPct}% TDS is deducted from commission as applicable`} on={!!draft.payout.tdsAcknowledged} onPress={() => set("payout", { tdsAcknowledged: !draft.payout.tdsAcknowledged })} />
          </View>
        ) : null}

        {step === 8 ? (
          <View style={{ gap: 16 }}>
            <Display size={36}>Partner agreement.</Display>
            <Card style={{ gap: 8 }}>
              {["You introduce clients; RFIN and providers do suitability, KYC and servicing.", `Commission is ${P.commissionPct}% of completed case value, paid after provider confirmation.`, "No guarantees of returns may be made to clients.", "Either side can end the agreement with 30 days' notice."].map((t) => (
                <Text key={t} variant="muted">• {t}</Text>
              ))}
            </Card>
            {draft.agreementSignedAt ? (
              <Row gap={8}><Check size={16} color={colors.green} /><Text variant="title">Signed</Text></Row>
            ) : (
              <Button label="Sign with Aadhaar eSign (mock)" onPress={() => save.mutate({ signAgreement: true }, { onSuccess: (pp) => setDraft({ ...draft, agreementSignedAt: pp.agreementSignedAt }) })} loading={save.isPending} />
            )}
          </View>
        ) : null}

        {step === 9 ? (
          <Section title="Review">
            {[
              ["Type", P.types.find((t) => t.id === draft.partnerType)?.label],
              ["Organisation", `${draft.basic.organisation ?? "—"} · ${draft.basic.city ?? ""}`],
              ["Capabilities", Object.entries(draft.capabilities).filter(([, v]) => v !== "none").map(([k]) => P.capabilityCategories.find((c) => c.id === k)?.label).join(", ")],
              ["Network", `${draft.network.clientBase ?? "—"} clients · ${(draft.network.segments ?? []).join(", ")}`],
              ["Business", draft.business.annualBusiness],
              ["PAN", draft.compliance.pan],
              ["Agreement", draft.agreementSignedAt ? "Signed" : "Not signed"],
            ].map(([k, v]) => (
              <Row key={k} style={{ justifyContent: "space-between", paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: colors.lineSoft }} gap={12}>
                <Text variant="caption">{k}</Text>
                <Text variant="title" style={{ flexShrink: 1, textAlign: "right" }}>{v || "—"}</Text>
              </Row>
            ))}
            <Text variant="xs">Partner 360: {Object.entries(p?.dimensions ?? {}).filter(([, v]) => v).length} of 6 dimensions complete.</Text>
          </Section>
        ) : null}
      </Screen>
    </KeyboardAvoidingView>
  );
}

