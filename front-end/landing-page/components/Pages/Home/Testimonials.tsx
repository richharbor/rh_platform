"use client";

import { Quote, ArrowLeft, ArrowRight } from "lucide-react";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

export default function Testimonials() {
    const originalTestimonials = [
        {
            text: "Richharbor brings clarity and discipline to unlisted share execution.",
            name: "Manish Agarwal",
            role: "Investor",
            location: "Mumbai"
        },
        {
            text: "Strong process, transparent pricing, and smooth execution.",
            name: "Sanjay Mehta",
            role: "Wealth Advisor",
            location: "Delhi"
        },
        {
            text: "Reliable platform for accessing pre-IPO opportunities with proper compliance.",
            name: "Priya Sharma",
            role: "Family Office Manager",
            location: "Bangalore"
        }
    ];

    // Duplicate testimonials to create enough content for sliding loop
    const testimonials = [...originalTestimonials, ...originalTestimonials];

    const [currentIndex, setCurrentIndex] = useState(0);
    const [visibleCount, setVisibleCount] = useState(3);

    useEffect(() => {
        const updateVisibleCount = () => {
            if (window.innerWidth < 768) {
                setVisibleCount(1);
            } else if (window.innerWidth < 1024) {
                setVisibleCount(2);
            } else {
                setVisibleCount(3);
            }
        };

        updateVisibleCount();
        window.addEventListener("resize", updateVisibleCount);
        return () => window.removeEventListener("resize", updateVisibleCount);
    }, []);

    useEffect(() => {
        const interval = setInterval(() => {
            handleNext();
        }, 5000);
        return () => clearInterval(interval);
    }, [currentIndex]);


    const handleNext = () => {
        setCurrentIndex((prev) => (prev + 1) % originalTestimonials.length);
    };

    const handlePrev = () => {
        setCurrentIndex((prev) => (prev - 1 + originalTestimonials.length) % originalTestimonials.length);
    };

    // Calculate which items to show based on currentIndex
    // We basically rotate the array or use indices. simpler to just slice the rotated array
    const visibleTestimonials = [];
    for (let i = 0; i < visibleCount; i++) {
        visibleTestimonials.push(testimonials[(currentIndex + i) % testimonials.length]);
    }

    return (
        <section className="py-24 bg-background relative overflow-hidden">
            {/* Background decoration */}
            <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-primary/5 rounded-full blur-[100px] pointer-events-none opacity-50" />

            <div className="max-w-7xl mx-auto px-6 relative z-10">
                <div className="text-center mb-16">
                    <h2 className="text-sm font-bold text-primary tracking-widest uppercase mb-3">Testimonials</h2>
                    <h3 className="text-3xl md:text-5xl font-bold font-batman tracking-tight text-foreground mb-4">
                        Trusted by Professionals Across the Financial Ecosystem
                    </h3>
                </div>

                <div className="relative">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        <AnimatePresence mode='popLayout'>
                            {visibleTestimonials.map((testimonial, index) => (
                                <motion.div
                                    key={`${currentIndex}-${index}`} // Unique key for animation triggering
                                    initial={{ opacity: 0, x: 20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: -20 }}
                                    transition={{ duration: 0.5 }}
                                    className="bg-white rounded-2xl p-8 border border-neutral-100 shadow-sm hover:shadow-xl transition-all duration-300 relative group h-full flex flex-col"
                                >
                                    <Quote className="w-10 h-10 text-black mb-6" />

                                    <p className="text-lg text-neutral-700 leading-relaxed mb-8 flex-grow italic">
                                        "{testimonial.text}"
                                    </p>

                                    <div className="border-t border-neutral-100 pt-6">
                                        <h4 className="font-bold text-neutral-900">{testimonial.name}</h4>
                                        <div className="text-sm text-neutral-500 mt-1 flex items-center gap-2">
                                            <span className="font-medium text-primary">{testimonial.role}</span>
                                            <span className="w-1 h-1 rounded-full bg-neutral-300" />
                                            <span>{testimonial.location}</span>
                                        </div>
                                    </div>
                                </motion.div>
                            ))}
                        </AnimatePresence>
                    </div>

                    {/* Navigation Dots */}
                    <div className="flex justify-center mt-12 gap-3">
                        {originalTestimonials.map((_, idx) => (
                            <button
                                key={idx}
                                onClick={() => setCurrentIndex(idx)}
                                className={`w-3 h-3 rounded-full transition-all duration-300 ${idx === currentIndex
                                        ? "bg-primary w-8"
                                        : "bg-neutral-300 hover:bg-neutral-400"
                                    }`}
                            />
                        ))}
                    </div>
                </div>
            </div>
        </section>
    );
}
