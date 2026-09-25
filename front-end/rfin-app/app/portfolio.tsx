import { useRouter } from "expo-router";
import { View } from "react-native";
import { useListings, usePortfolio } from "@/api/hooks";
import { useTheme } from "@/design";
import { formatCompact, formatINR } from "@/lib/format";
import { LISTING, signed } from "@/features/markets";
import { PageHeader } from "@/features/PageHeader";
import { AmountText, Button, Card, DisclosureBlock, IndicativeBadge, ProgressBar, QueryView, Row, Screen, Section, StatusChip, Text } from "@/ui";

/** Portfolio — indicative value and gain never presented as realised (report #45, #94). */
export default function PortfolioScreen() {
  const router = useRouter();
  const { colors } = useTheme();
  const portfolio = usePortfolio();
  const listings = useListings();

  return (
    <Screen header={<PageHeader label="Portfolio" />} eyebrow="Portfolio" title="What you own." subtitle="Private-market holdings at indicative prices, with what you've actually realised kept separate.">
      <QueryView query={portfolio} isEmpty={(p) => !p.holdings.length} empty={{ title: "No holdings yet", body: "Buy unlisted shares and they'll appear here.", action: { label: "Explore private markets", onPress: () => router.push("/markets") } }}>
        {(p) => (
          <>
            <Card style={{ gap: 6 }}>
              <Row style={{ justifyContent: "space-between" }}>
                <Text variant="label">Indicative value</Text>
                <IndicativeBadge />
              </Row>
              <AmountText size={40}>{formatCompact(p.totals.indicativeValue)}</AmountText>
              <Text variant="caption" style={{ color: p.totals.indicativeGain >= 0 ? colors.green : colors.red }}>{signed(p.totals.indicativeGain, formatCompact)} indicative gain on {formatCompact(p.totals.costBasis)} invested</Text>
              <Text variant="caption">Realised gain: {signed(p.totals.realizedGain, formatCompact)}</Text>
            </Card>

            <Section title="Concentration">
              {p.sectors.map((s) => (
                <View key={s.sector} style={{ gap: 6 }}>
                  <Row style={{ justifyContent: "space-between" }}>
                    <Text variant="title">{s.sector}</Text>
                    <Text variant="code">{s.pct}%</Text>
                  </Row>
                  <ProgressBar value={s.pct} tone={s.pct > 60 ? "action" : "info"} />
                </View>
              ))}
              {p.sectors[0]?.pct > 60 ? <Text variant="xs" style={{ color: colors.red }}>Over 60% in one sector — consider how concentrated you want to be.</Text> : null}
            </Section>

            <Section title="Holdings">
              {p.holdings.map((h) => (
                <Card key={h.companyId} onPress={() => router.push(`/company/${h.companyId}`)} style={{ gap: 6 }}>
                  <Row style={{ justifyContent: "space-between" }}>
                    <Text variant="title">{h.name}</Text>
                    <Text variant="code">{h.quantity} SH{h.reserved ? ` · ${h.reserved} LISTED` : ""}</Text>
                  </Row>
                  <AmountText size={24}>{formatINR(h.indicativeValue)}</AmountText>
                  <Text variant="xs">Avg cost {formatINR(h.avgCost)} · now {formatINR(h.indicativePrice)} indicative</Text>
                  <Text variant="caption" style={{ color: h.indicativeGain >= 0 ? colors.green : colors.red }}>{signed(h.indicativeGain, formatINR)} indicative{h.realizedGain ? ` · ${signed(h.realizedGain, formatINR)} realised` : ""}</Text>
                </Card>
              ))}
            </Section>
          </>
        )}
      </QueryView>

      <Section title="Sell listings">
        <QueryView query={listings} empty={{ title: "Nothing listed", body: "Open a holding and tap Sell to list shares." }}>
          {(list) =>
            list.map((l) => (
              <Card key={l.id} onPress={() => router.push(`/sell/${l.id}`)} style={{ gap: 4 }}>
                <Row style={{ justifyContent: "space-between" }}>
                  <Text variant="code">{l.id}</Text>
                  <StatusChip label={LISTING[l.state].label} tone={LISTING[l.state].tone} />
                </Row>
                <Text variant="title">{l.companyName} · {l.quantity} shares at {formatINR(l.ask)}</Text>
              </Card>
            ))
          }
        </QueryView>
      </Section>

      <DisclosureBlock title="Liquidity" items={["Unlisted shares can take days or weeks to sell", "Indicative prices aren't quotes — the final price is agreed with a buyer", "Company approval or ROFR can block a transfer"]} />
      <Button label="Explore private markets" variant="outline" onPress={() => router.push("/markets")} />
    </Screen>
  );
}
