"use client";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import type { NotificationPrefs } from "@rfin/shared";
import { Lock } from "lucide-react";
import { api } from "@/lib/api";
import { cn } from "@/lib/cn";
import { usePrefs } from "@/lib/hooks";
import { CATEGORY_LABEL } from "@/lib/time";
import { BackLink, Page } from "@/components/shell";
import { useToast } from "@/components/toast";
import { PageTitle, QueryView, SectionLabel, TrustBanner } from "@/components/ui";

const CHANNELS: { id: keyof NotificationPrefs["channels"]; label: string; detail: string }[] = [
  { id: "push", label: "Push", detail: "In the app and browser" },
  { id: "email", label: "Email", detail: "Statements and confirmations" },
  { id: "sms", label: "SMS", detail: "Critical alerts only" },
  { id: "whatsapp", label: "WhatsApp", detail: "Only if you opt in" },
];

function Toggle({ on, disabled, label, onChange }: { on: boolean; disabled?: boolean; label: string; onChange: (v: boolean) => void }) {
  return (
    <button type="button" role="switch" aria-checked={on} aria-label={label} disabled={disabled} onClick={() => onChange(!on)} className={cn("h-6 w-11 shrink-0 rounded-full p-0.5 transition-colors disabled:opacity-50", on ? "bg-rfin-green" : "bg-rfin-text/15")}>
      <span className={cn("block size-5 rounded-full bg-rfin-paper transition-transform", on && "translate-x-5")} />
    </button>
  );
}

/** Channels + categories; money/verification messages locked on (report #49). */
export default function Preferences() {
  const qc = useQueryClient();
  const toast = useToast();
  const prefs = usePrefs();
  const save = useMutation({
    mutationFn: (patch: { channels?: Partial<NotificationPrefs["channels"]>; categories?: Partial<NotificationPrefs["categories"]> }) => api("prefs.update", patch),
    onSuccess: (p) => qc.setQueryData(["prefs"], p),
    onError: (e: Error) => toast(e.message, "danger"),
  });
  return (
    <Page back={<BackLink href="/notifications" label="Notifications" />}>
      <PageTitle eyebrow="Notifications" title="How we reach you." lede="Service messages about your money always come through. Everything else is your call." />
      <QueryView query={prefs}>
        {(p) => (
          <div className="grid gap-8 md:grid-cols-2">
            <section className="space-y-3">
              <SectionLabel>Channels</SectionLabel>
              <div className="divide-y divide-rfin-line/10 rounded-2xl border border-rfin-line/10">
                {CHANNELS.map((c) => (
                  <div key={c.id} className="flex items-center justify-between gap-4 p-4">
                    <div>
                      <p className="text-sm font-semibold">{c.label}</p>
                      <p className="text-xs text-rfin-mute">{c.detail}</p>
                    </div>
                    <Toggle label={c.label} on={p.channels[c.id]} onChange={(v) => save.mutate({ channels: { [c.id]: v } })} />
                  </div>
                ))}
              </div>
            </section>
            <section className="space-y-3">
              <SectionLabel>What we send</SectionLabel>
              <div className="divide-y divide-rfin-line/10 rounded-2xl border border-rfin-line/10">
                {(Object.keys(p.categories) as (keyof NotificationPrefs["categories"])[]).map((k) => {
                  const locked = p.locked.includes(k);
                  return (
                    <div key={k} className="flex items-center justify-between gap-4 p-4">
                      <div>
                        <p className="text-sm font-semibold">{CATEGORY_LABEL[k]}</p>
                        {locked ? (
                          <p className="flex items-center gap-1 text-xs text-rfin-mute">
                            <Lock className="size-3" /> Always on — it&apos;s about your money or verification
                          </p>
                        ) : null}
                      </div>
                      <Toggle label={CATEGORY_LABEL[k]} on={p.categories[k]} disabled={locked} onChange={(v) => save.mutate({ categories: { [k]: v } })} />
                    </div>
                  );
                })}
              </div>
            </section>
          </div>
        )}
      </QueryView>
      <TrustBanner>We never use your phone number or email for third-party marketing.</TrustBanner>
    </Page>
  );
}
