import type { Href } from "expo-router";
import {
  ArrowUpRight,
  Bell,
  Handshake,
  Plus,
  Share2,
  ShoppingBag,
  Sparkles,
  type LucideIcon,
} from "lucide-react-native";
import { StyleSheet, Text, View } from "react-native";
import { RoleSwitcher } from "@/components/AppShell";
import { Rise } from "@/components/motion";
import { ProductCard } from "@/components/ProductCard";
import { HScroll, Screen } from "@/components/Screen";
import { Touchable } from "@/components/Touchable";
import {
  BigNumber,
  Btn,
  DividedSurface,
  GradientSurface,
  IconBadge,
  ProgressBar,
  SectionHeader,
} from "@/components/ui";
import { formatIN, formatINR, leads, products, referrals, user } from "@/lib/rfin-data";
import { useDisplayUser } from "@/lib/use-display-user";
import { useRole } from "@/lib/role-context";
import { fonts, radius, useTheme, useThemedStyles, type Theme } from "@/theme";

function greeting() {
  const h = new Date().getHours();
  return h < 12 ? "Good morning" : h < 17 ? "Good afternoon" : "Good evening";
}

export default function HomeScreen() {
  const displayUser = useDisplayUser();
  const { colors, t } = useTheme();
  const styles = useThemedStyles(makeStyles);
  const { role } = useRole();
  const recommended = products.filter((p) =>
    ["health-insurance", "personal-loan", "unlisted-shares", "life-insurance"].includes(p.slug),
  );
  const tierProgress = (user.points / user.nextTierAt) * 100;

  return (
    <Screen>
      <View style={styles.header}>
        <View>
          <Text style={t.muted}>{greeting()},</Text>
          <Text style={styles.name}>{displayUser.firstName}</Text>
        </View>
        <Touchable
          href="/profile"
          accessibilityLabel="Notifications"
          style={styles.bell}
          pressedStyle={{ opacity: 0.7 }}
        >
          <Bell size={20} color={colors.foreground} />
          <View style={styles.bellDot} />
        </Touchable>
      </View>

      <View style={styles.px5Pt5}>
        <RoleSwitcher />
      </View>

      <View style={styles.px5Pt4}>
        {role === "buyer" && <BuyerHero />}
        {role === "seller" && <SellerHero />}
        {role === "referral" && <ReferralHero />}
      </View>

      {/* Primary actions */}
      <View style={styles.actionRow}>
        <ActionTile
          to="/explore"
          icon={ShoppingBag}
          label="BUY"
          sub="Find solutions"
          tone="navy"
          delay={60}
        />
        <ActionTile
          to="/seller"
          icon={Handshake}
          label="SELL"
          sub="Build business"
          tone="earn"
          delay={60}
        />
        <ActionTile
          to="/refer"
          icon={Share2}
          label="REFER"
          sub="Earn from network"
          tone="gold"
          delay={60}
        />
      </View>

      {/* Rewards card */}
      <View style={styles.px5Pt4}>
        <Rise delay={120}>
          <Touchable href="/rewards">
            <GradientSurface tone="gold" style={{ padding: 20 }}>
              <View style={styles.rowBetweenStart}>
                <View style={{ flex: 1 }}>
                  <Text style={[t.eyebrow, { color: colors.goldForeground, opacity: 0.8 }]}>
                    RFIN Points · {user.tier} tier
                  </Text>
                  <BigNumber
                    value={formatIN(user.points)}
                    style={{ marginTop: 4, color: colors.goldForeground }}
                  />
                </View>
                <IconBadge
                  icon={Sparkles}
                  round
                  bg={colors.onGold10}
                  color={colors.goldForeground}
                />
              </View>
              <ProgressBar
                value={tierProgress}
                tone="navy"
                trackColor={colors.onGold15}
                style={{ marginTop: 16 }}
              />
              <Text style={styles.goldSub}>
                {formatIN(user.nextTierAt - user.points)} points to {user.nextTier}
              </Text>
            </GradientSurface>
          </Touchable>
        </Rise>
      </View>

      <View style={{ paddingTop: 28 }}>
        <SectionHeader title="Recommended for you" to="/explore" />
        <HScroll>
          {recommended.map((p) => (
            <ProductCard key={p.slug} product={p} variant="wide" />
          ))}
        </HScroll>
      </View>

      <View style={{ paddingTop: 28 }}>
        <SectionHeader title="Earn more" to="/earn" linkLabel="Open Earn" />
        <DividedSurface style={{ marginHorizontal: 20 }}>
          <EarnRow
            to="/explore"
            title="Buy & get benefits"
            sub="Earn RFIN Points on every eligible purchase"
            value={`+${formatIN(user.buyerBenefits.month)} pts`}
          />
          <EarnRow
            to="/seller"
            title="Sell & earn commissions"
            sub={`${leads.filter((l) => !["Payout", "Successful"].includes(l.stage)).length} active leads in pipeline`}
            value={formatINR(user.earnings.month)}
          />
          <EarnRow
            to="/refer"
            title="Refer & earn"
            sub={`${referrals.length} referrals this month`}
            value={formatINR(user.referralEarnings.month)}
          />
        </DividedSurface>
      </View>
    </Screen>
  );
}

