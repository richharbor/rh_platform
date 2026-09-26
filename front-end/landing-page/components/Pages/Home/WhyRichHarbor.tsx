"use client";

import { Check, ShieldCheck } from "lucide-react";
import { Eyebrow, Headline, Section } from "./brand";

const FEATURES = [
    "No public solicitation or mass distribution",
    "Confidential, mandate-based engagement",
    "Transparent pricing and documentation",
    "Institutional-grade execution processes",
    "Partner-friendly payout ecosystem",
];

export default function WhyRichHarbor() {
    return (
        <Section className="grid gap-12 lg:grid-cols-2 lg:items-center">
            <div className="space-y-8">
                <div className="space-y-4">
                    <Eyebrow>Why Richharbor</Eyebrow>
                    <Headline className="text-4xl md:text-6xl">
                        Why clients choose <span className="text-rh-gold">Richharbor.</span>
                    </Headline>
                </div>
                <ul className="divide-y divide-rh-navy/10 border-y border-rh-navy/10">
                    {FEATURES.map((f) => (
                        <li key={f} className="flex items-center gap-4 py-4">
                            <span className="flex size-7 shrink-0 items-center justify-center rounded-full bg-rh-emerald/12 text-rh-emerald">
                                <Check className="size-4" strokeWidth={2.4} />
                            </span>
                            <span className="text-[17px] font-medium">{f}</span>
                        </li>
                    ))}
                </ul>
            </div>

            <div className="relative overflow-hidden rounded-4xl bg-rh-champagne/35 p-8 md:p-12">
                <div className="flex size-14 items-center justify-center rounded-2xl bg-rh-navy text-rh-champagne">
                    <ShieldCheck className="size-6" />
                </div>
                <p className="mt-10 font-display text-4xl leading-[1.02] tracking-tight md:text-5xl">
                    Execution, not advice.
                </p>
                <p className="mt-5 max-w-md text-[15px] leading-relaxed text-rh-navy/75">
                    Richharbor is an execution and facilitation platform. We handle pricing, documentation and settlement
                    with institutional discipline — we don&apos;t give investment advice, and we never assure returns or
                    listing outcomes.
                </p>
                <div className="mt-10 grid grid-cols-3 gap-3 border-t border-rh-navy/15 pt-6">
                    {["Verified supply", "Documented transfers", "Confidential"].map((t) => (
                        <p key={t} className="font-mono text-[10px] uppercase leading-relaxed tracking-[0.14em] text-rh-navy/70">{t}</p>
                    ))}
                </div>
            </div>
        </Section>
    );
}
