import { useLocalSearchParams } from "expo-router";
import { Check, FileText, Handshake, Share2, ShoppingBag } from "lucide-react-native";
import { Platform, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { productIcon } from "@/components/ProductCard";
import { Screen } from "@/components/Screen";
import {
  Btn,
  EmptyState,
  GradientSurface,
  IconBadge,
  PageHeader,
  Pill,
  Surface,
} from "@/components/ui";
import { categories, productBySlug } from "@/lib/rfin-data";
import { useRole } from "@/lib/role-context";
import { fonts, NAV_HEIGHT, radius, useTheme, useThemedStyles, type Theme } from "@/theme";

const journey = [
  "Basic information",
  "Requirement",
  "Suitable options",
  "KYC & documents",
  "Payment / application",
  "Confirmation & reward",
];

export default function ProductScreen() {
  const { colors } = useTheme();
  const styles = useThemedStyles(makeStyles);
  const { slug } = useLocalSearchParams<{ slug: string }>();
  const { role } = useRole();
  const insets = useSafeAreaInsets();
  const product = productBySlug(slug);

  if (!product) {
    return (
      <Screen>
        <PageHeader title="Product not found" back="/explore" />
        <EmptyState title="Unavailable" body="This product isn't on RFIN yet." />
      </Screen>
    );
  }

  const cat = categories.find((c) => c.slug === product.category)!;
  const Icon = productIcon[product.slug];

  return (
    <>
      <Screen extraBottom={64}>
        <PageHeader
          title={product.name}
          subtitle={cat.name}
          back={{ pathname: "/explore/[category]", params: { category: cat.slug } }}
        />

        <View style={{ paddingHorizontal: 20 }}>
          <GradientSurface tone="navy" style={{ padding: 20 }}>
            <View style={styles.rowBetween}>
              <IconBadge
                icon={Icon}
                size={48}
                iconSize={24}
                bg={colors.onDark12}
                color={colors.navyForeground}
              />
              <Pill
                label={cat.name}
                bg={colors.onDark12}
                color={colors.navyForeground}
                weight="semibold"
              />
            </View>
            <Text style={styles.heroTitle}>{product.tagline}</Text>
            <Text style={styles.heroPrice}>{product.from}</Text>
            <View style={{ marginTop: 16, gap: 6 }}>
              {product.highlights.map((h) => (
                <View key={h} style={styles.highlight}>
                  <Check size={16} color={colors.earn} />
                  <Text style={styles.highlightText}>{h}</Text>
                </View>
              ))}
            </View>
          </GradientSurface>

          {/* What you earn — per role */}
          <View style={styles.earnRow}>
            <EarnCell active={role === "buyer"} label="Buy" value={product.buyerBenefit} />
            <EarnCell active={role === "seller"} label="Sell" value={product.sellerCommission} />
            <EarnCell active={role === "referral"} label="Refer" value={product.referralReward} />
          </View>

          <Surface style={styles.block}>
            <Text style={styles.blockTitle}>Your journey</Text>
            <View style={{ marginTop: 12, gap: 10 }}>
              {journey.map((s, i) => (
                <View key={s} style={styles.journeyRow}>
                  <View style={styles.journeyDot}>
                    <Text style={styles.journeyNum}>{i + 1}</Text>
                  </View>
                  <Text style={styles.journeyText}>{s}</Text>
                </View>
              ))}
            </View>
          </Surface>

          <Surface style={styles.block}>
            <View style={styles.docHeader}>
              <FileText size={16} color={colors.foreground} />
              <Text style={styles.blockTitle}>Documents you'll need</Text>
            </View>
            <View style={styles.docPills}>
              {product.docs.map((d) => (
                <Pill key={d} label={d} />
              ))}
            </View>
          </Surface>
        </View>
      </Screen>

      {/* Sticky CTA, sitting just above the bottom nav */}
      <View
        style={[styles.cta, { bottom: NAV_HEIGHT + Math.max(insets.bottom, 16) + 8 }]}
        pointerEvents="box-none"
      >
        {role === "buyer" && (
          <Btn
            label="Get started"
            icon={ShoppingBag}
            variant="earn"
            glow
            to={{ pathname: "/apply/[slug]", params: { slug: product.slug } }}
          />
        )}
        {role === "seller" && (
          <Btn
            label="Create lead for this product"
            icon={Handshake}
            variant="earn"
            glow
            to={{ pathname: "/seller/leads/new", params: { product: product.slug } }}
          />
        )}
        {role === "referral" && (
          <Btn
            label={`Refer & earn ${product.referralReward}`}
            icon={Share2}
            variant="gold"
            to={{ pathname: "/refer/new", params: { product: product.slug } }}
          />
        )}
      </View>
    </>
  );
}

function EarnCell({ active, label, value }: { active: boolean; label: string; value: string }) {
  const { colors, t } = useTheme();
  const styles = useThemedStyles(makeStyles);
  return (
    <View style={[styles.earnCell, active ? styles.earnCellActive : styles.earnCellIdle]}>
      <Text style={[t.eyebrow, { color: active ? colors.earn : colors.mutedForeground }]}>
        {label}
      </Text>
      <Text style={styles.earnCellValue}>{value}</Text>
    </View>
  );
}

const makeStyles = ({ colors }: Theme) =>
  StyleSheet.create({
    rowBetween: { flexDirection: "row", alignItems: "flex-start", justifyContent: "space-between" },
    heroTitle: {
      marginTop: 16,
      fontFamily: fonts.displayBold,
      fontSize: 24,
      lineHeight: 32,
      letterSpacing: -0.48,
      color: colors.navyForeground,
    },
    heroPrice: {
      marginTop: 4,
      fontFamily: fonts.displayBold,
      fontSize: 30,
      lineHeight: 36,
      letterSpacing: -1.05,
      color: colors.earnSoft,
    },
    highlight: { flexDirection: "row", alignItems: "center", gap: 8 },
    highlightText: {
      flex: 1,
      fontSize: 14,
      lineHeight: 20,
      fontFamily: fonts.regular,
      color: colors.navyMuted,
    },
    earnRow: { marginTop: 16, flexDirection: "row", gap: 8 },
    earnCell: { flex: 1, borderRadius: radius["2xl"], borderWidth: 1, padding: 12 },
    earnCellActive: { borderColor: colors.earn, backgroundColor: colors.earnSoft },
    earnCellIdle: { borderColor: colors.border, backgroundColor: colors.card },
    earnCellValue: {
      marginTop: 4,
      fontSize: 12,
      lineHeight: 16,
      fontFamily: fonts.semibold,
      color: colors.foreground,
    },
    block: { marginTop: 16, padding: 16 },
    blockTitle: { fontSize: 14, lineHeight: 20, fontFamily: fonts.bold, color: colors.foreground },
    journeyRow: { flexDirection: "row", alignItems: "center", gap: 12 },
    journeyDot: {
      width: 24,
      height: 24,
      borderRadius: radius.full,
      backgroundColor: colors.muted,
      alignItems: "center",
      justifyContent: "center",
    },
    journeyNum: { fontSize: 11, fontFamily: fonts.bold, color: colors.brandText },
    journeyText: {
      fontSize: 14,
      lineHeight: 20,
      fontFamily: fonts.regular,
      color: colors.foreground,
    },
    docHeader: { flexDirection: "row", alignItems: "center", gap: 8 },
    docPills: { marginTop: 12, flexDirection: "row", flexWrap: "wrap", gap: 8 },
    cta: {
      position: Platform.OS === "web" ? ("fixed" as "absolute") : "absolute",
      left: 0,
      right: 0,
      zIndex: 30,
      paddingHorizontal: 20,
      alignSelf: "center",
    },
  });
