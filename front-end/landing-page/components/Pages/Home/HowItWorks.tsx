"use client";

import { motion } from "framer-motion";
import { Eyebrow, Section } from "./brand";

const STEPS = [
    {
        title: "Discover & define",
        description: "Share your investment, funding or insurance requirement confidentially.",
    },
    {
        title: "Evaluate & structure",
        description: "We assess suitability, pricing and execution feasibility against regulatory standards.",
    },
    {
        title: "Execute securely",
        description: "Transactions complete through compliant off-market or institutional channels, fully documented.",
    },
];

export default function HowItWorks() {
    return (
        <Section>
            <div className="rounded-4xl bg-rh-navy px-6 py-14 text-rh-paper md:px-14 md:py-20">
                <div className="max-w-3xl space-y-4">
                    <Eyebrow tone="champagne">How Richharbor works</Eyebrow>
                    <h2 className="font-display text-4xl leading-[0.98] tracking-tight md:text-6xl">
                        A structured, process-driven execution model.
                    </h2>
                </div>

                <ol className="mt-14 grid gap-10 md:grid-cols-3 md:gap-8">
                    {STEPS.map((s, i) => (
                        <motion.li
                            key={s.title}
                            initial={{ opacity: 0, y: 16 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: i * 0.15, duration: 0.5 }}
                            className="border-t border-rh-paper/15 pt-6"
                        >
                            <span className="font-display text-7xl leading-none text-rh-champagne md:text-8xl">{i + 1}</span>
                            <h3 className="mt-6 text-xl font-semibold">{s.title}</h3>
                            <p className="mt-3 max-w-xs leading-relaxed text-rh-paper/65">{s.description}</p>
                        </motion.li>
                    ))}
                </ol>
            </div>
        </Section>
    );
}
