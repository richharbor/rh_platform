import { Crown, Gift, Sparkles, Ticket, Trophy } from "lucide-react-native";
import { ScrollView, StyleSheet, Text, View } from "react-native";
import { Rise } from "@/components/motion";
import { Screen } from "@/components/Screen";
import {
  BigNumber,
  Btn,
  GradientSurface,
  IconBadge,
  ProgressBar,
  SectionHeader,
  Surface,
} from "@/components/ui";
import { formatIN, tiers, user } from "@/lib/rfin-data";
import { fonts, radius, useTheme, useThemedStyles, type Theme } from "@/theme";

const benefits = [
  {
    tier: "Gold",
    items: ["Priority advisor support", "2× points on insurance", "Quarterly lucky draw"],
  },
  {
    tier: "Platinum",
    items: ["Dedicated relationship manager", "Faster payouts (T+2)", "Event invitations"],
  },
];

const campaigns = [
  {
    title: "Festive Protect",
    body: "Buy any insurance before 31 Oct — earn 2× points",
    tag: "Live",
  },
  {
    title: "Loan Sprint",
    body: "Refer 3 loan enquiries this month, unlock ₹1,000 bonus",
    tag: "Ends in 12 days",
  },
];

export default function RewardsScreen() {
  const { colors, t } = useTheme();
  const styles = useThemedStyles(makeStyles);
  const currentIdx = tiers.findIndex((tr) => tr.name === user.tier);
  const progress =
    ((user.points - tiers[currentIdx].at) / (tiers[currentIdx + 1].at - tiers[currentIdx].at)) *
    100;

  return (
    <Screen>
      <View style={styles.header}>
        <Text style={t.h1}>Rewards</Text>
        <Text style={t.muted}>RFIN Points & promotional benefits</Text>
      </View>

      <View style={{ paddingHorizontal: 20, paddingTop: 20 }}>
        <Rise>
          <GradientSurface tone="gold" style={{ padding: 20 }}>
            <View style={styles.rowBetween}>
              <View style={{ flex: 1 }}>
                <Text style={[t.eyebrow, { color: colors.goldForeground, opacity: 0.8 }]}>
                  RFIN Points balance
                </Text>
                <BigNumber
                  value={formatIN(user.points)}
                  size="xl"
                  style={{ marginTop: 4, color: colors.goldForeground }}
                />
              </View>
              <View style={styles.tierPill}>
                <Crown size={14} color={colors.goldForeground} />
                <Text style={styles.tierPillText}>{user.tier}</Text>
              </View>
            </View>
            <ProgressBar
              value={progress}
              tone="navy"
              trackColor={colors.onGold15}
              style={{ marginTop: 20 }}
            />
            <View style={styles.progressLabels}>
              <Text style={styles.progressLabel}>{user.tier}</Text>
              <Text style={styles.progressLabel}>
                {formatIN(user.nextTierAt - user.points)} pts to {user.nextTier}
              </Text>
            </View>
            <Btn
              label="Points wallet"
              variant="primary"
              to="/transactions"
              style={{ marginTop: 16 }}
            />
          </GradientSurface>
        </Rise>
      </View>

      <View style={{ paddingTop: 28 }}>
        <SectionHeader title="Tier journey" />
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ paddingHorizontal: 20, gap: 8 }}
        >
          {tiers.map((tr, i) => {
            const past = i < currentIdx;
            const current = i === currentIdx;
            return (
              <View
                key={tr.name}
                style={[
                  styles.tierCard,
                  past && styles.tierPast,
                  current && styles.tierCurrent,
                  !past && !current && styles.tierFuture,
                ]}
              >
                <Trophy
                  size={20}
                  color={current ? colors.gold : past ? colors.earn : colors.mutedForeground}
                />
                <Text style={[styles.tierName, current && { color: colors.navyForeground }]}>
                  {tr.name}
                </Text>
                <Text
                  style={[
                    styles.tierPts,
                    { color: current ? colors.navyMuted : colors.mutedForeground },
                  ]}
                >
                  {formatIN(tr.at)}+ pts
                </Text>
              </View>
            );
          })}
        </ScrollView>
      </View>

      <View style={{ paddingTop: 28 }}>
        <SectionHeader title="Your benefits" />
        <View style={{ gap: 12, paddingHorizontal: 20 }}>
          {benefits.map((b) => (
            <Surface key={b.tier} style={{ padding: 16 }}>
              <View style={styles.benefitHeader}>
                <Gift size={16} color={colors.goldForeground} />
                <Text style={styles.benefitTier}>{b.tier}</Text>
                {b.tier === user.tier && (
                  <View style={styles.activeBadge}>
                    <Text style={styles.activeBadgeText}>ACTIVE</Text>
                  </View>
                )}
              </View>
              <View style={{ marginTop: 8, gap: 4 }}>
                {b.items.map((i) => (
                  <Text
                    key={i}
                    style={[
                      t.body,
                      { fontSize: 14, lineHeight: 20, color: colors.mutedForeground },
                    ]}
                  >
                    · {i}
                  </Text>
                ))}
              </View>
            </Surface>
          ))}
        </View>
      </View>

      <View style={{ paddingHorizontal: 20, paddingTop: 28 }}>
        <GradientSurface tone="navy" style={styles.drawCard}>
          <IconBadge
            icon={Ticket}
            size={48}
            iconSize={24}
            bg={colors.onDark12}
            color={colors.gold}
          />
          <View style={{ flex: 1 }}>
            <Text style={[t.eyebrow, { color: colors.navyMuted }]}>Quarterly lucky draw</Text>
            <Text style={styles.drawTitle}>3 entries earned</Text>
            <Text style={styles.drawSub}>Draw on 30 Sep · Gold tier & above</Text>
          </View>
        </GradientSurface>
      </View>

      <View style={{ paddingTop: 28 }}>
        <SectionHeader title="Campaigns" />
        <View style={{ gap: 12, paddingHorizontal: 20 }}>
          {campaigns.map((c) => (
            <Surface key={c.title} style={styles.campaign}>
              <Sparkles size={20} color={colors.goldForeground} style={{ marginTop: 2 }} />
              <View style={{ flex: 1 }}>
                <Text style={styles.campaignTitle}>{c.title}</Text>
                <Text style={t.xs}>{c.body}</Text>
              </View>
              <View style={styles.campaignTag}>
                <Text style={styles.campaignTagText}>{c.tag}</Text>
              </View>
            </Surface>
          ))}
        </View>
      </View>
    </Screen>
  );
}

