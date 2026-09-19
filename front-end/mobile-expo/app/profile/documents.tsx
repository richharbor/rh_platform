import { FileText, Upload } from "lucide-react-native";
import { useMemo, useState } from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { Screen } from "@/components/Screen";
import { useToast } from "@/components/Toast";
import { Btn, EmptyState, IconBadge, PageHeader, StatusChip, Surface } from "@/components/ui";
import { documents, productBySlug, type DocItem } from "@/lib/rfin-data";
import { fonts, radius, useTheme, useThemedStyles, type Theme } from "@/theme";

const FILTERS = ["All", "Requested", "Uploaded", "In review", "Expired"] as const;
type Filter = (typeof FILTERS)[number];

export default function DocumentsScreen() {
  const { colors, t } = useTheme();
  const styles = useThemedStyles(makeStyles);
  const toast = useToast();
  const [filter, setFilter] = useState<Filter>("All");

  const rows = useMemo(
    () => (filter === "All" ? documents : documents.filter((d) => d.state === filter)),
    [filter],
  );
  const actionNeeded = documents.filter(
    (d) => d.state === "Requested" || d.state === "Expired",
  ).length;

  const grouped = useMemo(() => {
    const m = new Map<DocItem["category"], DocItem[]>();
    for (const d of rows) m.set(d.category, [...(m.get(d.category) ?? []), d]);
    return [...m.entries()];
  }, [rows]);

  return (
    <Screen>
      <PageHeader
        title="Documents"
        subtitle={`${documents.length} total · ${actionNeeded} need action`}
        back="/profile"
      />

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ paddingHorizontal: 20, gap: 8, paddingBottom: 4 }}
      >
        {FILTERS.map((f) => {
          const active = filter === f;
          const count =
            f === "All" ? documents.length : documents.filter((d) => d.state === f).length;
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
            title={`Nothing ${filter.toLowerCase()}`}
            body="Documents you upload or that RFIN requests will appear here."
          />
        </View>
      ) : (
        grouped.map(([category, items]) => (
          <View key={category} style={{ paddingHorizontal: 20, paddingTop: 20 }}>
            <Text style={[t.eyebrow, { color: colors.mutedForeground, marginBottom: 8 }]}>
              {category}
            </Text>
            <View style={{ gap: 12 }}>
              {items.map((d) => {
                const needs = d.state === "Requested" || d.state === "Expired";
                return (
                  <Surface key={d.id} style={{ padding: 16 }}>
                    <View style={styles.row}>
                      <IconBadge
                        icon={FileText}
                        bg={needs ? colors.warningSoft : colors.muted}
                        color={needs ? colors.warning : colors.navy}
                      />
                      <View style={{ flex: 1, minWidth: 0 }}>
                        <Text style={styles.name}>{d.name}</Text>
                        <Text style={t.xs}>{d.meta}</Text>
                        {d.forProduct && (
                          <Text style={[t.xs, { color: colors.earn }]}>
                            For {productBySlug(d.forProduct)?.name}
                          </Text>
                        )}
                      </View>
                      <StatusChip label={d.state} />
                    </View>
                    {needs && (
                      <Btn
                        label={d.state === "Expired" ? "Re-upload" : "Upload"}
                        icon={Upload}
                        variant="earn"
                        style={{ marginTop: 12 }}
                        onPress={() =>
                          toast(`Upload ${d.name}`, {
                            description:
                              "Wire this to expo-document-picker once the upload API exists.",
                          })
                        }
                      />
                    )}
                  </Surface>
                );
              })}
            </View>
          </View>
        ))
      )}

      <View style={{ paddingHorizontal: 20, paddingTop: 24 }}>
        <Btn
          label="Upload a document"
          icon={Upload}
          variant="ghost"
          onPress={() => toast("Document picker", { description: "Not wired up yet." })}
        />
      </View>
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
    row: { flexDirection: "row", alignItems: "center", gap: 12 },
    name: { fontSize: 14, lineHeight: 20, fontFamily: fonts.semibold, color: colors.foreground },
  });
