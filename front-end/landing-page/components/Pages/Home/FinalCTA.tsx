"use client";

import { ArrowRight } from "lucide-react";
import { useQueryWidgetStore } from "@/store/queryWidgetStore";
import { buttonClass, ButtonLink, Eyebrow, Section } from "./brand";

export default function FinalCTA() {
    const { open } = useQueryWidgetStore();
    return (
        <Section>
            <div className="relative overflow-hidden rounded-4xl bg-rh-navy px-6 py-16 text-rh-paper md:px-14 md:py-24">
                <div className="pointer-events-none absolute -right-24 -top-24 size-96 rounded-full border border-rh-champagne/20" aria-hidden />
                <div className="pointer-events-none absolute -right-8 -top-8 size-64 rounded-full border border-rh-champagne/15" aria-hidden />
                <div className="relative max-w-3xl space-y-6">
                    <Eyebrow tone="champagne">Get started</Eyebrow>
                    <h2 className="font-display text-5xl leading-[0.98] tracking-tight md:text-7xl">
                        Ready when you are<span className="text-rh-champagne">.</span>
                    </h2>
                    <p className="max-w-xl text-lg leading-relaxed text-rh-paper/70">
                        Submit your requirement for a confidential discussion, or explore opportunities across the platform.
                    </p>
                    <div className="flex flex-col gap-3 pt-2 sm:flex-row">
                        <button type="button" onClick={open} className={buttonClass("gold")}>
                            Submit your requirement <ArrowRight className="size-4" />
                        </button>
                        <ButtonLink href="/partner-with-us" variant="outlineLight">
                            Partner with Richharbor
                        </ButtonLink>
                    </div>
                </div>
            </div>
        </Section>
    );
}