const makeStyles = ({ colors, shadowElevated }: Theme) =>
  StyleSheet.create({
    header: { paddingHorizontal: 20, paddingTop: 24 },
    rowBetween: {
      flexDirection: "row",
      alignItems: "flex-start",
      justifyContent: "space-between",
      gap: 12,
    },
    tierPill: {
      flexDirection: "row",
      alignItems: "center",
      gap: 6,
      borderRadius: radius.full,
      backgroundColor: colors.onGold10,
      paddingHorizontal: 12,
      paddingVertical: 6,
    },
    tierPillText: {
      fontSize: 12,
      lineHeight: 16,
      fontFamily: fonts.bold,
      color: colors.goldForeground,
    },
    progressLabels: { marginTop: 8, flexDirection: "row", justifyContent: "space-between" },
    progressLabel: {
      fontSize: 12,
      lineHeight: 16,
      fontFamily: fonts.medium,
      color: colors.goldForeground,
      opacity: 0.9,
    },
    tierCard: {
      minWidth: 104,
      alignItems: "center",
      borderRadius: radius["2xl"],
      borderWidth: 1,
      padding: 12,
    },
    tierPast: { backgroundColor: colors.earnSoft, borderColor: "rgba(0,148,86,0.3)" },
    tierCurrent: { backgroundColor: colors.navy, borderColor: colors.navy, ...shadowElevated },
    tierFuture: { backgroundColor: colors.card, borderColor: colors.border },
    tierName: {
      marginTop: 8,
      fontSize: 14,
      lineHeight: 20,
      fontFamily: fonts.bold,
      color: colors.foreground,
    },
    tierPts: { fontSize: 11, fontFamily: fonts.regular },
    benefitHeader: { flexDirection: "row", alignItems: "center", gap: 8 },
    benefitTier: { fontSize: 14, lineHeight: 20, fontFamily: fonts.bold, color: colors.foreground },
    activeBadge: {
      borderRadius: radius.full,
      backgroundColor: colors.earnSoft,
      paddingHorizontal: 8,
      paddingVertical: 2,
    },
    activeBadgeText: { fontSize: 10, fontFamily: fonts.bold, color: colors.earn },
    drawCard: { flexDirection: "row", alignItems: "center", gap: 16, padding: 20 },
    drawTitle: {
      fontFamily: fonts.displayBold,
      fontSize: 16,
      lineHeight: 24,
      color: colors.navyForeground,
    },
    drawSub: { fontSize: 12, lineHeight: 16, fontFamily: fonts.regular, color: colors.navyMuted },
    campaign: { flexDirection: "row", alignItems: "flex-start", gap: 12, padding: 16 },
    campaignTitle: {
      fontSize: 14,
      lineHeight: 20,
      fontFamily: fonts.bold,
      color: colors.foreground,
    },
    campaignTag: {
      borderRadius: radius.full,
      backgroundColor: colors.goldSoft,
      paddingHorizontal: 8,
      paddingVertical: 4,
    },
    campaignTagText: { fontSize: 10, fontFamily: fonts.bold, color: colors.goldForeground },
  });
