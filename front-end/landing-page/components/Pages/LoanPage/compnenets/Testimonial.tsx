"use client"

import { motion } from "framer-motion"
import { Card } from "@/components/ui/card"
import { Star } from "lucide-react"

const testimonials = [
    {
        quote:
            "LoanFlow made it incredibly easy to secure funding for our expansion. The process was seamless and transparent.",
        author: "Sarah Chen",
        role: "CEO, TechStart Inc.",
        rating: 5,
    },
    {
        quote: "We received our funds within 24 hours. The rates were competitive and the team was incredibly supportive.",
        author: "Michael Roberts",
        role: "Founder, GrowthLabs",
        rating: 5,
    },
    {
        quote: "The flexible repayment terms helped us manage our cash flow effectively during our busiest season.",
        author: "Emily Johnson",
        role: "CFO, RetailPlus",
        rating: 5,
    },
]

export function TestimonialsSection() {
    return (
        <section className="py-24 px-6 bg-card">
            <div className="max-w-7xl mx-auto">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5 }}
                    className="text-center mb-16"
                >
                    <h2 className="text-3xl sm:text-4xl font-bold font-batman tracking-tight mb-4">Trusted by Thousands</h2>
                    <p className="text-muted-foreground max-w-2xl mx-auto">
                        See what business owners are saying about their experience with LoanFlow.
                    </p>
                </motion.div>

                <div className="grid md:grid-cols-3 gap-6">
                    {testimonials.map((testimonial, index) => (
                        <motion.div
                            key={testimonial.author}
                            initial={{ opacity: 0, y: 30 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: index * 0.1 }}
                        >
                            <Card className="p-6 h-full bg-background border-border">
                                <div className="flex gap-1 mb-4">
                                    {Array.from({ length: testimonial.rating }).map((_, i) => (
                                        <Star key={i} size={16} className="fill-foreground text-foreground" />
                                    ))}
                                </div>
                                <p className="text-foreground mb-6 leading-relaxed">"{testimonial.quote}"</p>
                                <div>
                                    <p className="font-medium text-sm">{testimonial.author}</p>
                                    <p className="text-sm text-muted-foreground">{testimonial.role}</p>
                                </div>
                            </Card>
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    )
}
