import {
  Briefcase,
  Building2,
  Car,
  Coins,
  GraduationCap,
  HeartPulse,
  House,
  ChartLine,
  Rocket,
  ShieldCheck,
  Wallet,
  type LucideIcon,
} from "lucide-react-native";
import { StyleSheet, Text, View } from "react-native";
import type { Product } from "@/lib/rfin-data";
import { useRole } from "@/lib/role-context";
import { fonts, radius, useTheme, useThemedStyles, type Theme } from "@/theme";
import { Touchable } from "./Touchable";
import { IconBadge } from "./ui";

export const productIcon: Record<string, LucideIcon> = {
  "life-insurance": ShieldCheck,
  "health-insurance": HeartPulse,
  "motor-insurance": Car,
  "personal-loan": Wallet,
  "home-loan": House,
  "business-loan": Briefcase,
  mortgage: Building2,
  "education-loan": GraduationCap,
  "vehicle-loan": Car,
  "working-capital": Coins,
  "unlisted-shares": ChartLine,
  "pre-ipo": Rocket,
};

export function ProductCard({
  product,
  variant = "grid",
}: {
  product: Product;
  variant?: "grid" | "wide";
}) {
  const { colors, t, num } = useTheme();
  const styles = useThemedStyles(makeStyles);
  const { role } = useRole();
  const Icon = productIcon[product.slug] ?? ShieldCheck;
  const earnLine =
    role === "seller"
      ? `Earn ${product.sellerCommission}`
      : role === "referral"
        ? `Refer & earn ${product.referralReward}`
        : product.buyerBenefit;

  return (
    <Touchable
      href={{ pathname: "/product/[slug]", params: { slug: product.slug } }}
      style={[styles.card, variant === "wide" ? styles.wide : styles.grid]}
      pressedStyle={{ transform: [{ scale: 0.98 }] }}
    >
      <IconBadge icon={Icon} bg={colors.navy} color={colors.navyForeground} />
      <View>
        <Text style={styles.name}>{product.name}</Text>
        <Text style={[t.xs, { marginTop: 2 }]} numberOfLines={2}>
          {product.tagline}
        </Text>
      </View>
      <View style={{ marginTop: "auto" }}>
        <Text style={num(16)}>{product.from}</Text>
      </View>
      <View style={styles.earnPill}>
        <Text style={styles.earnText} numberOfLines={2}>
          {earnLine}
        </Text>
      </View>
    </Touchable>
  );
}

const makeStyles = ({ colors, surface }: Theme) =>
  StyleSheet.create({
    card: { ...surface, padding: 16, gap: 12, justifyContent: "flex-start" },
    wide: { width: 256, flexShrink: 0 },
    grid: { flex: 1 },
    name: { fontFamily: fonts.bold, fontSize: 14, lineHeight: 18, color: colors.foreground },
    earnPill: {
      borderRadius: radius.full,
      backgroundColor: colors.earnSoft,
      paddingHorizontal: 10,
      paddingVertical: 4,
    },
    earnText: { fontSize: 11, fontFamily: fonts.semibold, color: colors.earn },
  });
