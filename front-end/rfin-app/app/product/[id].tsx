import { useLocalSearchParams, useRouter } from "expo-router";
import { ArrowUpRight, Check } from "lucide-react-native";
import { useEffect } from "react";
import { View } from "react-native";
import { useProduct, useProducts } from "@/api/hooks";
import { track } from "@/analytics";
import { useTheme } from "@/design";
import { PageHeader } from "@/features/PageHeader";
import { Button, Card, DisclosureBlock, Display, QueryView, Row, Screen, Section, StickyCTA, Text, TrustBanner } from "@/ui";

const CATEGORY_LABEL = { insurance: "Protect", loans: "Borrow", investments: "Invest", private_markets: "Private markets" } as const;

/**
 * Product detail answers five questions in order (report #25):
 * what is it · who is it for · what does it need and cost · what are the risks · what happens next.
 * Risk sits above any reward content (report #10).
 */
export default function ProductDetail() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { colors } = useTheme();
  const product = useProduct(id);
  const siblings = useProducts({ category: product.data?.category });

  useEffect(() => {
    track("product_viewed", { id });
  }, [id]);

  const p = product.data;
  const needsEligibility = p?.category === "loans" || p?.category === "insurance";
  const comparable = (siblings.data ?? []).filter((x) => x.id !== id);

  return (
    <Screen
      footer={
        p?.transactable ? (
          <StickyCTA note={needsEligibility ? "Checking eligibility doesn't affect your credit score." : undefined}>
            <Button
              label={needsEligibility ? "Check eligibility" : "Continue"}
              block
              event={needsEligibility ? "eligibility_started" : "application_started"}
              eventProps={{ id }}
              trailingIcon={<ArrowUpRight size={16} color={colors.onInverse} />}
              onPress={() => router.push(needsEligibility ? `/eligibility/${id}` : `/txn/${id}`)}
            />
          </StickyCTA>
        ) : undefined
      }
    >
      <PageHeader label={p ? CATEGORY_LABEL[p.category] : undefined} />
      <QueryView query={product}>
        {(p) => (
          <>
            <View style={{ gap: 8 }}>
              <Text variant="eyebrow">{p.provider}</Text>
              <Display size={44}>{p.name}</Display>
              <Text variant="muted">{p.tagline}</Text>
            </View>

            <Section title="01 · Who it's for">
              <Text variant="body">{p.whoFor}</Text>
            </Section>

            <Section title="02 · What it costs">
              <Card style={{ gap: 0, padding: 0 }}>
                {p.costs.map((c, i) => (
                  <Row key={c.label} style={{ justifyContent: "space-between", padding: 16, borderTopWidth: i ? 1 : 0, borderTopColor: colors.lineSoft }}>
                    <Text variant="caption">{c.label}</Text>
                    <Text variant="title">{c.value}</Text>
                  </Row>
                ))}
              </Card>
            </Section>

            <Section title="03 · What you'll need" gap={10}>
              {p.requirements.map((r) => (
                <Row key={r} gap={10}>
                  <Check size={16} color={colors.green} />
                  <Text variant="body">{r}</Text>
                </Row>
              ))}
              <Text variant="xs">We'll only ask for these when you apply, and tell you why each one is needed.</Text>
            </Section>

            <Section title="04 · Risks & limitations">
              <DisclosureBlock title="Read before you decide" items={p.risks} />
            </Section>

            <Section title="05 · What happens next" gap={10}>
              {p.whatNext.map((w, i) => (
                <Row key={w} gap={12}>
                  <Text variant="code" style={{ width: 20 }}>{String(i + 1).padStart(2, "0")}</Text>
                  <Text variant="body" style={{ flex: 1 }}>{w}</Text>
                </Row>
              ))}
            </Section>

            {comparable.length ? (
              <Section title="Compare">
                <Text variant="muted">See {p.name} side by side with {comparable.length} similar option{comparable.length > 1 ? "s" : ""}.</Text>
                <Button label="Compare options" variant="outline" event="compare_started" onPress={() => router.push({ pathname: "/compare", params: { ids: [p.id, ...comparable.map((c) => c.id)].join(",") } })} />
              </Section>
            ) : null}

            <TrustBanner>Earn RFIN Points on your first eligible transaction. Points never change the product's terms or risk.</TrustBanner>
          </>
        )}
      </QueryView>
    </Screen>
  );
}
