"use client";

import { motion } from "framer-motion";
import { ShieldCheck, TrendingUp, Handshake, Users, Lock, PieChart, ArrowRight, CheckCircle, XCircle, FileText, Globe, Building2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { cn } from "@/lib/utils";
import WhatAre from "@/components/Common/components/WhatAre";
import Disclosure from "@/components/Common/components/Disclosure";
import Faq from "../Home/Faq/Faq";
import CommonCTA from "@/components/Common/components/CommonCTA";
import { useState } from "react";
import { z } from "zod";
import { convertToHtmlForm } from "@/helpers/emailHelper";
import { sendEmail } from "@/services/emailServices";
import { CircleCheckBig, CircleX } from "lucide-react";

import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";

const formSchema = z.object({
    companyName: z.string().min(2, "Company Name is required"),
    promoterName: z.string().min(2, "Promoter Name is required"),
    email: z.string().email("Invalid email address"),
    phone: z.string().regex(/^[0-9]{10}$/, "Phone number must be 10 digits"),
    capitalRequirement: z.string().min(1, "Capital Requirement is required"),
    stage: z.string().min(1, "Stage is required"),
    businessOverview: z.string().min(10, "Business Overview must be at least 10 characters"),
});

type FormData = z.infer<typeof formSchema>;

const suitability = [
    {
        title: "Appropriate for Companies That:",
        icon: CheckCircle,
        iconColor: "text-emerald-500",
        items: [
            "Seek ₹50–100+ crore of growth or pre-IPO capital",
            "Demonstrate strong operating fundamentals",
            "Maintain professional governance and audit readiness",
            "Are open to institutional partnerships"
        ]
    },
    {
        title: "Not Intended For:",
        icon: XCircle,
        iconColor: "text-red-500",
        items: [
            "Seed or early-stage ventures",
            "Retail fundraising or public solicitation",
            "Crowdfunding or mass distribution initiatives"
        ]
    }
];

const process = [
    {
        id: 1,
        title: "Mandate & Readiness Review",
        description: "Non-exclusive mandate and preliminary evaluation.",
        icon: FileText
    },
    {
        id: 2,
        title: "Confidential Positioning",
        description: "Preparation of a confidential teaser without public disclosure.",
        icon: Lock
    },
    {
        id: 3,
        title: "Targeted Institutional Outreach",
        description: "Selective sharing with relevant investors.",
        icon: Globe
    },
    {
        id: 4,
        title: "Transaction Coordination",
        description: "Support through diligence and execution.",
        icon: Handshake
    }
];

const faq = [
    {
        question: "Does Richharbor raise capital directly?",
        answer: "No. Richharbor facilitates introductions only."
    },
    {
        question: "Are outcomes guaranteed?",
        answer: "No. Capital raising outcomes depend on investor discretion."
    },
    {
        question: "Is information kept confidential?",
        answer: "Yes. All discussions are strictly confidential."
    }
];

const network = [
    "Category II AIFs",
    "Growth and pre-IPO focused PE funds",
    "Family offices and strategic investors"
];

export default function PrivateMarkets() {
    const [formData, setFormData] = useState<FormData>({
        companyName: "",
        promoterName: "",
        email: "",
        phone: "",
        capitalRequirement: "",
        stage: "Growth",
        businessOverview: "",
    });
    const [loading, setLoading] = useState(false);
    const [succOpen, setSuccOpen] = useState(false);
    const [errOpen, setErrOpen] = useState(false);
    const [error, setError] = useState("");

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError("");

        const result = formSchema.safeParse(formData);
        if (!result.success) {
            setError(result.error.issues[0].message);
            setLoading(false);
            return;
        }

        const emailHTML = convertToHtmlForm(formData);
        const email = {
            to: "frontend@rhinontech.com",
            subject: `Private Markets Enquiry - ${formData.companyName}`,
            content: emailHTML,
            isHtml: true,
        };

        try {
            const response = await sendEmail(email);
            const whatsappUrl = `https://wa.me/919211265558?text=Hello!%20I%20have%20a%20query%20about%20private%20markets.`;
            window.open(whatsappUrl, "_blank");
            if (response.status === 200) {
                setSuccOpen(true);
                setFormData({
                    companyName: "",
                    promoterName: "",
                    email: "",
                    phone: "",
                    capitalRequirement: "",
                    stage: "Growth",
                    businessOverview: "",
                });
            } else {
                setErrOpen(true);
            }
        } catch (error) {
            console.error("Email send error:", error);
            setErrOpen(true);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-background pt-20">
            {/* Hero Section */}
            <section className="relative overflow-hidden w-[99vw] py-20 lg:py-32">
                <div className="absolute inset-0 bg-[url('https://richharbor.s3.us-east-1.amazonaws.com/WhatsApp+Image+2026-01-20+at+11.56.39.jpeg')] bg-cover bg-center opacity-20 blur-sm scale-105 pointer-events-none" />
                <div className="absolute inset-0 bg-gradient-to-b from-background via-transparent to-background pointer-events-none" />
                <div className="container px-4 md:px-6 mx-auto relative z-10">
                    <div className="max-w-4xl mx-auto text-center">
                        <motion.h1
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="text-3xl md:text-5xl font-bold font-batman mb-6 bg-clip-text text-transparent bg-gradient-to-r from-foreground to-foreground/70"
                        >
                            Private Markets & Institutional Capital Solutions
                        </motion.h1>
                        <motion.p
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.2 }}
                            className="text-md md:text-lg text-muted-foreground mb-8 leading-relaxed max-w-3xl mx-auto"
                        >
                            Confidential, mandate-led capital introduction for growth-stage and pre-IPO companies seeking institutional investment from private equity India, venture capital India, and growth equity firms.
                        </motion.p>
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.3 }}
                        >
                            <Button
                                size="lg"
                                className="rounded-full h-12 px-8 text-lg shadow-lg hover:shadow-xl transition-all"
                                onClick={(e) => {
                                    e.preventDefault();
                                    document.getElementById('contact')?.scrollIntoView({ behavior: 'smooth' });
                                }}
                            >
                                Request a Confidential Discussion <ArrowRight className="ml-2 w-5 h-5" />
                            </Button>
                        </motion.div>
                    </div>
                </div>
            </section>

            <WhatAre
                title="Connecting Businesses with Institutional Capital"
                description="Richharbor partners with select growth-stage and pre-IPO companies to facilitate capital introductions to institutional investors, including Alternative Investment Funds (AIFs), private equity firms, family offices, and strategic capital providers."
            />

            {/* Suitability Criteria */}
            <section className="py-20 bg-secondary/5">
                <div className="container px-4 md:px-6 mx-auto">
                    <div className="text-center mb-16">
                        <h2 className="text-3xl md:text-4xl font-bold font-batman mb-4">Who This Is For</h2>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-5xl mx-auto">
                        {suitability.map((section, idx) => (
                            <motion.div
                                key={idx}
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                transition={{ delay: idx * 0.1 }}
                                viewport={{ once: true }}
                                className="bg-background border border-border p-8 rounded-2xl shadow-sm"
                            >
                                <div className="flex items-center gap-3 mb-6">
                                    <section.icon className={cn("w-6 h-6", section.iconColor)} />
                                    <h3 className="text-2xl font-bold">{section.title}</h3>
                                </div>
                                <ul className="space-y-4">
                                    {section.items.map((item, i) => (
                                        <li key={i} className="flex items-start gap-3">
                                            <div className={cn("mt-1.5 w-1.5 h-1.5 rounded-full shrink-0 bg-foreground/40")} />
                                            <span className="text-muted-foreground">{item}</span>
                                        </li>
                                    ))}
                                </ul>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Our Mandate */}
            <section className="py-20">
                <div className="container px-4 md:px-6 mx-auto">
                    <div className="max-w-4xl mx-auto bg-gradient-to-br from-primary/10 via-background to-secondary/10 border border-primary/20 p-8 md:p-12 rounded-3xl text-center">
                        <h2 className="text-3xl font-bold font-batman mb-6">Our Mandate & Scope</h2>
                        <div className="space-y-6 text-lg text-muted-foreground leading-relaxed">
                            <p>
                                Richharbor operates as a capital introduction and deal sourcing partner.
                                <br className="hidden md:block" />
                                We do not act as an investment advisor, fund manager, or portfolio manager.
                            </p>

                            <div className="pt-2">
                                <p className="font-medium text-foreground mb-4">Our role includes:</p>
                                <ul className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4 max-w-2xl mx-auto text-base text-left">
                                    {[
                                        "Investment readiness evaluation",
                                        "Opportunity positioning",
                                        "Targeted institutional introductions",
                                        "Transaction coordination support"
                                    ].map((item, i) => (
                                        <li key={i} className="flex items-center gap-3">
                                            <div className="w-1.5 h-1.5 rounded-full bg-primary shrink-0" />
                                            <span>{item}</span>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Engagement Process */}
            <section className="py-20 bg-secondary/5">
                <div className="container px-4 md:px-6 mx-auto">
                    <div className="text-center mb-16">
                        <h2 className="text-3xl md:text-4xl font-bold font-batman mb-4">How the Engagement Works</h2>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                        {process.map((step, idx) => (
                            <motion.div
                                key={idx}
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                transition={{ delay: idx * 0.1 }}
                                viewport={{ once: true }}
                                className="relative bg-background p-6 rounded-2xl border border-border shadow-sm text-center group hover:border-primary/50 transition-colors"
                            >
                                <div className="w-16 h-16 mx-auto bg-secondary/20 rounded-full flex items-center justify-center mb-6 text-foreground group-hover:bg-primary/10 group-hover:text-primary transition-colors">
                                    <step.icon className="w-7 h-7" />
                                </div>
                                <div className="absolute top-6 right-6 text-4xl font-bold text-foreground/5 select-none">
                                    0{step.id}
                                </div>
                                <h3 className="text-xl font-semibold mb-3">{step.title}</h3>
                                <p className="text-muted-foreground text-sm leading-relaxed">
                                    {step.description}
                                </p>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Institutional Capital Network */}
            <section className="py-20">
                <div className="container px-4 md:px-6 mx-auto">
                    <div className="max-w-4xl mx-auto text-center">
                        <h2 className="text-3xl md:text-4xl font-bold font-batman mb-8">Institutional Capital Network</h2>
                        <p className="text-muted-foreground mb-12">
                            Opportunities are shared selectively in line with institutional mandates.
                        </p>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            {network.map((item, idx) => (
                                <motion.div
                                    key={idx}
                                    initial={{ opacity: 0, scale: 0.95 }}
                                    whileInView={{ opacity: 1, scale: 1 }}
                                    transition={{ delay: idx * 0.1 }}
                                    viewport={{ once: true }}
                                    className="bg-secondary/10 border border-border/50 p-6 rounded-xl flex items-center justify-center text-center font-medium"
                                >
                                    {item}
                                </motion.div>
                            ))}
                        </div>
                    </div>
                </div>
            </section>

            {/* Contact Form / Discussion Request */}
            <section id="contact" className="py-20 bg-secondary/5">
                <div className="container px-4 md:px-6 mx-auto">
                    <div className="max-w-3xl mx-auto bg-background border border-border p-8 md:p-12 rounded-3xl shadow-lg">
                        <div className="text-center mb-10">
                            <h2 className="text-3xl font-bold font-batman mb-4">Request a Confidential Discussion</h2>
                            <p className="text-muted-foreground">
                                Companies seeking growth or pre-IPO capital may submit their details for an initial, confidential review. All information is treated with strict confidentiality.
                            </p>
                        </div>

                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <label className="text-sm font-medium">Company Name</label>
                                    <input
                                        name="companyName"
                                        value={formData.companyName}
                                        onChange={handleChange}
                                        type="text"
                                        className="w-full px-4 py-3 rounded-lg bg-secondary/10 border border-border focus:outline-none focus:ring-2 focus:ring-primary/50"
                                        placeholder="Enter company name"
                                        required
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-medium">Promoter / Key Contact</label>
                                    <input
                                        name="promoterName"
                                        value={formData.promoterName}
                                        onChange={handleChange}
                                        type="text"
                                        className="w-full px-4 py-3 rounded-lg bg-secondary/10 border border-border focus:outline-none focus:ring-2 focus:ring-primary/50"
                                        placeholder="Name & Designation"
                                        required
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-medium">Email Address</label>
                                    <input
                                        name="email"
                                        value={formData.email}
                                        onChange={handleChange}
                                        type="email"
                                        className="w-full px-4 py-3 rounded-lg bg-secondary/10 border border-border focus:outline-none focus:ring-2 focus:ring-primary/50"
                                        placeholder="corporate@company.com"
                                        required
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-medium">Phone Number</label>
                                    <input
                                        name="phone"
                                        value={formData.phone}
                                        onChange={handleChange}
                                        type="tel"
                                        className="w-full px-4 py-3 rounded-lg bg-secondary/10 border border-border focus:outline-none focus:ring-2 focus:ring-primary/50"
                                        placeholder="+91 98765 43210"
                                        required
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-medium">Capital Requirement (₹)</label>
                                    <input
                                        name="capitalRequirement"
                                        value={formData.capitalRequirement}
                                        onChange={handleChange}
                                        type="text"
                                        className="w-full px-4 py-3 rounded-lg bg-secondary/10 border border-border focus:outline-none focus:ring-2 focus:ring-primary/50"
                                        placeholder="e.g. 50 Cr"
                                        required
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-medium">Stage</label>
                                    <select
                                        name="stage"
                                        value={formData.stage}
                                        onChange={handleChange}
                                        className="w-full px-4 py-3 rounded-lg bg-secondary/10 border border-border focus:outline-none focus:ring-2 focus:ring-primary/50"
                                    >
                                        <option value="Growth">Growth</option>
                                        <option value="Pre-IPO">Pre-IPO</option>
                                    </select>
                                </div>
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium">Brief Business Overview</label>
                                <textarea
                                    name="businessOverview"
                                    value={formData.businessOverview}
                                    onChange={handleChange}
                                    className="w-full px-4 py-3 rounded-lg bg-secondary/10 border border-border focus:outline-none focus:ring-2 focus:ring-primary/50 min-h-[100px]"
                                    placeholder="Brief description of the business..."
                                    required
                                />
                            </div>
                            {error && <p className="text-red-500 text-sm">{error}</p>}
                            <Button disabled={loading} type="submit" size="lg" className="w-full py-6 text-lg rounded-xl font-semibold">
                                {loading ? "Submitting..." : "Submit for Review"}
                            </Button>
                        </form>
                    </div>
                </div>
            </section>



            {/* FAQ */}
            <Faq items={faq} />

            <CommonCTA
                title={<span>Exploring <span className="text-primary">Institutional Capital?</span></span>}
                description="Request a confidential discussion to evaluate suitability."
                buttonText="Request Confidential Discussion"
                buttonLink="#contact"
            />


            {/* Disclosure */}
            <Disclosure
                title="Important Disclosure"
                description="Richharbor does not solicit public investments, does not guarantee capital raises, and does not provide investment advice. All investment decisions are made independently by investors and companies."
            />



            <Dialog open={succOpen} onOpenChange={setSuccOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Success 🎉</DialogTitle>
                        <DialogDescription>
                            Your request has been submitted successfully. We will review it and get back to you shortly.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="my-5 text-green-500 w-full ">
                        <CircleCheckBig className="mx-auto font-light" size={100} />
                    </div>
                </DialogContent>
            </Dialog>

            <Dialog open={errOpen} onOpenChange={setErrOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Error</DialogTitle>
                        <DialogDescription>Unable to submit your request at the moment. Please try again later.</DialogDescription>
                    </DialogHeader>
                    <div className="my-5 text-red-500 w-full ">
                        <CircleX className="mx-auto font-light" size={100} />
                    </div>
                </DialogContent>
            </Dialog>
        </div >
    );
}
