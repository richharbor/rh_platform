"use client";
import { formatINR, ORDER, type Order } from "@rfin/shared";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useNotifications, useOrders } from "@/lib/hooks";
import { ago } from "@/lib/time";
import { Page } from "@/components/shell";
import { ActivityRow, Chips, PageTitle, QueryView, SectionLabel, StatusCode } from "@/components/ui";
import { Bell } from "lucide-react";

type Filter = "all" | "action" | "moving" | "done";
const MATCH: Record<Filter, (o: Order) => boolean> = {
  all: () => true,
  action: (o) => o.state === "action_required",
  moving: (o) => o.state === "submitted" || o.state === "processing",
  done: (o) => ["fulfilled", "rejected", "cancelled", "expired"].includes(o.state),
};

/** Activity centre — applications, orders, payments, what needs you (report #44). */
export default function Activity() {
  const router = useRouter();
  const orders = useOrders();
  const notes = useNotifications();
  const [filter, setFilter] = useState<Filter>("all");
  const list = orders.data ?? [];
  const count = (f: Filter) => list.filter(MATCH[f]).length;

  const rail = (
    <>
      <SectionLabel action={<button className="text-xs font-semibold text-rfin-red hover:underline" onClick={() => router.push("/notifications")}>All →</button>}>Latest updates</SectionLabel>
      <QueryView query={notes}>
        {(d) => (
          <div className="space-y-4">
            {d.items.slice(0, 6).map((n) => (
              <button key={n.id} type="button" onClick={() => n.route && router.push(n.route)} className="block w-full text-left">
                <ActivityRow icon={<Bell className="size-4" />} tone={n.tone} title={n.title} detail={`${ago(n.at)} · ${n.body}`} />
              </button>
            ))}
          </div>
        )}
      </QueryView>
    </>
  );

  return (
    <Page rail={rail}>
      <PageTitle eyebrow="Applications" title="Everything in motion." lede="Applications, orders and payments — and exactly what's next." />
      <Chips<Filter>
        value={filter}
        onChange={setFilter}
        items={[
          { id: "all", label: "All" },
          { id: "action", label: "Needs you", count: count("action") },
          { id: "moving", label: "In progress", count: count("moving") },
          { id: "done", label: "Done" },
        ]}
      />
      <QueryView query={orders} empty={{ title: "Nothing yet", body: "When you apply or invest, every step shows up here.", action: { label: "Discover products", onClick: () => router.push("/explore") } }}>
        {(all) => {
          const shown = all.filter(MATCH[filter]);
          return shown.length ? (
            <div className="divide-y divide-rfin-line/10 rounded-2xl border border-rfin-line/10">
              {shown.map((o) => (
                <button key={o.id} type="button" onClick={() => router.push(`/order/${o.id}`)} className="grid w-full grid-cols-[1fr_auto] items-center gap-x-6 gap-y-1 p-4 text-left hover:bg-rfin-text/5 sm:grid-cols-[110px_1fr_auto_auto]">
                  <span className="font-mono text-[11px] text-rfin-mute">{o.id}</span>
                  <span className="text-sm font-semibold">{o.title}</span>
                  <span className="font-display text-xl">{formatINR(o.amount)}</span>
                  <StatusCode label={ORDER.label[o.state]} tone={ORDER.tone(o.state)} />
                  {o.action ? <span className="col-span-full text-xs text-rfin-red sm:col-start-2">Next · {o.action.label}</span> : null}
                </button>
              ))}
            </div>
          ) : (
            <p className="text-sm text-rfin-mute">Nothing here right now.</p>
          );
        }}
      </QueryView>
    </Page>
  );
}
