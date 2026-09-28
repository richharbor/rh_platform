import { Share2, ShieldCheck, Users } from "lucide-react-native";
import { useMemo, useState } from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { Rise } from "@/components/motion";
import { Screen } from "@/components/Screen";
import {
  BigNumber,
  Btn,
  EmptyState,
  GradientSurface,
  IconBadge,
  PageHeader,
  SectionHeader,
  StatusChip,
  Surface,
} from "@/components/ui";
import {
  formatCompact,
  formatINR,
  productBySlug,
  referrals,
  user,
  type Referral,
} from "@/lib/rfin-data";
import { fonts, radius, useTheme, useThemedStyles, type Theme } from "@/theme";

const STATUSES = ["All", "Shared", "Enquired", "In progress", "Converted", "Paid"] as const;
type Filter = (typeof STATUSES)[number];

export default function ReferralDashboard() {
  const { colors, t } = useTheme();
  const styles = useThemedStyles(makeStyles);
  const [filter, setFilter] = useState<Filter>("All");
  const [open, setOpen] = useState<string | null>(null);

  const rows = useMemo(
    () => (filter === "All" ? referrals : referrals.filter((r) => r.status === filter)),
    [filter],
  );
  const converted = referrals.filter((r) => r.status === "Converted" || r.status === "Paid").length;
  const potential = referrals.filter((r) => r.status !== "Paid").reduce((s, r) => s + r.benefit, 0);

  return (
    <Screen>
      <PageHeader
        title="Refer & earn"
        subtitle="Introduce your network, earn on conversion"
        back="/"
      />

      <View style={{ paddingHorizontal: 20 }}>
        <Rise>
          <GradientSurface tone="navy" style={{ padding: 20 }}>
            <Text style={[t.eyebrow, { color: colors.navyMuted }]}>
              Referral earnings this month
            </Text>
            <BigNumber
              value={formatINR(user.referralEarnings.month)}
              size="xl"
              style={{ marginTop: 4, color: colors.navyForeground }}
            />
            <Text style={styles.heroSub}>Lifetime {formatINR(user.referralEarnings.lifetime)}</Text>
            <View style={styles.statRow}>
              <MiniStat label="Referrals" value={String(referrals.length)} />
              <MiniStat label="Converted" value={String(converted)} />
              <MiniStat label="Potential" value={formatINR(potential)} />
            </View>
            <Btn
              label="Create referral"
              icon={Share2}
              variant="earn"
              to="/refer/new"
              style={{ marginTop: 16 }}
            />
          </GradientSurface>
        </Rise>
      </View>

      <View style={{ paddingTop: 28 }}>
        <SectionHeader title="Your referrals" />
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ paddingHorizontal: 20, gap: 8, paddingBottom: 4 }}
        >
          {STATUSES.map((s) => {
            const active = filter === s;
            const count =
              s === "All" ? referrals.length : referrals.filter((r) => r.status === s).length;
            return (
              <Pressable
                key={s}
                onPress={() => setFilter(s)}
                style={[styles.filter, active ? styles.filterActive : styles.filterIdle]}
              >
                <Text
                  style={[
                    styles.filterText,
                    { color: active ? colors.navyForeground : colors.mutedForeground },
                  ]}
                >
                  {s} · {count}
                </Text>
              </Pressable>
            );
          })}
        </ScrollView>

        {rows.length === 0 ? (
          <View style={{ paddingTop: 20 }}>
            <EmptyState
              title={`Nothing in ${filter}`}
              body="Share a product link and your referrals will show up here as they progress."
            />
          </View>
        ) : (
          <View style={{ gap: 12, paddingHorizontal: 20, paddingTop: 16 }}>
            {rows.map((r) => (
              <ReferralRow
                key={r.id}
                referral={r}
                expanded={open === r.id}
                onToggle={() => setOpen(open === r.id ? null : r.id)}
              />
            ))}
          </View>
        )}
      </View>

      <View style={{ paddingHorizontal: 20, paddingTop: 28 }}>
        <Surface style={styles.consentCard}>
          <IconBadge icon={ShieldCheck} bg={colors.infoSoft} color={colors.brandText} />
          <View style={{ flex: 1 }}>
            <Text style={styles.consentTitle}>Consent-first referrals</Text>
            <Text style={t.xs}>
              Every referral records consent, timestamp and reward eligibility — so payouts are
              auditable.
            </Text>
          </View>
        </Surface>
      </View>
    </Screen>
  );
}

