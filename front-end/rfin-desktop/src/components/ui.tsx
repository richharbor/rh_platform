"use client";
import type { UseQueryResult } from "@tanstack/react-query";
import { AlertTriangle, Check, CircleHelp, Info, Lock, ShieldCheck, Sparkles, X } from "lucide-react";
import type { ButtonHTMLAttributes, InputHTMLAttributes, ReactNode } from "react";
import type { Accent, PriceKind, TimelineStep, Tone } from "@rfin/shared";
import { cn } from "@/lib/cn";

/*
 * Components ported from pixel-perfect-main/src/routes/index.tsx, class for class
 * where the reference defines them (SectionLabel, ButtonAction, goal tiles, the ink
 * recommendation card, ApplicationRow/StatusCard, ActivityRow, "Today's focus",
 * the One ID card), extended with the states the report requires.
 */

// ---------- tone ----------

const TONE_TEXT: Record<Tone, string> = {
  success: "text-rfin-green",
  pending: "text-rfin-amber",
  info: "text-rfin-blue",
  action: "text-rfin-red",
  danger: "text-rfin-destructive",
  neutral: "text-rfin-mute",
};
const TONE_BG: Record<Tone, string> = {
  success: "bg-rfin-green",
  pending: "bg-rfin-amber",
  info: "bg-rfin-blue",
  action: "bg-rfin-red",
  danger: "bg-rfin-destructive",
  neutral: "bg-rfin-mute",
};
const TONE_SOFT: Record<Tone, string> = {
  success: "bg-rfin-green/15",
  pending: "bg-rfin-amber/20",
  info: "bg-rfin-blue/15",
  action: "bg-rfin-red/15",
  danger: "bg-rfin-red/15",
  neutral: "bg-rfin-text/5",
};

// ---------- type ----------

/** `font-mono text-[11px] uppercase tracking-[.18em] text-rfin-mute` + hairline. */
export function SectionLabel({ children, id, action }: { children: ReactNode; id?: string; action?: ReactNode }) {
  return (
    <div className="flex items-center gap-3">
      <h2 id={id} className="font-mono text-[11px] uppercase tracking-[.18em] text-rfin-mute">
        {children}
      </h2>
      <div className="h-px flex-1 bg-rfin-line/15" />
      {action}
    </div>
  );
}

/** Red mono dateline + Anton headline + muted lede — the reference's page header. */
export function PageTitle({ eyebrow, title, lede, className }: { eyebrow?: string; title: ReactNode; lede?: ReactNode; className?: string }) {
  return (
    <header className={cn("rfin-rise rfin-delay-1", className)}>
      {eyebrow ? <div className="font-mono text-[11px] uppercase tracking-[.2em] text-rfin-red">{eyebrow}</div> : null}
      <h1 className="mt-2 max-w-[14ch] font-display text-5xl leading-[.92] tracking-tight sm:text-6xl">{title}</h1>
      {lede ? <p className="mt-4 max-w-xl text-sm leading-relaxed text-rfin-mute">{lede}</p> : null}
    </header>
  );
}

export function Brand({ className }: { className?: string }) {
  return (
    <div className={cn("font-display text-5xl leading-none tracking-tight", className)}>
      RFIN<span className="text-rfin-red">.</span>
    </div>
  );
}

// ---------- buttons ----------

type BtnVariant = "ink" | "paper" | "red" | "outline" | "link";

const BTN: Record<BtnVariant, string> = {
  ink: "bg-rfin-inverse text-rfin-on-inverse hover:bg-rfin-red hover:text-rfin-paper",
  paper: "bg-rfin-on-inverse text-rfin-inverse hover:bg-rfin-amber hover:text-rfin-ink",
  red: "bg-rfin-red text-rfin-paper hover:bg-rfin-inverse hover:text-rfin-on-inverse",
  outline: "border border-rfin-line/20 text-rfin-text hover:bg-rfin-text/5",
  link: "!min-h-0 !px-0 !py-0 text-xs font-semibold text-rfin-red hover:underline",
};

