"use client";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { formatINR, needLabel } from "@rfin/shared";
import { useParams, useRouter } from "next/navigation";
import { useState } from "react";
import { api } from "@/lib/api";
import { useC360Invalidate, useGoal } from "@/lib/hooks";
import { ago } from "@/lib/time";
import { BackLink, Page } from "@/components/shell";
import { useToast } from "@/components/toast";
import { Button, Field, FocusCard, ProgressRing, QueryView, SectionLabel, StatusCode } from "@/components/ui";

/** Goal detail: progress, pace, nudges, contributions (report #17; Phase 3 nudges). */
export default function GoalDetail() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const qc = useQueryClient();
  const toast = useToast();
  const goal = useGoal(Number(id));
  const refresh = useC360Invalidate();
  const [amount, setAmount] = useState("");
  const add = useMutation({
    mutationFn: () => api("goals.contribute", { id: Number(id), amount: Number(amount) * 100 }),
    onSuccess: (g) => { qc.setQueryData(["goal", Number(id)], g); refresh(); setAmount(""); toast(g.state === "achieved" ? "Goal reached" : "Contribution added", "success"); },
  });
  const archive = useMutation({ mutationFn: () => api("goals.archive", { id: Number(id) }), onSuccess: () => { refresh(); router.push("/goals"); } });
  const rail = goal.data ? (
    <>
      <SectionLabel>History</SectionLabel>
      <div className="divide-y divide-rfin-line/10">
        {[...goal.data.contributions].reverse().map((c, i) => <div key={i} className="flex justify-between py-3"><span className="text-xs text-rfin-mute">{ago(c.at)}{c.note ? ` · ${c.note}` : ""}</span><span className="text-sm font-semibold">+{formatINR(c.amount)}</span></div>)}
        {!goal.data.contributions.length ? <p className="py-3 text-sm text-rfin-mute">No contributions yet.</p> : null}
      </div>
    </>
  ) : null;
  return (
    <Page rail={rail} back={<BackLink href="/goals" label="Goals" />}>
      <QueryView query={goal}>
        {(g) => (
          <>
            <header className="space-y-2">
              <StatusCode label={g.state === "achieved" ? "Achieved" : g.onTrack ? "On track" : "Behind"} tone={g.state === "achieved" || g.onTrack ? "success" : "action"} />
              <h1 className="font-display text-6xl tracking-tight">{g.title}</h1>
              <p className="text-sm text-rfin-mute">{needLabel(g.need)} · by {g.targetDate}</p>
            </header>
            <div className="flex items-center gap-6">
              <ProgressRing value={g.pct} total={100} label={`${g.pct}%`} size={110} />
              <div><p className="font-display text-5xl">{formatINR(g.saved)}</p><p className="text-[13px] text-rfin-mute">of {formatINR(g.target)} · {g.monthsLeft} months left</p></div>
            </div>
            {g.state !== "achieved" ? <FocusCard title={g.onTrack ? `Keep ${formatINR(g.monthlyNeeded)} a month going` : `${formatINR(g.monthlyNeeded)} a month gets you back on track`} detail={g.onTrack ? "You're on pace for your date." : "You're behind the pace your date needs. Small top-ups now matter more than big ones later."} cta="See ways to invest" onClick={() => router.push("/explore")} /> : null}
            <form className="flex flex-wrap items-end gap-3" onSubmit={(e) => { e.preventDefault(); add.mutate(); }}>
              <Field className="flex-1" label="Add money · ₹" value={amount} onChange={(e) => setAmount(e.target.value.replace(/\D/g, ""))} inputMode="numeric" placeholder="10000" why="Record money you've set aside for this goal." />
              <Button type="submit" disabled={!(Number(amount) > 0)} loading={add.isPending}>Add contribution</Button>
            </form>
            <p className="text-xs text-rfin-mute">Projections assume steady monthly contributions and no returns. Actual results depend on what you invest in — nothing here is a guarantee.</p>
            <Button variant="outline" loading={archive.isPending} onClick={() => archive.mutate()}>Archive goal</Button>
          </>
        )}
      </QueryView>
    </Page>
  );
}
