import { useLeads } from "@/api/hooks";
import { needLabel } from "@/features/needs";
import { ActivityRow, QueryView, Screen, Section } from "@/ui";
import { UserRound } from "lucide-react-native";

/** Client list. Full Client 360 (holdings, cases, notes) comes in Phase 2 (report #85). */
export default function Clients() {
  const leads = useLeads();
  return (
    <Screen eyebrow="Clients" title="Know them at a glance." subtitle="Everyone you've introduced to RFIN, and what they're working towards.">
      <Section title="All clients" gap={16}>
        <QueryView query={leads} empty={{ title: "No clients yet", body: "Clients appear once you add a lead." }}>
          {(list) => list.map((l) => <ActivityRow key={l.id} icon={UserRound} title={l.client} detail={`${needLabel(l.need)} · ${l.nextAction}`} tone="blue" />)}
        </QueryView>
      </Section>
    </Screen>
  );
}