/** `ButtonAction` from the reference: `min-h-11 rounded-full px-5 py-3 text-sm font-semibold`. */
export function Button({
  variant = "ink",
  loading,
  block,
  className,
  children,
  disabled,
  ...rest
}: ButtonHTMLAttributes<HTMLButtonElement> & { variant?: BtnVariant; loading?: boolean; block?: boolean }) {
  return (
    <button
      type="button"
      disabled={disabled || loading}
      aria-busy={loading || undefined}
      className={cn(
        "inline-flex min-h-11 items-center justify-center gap-2 rounded-full px-5 py-3 text-sm font-semibold transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-rfin-text disabled:cursor-not-allowed disabled:opacity-50",
        BTN[variant],
        block && "w-full",
        className,
      )}
      {...rest}
    >
      {loading ? <span className="size-4 animate-spin rounded-full border-2 border-current border-t-transparent" aria-hidden /> : null}
      {children}
    </button>
  );
}

// ---------- surfaces ----------

/** `rounded-2xl border border-rfin-line/10 p-4` */
export function Card({ children, className, tint, onClick }: { children: ReactNode; className?: string; tint?: "amber"; onClick?: () => void }) {
  const cls = cn("rounded-2xl border border-rfin-line/10 p-4 text-left", tint === "amber" && "bg-rfin-amber/15", onClick && "w-full transition-colors hover:bg-rfin-text/5", className);
  return onClick ? (
    <button type="button" onClick={onClick} className={cls}>
      {children}
    </button>
  ) : (
    <div className={cls}>{children}</div>
  );
}

const ACCENT: Record<Accent, string> = {
  red: "bg-rfin-red text-rfin-paper",
  blue: "bg-rfin-blue text-rfin-paper",
  amber: "bg-rfin-amber text-rfin-ink",
  green: "bg-rfin-green text-rfin-paper",
};

/** Goal tile — exactly the reference's goal button. */
export function GoalTile({ label, index, accent, selected, onClick }: { label: string; index: number; accent: Accent; selected?: boolean; onClick?: () => void }) {
  const [first, ...rest] = label.split(" ");
  const lines = rest.length ? [first, rest.join(" ")] : [first];
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={selected}
      className={cn(
        "flex min-h-32 items-end justify-between gap-2 rounded-3xl p-5 text-left transition-transform hover:-translate-y-1 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-rfin-text sm:min-h-36 sm:p-6",
        ACCENT[accent],
        selected && "ring-2 ring-rfin-text ring-offset-2 ring-offset-rfin-surface",
      )}
    >
      <span className="font-display text-3xl leading-none sm:text-4xl">
        {lines.map((w) => (
          <span key={w} className="block">
            {w}
          </span>
        ))}
      </span>
      <span className="font-mono text-sm">{String(index).padStart(2, "0")}</span>
    </button>
  );
}

/** The ink recommendation card. */
export function HeroCard({ label, title, detail, cta = "Review", onClick, icon }: { label: string; title: string; detail?: string; cta?: string; onClick?: () => void; icon?: ReactNode }) {
  return (
    <section className="flex flex-col gap-5 rounded-3xl bg-rfin-inverse p-5 text-rfin-on-inverse sm:flex-row sm:items-center sm:p-6" aria-live="polite">
      <div className="grid size-24 shrink-0 place-items-center rounded-2xl bg-rfin-on-inverse/10 outline-1 -outline-offset-1 outline-rfin-on-inverse/20">
        {icon ?? <Sparkles className="size-7 text-rfin-amber" aria-hidden />}
      </div>
      <div className="min-w-0">
        <div className="font-mono text-[11px] uppercase tracking-widest text-rfin-amber">{label}</div>
        <div className="mt-1 font-display text-2xl tracking-tight sm:text-3xl">{title}</div>
        {detail ? <div className="mt-1 text-[13px] text-rfin-on-inverse/60">{detail}</div> : null}
      </div>
      {onClick ? (
        <Button variant="paper" onClick={onClick} className="sm:ml-auto">
          {cta} <span aria-hidden>↗</span>
        </Button>
      ) : null}
    </section>
  );
}

// ---------- status ----------

