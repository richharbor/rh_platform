import { Plus } from "lucide-react-native";
import { useMemo, useState } from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { Screen } from "@/components/Screen";
import { Btn, EmptyState, PageHeader, ProgressBar, StatusChip, Surface } from "@/components/ui";
import {
  formatCompact,
  formatINR,
  LEAD_STAGES,
  leads,
  productBySlug,
  type LeadStage,
} from "@/lib/rfin-data";
import { fonts, radius, useTheme, useThemedStyles, type Theme } from "@/theme";

type Filter = "All" | LeadStage;
const filters: Filter[] = ["All", ...LEAD_STAGES];

export default function LeadPipelineScreen() {
  const { colors, t, num } = useTheme();
  const styles = useThemedStyles(makeStyles);
  const [filter, setFilter] = useState<Filter>("All");
  const [open, setOpen] = useState<string | null>(null);

  const rows = useMemo(
    () => (filter === "All" ? leads : leads.filter((l) => l.stage === filter)),
    [filter],
  );
  const totalPotential = rows.reduce((s, l) => s + l.potential, 0);

  return (
    <Screen>
      <PageHeader
        title="Lead pipeline"
        subtitle={`${rows.length} leads · ${formatINR(totalPotential)} potential`}
        back="/seller"
        action={
          <Btn label="New" icon={Plus} variant="earn" onPress={undefined} to="/seller/leads/new" />
        }
      />

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ paddingHorizontal: 20, gap: 8, paddingBottom: 4 }}
      >
        {filters.map((f) => {
          const active = filter === f;
          const count = f === "All" ? leads.length : leads.filter((l) => l.stage === f).length;
          return (
            <Pressable
              key={f}
              onPress={() => setFilter(f)}
              style={[styles.filter, active ? styles.filterActive : styles.filterIdle]}
            >
              <Text
                style={[
                  styles.filterText,
                  { color: active ? colors.navyForeground : colors.mutedForeground },
                ]}
              >
                {f} · {count}
              </Text>
            </Pressable>
          );
        })}
      </ScrollView>

      {rows.length === 0 ? (
        <View style={{ paddingTop: 24 }}>
          <EmptyState
            title={`No leads in ${filter}`}
            body="Leads move through New → Contacted → Documents → Processing → Successful → Payout."
          />
        </View>
      ) : (
        <View style={{ gap: 12, paddingHorizontal: 20, paddingTop: 16 }}>
          {rows.map((l) => {
            const stageIdx = LEAD_STAGES.indexOf(l.stage);
            const expanded = open === l.id;
            const product = productBySlug(l.product);
            return (
              <Pressable key={l.id} onPress={() => setOpen(expanded ? null : l.id)}>
                <Surface style={{ padding: 16 }}>
                  <View style={styles.headRow}>
                    <View style={{ flex: 1, minWidth: 0 }}>
                      <Text style={styles.name}>{l.name}</Text>
                      <Text style={t.xs} numberOfLines={1}>
                        {product?.name} · {l.id}
                      </Text>
                    </View>
                    <StatusChip label={l.stage} />
                  </View>

                  <View style={styles.valueRow}>
                    <View>
                      <Text style={[t.eyebrow, { color: colors.mutedForeground }]}>Deal value</Text>
                      <Text style={num(18)}>{formatCompact(l.value)}</Text>
                    </View>
                    <View style={{ alignItems: "flex-end" }}>
                      <Text style={[t.eyebrow, { color: colors.mutedForeground }]}>
                        Your earning
                      </Text>
                      <Text style={num(18, colors.earn)}>{formatINR(l.potential)}</Text>
                    </View>
                  </View>

                  <ProgressBar
                    value={((stageIdx + 1) / LEAD_STAGES.length) * 100}
                    tone={l.stage === "Payout" ? "gold" : "earn"}
                    style={{ marginTop: 12 }}
                  />
                  <View style={styles.stageLabels}>
                    <Text style={t.xs}>
                      Stage {stageIdx + 1} of {LEAD_STAGES.length}
                    </Text>
                    <Text style={t.xs}>Updated {l.updated}</Text>
                  </View>

                  {expanded && (
                    <View style={styles.stepper}>
                      {LEAD_STAGES.map((s, i) => (
                        <View key={s} style={styles.step}>
                          <View
                            style={[
                              styles.stepDot,
                              i <= stageIdx ? styles.stepDotDone : styles.stepDotIdle,
                            ]}
                          />
                          <Text
                            style={[
                              styles.stepLabel,
                              { color: i <= stageIdx ? colors.foreground : colors.mutedForeground },
                            ]}
                          >
                            {s}
                          </Text>
                          {i === stageIdx && <Text style={styles.stepNow}>current</Text>}
                        </View>
                      ))}
                    </View>
                  )}
                </Surface>
              </Pressable>
            );
          })}
        </View>
      )}
    </Screen>
  );
}

const makeStyles = ({ colors }: Theme) =>
  StyleSheet.create({
    filter: {
      borderRadius: radius.full,
      paddingHorizontal: 14,
      paddingVertical: 8,
      borderWidth: 1,
    },
    filterActive: { backgroundColor: colors.navy, borderColor: colors.navy },
    filterIdle: { backgroundColor: colors.card, borderColor: colors.border },
    filterText: { fontSize: 12, lineHeight: 16, fontFamily: fonts.semibold },
    headRow: { flexDirection: "row", alignItems: "flex-start", gap: 12 },
    name: { fontSize: 15, fontFamily: fonts.bold, color: colors.foreground },
    valueRow: { marginTop: 12, flexDirection: "row", justifyContent: "space-between" },
    stageLabels: { marginTop: 6, flexDirection: "row", justifyContent: "space-between" },
    stepper: {
      marginTop: 12,
      borderRadius: radius["2xl"],
      backgroundColor: colors.muted,
      padding: 12,
      gap: 8,
    },
    step: { flexDirection: "row", alignItems: "center", gap: 10 },
    stepDot: { width: 8, height: 8, borderRadius: 4 },
    stepDotDone: { backgroundColor: colors.earn },
    stepDotIdle: { backgroundColor: colors.border },
    stepLabel: { flex: 1, fontSize: 13, fontFamily: fonts.medium },
    stepNow: {
      fontSize: 10,
      fontFamily: fonts.bold,
      color: colors.earn,
      textTransform: "uppercase",
    },
  });
