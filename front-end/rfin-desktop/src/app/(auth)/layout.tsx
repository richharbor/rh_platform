import { Brand } from "@/components/ui";

/** Split sign-in frame: ink brand panel (desktop) + form column. */
export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen bg-rfin-surface text-rfin-text">
      <aside className="hidden w-[44%] max-w-[640px] flex-col justify-between bg-rfin-ink p-10 text-rfin-paper lg:flex">
        <div className="font-display text-6xl leading-none tracking-tight">
          RFIN<span className="text-rfin-red">.</span>
        </div>
        <div className="space-y-6">
          <p className="font-mono text-[11px] uppercase tracking-[.2em] text-rfin-amber">One ID · One home</p>
          <p className="max-w-[12ch] font-display text-6xl leading-[.92] tracking-tight">Your financial life, in one place.</p>
          <div className="grid max-w-md grid-cols-2 gap-3">
            {[
              ["Invest", "bg-rfin-red text-rfin-paper"],
              ["Protect", "bg-rfin-blue text-rfin-paper"],
              ["Borrow", "bg-rfin-amber text-rfin-ink"],
              ["Sell", "bg-rfin-green text-rfin-paper"],
            ].map(([l, c], i) => (
              <div key={l} className={`flex min-h-24 items-end justify-between rounded-3xl p-5 ${c}`}>
                <span className="font-display text-3xl leading-none">{l}</span>
                <span className="font-mono text-sm">{String(i + 1).padStart(2, "0")}</span>
              </div>
            ))}
          </div>
        </div>
        <p className="text-[13px] text-rfin-paper/60">Look around first. We only ask for KYC when a transaction needs it.</p>
      </aside>
      <main className="flex flex-1 items-center justify-center p-6 sm:p-10">
        <div className="w-full max-w-md">
          <Brand className="mb-10 text-4xl lg:hidden" />
          {children}
        </div>
      </main>
    </div>
  );
}
