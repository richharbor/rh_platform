import { useRouter } from "expo-router";
import { Check, FileText, TrendingUp, Trophy, Users } from "lucide-react-native";
import { useState } from "react";
import { Pressable, View } from "react-native";
import { useDraws, useKycLive, useOrders, usePointsLedger } from "@/api/hooks";
import type { Need } from "@/domain/models";
import { ORDER } from "@/domain/states";
import { dateline } from "@/features/greeting";
import { accentAt, NEEDS } from "@/features/needs";
import { useSession } from "@/stores/session";
import {
  ActivityRow,
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
  const { profile, needs } = useSession();
  const [focus, setFocus] = useState<Need>(needs[0] ?? "grow_wealth");
  const [advisor, setAdvisor] = useState(false);
  const orders = useOrders();
  const kyc = useKycLive();
  const points = usePointsLedger();
  const draws = useDraws();

  const goals = (needs.length ? NEEDS.filter((n) => needs.includes(n.id)) : NEEDS.slice(0, 4)).slice(0, 4);
  const rec = RECOMMENDATION[focus] ?? RECOMMENDATION.grow_wealth!;
  const first = profile.name.split(" ")[0];

  return (
    <Screen eyebrow={dateline()} title={first ? `${first}, what are you deciding today?` : "What are you deciding today?"} subtitle="One home for your goals, applications and financial life. Start with what matters now.">
      {/* Action: the single most urgent thing, first (UX rule 1). */}
      <QueryView query={orders}>
        {(list) => {
          const due = list.find((o) => o.state === "action_required" && o.action);
          return due?.action ? (
            <Rise delay={1}>
              <FocusCard title={due.action.label} detail={`${due.title} · ${due.action.reason}`} cta="Do it now" onPress={() => router.push(`/order/${due.id}`)} />
            </Rise>
          ) : null;
        }}
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

      <Section title="Portfolio">
        <PortfolioSummary value="₹8.4L" delta="+12.6% this year · indicative" split={[{ label: "Equity", pct: 56 }, { label: "Debt", pct: 28 }, { label: "Cash", pct: 16 }]} />
      </Section>

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

      <Section title="Recent activity" gap={16}>
        <ActivityRow icon={Trophy} title="1,000 welcome points issued" detail="Today · Unlock with your first transaction" tone="amber" />
        <ActivityRow icon={Check} title="RFIN ID created" detail="Today · Mobile verified" />
        <ActivityRow icon={FileText} title="Address proof needs a clearer photo" detail="KYC · Re-upload to continue" tone="red" />
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
