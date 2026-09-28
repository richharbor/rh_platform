"use client";

import { ShieldCheck, FileText, Building2, Lock } from "lucide-react";

export default function TrustStrip() {
    const trustItems = [
        {
            icon: FileText,
            title: "Transparent Pricing",
        },
        {
            icon: ShieldCheck,
            title: "Secure Off-Market Execution",
        },
        {
            icon: Building2,
            title: "Institutional Network",
        },
        {
            icon: Lock,
            title: "End-to-End Support",
        },
    ];

    return (
        <section className="w-full md:w-[99.2vw] bg-[#0a0a0a] border-y border-white/5 py-10 relative overflow-hidden">
            {/* Subtle background glow */}
            <div className="absolute top-0 left-1/4 w-96 h-96 bg-primary/5 rounded-full blur-3xl pointer-events-none" />

            <div className="max-w-7xl mx-auto px-6 relative z-10">
                {/* Title */}
                <p className="text-center text-neutral-400 text-sm md:text-base mb-10 max-w-3xl mx-auto leading-relaxed">
                    Trusted by investors, founders, and financial partners across India for <span className="text-neutral-200 font-medium">transparent execution</span> and <span className="text-neutral-200 font-medium">confidential deal handling</span>.
                </p>

                {/* Grid */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-8">
                    {trustItems.map((item, index) => (
                        <div key={index} className="flex flex-col items-center text-center gap-3 group px-2">
                            <div className="p-3 rounded-full bg-white/5 text-neutral-400 border border-white/5 group-hover:text-primary group-hover:bg-primary/10 group-hover:border-primary/20 transition-all duration-300">
                                <item.icon className="w-6 h-6" />
                            </div>
                            <h3 className="text-neutral-300 font-medium text-sm md:text-base group-hover:text-white transition-colors duration-300">
                                {item.title}
                            </h3>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}
