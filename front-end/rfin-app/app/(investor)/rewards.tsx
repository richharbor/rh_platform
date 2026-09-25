import { useDraws, usePointsLedger } from "@/api/hooks";
import { DisclosureBlock, LuckyDrawCard, QueryView, RewardCard, Screen, Section } from "@/ui";

/** Rewards hub (report #51–#69). Benefits, gift cards and referral arrive in step 6. */
export default function Rewards() {
  const points = usePointsLedger();
  const draws = useDraws();
  return (
    <Screen eyebrow="Rewards" title="Earned, not promised." subtitle="Points, benefits and draws — with the rules in plain sight.">
      <Section title="RFIN Points">
        <QueryView query={points} empty={{ title: "No points yet", body: "Your welcome points appear here." }}>
          {(list) => list.map((e) => <RewardCard key={e.id} entry={e} toNext="Unlocks on first transaction" />)}
        </QueryView>
      </Section>
      <Section title="Lucky draw">
        <QueryView query={draws}>{(list) => list.map((d) => <LuckyDrawCard key={d.id} draw={d} />)}</QueryView>
      </Section>
      <DisclosureBlock title="How rewards work" items={["Points aren't cash and can't be withdrawn", "Rewards are issued only after a transaction is confirmed", "Reversed or cancelled transactions reverse their rewards"]} />
    </Screen>
  );
}
