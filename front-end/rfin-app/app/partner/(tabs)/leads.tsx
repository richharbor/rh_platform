import { useState } from "react";
import { Pressable, ScrollView } from "react-native";
import { useLeads } from "@/api/hooks";
import { LEAD, type LeadState } from "@/domain/states";
import { fonts, radius, useTheme } from "@/design";
import { LeadCard, QueryView, Screen, Text } from "@/ui";

/** Pipeline New → Contacted → Qualified → Processing → Converted / Lost (report #84). Add-lead + Case 360 in step 7. */
export default function Leads() {
  const { colors } = useTheme();
  const [stage, setStage] = useState<LeadState | "all">("all");
  const leads = useLeads();

  return (
    <Screen eyebrow="Leads" title="Every lead, one next step." subtitle="Filter by stage. Each card shows what moves it forward.">
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginHorizontal: -20 }} contentContainerStyle={{ gap: 8, paddingHorizontal: 20 }}>
        {(["all", ...LEAD.states] as const).map((s) => {
          const on = s === stage;
          return (
            <Pressable key={s} onPress={() => setStage(s)} style={{ paddingHorizontal: 16, paddingVertical: 10, borderRadius: radius.full, borderWidth: 1, borderColor: on ? colors.inverse : colors.line, backgroundColor: on ? colors.inverse : "transparent" }}>
              <Text style={{ fontFamily: fonts.semibold, fontSize: 13, color: on ? colors.onInverse : colors.foreground }}>{s === "all" ? "All" : LEAD.label[s]}</Text>
            </Pressable>
          );
        })}
      </ScrollView>
      <QueryView query={leads} empty={{ title: "No leads yet", body: "Add your first lead from Home." }}>
        {(list) => {
          const shown = list.filter((l) => stage === "all" || l.state === stage);
          return shown.length ? shown.map((l) => <LeadCard key={l.id} lead={l} />) : <Text variant="muted">No leads at this stage.</Text>;
        }}
      </QueryView>
    </Screen>
  );
}

