"use client"

import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { ArrowRight, CheckCircle2, User, Factory, Building2 } from "lucide-react";
import Link from "next/link";
import { LoanFormDialog } from "./LoanFormDialog";
import { useState } from "react";

export function ProductsSection() {

    const [open, setOpen] = useState(false);
    const products = [
        {
            name: "Retail Loans",
            description: "Comprehensive personal financing solutions tailored for your individual needs and milestones.",
            features: [
                "Home Loans",
                "Personal Loans",
                "Education Loans",
                "Vehicle & Car Loans",
                "Gold Loans",
                "Loan Against Property"
            ],
            icon: User,
            link: "#contact",
            color: "bg-pink-500/10 text-pink-600 border-pink-200"
        },
        {
            name: "Business & SME Loans",
            description: "Fuel your business growth with capital for expansion, inventory, or working capital needs.",
            features: [
                "Business Loans",
                "MSME Loans",
                "Mudra Loans",
                "Term Loans",
                "Working Capital Loans",
                "Machinery Loans"
            ],
            icon: Factory,
            link: "#contact",
            color: "bg-teal-500/10 text-teal-600 border-teal-200"
        },
        {
            name: "Structured & Corporate Credit",
            description: "Advanced credit facilities and structured financing for large-scale corporate requirements.",
            features: [
                "Revenue Based Financing (RBF)",
                "Fixed Term Loans (FTL)",
                "Anchor-Backed Vendor / Channel Financing",
                "Construction Funding",
                "Project Finance"
            ],
            icon: Building2,
            link: "#contact",
            color: "bg-purple-500/10 text-purple-600 border-purple-200"
        }
    ];

    return (
        <section className="py-24 px-6 bg-secondary/20">
            <div className="max-w-7xl mx-auto">
                <div className="text-center mb-16">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                    >
                        <span className="inline-block px-4 py-1.5 rounded-full bg-primary/10 text-primary text-sm font-bold tracking-wider mb-4">
                            LOAN PRODUCTS
                        </span>
                        <h2 className="text-3xl md:text-5xl font-bold font-batman tracking-tight mb-4">
                            Loan Products Offered
                        </h2>
                    </motion.div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 justify-center">
                    {products.map((product, index) => (
                        <motion.div
                            key={product.name}
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.5, delay: index * 0.1 }}
                            className="bg-background rounded-3xl p-8 border border-border hover:shadow-lg transition-all duration-300 relative overflow-hidden group"
                        >
                            <div className="absolute top-0 right-0 p-4 opacity-50 group-hover:opacity-100 transition-opacity">
                                <product.icon size={80} className="text-secondary opacity-20 -rotate-12" />
                            </div>

                            <div className="flex items-center gap-3 mb-4">
                                <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${product.color}`}>
                                    <product.icon size={24} />
                                </div>
                                <div>
                                    <h3 className="text-xl font-bold">{product.name}</h3>
                                    <p className="text-sm text-muted-foreground">Flexible Financing</p>
                                </div>
                            </div>

                            <p className="text-muted-foreground mb-8 leading-relaxed text-sm">
                                {product.description}
                            </p>

                            <div className="space-y-4 mb-8">
                                {product.features.map((feature, i) => (
                                    <div key={i} className="flex items-start gap-3">
                                        <CheckCircle2 size={18} className="text-green-500 shrink-0 mt-0.5" />
                                        <span className="text-sm font-medium opacity-80">{feature}</span>
                                    </div>
                                ))}
                            </div>

                            <Button onClick={() => setOpen(true)} className="w-full rounded-full group-hover:bg-primary/90">
                                Apply Now <ArrowRight size={16} className="ml-2 group-hover:translate-x-1 transition-transform" />
                            </Button>
                        </motion.div>
                    ))}
                </div>
            </div>
            <LoanFormDialog open={open} onOpenChange={setOpen} />
        </section>
    );
}
