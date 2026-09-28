"use client";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import type { SupportContext } from "@rfin/shared";
import { ChevronDown } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useEffect, useState } from "react";
import { api } from "@/lib/api";
import { cn } from "@/lib/cn";
import { useFaqs, useTickets } from "@/lib/hooks";
import { ago, TICKET_STATE } from "@/lib/time";
import { Page } from "@/components/shell";
import { Button, Dialog, Field, PageTitle, QueryView, SectionLabel, StatusCode } from "@/components/ui";

/**
 * Support centre (report #9, #47). Opened from an order / KYC item / product
 * with ?contextType&contextId&subject, the new request carries that context.
 */
function Support() {
  const router = useRouter();
  const qc = useQueryClient();
  const q = useSearchParams();
  const contextType = (q.get("contextType") as SupportContext | null) ?? undefined;
  const contextId = q.get("contextId") ?? undefined;
  const faqs = useFaqs();
  const tickets = useTickets();
  const [openFaq, setOpenFaq] = useState<string>();
  const [composing, setComposing] = useState(!!contextType);
  const [subject, setSubject] = useState(q.get("subject") ?? "");
  const [message, setMessage] = useState("");
  // Intelligent support (Phase 3): suggest answers before a ticket is needed.
  const [suggestions, setSuggestions] = useState<{ id: string; q: string; a: string }[]>([]);
  useEffect(() => {
    const text = `${subject} ${message}`.trim();
    if (text.length < 4) return setSuggestions([]);
    const t = setTimeout(() => api("support.suggest", { q: text }).then(setSuggestions).catch(() => {}), 300);
    return () => clearTimeout(t);
  }, [subject, message]);

  const create = useMutation({
    mutationFn: () => api("support.create", { subject: subject.trim(), message: message.trim(), contextType: contextType ?? "general", contextId }),
    onSuccess: (t) => {
      qc.invalidateQueries({ queryKey: ["tickets"] });
      router.push(`/support/${t.id}`);
    },
  });

  const rail = (
    <>
      <SectionLabel>Common questions</SectionLabel>
      <QueryView query={faqs}>
        {(list) => (
          <div className="divide-y divide-rfin-line/10">
            {list.map((f) => {
              const on = openFaq === f.id;
              return (
                <div key={f.id} className="py-3">
                  <button type="button" aria-expanded={on} onClick={() => setOpenFaq(on ? undefined : f.id)} className="flex w-full items-start justify-between gap-3 text-left text-sm font-semibold">
                    {f.q}
                    <ChevronDown className={cn("mt-0.5 size-4 shrink-0 text-rfin-mute transition-transform", on && "rotate-180")} />
                  </button>
                  {on ? <p className="mt-2 text-[13px] leading-relaxed text-rfin-mute">{f.a}</p> : null}
                </div>
              );
            })}
          </div>
        )}
      </QueryView>
    </>
  );

  return (
    <Page rail={rail}>
      <PageTitle eyebrow="Support" title="Talk to a human." lede="Real advisors, with the context of what you're asking about already in front of them." />
      <Button onClick={() => setComposing(true)}>New request</Button>
      <section className="space-y-3">
        <SectionLabel>Your requests</SectionLabel>
        <QueryView query={tickets} empty={{ title: "No requests yet", body: "Ask anything — an advisor usually replies within minutes." }}>
          {(list) => (
            <div className="divide-y divide-rfin-line/10 rounded-2xl border border-rfin-line/10">
              {list.map((t) => (
                <button key={t.id} type="button" onClick={() => router.push(`/support/${t.id}`)} className="block w-full space-y-1 p-4 text-left hover:bg-rfin-text/5">
                  <div className="flex justify-between gap-4">
                    <span className="font-mono text-[11px] text-rfin-mute">{t.id}{t.contextId ? ` · ${t.contextId}` : ""}</span>
                    <StatusCode label={t.advisorTyping ? "Typing…" : TICKET_STATE[t.state].label} tone={t.advisorTyping ? "pending" : TICKET_STATE[t.state].tone} />
                  </div>
                  <p className="text-sm font-semibold">{t.subject}</p>
                  <p className="truncate text-xs text-rfin-mute">{t.messages[t.messages.length - 1]?.text} · {ago(t.updatedAt)}</p>
                </button>
              ))}
            </div>
          )}
        </QueryView>
      </section>
      {/* FAQs live in the rail on xl; inline below that. */}
      <section className="space-y-3 xl:hidden">
        <SectionLabel>Common questions</SectionLabel>
        <QueryView query={faqs}>{(list) => <div className="space-y-3">{list.map((f) => <details key={f.id} className="rounded-2xl border border-rfin-line/10 p-4"><summary className="cursor-pointer text-sm font-semibold">{f.q}</summary><p className="mt-2 text-[13px] text-rfin-mute">{f.a}</p></details>)}</div>}</QueryView>
      </section>

      <Dialog open={composing} onClose={() => setComposing(false)} title="New request">
        <form className="space-y-4" onSubmit={(e) => { e.preventDefault(); create.mutate(); }}>
          {contextId ? <p className="font-mono text-[11px] uppercase text-rfin-mute">About · {contextId}</p> : null}
          <Field label="Subject" value={subject} onChange={(e) => setSubject(e.target.value)} placeholder="What's it about?" autoFocus />
          {suggestions.length ? (
            <div className="space-y-2 rounded-2xl bg-rfin-amber/15 p-4" aria-live="polite">
              <p className="font-mono text-[11px] uppercase tracking-[.18em] text-rfin-mute">This might answer it</p>
              {suggestions.map((x) => <div key={x.id}><p className="text-sm font-semibold">{x.q}</p><p className="text-xs text-rfin-mute">{x.a}</p></div>)}
            </div>
          ) : null}
          <div className="space-y-2">
            <label htmlFor="msg" className="block font-mono text-[11px] uppercase tracking-[.18em] text-rfin-mute">Message</label>
            <textarea id="msg" value={message} onChange={(e) => setMessage(e.target.value)} rows={4} placeholder="Tell us what you need" className="w-full rounded-xl border border-rfin-line/15 bg-transparent p-4 text-[15px] outline-none focus:border-rfin-text" />
            {create.isError ? <p className="text-xs text-rfin-red">{create.error.message}</p> : null}
          </div>
          <Button type="submit" block disabled={subject.trim().length < 3 || message.trim().length < 2} loading={create.isPending}>Send</Button>
        </form>
      </Dialog>
    </Page>
  );
}

export default function SupportPage() {
  return (
    <Suspense>
      <Support />
    </Suspense>
  );
}
