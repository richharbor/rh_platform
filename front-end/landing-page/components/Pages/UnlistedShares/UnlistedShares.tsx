"use client";

import { motion } from "framer-motion";
import { ShieldCheck, TrendingUp, FileCheck, Users, Search, MessageCircle, FileSignature, ArrowRightLeft, ArrowRight, CheckCircle2, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import HotSelling from "../Home/HotSelling/HotSelling";
import PromisingOnes from "../Home/PromissingOnes/PromissingOnes";
import Faq from "../Home/Faq/Faq";
import WhatAre from "@/components/Common/components/WhatAre";
import WhyInvest from "@/components/Common/components/WhyInvest";
import HowItWorks from "@/components/Common/components/HowItWorks";
import CommonCTA from "@/components/Common/components/CommonCTA";
import Disclosure from "@/components/Common/components/Disclosure";
import { useState } from "react";
import WhatsAppBanner from "../Home/WhatsAppBanner/WhatsAppBanner";
import ComparisonBlock from "./ComparisonBlock";
import UnlistedShareEnquiryDialog from "@/components/Common/components/UnlistedShareEnquiryDialog";

const benefits = [
    {
        title: "Verified Sellers",
        description: "Verified sellers and deal screening.",
        icon: ShieldCheck,
    },
    {
        title: "Transparent Pricing",
        description: "Transparent, market-linked pricing.",
        icon: TrendingUp,
    },
    {
        title: "Secure Transfer",
        description: "Secure off-market transfer to demat account.",
        icon: ArrowRightLeft,
    },
    // {
    //     title: "Execution Support",
    //     description: "End-to-end execution support.",
    //     icon: FileCheck,
    // },
    {
        title: "Private Access",
        description: "No public solicitation or mass distribution.",
        icon: Users,
    },
];

const steps = [
    {
        id: 1,
        title: "Select a Share & View Pricing",
        description: "Browse our curated list of unlisted companies and check transparent pricing.",
        icon: Search,
    },
    {
        id: 2,
        title: "Complete Secure Payment",
        description: "Execute the payment securely through our trusted banking channels.",
        icon: ShieldCheck,
    },
    {
        id: 3,
        title: "Shares Delivered to Your Demat",
        description: "Receive shares directly into your Demat account within the standard settlement cycle.",
        icon: ArrowRightLeft,
    },
];

const faq = [
    {
        question: "Are unlisted shares safe?",
        answer: "They carry higher risk due to limited liquidity and information. Due diligence is essential."
    },
    {
        question: "Can I sell unlisted shares easily?",
        answer: "Liquidity is limited. Exit depends on market demand or future listing."
    },
    {
        question: "Are shares transferred to my demat account?",
        answer: "Yes. All transfers are executed through off-market demat transactions."
    },
    {
        question: "Does Richharbor recommend specific companies?",
        answer: "No. Richharbor facilitates execution and access, not investment advice."
    }
];

const trustIndicators = ["Verified sellers", "Secure Demat transfers", "Transparent pricing"]
const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
}

