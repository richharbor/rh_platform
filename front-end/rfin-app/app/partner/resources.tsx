import { BookOpen, Megaphone } from "lucide-react-native";
import { useResources } from "@/api/hooks";
import { PageHeader } from "@/features/PageHeader";
import { ActivityRow, QueryView, Screen, Section, useToast } from "@/ui";
import { Pressable } from "react-native";

/** Training and marketing resources (report #81, #90). */
export default function Resources() {
  const toast = useToast();
  const res = useResources();
  return (
    <Screen header={<PageHeader label="Resources" />} eyebrow="Grow" title="Learn, then share." subtitle="Short courses and compliance-approved material to use with clients.">
      <QueryView query={res}>
        {(r) => (
          <>
            <Section title="Training" gap={16}>
              {r.training.map((t) => (
                <Pressable key={t.id} onPress={() => toast("Courses open in the learning portal", "info")}>
                  <ActivityRow icon={BookOpen} title={t.title} detail={`${t.kind} · ${t.minutes} min`} tone="blue" />
                </Pressable>
              ))}
            </Section>
            <Section title="Marketing kit" gap={16}>
              {r.marketing.map((m) => (
                <Pressable key={m.id} onPress={() => toast("Shared to your downloads", "success")}>
                  <ActivityRow icon={Megaphone} title={m.title} detail={m.kind} tone="amber" />
                </Pressable>
              ))}
            </Section>
          </>
        )}
      </QueryView>
    </Screen>
  );
}
