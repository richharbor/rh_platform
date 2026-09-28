import { Handshake, Share2, ShoppingBag, type LucideIcon } from "lucide-react-native";
import { StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { RfinMark } from "@/components/icons";
import { Rise } from "@/components/motion";
import { Btn, GradientSurface, IconBadge } from "@/components/ui";
import { fonts, radius, useTheme, useThemedStyles, type Theme } from "@/theme";

const pitches: { icon: LucideIcon; title: string; body: string; tone: "navy" | "earn" | "gold" }[] =
  [
    {
      icon: ShoppingBag,
      title: "Buy",
      body: "Insurance, loans and private markets in one place",
      tone: "navy",
    },
    {
      icon: Handshake,
      title: "Sell",
      body: "Build a book of business and earn commissions",
      tone: "earn",
    },
    {
      icon: Share2,
      title: "Refer",
      body: "Share with your network, earn on every conversion",
      tone: "gold",
    },
  ];

export default function WelcomeScreen() {
  const { colors, t } = useTheme();
  const styles = useThemedStyles(makeStyles);
  const insets = useSafeAreaInsets();

  return (
    <View
      style={[
        styles.wrap,
        { paddingTop: insets.top + 24, paddingBottom: Math.max(insets.bottom, 20) + 8 },
      ]}
    >
      <Rise>
        <GradientSurface tone="navy" style={styles.hero}>
          <View style={styles.brand}>
            <RfinMark size={46} color={colors.navyForeground} accent={colors.earn} />
            <View>
              <Text style={styles.logo}>RFIN</Text>
              <Text style={styles.tagline}>Buy · Sell · Refer · Earn</Text>
            </View>
          </View>
          <Text style={styles.heroBody}>
            One account, three roles, one ecosystem. Discover financial products, build a business
            and earn from your network.
          </Text>
        </GradientSurface>
      </Rise>

      <View style={styles.pitches}>
        {pitches.map((p, i) => {
          const bg =
            p.tone === "earn"
              ? colors.earnSoft
              : p.tone === "gold"
                ? colors.goldSoft
                : colors.infoSoft;
          const fg =
            p.tone === "earn"
              ? colors.onEarnSoft
              : p.tone === "gold"
                ? colors.onGoldSoft
                : colors.onInfoSoft;
          return (
            <Rise key={p.title} delay={60 * (i + 1)}>
              <View style={styles.pitch}>
                <IconBadge icon={p.icon} bg={bg} color={fg} />
                <View style={{ flex: 1, minWidth: 0 }}>
                  <Text style={styles.pitchTitle}>{p.title}</Text>
                  <Text style={t.xs}>{p.body}</Text>
                </View>
              </View>
            </Rise>
          );
        })}
      </View>

      <View style={{ flex: 1 }} />

      <View style={{ gap: 8 }}>
        <Btn label="Create an account" variant="earn" glow to="/(auth)/register" />
        <Btn label="I already have an account" variant="ghost" to="/(auth)/login" />
        <Text style={[t.xs, { textAlign: "center", marginTop: 4 }]}>
          By continuing you agree to RFIN's Terms and Privacy Policy.
        </Text>
      </View>
    </View>
  );
}

const makeStyles = ({ colors, surface }: Theme) =>
  StyleSheet.create({
    wrap: { flex: 1, paddingHorizontal: 20, backgroundColor: colors.background },
    hero: { padding: 24 },
    brand: { flexDirection: "row", alignItems: "center", gap: 14 },
    logo: {
      fontFamily: fonts.displayBold,
      fontSize: 32,
      lineHeight: 40,
      letterSpacing: -0.72,
      color: colors.navyForeground,
    },
    tagline: {
      marginTop: 2,
      fontSize: 13,
      lineHeight: 18,
      fontFamily: fonts.semibold,
      letterSpacing: 0.6,
      color: colors.navyMuted,
    },
    heroBody: {
      marginTop: 14,
      fontSize: 14,
      lineHeight: 21,
      fontFamily: fonts.regular,
      color: colors.navyMuted,
    },
    pitches: { marginTop: 20, gap: 12 },
    pitch: {
      ...surface,
      flexDirection: "row",
      alignItems: "center",
      gap: 14,
      padding: 14,
      borderRadius: radius.lg,
    },
    pitchTitle: { fontSize: 15, lineHeight: 20, fontFamily: fonts.bold, color: colors.foreground },
  });