export default function UnlistedShares() {

    const [open, setOpen] = useState(false)
    return (
        <div className="min-h-screen bg-background pt-20">
            {/* Hero Section */}
            <section className="relative md:min-h-[85vh] overflow-hidden py-20 lg:py-32">
                <div className="absolute inset-0 bg-[url('https://richharbor.s3.us-east-1.amazonaws.com/WhatsApp+Image+2026-01-20+at+11.54.34.jpeg')] bg-cover bg-center opacity-50 blur-sm scale-105 pointer-events-none" />
                <div className="absolute inset-0 bg-gradient-to-b from-background via-transparent to-background pointer-events-none" />
                <div className="container px-4 md:px-6 mx-auto relative z-10">
                    <div className="max-w-5xl mx-auto text-center">
                        <motion.h1
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="text-2xl md:text-5xl font-bold font-batman mb-6 bg-clip-text text-transparent bg-gradient-to-r from-foreground to-foreground/70"
                        >
                            Invest in Unlisted & Pre-IPO Shares With Confidence
                        </motion.h1>
                        <motion.p
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.1 }}
                            className="text-md sm:text-lg md:text-lg max-w-xl mx-auto text-muted-foreground mb-8 leading-relaxed"
                        >
                            Access exclusive private market opportunities with transparent pricing, secure execution, and expert support.
                        </motion.p>
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.2 }}
                            className="flex gap-4 justify-center max-md:flex-col"
                        >

                            <Button
                                size="lg"
                                className="rounded-full h-12 px-8 text-lg shadow-lg hover:shadow-xl transition-all"
                                onClick={(e) => {
                                    e.preventDefault();
                                    const element = document.getElementById('hot-ipo');
                                    element?.scrollIntoView({ behavior: 'smooth' });
                                }}
                            >
                                View Live Opportunities
                            </Button>

                            <Link href="tel:+919211265558">
                                <Button
                                    variant={'outline'}
                                    size="lg"
                                    className="rounded-full h-12 px-8 text-lg shadow-lg hover:shadow-xl transition-all"
                                >
                                    Talk to an Expert
                                </Button>
                            </Link>

                        </motion.div>

                        {/* Trust indicators */}
                        <motion.div variants={itemVariants} className="mt-12 flex flex-wrap justify-center gap-x-8 gap-y-3">
                            {trustIndicators.map((benefit, index) => (
                                <motion.div
                                    key={benefit}
                                    initial={{ opacity: 0, x: -10 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: 0.8 + index * 0.1 }}
                                    className="flex items-center gap-2 text-sm text-muted-foreground"
                                >
                                    <CheckCircle2 className="h-5 w-5 text-[#4AA651]" />
                                    <span>{benefit}</span>
                                </motion.div>
                            ))}
                        </motion.div>
                    </div>
                </div>
            </section>
            <WhatsAppBanner />

            {/* What Are Unlisted Shares */}
            <WhatAre
                title="What Are Unlisted Shares?"
                description="Richharbor is a trusted unlisted shares platform that simplifies access to unlisted shares India. We provide a transparent unlisted shares price list and facilitate secure transactions. Unlisted shares are equity shares of companies not listed on stock exchanges such as NSE or BSE. These may include fast-growing private companies, mature businesses, or companies preparing for an IPO."
            />

            {/* Why Invest */}
            <WhyInvest
                title="Why Investors Consider Unlisted Shares"
                description="Unlisted investing is suitable for investors with a long-term perspective and higher risk tolerance looking to capture value early in a company's lifecycle."
                reasons={[
                    "Early Access to Growth — Invest before companies go public",
                    "Portfolio Diversification — Beyond traditional equities",
                    "Potential Richer Returns — Early entry valuation capture",
                    "Low Daily Volatility — Less short-term fluctuation InCred Money"

                ]}
            />

            <div className="container max-w-7xl mx-auto px-4 md:px-6 -mt-10">
                <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-xl p-4 flex gap-3 items-start">
                    <div className="mt-1">
                        <AlertTriangle className="h-5 w-5 text-yellow-500" />
                    </div>
                    <div>
                        <h4 className="text-sm font-semibold text-yellow-500 mb-1">Risk Disclosure</h4>
                        <p className="text-sm text-muted-foreground leading-relaxed">
                            Unlisted shares are illiquid and may have a lock-in period after listing (typically 6 months). Investment in unlisted equities carries high risk, including potential loss of capital.
                        </p>
                    </div>
                </div>
            </div>

            {/* Key Benefits */}
            <section className="py-20 md:w-[99vw] bg-secondary/5">
                <div className="container max-w-7xl mx-auto px-4 md:px-6">
                    <div className="text-center mb-16">
                        <h2 className="text-2xl md:text-4xl font-bold font-batman mb-4">Why Invest Through Richharbor</h2>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 justify-center">
                        {benefits.map((benefit, idx) => (
                            <motion.div
                                key={idx}
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                transition={{ delay: idx * 0.1 }}
                                viewport={{ once: true }}
                                className="bg-background border border-border/50 p-6 rounded-2xl hover:border-primary/50 transition-colors shadow-sm hover:shadow-md h-full"
                            >
                                <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center mb-4 text-primary">
                                    <benefit.icon className="w-6 h-6" />
                                </div>
                                <h3 className="text-xl font-semibold mb-2">{benefit.title}</h3>
                                <p className="text-muted-foreground text-sm leading-relaxed">
                                    {benefit.description}
                                </p>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* How It Works */}
            <HowItWorks
                title="How the Unlisted Share Process Works"
                description="Simple, transparent, and secure process to get started."
                steps={steps}
            />


            <HotSelling />


            {/* <PromisingOnes /> */}

            <ComparisonBlock />

            {/* Taxation & Regulatory Disclosure */}
            <Disclosure
                title="Trust & Legal Disclaimers"
                description="Unlisted share transactions are not executed on stock exchanges. Past performance is not indicative of future results. Investing carries risk."
            />


            {/* FAQ */}
            <Faq items={faq} />

            <CommonCTA
                title={<span>Interested in <span className="text-primary">Unlisted Shares?</span></span>}
                description="Submit your requirement for a confidential review and pricing discussion."
                buttonText="Submit Requirement"
                buttonLink="#contact"
                onClick={() => setOpen(true)}
            />


            <UnlistedShareEnquiryDialog open={open} onOpenChange={setOpen} />
        </div>
    );
}