/* --------------------------------------------------------------------- heroes */

function BuyerHero() {
  const { colors, t } = useTheme();
  const styles = useThemedStyles(makeStyles);
  return (
    <Rise>
      <GradientSurface tone="navy" style={{ padding: 20 }}>
        <Text style={[t.eyebrow, { color: colors.navyMuted }]}>Benefits earned this month</Text>
        <View style={styles.heroNumRow}>
          <BigNumber
            value={formatIN(user.buyerBenefits.month)}
            size="xl"
            style={{ color: colors.navyForeground }}
          />
          <Text style={styles.heroUnit}>RFIN Points</Text>
        </View>
        <Text style={[styles.heroSub, { marginTop: 8 }]}>
          Lifetime {formatIN(user.buyerBenefits.lifetime)} pts · KYC {user.kyc}
        </Text>
        <View style={styles.heroBtnRow}>
          <Btn label="Explore products" variant="earn" to="/explore" style={{ flex: 1 }} />
          <Btn label="Track" variant="onDark" to="/transactions" />
        </View>
      </GradientSurface>
    </Rise>
  );
}

function SellerHero() {
  const { colors, t } = useTheme();
  const styles = useThemedStyles(makeStyles);
  const active = leads.filter((l) => !["Payout", "Successful"].includes(l.stage)).length;
  const conversions = leads.filter((l) => ["Payout", "Successful"].includes(l.stage)).length;
  return (
    <Rise>
      <GradientSurface tone="navy" style={{ padding: 20 }}>
        <View style={styles.rowBetweenStart}>
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
        <View style={styles.miniStatRow}>
          <MiniStat label="Pending" value={formatINR(user.earnings.pending)} />
          <MiniStat label="Active leads" value={String(active)} />
          <MiniStat label="Conversions" value={String(conversions)} />
        </View>
        <View style={styles.heroBtnRow}>
          <Btn
            label="Create new lead"
            icon={Plus}
            variant="earn"
            to="/seller/leads/new"
            style={{ flex: 1 }}
          />
          <Btn label="Dashboard" variant="onDark" to="/seller" />
        </View>
      </GradientSurface>
    </Rise>
  );
}

