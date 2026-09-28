import { useMutation, useQueryClient } from "@tanstack/react-query";
import * as DocumentPicker from "expo-document-picker";
import { useRouter } from "expo-router";
import { Minus, Paperclip, Plus } from "lucide-react-native";
import { useEffect, useRef, useState } from "react";
import { KeyboardAvoidingView, Platform, Pressable, View } from "react-native";
import { api } from "@/api/client";
import { useCompanies, useProducts } from "@/api/hooks";
import { track } from "@/analytics";
import type { Need } from "@/domain/models";
import { useTheme } from "@/design";
import { NEEDS } from "@/features/needs";
import { PageHeader } from "@/features/PageHeader";
import { formatINR } from "@/lib/format";
import { AmountText, Button, Chips, FormField, Row, Screen, Section, StickyCTA, Text } from "@/ui";

/** Client → Need → Company/Product → Quantity → Documents → Submit, in ~60 s (report #83). */
export default function NewLead() {
  const router = useRouter();
  const qc = useQueryClient();
  const { colors } = useTheme();
  const products = useProducts();
  const companies = useCompanies();
  const [client, setClient] = useState("");
  const [phone, setPhone] = useState("");
  const [need, setNeed] = useState<Need>("grow_wealth");
  const [subject, setSubject] = useState<string>("");
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
      qc.invalidateQueries({ queryKey: ["leads"] });
      qc.invalidateQueries({ queryKey: ["clients"] });
      router.replace(`/partner/leads/${l.id}`);
    },
  });
  const options = [...(companies.data ?? []).filter((c) => c.available).map((c) => ({ id: c.id, label: c.name })), ...(products.data ?? []).map((p) => ({ id: p.id, label: p.name }))];

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === "ios" ? "padding" : undefined}>
      <Screen
        header={<PageHeader close label={`0:${String(Math.min(secs, 59)).padStart(2, "0")}${secs > 59 ? "+" : ""}`} />}
        eyebrow="Add a lead"
        title="Sixty seconds."
        subtitle="Just enough to start. RFIN ops take it from here."
        footer={
          <StickyCTA>
            <Button label="Submit lead" block disabled={client.trim().length < 2} loading={create.isPending} onPress={() => create.mutate()} />
          </StickyCTA>
        }
      >
        <Section title="01 · Client">
          <FormField label="Name" value={client} onChangeText={setClient} placeholder="Sameer Kulkarni" autoFocus />
          <FormField label="Mobile · optional" value={phone} onChangeText={(t) => setPhone(t.replace(/\D/g, "").slice(0, 10))} keyboardType="number-pad" placeholder="98220 12345" error={create.error?.message} />
        </Section>
        <Section title="02 · Need">
          <Chips value={need} onChange={setNeed} items={NEEDS.filter((n) => n.id !== "refer_someone").map((n) => ({ id: n.id, label: n.label }))} />
        </Section>
        <Section title="03 · Company or product · optional">
          <Chips value={subject} onChange={(v) => { setSubject(v === subject ? "" : v); setLots(1); }} items={options} />
        </Section>
        {company ? (
          <Section title="04 · Quantity">
            <Row gap={20}>
              <Pressable accessibilityLabel="Fewer" disabled={lots <= 1} onPress={() => setLots(lots - 1)} style={{ width: 44, height: 44, borderRadius: 22, borderWidth: 1, borderColor: colors.line, alignItems: "center", justifyContent: "center", opacity: lots <= 1 ? 0.4 : 1 }}><Minus size={18} color={colors.foreground} /></Pressable>
              <View style={{ alignItems: "center" }}>
                <AmountText size={32}>{quantity}</AmountText>
                <Text variant="code">SHARES</Text>
              </View>
              <Pressable accessibilityLabel="More" onPress={() => setLots(lots + 1)} style={{ width: 44, height: 44, borderRadius: 22, borderWidth: 1, borderColor: colors.line, alignItems: "center", justifyContent: "center" }}><Plus size={18} color={colors.foreground} /></Pressable>
            </Row>
            {company.prices[0] ? <Text variant="xs">≈ {formatINR(company.prices[0].perShare * (quantity ?? 0))} indicative</Text> : null}
          </Section>
        ) : null}
        <Section title="05 · Documents · optional">
          <Button
            label={docs.length ? `${docs.length} attached` : "Attach"}
            variant="outline"
            icon={<Paperclip size={16} color={colors.foreground} />}
            onPress={async () => {
              const r = await DocumentPicker.getDocumentAsync({ multiple: true });
              if (!r.canceled) setDocs([...docs, ...r.assets.map((a) => a.name)]);
            }}
          />
          {docs.map((d) => <Text key={d} variant="xs">• {d}</Text>)}
        </Section>
      </Screen>
    </KeyboardAvoidingView>
  );
}
