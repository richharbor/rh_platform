import { useMutation } from "@tanstack/react-query";
import { useState } from "react";
import { View } from "react-native";
import { track } from "@/analytics";
import type { Need } from "@/domain/models";
import { AuthHeader } from "@/features/AuthHeader";
import { accentAt, NEEDS } from "@/features/needs";
import { useSession } from "@/stores/session";
import { Button, GoalTile, Row, Screen, StickyCTA, Stepper, Text } from "@/ui";
import { useTheme } from "@/design";

/** Need-first discovery: start from the goal, not the product category (report #4). */
export default function Needs() {
  const { colors } = useTheme();
  const { needs: saved, saveNeeds, finishOnboarding, profile } = useSession();
  const [picked, setPicked] = useState<Need[]>(saved);

  const toggle = (n: Need) => {
    const next = picked.includes(n) ? picked.filter((x) => x !== n) : [...picked, n];
    setPicked(next);
    saveNeeds(next); // save-and-resume (report #13)
  };

  const finish = useMutation({
    mutationFn: finishOnboarding,
    onSuccess: () => track("welcome_reward_issued", { points: 1000 }),
  });

  const rows = [NEEDS.slice(0, 2), NEEDS.slice(2, 4), NEEDS.slice(4, 6), NEEDS.slice(6, 8)];

  return (
    <Screen
      footer={
        <StickyCTA note={picked.length ? `${picked.length} selected · change anytime` : "Pick at least one — you can change this anytime."}>
          <Button
            label="Take me home"
            block
            disabled={!picked.length}
            loading={finish.isPending}
            event="onboarding_completed"
            eventProps={{ needs: picked }}
            onPress={() => finish.mutate()}
          />
          {finish.isError ? <Text variant="xs" style={{ color: colors.destructive, textAlign: "center", marginTop: 8 }}>{finish.error.message}</Text> : null}
        </StickyCTA>
      }
    >
      <AuthHeader back={false} />
      <Stepper steps={["About you", "Your goals"]} current={1} />
      <Text variant="hero">{profile.name ? `${profile.name.split(" ")[0]}, what` : "What"} brings you here?</Text>
      <Text variant="muted" style={{ marginTop: -16 }}>Choose everything that fits. We'll shape your home around it.</Text>
      <View style={{ gap: 12 }}>
        {rows.map((row, r) => (
          <Row key={r} gap={12}>
            {row.map((n, k) => (
              <GoalTile key={n.id} label={n.label} index={r * 2 + k + 1} accent={accentAt(r * 2 + k)} selected={picked.includes(n.id)} onPress={() => toggle(n.id)} />
            ))}
          </Row>
        ))}
      </View>
    </Screen>
  );
}
