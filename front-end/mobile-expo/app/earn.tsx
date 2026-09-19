import type { Href } from "expo-router";
import {
  ChevronRight,
  Handshake,
  Share2,
  ShoppingBag,
  Target,
  type LucideIcon,
} from "lucide-react-native";
import { StyleSheet, Text, View } from "react-native";
import { Rise } from "@/components/motion";
import { Screen } from "@/components/Screen";
import { Touchable } from "@/components/Touchable";
import { BigNumber, GradientSurface, IconBadge, ProgressBar, Surface } from "@/components/ui";
import { formatIN, formatINR, user } from "@/lib/rfin-data";
import { fonts, radius, useTheme, useThemedStyles, type Theme } from "@/theme";

export default function EarnScreen() {
  const { colors, t } = useTheme();
  const styles = useThemedStyles(makeStyles);
  const month = user.earnings.month + user.referralEarnings.month;
  const lifetime = user.earnings.lifetime + user.referralEarnings.lifetime;
  const milestone = 500000;

  return (
    <Screen>
      <View style={styles.header}>
        <Text style={t.h1}>Earn</Text>
        <Text style={t.muted}>Business earnings · separate from RFIN Points</Text>
      </View>

      <View style={{ paddingHorizontal: 20, paddingTop: 20 }}>
        <Rise>
          <GradientSurface tone="earn" style={{ padding: 20 }}>
            <Text style={[t.eyebrow, { color: colors.earnForeground, opacity: 0.8 }]}>
              This month
            </Text>
            <BigNumber
              value={formatINR(month)}
              size="xl"
              style={{ marginTop: 4, color: colors.earnForeground }}
            />
            <View style={styles.subRow}>
              <View>
                <Text style={[t.eyebrow, { color: colors.earnForeground, opacity: 0.8 }]}>
                  Lifetime
                </Text>
                <Text style={styles.subValue}>{formatINR(lifetime)}</Text>
              </View>
              <View style={{ alignItems: "flex-end" }}>
                <Text style={[t.eyebrow, { color: colors.earnForeground, opacity: 0.8 }]}>
                  Pending
                </Text>
                <Text style={styles.subValue}>{formatINR(user.earnings.pending)}</Text>
              </View>
            </View>
          </GradientSurface>
        </Rise>
      </View>

      <Rise delay={60} style={{ marginHorizontal: 20, marginTop: 16 }}>
        <Surface style={{ padding: 16 }}>
          <View style={styles.milestoneRow}>
            <IconBadge icon={Target} bg={colors.goldSoft} color={colors.goldForeground} />
            <View style={{ flex: 1 }}>
              <Text style={styles.milestoneTitle}>Next milestone · ₹5 L lifetime</Text>
              <Text style={t.xs}>
                {formatINR(milestone - lifetime)} to go · unlocks Platinum bonus payout
              </Text>
            </View>
          </View>
          <ProgressBar value={(lifetime / milestone) * 100} tone="gold" style={{ marginTop: 12 }} />
        </Surface>
      </Rise>

      <View style={{ gap: 12, paddingHorizontal: 20, paddingTop: 24 }}>
        <Pathway
          to="/explore"
          icon={ShoppingBag}
          label="BUY"
          title="Get eligible benefits"
          month={`${formatIN(user.buyerBenefits.month)} pts`}
          lifetime={`${formatIN(user.buyerBenefits.lifetime)} pts`}
          tone="navy"
        />
        <Pathway
          to="/seller/earnings"
          icon={Handshake}
          label="SELL"
          title="Earn from successful business"
          month={formatINR(user.earnings.month)}
          lifetime={formatINR(user.earnings.lifetime)}
          tone="earn"
        />
        <Pathway
          to="/refer"
          icon={Share2}
          label="REFER"
          title="Earn from successful referrals"
          month={formatINR(user.referralEarnings.month)}
          lifetime={formatINR(user.referralEarnings.lifetime)}
          tone="gold"
        />
      </View>

      <Touchable href="/transactions" style={styles.ledgerLink} pressedStyle={{ opacity: 0.8 }}>
        <Text style={styles.ledgerLabel}>View full ledger</Text>
        <ChevronRight size={16} color={colors.mutedForeground} />
      </Touchable>
    </Screen>
  );
}

function Pathway({
  to,
  icon: Icon,
  label,
  title,
  month,
  lifetime,
  tone,
}: {
  to: Href;
  icon: LucideIcon;
  label: string;
  title: string;
  month: string;
  lifetime: string;
  tone: "navy" | "earn" | "gold";
}) {
  const { colors, t, num } = useTheme();
  const styles = useThemedStyles(makeStyles);
  const bg =
    tone === "earn" ? colors.earnSoft : tone === "gold" ? colors.goldSoft : colors.infoSoft;
  const fg =
    tone === "earn" ? colors.onEarnSoft : tone === "gold" ? colors.onGoldSoft : colors.onInfoSoft;
  return (
    <Touchable
      href={to}
      style={styles.pathway}
      pressedStyle={{ backgroundColor: colors.secondary }}
    >
      <IconBadge icon={Icon} size={48} iconSize={24} bg={bg} color={fg} />
      <View style={{ flex: 1, minWidth: 0 }}>
        <Text style={[t.eyebrow, { color: colors.mutedForeground }]}>{label}</Text>
        <Text numberOfLines={1} style={styles.pathwayTitle}>
          {title}
        </Text>
        <Text style={t.xs}>Lifetime {lifetime}</Text>
      </View>
      <Text style={num(18)}>{month}</Text>
    </Touchable>
  );
}

const makeStyles = ({ colors, surface, shadowCard }: Theme) =>
  StyleSheet.create({
    header: { paddingHorizontal: 20, paddingTop: 24 },
    subRow: {
      marginTop: 16,
      flexDirection: "row",
      alignItems: "flex-end",
      justifyContent: "space-between",
    },
    subValue: {
      fontFamily: fonts.displayBold,
      fontSize: 24,
      lineHeight: 32,
      letterSpacing: -0.84,
      color: colors.earnForeground,
    },
    milestoneRow: { flexDirection: "row", alignItems: "center", gap: 12 },
    milestoneTitle: {
      fontSize: 14,
      lineHeight: 20,
      fontFamily: fonts.bold,
      color: colors.foreground,
    },
    pathway: { ...surface, flexDirection: "row", alignItems: "center", gap: 16, padding: 16 },
    pathwayTitle: {
      fontSize: 14,
      lineHeight: 20,
      fontFamily: fonts.semibold,
      color: colors.foreground,
    },
    ledgerLink: {
      marginHorizontal: 20,
      marginTop: 24,
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      borderRadius: radius.full,
      backgroundColor: colors.card,
      paddingHorizontal: 20,
      paddingVertical: 14,
      ...shadowCard,
    },
    ledgerLabel: {
      fontSize: 14,
      lineHeight: 20,
      fontFamily: fonts.semibold,
      color: colors.foreground,
    },
  });
