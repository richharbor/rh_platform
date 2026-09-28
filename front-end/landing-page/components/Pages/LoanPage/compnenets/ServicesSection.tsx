"use client"

import { motion } from "framer-motion";
import {
    Building2,
    Landmark,
    Briefcase,
    TrendingUp,
    CreditCard,
    Home,
    Banknote,
    Rocket
} from "lucide-react";

export function ServicesSection() {
    const services = [
        {
            partner: "Andromeda",
            title: "Comprehensive Loan Solutions",
            description: "Providing a wide range of loan products through India's largest loan distributor network.",
            features: ["Home Loans", "Business Loans", "Loan Against Property", "Personal Loans"],
            icon: Landmark,
            color: "bg-blue-500/10 text-blue-500",
            delay: 0.1
        },
        {
            partner: "Recurclub",
            title: "Capital for Startups",
            description: "Non-dilutive growth capital for companies with recurring revenue streams.",
            features: ["Recurring Revenue Financing", "Up to ₹10 Crore Funding", "Fast 48h Disbursal", "No Collateral"],
            icon: Rocket,
            color: "bg-purple-500/10 text-purple-500",
            delay: 0.2
        },
        {
            partner: "GetVantage",
            title: "Revenue-Based Financing",
            description: "Data-driven funding for eCommerce and D2C brands to fuel growth.",
            features: ["Marketing Spend Capital", "Inventory Financing", "Flexible Repayment", "Founder-Friendly"],
            icon: TrendingUp,
            color: "bg-green-500/10 text-green-500",
            delay: 0.3
        },
        {
            partner: "Bazarmoney",
            title: "Retail Credit Solutions",
            description: "Accessible retail loans helping individuals and small businesses bridge financial gaps.",
            features: ["Retail Loans", "Credit Solutions", "Simplified Process", "Quick Approval"],
            icon: CreditCard,
            color: "bg-orange-500/10 text-orange-500",
            delay: 0.4
        }
    ];

    return (
        <section className="py-24 px-6 bg-background relative overflow-hidden">
            {/* Background Decoration */}
            <div className="absolute top-0 left-0 w-full h-full overflow-hidden -z-10 pointer-events-none opacity-30">
                <div className="absolute -top-[20%] -right-[10%] w-[600px] h-[600px] bg-primary/5 rounded-full blur-3xl" />
                <div className="absolute top-[40%] -left-[10%] w-[500px] h-[500px] bg-secondary/10 rounded-full blur-3xl" />
            </div>

            <div className="max-w-7xl mx-auto">
                <div className="text-center mb-20">
                    <motion.h2
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.5 }}
                        className="text-3xl md:text-5xl font-bold font-batman tracking-tight mb-6"
                    >
                        Expert Services from Industry Leaders
                    </motion.h2>
                    <motion.p
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.5, delay: 0.1 }}
                        className="text-lg text-muted-foreground max-w-2xl mx-auto"
                    >
                        We have tied up with top financial partners to bring you the best funding options tailored to your needs.
                    </motion.p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                    {services.map((service, index) => (
                        <motion.div
                            key={service.partner}
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.5, delay: service.delay }}
                            className="group relative p-8 rounded-3xl bg-secondary/30 hover:bg-secondary/50 border border-border/50 hover:border-primary/20 transition-all duration-300"
                        >
                            <div className={`w-14 h-14 rounded-2xl ${service.color} flex items-center justify-center mb-6 text-xl group-hover:scale-110 transition-transform duration-300`}>
                                <service.icon size={28} />
                            </div>
                            <h3 className="text-xl font-bold mb-3 text-foreground/90">
                                {service.title}
                            </h3>
                            <p className="text-sm text-muted-foreground mb-6 leading-relaxed">
                                {service.description}
                            </p>

                            <ul className="space-y-3">
                                {service.features.map((feature, i) => (
                                    <li key={i} className="flex items-center text-sm font-medium text-foreground/80">
                                        <div className="w-1.5 h-1.5 rounded-full bg-primary/60 mr-2.5" />
                                        {feature}
                                    </li>
                                ))}
                            </ul>
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    );
}
