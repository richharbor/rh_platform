import { useLocalSearchParams } from "expo-router";
import { StyleSheet, View } from "react-native";
import { ProductCard } from "@/components/ProductCard";
import { Screen } from "@/components/Screen";
import { EmptyState, PageHeader } from "@/components/ui";
import { categories, productsInCategory, type CategorySlug } from "@/lib/rfin-data";

export default function CategoryScreen() {
  const { category } = useLocalSearchParams<{ category: string }>();
  const cat = categories.find((c) => c.slug === category);

  if (!cat) {
    return (
      <Screen>
        <PageHeader title="Category not found" back="/explore" />
        <EmptyState title="Unknown category" body="That category isn't available on RFIN yet." />
      </Screen>
    );
  }

  const items = productsInCategory(cat.slug as CategorySlug);

  return (
    <Screen>
      <PageHeader
        title={cat.name}
        subtitle={`${items.length} products · ${cat.tagline}`}
        back="/explore"
      />
      <View style={styles.grid}>
        {items.map((p) => (
          <View key={p.slug} style={styles.cell}>
            <ProductCard product={p} />
          </View>
        ))}
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  grid: { flexDirection: "row", flexWrap: "wrap", gap: 12, paddingHorizontal: 20, paddingTop: 8 },
  cell: { flexBasis: "47%", flexGrow: 1 },
});
