import { useMutation } from "@tanstack/react-query";
import { useState } from "react";
import { View } from "react-native";
import { api } from "@/api/client";
import { useC360Invalidate, useExternal, useFinancial } from "@/api/hooks";
import type { ExternalProduct, FinancialProfile } from "@/domain/models";
import { useTheme } from "@/design";
import { formatINR } from "@/lib/format";
import { PageHeader } from "@/features/PageHeader";
import { BottomSheet, Button, Chips, FormField, QueryView, Row, Screen, Section, Text, TrustBanner, useToast } from "@/ui";

const LABEL = { incomeBand: "Annual income", risk: "Risk you're comfortable with", horizon: "Investment horizon", liquidity: "How soon you might need the money" } as const;

/** Customer 360 financial profile (report #15) + products held elsewhere (report #16). */
export default function FinancialProfileScreen() {
  const toast = useToast();
  const { colors } = useTheme();
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

  return (
    <Screen header={<PageHeader label="Financial profile" />} eyebrow="Customer 360" title="Your money, in context." subtitle="Ranges are enough. This only shapes what RFIN suggests — it's never shared without your consent.">
      <QueryView query={fin}>
        {(f) => (
          <>
            {(Object.keys(LABEL) as (keyof typeof LABEL)[]).map((k) => (
              <View key={k} style={{ gap: 8 }}>
                <Text variant="label">{LABEL[k]}</Text>
                <Chips value={(f[k] as string) ?? ""} onChange={(v) => save.mutate({ [k]: v } as never)} items={f.options[k].map((o) => ({ id: o, label: o[0].toUpperCase() + o.slice(1) }))} />
              </View>
            ))}
            <FormField label="Investible surplus · ₹" defaultValue={f.investible ? String(f.investible / 100) : ""} onEndEditing={(e) => save.mutate({ investible: Number(e.nativeEvent.text.replace(/\D/g, "")) * 100 })} keyboardType="number-pad" placeholder="3,00,000" why="Money you could invest without touching your emergency fund." />
          </>
        )}
      </QueryView>
      <Section title="Held elsewhere">
        <QueryView query={ext} empty={{ title: "Nothing added", body: "Add funds, policies or loans outside RFIN for a complete picture." }}>
          {(list) =>
            list.map((e) => (
              <Row key={e.id} style={{ justifyContent: "space-between", paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: colors.lineSoft }}>
                <View style={{ flex: 1 }}>
                  <Text variant="title">{e.name}</Text>
                  <Text variant="xs" style={{ textTransform: "capitalize" }}>{e.kind} · {formatINR(e.value)}</Text>
                </View>
                <Button label="Remove" variant="link" onPress={() => remove.mutate(e.id)} />
              </Row>
            ))
          }
        </QueryView>
        <Button label="Add a product" variant="outline" onPress={() => setOpen(true)} />
      </Section>
      <TrustBanner>RFIN doesn't pull data from other providers. What you add here stays as you entered it.</TrustBanner>
      <BottomSheet open={open} onClose={() => setOpen(false)} title="Add a product">
        <View style={{ gap: 14 }}>
          <Chips value={kind} onChange={setKind} items={[{ id: "investment", label: "Investment" }, { id: "insurance", label: "Insurance" }, { id: "loan", label: "Loan" }]} />
          <FormField label="Name" value={name} onChangeText={setName} placeholder="Nifty 50 index fund" />
          <FormField label={kind === "insurance" ? "Cover · ₹" : kind === "loan" ? "Outstanding · ₹" : "Current value · ₹"} value={value} onChangeText={(t) => setValue(t.replace(/\D/g, ""))} keyboardType="number-pad" error={add.error?.message} />
          <Button label="Add" block disabled={name.trim().length < 2 || !(Number(value) > 0)} loading={add.isPending} onPress={() => add.mutate()} />
        </View>
      </BottomSheet>
    </Screen>
  );
}
