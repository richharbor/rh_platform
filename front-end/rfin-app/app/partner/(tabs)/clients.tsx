import { useRouter } from "expo-router";
import { UserRound } from "lucide-react-native";
import { Pressable } from "react-native";
import { useClients } from "@/api/hooks";
import { formatCompact } from "@/lib/format";
import { needLabel } from "@/features/needs";
import { ActivityRow, QueryView, Screen, Section } from "@/ui";

/** Clients — tap for Client 360 (report #85). */
export default function Clients() {
  const router = useRouter();
  const clients = useClients();
  return (
    <Screen eyebrow="Clients" title="Know them at a glance." subtitle="Everyone you've introduced to RFIN, and what they're working towards.">
      <Section title="All clients" gap={16}>
        <QueryView query={clients} empty={{ title: "No clients yet", body: "Clients appear once you add a lead." }}>
          {(list) =>
            list.map((c) => (
              <Pressable key={c.key} onPress={() => router.push(`/partner/clients/${c.key}`)}>
                <ActivityRow icon={UserRound} title={c.name} detail={`${c.needs.map(needLabel).join(", ")} · ${formatCompact(c.openValue)} open · ${c.nextAction}`} tone="blue" />
              </Pressable>
            ))
          }
        </QueryView>
      </Section>
    </Screen>
  );
}
