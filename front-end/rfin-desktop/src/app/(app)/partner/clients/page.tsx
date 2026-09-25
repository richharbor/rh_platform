"use client";
import { needLabel } from "@rfin/shared";
import { UserRound } from "lucide-react";
import { useLeads } from "@/lib/hooks";
import { Page } from "@/components/shell";
import { ActivityRow, PageTitle, QueryView, SectionLabel } from "@/components/ui";

/** Client list. Full Client 360 arrives in Phase 2 (report #85). */
export default function Clients() {
  const leads = useLeads();
  return (
    <Page>
      <PageTitle eyebrow="Clients" title="Know them at a glance." lede="Everyone you've introduced to RFIN, and what they're working towards." />
      <section className="space-y-4">
        <SectionLabel>All clients</SectionLabel>
        <QueryView query={leads} empty={{ title: "No clients yet" }}>
          {(list) => <div className="grid gap-5 md:grid-cols-2">{list.map((l) => <ActivityRow key={l.id} icon={<UserRound className="size-4" />} tone="info" title={l.client} detail={`${needLabel(l.need)} · ${l.nextAction}`} />)}</div>}
        </QueryView>
      </section>
    </Page>
  );
}
