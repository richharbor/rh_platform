import { useLocalSearchParams, useRouter } from "expo-router";
import { ScrollView, View } from "react-native";
import { useProducts } from "@/api/hooks";
import { useTheme } from "@/design";
import { PageHeader } from "@/features/PageHeader";
import { Button, Display, QueryView, Screen, Text } from "@/ui";

const COL = 200;

/** Side-by-side on decision-critical dimensions only (report #26). */
export default function Compare() {
  const { ids = "" } = useLocalSearchParams<{ ids: string }>();
  const router = useRouter();
  const { colors } = useTheme();
  const all = useProducts();
  const wanted = ids.split(",").filter(Boolean);

  return (
    <Screen header={<PageHeader label={`${wanted.length} options`} />} eyebrow="Compare" title="Side by side." subtitle="Only what changes the decision: cost, what you'll need, and the main risks.">
      <QueryView query={all}>
        {(list) => {
          const items = wanted.map((id) => list.find((p) => p.id === id)).filter((p) => !!p);
          const rows: { label: string; value: (p: (typeof items)[number]) => string }[] = [
            { label: "Provider", value: (p) => p.provider },
            ...items[0].costs.map((c, i) => ({ label: c.label, value: (p: (typeof items)[number]) => p.costs[i]?.value ?? "—" })),
            { label: "You'll need", value: (p) => p.requirements.join(", ") },
            { label: "Main risk", value: (p) => p.risks[0] ?? "—" },
            { label: "Timeline", value: (p) => p.whatNext[p.whatNext.length - 1] ?? "—" },
          ];
          return (
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginHorizontal: -20 }} contentContainerStyle={{ paddingHorizontal: 20 }}>
              <View>
                <View style={{ flexDirection: "row" }}>
                  {items.map((p) => (
                    <View key={p.id} style={{ width: COL, paddingRight: 16, paddingBottom: 12, gap: 10 }}>
                      <Display size={22}>{p.name}</Display>
                      <Button label="Choose" onPress={() => router.push(`/product/${p.id}`)} />
                    </View>
                  ))}
                </View>
                {rows.map((r) => (
                  <View key={r.label} style={{ borderTopWidth: 1, borderTopColor: colors.line, paddingVertical: 12 }}>
                    <Text variant="label" style={{ marginBottom: 6 }}>{r.label}</Text>
                    <View style={{ flexDirection: "row" }}>
                      {items.map((p) => (
                        <Text key={p.id} variant="body" style={{ width: COL, paddingRight: 16 }}>{r.value(p)}</Text>
                      ))}
                    </View>
                  </View>
                ))}
              </View>
            </ScrollView>
          );
        }}
      </QueryView>
    </Screen>
  );
}
