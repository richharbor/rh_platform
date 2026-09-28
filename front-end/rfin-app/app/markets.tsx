import { useRouter } from "expo-router";
import { useState } from "react";
import { View } from "react-native";
import { useCompanies, usePortfolio, useWatchlist } from "@/api/hooks";
import { formatCompact } from "@/lib/format";
import { PageHeader } from "@/features/PageHeader";
import { signed } from "@/features/markets";
import { useSession } from "@/stores/session";
import { can } from "@rfin/shared/rbac";
import { AmountText, Card, Chips, CompanyCard, EmptyState, FormField, QueryView, Row, Screen, Section, Text } from "@/ui";

/** Private-market home: Discover → Understand → Transact → Manage (report #91). */
export default function Markets() {
  const router = useRouter();
  const roles = useSession((s) => s.roles);
  const [q, setQ] = useState("");
  const [theme, setTheme] = useState("all");
  const companies = useCompanies({ q: q || undefined });
  const watch = useWatchlist();
  const portfolio = usePortfolio();
  const themes = [...new Set((companies.data ?? []).flatMap((c) => c.themes))];

  return (
    <Screen header={<PageHeader label="Private markets" />} eyebrow="Private markets" title="Before the IPO." subtitle="Research unlisted companies, buy in lots, and sell with approvals handled for you.">
      <QueryView query={portfolio}>
        {(p) =>
          p.holdings.length ? (
            <Card onPress={() => router.push("/portfolio")} style={{ gap: 4 }}>
              <Text variant="label">Your holdings · indicative</Text>
              <AmountText size={32}>{formatCompact(p.totals.indicativeValue)}</AmountText>
              <Text variant="caption">{signed(p.totals.indicativeGain, formatCompact)} indicative · {p.holdings.length} companies →</Text>
            </Card>
          ) : null
        }
      </QueryView>
      <FormField label="Search" value={q} onChangeText={setQ} placeholder="NSE, fintech, pre-IPO…" />
      <Chips value={theme} onChange={setTheme} items={[{ id: "all", label: "All" }, { id: "new", label: "New supply" }, ...themes.map((t) => ({ id: t, label: t }))]} />
      <Section title="Companies">
        <QueryView query={companies} empty={{ title: "No companies match", body: "Try another name or sector." }}>
          {(list) => {
            const shown = list.filter((c) => theme === "all" || (theme === "new" ? c.isNewSupply : c.themes.includes(theme)));
            return shown.length ? <View style={{ gap: 12 }}>{shown.map((c) => <CompanyCard key={c.id} company={c} onPress={() => router.push(`/company/${c.id}`)} />)}</View> : <Text variant="muted">Nothing in this theme yet.</Text>;
          }}
        </QueryView>
      </Section>
      <Section title="Watchlist">
        <QueryView query={watch} empty={{ title: "Nothing watched", body: "Tap the star on a company to follow its price and supply." }}>
          {(list) => <View style={{ gap: 12 }}>{list.map((c) => <CompanyCard key={c.id} company={c} onPress={() => router.push(`/company/${c.id}`)} />)}</View>}
        </QueryView>
      </Section>
      {!can(roles, "private_markets", "sell") ? <Text variant="xs">Holding shares elsewhere? Add the Seller role in Profile to list them.</Text> : null}
    </Screen>
  );
}
