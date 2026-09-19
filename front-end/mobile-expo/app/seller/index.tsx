import type { Href } from "expo-router";
import { ArrowUpRight, ChevronRight, Plus, Receipt, Users } from "lucide-react-native";
import { ScrollView, StyleSheet, Text, View } from "react-native";
import { Rise } from "@/components/motion";
import { productIcon } from "@/components/ProductCard";
import { Screen } from "@/components/Screen";
import { Touchable } from "@/components/Touchable";
import {
  BigNumber,
  Btn,
  DividedSurface,
  GradientSurface,
  IconBadge,
  ListRow,
  PageHeader,
  SectionHeader,
  StatusChip,
  Surface,
} from "@/components/ui";
import { formatINR, LEAD_STAGES, leads, productBySlug, user } from "@/lib/rfin-data";
import { fonts, radius, useTheme, useThemedStyles, type Theme } from "@/theme";

/** Product shortcuts from the brief: Life · Health · Motor · Loans · Unlisted */
const shortcuts: { slug: string; label: string; href: Href }[] = [
  {
    slug: "life-insurance",
    label: "Life",
    href: { pathname: "/product/[slug]", params: { slug: "life-insurance" } },
  },
  {
    slug: "health-insurance",
    label: "Health",
    href: { pathname: "/product/[slug]", params: { slug: "health-insurance" } },
  },
  {
    slug: "motor-insurance",
    label: "Motor",
    href: { pathname: "/product/[slug]", params: { slug: "motor-insurance" } },
  },
  {
    slug: "personal-loan",
    label: "Loans",
    href: { pathname: "/explore/[category]", params: { category: "loans" } },
  },
  {
    slug: "unlisted-shares",
    label: "Unlisted",
    href: { pathname: "/explore/[category]", params: { category: "private-markets" } },
  },
];

