import { ChevronRight, Handshake, Search, Share2 } from "lucide-react-native";
import { useMemo, useState } from "react";
import { StyleSheet, Text, TextInput, View } from "react-native";
import { ProductCard } from "@/components/ProductCard";
import { HScroll, Screen } from "@/components/Screen";
import { Touchable } from "@/components/Touchable";
import { GradientSurface, IconBadge, SectionHeader } from "@/components/ui";
import { categories, products, productsInCategory } from "@/lib/rfin-data";
import { fonts, radius, useTheme, useThemedStyles, type Theme } from "@/theme";

export default function ExploreScreen() {
  const { colors, t } = useTheme();
  const styles = useThemedStyles(makeStyles);
  const [query, setQuery] = useState("");

  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return null;
    return products.filter(
      (p) =>
        p.name.toLowerCase().includes(q) ||
        p.tagline.toLowerCase().includes(q) ||
        p.category.replace("-", " ").includes(q),
    );
  }, [query]);

  return (
    <Screen>
      <View style={styles.header}>
        <Text style={t.h1}>Explore</Text>
        <Text style={t.muted}>Products and opportunities</Text>
        <View style={styles.search}>
          <Search size={16} color={colors.mutedForeground} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search insurance, loans, unlisted shares…"
            placeholderTextColor={colors.mutedForeground}
            value={query}
            onChangeText={setQuery}
            returnKeyType="search"
            clearButtonMode="while-editing"
          />
        </View>
      </View>

      {results ? (
        <View style={{ paddingTop: 24 }}>
          <SectionHeader title={`${results.length} result${results.length === 1 ? "" : "s"}`} />
          {results.length === 0 ? (
            <Text style={[t.muted, { paddingHorizontal: 20 }]}>
              Nothing matched “{query.trim()}”. Try “loan”, “health” or “pre-IPO”.
            </Text>
          ) : (
            <View style={styles.grid}>
              {results.map((p) => (
                <View key={p.slug} style={styles.gridCell}>
                  <ProductCard product={p} />
                </View>
              ))}
            </View>
          )}
        </View>
      ) : (
        categories.map((c) => (
          <View key={c.slug} style={{ paddingTop: 28 }}>
            <SectionHeader
              title={c.name}
              to={{ pathname: "/explore/[category]", params: { category: c.slug } }}
            />
            <HScroll>
              {productsInCategory(c.slug)
                .slice(0, 4)
                .map((p) => (
                  <ProductCard key={p.slug} product={p} variant="wide" />
                ))}
            </HScroll>
          </View>
        ))
      )}

      <View style={styles.ctaWrap}>
        <Touchable href="/seller">
          <GradientSurface tone="earn" style={styles.cta}>
            <IconBadge
              icon={Handshake}
              size={48}
              iconSize={24}
              bg="rgba(244,250,245,0.15)"
              color={colors.earnForeground}
            />
            <View style={{ flex: 1 }}>
              <Text style={[styles.ctaTitle, { color: colors.earnForeground }]}>
                Become a Seller
              </Text>
              <Text style={[styles.ctaSub, { color: colors.earnForeground }]}>
                Sell every product on RFIN and earn commissions
              </Text>
            </View>
            <ChevronRight size={20} color={colors.earnForeground} />
          </GradientSurface>
        </Touchable>
        <Touchable href="/refer">
          <GradientSurface tone="gold" style={styles.cta}>
            <IconBadge
              icon={Share2}
              size={48}
              iconSize={24}
              bg={colors.onGold10}
              color={colors.goldForeground}
            />
            <View style={{ flex: 1 }}>
              <Text style={[styles.ctaTitle, { color: colors.goldForeground }]}>Refer & Earn</Text>
              <Text style={[styles.ctaSub, { color: colors.goldForeground }]}>
                Share a link, earn on every successful referral
              </Text>
            </View>
            <ChevronRight size={20} color={colors.goldForeground} />
          </GradientSurface>
        </Touchable>
      </View>
    </Screen>
  );
}

const makeStyles = ({ colors, shadowCard }: Theme) =>
  StyleSheet.create({
    header: { paddingHorizontal: 20, paddingTop: 24 },
    search: {
      marginTop: 16,
      flexDirection: "row",
      alignItems: "center",
      gap: 8,
      borderRadius: radius.full,
      backgroundColor: colors.card,
      paddingHorizontal: 16,
      paddingVertical: 12,
      ...shadowCard,
    },
    searchInput: {
      flex: 1,
      fontSize: 14,
      lineHeight: 20,
      fontFamily: fonts.regular,
      color: colors.foreground,
      padding: 0,
    },
    grid: { flexDirection: "row", flexWrap: "wrap", gap: 12, paddingHorizontal: 20 },
    gridCell: { flexBasis: "47%", flexGrow: 1 },
    ctaWrap: { gap: 12, paddingHorizontal: 20, paddingTop: 32 },
    cta: { flexDirection: "row", alignItems: "center", gap: 16, padding: 20 },
    ctaTitle: { fontFamily: fonts.displayBold, fontSize: 16, lineHeight: 24 },
    ctaSub: { fontSize: 12, lineHeight: 16, fontFamily: fonts.regular, opacity: 0.9, marginTop: 2 },
  });
