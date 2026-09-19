import { useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { Rise } from "@/components/motion";
import { Screen } from "@/components/Screen";
import {
  BigNumber,
  Btn,
  PageHeader,
  SectionHeader,
  StatusChip,
  Stat,
  Surface,
} from "@/components/ui";
import { formatINR, ledger, productBySlug, user, type LedgerEntry } from "@/lib/rfin-data";
import { fonts, radius, useTheme, useThemedStyles, type Theme } from "@/theme";

type Book = "all" | "Seller" | "Referral";

export default function SellerEarningsScreen() {
  const { colors, t, num } = useTheme();
  const styles = useThemedStyles(makeStyles);
  const [book, setBook] = useState<Book>("all");
  const [open, setOpen] = useState<string | null>(null);

  const entries = ledger.filter((e) => e.ledger === "earnings");
  const rows = book === "all" ? entries : entries.filter((e) => e.source === book);
  const isMinus = (e: LedgerEntry) => ["Debit", "Reversed", "Expired"].includes(e.state);

  const released = entries
    .filter((e) => e.state === "Released" || e.state === "Credit")
    .reduce((s, e) => s + e.amount, 0);
  const pending = entries.filter((e) => e.state === "Pending").reduce((s, e) => s + e.amount, 0);

  return (
    <Screen>
      <PageHeader
        title="Seller earnings"
        subtitle="Commissions & referral income · not RFIN Points"
        back="/seller"
      />

      <View style={{ paddingHorizontal: 20 }}>
        <Rise>
          <Surface style={{ padding: 20 }}>
            <Text style={[t.eyebrow, { color: colors.mutedForeground }]}>
              Lifetime business earnings
            </Text>
            <BigNumber
              value={formatINR(user.earnings.lifetime + user.referralEarnings.lifetime)}
              size="lg"
              style={{ marginTop: 4 }}
            />
            <View style={styles.splitRow}>
              <View style={{ flex: 1 }}>
                <Text style={[t.eyebrow, { color: colors.mutedForeground }]}>Seller</Text>
                <Text style={styles.splitValue}>{formatINR(user.earnings.lifetime)}</Text>
              </View>
              <View style={{ flex: 1 }}>
                <Text style={[t.eyebrow, { color: colors.mutedForeground }]}>Referral</Text>
                <Text style={styles.splitValue}>{formatINR(user.referralEarnings.lifetime)}</Text>
              </View>
            </View>
          </Surface>
        </Rise>

        <View style={styles.statRow}>
          <Stat
            label="This month"
            value={formatINR(user.earnings.month)}
            tone="earn"
            style={{ flex: 1 }}
          />
          <Stat
            label="Pending"
            value={formatINR(pending || user.earnings.pending)}
            style={{ flex: 1 }}
          />
        </View>

        <Surface style={styles.payoutCard}>
          <View style={{ flex: 1 }}>
            <Text style={styles.payoutTitle}>Next payout</Text>
            <Text style={t.xs}>
              {formatINR(released)} released · credited to {user.bank}
            </Text>
          </View>
          <StatusChip label="Scheduled" />
        </Surface>
      </View>

      <View style={{ paddingTop: 28 }}>
        <SectionHeader title="Earnings ledger" />
        <View style={{ paddingHorizontal: 20 }}>
          <View style={styles.tabs}>
            {(["all", "Seller", "Referral"] as const).map((b) => (
              <Pressable
                key={b}
                onPress={() => {
                  setBook(b);
                  setOpen(null);
                }}
                style={[styles.tab, book === b && styles.tabActive]}
              >
                <Text
                  style={[
                    styles.tabLabel,
                    { color: book === b ? colors.foreground : colors.mutedForeground },
                  ]}
                >
                  {b === "all" ? "All" : b}
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
                        {formatINR(e.amount)}
                      </Text>
                      <StatusChip label={e.state} />
                    </View>
                  </View>
                  {expanded && (
                    <Rise>
                      <View style={styles.meta}>
                        <Meta k="Transaction ID" v={e.id} />
                        <Meta k="Product" v={p ?? "—"} />
                        <Meta k="Status" v={e.state} />
                        <Meta k="Amount" v={formatINR(e.amount)} />
                        <Meta k="Date" v={e.ts} />
                        <Meta k="Source" v={e.source} />
                        <Meta k="Actor" v={e.actor} />
                        <Meta k="Payout status" v={e.payout} />
                      </View>
                    </Rise>
                  )}
                </Pressable>
              );
            })}
          </Surface>

          <Btn
            label="View both ledgers"
            variant="ghost"
            to="/transactions"
            style={{ marginTop: 16 }}
          />
        </View>
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
    splitRow: { marginTop: 16, flexDirection: "row", gap: 12 },
    splitValue: {
      fontFamily: fonts.displayBold,
      fontSize: 18,
      lineHeight: 28,
      letterSpacing: -0.63,
      marginTop: 2,
      color: colors.foreground,
    },
    statRow: { marginTop: 16, flexDirection: "row", gap: 12 },
    payoutCard: { marginTop: 16, flexDirection: "row", alignItems: "center", gap: 12, padding: 16 },
    payoutTitle: { fontSize: 14, lineHeight: 20, fontFamily: fonts.bold, color: colors.foreground },
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
