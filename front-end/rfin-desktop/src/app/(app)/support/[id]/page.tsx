"use client";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import type { SupportTicket } from "@rfin/shared";
import { Send } from "lucide-react";
import { useParams } from "next/navigation";
import { useState } from "react";
import { api } from "@/lib/api";
import { cn } from "@/lib/cn";
import { useTicket } from "@/lib/hooks";
import { ago, TICKET_STATE } from "@/lib/time";
import { BackLink, Page } from "@/components/shell";
import { Button, QueryView, StatusCode } from "@/components/ui";

/** One support conversation; advisor replies arrive on their own. */
export default function Ticket() {
  const { id } = useParams<{ id: string }>();
  const qc = useQueryClient();
  const ticket = useTicket(id);
  const [text, setText] = useState("");
  const set = (t: SupportTicket) => {
    qc.setQueryData(["ticket", id], t);
    qc.invalidateQueries({ queryKey: ["tickets"] });
  };
  const send = useMutation({ mutationFn: () => api("support.reply", { id, text: text.trim() }), onSuccess: (t) => { setText(""); set(t); } });
  const resolve = useMutation({ mutationFn: () => api("support.resolve", { id }), onSuccess: set });

  return (
    <Page back={<BackLink href="/support" label="Support" />}>
      <QueryView query={ticket}>
        {(t) => (
          <>
            <header className="space-y-2">
              <StatusCode label={t.advisorTyping ? "Advisor is typing…" : TICKET_STATE[t.state].label} tone={t.advisorTyping ? "pending" : TICKET_STATE[t.state].tone} />
              <h1 className="font-display text-5xl leading-[.95] tracking-tight">{t.subject}</h1>
              <p className="font-mono text-[11px] uppercase text-rfin-mute">{t.id}{t.contextId ? ` · about ${t.contextType} ${t.contextId}` : ""}</p>
            </header>
            <div className="space-y-3" aria-live="polite">
              {t.messages.map((m, i) => {
                const mine = m.from === "you";
                return (
                  <div key={i} className={cn("flex max-w-[85%] flex-col gap-1", mine ? "ml-auto items-end" : "items-start")}>
                    <div className={cn("rounded-2xl px-4 py-3 text-[15px] leading-relaxed", mine ? "bg-rfin-inverse text-rfin-on-inverse" : "bg-rfin-amber/20")}>{m.text}</div>
                    <span className="text-xs text-rfin-mute">{mine ? "You" : m.author ?? "RFIN"} · {ago(m.at)}</span>
                  </div>
                );
              })}
            </div>
            {t.state === "awaiting_you" ? <Button variant="outline" loading={resolve.isPending} onClick={() => resolve.mutate()}>This solved it</Button> : null}
            {t.state !== "resolved" ? (
              <form className="flex gap-2 border-t border-rfin-line/15 pt-5" onSubmit={(e) => { e.preventDefault(); if (text.trim()) send.mutate(); }}>
                <input aria-label="Reply" value={text} onChange={(e) => setText(e.target.value)} placeholder="Reply…" className="h-12 flex-1 rounded-full border border-rfin-line/15 bg-transparent px-5 text-[15px] outline-none focus:border-rfin-text" />
                <button type="submit" aria-label="Send" disabled={!text.trim() || send.isPending} className="grid size-12 place-items-center rounded-full bg-rfin-inverse text-rfin-on-inverse disabled:opacity-50">
                  <Send className="size-4" />
                </button>
              </form>
            ) : (
              <p className="text-sm text-rfin-mute">This request is resolved. Open a new one anytime.</p>
            )}
          </>
        )}
      </QueryView>
    </Page>
  );
}
