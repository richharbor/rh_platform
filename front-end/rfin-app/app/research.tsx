import { useMutation } from "@tanstack/react-query";
import { useRouter } from "expo-router";
import { BookOpen, CalendarDays, FileText } from "lucide-react-native";
import { Pressable, View } from "react-native";
import { api } from "@/api/client";
import { useAlerts, useC360Invalidate, useContent } from "@/api/hooks";
import { dayMonth } from "@rfin/shared/greeting";
import { formatINR } from "@/lib/format";
import { PageHeader } from "@/features/PageHeader";
import { ActivityRow, Button, Card, Chips, QueryView, Row, Screen, Section, StatusChip, Text } from "@/ui";
import { useState } from "react";

/** Research feed, education, events and your alerts (report #94) — decision-oriented, not social. */
export default function Research() {
  const router = useRouter();
  const content = useContent();
  const alerts = useAlerts();
  const refresh = useC360Invalidate();
  const [tab, setTab] = useState<"research" | "learn" | "events" | "alerts">("research");
  const remove = useMutation({ mutationFn: (id: number) => api("alerts.remove", { id }), onSuccess: refresh });
  const label = (k: string) => ({ price_above: "Price above", price_below: "Price below", new_supply: "New supply" })[k] ?? k;

  return (
    <Screen header={<PageHeader label="Research" />} eyebrow="Private markets" title="Know before you act." subtitle="Research notes, short explainers, events — and the alerts you've set.">
      <Chips value={tab} onChange={setTab} items={[{ id: "research", label: "Research" }, { id: "learn", label: "Learn" }, { id: "events", label: "Events" }, { id: "alerts", label: "My alerts", count: alerts.data?.filter((a) => a.active).length }]} />
      <QueryView query={content}>
        {(c) => (
          <>
            {tab === "research"
              ? c.research.map((r) => (
                  <Card key={r.id} onPress={() => router.push(`/company/${r.companyId}`)} style={{ gap: 6 }}>
                    <Text variant="label">{r.kind} · {r.minutes} min</Text>
                    <Text variant="h2">{r.title}</Text>
                    <Text variant="muted">{r.summary}</Text>
                    {r.points.map((p) => <Text key={p} variant="xs">• {p}</Text>)}
                  </Card>
                ))
              : null}
            {tab === "learn" ? <Section title="Explainers" gap={16}>{c.education.map((e) => <ActivityRow key={e.id} icon={BookOpen} title={e.title} detail={`${e.minutes} min · ${e.summary}`} tone="blue" />)}</Section> : null}
            {tab === "events" ? <Section title="Upcoming" gap={16}>{c.events.map((e) => <ActivityRow key={e.id} icon={CalendarDays} title={e.title} detail={`${dayMonth(e.date)} · ${e.format} · ${e.host}`} tone="amber" />)}</Section> : null}
          </>
        )}
      </QueryView>
      {tab === "alerts" ? (
        <QueryView query={alerts} empty={{ title: "No alerts yet", body: "Open a company and tap the bell to set one.", action: { label: "Browse companies", onPress: () => router.push("/markets") } }}>
          {(list) =>
            list.map((a) => (
              <Card key={a.id} style={{ gap: 6 }}>
                <Row style={{ justifyContent: "space-between" }}>
                  <Text variant="title">{a.companyName}</Text>
                  <StatusChip label={a.active ? "Watching" : "Fired"} tone={a.active ? "pending" : "success"} />
                </Row>
                <Text variant="caption">{label(a.kind)}{a.threshold ? ` ${formatINR(a.threshold)}` : ""}{a.triggeredAt ? ` · fired ${dayMonth(a.triggeredAt)}` : ""}</Text>
                <Row>
                  <Button label="Open company" variant="outline" onPress={() => router.push(`/company/${a.companyId}`)} />
                  <Button label="Delete" variant="link" onPress={() => remove.mutate(a.id)} />
                </Row>
              </Card>
            ))
          }
        </QueryView>
      ) : null}
      <View />
      <Pressable onPress={() => router.push("/assistant")}>
        <ActivityRow icon={FileText} title="Ask the RFIN Assistant" detail="Questions about a company, a term or your holdings" tone="green" />
      </Pressable>
    </Screen>
  );
}