export default function SellerDashboard() {
  const { colors, t, num } = useTheme();
  const styles = useThemedStyles(makeStyles);
  const active = leads.filter((l) => !["Payout", "Successful"].includes(l.stage));
  const conversions = leads.filter((l) => ["Payout", "Successful"].includes(l.stage));
  const pipelineValue = active.reduce((s, l) => s + l.potential, 0);

  return (
    <Screen>
      <PageHeader title="Seller" subtitle="Build and manage your business" back="/" />

      <View style={{ paddingHorizontal: 20 }}>
        <Rise>
          <GradientSurface tone="navy" style={{ padding: 20 }}>
            <View style={styles.rowBetween}>
              <View style={{ flex: 1 }}>
                <Text style={[t.eyebrow, { color: colors.navyMuted }]}>This month earnings</Text>
                <BigNumber
                  value={formatINR(user.earnings.month)}
                  size="xl"
                  style={{ marginTop: 4, color: colors.navyForeground }}
                />
              </View>
              <View style={styles.deltaPill}>
                <ArrowUpRight size={14} color={colors.earnForeground} />
                <Text style={styles.deltaText}>18%</Text>
              </View>
            </View>
            <View style={styles.statRow}>
              <MiniStat label="Pending" value={formatINR(user.earnings.pending)} />
              <MiniStat label="Active leads" value={String(active.length)} />
              <MiniStat label="Conversions" value={String(conversions.length)} />
            </View>
            <View style={styles.btnRow}>
              <Btn
                label="Create new lead"
                icon={Plus}
                variant="earn"
                to="/seller/leads/new"
                style={{ flex: 1 }}
              />
              <Btn label="Earnings" variant="onDark" to="/seller/earnings" />
            </View>
          </GradientSurface>
        </Rise>
      </View>

      <View style={{ paddingTop: 28 }}>
        <SectionHeader title="Sell a product" to="/explore" linkLabel="All products" />
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ paddingHorizontal: 20, gap: 12 }}
        >
          {shortcuts.map((s) => {
            const Icon = productIcon[s.slug];
            return (
              <Touchable
                key={s.label}
                href={s.href}
                style={styles.shortcut}
                pressedStyle={{ transform: [{ scale: 0.97 }] }}
              >
                <IconBadge icon={Icon} bg={colors.infoSoft} color={colors.brandText} />
                <Text style={styles.shortcutLabel}>{s.label}</Text>
              </Touchable>
            );
          })}
        </ScrollView>
      </View>

      <View style={{ paddingTop: 28 }}>
        <SectionHeader title="Pipeline" to="/seller/leads" linkLabel="Manage" />
        <Rise delay={60} style={{ marginHorizontal: 20 }}>
          <Surface style={{ padding: 16 }}>
            <View style={styles.rowBetween}>
              <View>
                <Text style={[t.eyebrow, { color: colors.mutedForeground }]}>
                  Potential earnings
                </Text>
                <Text style={[num(24, colors.earn), { marginTop: 2 }]}>
                  {formatINR(pipelineValue)}
                </Text>
              </View>
              <IconBadge icon={Users} bg={colors.earnSoft} color={colors.earn} />
            </View>
            <View style={styles.stageGrid}>
              {LEAD_STAGES.map((stage) => (
                <View key={stage} style={styles.stageCell}>
                  <Text style={num(18)}>{leads.filter((l) => l.stage === stage).length}</Text>
                  <Text style={styles.stageLabel} numberOfLines={1}>
                    {stage}
                  </Text>
                </View>
              ))}
            </View>
          </Surface>
        </Rise>
      </View>

      <View style={{ paddingTop: 28 }}>
        <SectionHeader title="Recent leads" to="/seller/leads" />
        <DividedSurface style={{ marginHorizontal: 20 }}>
          {leads.slice(0, 4).map((l) => (
            <Touchable
              key={l.id}
              href="/seller/leads"
              style={styles.leadRow}
              pressedStyle={{ backgroundColor: colors.secondary }}
            >
              <View style={{ flex: 1, minWidth: 0 }}>
                <Text style={styles.leadName}>{l.name}</Text>
                <Text style={t.xs} numberOfLines={1}>
                  {productBySlug(l.product)?.name} · {l.updated}
                </Text>
              </View>
              <View style={{ alignItems: "flex-end", gap: 4 }}>
                <Text style={num(15, colors.earn)}>{formatINR(l.potential)}</Text>
                <StatusChip label={l.stage} />
              </View>
            </Touchable>
          ))}
        </DividedSurface>
      </View>

      <View style={{ paddingHorizontal: 20, paddingTop: 24 }}>
        <DividedSurface>
          <ListRow
            icon={Receipt}
            title="Seller earnings"
            subtitle="Commissions & payout status"
            to="/seller/earnings"
          />
          <ListRow
            icon={Users}
            title="All leads"
            subtitle={`${leads.length} in pipeline`}
            to="/seller/leads"
          />
        </DividedSurface>
      </View>
    </Screen>
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

const makeStyles = ({ colors, surface }: Theme) =>
  StyleSheet.create({
    rowBetween: {
      flexDirection: "row",
      alignItems: "flex-start",
      justifyContent: "space-between",
      gap: 12,
    },
    deltaPill: {
      flexDirection: "row",
      alignItems: "center",
      gap: 4,
      borderRadius: radius.full,
      backgroundColor: colors.earn,
      paddingHorizontal: 10,
      paddingVertical: 5,
    },
    deltaText: {
      fontSize: 12,
      lineHeight: 16,
      fontFamily: fonts.bold,
      color: colors.earnForeground,
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
    btnRow: { marginTop: 16, flexDirection: "row", gap: 8 },
    shortcut: { ...surface, width: 92, alignItems: "center", gap: 8, paddingVertical: 14 },
    shortcutLabel: {
      fontSize: 12,
      lineHeight: 16,
      fontFamily: fonts.semibold,
      color: colors.foreground,
    },
    stageGrid: { marginTop: 16, flexDirection: "row", flexWrap: "wrap", rowGap: 12 },
    stageCell: { width: "33.33%" },
    stageLabel: { fontSize: 11, fontFamily: fonts.medium, color: colors.mutedForeground },
    leadRow: {
      flexDirection: "row",
      alignItems: "center",
      gap: 12,
      paddingHorizontal: 16,
      paddingVertical: 14,
    },
    leadName: {
      fontSize: 14,
      lineHeight: 20,
      fontFamily: fonts.semibold,
      color: colors.foreground,
    },
  });
