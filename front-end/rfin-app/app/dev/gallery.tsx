import { Check, FileText, LayoutDashboard, LineChart, Search, Trophy, UserRound } from "lucide-react-native";
import { useState } from "react";
import { View } from "react-native";
import { useCompanies, useDraws, useOrders, usePointsLedger, useProducts } from "@/api/hooks";
import type { Lead } from "@/domain/models";
import { GIFT_CARD, KYC, LEAD, LUCKY_DRAW, ORDER, PAYMENT, PAYOUT, REFERRAL, REWARD, type Tone } from "@/domain/states";
import { useTheme, type Palette } from "@/design";
import {
  ActivityRow,
  BottomNav,
  BottomSheet,
  Button,
  CompanyCard,
  DisclosureBlock,
  Display,
  EarningsCard,
  EmptyState,
  ErrorState,
  FocusCard,
  FormField,
  GoalTile,
  HeroCard,
  IdentityCard,
  IndicativeBadge,
  LeadCard,
  LockedState,
  LuckyDrawCard,
  OrderCard,
  ProductCard,
  ProgressBar,
  ProgressRing,
  QueryView,
  RewardCard,
  Row,
  Screen,
  Section,
  SkeletonCard,
  StatusChip,
  StatusPill,
  StatusRow,
  Stepper,
  SupportPanel,
  Text,
  Timeline,
  TrustBanner,
  useToast,
} from "@/ui";

function chips<S extends string>(m: { states: S[]; label: Record<S, string>; tone: (s: S) => Tone }) {
  return m.states.map((s) => ({ label: m.label[s], tone: m.tone(s) }));
}

const MACHINES = {
  KYC: chips(KYC),
  PAYMENT: chips(PAYMENT),
  ORDER: chips(ORDER),
  REWARD: chips(REWARD),
  GIFT_CARD: chips(GIFT_CARD),
  LUCKY_DRAW: chips(LUCKY_DRAW),
  LEAD: chips(LEAD),
  REFERRAL: chips(REFERRAL),
  PAYOUT: chips(PAYOUT),
};

const SWATCHES: (keyof Palette)[] = ["paper", "ink", "mute", "red", "amber", "blue", "green", "line", "amberSoft", "greenSoft"];

const sampleLead: Lead = {
  id: "L1",
  client: "Priya Sharma",
  need: "grow_wealth",
  state: "qualified",
  potential: 25_00_000_00,
  nextAction: "Share NSE research note",
  updatedAt: new Date().toISOString(),
};

const NAV = [
  { key: "home", label: "Home", icon: LayoutDashboard },
  { key: "discover", label: "Discover", icon: Search },
  { key: "portfolio", label: "Portfolio", icon: LineChart },
  { key: "rewards", label: "Rewards", icon: Trophy },
  { key: "profile", label: "Profile", icon: UserRound },
];