/** `font-mono text-[11px] text-rfin-green` — status as an uppercase code. */
export function StatusCode({ label, tone, small }: { label: string; tone: Tone; small?: boolean }) {
  return <span className={cn("font-mono uppercase", small ? "text-[10px]" : "text-[11px]", TONE_TEXT[tone])}>{label}</span>;
}

export function ProgressBar({ value, tone = "success", thick }: { value: number; tone?: Tone; thick?: boolean }) {
  return (
    <div className={cn("overflow-hidden rounded-full bg-rfin-text/10", thick ? "h-2" : "h-1.5")} role="progressbar" aria-valuenow={Math.round(value)} aria-valuemin={0} aria-valuemax={100}>
      <div className={cn("h-full", TONE_BG[tone])} style={{ width: `${Math.max(0, Math.min(100, value))}%` }} />
    </div>
  );
}

/** `ApplicationRow` (flat) / `StatusCard` (boxed). */
export function StatusRow({ title, status, tone, progress, boxed, onClick }: { title: string; status: string; tone: Tone; progress: number; boxed?: boolean; onClick?: () => void }) {
  const body = (
    <>
      <div className="flex items-center justify-between gap-4">
        <span className="text-sm font-semibold">{title}</span>
        <StatusCode label={status} tone={tone} small={boxed} />
      </div>
      <div className="mt-3">
        <ProgressBar value={progress} tone={tone} />
      </div>
    </>
  );
  const cls = cn(boxed ? "rounded-2xl border border-rfin-line/10 p-4" : "border-b border-rfin-line/10 pb-4", onClick && "block w-full text-left transition-colors hover:bg-rfin-text/5");
  return onClick ? (
    <button type="button" onClick={onClick} className={cls}>
      {body}
    </button>
  ) : (
    <div className={cls}>{body}</div>
  );
}

export function Stepper({ steps, current }: { steps: string[]; current: number }) {
  return (
    <div className="space-y-2">
      <div className="flex gap-1">
        {steps.map((_, i) => (
          <div key={i} className={cn("h-1 flex-1 rounded-full", i < current ? "bg-rfin-green" : i === current ? "bg-rfin-text" : "bg-rfin-text/10")} />
        ))}
      </div>
      <div className="flex justify-between font-mono text-[11px] uppercase tracking-[.18em] text-rfin-mute">
        <span>{steps[current]}</span>
        <span className="tracking-normal">
          {String(current + 1).padStart(2, "0")} / {String(steps.length).padStart(2, "0")}
        </span>
      </div>
    </div>
  );
}

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
const shortDate = (iso: string) => {
  const d = new Date(iso);
  return `${d.getDate()} ${MONTHS[d.getMonth()]}`;
};
const ACTOR = { you: "You", rfin: "RFIN", provider: "Provider" } as const;

/** ActivityRow circles joined into a timeline (report #38). */
export function Timeline({ steps }: { steps: TimelineStep[] }) {
  return (
    <ol className="space-y-0">
      {steps.map((s, i) => (
        <li key={i} className="flex gap-3">
          <div className="flex flex-col items-center">
            <div
              className={cn(
                "grid size-8 shrink-0 place-items-center rounded-full",
                s.failed ? "bg-rfin-red/15 text-rfin-red" : s.done ? "bg-rfin-green/15 text-rfin-green" : "border border-rfin-line/15",
              )}
            >
              {s.failed ? <X className="size-4" aria-hidden /> : s.done ? <Check className="size-4" aria-hidden /> : <span className="size-1.5 rounded-full bg-rfin-mute" />}
            </div>
            {i < steps.length - 1 ? <div className="min-h-3 w-px flex-1 bg-rfin-line/15" /> : null}
          </div>
          <div className="pb-5 pt-1.5">
            <p className="text-sm font-semibold">{s.label}</p>
            <p className="mt-0.5 text-xs text-rfin-mute">{s.done ? `${ACTOR[s.actor]} · ${shortDate(s.at)}` : `Waiting on ${ACTOR[s.actor]}`}</p>
          </div>
        </li>
      ))}
    </ol>
  );
}

