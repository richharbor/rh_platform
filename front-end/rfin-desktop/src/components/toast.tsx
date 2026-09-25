"use client";
import { createContext, useCallback, useContext, useRef, useState, type ReactNode } from "react";
import type { Tone } from "@rfin/shared";
import { cn } from "@/lib/cn";

const DOT: Record<Tone, string> = {
  success: "bg-rfin-green",
  pending: "bg-rfin-amber",
  info: "bg-rfin-blue",
  action: "bg-rfin-red",
  danger: "bg-rfin-red",
  neutral: "bg-rfin-amber",
};

const Ctx = createContext<(text: string, tone?: Tone) => void>(() => {});
export const useToast = () => useContext(Ctx);

/** Ink toast with a status dot, bottom-centre like the admin panel's. */
export function ToastProvider({ children }: { children: ReactNode }) {
  const [msg, setMsg] = useState<{ text: string; tone: Tone; id: number } | null>(null);
  const t = useRef<ReturnType<typeof setTimeout>>(undefined);
  const show = useCallback((text: string, tone: Tone = "neutral") => {
    clearTimeout(t.current);
    setMsg({ text, tone, id: Date.now() });
    t.current = setTimeout(() => setMsg(null), 2800);
  }, []);
  return (
    <Ctx.Provider value={show}>
      {children}
      <div aria-live="polite" className="pointer-events-none fixed inset-x-0 bottom-6 z-50 flex justify-center px-4">
        {msg ? (
          <div key={msg.id} className="rfin-rise flex items-center gap-3 rounded-2xl bg-rfin-inverse px-5 py-4 text-sm font-semibold text-rfin-on-inverse shadow-2xl">
            <span className={cn("size-2 rounded-full", DOT[msg.tone])} />
            {msg.text}
          </div>
        ) : null}
      </div>
    </Ctx.Provider>
  );
}
