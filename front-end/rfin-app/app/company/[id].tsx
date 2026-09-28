import { useLocalSearchParams, useRouter } from "expo-router";
import { BellPlus, Star } from "lucide-react-native";
import { useMutation } from "@tanstack/react-query";
import { api } from "@/api/client";
import { useC360Invalidate } from "@/api/hooks";
import { useEffect, useState } from "react";
import { Pressable, View } from "react-native";
import { useCompany, usePortfolio, useToggleWatch, useWatchlist } from "@/api/hooks";
import { track } from "@/analytics";
import { can } from "@rfin/shared/rbac";
import { fonts, useTheme } from "@/design";
import { formatINR } from "@/lib/format";
import { leadPrice } from "@/features/markets";
import { PageHeader } from "@/features/PageHeader";
import { useSession } from "@/stores/session";
import { BottomSheet, FormField, useToast, ActivityRow, AmountText, Button, Card, Chips, DisclosureBlock, Display, IndicativeBadge, PRICE_KIND_LABEL, QueryView, Row, Screen, Section, StatusChip, StickyCTA, SupportPanel, Text } from "@/ui";
import { FileText } from "lucide-react-native";

type Tab = "overview" | "business" | "financials" | "valuation" | "peers" | "risks" | "documents";
const TABS: { id: Tab; label: string }[] = [
  { id: "overview", label: "Overview" },
  { id: "business", label: "Business" },
  { id: "financials", label: "Financials" },
  { id: "valuation", label: "Valuation" },
  { id: "peers", label: "Peers" },
  { id: "risks", label: "Risks" },
  { id: "documents", label: "Documents" },
];

