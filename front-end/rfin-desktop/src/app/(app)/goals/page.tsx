"use client";
import { useMutation } from "@tanstack/react-query";
import { formatINR, NEEDS, type Need } from "@rfin/shared";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { api } from "@/lib/api";
import { cn } from "@/lib/cn";
import { useC360Invalidate, useGoals } from "@/lib/hooks";
import { Page } from "@/components/shell";
import { Button, Chips, Dialog, Field, PageTitle, ProgressBar, QueryView } from "@/components/ui";

/** Goals as first-class objects (report #17). */
export default function Goals() {
  const router = useRouter();
  const goals = useGoals();
  const refresh = useC360Invalidate();
  const [open, setOpen] = useState(false);
  const [need, setNeed] = useState<Need>("save_plan");
  const [title, setTitle] = useState("");
  const [target, setTarget] = useState("");
  const [year, setYear] = useState(String(new Date().getFullYear() + 5));
  const create = useMutation({
    mutationFn: () => api("goals.create", { need, title: title.trim(), target: Number(target) * 100, targetDate: `${year}-12-31` }),
    onSuccess: (g) => { refresh(); setOpen(false); router.push(`/goals/${g.id}`); },
  });
  return (
    <Page>
      <div className="flex flex-wrap items-end justify-between gap-4">
        <PageTitle eyebrow="Goals" title="Where you're heading." lede="Give each goal a target and a date — we'll show the monthly pace and nudge you if you slip." />
        <Button onClick={() => setOpen(true)}>New goal</Button>
      </div>
      <QueryView query={goals} empty={{ title: "No goals yet", body: "A goal turns a vague wish into a monthly number." }}>
        {(list) => (
          <div className="grid gap-3 md:grid-cols-2">
            {list.filter((g) => g.state !== "archived").map((g) => (
              <button key={g.id} type="button" onClick={() => router.push(`/goals/${g.id}`)} className="space-y-3 rounded-2xl border border-rfin-line/10 p-5 text-left hover:bg-rfin-text/5">
                <div className="flex justify-between gap-3"><span className="font-display text-2xl">{g.title}</span><span className={cn("font-mono text-[11px]", g.state === "achieved" || g.onTrack ? "text-rfin-green" : "text-rfin-red")}>{g.state === "achieved" ? "DONE" : g.onTrack ? "ON TRACK" : "BEHIND"}</span></div>
                <ProgressBar value={g.pct} tone={g.onTrack ? "success" : "action"} thick />
                <p className="text-xs text-rfin-mute">{formatINR(g.saved)} of {formatINR(g.target)} · {g.monthlyNeeded ? `${formatINR(g.monthlyNeeded)}/month to ${g.targetDate}` : "reached"}</p>
              </button>
            ))}
          </div>
        )}
      </QueryView>
      <Dialog open={open} onClose={() => setOpen(false)} title="New goal">
        <form className="space-y-4" onSubmit={(e) => { e.preventDefault(); create.mutate(); }}>
          <Chips value={need} onChange={setNeed} items={NEEDS.filter((n) => n.id !== "refer_someone").map((n) => ({ id: n.id, label: n.label }))} />
          <Field label="Name" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Home down payment" />
          <Field label="Target · ₹" value={target} onChange={(e) => setTarget(e.target.value.replace(/\D/g, ""))} inputMode="numeric" placeholder="1000000" />
          <Field label="By year" value={year} onChange={(e) => setYear(e.target.value.replace(/\D/g, "").slice(0, 4))} inputMode="numeric" error={create.error?.message} />
          <Button type="submit" block disabled={title.trim().length < 2 || !(Number(target) > 0)} loading={create.isPending}>Create goal</Button>
        </form>
      </Dialog>
    </Page>
  );
}
