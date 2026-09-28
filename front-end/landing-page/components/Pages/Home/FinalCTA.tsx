"use client";

import { Button } from "@/components/ui/button";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { useQueryWidgetStore } from "@/store/queryWidgetStore";

export default function FinalCTA() {
    const { open } = useQueryWidgetStore();
    return (
        <section className="py-24 bg-[#0a0a0a] relative overflow-hidden border-t border-white/5">
            {/* Background Gradients */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[500px] bg-primary/10 rounded-full blur-[100px] pointer-events-none" />
            <div className="absolute inset-0 bg-[url('/grid.svg')] bg-center [mask-image:linear-gradient(180deg,white,rgba(255,255,255,0))] opacity-20 pointer-events-none" />

            <div className="max-w-4xl mx-auto px-6 relative z-10 text-center">
                <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold font-batman tracking-tight text-white mb-6">
                    Ready to Get <span className="text-primary">Started?</span>
                </h2>

                <p className="text-lg md:text-xl text-neutral-400 mb-12 max-w-2xl mx-auto leading-relaxed">
                    Submit your requirement for a confidential discussion or explore opportunities across our platform.
                </p>

                <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                    <Link href="#financial-solutions">
                        <Button onClick={open} size="lg" className="rounded-full h-14 px-8 text-base font-semibold w-full sm:w-auto">
                            Submit Your Requirement
                            <ArrowRight className="ml-2 w-4 h-4" />
                        </Button>
                    </Link>

                    <Link href="/partner-with-us">
                        <Button size="lg" variant="outline" className="rounded-full h-14 px-8 text-base font-semibold bg-transparent border-neutral-700 text-white hover:bg-white/5 hover:border-white/20 w-full sm:w-auto">
                            Partner With Richharbor
                        </Button>
                    </Link>
                </div>
            </div>
        </section>
    );
}