/** Company research page — structured, decision-ready (report #91). */
export default function CompanyPage() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { colors } = useTheme();
  const roles = useSession((s) => s.roles);
  const company = useCompany(id);
  const watch = useWatchlist();
  const toggle = useToggleWatch();
  const portfolio = usePortfolio();
  const [tab, setTab] = useState<Tab>("overview");
  const toast = useToast();
  const refresh = useC360Invalidate();
  const [alertOpen, setAlertOpen] = useState(false);
  const [alertKind, setAlertKind] = useState<"price_above" | "price_below" | "new_supply">("price_above");
  const [alertPrice, setAlertPrice] = useState("");
  const setAlert = useMutation({
    mutationFn: () => api("alerts.create", { companyId: id, kind: alertKind, threshold: alertKind === "new_supply" ? undefined : Number(alertPrice) * 100 }),
    onSuccess: (list) => {
      refresh();
      setAlertOpen(false);
      const mine = list[0];
      toast(mine && !mine.active ? "Alert fired already — check notifications" : "Alert set", "success");
    },
  });
  useEffect(() => track("company_viewed", { id }), [id]);

  const watching = !!watch.data?.some((c) => c.id === id);
  const holding = portfolio.data?.holdings.find((h) => h.companyId === id && h.quantity - h.reserved > 0);
  const c = company.data;
  const canBuy = !!c?.available && can(roles, "private_markets", "buy");
  const canSell = !!holding && can(roles, "private_markets", "sell");

  return (
    <Screen
      header={
        <Row style={{ justifyContent: "space-between" }}>
          <View style={{ flex: 1 }}>
            <PageHeader label={c?.sector} />
          </View>
          <Pressable
            accessibilityLabel={watching ? "Remove from watchlist" : "Add to watchlist"}
            hitSlop={10}
            onPress={() => {
              if (!watching) track("watchlist_added", { id });
              toggle.mutate({ companyId: id, on: !watching });
            }}
            style={{ marginLeft: 12 }}
          >
            <Star size={20} color={watching ? colors.amber : colors.foreground} fill={watching ? colors.amber : "transparent"} />
          </Pressable>
          <Pressable accessibilityLabel="Set an alert" hitSlop={10} onPress={() => setAlertOpen(true)} style={{ marginLeft: 16 }}>
            <BellPlus size={20} color={colors.foreground} />
          </Pressable>
        </Row>
      }
      footer={
        canBuy || canSell ? (
          <StickyCTA note="Prices are indicative until matched with a buyer or seller.">
            <Row gap={10}>
              {canBuy ? <Button label="Buy" block style={{ flex: 1 }} event="application_started" onPress={() => router.push(`/buy/${id}`)} /> : null}
              {canSell ? <Button label="Sell" variant="outline" block style={{ flex: 1 }} onPress={() => router.push({ pathname: "/sell/new", params: { company: id } })} /> : null}
            </Row>
          </StickyCTA>
        ) : undefined
      }
    >
      <QueryView query={company}>
        {(c) => {
          const lead = leadPrice(c);
          return (
            <>
              <View style={{ gap: 8 }}>
                <Row gap={8}>
                  {c.isNewSupply ? <StatusChip label="New supply" tone="info" /> : null}
                  {!c.available ? <StatusChip label="No supply now" tone="neutral" /> : null}
                </Row>
                <Display size={44}>{c.name}</Display>
                <Text variant="muted">{c.summary}</Text>
                {lead ? (
                  <Row style={{ justifyContent: "space-between", marginTop: 4 }}>
                    <AmountText size={36}>{formatINR(lead.perShare)}</AmountText>
                    <IndicativeBadge label={PRICE_KIND_LABEL[lead.kind]} />
                  </Row>
                ) : null}
                <Text variant="xs">Min lot {c.minLot} shares{c.founded ? ` · Founded ${c.founded}` : ""}{c.hq ? ` · ${c.hq}` : ""}</Text>
              </View>

              <Chips value={tab} onChange={setTab} items={TABS} />

              {tab === "overview" ? (
                <Section title="At a glance">
                  <Text variant="body">{c.business?.model ?? c.summary}</Text>
                  <Row style={{ flexWrap: "wrap" }}>
                    {c.themes.map((t) => (
                      <StatusChip key={t} label={t} tone="info" />
                    ))}
                  </Row>
                  <DisclosureBlock title="Before you invest" items={[c.risks[0] ?? "Unlisted shares can be hard to sell", c.transferRestrictions[0] ?? "Transfers need approval"]} />
                </Section>
              ) : null}

              {tab === "business" && c.business ? (
                <Section title="How it makes money">
                  <Text variant="body">{c.business.model}</Text>
                  <Text variant="label">Segments</Text>
                  {c.business.segments.map((s) => (
                    <Text key={s} variant="muted">• {s}</Text>
                  ))}
                  <Text variant="label">Edge</Text>
                  <Text variant="muted">{c.business.moat}</Text>
                </Section>
              ) : null}

              {tab === "financials" ? (
                <Section title="Financials · ₹ crore">
                  <Card style={{ padding: 0 }}>
                    <Row style={{ padding: 12, borderBottomWidth: 1, borderBottomColor: colors.lineSoft }}>
                      {["Year", "Revenue", "Profit", "Margin"].map((h) => (
                        <Text key={h} variant="label" style={{ flex: 1 }}>{h}</Text>
                      ))}
                    </Row>
                    {c.financials.map((f) => (
                      <Row key={f.year} style={{ padding: 12, borderBottomWidth: 1, borderBottomColor: colors.lineSoft }}>
                        <Text variant="code" style={{ flex: 1 }}>{f.year}</Text>
                        <Text variant="title" style={{ flex: 1 }}>{f.revenue.toLocaleString("en-IN")}</Text>
                        <Text variant="title" style={{ flex: 1, color: f.profit < 0 ? colors.red : colors.foreground }}>{f.profit.toLocaleString("en-IN")}</Text>
                        <Text variant="caption" style={{ flex: 1 }}>{f.margin}%</Text>
                      </Row>
                    ))}
                  </Card>
                  <Text variant="xs">From company filings. Unaudited years are marked as such by the source.</Text>
                </Section>
              ) : null}

              {tab === "valuation" ? (
                <Section title="Price evidence">
                  <Text variant="muted">These are different kinds of number — we never merge them into one "price".</Text>
                  {c.prices.map((p) => (
                    <Card key={p.kind + p.asOf} style={{ gap: 4 }}>
                      <Row style={{ justifyContent: "space-between" }}>
                        <Text variant="label">{PRICE_KIND_LABEL[p.kind]}</Text>
                        <Text variant="xs">{p.asOf}</Text>
                      </Row>
                      <AmountText size={26}>{formatINR(p.perShare)}</AmountText>
                      <Text variant="xs">{p.source}</Text>
                    </Card>
                  ))}
                  {c.bidAsk ? (
                    <Row gap={12}>
                      <Card style={{ flex: 1 }}>
                        <Text variant="label">Indicative bid</Text>
                        <AmountText size={22}>{formatINR(c.bidAsk.bid)}</AmountText>
                      </Card>
                      <Card style={{ flex: 1 }}>
                        <Text variant="label">Indicative ask</Text>
                        <AmountText size={22}>{formatINR(c.bidAsk.ask)}</AmountText>
                      </Card>
                    </Row>
                  ) : null}
                </Section>
              ) : null}

              {tab === "peers" ? (
                <Section title="Compared with" gap={0}>
                  {c.peers.map((p) => (
                    <Row key={p.name} style={{ justifyContent: "space-between", paddingVertical: 14, borderBottomWidth: 1, borderBottomColor: colors.lineSoft }}>
                      <View>
                        <Text variant="title">{p.name}</Text>
                        <Text variant="xs">{p.listed ? "Listed" : "Private"}</Text>
                      </View>
                      <Text style={{ fontFamily: fonts.mono, fontSize: 12, color: colors.foreground }}>{p.metric}</Text>
                    </Row>
                  ))}
                </Section>
              ) : null}

              {tab === "risks" ? (
                <Section title="Risks & restrictions">
                  <DisclosureBlock title="Risks" items={c.risks} />
                  <DisclosureBlock title="Transfer restrictions" items={c.transferRestrictions} />
                </Section>
              ) : null}

              {tab === "documents" ? (
                <Section title="Research & filings" gap={14}>
                  {c.documents.map((d) => (
                    <ActivityRow key={d.title} icon={FileText} title={d.title} detail={d.kind.replace(/_/g, " ")} tone="blue" />
                  ))}
                </Section>
              ) : null}

              <BottomSheet open={alertOpen} onClose={() => setAlertOpen(false)} title="Set an alert">
                <View style={{ gap: 14 }}>
                  <Chips value={alertKind} onChange={setAlertKind} items={[{ id: "price_above", label: "Price above" }, { id: "price_below", label: "Price below" }, { id: "new_supply", label: "New supply" }]} />
                  {alertKind !== "new_supply" ? <FormField label="Indicative price · ₹" value={alertPrice} onChangeText={(t) => setAlertPrice(t.replace(/\D/g, ""))} keyboardType="number-pad" placeholder={lead ? String(Math.round(lead.perShare / 100)) : ""} error={setAlert.error?.message} /> : <Text variant="muted">We'll tell you when {c.name} shares are available to buy.</Text>}
                  <Button label="Set alert" block disabled={alertKind !== "new_supply" && !(Number(alertPrice) > 0)} loading={setAlert.isPending} onPress={() => setAlert.mutate()} />
                </View>
              </BottomSheet>
              <SupportPanel body={`Questions about ${c.name}? An advisor can walk you through the numbers and the transfer process.`} onPress={() => router.push({ pathname: "/support", params: { contextType: "company", contextId: c.id, subject: `About ${c.name}` } })} />
            </>
          );
        }}
      </QueryView>
    </Screen>
  );
}
