"use client";

import { motion } from "framer-motion";
import { CheckCircle2 } from "lucide-react";

interface WhyInvestInUnlistedProps {
    title: string;
    description: string;
    reasons: string[];
    badge?: string;
}

export default function WhyInvest({ title, description, reasons, badge = "INVESTMENT THESIS" }: WhyInvestInUnlistedProps) {
    return (
        <section className="py-24 max-w-7xl mx-auto rounded-2xl relative overflow-hidden">
            {/* Abstract Background */}
            <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-primary/5 rounded-full blur-[120px] pointer-events-none opacity-30" />

            <div className="container max-w-6xl mx-auto px-4 md:px-6">
                <div className="grid md:grid-cols-2 gap-12 items-center">
                    <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.5 }}
                    >
                        <span className="inline-block px-4 py-1.5 rounded-full bg-primary/10 text-primary text-sm font-bold tracking-wider mb-6">
                            {badge}
                        </span>
                        <h2 className="text-2xl md:text-4xl font-bold font-batman mb-6 text-white leading-tight">
                            {title}
                        </h2>
                        <p className="text-muted-foreground text-lg leading-relaxed mb-8">
                            {description}
                        </p>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, x: 20 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.5, delay: 0.2 }}
                        className="bg-neutral-900/50 border border-neutral-800 p-8 rounded-3xl backdrop-blur-sm shadow-xl"
                    >
                        <ul className="space-y-6">
                            {reasons.map((reason, index) => (
                                <li key={index} className="flex items-start gap-4">
                                    <div className="mt-1 w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center text-primary shrink-0">
                                        <CheckCircle2 className="w-4 h-4" />
                                    </div>
                                    <span className="text-lg text-neutral-200 font-medium">{reason}</span>
                                </li>
                            ))}
                        </ul>
                    </motion.div>
                </div>
            </div>
        </section>
    );
}
