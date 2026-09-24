"use client";

import { motion } from "framer-motion";
import { ShieldCheck, TrendingUp, Handshake, Users, Lock, PieChart, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { postLead, LeadData } from "@/services/leadService";
import { useState } from "react";
import z from "zod";
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";


const benefits = [
    {
        title: "Exclusive Access",
        description: "Access to institutional and promoter led blocks not available to retail public.",
        icon: Handshake,
    },
    {
        title: "Confidentiality",
        description: "Efficient execution with strict confidentiality for large volume transactions.",
        icon: Lock,
    },
    {
        title: "Competitive Pricing",
        description: "Negotiated pricing for high volume trades, providing better value.",
        icon: TrendingUp,
    },
    {
        title: "Market Insights",
        description: "Deep market insights to help you make informed block deal decisions.",
        icon: PieChart,
    },
];

const idealFor = [
    {
        title: "HNIs & Family Offices",
        description: "High Net Worth Individuals and Family Offices looking for strategic stakes.",
        icon: Users,
    },
    {
        title: "Wealth Managers",
        description: "Wealth managers engaged in portfolio scaling for their premium clients.",
        icon: TrendingUp,
    },
    {
        title: "Institutions",
        description: "Institutional investors seeking large block liquidity and entry/exit.",
        icon: ShieldCheck,
    },
];


interface FormData {
    shareName: string
    quantity: string
    name: string
    email: string
    phone: string
    city: string
    transactionType: "buy" | "sell"
}
const enquirySchema = z.object({
    shareName: z.string().min(1, "Share name is required"),
    quantity: z
        .string()
        .regex(/^\d+$/, "Quantity must be a number"),
    name: z.string().min(2, "Name is required"),
    email: z.string().email("Invalid email address"),
    phone: z.string().regex(/^[0-9]{10}$/, "Phone must be 10 digits"),
    city: z.string().min(2, "City is required"),
    transactionType: z.enum(["buy", "sell"]),
});

export default function BulkDeals() {
    const [open, setOpen] = useState(false)
    const [error, setError] = useState<string>("");
    const [loading, setLoading] = useState(false);

    const [formData, setFormData] = useState<FormData>({
        shareName: "",
        quantity: "",
        name: "",
        email: "",
        phone: "",
        city: "",
        transactionType: "buy"
    })




    const handleChange = (
        e: React.ChangeEvent<
            HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
        >
    ) => {
        const { name, value } = e.target;
        setFormData({
            ...formData,
            [name]: value,
        });
    };

    const handleEnquirySubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setLoading(true);
        try {
            console.log(formData);
            const result = enquirySchema.safeParse(formData);
            if (!result.success) {
                const firstError = result.error.issues[0]?.message;
                setError(firstError);
                console.error(firstError);
                return;
            }



            setError("");

            const { name, email, phone, city, shareName, quantity, transactionType, ...rest } = result.data;

            const leadData: LeadData = {
                product_type: "bulk_deal",
                lead_type: "self",
                name,
                email,
                phone,
                city,
                product_details: {
                    shareName,
                    quantity,
                    transactionType,
                    ...rest,
                    source: "web",
                },
            };

            const response = await postLead(leadData);
            console.log(response);
            setOpen(false);
            const whatsappUrl = `https://wa.me/919211265558?text=Hello!%20I%20have%20a%20query%20about%20bulk%20deals.`;
            window.open(whatsappUrl, "_blank");
            setFormData({
                shareName: "",
                quantity: "",
                name: "",
                email: "",
                phone: "",
                city: "",
                transactionType: "buy"
            })

        } catch (error) {
            console.error("Form submission error:", error);
            setError("Form submission error")
        } finally {
            setLoading(false);
        }

    }

    return (
        <div className="min-h-screen bg-background pt-20">
            {/* Hero Section */}
            <section className="relative overflow-hidden w-[99vw] py-20 lg:py-36">
                <div className="absolute inset-0 bg-[url('https://richharbor.s3.us-east-1.amazonaws.com/WhatsApp+Image+2026-01-20+at+11.55.48.jpeg')] bg-cover bg-center opacity-20 blur-sm scale-105 pointer-events-none" />
                <div className="absolute inset-0 bg-gradient-to-b from-background via-transparent to-background pointer-events-none" />
                <div className="container px-4 md:px-6 mx-auto relative z-10">
                    <div className="max-w-4xl mx-auto text-center">
                        <motion.h1
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="text-3xl md:text-5xl font-bold font-batman mb-6 bg-clip-text text-transparent bg-gradient-to-r from-foreground to-foreground/70"
                        >
                            Listed Shares — Bulk & Institutional Deals
                        </motion.h1>
                        <motion.p
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.1 }}
                            className="text-lg md:text-xl text-muted-foreground mb-8 leading-relaxed max-w-3xl mx-auto"
                        >
                            Richharbor facilitates bulk and block deals in listed shares, enabling access to large quantities at negotiated pricing for eligible investors. We facilitate BSE NSE bulk deals, helping you execute a bulk deal in NSE or a bulk deal in BSE, providing opportunities to bulk buy NSE and BSE shares.
                        </motion.p>
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.2 }}
                        >

                            <Button onClick={() => setOpen(true)} size="lg" className="rounded-full h-12 px-8 text-lg shadow-lg hover:shadow-xl transition-all">
                                Enquire Now <ArrowRight className="ml-2 w-5 h-5" />
                            </Button>

                        </motion.div>
                    </div>
                </div>
            </section>

            {/* Key Benefits */}
            <section className="py-20 max-w-7xl mx-auto bg-secondary/5">
                <div className="container px-4 md:px-6 mx-auto">
                    <div className="text-center mb-16">
                        <h2 className="text-3xl md:text-4xl font-bold font-batman mb-4">Key Benefits</h2>
                        <p className="text-muted-foreground max-w-2xl mx-auto">
                            Why execute block deals with Richharbor?
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                        {benefits.map((benefit, idx) => (
                            <motion.div
                                key={idx}
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                transition={{ delay: idx * 0.1 }}
                                viewport={{ once: true }}
                                className="bg-background border border-border/50 p-6 rounded-2xl hover:border-primary/50 transition-colors shadow-sm hover:shadow-md"
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

            {/* Ideal For Section */}
            <section className="py-20 max-w-7xl mx-auto">
                <div className="container px-4 md:px-6 mx-auto">
                    <div className="text-center mb-16">
                        <h2 className="text-3xl md:text-4xl font-bold font-batman mb-4">Ideal For</h2>
                        <p className="text-muted-foreground max-w-2xl mx-auto">
                            Who can benefit from our bulk deal services?
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        {idealFor.map((item, idx) => (
                            <motion.div
                                key={idx}
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                transition={{ delay: idx * 0.1 }}
                                viewport={{ once: true }}
                                className="bg-gradient-to-b from-secondary/5 to-transparent p-6 rounded-2xl border border-border/30 text-center"
                            >
                                <div className="w-16 h-16 mx-auto bg-background border-4 border-secondary/20 rounded-full flex items-center justify-center mb-6 text-primary">
                                    <item.icon className="w-7 h-7" />
                                </div>
                                <h3 className="text-xl font-semibold mb-2">{item.title}</h3>
                                <p className="text-muted-foreground text-sm">
                                    {item.description}
                                </p>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Disclosure */}
            <section className="py-12 bg-neutral-900 text-neutral-400">
                <div className="container px-4 md:px-6 mx-auto">
                    <div className="max-w-4xl mx-auto border border-neutral-800 bg-neutral-950/50 p-8 rounded-2xl backdrop-blur-sm">
                        <h3 className="text-lg font-semibold text-neutral-200 mb-3 flex items-center gap-2">
                            <ShieldCheck className="w-5 h-5 text-yellow-500" /> Disclosure
                        </h3>
                        <p className="text-sm leading-relaxed">
                            Bulk deals are subject to market risk and regulatory requirements. Execution depends on availability and counterparty confirmation.
                        </p>
                    </div>
                </div>
            </section>
            <Dialog open={open} onOpenChange={setOpen}>
                <DialogContent className="sm:max-w-[425px]">
                    <DialogHeader>
                        <DialogTitle>Send Enquiry</DialogTitle>
                        <DialogDescription>
                            Please fill in the details below to send an enquiry for this share.
                        </DialogDescription>
                    </DialogHeader>

                    <form onSubmit={handleEnquirySubmit} className="grid gap-4">
                        {/* Share Name (readonly) */}
                        <div className="grid gap-3">
                            <Label htmlFor="shareName">Share Name</Label>
                            <Input
                                id="shareName"
                                name="shareName"
                                onChange={handleChange}
                                placeholder="Enter share name"
                                className="bg-gray-100"
                            />
                        </div>

                        {/* Quantity */}
                        <div className="grid gap-3">
                            <Label htmlFor="quantity">Quantity</Label>
                            <Input onChange={handleChange} id="quantity" name="quantity" type="number" placeholder="Enter quantity" />
                        </div>

                        {/* Name */}
                        <div className="grid gap-3">
                            <Label htmlFor="name">Name</Label>
                            <Input onChange={handleChange} id="name" name="name" placeholder="Enter your name" />
                        </div>

                        {/* Email */}
                        <div className="grid gap-3">
                            <Label htmlFor="email">Email</Label>
                            <Input onChange={handleChange} id="email" name="email" type="email" placeholder="Enter your email" />
                        </div>

                        {/* Phone */}
                        <div className="grid gap-3">
                            <Label htmlFor="phone">Phone</Label>
                            <Input onChange={handleChange} id="phone" name="phone" type="tel" placeholder="Enter your phone number" />
                        </div>

                        <div className="grid gap-3">
                            <Label htmlFor="city">City</Label>
                            <Input onChange={handleChange} id="city" name="city" placeholder="Enter your city" />
                        </div>

                        <div className="grid gap-3">
                            <Label>I want to</Label>
                            <Select
                                defaultValue="buy"
                                onValueChange={(value: string) => setFormData({ ...formData, transactionType: value as "buy" | "sell" })}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Select transaction type" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="buy">Buy</SelectItem>
                                    <SelectItem value="sell">Sell</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <p className='text-red-500 text-sm'>{error}</p>
                        <DialogFooter>
                            <DialogClose asChild>
                                <Button variant="outline">Cancel</Button>
                            </DialogClose>
                            <Button disabled={loading} type="submit">{loading ? 'Sending...' : 'Send Enquiry'}</Button>

                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>
        </div>
    );
}
