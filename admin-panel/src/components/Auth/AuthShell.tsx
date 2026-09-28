import type { ReactNode } from "react";

/**
 * Sign-in layout from the RFIN desktop app: an ink (navy) brand panel beside
 * the form on wide screens, the form alone on narrow ones.
 */
export function AuthShell({ eyebrow, title, lede, children }: { eyebrow: string; title: ReactNode; lede: string; children: ReactNode }) {
  return (
    <div className="grid min-h-svh bg-background lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
      <aside className="relative hidden flex-col justify-between overflow-hidden bg-rfin-ink p-12 text-rfin-paper lg:flex">
        <div className="pointer-events-none absolute -right-32 -top-32 size-[28rem] rounded-full border border-rfin-champagne/20" aria-hidden />
        <div className="pointer-events-none absolute -right-12 -top-12 size-72 rounded-full border border-rfin-champagne/15" aria-hidden />
        <p className="font-display text-4xl leading-none tracking-tight">
          Rich Harbor<span className="text-rfin-champagne">.</span>
        </p>
        <div className="relative max-w-md space-y-5">
          <p className="rfin-eyebrow text-rfin-champagne">{eyebrow}</p>
          <h1 className="font-display text-6xl leading-[0.95] tracking-tight">{title}</h1>
          <p className="text-[15px] leading-relaxed text-rfin-paper/70">{lede}</p>
        </div>
        <p className="rfin-eyebrow text-rfin-paper/45">Blogs · Leads · Marketing · Team</p>
      </aside>
      <main className="flex items-center justify-center p-6 md:p-10">
        <div className="w-full max-w-sm space-y-6">
          <p className="font-display text-3xl leading-none tracking-tight lg:hidden">
            Rich Harbor<span className="text-rfin-gold">.</span>
          </p>
          {children}
        </div>
      </main>
    </div>
  );
}
