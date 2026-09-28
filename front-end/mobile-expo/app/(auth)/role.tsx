import { useRouter } from "expo-router";
import { Check, Handshake, Share2, ShoppingBag, type LucideIcon } from "lucide-react-native";
import { useState } from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Rise } from "@/components/motion";
import { Btn, IconBadge, PageHeader } from "@/components/ui";
import { useAuth } from "@/lib/auth-context";
import { ROLE_LABEL, type Role } from "@/lib/rfin-data";
import { useRole } from "@/lib/role-context";
import { fonts, radius, useTheme, useThemedStyles, type Theme } from "@/theme";

const options: {
  role: Role;
  icon: LucideIcon;
  headline: string;
  body: string;
  bullets: string[];
  tone: "navy" | "earn" | "gold";
}[] = [
  {
    role: "buyer",
    icon: ShoppingBag,
    headline: "Buy",
    body: "Find insurance, loans and private-market opportunities",
    bullets: [
      "Compare suitable options",
      "Earn RFIN Points on purchases",
      "Track every application",
    ],
    tone: "navy",
  },
  {
    role: "seller",
    icon: Handshake,
    headline: "Sell",
    body: "Build a book of business and earn commissions",
    bullets: ["Create and manage leads", "Track conversions", "Commission ledger and payouts"],
    tone: "earn",
  },
  {
    role: "referral",
    icon: Share2,
    headline: "Refer",
    body: "Introduce your network and earn on conversions",
    bullets: [
      "Share by WhatsApp, link or QR",
      "Consent-first records",
      "Reward on every conversion",
    ],
    tone: "gold",
  },
];

export default function RoleScreen() {
  const { colors, t } = useTheme();
  const styles = useThemedStyles(makeStyles);
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { setRoles, profile } = useAuth();
  const { setRole } = useRole();

  // Buyer is always included — every account can buy.
  const [selected, setSelected] = useState<Role[]>(
    profile.roles.length ? profile.roles : ["buyer"],
  );

  const toggle = (r: Role) => {
    if (r === "buyer") return;
    setSelected((cur) => (cur.includes(r) ? cur.filter((x) => x !== r) : [...cur, r]));
  };

  const primary: Role = selected.includes("seller")
    ? "seller"
    : selected.includes("referral")
      ? "referral"
      : "buyer";

  const proceed = () => {
    setRoles(selected);
    setRole(primary);
    router.push("/(auth)/onboarding");
  };

  return (
    <View style={{ flex: 1, paddingTop: insets.top }}>
      <PageHeader
        title="How will you use RFIN?"
        subtitle="Pick any — you can switch roles anytime"
        back="/(auth)/verify"
      />

      <ScrollView
        contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 20, gap: 12 }}
        showsVerticalScrollIndicator={false}
      >
        {options.map((o, i) => {
          const on = selected.includes(o.role);
          const locked = o.role === "buyer";
          const bg =
            o.tone === "earn"
              ? colors.earnSoft
              : o.tone === "gold"
                ? colors.goldSoft
                : colors.infoSoft;
          const fg =
            o.tone === "earn"
              ? colors.onEarnSoft
              : o.tone === "gold"
                ? colors.onGoldSoft
                : colors.onInfoSoft;
          return (
            <Rise key={o.role} delay={i * 60}>
              <Pressable
                onPress={() => toggle(o.role)}
                disabled={locked}
                accessibilityRole="checkbox"
                accessibilityState={{ checked: on, disabled: locked }}
                style={[styles.card, on && styles.cardOn]}
              >
                <View style={styles.head}>
                  <IconBadge icon={o.icon} size={48} iconSize={24} bg={bg} color={fg} />
                  <View style={{ flex: 1, minWidth: 0 }}>
                    <View style={styles.titleRow}>
                      <Text style={styles.title}>{o.headline}</Text>
                      <Text style={styles.roleName}>{ROLE_LABEL[o.role]}</Text>
                    </View>
                    <Text style={t.xs}>{o.body}</Text>
                  </View>
                  <View style={[styles.check, on && styles.checkOn]}>
                    {on && <Check size={15} color={colors.earnForeground} />}
                  </View>
                </View>
                <View style={styles.bullets}>
                  {o.bullets.map((b) => (
                    <Text key={b} style={styles.bullet}>
                      · {b}
                    </Text>
                  ))}
                </View>
                {locked && <Text style={styles.lockNote}>Included with every RFIN account</Text>}
              </Pressable>
            </Rise>
          );
        })}

        <Text style={[t.xs, { textAlign: "center", marginTop: 4 }]}>
          Selecting Seller or Referral adds a few onboarding questions. You can add them later from
          Profile instead.
        </Text>
      </ScrollView>

      <View style={[styles.footer, { paddingBottom: Math.max(insets.bottom, 16) + 8 }]}>
        <Btn label="Continue" variant="earn" glow onPress={proceed} />
      </View>
    </View>
  );
}

const makeStyles = ({ colors, surface }: Theme) =>
  StyleSheet.create({
    card: { ...surface, padding: 16, gap: 12, borderRadius: radius["2xl"] },
    cardOn: { borderColor: colors.earn, borderWidth: 2 },
    head: { flexDirection: "row", alignItems: "center", gap: 12 },
    titleRow: { flexDirection: "row", alignItems: "baseline", gap: 8 },
    title: {
      fontFamily: fonts.displayBold,
      fontSize: 18,
      lineHeight: 26,
      letterSpacing: -0.36,
      color: colors.foreground,
    },
    roleName: {
      fontSize: 11,
      lineHeight: 15,
      fontFamily: fonts.semibold,
      color: colors.mutedForeground,
    },
    check: {
      width: 26,
      height: 26,
      borderRadius: 13,
      borderWidth: 1.5,
      borderColor: colors.border,
      alignItems: "center",
      justifyContent: "center",
    },
    checkOn: { backgroundColor: colors.earn, borderColor: colors.earn },
    bullets: { gap: 3 },
    bullet: {
      fontSize: 13,
      lineHeight: 18,
      fontFamily: fonts.regular,
      color: colors.mutedForeground,
    },
    lockNote: {
      fontSize: 11,
      lineHeight: 15,
      fontFamily: fonts.semibold,
      color: colors.onEarnSoft,
    },
    footer: {
      paddingHorizontal: 20,
      paddingTop: 12,
      borderTopWidth: 1,
      borderTopColor: colors.border,
      backgroundColor: colors.background,
    },
  });
