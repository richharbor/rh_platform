import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useState } from "react";
import { View } from "react-native";
import { api } from "@/api/client";
import { useC360Invalidate, useGoal } from "@/api/hooks";
import { useTheme } from "@/design";
import { formatINR } from "@/lib/format";
import { needLabel } from "@/features/needs";
import { ago } from "@/features/notify";
import { PageHeader } from "@/features/PageHeader";
import { AmountText, Button, Card, Display, FocusCard, FormField, ProgressRing, QueryView, Row, Screen, Section, StatusChip, Text, useToast } from "@/ui";

/** Goal detail: progress, pace, nudges, contributions (report #17; Phase 3 goal nudges). */
export default function GoalDetail() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const qc = useQueryClient();
  const toast = useToast();
  const { colors } = useTheme();
  const goal = useGoal(Number(id));
  const refresh = useC360Invalidate();
  const [amount, setAmount] = useState("");
  const add = useMutation({
    mutationFn: () => api("goals.contribute", { id: Number(id), amount: Number(amount) * 100 }),
    onSuccess: (g) => {
      qc.setQueryData(["goal", Number(id)], g);
      refresh();
      setAmount("");
      toast(g.state === "achieved" ? "Goal reached 🎉" : "Contribution added", "success");
    },
  });
  const archive = useMutation({ mutationFn: () => api("goals.archive", { id: Number(id) }), onSuccess: () => { refresh(); router.back(); } });

  return (
    <Screen header={<PageHeader label="Goal" />}>
      <QueryView query={goal}>
        {(g) => (
          <>
            <StatusChip label={g.state === "achieved" ? "Achieved" : g.onTrack ? "On track" : "Behind"} tone={g.state === "achieved" || g.onTrack ? "success" : "action"} />
            <Display size={40}>{g.title}</Display>
            <Text variant="muted">{needLabel(g.need)} · by {g.targetDate}</Text>
            <Row gap={16}>
              <ProgressRing value={g.pct} total={100} label={`${g.pct}%`} size={96} />
              <View style={{ flex: 1, gap: 2 }}>
                <AmountText size={28}>{formatINR(g.saved)}</AmountText>
                <Text variant="caption">of {formatINR(g.target)} · {g.monthsLeft} months left</Text>
              </View>
            </Row>
            {g.state !== "achieved" ? (
              <FocusCard
                title={g.onTrack ? `Keep ${formatINR(g.monthlyNeeded)} a month going` : `${formatINR(g.monthlyNeeded)} a month gets you back on track`}
                detail={g.onTrack ? "You're on pace for your date." : "You're behind the pace your date needs. Small top-ups now matter more than big ones later."}
                cta="See ways to invest"
                onPress={() => router.push("/explore")}
              />
            ) : null}
            <Section title="Add money">
              <FormField label="Amount · ₹" value={amount} onChangeText={(t) => setAmount(t.replace(/\D/g, ""))} keyboardType="number-pad" placeholder="10,000" why="Record money you've set aside for this goal." />
              <Button label="Add contribution" disabled={!(Number(amount) > 0)} loading={add.isPending} onPress={() => add.mutate()} />
            </Section>
            <Section title="History" gap={0}>
              {[...g.contributions].reverse().map((c, i) => (
                <Row key={i} style={{ justifyContent: "space-between", paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: colors.lineSoft }}>
                  <Text variant="caption">{ago(c.at)}{c.note ? ` · ${c.note}` : ""}</Text>
                  <Text variant="title">+{formatINR(c.amount)}</Text>
                </Row>
              ))}
              {!g.contributions.length ? <Text variant="muted">No contributions yet.</Text> : null}
            </Section>
            <Card style={{ gap: 4 }}>
              <Text variant="xs">Projections assume steady monthly contributions and no returns. Actual results depend on what you invest in — nothing here is a guarantee.</Text>
            </Card>
            <Row><Button label="Archive goal" variant="outline" loading={archive.isPending} onPress={() => archive.mutate()} /></Row>
          </>
        )}
      </QueryView>
    </Screen>
  );
}
