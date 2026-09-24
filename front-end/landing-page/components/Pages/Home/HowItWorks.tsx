"use client";

import { motion } from "framer-motion";
import { Search, FileSearch, ShieldCheck } from "lucide-react";

export default function HowItWorks() {
    const steps = [
        {
            id: 1,
            title: "Discover & Define",
            description: "Share your investment, funding, or insurance requirement confidentially.",
            icon: Search,
        },
        {
            id: 2,
            title: "Evaluate & Structure",
            description: "We assess suitability, pricing, and execution feasibility aligned with regulatory standards.",
            icon: FileSearch,
        },
        {
            id: 3,
            title: "Execute Securely",
            description: "Transactions are completed through compliant, off-market or institutional channels with full documentation.",
            icon: ShieldCheck,
        },
    ];

    return (
        <section className="py-24 relative overflow-hidden">
            {/* Background decoration matching TrustStrip/Home */}
            {/* <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[500px] bg-primary/5 rounded-full blur-3xl pointer-events-none" /> */}

            <div className="max-w-7xl mx-auto px-6 relative z-10">
                <div className="text-center mb-20">
                    <h2 className="text-sm font-bold text-primary tracking-widest uppercase mb-3">How RichHarbor Works</h2>
                    <h3 className="text-3xl md:text-5xl font-bold font-batman tracking-tight text-white">
                        A Structured, Process-Driven Execution Model
                    </h3>
                </div>

                <div className="relative">
                    {/* Connecting Line (Desktop) */}
                    <div className="hidden md:block absolute top-12 left-[10%] right-[10%] h-0.5 bg-white/10">
                        <motion.div
                            initial={{ width: "0%" }}
                            whileInView={{ width: "100%" }}
                            viewport={{ once: true }}
                            transition={{ duration: 1.5, ease: "easeInOut" }}
                            className="h-full bg-primary"
                        />
                    </div>

                    <div className="grid md:grid-cols-3 gap-12 relative">
                        {steps.map((step, index) => (
                            <motion.div
                                key={step.id}
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: index * 0.2 }}
                                className="relative flex flex-col items-center text-center group"
                            >
                                {/* Icon Circle */}
                                <div className="w-24 h-24 rounded-full bg-[#0a0a0a] border-4 border-neutral-800 flex items-center justify-center relative z-10 mb-8 group-hover:border-primary/50 group-hover:bg-neutral-900 transition-all duration-300 shadow-2xl">
                                    <div className="absolute -top-3 -right-3 w-8 h-8 rounded-full bg-white text-black text-sm font-bold flex items-center justify-center border-2 border-[#0a0a0a]">
                                        {step.id}
                                    </div>
                                    <step.icon className="w-10 h-10 text-neutral-400 group-hover:text-primary transition-colors duration-300" strokeWidth={1.5} />
                                </div>

                                <h4 className="text-xl font-bold mb-3 text-neutral-200 group-hover:text-white transition-colors">{step.title}</h4>
                                <p className="text-neutral-400 leading-relaxed max-w-xs mx-auto">
                                    {step.description}
                                </p>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </div>
        </section>
    );
}