function ReferralHero() {
  const { colors, t } = useTheme();
  const styles = useThemedStyles(makeStyles);
  const converted = referrals.filter((r) => r.status === "Converted" || r.status === "Paid").length;
  const potential = referrals.filter((r) => r.status !== "Paid").reduce((s, r) => s + r.benefit, 0);
  return (
    <Rise>
      <GradientSurface tone="navy" style={{ padding: 20 }}>
        <Text style={[t.eyebrow, { color: colors.navyMuted }]}>Referral earnings this month</Text>
        <BigNumber
          value={formatINR(user.referralEarnings.month)}
          size="xl"
          style={{ marginTop: 4, color: colors.navyForeground }}
        />
        <View style={styles.miniStatRow}>
          <MiniStat label="Referrals" value={String(referrals.length)} />
          <MiniStat label="Converted" value={String(converted)} />
          <MiniStat label="Potential" value={formatINR(potential)} />
        </View>
        <View style={styles.heroBtnRow}>
          <Btn
            label="Create referral"
            icon={Share2}
            variant="earn"
            to="/refer/new"
            style={{ flex: 1 }}
          />
          <Btn label="Track" variant="onDark" to="/refer" />
        </View>
      </GradientSurface>
    </Rise>
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

/* ---------------------------------------------------------------------- tiles */

function ActionTile({
  to,
  icon: Icon,
  label,
  sub,
  tone = "navy",
  delay = 0,
}: {
  to: Href;
  icon: LucideIcon;
  label: string;
  sub: string;
  tone?: "navy" | "earn" | "gold";
  delay?: number;
}) {
  const { colors } = useTheme();
  const styles = useThemedStyles(makeStyles);
  const bg =
    tone === "earn" ? colors.earnSoft : tone === "gold" ? colors.goldSoft : colors.infoSoft;
  const fg =
    tone === "earn" ? colors.onEarnSoft : tone === "gold" ? colors.onGoldSoft : colors.onInfoSoft;
  return (
    <Rise delay={delay} style={{ flex: 1 }}>
      <Touchable
        href={to}
        style={styles.actionTile}
        pressedStyle={{ transform: [{ scale: 0.97 }] }}
      >
        <IconBadge icon={Icon} bg={bg} color={fg} />
        <View>
          <Text style={styles.actionLabel}>{label}</Text>
          <Text style={styles.actionSub}>{sub}</Text>
        </View>
      </Touchable>
    </Rise>
  );
}

function EarnRow({
  to,
  title,
  sub,
  value,
}: {
  to: Href;
  title: string;
  sub: string;
  value: string;
}) {
  const { colors, t, num } = useTheme();
  const styles = useThemedStyles(makeStyles);
  return (
    <Touchable href={to} style={styles.earnRow} pressedStyle={{ backgroundColor: colors.muted }}>
      <View style={{ flex: 1, minWidth: 0 }}>
        <Text style={styles.earnRowTitle}>{title}</Text>
        <Text style={t.xs} numberOfLines={1}>
          {sub}
        </Text>
      </View>
      <Text style={num(16, colors.earn)}>{value}</Text>
    </Touchable>
  );
}

const makeStyles = ({ colors, surface, shadowCard }: Theme) =>
  StyleSheet.create({
    header: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      paddingHorizontal: 20,
      paddingTop: 24,
    },
    name: {
      fontFamily: fonts.displayBold,
      fontSize: 24,
      lineHeight: 32,
      letterSpacing: -0.48,
      color: colors.foreground,
    },
    bell: {
      width: 44,
      height: 44,
      borderRadius: radius.full,
      backgroundColor: colors.card,
      alignItems: "center",
      justifyContent: "center",
      ...shadowCard,
    },
    bellDot: {
      position: "absolute",
      top: 10,
      right: 12,
      width: 8,
      height: 8,
      borderRadius: 4,
      backgroundColor: colors.earn,
    },
    px5Pt5: { paddingHorizontal: 20, paddingTop: 20 },
    px5Pt4: { paddingHorizontal: 20, paddingTop: 16 },
    actionRow: { flexDirection: "row", gap: 12, paddingHorizontal: 20, paddingTop: 16 },
    actionTile: { ...surface, flex: 1, gap: 12, padding: 14 },
    actionLabel: {
      fontFamily: fonts.displayBold,
      fontSize: 14,
      lineHeight: 20,
      letterSpacing: 0.35,
      color: colors.foreground,
    },
    actionSub: {
      fontSize: 11,
      lineHeight: 14,
      fontFamily: fonts.regular,
      color: colors.mutedForeground,
    },
    rowBetweenStart: {
      flexDirection: "row",
      alignItems: "flex-start",
      justifyContent: "space-between",
      gap: 12,
    },
    heroNumRow: { flexDirection: "row", alignItems: "flex-end", gap: 8, marginTop: 4 },
    heroUnit: {
      marginBottom: 8,
      fontSize: 14,
      lineHeight: 20,
      fontFamily: fonts.semibold,
      color: colors.navyMuted,
    },
    heroSub: { fontSize: 14, lineHeight: 20, fontFamily: fonts.regular, color: colors.navyMuted },
    heroBtnRow: { marginTop: 20, flexDirection: "row", gap: 8 },
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
    miniStatRow: { marginTop: 20, flexDirection: "row", gap: 8 },
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
    goldSub: {
      marginTop: 8,
      fontSize: 12,
      lineHeight: 16,
      fontFamily: fonts.medium,
      color: colors.goldForeground,
      opacity: 0.9,
    },
    earnRow: {
      flexDirection: "row",
      alignItems: "center",
      gap: 12,
      paddingHorizontal: 16,
      paddingVertical: 14,
    },
    earnRowTitle: {
      fontSize: 14,
      lineHeight: 20,
      fontFamily: fonts.semibold,
      color: colors.foreground,
    },
  });
