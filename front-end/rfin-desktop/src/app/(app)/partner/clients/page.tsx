"use client";
import { formatCompact, needLabel } from "@rfin/shared";
import { UserRound } from "lucide-react";
import { useRouter } from "next/navigation";
import { useClients } from "@/lib/hooks";
import { Page } from "@/components/shell";
import { ActivityRow, PageTitle, QueryView, SectionLabel } from "@/components/ui";

/** Clients — each opens Client 360 (report #85). */
export default function Clients() {
  const router = useRouter();
  const clients = useClients();
  return (
    <Page>
      <PageTitle eyebrow="Clients" title="Know them at a glance." lede="Everyone you've introduced to RFIN, and what they're working towards." />
      <section className="space-y-4">
        <SectionLabel>All clients</SectionLabel>
        <QueryView query={clients} empty={{ title: "No clients yet" }}>
          {(list) => <div className="grid gap-5 md:grid-cols-2">{list.map((c) => <button key={c.key} type="button" onClick={() => router.push(`/partner/clients/${c.key}`)} className="block text-left"><ActivityRow icon={<UserRound className="size-4" />} tone="info" title={c.name} detail={`${c.needs.map(needLabel).join(", ")} · ${formatCompact(c.openValue)} open · ${c.nextAction}`} /></button>)}</div>}
        </QueryView>
      </section>
    </Page>
  );
}
