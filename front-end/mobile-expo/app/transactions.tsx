import { useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { Rise } from "@/components/motion";
import { Screen } from "@/components/Screen";
import { PageHeader, StatusChip, Surface } from "@/components/ui";
import { formatINR, ledger, productBySlug, type LedgerEntry } from "@/lib/rfin-data";
import { fonts, radius, useTheme, useThemedStyles, type Theme } from "@/theme";

export default function TransactionsScreen() {
  const { colors, t, num } = useTheme();
  const styles = useThemedStyles(makeStyles);
  const [tab, setTab] = useState<"earnings" | "points">("earnings");
  const [open, setOpen] = useState<string | null>(null);
  const rows = ledger.filter((l) => l.ledger === tab);
  const isMinus = (e: LedgerEntry) => ["Debit", "Reversed", "Expired"].includes(e.state);

  return (
    <Screen>
      <PageHeader
        title="Transactions"
        subtitle="Auditable ledger · two separate books"
        back="/profile"
      />
      <View style={{ paddingHorizontal: 20 }}>
        <View style={styles.tabs}>
          {(["earnings", "points"] as const).map((tk) => (
            <Pressable
              key={tk}
              onPress={() => {
                setTab(tk);
                setOpen(null);
              }}
              style={[styles.tab, tab === tk && styles.tabActive]}
            >
              <Text
                style={[
                  styles.tabLabel,
                  { color: tab === tk ? colors.foreground : colors.mutedForeground },
                ]}
              >
                {tk === "earnings" ? "Business Earnings" : "RFIN Points"}
              </Text>
            </Pressable>
          ))}
        </View>

        <Surface style={{ marginTop: 16, overflow: "hidden" }}>
          {rows.map((e, idx) => {
            const p = e.product !== "—" ? productBySlug(e.product)?.name : undefined;
            const expanded = open === e.id;
            return (
              <Pressable
                key={e.id}
                onPress={() => setOpen(expanded ? null : e.id)}
                style={({ pressed }) => [
                  styles.entry,
                  idx > 0 && styles.entryDivider,
                  pressed && { backgroundColor: colors.secondary },
                ]}
              >
                <View style={styles.entryRow}>
                  <View style={{ flex: 1, minWidth: 0 }}>
                    <Text numberOfLines={2} style={styles.entryReason}>
                      {e.reason}
                    </Text>
                    <Text style={t.xs}>
                      {e.ts} · {p ?? e.source}
                    </Text>
                  </View>
                  <View style={{ alignItems: "flex-end", gap: 4 }}>
                    <Text style={num(16, isMinus(e) ? colors.foreground : colors.earn)}>
                      {isMinus(e) ? "−" : "+"}
                      {tab === "earnings" ? formatINR(e.amount) : `${e.amount} pts`}
                    </Text>
                    <StatusChip label={e.state} />
                  </View>
                </View>
                {expanded && (
                  <Rise>
                    <View style={styles.meta}>
                      <Meta k="Transaction ID" v={e.id} />
                      <Meta k="Timestamp" v={e.ts} />
                      <Meta k="Source" v={e.source} />
                      <Meta k="Actor" v={e.actor} />
                      <Meta k="Product" v={p ?? "—"} />
                      <Meta k="Payout status" v={e.payout} />
                    </View>
                  </Rise>
                )}
              </Pressable>
            );
          })}
        </Surface>
      </View>
    </Screen>
  );
}

function Meta({ k, v }: { k: string; v: string }) {
  const styles = useThemedStyles(makeStyles);
  return (
    <View style={{ width: "47%" }}>
      <Text style={styles.metaKey}>{k}</Text>
      <Text style={styles.metaValue}>{v}</Text>
    </View>
  );
}

const makeStyles = ({ colors, shadowCard }: Theme) =>
  StyleSheet.create({
    tabs: {
      flexDirection: "row",
      borderRadius: radius.full,
      backgroundColor: colors.muted,
      padding: 4,
    },
    tab: { flex: 1, borderRadius: radius.full, paddingVertical: 8, alignItems: "center" },
    tabActive: { backgroundColor: colors.card, ...shadowCard },
    tabLabel: { fontSize: 12, lineHeight: 16, fontFamily: fonts.semibold },
    entry: { paddingHorizontal: 16, paddingVertical: 14 },
    entryDivider: { borderTopWidth: 1, borderTopColor: colors.border },
    entryRow: { flexDirection: "row", alignItems: "center", gap: 12 },
    entryReason: {
      fontSize: 14,
      lineHeight: 20,
      fontFamily: fonts.semibold,
      color: colors.foreground,
    },
    meta: {
      marginTop: 12,
      flexDirection: "row",
      flexWrap: "wrap",
      rowGap: 8,
      columnGap: 16,
      borderRadius: radius["2xl"],
      backgroundColor: colors.muted,
      padding: 12,
    },
    metaKey: {
      fontSize: 12,
      lineHeight: 16,
      fontFamily: fonts.regular,
      color: colors.mutedForeground,
    },
    metaValue: {
      fontSize: 12,
      lineHeight: 16,
      fontFamily: fonts.semibold,
      color: colors.foreground,
    },
  });
