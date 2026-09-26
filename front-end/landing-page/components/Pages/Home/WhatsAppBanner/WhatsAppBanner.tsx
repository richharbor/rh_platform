"use client";

import Link from "next/link";
import { ArrowRight, MessageCircle } from "lucide-react";
import { Section } from "../brand";

export default function WhatsAppBanner() {
    return (
        <Section>
            <Link
                href="/whatsapp-community"
                className="group flex items-center justify-between gap-4 rounded-3xl bg-rh-emerald px-5 py-5 text-rh-paper transition-colors hover:bg-[#0b6a4c] md:px-8"
            >
                <span className="flex items-center gap-4">
                    <span className="flex size-11 shrink-0 items-center justify-center rounded-2xl bg-rh-paper/15">
                        <MessageCircle className="size-5" />
                    </span>
                    <span>
                        <span className="block font-mono text-[11px] uppercase tracking-[0.2em] text-rh-paper/70">WhatsApp community</span>
                        <span className="block text-[15px] font-semibold md:text-lg">Join for real-time deal flow and new supply</span>
                    </span>
                </span>
                <ArrowRight className="size-5 shrink-0 transition-transform group-hover:translate-x-1" />
            </Link>
        </Section>
    );
}
