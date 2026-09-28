"use client";

import { motion } from "framer-motion";
import { Heart, Umbrella, Car, Building2, CheckCircle2 } from "lucide-react";

const products = [
    {
        category: "Life Insurance",
        icon: Umbrella,
        items: ["Term Insurance", "Unit Linked Insurance Plans (ULIPs)", "Endowment Plans", "Whole Life Plans"]
    },
    {
        category: "Health Insurance",
        icon: Heart,
        items: ["Individual Health Plans", "Family Floater Policies", "Senior Citizen Health Insurance", "Critical Illness Coverage"]
    },
    {
        category: "Motor Insurance",
        icon: Car,
        items: ["Third-Party Insurance", "Comprehensive Motor Insurance"]
    },
    {
        category: "Business & Specialty Insurance",
        icon: Building2,
        items: ["Business Insurance", "Accident Insurance", "Travel Insurance", "Home Insurance"]
    }
];

export default function InsuranceProducts() {
    return (
        <section className="py-24 bg-secondary/5 relative overflow-hidden">
            <div className="container max-w-7xl mx-auto px-4 md:px-6">
                <div className="text-center mb-16">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                    >
                        <span className="inline-block px-4 py-1.5 rounded-full bg-primary/10 text-primary text-sm font-bold tracking-wider mb-4">
                            INSURANCE PRODUCTS
                        </span>
                        <h2 className="text-2xl md:text-4xl font-bold font-batman mb-4">Insurance Solutions Offered</h2>
                    </motion.div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                    {products.map((product, idx) => (
                        <motion.div
                            key={idx}
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            transition={{ delay: idx * 0.1 }}
                            viewport={{ once: true }}
                            className="bg-background border border-border/50 p-6 rounded-2xl hover:border-primary/50 transition-colors shadow-sm hover:shadow-md h-full"
                        >
                            <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center mb-4 text-primary">
                                <product.icon className="w-6 h-6" />
                            </div>
                            <h3 className="text-xl font-semibold mb-4">{product.category}</h3>
                            <ul className="space-y-3">
                                {product.items.map((item, itemIdx) => (
                                    <li key={itemIdx} className="flex items-start gap-2 text-sm text-muted-foreground">
                                        <div className="mt-1 w-1.5 h-1.5 rounded-full bg-primary shrink-0" />
                                        <span>{item}</span>
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
