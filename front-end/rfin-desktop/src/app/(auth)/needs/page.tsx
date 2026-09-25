"use client";
import { accentAt, NEEDS, type Need } from "@rfin/shared";
import { useMutation } from "@tanstack/react-query";
import { useState } from "react";
import { track } from "@/lib/api";
import { useSession } from "@/stores/session";
import { Button, GoalTile, PageTitle, Stepper } from "@/components/ui";

/** Need-first discovery (report #4); saved as you pick (report #13). */
export default function Needs() {
  const { needs, saveNeeds, finishOnboarding, profile } = useSession();
  const [picked, setPicked] = useState<Need[]>(needs);
  const toggle = (n: Need) => {
    const next = picked.includes(n) ? picked.filter((x) => x !== n) : [...picked, n];
    setPicked(next);
    saveNeeds(next);
  };
  const finish = useMutation({ mutationFn: finishOnboarding, onSuccess: () => track("welcome_reward_issued", { points: 1000 }) });
  return (
    <div className="space-y-8">
      <Stepper steps={["About you", "Your goals"]} current={1} />
      <PageTitle title={`${profile.name ? profile.name.split(" ")[0] + ", what" : "What"} brings you here?`} lede="Choose everything that fits. We'll shape your home around it." />
      <div className="grid grid-cols-2 gap-3">
        {NEEDS.map((n, i) => (
          <GoalTile key={n.id} label={n.label} index={i + 1} accent={accentAt(i)} selected={picked.includes(n.id)} onClick={() => toggle(n.id)} />
        ))}
      </div>
      <div className="space-y-3">
        <Button
          block
          disabled={!picked.length}
          loading={finish.isPending}
          onClick={() => {
            track("onboarding_completed", { needs: picked });
            finish.mutate();
          }}
        >
          Take me home
        </Button>
        {finish.isError ? <p className="text-center text-xs text-rfin-red">{finish.error.message}</p> : null}
        <p className="text-center text-xs text-rfin-mute">{picked.length ? `${picked.length} selected · change anytime` : "Pick at least one — you can change this anytime."}</p>
      </div>
    </div>
  );
}
