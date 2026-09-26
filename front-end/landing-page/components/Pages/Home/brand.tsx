import Link from "next/link";
import type { ReactNode } from "react";
import { cn } from "@/lib/cn";

/**
 * Building blocks for the light, editorial home page — same language as the RFIN
 * apps: Anton headlines, mono eyebrows, paper background, and accents that always
 * run gold → navy → champagne → emerald by position.
 */

export const ACCENTS = [
  { tile: "bg-rh-gold text-rh-navy", bar: "bg-rh-gold", text: "text-rh-gold" },
  { tile: "bg-rh-navy text-rh-paper", bar: "bg-rh-navy", text: "text-rh-navy" },
  { tile: "bg-rh-champagne text-rh-navy", bar: "bg-rh-champagne", text: "text-rh-gold" },
  { tile: "bg-rh-emerald text-rh-paper", bar: "bg-rh-emerald", text: "text-rh-emerald" },
] as const;
export const accentAt = (i: number) => ACCENTS[i % ACCENTS.length];

export const pad = (n: number) => String(n).padStart(2, "0");

export function Section({ id, className, children }: { id?: string; className?: string; children: ReactNode }) {
  return (
    <section id={id} className={cn("mx-auto w-full max-w-7xl scroll-mt-28 px-0 md:px-6", className)}>
      {children}
    </section>
  );
}

export function Eyebrow({ children, className, tone = "gold" }: { children: ReactNode; className?: string; tone?: "gold" | "mute" | "champagne" }) {
  const color = { gold: "text-rh-gold", mute: "text-rh-mute", champagne: "text-rh-champagne" }[tone];
  return <p className={cn("font-mono text-[11px] uppercase tracking-[0.2em]", color, className)}>{children}</p>;
}

/** Mono label with a hairline running to the right edge — the section divider from the apps. */
export function RuleLabel({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <div className={cn("flex items-center gap-4", className)}>
      <span className="font-mono text-[11px] uppercase tracking-[0.2em] text-rh-mute">{children}</span>
      <span className="h-px flex-1 bg-rh-navy/15" />
    </div>
  );
}

export function Headline({ as: Tag = "h2", className, children }: { as?: "h1" | "h2" | "h3"; className?: string; children: ReactNode }) {
  return <Tag className={cn("font-display leading-[0.98] tracking-tight text-rh-navy", className)}>{children}</Tag>;
}

const BUTTON = {
  navy: "bg-rh-navy text-rh-paper hover:bg-rh-midnight",
  gold: "bg-rh-champagne text-rh-navy hover:bg-[#e4cb96]",
  outline: "border border-rh-navy/25 text-rh-navy hover:bg-rh-navy/5",
  outlineLight: "border border-rh-paper/25 text-rh-paper hover:bg-rh-paper/10",
} as const;

export const buttonClass = (variant: keyof typeof BUTTON, className?: string) =>
  cn(
    "inline-flex h-12 items-center justify-center gap-2 rounded-full px-7 text-[15px] font-semibold transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-rh-gold",
    BUTTON[variant],
    className,
  );

export function ButtonLink({ href, variant = "navy", className, children }: { href: string; variant?: keyof typeof BUTTON; className?: string; children: ReactNode }) {
  return (
    <Link href={href} className={buttonClass(variant, className)}>
      {children}
    </Link>
  );
}
