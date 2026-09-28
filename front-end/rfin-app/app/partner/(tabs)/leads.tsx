import { useRouter } from "expo-router";
import { Plus } from "lucide-react-native";
import { useState } from "react";
import { useLeads } from "@/api/hooks";
import { LEAD, type LeadState } from "@/domain/states";
import { useTheme } from "@/design";
import { Button, Chips, LeadCard, QueryView, Screen, Text } from "@/ui";

/** Pipeline New → Contacted → Qualified → Processing → Converted / Lost (report #84). */
export default function Leads() {
  const router = useRouter();
  const { colors } = useTheme();
  const [stage, setStage] = useState<LeadState | "all">("all");
  const leads = useLeads();
  const list = leads.data ?? [];
  return (
    <Screen eyebrow="Leads" title="Every lead, one next step." subtitle="Filter by stage. Each card shows what moves it forward.">
      <Button label="New lead" icon={<Plus size={16} color={colors.onInverse} />} onPress={() => router.push("/partner/leads/new")} />
      <Chips value={stage} onChange={setStage} items={[{ id: "all" as const, label: "All" }, ...LEAD.states.map((s) => ({ id: s, label: LEAD.label[s], count: list.filter((l) => l.state === s).length }))]} />
      <QueryView query={leads} empty={{ title: "No leads yet", body: "Add your first lead — it takes a minute." }}>
        {(all) => {
          const shown = all.filter((l) => stage === "all" || l.state === stage);
          return shown.length ? shown.map((l) => <LeadCard key={l.id} lead={l} onPress={() => router.push(`/partner/leads/${l.id}`)} />) : <Text variant="muted">No leads at this stage.</Text>;
        }}
      </QueryView>
    </Screen>
  );
}
