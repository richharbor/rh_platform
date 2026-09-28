import { useRouter, type Href } from "expo-router";
import { ago } from "@/features/notify";
import { Bell, Check, FileText, Sparkles, TrendingUp, Trophy, Users } from "lucide-react-native";
import { useState } from "react";
import { Pressable, View } from "react-native";
import { useDraws, useKycLive, useNotifications, useOrders, usePointsLedger, usePortfolio, useRecommendations } from "@/api/hooks";
import { formatCompact } from "@/lib/format";
import type { Need } from "@/domain/models";
import { ORDER } from "@/domain/states";
import { dateline } from "@/features/greeting";
import { accentAt, NEEDS } from "@/features/needs";
import { useTheme } from "@/design";
import { useSession } from "@/stores/session";
import {
  ActivityRow,
  Card,
  AmountText,
  FocusCard,
  GoalTile,
  HeroCard,
  LuckyDrawCard,
  PortfolioSummary,
  QueryView,
  Rise,
  Row,
  Screen,
  Section,
  StatusRow,
  SupportPanel,
  Text,
  Button,
  TrustBanner,
  useToast,
} from "@/ui";

const RECOMMENDATION: Partial<Record<Need, { label: string; title: string; detail: string; route: string }>> = {
  grow_wealth: { label: "Matched for your goal", title: "AA Bond Basket · 9.2%", detail: "Indicative yield for a 2–3 year horizon. Not guaranteed.", route: "/explore" },
  protect_family: { label: "Protection, made clearer", title: "Term cover · ₹1 crore", detail: "Compare cover, exclusions and premiums before you decide.", route: "/explore" },
  need_funding: { label: "Indicative eligibility", title: "Personal loan · up to ₹25L", detail: "See your indicative rate and next steps in under two minutes.", route: "/explore" },
  invest_surplus: { label: "Matched for your horizon", title: "Bonds · from ₹10,000", detail: "Regular income while your surplus works harder.", route: "/explore" },
  sell_asset: { label: "Private markets", title: "Sell unlisted shares", detail: "See indicative prices and buyer interest before you list.", route: "/explore" },
  find_opportunity: { label: "New supply", title: "Zepto · pre-IPO", detail: "Indicative ₹520/share. Transfer restrictions apply.", route: "/explore" },
  refer_someone: { label: "Refer & earn", title: "Invite someone you trust", detail: "Track every referral from invite to reward.", route: "/rewards" },
  save_plan: { label: "Plan ahead", title: "Family Health · ₹10L", detail: "Cover shared across the family, from ₹1,420/month.", route: "/explore" },
};

/**
 * Home — Money → Action → Opportunity → Products → Rewards → Education → Trust
 * (report #41, #42). The first action is obvious within three seconds.
 */
