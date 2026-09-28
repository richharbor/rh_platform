"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { ArrowRight, ChevronLeft, ChevronRight } from "lucide-react";

const products = [
    {
        id: 1,
        title: "Unlisted Shares",
        description: "Invest in high-growth companies before they go public. Exclusive access to pre-IPO shares.",
        image: "https://images.unsplash.com/photo-1590283603385-17ffb3a7f29f?q=80&w=1920&auto=format&fit=crop",
        color: "from-blue-900/80 to-black/40",
        link: "/unlisted-shares"
    },
    {
        id: 2,
        title: "Bulk Deals",
        description: "Facilitating large volume transactions in listed securities with minimal market impact.",
        image: "https://images.unsplash.com/photo-1590283603385-17ffb3a7f29f?q=80&w=1920&auto=format&fit=crop",
        color: "from-emerald-900/80 to-black/40",
        link: "/bulk-deals"
    },
    {
        id: 3,
        title: "Private Markets",
        description: "Access exclusive opportunities in Private Equity, Venture Capital, and Alternative Investment Funds (AIFs).",
        image: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?q=80&w=1920&auto=format&fit=crop",
        color: "from-purple-900/80 to-black/40",
        link: "/private-markets"
    },
    {
        id: 4,
        title: "Loans",
        description: "Tailored financing solutions including Personal, Home, and Business loans with competitive rates.",
        image: "https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?q=80&w=1920&auto=format&fit=crop",
        color: "from-green-900/80 to-black/40",
        link: "/loans"
    },
    {
        id: 5,
        title: "Insurance",
        description: "Comprehensive protection for you and your business. Life, Health, Motor, and Corporate insurance plans.",
        image: "https://images.unsplash.com/photo-1450101499163-c8848c66ca85?q=80&w=1920&auto=format&fit=crop",
        color: "from-indigo-900/80 to-black/40",
        link: "/insurance"
    },
    {
        id: 6,
        title: "Corporate Finance",
        description: "Strategic financial advisory, debt syndication, and capital raising services for growing enterprises.",
        image: "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?q=80&w=1920&auto=format&fit=crop",
        color: "from-rose-900/80 to-black/40",
        link: "/corporate-finance"
    }
];

export default function ProductSlider() {
    const [currentIndex, setCurrentIndex] = useState(0);

    useEffect(() => {
        const timer = setInterval(() => {
            setCurrentIndex((prev) => (prev + 1) % products.length);
        }, 7000); // 10 seconds

        return () => clearInterval(timer);
    }, []);

    const nextSlide = () => {
        setCurrentIndex((prev) => (prev + 1) % products.length);
    };

    const prevSlide = () => {
        setCurrentIndex((prev) => (prev - 1 + products.length) % products.length);
    };

    return (
        <section className="relative rounded-2xl w-full h-[500px] md:h-[600px] overflow-hidden">
            <AnimatePresence initial={false} mode="wait">
                <motion.div
                    key={currentIndex}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.8 }}
                    className="absolute inset-0 w-full h-full"
                >
                    {/* Background Image */}
                    <div
                        className="absolute inset-0 bg-cover bg-center"
                        style={{ backgroundImage: `url(${products[currentIndex].image})` }}
                    />

                    {/* Overlay Gradient */}
                    <div className={`absolute inset-0 bg-gradient-to-r ${products[currentIndex].color} backdrop-blur-[1px]`} />

                    {/* Content */}
                    <div className="relative h-full container mx-auto px-4 md:px-6 flex flex-col justify-center items-start z-10">
                        <motion.div
                            initial={{ y: 20, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            transition={{ delay: 0.3, duration: 0.5 }}
                            className="max-w-3xl"
                        >
                            <h2 className="text-4xl md:text-6xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-white/70 mb-6 font-batman">
                                {products[currentIndex].title}
                            </h2>
                            <p className="text-lg md:text-2xl text-gray-200 mb-8 max-w-2xl leading-relaxed">
                                {products[currentIndex].description}
                            </p>

                            <Link href={products[currentIndex].link}>
                                <Button
                                    size="lg"
                                    className="rounded-full bg-white text-black hover:bg-white/90 text-lg px-8 py-6 shadow-[0_0_20px_rgba(255,255,255,0.3)] transition-all hover:scale-105 hover:shadow-[0_0_30px_rgba(255,255,255,0.5)]"
                                >
                                    Explore Now <ArrowRight className="ml-2 w-5 h-5" />
                                </Button>
                            </Link>
                        </motion.div>
                    </div>
                </motion.div>
            </AnimatePresence>

            {/* Navigation Controls */}
            <div className="absolute bottom-8 right-8 z-20 flex gap-4">
                <button
                    onClick={prevSlide}
                    className="p-3 rounded-full bg-white/10 hover:bg-white/20 backdrop-blur-md border border-white/20 transition-all text-white"
                >
                    <ChevronLeft className="w-6 h-6" />
                </button>
                <button
                    onClick={nextSlide}
                    className="p-3 rounded-full bg-white/10 hover:bg-white/20 backdrop-blur-md border border-white/20 transition-all text-white"
                >
                    <ChevronRight className="w-6 h-6" />
                </button>
            </div>

            {/* Progress Indicators */}
            <div className="absolute bottom-8 left-8 z-20 flex gap-2">
                {products.map((_, idx) => (
                    <button
                        key={idx}
                        onClick={() => setCurrentIndex(idx)}
                        className={`h-1.5 rounded-full transition-all duration-300 ${idx === currentIndex ? "w-8 bg-white" : "w-2 bg-white/40 hover:bg-white/60"
                            }`}
                    />
                ))}
            </div>
        </section>
    );
}
