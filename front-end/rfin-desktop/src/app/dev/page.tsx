"use client";
import { useQueryClient } from "@tanstack/react-query";
import { api, API_URL } from "@/lib/api";
import Link from "next/link";
import { useState } from "react";
import { cn } from "@/lib/cn";
import { PageTitle, SectionLabel } from "@/components/ui";

const TOGGLES: { key: "failPayments"; label: string }[] = [{ key: "failPayments", label: "Payments fail (server-side)" }];

/** Force failure paths on rhserver — shared by every client of that server. */
export default function Dev() {
  const qc = useQueryClient();
  const [s, setS] = useState({ failPayments: false });
  return (
    <div className="mx-auto max-w-xl space-y-8 p-8">
      <PageTitle eyebrow="Developer" title="Mock scenarios." lede={`Switches live on rhserver (${API_URL}) and reset when it restarts.`} />
      <section className="space-y-3">
        <SectionLabel>Server behaviour</SectionLabel>
        {TOGGLES.map((t) => (
          <button
            key={t.key}
            role="switch"
            aria-checked={s[t.key]}
            onClick={() => {
              api("dev.scenario", { [t.key]: !s[t.key] })
                .then(setS)
                .then(() => qc.invalidateQueries())
                .catch(() => {});
            }}
            className="flex w-full items-center justify-between rounded-2xl border border-rfin-line/10 p-4 text-sm font-semibold"
          >
            {t.label}
            <span className={cn("h-6 w-11 rounded-full p-0.5 transition-colors", s[t.key] ? "bg-rfin-green" : "bg-rfin-text/15")}>
              <span className={cn("block size-5 rounded-full bg-rfin-paper transition-transform", s[t.key] && "translate-x-5")} />
            </span>
          </button>
        ))}
      </section>
      <Link href="/home" className="text-xs font-semibold text-rfin-red hover:underline">← Back to app</Link>
    </div>
  );
}