export default function Home() {
  const router = useRouter();
  const toast = useToast();
  const th = useTheme();
  const { profile, needs } = useSession();
  const [focus, setFocus] = useState<Need>(needs[0] ?? "grow_wealth");
  const [advisor, setAdvisor] = useState(false);
  const orders = useOrders();
  const kyc = useKycLive();
  const points = usePointsLedger();
  const draws = useDraws();
  const notes = useNotifications();
  const portfolio = usePortfolio();
  const recs = useRecommendations();
  const unread = notes.data?.unread ?? 0;
  const bell = (
    <Row style={{ justifyContent: "flex-end" }} gap={16}>
      <Pressable accessibilityLabel="Ask the RFIN Assistant" hitSlop={10} onPress={() => router.push("/assistant")} style={{ padding: 4 }}>
        <Sparkles size={20} color={th.colors.foreground} />
      </Pressable>
      <Pressable accessibilityLabel={unread ? `${unread} unread notifications` : "Notifications"} hitSlop={10} onPress={() => router.push("/notifications")} style={{ padding: 4 }}>
        <Bell size={20} color={th.colors.foreground} />
        {unread ? <View style={{ position: "absolute", top: 0, right: 0, minWidth: 16, height: 16, borderRadius: 8, paddingHorizontal: 4, backgroundColor: th.colors.red, alignItems: "center", justifyContent: "center" }}><Text style={{ color: th.colors.onRed, fontSize: 10, fontFamily: "Inter_700Bold" }}>{unread}</Text></View> : null}
      </Pressable>
    </Row>
  );

  const goals = (needs.length ? NEEDS.filter((n) => needs.includes(n.id)) : NEEDS.slice(0, 4)).slice(0, 4);
  const rec = RECOMMENDATION[focus] ?? RECOMMENDATION.grow_wealth!;
  const first = profile.name.split(" ")[0];

  return (
    <Screen header={bell} eyebrow={dateline()} title={first ? `${first}, what are you deciding today?` : "What are you deciding today?"} subtitle="One home for your goals, applications and financial life. Start with what matters now.">
      {/* Action: the single most urgent thing, first (UX rule 1) — proactive alerts (Phase 3). */}
      <QueryView query={recs}>
        {(r) =>
          r.alerts.length ? (
            <Rise delay={1}>
              <FocusCard title={r.alerts[0].title} detail={r.alerts[0].detail} cta="Do it now" onPress={() => router.push(r.alerts[0].route as Href)} />
              {r.alerts.length > 1 ? <Text variant="xs" style={{ marginTop: 8 }}>+{r.alerts.length - 1} more below</Text> : null}
            </Rise>
          ) : null
        }
      </QueryView>

      <Rise delay={2}>
        <Section title="Your goals">
          <View style={{ gap: 12 }}>
            {[goals.slice(0, 2), goals.slice(2, 4)].filter((r) => r.length).map((row, r) => (
              <Row key={r} gap={12}>
                {row.map((g, k) => (
                  <GoalTile key={g.id} label={g.label} index={r * 2 + k + 1} accent={accentAt(r * 2 + k)} selected={focus === g.id} onPress={() => setFocus(g.id)} />
                ))}
                {row.length === 1 ? <View style={{ flex: 1 }} /> : null}
              </Row>
            ))}
          </View>
        </Section>
      </Rise>

      <Rise delay={3}>
        <HeroCard label={rec.label} title={rec.title} detail={rec.detail} onPress={() => router.push(rec.route as "/explore")} />
      </Rise>

      <Section title="For you">
        <QueryView query={recs}>
          {(r) => (
            <View style={{ gap: 12 }}>
              {[...r.alerts.slice(1), ...r.forYou].slice(0, 4).map((x) => (
                <Card key={x.id} onPress={() => router.push(x.route as Href)} style={{ gap: 6 }}>
                  <Text variant="title">{x.title}</Text>
                  <Text variant="caption">{x.detail}</Text>
                  <Row style={{ flexWrap: "wrap" }} gap={6}>
                    {x.reasons.map((reason) => (
                      <View key={reason} style={{ paddingHorizontal: 8, paddingVertical: 3, borderRadius: 999, backgroundColor: th.colors.pressed }}>
                        <Text variant="xs">{reason}</Text>
                      </View>
                    ))}
                  </Row>
                </Card>
              ))}
              <Text variant="xs">{r.note}</Text>
            </View>
          )}
        </QueryView>
      </Section>

      <Section title="Applications">
        <QueryView query={orders} empty={{ title: "Nothing in progress", body: "When you apply for something, you'll track it here." }}>
          {(list) =>
            list.slice(0, 3).map((o) => (
              <StatusRow
                key={o.id}
                title={o.title}
                status={ORDER.label[o.state]}
                tone={ORDER.tone(o.state)}
                progress={Math.round((o.timeline.filter((t) => t.done).length / Math.max(o.timeline.length, 3)) * 100)}
              />
            ))
          }
        </QueryView>
      </Section>

      <Section title="KYC">
        <QueryView query={kyc}>
          {(items) => {
            const done = items.filter((i) => i.state === "verified").length;
            const next = items.find((i) => i.state !== "verified");
            return (
              <Pressable onPress={() => router.push("/kyc")} accessibilityRole="button">
              <StatusRow title={next ? `Next: ${next.label}` : "All verified"} status={`${done}/${items.length} done`} tone={next?.state === "action_required" ? "action" : done === items.length ? "success" : "info"} progress={(done / items.length) * 100} />
              </Pressable>
            );
          }}
        </QueryView>
      </Section>

      <QueryView query={portfolio}>
        {(p) =>
          p.holdings.length ? (
            <Section title="Portfolio" action={<Button label="Open →" variant="link" onPress={() => router.push("/portfolio")} />}>
              <Pressable onPress={() => router.push("/portfolio")}>
                <PortfolioSummary
                  value={formatCompact(p.totals.indicativeValue)}
                  delta={`${p.totals.indicativeGain >= 0 ? "+" : "−"}${formatCompact(Math.abs(p.totals.indicativeGain))} · indicative`}
                  split={p.sectors.slice(0, 3).map((s) => ({ label: s.sector.split(" ")[0], pct: s.pct }))}
                />
              </Pressable>
            </Section>
          ) : null
        }
      </QueryView>

      <Section title="RFIN Points">
        <QueryView query={points}>
          {(ledger) => {
            const total = ledger.reduce((s, e) => s + e.points, 0);
            const locked = ledger.some((e) => e.state === "locked");
            return (
              <Row style={{ justifyContent: "space-between", alignItems: "flex-end" }}>
                <AmountText>{total.toLocaleString("en-IN")}</AmountText>
                <Text variant="caption">{locked ? "Unlocks on first transaction" : "Ready to use"}</Text>
              </Row>
            );
          }}
        </QueryView>
        <QueryView query={draws}>{(d) => (d[0] ? <LuckyDrawCard draw={d[0]} onPress={() => router.push("/rewards")} /> : null)}</QueryView>
      </Section>

      <Section title="Recent activity" gap={16} action={<Button label="All →" variant="link" onPress={() => router.push("/notifications")} />}>
        <QueryView query={notes} isEmpty={(d) => !d.items.length} empty={{ title: "Nothing yet", body: "Updates show up here." }}>
          {(d) =>
            d.items.slice(0, 3).map((n) => (
              <Pressable key={n.id} onPress={() => n.route && router.push(n.route as Href)}>
                <ActivityRow icon={n.category === "rewards" ? Trophy : n.category === "kyc" ? FileText : Check} title={n.title} detail={`${ago(n.at)} · ${n.body}`} tone={n.tone === "action" ? "red" : n.tone === "pending" ? "amber" : n.tone === "info" ? "blue" : "green"} />
              </Pressable>
            ))
          }
        </QueryView>
      </Section>

      <Section title="Learn">
        <ActivityRow icon={TrendingUp} title="Indicative vs confirmed prices" detail="2 min read · Private markets" tone="blue" />
        <ActivityRow icon={Users} title="How much term cover do you need?" detail="3 min read · Protection" tone="blue" />
      </Section>

      <SupportPanel
        body="A human advisor can help you understand your options before you decide."
        requested={advisor}
        onPress={() => {
          setAdvisor(true);
          toast("Advisor requested", "success");
        }}
      />
      <TrustBanner>RFIN shows indicative information where a provider hasn't confirmed it yet. Rewards never change a product's risk.</TrustBanner>
    </Screen>
  );
}
