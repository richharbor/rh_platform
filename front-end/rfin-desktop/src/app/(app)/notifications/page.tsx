"use client";
import type { NotificationItem } from "@rfin/shared";
import { Bell, CreditCard, FileText, LifeBuoy, ShieldCheck, Trophy } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { cn } from "@/lib/cn";
import { useMarkRead, useNotifications } from "@/lib/hooks";
import { ago, CATEGORY_LABEL } from "@/lib/time";
import { Page } from "@/components/shell";
import { Button, Chips, PageTitle, QueryView, TONE_SOFT, TONE_TEXT } from "@/components/ui";

const ICON = { applications: FileText, kyc: ShieldCheck, payments: CreditCard, rewards: Trophy, product_updates: Bell, promotions: Bell, support: LifeBuoy } as const;

/** Notifications centre (report #48). */
export default function Notifications() {
  const router = useRouter();
  const notes = useNotifications();
  const markRead = useMarkRead();
  const [filter, setFilter] = useState<"all" | "unread">("all");
  const open = (n: NotificationItem) => {
    if (!n.read) markRead.mutate([n.id]);
    if (n.route) router.push(n.route);
  };
  return (
    <Page>
      <PageTitle eyebrow="Alerts" title="What changed." lede="Every status change on your money, KYC and rewards — nothing promotional unless you ask for it." />
      <div className="flex flex-wrap items-center justify-between gap-3">
        <Chips<"all" | "unread"> value={filter} onChange={setFilter} items={[{ id: "all", label: "All" }, { id: "unread", label: "Unread", count: notes.data?.unread }]} />
        <div className="flex gap-2">
          <Button variant="outline" disabled={!notes.data?.unread} onClick={() => markRead.mutate(undefined)}>Mark all read</Button>
          <Button variant="outline" onClick={() => router.push("/notifications/preferences")}>Preferences</Button>
        </div>
      </div>
      <QueryView query={notes}>
        {(d) => {
          const items = d.items.filter((n) => filter === "all" || !n.read);
          if (!items.length) return <p className="text-sm text-rfin-mute">You&apos;re all caught up.</p>;
          return (
            <div className="divide-y divide-rfin-line/10 rounded-2xl border border-rfin-line/10">
              {items.map((n) => {
                const Icon = ICON[n.category];
                return (
                  <button key={n.id} type="button" onClick={() => open(n)} className="flex w-full gap-3 p-4 text-left hover:bg-rfin-text/5">
                    <span className={cn("grid size-8 shrink-0 place-items-center rounded-full", TONE_SOFT[n.tone], TONE_TEXT[n.tone])}>
                      <Icon className="size-4" />
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="flex justify-between gap-4 font-mono text-[11px] uppercase text-rfin-mute">
                        {CATEGORY_LABEL[n.category]}
                        <span className="normal-case">{ago(n.at)}</span>
                      </span>
                      <span className={cn("mt-0.5 block text-sm font-semibold", n.read && "opacity-70")}>{n.title}</span>
                      <span className="block text-xs text-rfin-mute">{n.body}</span>
                    </span>
                    {!n.read ? <span aria-label="Unread" className="mt-1.5 size-2 shrink-0 rounded-full bg-rfin-red" /> : null}
                  </button>
                );
              })}
            </div>
          );
        }}
      </QueryView>
    </Page>
  );
}
