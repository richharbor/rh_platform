import { useMutation } from "@tanstack/react-query";
import { useRouter } from "expo-router";
import { useState } from "react";
import { Switch, View } from "react-native";
import { api } from "@/api/client";
import { useC360Invalidate, useFamily } from "@/api/hooks";
import type { FamilyMember } from "@/domain/models";
import { useTheme } from "@/design";
import { PageHeader } from "@/features/PageHeader";
import { BottomSheet, Button, Card, Chips, FormField, QueryView, Row, Screen, StatusChip, Text, TrustBanner } from "@/ui";

/** Family profiles (Phase 2): who depends on you, and what covers them. */
export default function Family() {
  const router = useRouter();
  const { colors } = useTheme();
  const family = useFamily();
  const refresh = useC360Invalidate();
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [relation, setRelation] = useState<FamilyMember["relation"]>("spouse");
  const [year, setYear] = useState("");
  const add = useMutation({ mutationFn: () => api("family.add", { name: name.trim(), relation, birthYear: year ? Number(year) : undefined }), onSuccess: () => { refresh(); setOpen(false); setName(""); setYear(""); } });
  const update = useMutation({ mutationFn: (p: { id: number; cover: FamilyMember["cover"] }) => api("family.update", p), onSuccess: refresh });
  const remove = useMutation({ mutationFn: (id: number) => api("family.remove", { id }), onSuccess: refresh });
  const gaps = (family.data ?? []).filter((f) => f.dependent && !f.cover.health).length;

  return (
    <Screen header={<PageHeader label="Family" />} eyebrow="Family" title="The people you protect." subtitle="Only names, relations and cover — enough to spot gaps. Nothing is shared with providers until you apply.">
      {gaps ? <TrustBanner>{gaps} dependant{gaps > 1 ? "s" : ""} without health cover. A family floater covers up to 6 people.</TrustBanner> : null}
      <QueryView query={family} empty={{ title: "No family added", body: "Add a spouse, child or parent to see cover gaps." }}>
        {(list) =>
          list.map((f) => (
            <Card key={f.id} style={{ gap: 10 }}>
              <Row style={{ justifyContent: "space-between" }}>
                <View>
                  <Text variant="h2">{f.name}</Text>
                  <Text variant="xs" style={{ textTransform: "capitalize" }}>{f.relation}{f.birthYear ? ` · born ${f.birthYear}` : ""}</Text>
                </View>
                <StatusChip label={f.cover.health && f.cover.life ? "Covered" : f.cover.health || f.cover.life ? "Partly covered" : "No cover"} tone={f.cover.health ? "success" : "action"} />
              </Row>
              {(["health", "life"] as const).map((k) => (
                <Row key={k} style={{ justifyContent: "space-between" }}>
                  <Text variant="title" style={{ textTransform: "capitalize" }}>{k} cover</Text>
                  <Switch accessibilityLabel={`${f.name} ${k} cover`} value={!!f.cover[k]} onValueChange={(v) => update.mutate({ id: f.id, cover: { [k]: v } })} />
                </Row>
              ))}
              <Row>
                {!f.cover.health ? <Button label="Compare health cover" variant="outline" onPress={() => router.push("/product/family-health")} /> : null}
                <Button label="Remove" variant="link" onPress={() => remove.mutate(f.id)} />
              </Row>
            </Card>
          ))
        }
      </QueryView>
      <Button label="Add family member" onPress={() => setOpen(true)} />
      <BottomSheet open={open} onClose={() => setOpen(false)} title="Add family member">
        <View style={{ gap: 14 }}>
          <FormField label="Name" value={name} onChangeText={setName} placeholder="Kavya" />
          <Chips value={relation} onChange={setRelation} items={(["spouse", "child", "parent", "sibling"] as const).map((r) => ({ id: r, label: r[0].toUpperCase() + r.slice(1) }))} />
          <FormField label="Birth year · optional" value={year} onChangeText={(t) => setYear(t.replace(/\D/g, "").slice(0, 4))} keyboardType="number-pad" placeholder="1993" error={add.error?.message} />
          <Button label="Add" block disabled={name.trim().length < 2} loading={add.isPending} onPress={() => add.mutate()} />
        </View>
      </BottomSheet>
      <Text variant="xs" style={{ color: colors.mute }}>Family health on RFIN shows here once it's issued.</Text>
    </Screen>
  );
}
