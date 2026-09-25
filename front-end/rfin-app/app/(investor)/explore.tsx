import { useRouter } from "expo-router";
import { useState } from "react";
import { Pressable, ScrollView } from "react-native";
import { useCompanies, useProducts } from "@/api/hooks";
import { track } from "@/analytics";
import type { ProductCategory } from "@/domain/models";
import { fonts, radius, useTheme } from "@/design";
import { Button, CompanyCard, FormField, ProductCard, QueryView, Screen, Section, Text } from "@/ui";

const CATS: { id: ProductCategory | "all"; label: string }[] = [
  { id: "all", label: "All" },
  { id: "insurance", label: "Protect" },
  { id: "loans", label: "Borrow" },
  { id: "investments", label: "Invest" },
  { id: "private_markets", label: "Private markets" },
];

/** Explore hub (report #21). Product detail, compare and eligibility arrive in step 3. */
export default function Explore() {
  const router = useRouter();
  const { colors } = useTheme();
  const [cat, setCat] = useState<(typeof CATS)[number]["id"]>("all");
  const [q, setQ] = useState("");
  const products = useProducts({ category: cat === "all" || cat === "private_markets" ? undefined : cat, q: q || undefined });
  const companies = useCompanies({ q: q || undefined });

  return (
    <Screen eyebrow="Explore" title="Find what fits." subtitle="Protection, loans, investments and private markets — compared on what matters.">
      <FormField label="Search" value={q} onChangeText={setQ} onSubmitEditing={() => track("search_used", { q })} placeholder="Term cover, bonds, Zepto…" returnKeyType="search" />
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8, paddingHorizontal: 20 }} style={{ marginHorizontal: -20 }}>
        {CATS.map((c) => {
          const on = c.id === cat;
          return (
            <Pressable
              key={c.id}
              onPress={() => {
                setCat(c.id);
                track("category_selected", { category: c.id });
              }}
              style={{ paddingHorizontal: 16, paddingVertical: 10, borderRadius: radius.full, borderWidth: 1, borderColor: on ? colors.inverse : colors.line, backgroundColor: on ? colors.inverse : "transparent" }}
            >
              <Text style={{ fontFamily: fonts.semibold, fontSize: 13, color: on ? colors.onInverse : colors.foreground }}>{c.label}</Text>
            </Pressable>
          );
        })}
      </ScrollView>

      {cat !== "private_markets" ? (
        <Section title="Products">
          <QueryView query={products} empty={{ title: "No matches", body: "Try a different search or category." }}>
            {(list) => list.map((p) => <ProductCard key={p.id} product={p} onPress={() => router.push(`/product/${p.id}`)} />)}
          </QueryView>
        </Section>
      ) : null}

      {cat === "all" || cat === "private_markets" ? (
        <Section title="Private markets" action={<Button label="All →" variant="link" onPress={() => router.push("/markets")} />}>
          <QueryView query={companies} empty={{ title: "No companies match", body: "Try another name or sector." }}>
            {(list) => list.map((c) => <CompanyCard key={c.id} company={c} onPress={() => router.push(`/company/${c.id}`)} />)}
          </QueryView>
        </Section>
      ) : null}
    </Screen>
  );
}
