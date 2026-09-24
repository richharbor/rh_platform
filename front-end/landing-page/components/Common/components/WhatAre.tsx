"use client";

import { motion } from "framer-motion";

interface WhatAreProps {
    title: string;
    description: string;
    badge?: string;
}

export default function WhatAre({ title, description, badge = "OVERVIEW" }: WhatAreProps) {
    return (
        <section className="py-20 bg-background border-b border-border/40">
            <div className="container max-w-5xl mx-auto px-4 md:px-6 text-center">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5 }}
                >
                    <span className="inline-block px-4 py-1.5 rounded-full bg-primary/10 text-primary text-sm font-bold tracking-wider mb-6">
                        {badge}
                    </span>
                    <h2 className="text-2xl md:text-5xl md:font-bold font-batman mb-6 text-foreground">
                        {title}
                    </h2>
                    <p className="text-muted-foreground text-lg sm:text-xl leading-relaxed max-w-4xl mx-auto">
                        {description}
                    </p>
                </motion.div>
            </div>
        </section>
    );
}
