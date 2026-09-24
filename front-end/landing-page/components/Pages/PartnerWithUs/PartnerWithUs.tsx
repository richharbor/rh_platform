"use client";

import { motion } from "framer-motion";
import { ArrowRight, Briefcase, Building2, CheckCircle2, TrendingUp, Users, Wallet, Zap, ShieldCheck, Home } from "lucide-react";
import Image from "next/image";
import circleIcon from '@/public/images/CircleIcon.png'
import { Button } from "@/components/ui/button";
import { PartnerForm } from "./PartnerForm";

export default function PartnerWithUs() {
    const scrollToForm = () => {
        const element = document.getElementById("partner-form");
        if (element) {
            element.scrollIntoView({ behavior: "smooth" });
        }
    };

    return (
        <div className="bg-background min-h-screen">
            {/* 1. Hero Section */}
            <section className="relative pt-32 pb-20 lg:pt-48 md:min-h-screen min-w-[99vw] lg:pb-32 px-6 overflow-hidden">
                <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1556761175-5973dc0f32e7?q=80&w=2000&auto=format&fit=crop')] bg-cover bg-center opacity-20 blur-sm scale-105 pointer-events-none" />
                <div className="absolute inset-0 bg-gradient-to-b from-background via-transparent to-background pointer-events-none" />

                <div className="max-w-7xl mx-auto text-center relative z-10">
                    <motion.h1
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5 }}
                        className="text-2xl md:text-3xl lg:text-5xl font-bold font-batman tracking-tight mb-6 bg-clip-text text-transparent bg-gradient-to-r from-foreground to-foreground/70"
                    >
                        Into Wealth Management? Build a Second <span className="text-primary">High-Income</span> Stream
                    </motion.h1>

                    <motion.p
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2, duration: 0.5 }}
                        className="text-lg md:text-xl text-muted-foreground max-w-3xl mx-auto mb-6 leading-relaxed"
                    >
                        Launch your own wealth business or scale your existing practice with Richharbor’s free WealthTech platform.
                    </motion.p>

                    <motion.p
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.3, duration: 0.5 }}
                        className="text-lg font-medium text-foreground mb-10"
                    >
                        You plan the business. Richharbor enables the rest.
                    </motion.p>
   
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.4, duration: 0.5 }}
                    >
                        <Button onClick={scrollToForm} size="lg" className="rounded-full px-8 h-14 text-lg font-semibold shadow-2xl hover:scale-105 transition-transform">
                            Become a Richharbor Partner <ArrowRight className="ml-2 w-5 h-5" />
                        </Button>
                    </motion.div>
                </div>
            </section>

            {/* 2. Who Is This For? */}
            <section className="py-20 bg-secondary/20">
                <div className="max-w-7xl mx-auto px-6">
                    <div className="text-center mb-16">
                        <h2 className="text-3xl md:text-5xl font-bold font-batman tracking-tight mb-4">Who Is This For?</h2>
                        <p className="text-muted-foreground">This opportunity is ideal for professionals looking to expand their service offerings.</p>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
                        {[
                            { icon: Users, label: "Wealth Managers" },
                            { icon: ShieldCheck, label: "Insurance Advisors" },
                            { icon: Briefcase, label: "Bankers & RMs" },
                            { icon: Building2, label: "CAs / CS / Tax" },
                            { icon: Home, label: "Real Estate Consultants" },
                            { icon: Zap, label: "Entrepreneurs" },
                        ].map((item, index) => (
                            <motion.div
                                key={item.label}
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: index * 0.1 }}
                                className="flex flex-col items-center p-6 bg-background rounded-2xl border border-border hover:border-primary/50 transition-colors text-center h-full"
                            >
                                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-primary mb-4">
                                    <item.icon className="w-6 h-6" />
                                </div>
                                <span className="font-medium text-sm md:text-base">{item.label}</span>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* 3. What You Can Offer (Products) */}
            <section className="py-24 px-6 relative overflow-hidden">
                <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-16 items-center">
                    <div>
                        <h2 className="text-3xl md:text-5xl font-bold font-batman tracking-tight mb-6">
                            Access High-Earning Financial Products
                        </h2>
                        <p className="text-lg text-muted-foreground mb-8">
                            One platform. Multiple products. Higher earnings. Offer your clients a comprehensive suite of financial solutions.
                        </p>

                        <div className="grid sm:grid-cols-2 gap-4">
                            {[
                                "Unlisted Shares", "Pre-IPO Opportunities",
                                "Private Equity & Structured Deals", "Insurance (Life, Health, General)",
                                "Loans (Home, Business, LAP)", "Real Estate Opportunities",
                                "Corporate Finance"
                            ].map((product, i) => (
                                <motion.div
                                    key={product}
                                    initial={{ opacity: 0, x: -20 }}
                                    whileInView={{ opacity: 1, x: 0 }}
                                    viewport={{ once: true }}
                                    transition={{ delay: i * 0.1 }}
                                    className="flex items-center gap-3"
                                >
                                    <CheckCircle2 className="w-5 h-5 text-primary shrink-0" />
                                    <span className="text-sm md:text-base font-medium">{product}</span>
                                </motion.div>
                            ))}
                        </div>
                    </div>
                    <div className="relative h-[400px] lg:h-[500px] rounded-3xl overflow-hidden shadow-2xl bg-neutral-900 border border-neutral-800">
                        {/* Abstract Product Visual */}
                        <div className="absolute inset-0 bg-gradient-to-tr from-primary/20 via-transparent to-blue-500/10" />
                        <div className="absolute bottom-0 left-0 right-0 p-8 bg-gradient-to-t from-black/80 to-transparent">
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 rounded-xl bg-white/10 backdrop-blur flex items-center justify-center text-white border border-white/20">
                                    <Wallet className="w-6 h-6" />
                                </div>
                                <div>
                                    <p className="text-white font-bold text-lg">Unified Portfolio</p>
                                    <p className="text-white/60 text-sm">Manage all assets in one place</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* 4. Why Partner with Richharbor */}
            <section className="py-24 text-white relative px-6">
                <motion.div
                    initial={{ rotate: -90, x: -200, opacity: 0, scale: 0.5 }}
                    whileInView={{ rotate: 0, x: 0, opacity: [0, 0.5, 1], scale: 1 }}
                    viewport={{ once: true, amount: 0.5 }}
                    transition={{
                        duration: 1,      // full rotation time
                        ease: "easeInOut",    // smooth continuous motion
                    }}
                    className="absolute -top-28 -left-20 max-sm:size-[18rem] max-sm:-top-10 max-sm:-left-15 size-[30rem]"
                >
                    <Image
                        src={circleIcon}
                        alt="Background"
                        className="object-cover"
                        priority
                    />
                </motion.div>
                <div className="absolute rounded-2xl inset-0 bg-transparent backdrop-blur-lg"></div>
                <div className="max-w-7xl mx-auto relative z-10">
                    <div className="text-center mb-16">
                        <h2 className="text-3xl md:text-5xl font-bold font-batman tracking-tight mb-4">Why Partner with Richharbor?</h2>
                        <div className="flex flex-wrap justify-center gap-4 mt-6">
                            {["Best Deals", "Faster Execution", "Higher Earnings"].map((tag) => (
                                <span key={tag} className="px-4 py-1.5 rounded-full bg-white/10 border border-white/10 text-sm font-medium">
                                    {tag}
                                </span>
                            ))}
                        </div>
                    </div>

                    <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
                        {[
                            { title: "Latest WealthTech Platform", desc: "Completely FREE for partners to manage business." },
                            { title: "Faster Execution", desc: "Dedicated support team to close deals faster." },
                            { title: "Transparent Payouts", desc: "Real-time tracking of commissions and earnings." },
                            { title: "No Inventory Risk", desc: "We manage the products, you manage the relationship." }
                        ].map((item, index) => (
                            <motion.div
                                key={item.title}
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: index * 0.1 }}
                                className="p-8 rounded-2xl bg-neutral-900 border border-neutral-800 hover:border-primary/50 transition-colors"
                            >
                                <h3 className="text-xl font-bold mb-3">{item.title}</h3>
                                <p className="text-neutral-400 leading-relaxed">{item.desc}</p>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* 5. How It Works */}
            <section className="py-24 px-6 bg-background">
                <div className="max-w-7xl mx-auto">
                    <h2 className="text-3xl md:text-5xl font-bold font-batman tracking-tight text-center mb-16">How It Works</h2>

                    <div className="grid md:grid-cols-3 gap-12 relative">
                        {/* Connecting Line (Desktop) */}
                        <div className="hidden md:block absolute top-12 left-[16%] right-[16%] h-0.5 bg-gradient-to-r from-transparent via-border to-transparent z-0" />

                        {[
                            { step: "01", title: "Partner Onboarding", desc: "Register and get access to Richharbor’s tech platform." },
                            { step: "02", title: "Share Opportunities", desc: "Offer premium products to your clients or share leads." },
                            { step: "03", title: "Earn & Scale", desc: "Track performance, payouts, and grow your wealth business." }
                        ].map((item, i) => (
                            <motion.div
                                key={item.step}
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: i * 0.2 }}
                                className="relative z-10 text-center bg-background"
                            >
                                <div className="w-24 h-24 mx-auto rounded-full bg-secondary border-4 border-background flex items-center justify-center text-2xl font-bold font-batman mb-6 shadow-xl">
                                    {item.step}
                                </div>
                                <h3 className="text-xl font-bold mb-3">{item.title}</h3>
                                <p className="text-muted-foreground">{item.desc}</p>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* 6. Partner Interest Form */}
            <div className="bg-secondary/30">
                <PartnerForm />
            </div>

            {/* 7. Trust & Compliance Footer */}
            <section className="py-12 bg-neutral-950 text-neutral-400 border-t border-neutral-900">
                <div className="max-w-7xl mx-auto px-6 text-center">
                    <div className="flex flex-wrap justify-center gap-8 mb-8 text-neutral-300 font-medium">
                        <span className="flex items-center gap-2"><ShieldCheck className="w-5 h-5 text-green-500" /> Secure & Confidential</span>
                        <span className="flex items-center gap-2"><Zap className="w-5 h-5 text-yellow-500" /> Tech-Driven Platform</span>
                        <span className="flex items-center gap-2"><Users className="w-5 h-5 text-blue-500" /> Partner-First Ecosystem</span>
                    </div>
                    <p className="text-xs text-neutral-600 max-w-2xl mx-auto">
                        Richharbor is a technology platform connecting users to financial products and opportunities. All investments are subject to market risks. Please review details before participation.
                    </p>
                </div>
            </section>
        </div>
    );
}