/** 0/3 → 3/3 lucky-draw ring. Calm, not a slot machine. */
export function ProgressRing({ value, total, size = 72 }: { value: number; total: number; size?: number }) {
  const stroke = 6;
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const pct = Math.min(1, value / total);
  return (
    <div className="relative grid shrink-0 place-items-center" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="absolute inset-0 -rotate-90" aria-hidden>
        <circle cx={size / 2} cy={size / 2} r={r} className="stroke-rfin-text/10" strokeWidth={stroke} fill="none" />
        <circle cx={size / 2} cy={size / 2} r={r} className={pct >= 1 ? "stroke-rfin-green" : "stroke-rfin-amber"} strokeWidth={stroke} fill="none" strokeDasharray={c} strokeDashoffset={c * (1 - pct)} strokeLinecap="round" />
      </svg>
      <span className="font-display text-xl">
        {value}/{total}
      </span>
    </div>
  );
}

// ---------- rows & panels ----------

/** `ActivityRow` */
export function ActivityRow({ icon, title, detail, tone = "success" }: { icon: ReactNode; title: string; detail: string; tone?: Tone }) {
  return (
    <div className="flex items-center gap-3">
      <div className={cn("grid size-8 shrink-0 place-items-center rounded-full", TONE_SOFT[tone], TONE_TEXT[tone])}>{icon}</div>
      <div>
        <p className="text-sm font-semibold">{title}</p>
        <p className="mt-0.5 text-xs text-rfin-mute">{detail}</p>
      </div>
    </div>
  );
}

/** "Today's focus" */
export function FocusCard({ title, detail, cta, onClick }: { title: string; detail: string; cta: string; onClick: () => void }) {
  return (
    <div className="rounded-2xl border border-rfin-line/10 p-4">
      <div className="flex items-start gap-3">
        <div className="mt-1 size-2 shrink-0 rounded-full bg-rfin-red" />
        <div>
          <p className="text-sm font-semibold">{title}</p>
          <p className="mt-1 text-xs leading-relaxed text-rfin-mute">{detail}</p>
        </div>
      </div>
      <button type="button" className="mt-4 text-xs font-semibold text-rfin-red hover:underline" onClick={onClick}>
        {cta} →
      </button>
    </div>
  );
}

/** Sidebar "One ID" card. */
export function IdentityCard({ name, meta, action }: { name: string; meta: string; action?: ReactNode }) {
  return (
    <div className="rounded-2xl border border-rfin-line/10 bg-rfin-amber/20 p-5">
      <div className="font-mono text-[11px] uppercase tracking-widest text-rfin-mute">One ID</div>
      <div className="mt-1 font-display text-3xl">
        {name}
        <span className="text-rfin-red">.</span>
      </div>
      <div className="mt-1 text-[13px] text-rfin-mute">{meta}</div>
      {action}
    </div>
  );
}

/** "Need a hand?" */
export function SupportPanel({ body, requested, onClick }: { body: string; requested?: boolean; onClick: () => void }) {
  return (
    <section className="rounded-2xl border border-rfin-line/10 bg-rfin-amber/15 p-5">
      <SectionLabel>Need a hand?</SectionLabel>
      <p className="mt-3 max-w-sm text-sm leading-relaxed text-rfin-mute">{body}</p>
      <Button onClick={onClick} className="mt-5">
        <CircleHelp className="size-4" aria-hidden /> {requested ? "Advisor requested" : "Talk to a human"}
      </Button>
      {requested ? <p className="mt-3 text-xs font-medium text-rfin-green">Someone from the RFIN team will be in touch shortly.</p> : null}
    </section>
  );
}

export function TrustBanner({ children }: { children: ReactNode }) {
  return (
    <div className="flex items-center gap-3 rounded-2xl border border-rfin-line/10 p-4">
      <div className="grid size-8 shrink-0 place-items-center rounded-full bg-rfin-green/15 text-rfin-green">
        <ShieldCheck className="size-4" aria-hidden />
      </div>
      <p className="text-[13px] leading-relaxed text-rfin-mute">{children}</p>
    </div>
  );
}

