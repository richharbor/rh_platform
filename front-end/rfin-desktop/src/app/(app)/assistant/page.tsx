"use client";
import { useMutation } from "@tanstack/react-query";
import type { AssistantReply } from "@rfin/shared";
import { Send, Sparkles } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { api } from "@/lib/api";
import { cn } from "@/lib/cn";
import { Page } from "@/components/shell";
import { Button, PageTitle } from "@/components/ui";

type Turn = { role: "user" | "assistant"; text: string; actions?: AssistantReply["actions"] };
const STARTERS = ["How are my goals doing?", "What is my portfolio worth?", "What's left in my KYC?", "How does selling unlisted shares work?"];

/** RFIN Assistant (Phase 3): grounded in your RFIN data, explains — never advises or promises returns. */
export default function Assistant() {
  const router = useRouter();
  const [turns, setTurns] = useState<Turn[]>([]);
  const [text, setText] = useState("");
  const [disclaimer, setDisclaimer] = useState<string>();
  const end = useRef<HTMLDivElement>(null);
  const ask = useMutation({
    mutationFn: (message: string) => api("assistant.ask", { message, history: turns.map((t) => ({ role: t.role, text: t.text })) }),
    onSuccess: (r) => { setTurns((t) => [...t, { role: "assistant", text: r.reply, actions: r.actions }]); setDisclaimer(r.disclaimer); },
    onError: (e: Error) => setTurns((t) => [...t, { role: "assistant", text: `Sorry — ${e.message}` }]),
  });
  useEffect(() => { end.current?.scrollIntoView({ behavior: "smooth", block: "end" }); }, [turns.length, ask.isPending]);
  const send = (m: string) => {
    const msg = m.trim();
    if (!msg || ask.isPending) return;
    setTurns((t) => [...t, { role: "user", text: msg }]);
    setText("");
    ask.mutate(msg);
  };
  return (
    <Page>
      {!turns.length ? (
        <div className="space-y-5">
          <div className="flex size-14 items-center justify-center rounded-2xl bg-rfin-inverse"><Sparkles className="size-6 text-rfin-amber" /></div>
          <PageTitle title="Ask RFIN." lede="Answers come from your own RFIN data. It explains — it doesn't give investment advice." />
          <div className="grid gap-2 sm:grid-cols-2">{STARTERS.map((s) => <Button key={s} variant="outline" onClick={() => send(s)}>{s}</Button>)}</div>
        </div>
      ) : (
        <div className="space-y-3" aria-live="polite">
          {turns.map((t, i) => (
            <div key={i} className={cn("flex max-w-[80%] flex-col gap-2", t.role === "user" ? "ml-auto items-end" : "items-start")}>
              <div className={cn("whitespace-pre-wrap rounded-2xl p-4 text-[15px] leading-relaxed", t.role === "user" ? "bg-rfin-inverse text-rfin-on-inverse" : "bg-rfin-amber/15")}>{t.text}</div>
              {t.actions?.length ? <div className="flex flex-wrap gap-2">{t.actions.map((a) => <Button key={a.route} variant="outline" onClick={() => router.push(a.route)}>{a.label}</Button>)}</div> : null}
            </div>
          ))}
          {ask.isPending ? <p className="font-mono text-xs text-rfin-mute">THINKING…</p> : null}
          {disclaimer ? <p className="text-xs text-rfin-mute">{disclaimer}</p> : null}
          <div ref={end} />
        </div>
      )}
      <form className="sticky bottom-24 flex gap-2 border-t border-rfin-line/15 bg-rfin-surface py-3 lg:bottom-0" onSubmit={(e) => { e.preventDefault(); send(text); }}>
        <input aria-label="Message" value={text} onChange={(e) => setText(e.target.value)} placeholder="Ask about your money on RFIN…" className="h-11 flex-1 rounded-full border border-rfin-line/20 bg-transparent px-4 text-[15px] outline-none focus:border-rfin-text" />
        <button type="submit" aria-label="Send" disabled={!text.trim() || ask.isPending} className="flex size-11 items-center justify-center rounded-full bg-rfin-inverse text-rfin-on-inverse disabled:opacity-50"><Send className="size-4" /></button>
      </form>
    </Page>
  );
}
