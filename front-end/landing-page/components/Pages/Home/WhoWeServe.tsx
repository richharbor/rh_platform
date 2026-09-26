"use client";

import { Briefcase, Building, Landmark, User, Users } from "lucide-react";
import { accentAt, Eyebrow, Headline, pad, Section } from "./brand";

const SEGMENTS = [
    { icon: User, title: "Individual investors & HNIs", description: "Access to vetted high-growth and high-yield assets." },
    { icon: Building, title: "Family offices", description: "Tailored wealth structuring and deal flow." },
    { icon: Briefcase, title: "Founders & corporates", description: "Capital raising and strategic advisory." },
    { icon: Users, title: "Bankers & wealth advisors", description: "Partner with us to serve your network." },
    { icon: Landmark, title: "Institutions & funds", description: "Direct access to large-ticket block deals." },
];

export default function WhoWeServe() {
    return (
        <Section className="grid gap-12 lg:grid-cols-[minmax(0,0.8fr)_minmax(0,1.2fr)]">
            <div className="space-y-4 lg:sticky lg:top-32 lg:self-start">
                <Eyebrow>Who we serve</Eyebrow>
                <Headline className="text-4xl md:text-6xl">Designed for every financial stakeholder.</Headline>
            </div>

            <ul className="border-t border-rh-navy/15">
                {SEGMENTS.map((s, i) => (
                    <li key={s.title} className="group flex items-center gap-5 border-b border-rh-navy/10 py-6">
                        <span className="w-8 font-mono text-sm text-rh-mute">{pad(i + 1)}</span>
                        <span className={`flex size-12 shrink-0 items-center justify-center rounded-2xl ${accentAt(i).tile}`}>
                            <s.icon className="size-5" strokeWidth={1.7} />
                        </span>
                        <span className="flex-1">
                            <span className="block font-display text-2xl leading-tight md:text-3xl">{s.title}</span>
                            <span className="mt-1 block text-[15px] text-rh-mute">{s.description}</span>
                        </span>
                    </li>
                ))}
            </ul>
        </Section>
    );
}
