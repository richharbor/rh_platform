"use client";

import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";

const categories = [
    {
        id: "invest-trade",
        title: "Invest & Trade",
        description: "Unlock high-growth opportunities in private markets.",
        products: [
            {
                title: "Unlisted Shares",
                description: "Invest in high-growth companies before they go public. Access exclusive shares of top-performing private companies.",
                image: "https://images.unsplash.com/photo-1590283603385-17ffb3a7f29f?q=80&w=1920&auto=format&fit=crop",
                link: "/unlisted-shares"
            },
            {
                title: "Bulk & Institutional Deals",
                description: "Execute large block trades seamlessly with our institutional-grade execution capabilities.",
                image: "https://images.unsplash.com/photo-1559526324-4b87b5e36e44?q=80&w=2071&auto=format&fit=crop",
                link: "/bulk-deals"
            },
            {
                title: "Private Markets",
                description: "Access curated opportunities in the private equity and pre-IPO space.",
                image: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?q=80&w=2015&auto=format&fit=crop",
                link: "/private-markets"
            }
        ]
    },
    {
        id: "financial-solutions",
        title: "Financial Solutions",
        description: "Comprehensive financial services tailored to your needs.",
        products: [
            {
                title: "Loans",
                description: "Personal, Home, and Business loans with competitive interest rates and quick approval.",
                image: "https://images.unsplash.com/photo-1579621970563-ebec7560ff3e?q=80&w=2071&auto=format&fit=crop",
                link: "/loans"
            },
            {
                title: "Insurance",
                description: "Protect what matters most with our wide range of life, health, and general insurance plans.",
                image: "https://images.unsplash.com/photo-1450101499163-c8848c66ca85?q=80&w=2070&auto=format&fit=crop",
                link: "/insurance"
            },
            {
                title: "Corporate Finance",
                description: "Strategic financial solutions for businesses including debt syndication and capital restructuring.",
                image: "https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?q=80&w=2070&auto=format&fit=crop",
                link: "/corporate-finance"
            }
        ]
    }
];

export default function ProductShowcase() {
    return (
        <section id="our-products" className="py-20 overflow-hidden max-w-7xl mx-auto bg-background">
            <div className="container mx-auto px-4 md:px-6">
                <div className="text-center mb-16">
                    <motion.h2
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        className="text-4xl md:text-5xl font-bold font-batman mb-4"
                    >
                        Our Products
                    </motion.h2>
                    <motion.p
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: 0.1 }}
                        className="text-lg text-muted-foreground max-w-2xl mx-auto"
                    >
                        Explore our comprehensive suite of investment and financial solutions.
                    </motion.p>
                </div>

                {categories.map((category) => (
                    <div key={category.id} id={category.id} className="mb-32 last:mb-0 scroll-mt-24">
                        <div className="mb-12 border-b border-border pb-4">
                            <h3 className="text-3xl font-bold font-batman">{category.title}</h3>
                            <p className="text-muted-foreground mt-2">{category.description}</p>
                        </div>

                        <div className="space-y-24">
                            {category.products.map((product, index) => (
                                <motion.div
                                    key={product.title}
                                    initial={{ opacity: 0, y: 50 }}
                                    whileInView={{ opacity: 1, y: 0 }}
                                    viewport={{ once: true, margin: "-100px" }}
                                    transition={{ duration: 0.6 }}
                                    className={`flex flex-col ${index % 2 === 0 ? 'lg:flex-row' : 'lg:flex-row-reverse'} gap-10 lg:gap-20 items-center`}
                                >
                                    {/* Image Section */}
                                    <div className="w-full lg:w-1/2">
                                        <div className="relative h-[300px] lg:h-[400px] w-full rounded-2xl overflow-hidden shadow-2xl group">
                                            <div className="absolute inset-0 bg-primary/10 group-hover:bg-transparent transition-colors duration-500 z-10" />
                                            <Image
                                                src={product.image}
                                                alt={product.title}
                                                fill
                                                className="object-cover transition-transform duration-700 group-hover:scale-110"
                                            />
                                        </div>
                                    </div>

                                    {/* Content Section */}
                                    <div className="w-full lg:w-1/2 space-y-6">
                                        <h4 className="text-2xl md:text-3xl font-bold">{product.title}</h4>
                                        <p className="text-lg text-muted-foreground leading-relaxed">
                                            {product.description}
                                        </p>
                                        <Link href={product.link}>
                                            <Button size="lg" className="rounded-full px-8 gap-2 group">
                                                Explore Now
                                                <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                                            </Button>
                                        </Link>
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    </div>
                ))}
            </div>
        </section>
    );
}
