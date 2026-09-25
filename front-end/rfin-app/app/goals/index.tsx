import { useMutation } from "@tanstack/react-query";
import { useRouter } from "expo-router";
import { useState } from "react";
import { KeyboardAvoidingView, Platform } from "react-native";
import { api } from "@/api/client";
import { useC360Invalidate, useGoals } from "@/api/hooks";
import type { Need } from "@/domain/models";
import { useTheme } from "@/design";
import { formatINR } from "@/lib/format";
import { NEEDS } from "@/features/needs";
import { PageHeader } from "@/features/PageHeader";
import { BottomSheet, Button, Card, Chips, FormField, ProgressBar, QueryView, Row, Screen, Text } from "@/ui";

/** Goals as first-class objects (report #17): target, date, pace. */
export default function Goals() {
  const router = useRouter();
  const { colors } = useTheme();
  const goals = useGoals();
  const refresh = useC360Invalidate();
  const [open, setOpen] = useState(false);
  const [need, setNeed] = useState<Need>("save_plan");
  const [title, setTitle] = useState("");
  const [target, setTarget] = useState("");
  const [year, setYear] = useState(String(new Date().getFullYear() + 5));
  const create = useMutation({
    mutationFn: () => api("goals.create", { need, title: title.trim(), target: Number(target) * 100, targetDate: `${year}-12-31` }),
    onSuccess: (g) => {
      refresh();
      setOpen(false);
      router.push(`/goals/${g.id}`);
    },
  });

  return (
    <Screen header={<PageHeader label="Goals" />} eyebrow="Goals" title="Where you're heading." subtitle="Give each goal a target and a date — we'll show the monthly pace and nudge you if you slip.">
      <Button label="New goal" onPress={() => setOpen(true)} />
      <QueryView query={goals} empty={{ title: "No goals yet", body: "A goal turns a vague wish into a monthly number." }}>
        {(list) =>
          list.filter((g) => g.state !== "archived").map((g) => (
            <Card key={g.id} onPress={() => router.push(`/goals/${g.id}`)} style={{ gap: 6 }}>
              <Row style={{ justifyContent: "space-between" }}>
                <Text variant="h2">{g.title}</Text>
                <Text variant="code" style={{ color: g.state === "achieved" ? colors.green : g.onTrack ? colors.green : colors.red }}>{g.state === "achieved" ? "DONE" : g.onTrack ? "ON TRACK" : "BEHIND"}</Text>
              </Row>
              <ProgressBar value={g.pct} tone={g.onTrack ? "success" : "action"} />
              <Text variant="xs">{formatINR(g.saved)} of {formatINR(g.target)} · {g.monthlyNeeded ? `${formatINR(g.monthlyNeeded)}/month to ${g.targetDate}` : "reached"}</Text>
            </Card>
          ))
        }
      </QueryView>
      <BottomSheet open={open} onClose={() => setOpen(false)} title="New goal">
        <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : undefined} style={{ gap: 14 }}>
          <Chips value={need} onChange={setNeed} items={NEEDS.filter((n) => n.id !== "refer_someone").map((n) => ({ id: n.id, label: n.label }))} />
          <FormField label="Name" value={title} onChangeText={setTitle} placeholder="Home down payment" />
          <FormField label="Target · ₹" value={target} onChangeText={(t) => setTarget(t.replace(/\D/g, ""))} keyboardType="number-pad" placeholder="10,00,000" />
          <FormField label="By year" value={year} onChangeText={(t) => setYear(t.replace(/\D/g, "").slice(0, 4))} keyboardType="number-pad" error={create.error?.message} />
          <Button label="Create goal" block disabled={title.trim().length < 2 || !(Number(target) > 0)} loading={create.isPending} onPress={() => create.mutate()} />
        </KeyboardAvoidingView>
      </BottomSheet>
    </Screen>
  );
}
