"use client";

import { CheckCircle2, XCircle, HelpCircle } from "lucide-react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

const comparisonData = [
    {
        feature: "Pricing Transparency",
        richharbor: "High",
        typical: "Often Unclear",
        description: "Clear breakdown of costs and market-linked pricing.",
    },
    {
        feature: "Execution Support",
        richharbor: "End-to-end",
        typical: "Limited",
        description: "Full assistance from documentation to demat transfer.",
    },
    {
        feature: "Research & Insights",
        richharbor: "Built-in",
        typical: "Minimal",
        description: "Access to detailed company reports and market analysis.",
    },
    {
        feature: "Liquidity Assistance",
        richharbor: "Yes",
        typical: "Varies",
        description: "Support for exiting positions when needed.",
    },
    {
        feature: "Demat Delivery",
        richharbor: "Quick",
        typical: "Mixed",
        description: "Fast and secure transfer to your demat account.",
    },
];

export default function ComparisonBlock() {
    return (
        <section className="py-10 md:py-20 bg-gradient-to-b from-background to-secondary/5">
            <div className="container max-w-5xl mx-auto px-4 md:px-6">
                <div className="text-center mb-10 md:mb-16">
                    <h2 className="text-2xl md:text-4xl font-bold font-batman mb-4">
                        Why Choose Richharbor?
                    </h2>
                    <p className="text-muted-foreground text-sm md:text-lg max-w-2xl mx-auto">
                        See how we stack up against typical platforms in the market.
                    </p>
                </div>

                <div className="relative overflow-hidden rounded-2xl border border-border shadow-lg bg-background/50 backdrop-blur-sm">
                    {/* Header Row */}
                    <div className="grid grid-cols-[1.2fr_1fr_1fr] md:grid-cols-3 p-4 md:p-6 bg-muted/50 border-b border-border items-center">
                        <div className="font-semibold text-sm md:text-lg">Feature</div>
                        <div className="font-bold text-sm md:text-xl text-primary text-center">Richharbor</div>
                        <div className="font-semibold text-xs md:text-lg text-muted-foreground text-center">Typical Platforms</div>
                    </div>

                    {/* Data Rows */}
                    <div className="divide-y divide-border">
                        {comparisonData.map((item, index) => (
                            <motion.div
                                key={index}
                                initial={{ opacity: 0, y: 10 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                transition={{ delay: index * 0.1 }}
                                viewport={{ once: true }}
                                className="grid grid-cols-[1.2fr_1fr_1fr] md:grid-cols-3 p-4 md:p-6 items-center hover:bg-muted/20 transition-colors"
                            >
                                <div className="flex flex-col gap-1">
                                    <span className="font-medium text-xs md:text-base">{item.feature}</span>
                                    <span className="text-xs text-muted-foreground hidden lg:block">{item.description}</span>
                                </div>

                                <div className="flex items-center justify-center gap-1 md:gap-2 text-primary font-medium bg-primary/5 py-1 md:py-2 px-1 md:px-0 rounded-lg mx-1 md:mx-2 border border-primary/10">
                                    <CheckCircle2 className="w-4 h-4 md:w-5 md:h-5 shrink-0" />
                                    <span className="text-xs md:text-base">{item.richharbor}</span>
                                </div>

                                <div className="flex items-center justify-center gap-1 md:gap-2 text-muted-foreground">
                                    {item.typical === "Mixed" || item.typical === "Varies" ? (
                                        <HelpCircle className="w-4 h-4 md:w-5 md:h-5 shrink-0 text-yellow-500/70" />
                                    ) : (
                                        <XCircle className="w-4 h-4 md:w-5 md:h-5 shrink-0 text-destructive/70" />
                                    )}
                                    <span className="text-xs md:text-base text-center">{item.typical}</span>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </div>
        </section>
    );
}
