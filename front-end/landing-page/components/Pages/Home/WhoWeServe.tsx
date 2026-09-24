"use client";

import { User, Building, Briefcase, Users, Landmark } from "lucide-react";

export default function WhoWeServe() {
    const segments = [
        {
            icon: User,
            title: "Individual Investors & HNIs",
            description: "Exclusive access to high-yield assets."
        },
        {
            icon: Building,
            title: "Family Offices",
            description: "Tailored wealth structuring and deal flow."
        },
        {
            icon: Briefcase,
            title: "Founders & Corporates",
            description: "Capital raising and strategic advisory."
        },
        {
            icon: Users,
            title: "Bankers & Wealth Advisors",
            description: "Partner with us to monetize your network."
        },
        {
            icon: Landmark,
            title: "Institutional Investors & Funds",
            description: "Direct access to large ticket block deals."
        }
    ];

    return (
        <section className="py-12 md:py-24 relative overflow-hidden">
            <div className="max-w-7xl mx-auto px-4 md:px-6 relative z-10">
                <div className="text-center mb-10 md:mb-16">
                    <h2 className="text-xs md:text-sm font-bold text-primary tracking-widest uppercase mb-2 md:mb-3">Who We Serve</h2>
                    <h3 className="text-2xl md:text-5xl font-bold font-batman tracking-tight text-white mb-2 md:mb-4">
                        Designed for Every Financial Stakeholder
                    </h3>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 md:gap-6">
                    {segments.map((segment, index) => (
                        <div
                            key={index}
                            className={`group relative p-6 rounded-2xl bg-card border border-neutral-800 hover:border-primary/50 transition-colors duration-300 h-auto md:h-[240px] flex flex-col items-center justify-center overflow-hidden ${
                                // Make the last item span full width on mobile if odd count, or span 2 cols on tablet to center
                                index === 4 ? "sm:col-span-2 lg:col-span-1" : "col-span-1"
                                }`}
                        >
                            <div className="flex flex-col items-center transition-transform duration-300 md:group-hover:-translate-y-6">
                                <div className="w-12 h-12 md:w-16 md:h-16 rounded-xl bg-primary/10 flex items-center justify-center text-neutral-400 mb-3 md:mb-4 group-hover:text-primary group-hover:bg-primary/10 transition-colors duration-300">
                                    <segment.icon className="w-6 h-6 md:w-8 md:h-8 stroke-[1.5]" />
                                </div>

                                <h4 className="text-sm md:text-lg font-bold text-center text-white leading-tight mb-2">
                                    {segment.title}
                                </h4>
                            </div>

                            <div className="md:absolute md:bottom-8 px-4 md:opacity-0 md:translate-y-4 md:group-hover:opacity-100 md:group-hover:translate-y-0 transition-all duration-300 delay-75">
                                <p className="text-xs md:text-sm text-neutral-400 text-center leading-relaxed">
                                    {segment.description}
                                </p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}
