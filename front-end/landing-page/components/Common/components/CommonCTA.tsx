"use client";

import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import Link from "next/link";
import { motion } from "framer-motion";
import { ReactNode } from "react";

interface CommonCTAProps {
    title: ReactNode | string;
    description: string;
    buttonText: string;
    buttonLink: string;
    onClick?: () => void;
}

export default function CommonCTA({ title, description, buttonText, buttonLink, onClick }: CommonCTAProps) {
    return (
        <section className="py-24 md:w-[99.2vw] md:mx-auto bg-[#0a0a0a] relative overflow-hidden border-t border-white/5">
            {/* Background Gradients */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[400px] bg-primary/10 rounded-full blur-[100px] pointer-events-none" />
            <div className="absolute inset-0 bg-[url('/grid.svg')] bg-center [mask-image:linear-gradient(180deg,white,rgba(255,255,255,0))] opacity-20 pointer-events-none" />

            <div className="container max-w-4xl mx-auto px-6 relative z-10 text-center">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5 }}
                >
                    <h2 className="text-2xl md:text-5xl lg:text-6xl font-bold font-batman tracking-tight text-white mb-6">
                        {title}
                    </h2>
                    <p className="text-lg md:text-xl text-neutral-400 mb-10 max-w-2xl mx-auto leading-relaxed">
                        {description}
                    </p>
                    {onClick ? (
                        <Button
                            onClick={onClick}
                            size="lg"
                            className="rounded-full h-14 px-10 text-lg font-semibold shadow-xl shadow-primary/20 hover:shadow-primary/40 transition-all duration-300 pointer-events-auto cursor-pointer"
                        >
                            {buttonText}
                            <ArrowRight className="ml-2 w-5 h-5" />
                        </Button>
                    ) : (
                        <Link href={buttonLink}>
                            <Button size="lg" className="rounded-full h-14 px-10 text-lg font-semibold shadow-xl shadow-primary/20 hover:shadow-primary/40 transition-all duration-300">
                                {buttonText}
                                <ArrowRight className="ml-2 w-5 h-5" />
                            </Button>
                        </Link>
                    )}
                </motion.div>
            </div>
        </section>
    );
}