export default function Gallery() {
  const { colors, t } = useTheme();
  const toast = useToast();
  const [sheet, setSheet] = useState(false);
  const [nav, setNav] = useState("home");
  const [goal, setGoal] = useState(1);
  const products = useProducts();
  const companies = useCompanies();
  const orders = useOrders();
  const points = usePointsLedger();
  const draws = useDraws();

  return (
    <Screen eyebrow="Design system" title="Every part, every state." subtitle="Built from pixel-perfect-main. Flip the theme under Scenarios.">
      <Section title="Colour">
        <Row style={{ flexWrap: "wrap" }} gap={10}>
          {SWATCHES.map((k) => (
            <View key={k} style={{ width: 88, gap: 6 }}>
              <View style={{ height: 48, borderRadius: 14, backgroundColor: colors[k], borderWidth: 1, borderColor: colors.lineSoft }} />
              <Text variant="code">{k}</Text>
            </View>
          ))}
        </Row>
      </Section>

      <Section title="Type">
        <Display size={48} dot>RFIN</Display>
        <Text variant="hero">What are you deciding today?</Text>
        <Text variant="h1">Anton 36 · figures</Text>
        <Text variant="h2">Anton 24 · card titles</Text>
        <Text variant="eyebrow">Mono eyebrow · red</Text>
        <Text variant="label">Mono section label</Text>
        <Text variant="title">Inter semibold 14 · row titles</Text>
        <Text variant="body">Inter 15 · body copy for reading.</Text>
        <Text variant="muted">Inter 14 · relaxed muted lede, used under headlines.</Text>
        <Text variant="code">JETBRAINS MONO · 01 · APPROVED</Text>
        <Text style={t.xs}>Inter 12 · detail and timestamps</Text>
      </Section>

      <Section title="Buttons">
        <Row style={{ flexWrap: "wrap" }}>
          <Button label="Ink" />
          <Button label="Red" variant="red" />
          <Button label="Outline" variant="outline" />
          <Button label="Loading" loading />
          <Button label="Disabled" disabled />
        </Row>
        <Button label="Open recommendation →" variant="link" />
        <View style={{ backgroundColor: colors.inverse, padding: 16, borderRadius: 18 }}>
          <Button label="Paper, on ink" variant="paper" />
        </View>
      </Section>

      <Section title="Goal tiles">
        <Row gap={12}>
          <GoalTile label="Grow wealth" index={1} accent="red" selected={goal === 1} onPress={() => setGoal(1)} />
          <GoalTile label="Protect family" index={2} accent="blue" selected={goal === 2} onPress={() => setGoal(2)} />
        </Row>
        <Row gap={12}>
          <GoalTile label="Need funding" index={3} accent="amber" selected={goal === 3} onPress={() => setGoal(3)} />
          <GoalTile label="Invest surplus" index={4} accent="green" selected={goal === 4} onPress={() => setGoal(4)} />
        </Row>
      </Section>

      <Section title="Hero">
        <HeroCard label="Matched for your goal" title="Flex SIP · ₹5,000/mo" detail="Matches your ₹22k surplus and low-risk goal." onPress={() => {}} />
      </Section>

      <Section title="Status — every state machine">
        {Object.entries(MACHINES).map(([name, list]) => (
          <View key={name} style={{ gap: 6 }}>
            <Text variant="code">{name}</Text>
            <Row style={{ flexWrap: "wrap" }} gap={14}>
              {list.map((c) => (
                <StatusChip key={c.label} label={c.label} tone={c.tone} />
              ))}
            </Row>
          </View>
        ))}
        <Row style={{ flexWrap: "wrap" }}>
          <StatusPill label="Approved" tone="success" />
          <StatusPill label="In review" tone="pending" />
          <StatusPill label="Docs due" tone="info" />
          <StatusPill label="Action" tone="action" />
        </Row>
      </Section>

      <Section title="Progress">
        <StatusRow title="Home Loan" status="Approved" tone="success" progress={100} />
        <StatusRow title="Term Insurance" status="In review" tone="pending" progress={66} boxed />
        <ProgressBar value={40} tone="info" />
        <Stepper steps={["Review", "Consent", "KYC", "Pay", "Track"]} current={2} />
        <Row gap={16}>
          {[0, 1, 2, 3].map((v) => (
            <ProgressRing key={v} value={v} total={3} size={64} />
          ))}
        </Row>
        <Timeline
          steps={[
            { at: new Date().toISOString(), label: "Order submitted", done: true, actor: "you" },
            { at: new Date().toISOString(), label: "KYC verified", done: true, actor: "rfin" },
            { at: new Date().toISOString(), label: "Share transfer", done: false, actor: "provider" },
          ]}
        />
      </Section>

      <Section title="Rows & panels" gap={16}>
        <ActivityRow icon={Check} title="Home loan approved" detail="Today · 10:42 AM" />
        <ActivityRow icon={FileText} title="Address proof rejected" detail="Re-upload a clearer photo" tone="red" />
        <FocusCard title="Review your matched SIP" detail="A quick comparison can help you decide with confidence." cta="Open recommendation" onPress={() => {}} />
        <IdentityCard name="Aarav" meta="KYC verified · Tier 2" onPress={() => {}} />
        <SupportPanel body="A human advisor can help you understand your options before you decide." onPress={() => toast("Advisor requested", "success")} />
      </Section>

      <Section title="Trust & disclosure">
        <TrustBanner>Your data is encrypted and shared only with the provider you choose.</TrustBanner>
        <IndicativeBadge />
        <DisclosureBlock items={["Unlisted shares may be hard to sell", "Prices shown are indicative, not quotes"]} />
      </Section>

      <Section title="Cards · live mock data">
        <QueryView query={products}>{(d) => d[0] && <ProductCard product={d[0]} />}</QueryView>
        <QueryView query={companies}>{(d) => d.slice(0, 2).map((c) => <CompanyCard key={c.id} company={c} />)}</QueryView>
        <QueryView query={orders}>{(d) => d[0] && <OrderCard order={d[0]} />}</QueryView>
        <QueryView query={points}>{(d) => d[0] && <RewardCard entry={d[0]} toNext="12 to Gold" />}</QueryView>
        <QueryView query={draws}>{(d) => d[0] && <LuckyDrawCard draw={d[0]} />}</QueryView>
        <LeadCard lead={sampleLead} />
        <Row gap={12}>
          <EarningsCard label="Commission" amount={42_500_00} sub="Pending ₹12,000" />
          <EarningsCard label="Paid out" amount={1_20_000_00} />
        </Row>
      </Section>

      <Section title="Screen states">
        <SkeletonCard />
        <EmptyState title="No orders yet" body="When you apply for a product it shows up here." action={{ label: "Discover products", onPress: () => {} }} />
        <ErrorState title="Payment failed" body="Your bank declined the payment. No money was taken." action={{ label: "Retry payment", onPress: () => {} }} />
        <LockedState title="Finish KYC to unlock" body="We need your address proof before you can invest." action={{ label: "Continue KYC", onPress: () => {} }} />
      </Section>

      <Section title="Forms & overlays">
        <FormField label="PAN" placeholder="ABCDE1234F" why="Required by regulation for any financial transaction" autoCapitalize="characters" />
        <FormField label="Email" placeholder="you@example.com" error="That doesn't look like an email address" />
        <Row style={{ flexWrap: "wrap" }}>
          <Button label="Bottom sheet" variant="outline" onPress={() => setSheet(true)} />
          <Button label="Toast" variant="outline" onPress={() => toast("Saved — resume anytime", "success")} />
          <Button label="Error toast" variant="outline" onPress={() => toast("Upload failed", "danger")} />
        </Row>
      </Section>

      <Section title="Navigation">
        <View style={{ marginHorizontal: -20 }}>
          <BottomNav items={NAV} active={nav} onChange={setNav} />
        </View>
      </Section>

      <BottomSheet open={sheet} onClose={() => setSheet(false)} title="Why we ask for this">
        <Text variant="muted">Providers need proof of address to issue a policy. We only share it with the insurer you pick.</Text>
        <Button label="Got it" block style={{ marginTop: 20 }} onPress={() => setSheet(false)} />
      </BottomSheet>
    </Screen>
  );
}
