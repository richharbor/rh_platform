"use client";

import { ArrowRight } from "lucide-react";
import Link from "next/link";
import { accentAt, Eyebrow, Headline, pad, Section } from "./brand";

const OFFERINGS = [
    {
        title: "Unlisted Shares & Pre-IPO",
        description: "Verified unlisted and pre-IPO opportunities with transparent pricing and secure off-market transfers.",
        cta: "Explore unlisted shares",
        href: "/unlisted-shares",
    },
    {
        title: "Bulk Deals",
        description: "Large-volume transactions in listed securities, executed with minimal market impact.",
        cta: "View bulk deals",
        href: "/bulk-deals",
    },
    {
        title: "Private Markets",
        description: "Private equity, venture capital and AIF opportunities, with mandate-led capital introduction.",
        cta: "Private markets",
        href: "/private-markets",
    },
    {
        title: "Loans & Structured Credit",
        description: "Retail, SME and corporate loans — working capital, project finance, RBF and structured funding.",
        cta: "Apply for loans",
        href: "/loans",
    },
    {
        title: "Insurance",
        description: "Life, health, motor and business cover, curated to protect individuals and enterprises.",
        cta: "View insurance",
        href: "/insurance",
    },
    {
        title: "Corporate Finance",
        description: "Strategic advisory, debt syndication and capital raising for growth-stage and pre-IPO companies.",
        cta: "Corporate finance",
        href: "/corporate-finance",
    },
];

export default function CoreOfferings() {
    return (
        <Section id="products" className="space-y-12">
            <div className="grid gap-6 lg:grid-cols-2 lg:items-end">
                <div className="space-y-4">
                    <Eyebrow>What we do</Eyebrow>
                    <Headline className="text-4xl md:text-6xl">One platform. Multiple financial solutions.</Headline>
                </div>
                <p className="max-w-xl text-lg leading-relaxed text-rh-mute lg:justify-self-end">
                    Wealth, credit, protection and capital opportunities for every stage of growth — handled by one team,
                    under one process.
                </p>
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {OFFERINGS.map((o, i) => (
                    <Link
                        key={o.href}
                        href={o.href}
                        className="group relative flex min-h-64 flex-col overflow-hidden rounded-3xl border border-rh-navy/10 bg-white/40 p-7 transition-all hover:-translate-y-1 hover:border-rh-navy/25 hover:bg-white/70"
                    >
                        <span className={`absolute inset-x-0 top-0 h-1.5 ${accentAt(i).bar}`} />
                        <span className="font-mono text-sm text-rh-mute">{pad(i + 1)}</span>
                        <h3 className="mt-6 font-display text-3xl leading-none">{o.title}</h3>
                        <p className="mt-4 flex-1 text-[15px] leading-relaxed text-rh-mute">{o.description}</p>
                        <span className="mt-6 inline-flex items-center gap-2 text-sm font-semibold text-rh-gold">
                            {o.cta}
                            <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" />
                        </span>
                    </Link>
                ))}
            </div>
        </Section>
    );
}