/** Risks — red-dot list, always above reward content (report #10). */
export function Disclosure({ title = "Risks & limitations", items }: { title?: string; items: string[] }) {
  return (
    <div className="space-y-2.5 rounded-2xl border border-rfin-line/10 p-4">
      <div className="font-mono text-[11px] uppercase tracking-[.18em] text-rfin-mute">{title}</div>
      {items.map((it) => (
        <div key={it} className="flex items-start gap-3">
          <div className="mt-2 size-1.5 shrink-0 rounded-full bg-rfin-red" />
          <p className="text-sm leading-relaxed text-rfin-mute">{it}</p>
        </div>
      ))}
    </div>
  );
}

export const PRICE_KIND_LABEL: Record<PriceKind, string> = {
  current_indicative: "Current indicative",
  latest_funding_round: "Latest funding round",
  secondary_trade: "Secondary trade",
  indicative_mark: "Indicative mark",
};

export function IndicativeBadge({ label = "Indicative" }: { label?: string }) {
  return <span className="inline-flex rounded-full border border-rfin-blue px-2 py-0.5 font-mono text-[10px] uppercase text-rfin-blue">{label}</span>;
}

// ---------- form ----------

export function Field({ label, why, error, className, ...input }: InputHTMLAttributes<HTMLInputElement> & { label: string; why?: string; error?: string }) {
  const id = input.id ?? label.toLowerCase().replace(/[^a-z0-9]+/g, "-");
  return (
    <div className={cn("space-y-2", className)}>
      <label htmlFor={id} className="block font-mono text-[11px] uppercase tracking-[.18em] text-rfin-mute">
        {label}
      </label>
      <input
        id={id}
        aria-invalid={!!error || undefined}
        className={cn(
          "h-12 w-full rounded-xl border border-rfin-line/15 bg-transparent px-4 text-[15px] font-medium outline-none transition-colors focus:border-rfin-text",
          error && "border-rfin-red focus:border-rfin-red",
        )}
        {...input}
      />
      {error ? <p className="text-xs text-rfin-red">{error}</p> : why ? <p className="text-xs text-rfin-mute">{why}</p> : null}
    </div>
  );
}

// ---------- states ----------

export function Skeleton({ className }: { className?: string }) {
  return <div className={cn("animate-pulse rounded-md bg-rfin-text/10", className)} />;
}

export function SkeletonCard() {
  return (
    <div className="space-y-3 rounded-2xl border border-rfin-line/10 p-5">
      <Skeleton className="h-2.5 w-1/3" />
      <Skeleton className="h-7 w-2/3" />
      <Skeleton className="h-1.5 w-full rounded-full" />
    </div>
  );
}

type StateProps = { title: string; body?: string; action?: { label: string; onClick: () => void } };

function StatePanel({ icon, tone, title, body, action }: StateProps & { icon: ReactNode; tone: Tone }) {
  return (
    <div className="space-y-3 rounded-2xl border border-rfin-line/10 p-5">
      <div className={cn("grid size-8 place-items-center rounded-full", TONE_SOFT[tone], TONE_TEXT[tone])}>{icon}</div>
      <p className="font-display text-2xl">{title}</p>
      {body ? <p className="text-sm leading-relaxed text-rfin-mute">{body}</p> : null}
      {action ? (
        <Button onClick={action.onClick} className="mt-1">
          {action.label}
        </Button>
      ) : null}
    </div>
  );
}

export const EmptyState = (p: StateProps) => <StatePanel icon={<Info className="size-4" />} tone="neutral" {...p} />;
export const ErrorState = (p: StateProps) => <StatePanel icon={<AlertTriangle className="size-4" />} tone="action" {...p} />;
export const LockedState = (p: StateProps) => <StatePanel icon={<Lock className="size-4" />} tone="info" {...p} />;

/** Loading / error / empty, handled the same way everywhere (UX rules 3, 10). */
export function QueryView<T>({ query, empty, children }: { query: UseQueryResult<T>; empty?: StateProps; children: (d: T) => ReactNode }) {
  if (query.isPending) return <SkeletonCard />;
  if (query.isError) return <ErrorState title="This didn't load" body={query.error.message} action={{ label: "Try again", onClick: () => query.refetch() }} />;
  if (empty && Array.isArray(query.data) && query.data.length === 0) return <EmptyState {...empty} />;
  return <>{children(query.data)}</>;
}

export { TONE_TEXT, TONE_SOFT };