function ReferralRow({
  referral: r,
  expanded,
  onToggle,
}: {
  referral: Referral;
  expanded: boolean;
  onToggle: () => void;
}) {
  const { colors, t, num } = useTheme();
  const styles = useThemedStyles(makeStyles);
  const product = productBySlug(r.product);
  return (
    <Pressable onPress={onToggle}>
      <Surface style={{ padding: 16 }}>
        <View style={styles.headRow}>
          <IconBadge icon={Users} bg={colors.muted} color={colors.brandText} />
          <View style={{ flex: 1, minWidth: 0 }}>
            <Text style={styles.person}>{r.person}</Text>
            <Text style={t.xs} numberOfLines={1}>
              {product?.name} · {r.date}
            </Text>
          </View>
          <View style={{ alignItems: "flex-end", gap: 4 }}>
            <Text style={num(16, colors.earn)}>{formatINR(r.benefit)}</Text>
            <StatusChip label={r.status} />
          </View>
        </View>

        {expanded && (
          <View style={styles.meta}>
            <Meta k="Referral ID" v={r.id} />
            <Meta k="Referrer" v={`${user.name} (${user.rfinId})`} />
            <Meta k="Referred person" v={r.person} />
            <Meta k="Product" v={product?.name ?? "—"} />
            <Meta k="Timestamp" v={`${r.date}, 2026`} />
            <Meta k="Consent" v={r.consent ? "Recorded" : "Missing"} />
            <Meta k="Lead status" v={r.status} />
            <Meta
              k="Conversion"
              v={r.status === "Converted" || r.status === "Paid" ? "Yes" : "Pending"}
            />
            <Meta k="Revenue" v={r.amount ? formatCompact(r.amount) : "—"} />
            <Meta k="Reward eligibility" v={formatINR(r.benefit)} />
            <Meta k="Payout status" v={r.status === "Paid" ? "Paid" : "Pending"} />
          </View>
        )}
      </Surface>
    </Pressable>
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

function MiniStat({ label, value }: { label: string; value: string }) {
  const styles = useThemedStyles(makeStyles);
  return (
    <View style={styles.miniStat}>
      <Text style={styles.miniStatLabel} numberOfLines={1}>
        {label}
      </Text>
      <Text style={styles.miniStatValue} numberOfLines={1} adjustsFontSizeToFit>
        {value}
      </Text>
    </View>
  );
}

const makeStyles = ({ colors }: Theme) =>
  StyleSheet.create({
    heroSub: {
      marginTop: 8,
      fontSize: 14,
      lineHeight: 20,
      fontFamily: fonts.regular,
      color: colors.navyMuted,
    },
    statRow: { marginTop: 20, flexDirection: "row", gap: 8 },
    miniStat: {
      flex: 1,
      borderRadius: radius["2xl"],
      backgroundColor: colors.onDark10,
      paddingHorizontal: 12,
      paddingVertical: 10,
    },
    miniStatLabel: {
      fontSize: 10,
      fontFamily: fonts.semibold,
      textTransform: "uppercase",
      letterSpacing: 0.4,
      color: colors.navyMuted,
    },
    miniStatValue: {
      fontFamily: fonts.displayBold,
      fontSize: 18,
      lineHeight: 28,
      letterSpacing: -0.63,
      marginTop: 2,
      color: colors.navyForeground,
    },
    filter: {
      borderRadius: radius.full,
      paddingHorizontal: 14,
      paddingVertical: 8,
      borderWidth: 1,
    },
    filterActive: { backgroundColor: colors.navy, borderColor: colors.navy },
    filterIdle: { backgroundColor: colors.card, borderColor: colors.border },
    filterText: { fontSize: 12, lineHeight: 16, fontFamily: fonts.semibold },
    headRow: { flexDirection: "row", alignItems: "center", gap: 12 },
    person: { fontSize: 15, fontFamily: fonts.bold, color: colors.foreground },
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
    consentCard: { flexDirection: "row", alignItems: "center", gap: 12, padding: 16 },
    consentTitle: {
      fontSize: 14,
      lineHeight: 20,
      fontFamily: fonts.bold,
      color: colors.foreground,
    },
  });
