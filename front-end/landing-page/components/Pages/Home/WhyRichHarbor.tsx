"use client";

import { CheckCircle2, ShieldCheck, Lock, Award, Briefcase, Zap } from "lucide-react";

export default function WhyRichHarbor() {
    const features = [
        "No public solicitation or mass distribution",
        "Confidential, mandate-based engagement",
        "Transparent pricing and documentation",
        "Institutional-grade execution processes",
        "Partner-friendly payout ecosystem"
    ];

    return (
        <section className=" py-2 overflow-hidden relative">
            {/* Background elements */}
            <div className="absolute top-0 right-0 w-full h-full bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-yellow-500/5 via-transparent to-transparent pointer-events-none" />

            <div className="max-w-7xl mx-auto px-6 grid lg:grid-cols-2 gap-16 items-center relative z-10">

                {/* Left Content */}
                <div>
                    <h2 className="text-sm font-bold text-primary tracking-widest uppercase mb-3">Why RichHarbor</h2>
                    <h3 className="text-3xl md:text-5xl font-bold font-batman tracking-tight text-white mb-8">
                        Why Clients Choose <span className="text-primary">Richharbor</span>
                    </h3>

                    <div className="space-y-6">
                        {features.map((feature, index) => (
                            <div key={index} className="flex items-start gap-4 group">
                                <div className="mt-1 w-6 h-6 rounded-full bg-yellow-500/10 flex items-center justify-center shrink-0 border border-yellow-500/20 group-hover:border-yellow-500/50 transition-colors">
                                    <CheckCircle2 className="w-4 h-4 text-yellow-500" />
                                </div>
                                <p className="text-lg text-neutral-300 group-hover:text-white transition-colors cursor-default">
                                    {feature}
                                </p>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Right Visual - Abstract Secure System */}
                <div className="relative h-[500px] w-full bg-neutral-900/50 rounded-3xl border border-neutral-800 p-8 flex items-center justify-center overflow-hidden group">
                    {/* Glowing Orbs */}
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-primary/10 rounded-full blur-3xl animate-pulse" />

                    {/* Central Hub */}
                    <div className="relative z-10 w-32 h-32 bg-neutral-950 rounded-2xl border border-neutral-800 flex items-center justify-center shadow-2xl">
                        <ShieldCheck className="w-12 h-12 text-primary" />
                    </div>

                    {/* Orbiting Elements */}
                    <div className="absolute inset-0 animate-[spin_10s_linear_infinite]">
                        <div className="absolute top-[20%] left-[50%] -translate-x-1/2 w-12 h-12 bg-neutral-900 border border-neutral-700 rounded-xl flex items-center justify-center shadow-lg -rotate-12">
                            <Lock className="w-5 h-5 text-neutral-400" />
                        </div>
                        <div className="absolute bottom-[20%] right-[30%] w-12 h-12 bg-neutral-900 border border-neutral-700 rounded-xl flex items-center justify-center shadow-lg rotate-12">
                            <Award className="w-5 h-5 text-neutral-400" />
                        </div>
                        <div className="absolute bottom-[20%] left-[30%] w-12 h-12 bg-neutral-900 border border-neutral-700 rounded-xl flex items-center justify-center shadow-lg -rotate-6">
                            <Briefcase className="w-5 h-5 text-neutral-400" />
                        </div>
                    </div>

                    {/* Connecting Lines */}
                    <svg className="absolute inset-0 w-full h-full pointer-events-none opacity-20" xmlns="http://www.w3.org/2000/svg">
                        <circle cx="50%" cy="50%" r="30%" fill="none" stroke="currentColor" strokeWidth="1" className="text-neutral-500" strokeDasharray="4 4" />
                        <circle cx="50%" cy="50%" r="45%" fill="none" stroke="currentColor" strokeWidth="1" className="text-neutral-700" />
                    </svg>

                    {/* <div className="absolute bottom-6 left-0 right-0 text-center">
                        <p className="text-xs font-mono text-neutral-500 tracking-widest uppercase">Institutional Grade Execution Engine</p>
                    </div> */}
                </div>
            </div>
        </section>
    );
}
