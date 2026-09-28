"use client";

import React from "react";
import { motion } from "framer-motion";
import { ArrowRight, CheckCircle2, TrendingUp, Building2, ShoppingBag, Briefcase, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function CorporateFinance() {
    return (
        <div className="min-h-screen bg-background pt-5">
            {/* Hero Section */}
            <section className="relative px-6 lg:px-8 py-20 lg:py-32 w-[99vw] overflow-hidden">
                <div className="absolute inset-0 bg-[url('https://richharbor.s3.us-east-1.amazonaws.com/WhatsApp+Image+2026-01-20+at+11.58.13.jpeg')] bg-cover bg-center opacity-20 blur-sm scale-105 pointer-events-none" />
                <div className="absolute inset-0 bg-gradient-to-b from-background via-transparent to-background pointer-events-none" />
                <div className="mx-auto max-w-7xl relative z-10">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5 }}
                        className="text-center"
                    >
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: 0.2 }}
                            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-secondary text-secondary-foreground text-sm font-medium mb-8"
                        >
                            <Zap className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                            Growth Capital Solutions
                        </motion.div>

                        <h1 className="text-3xl sm:text-4xl lg:text-6xl font-bold font-batman tracking-tight text-balance max-w-5xl mx-auto mb-6 bg-clip-text text-transparent bg-gradient-to-r from-foreground to-foreground/70">
                            Corporate Finance & Growth Capital
                        </h1>

                        <h2 className="text-lg sm:text-xl font-medium text-muted-foreground mb-8">
                            Non Dilutive Growth Capital for Businesses
                        </h2>

                        <p className="text-md sm:text-lg text-muted-foreground max-w-2xl mx-auto mb-10 leading-relaxed">
                            Richharbor specializes in corporate finance management and strategic corporate finance, enabling businesses to access revenue based and structured financing solutions without equity dilution.
                        </p>

                        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                            <Link href="/private-markets#contact">
                                <Button size="lg" className="rounded-full px-8 h-12 text-base">
                                    Apply for Capital <ArrowRight className="ml-2 w-4 h-4" />
                                </Button>
                            </Link>
                        </div>
                    </motion.div>
                </div>
            </section>

            {/* Solutions Offered Section */}
            <section className="py-24 px-6 bg-secondary/20">
                <div className="max-w-7xl mx-auto">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        className="text-center mb-16"
                    >
                        <h2 className="text-3xl md:text-5xl font-bold font-batman tracking-tight mb-4">
                            Solutions Offered
                        </h2>
                        <p className="text-muted-foreground max-w-2xl mx-auto">
                            Tailored financial products designed to fuel your business growth.
                        </p>
                    </motion.div>

                    <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
                        {[
                            {
                                title: "Revenue Based Financing",
                                icon: TrendingUp,
                                desc: "Flexible capital repaid as a percentage of your future revenue.",
                                color: "text-blue-500 bg-blue-500/10"
                            },
                            {
                                title: "Fixed Term Growth Capital",
                                icon: Building2,
                                desc: "Capital with fixed repayment schedules for predictable cash flow management.",
                                color: "text-green-500 bg-green-500/10"
                            },
                            {
                                title: "Supply Chain & Seller Financing",
                                icon: ShoppingBag,
                                desc: "Optimize working capital by financing your inventory and receivables.",
                                color: "text-purple-500 bg-purple-500/10"
                            },
                            {
                                title: "Embedded Finance Solutions",
                                icon: Briefcase,
                                desc: "Integrate lending and financial services directly into your platform.",
                                color: "text-orange-500 bg-orange-500/10"
                            }
                        ].map((solution, index) => (
                            <motion.div
                                key={solution.title}
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: index * 0.1 }}
                                className="p-8 rounded-3xl bg-background border border-border hover:border-primary/50 transition-colors group"
                            >
                                <div className={`w-14 h-14 rounded-2xl ${solution.color} flex items-center justify-center mb-6 group-hover:scale-110 transition-transform`}>
                                    <solution.icon size={28} />
                                </div>
                                <h3 className="text-xl font-bold mb-3">{solution.title}</h3>
                                <p className="text-sm text-muted-foreground leading-relaxed">{solution.desc}</p>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Ideal For Section */}
            <section className="py-24 px-6 relative overflow-hidden">
                <div className="max-w-7xl mx-auto">
                    <div className="grid lg:grid-cols-2 gap-16 items-center">
                        <motion.div
                            initial={{ opacity: 0, x: -20 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            viewport={{ once: true }}
                        >
                            <h2 className="text-3xl md:text-5xl font-bold font-batman tracking-tight mb-6">
                                Ideal For
                            </h2>
                            <p className="text-lg text-muted-foreground mb-8">
                                Our solutions are specifically designed for modern, high-growth businesses.
                            </p>
                            <div className="space-y-4">
                                {[
                                    "Digital first businesses",
                                    "Growth stage MSMEs",
                                    "D2C brands and marketplaces"
                                ].map((item, i) => (
                                    <motion.div
                                        key={item}
                                        initial={{ opacity: 0, x: -20 }}
                                        whileInView={{ opacity: 1, x: 0 }}
                                        viewport={{ once: true }}
                                        transition={{ delay: i * 0.1 }}
                                        className="flex items-center gap-4 p-4 rounded-xl bg-secondary/50 border border-border"
                                    >
                                        <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                                            <CheckCircle2 size={20} />
                                        </div>
                                        <span className="font-medium text-lg">{item}</span>
                                    </motion.div>
                                ))}
                            </div>
                        </motion.div>
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9 }}
                            whileInView={{ opacity: 1, scale: 1 }}
                            viewport={{ once: true }}
                            className="relative h-[500px] rounded-3xl overflow-hidden bg-gradient-to-br from-primary/5 via-secondary to-background border border-border p-1"
                        >
                            <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?q=80&w=2070&auto=format&fit=crop')] bg-cover bg-center opacity-40 mix-blend-overlay" />
                            <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent" />
                            <div className="absolute bottom-10 left-10 right-10">
                                <div className="p-6 rounded-2xl bg-background/10 backdrop-blur-md border border-white/10">
                                    <div className="flex items-center gap-4 mb-4">
                                        <div className="w-12 h-12 rounded-full bg-blue-500/20 flex items-center justify-center text-blue-400">
                                            <TrendingUp size={24} />
                                        </div>
                                        <div>
                                            <p className="text-sm text-white/60">Success Story</p>
                                            <p className="font-bold text-white">200+ Businesses Funded</p>
                                        </div>
                                    </div>
                                    <p className="text-white/80 text-sm">"Richharbor provided the growth capital we needed to scale our inventory before the festive season."</p>
                                </div>
                            </div>
                        </motion.div>
                    </div>
                </div>
            </section>

            {/* Disclosure */}
            <section className="py-12 bg-neutral-900 text-neutral-400">
                <div className="container px-4 md:px-6 mx-auto">
                    <div className="max-w-4xl mx-auto border border-neutral-800 bg-neutral-950/50 p-8 rounded-2xl backdrop-blur-sm">
                        <h3 className="text-lg font-semibold text-neutral-200 mb-3 flex items-center gap-2">
                            Disclosure
                        </h3>
                        <p className="text-sm leading-relaxed">
                            Financing terms are determined by the partner institution based on business performance and risk assessment. Richharbor does not guarantee funding or pricing.
                        </p>
                    </div>
                </div>
            </section>
        </div>
    );
}
