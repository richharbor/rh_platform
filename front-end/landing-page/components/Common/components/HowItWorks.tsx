"use client";

import { ArrowRightLeft, FileSignature, MessageCircle, Search } from "lucide-react";
import { motion } from 'framer-motion';

const defaultSteps = [
    {
        id: 1,
        title: "Requirement Submission",
        description: "Share your interest in a specific company or category.",
        icon: Search,
    },
    {
        id: 2,
        title: "Price Discovery & Validation",
        description: "Pricing is evaluated based on demand, company fundamentals, and transaction feasibility.",
        icon: MessageCircle,
    },
    {
        id: 3,
        title: "Documentation & Transfer",
        description: "Shares are transferred via off-market transaction with proper documentation and demat credit.",
        icon: FileSignature,
    },
    {
        id: 4,
        title: "Confirmation & Closure",
        description: "Transaction completion is confirmed once shares reflect in your demat account.",
        icon: ArrowRightLeft,
    },
];

interface Step {
    id: number;
    title: string;
    description: string;
    icon: any;
}

interface HowItWorksProps {
    title?: string;
    description?: string;
    steps?: Step[];
}

export default function HowItWorks({
    title = "How the Unlisted Share Process Works",
    description = "Simple, transparent, and secure process to get started.",
    steps = defaultSteps
}: HowItWorksProps) {
    return (
        <section className="py-20">
            <div className="container max-w-7xl px-4 md:px-6 mx-auto">
                <div className="text-center mb-16">
                    <h2 className="text-2xl md:text-4xl font-bold font-batman mb-4">{title}</h2>
                    <p className="text-muted-foreground max-w-2xl mx-auto">
                        {description}
                    </p>
                </div>

                <div className={`grid grid-cols-1 md:grid-cols-2 ${steps.length === 1 ? 'lg:grid-cols-1' : steps.length === 2 ? 'lg:grid-cols-2' : steps.length === 3 ? 'lg:grid-cols-3' : 'lg:grid-cols-4'} gap-8 relative`}>
                    {/* Connecting Line (Desktop) */}
                    {/* <div className="hidden lg:block absolute top-1/2 left-0 w-full h-0.5 bg-border -z-10 -mt-10" /> */}

                    {steps.map((step, idx) => (
                        <motion.div
                            key={idx}
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            transition={{ delay: idx * 0.1 }}
                            viewport={{ once: true }}
                            className="relative bg-background p-6 rounded-2xl border border-border shadow-sm text-center"
                        >
                            <div className="w-16 h-16 mx-auto bg-background border-4 border-secondary rounded-full flex items-center justify-center mb-6 text-primary relative z-10 shadow-sm">
                                <step.icon className="w-7 h-7" />
                                <div className="absolute -top-2 -right-2 w-8 h-8 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-sm font-bold shadow-md">
                                    {step.id}
                                </div>
                            </div>
                            <h3 className="text-xl font-semibold mb-2">{step.title}</h3>
                            <p className="text-muted-foreground text-sm">
                                {step.description}
                            </p>
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    )
}