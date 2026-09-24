"use client";

import { TrendingUp, Banknote, Shield, Briefcase, ArrowRight } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function CoreOfferings() {
    const offerings = [
        {
            icon: TrendingUp,
            title: "Unlisted Shares & Pre-IPO",
            description: "Access verified unlisted shares and pre-IPO opportunities with transparent pricing and secure off-market transfers.",
            cta: "Explore Unlisted Shares",
            href: "/unlisted-shares"
        },
        {
            icon: Banknote,
            title: "Loans & Structured Credit",
            description: "Retail, SME, and corporate loans including working capital, project finance, RBF, and structured funding solutions.",
            cta: "Apply for Loans",
            href: "/loans"
        },
        {
            icon: Shield,
            title: "Insurance Solutions",
            description: "Life, health, motor, and business insurance solutions curated to protect individuals and enterprises.",
            cta: "View Insurance Solutions",
            href: "/insurance"
        },
        {
            icon: Briefcase,
            title: "Private Markets & Capital Advisory",
            description: "Mandate-led capital introduction for growth-stage and pre-IPO companies.",
            cta: "Private Markets",
            href: "/private-markets"
        }
    ];

    return (
        <section id="products" className="py-24 relative overflow-hidden">
            {/* Background decoration */}
            <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-primary/5 rounded-full blur-[100px] pointer-events-none opacity-50" />

            <div className="max-w-7xl mx-auto px-6 relative z-10">
                <div className="text-center mb-16">
                    <h2 className="text-3xl md:text-5xl font-bold font-batman tracking-tight mb-4 text-white">
                        One Platform. Multiple Financial Solutions.
                    </h2>
                    <p className="text-neutral-400 text-lg max-w-2xl mx-auto">
                        Comprehensive wealth management and capital opportunities for every stage of growth.
                    </p>
                </div>

                <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {offerings.map((item, index) => (
                        <div
                            key={index}
                            className="bg-card rounded-2xl p-8 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 group flex flex-col items-start h-full border border-neutral-800 hover:border-primary/50"
                        >
                            <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center text-primary mb-6 group-hover:scale-110 transition-transform duration-300 border border-neutral-700">
                                <item.icon className="w-6 h-6 stroke-[1.5]" />
                            </div>

                            <h3 className="text-xl font-bold text-white mb-3 font-batman tracking-tight">
                                {item.title}
                            </h3>

                            <p className="text-neutral-400 text-sm leading-relaxed mb-8 flex-grow">
                                {item.description}
                            </p>

                            <Link href={item.href} className="flex items-center text-white/90 font-semibold text-sm group/btn mt-auto hover:text-primary transition-colors">
                                <span className="group-hover/btn:mr-2 transition-all duration-300">{item.cta}</span>
                                <ArrowRight className="w-4 h-4 ml-1 opacity-0 group-hover/btn:opacity-100 transition-opacity duration-300" />
                            </Link>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}
