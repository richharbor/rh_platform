"use client";
import { useMutation } from "@tanstack/react-query";
import type { FamilyMember } from "@rfin/shared";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { api } from "@/lib/api";
import { cn } from "@/lib/cn";
import { useC360Invalidate, useFamily } from "@/lib/hooks";
import { Page } from "@/components/shell";
import { Button, Chips, Dialog, Field, PageTitle, QueryView, StatusCode, TrustBanner } from "@/components/ui";

/** Family profiles (Phase 2). */
export default function Family() {
  const router = useRouter();
  const family = useFamily();
  const refresh = useC360Invalidate();
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [relation, setRelation] = useState<FamilyMember["relation"]>("spouse");
  const [year, setYear] = useState("");
  const add = useMutation({ mutationFn: () => api("family.add", { name: name.trim(), relation, birthYear: year ? Number(year) : undefined }), onSuccess: () => { refresh(); setOpen(false); setName(""); setYear(""); } });
  const update = useMutation({ mutationFn: (p: { id: number; cover: FamilyMember["cover"] }) => api("family.update", p), onSuccess: refresh });
  const remove = useMutation({ mutationFn: (id: number) => api("family.remove", { id }), onSuccess: refresh });
  const gaps = (family.data ?? []).filter((f) => f.dependent && !f.cover.health).length;
  return (
    <Page>
      <div className="flex flex-wrap items-end justify-between gap-4">
        <PageTitle eyebrow="Family" title="The people you protect." lede="Only names, relations and cover — enough to spot gaps. Nothing is shared with providers until you apply." />
        <Button onClick={() => setOpen(true)}>Add family member</Button>
      </div>
      {gaps ? <TrustBanner>{gaps} dependant{gaps > 1 ? "s" : ""} without health cover. A family floater covers up to 6 people.</TrustBanner> : null}
      <QueryView query={family} empty={{ title: "No family added", body: "Add a spouse, child or parent to see cover gaps." }}>
        {(list) => (
          <div className="grid gap-3 md:grid-cols-2">
            {list.map((f) => (
              <div key={f.id} className="space-y-3 rounded-2xl border border-rfin-line/10 p-5">
                <div className="flex items-start justify-between gap-3">
                  <div><p className="font-display text-2xl">{f.name}</p><p className="text-xs capitalize text-rfin-mute">{f.relation}{f.birthYear ? ` · born ${f.birthYear}` : ""}</p></div>
                  <StatusCode label={f.cover.health && f.cover.life ? "Covered" : f.cover.health || f.cover.life ? "Partly covered" : "No cover"} tone={f.cover.health ? "success" : "action"} />
                </div>
                {(["health", "life"] as const).map((k) => (
                  <div key={k} className="flex items-center justify-between">
                    <span className="text-sm font-semibold capitalize">{k} cover</span>
                    <button type="button" role="switch" aria-checked={!!f.cover[k]} aria-label={`${f.name} ${k} cover`} onClick={() => update.mutate({ id: f.id, cover: { [k]: !f.cover[k] } })} className={cn("h-6 w-11 rounded-full p-0.5", f.cover[k] ? "bg-rfin-green" : "bg-rfin-text/15")}><span className={cn("block size-5 rounded-full bg-rfin-paper transition-transform", f.cover[k] && "translate-x-5")} /></button>
                  </div>
                ))}
                <div className="flex gap-2">
                  {!f.cover.health ? <Button variant="outline" onClick={() => router.push("/product/family-health")}>Compare health cover</Button> : null}
                  <Button variant="link" onClick={() => remove.mutate(f.id)}>Remove</Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </QueryView>
      <Dialog open={open} onClose={() => setOpen(false)} title="Add family member">
        <form className="space-y-4" onSubmit={(e) => { e.preventDefault(); add.mutate(); }}>
          <Field label="Name" value={name} onChange={(e) => setName(e.target.value)} placeholder="Kavya" />
          <Chips value={relation} onChange={setRelation} items={(["spouse", "child", "parent", "sibling"] as const).map((r) => ({ id: r, label: r[0].toUpperCase() + r.slice(1) }))} />
          <Field label="Birth year · optional" value={year} onChange={(e) => setYear(e.target.value.replace(/\D/g, "").slice(0, 4))} inputMode="numeric" placeholder="1993" error={add.error?.message} />
          <Button type="submit" block disabled={name.trim().length < 2} loading={add.isPending}>Add</Button>
        </form>
      </Dialog>
    </Page>
  );
}
