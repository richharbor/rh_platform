"use client"

import { motion, useSpring, useTransform, useMotionValue } from "framer-motion"
import { useMemo, MouseEvent } from "react"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { ArrowRight, ChevronRight } from "lucide-react"
import { LoanFormDialog } from "./LoanFormDialog"
import { useState } from "react"


export function HeroSection() {
    const BOX_SIZE = 128; // w-32 = 128px
    const CONTAINER_WIDTH = 1200;
    const CONTAINER_HEIGHT = 700;
    const BOX_COUNT = 6;

    interface Box {
        x: number;
        y: number;
    }

    const mouseX = useMotionValue(0);
    const mouseY = useMotionValue(0);

    const springConfig = { damping: 25, stiffness: 150 };
    const springX = useSpring(mouseX, springConfig);
    const springY = useSpring(mouseY, springConfig);

    const translateX = useTransform(springX, [0, 1], [30, -30]);
    const translateY = useTransform(springY, [0, 1], [30, -30]);

    function handleMouseMove({ currentTarget, clientX, clientY }: MouseEvent) {
        const { left, top, width, height } = currentTarget.getBoundingClientRect();
        mouseX.set((clientX - left) / width);
        mouseY.set((clientY - top) / height);
    }

    const boxes = useMemo(() => {
        const b: Box[] = [];
        // Collision checker
        function isOverlapping(x: number, y: number, existing: Box[]) {
            return existing.some((item) => {
                const dx = Math.abs(item.x - x);
                const dy = Math.abs(item.y - y);
                return dx < BOX_SIZE && dy < BOX_SIZE;
            });
        }

        // Generate non-overlapping positions
        for (let i = 0; i < BOX_COUNT; i++) {
            let x, y;
            // retry until safe spot found
            do {
                x = Math.floor(Math.random() * (CONTAINER_WIDTH - BOX_SIZE));
                y = Math.floor(Math.random() * (CONTAINER_HEIGHT - BOX_SIZE));
            } while (isOverlapping(x, y, b));

            b.push({ x, y });
        }
        return b;
    }, [BOX_SIZE, CONTAINER_WIDTH, CONTAINER_HEIGHT, BOX_COUNT]);

    const [open, setOpen] = useState(false);

    return (
        <section className="relative px-6 lg:px-8 py-20 lg:py-32 md:w-[99.2vw] w-full overflow-hidden ">
            <div className="absolute inset-0 bg-[url('https://richharbor.s3.us-east-1.amazonaws.com/WhatsApp+Image+2026-01-20+at+12.08.37.jpeg')] bg-cover bg-center opacity-20 blur-sm scale-105 pointer-events-none" />
            <div className="absolute inset-0 bg-gradient-to-b from-background via-transparent to-background pointer-events-none" />

            <div className="max-w-7xl relative z-10 mx-auto text-center">
                {/* Announcement Badge */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-secondary text-sm mb-8"
                >
                    <span className="w-2 h-2 rounded-full bg-[#4AA651]" />
                    <span className="text-muted-foreground">Announcing $50M in funding</span>
                    <ChevronRight size={14} className="text-muted-foreground" />
                </motion.div>

                {/* Main Heading */}
                <motion.h1
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.1 }}
                    className="text-2xl sm:text-4xl md:text-5xl lg:text-6xl font-bold font-batman tracking-tight text-balance max-w-4xl mx-auto leading-[1.1] bg-clip-text text-transparent bg-gradient-to-r from-foreground to-foreground/70"
                >
                    Loans & Structured Credit Solutions
                </motion.h1>

                {/* Subtitle */}
                <motion.p
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.2 }}
                    className="mt-6 text-lg text-muted-foreground max-w-2xl mx-auto text-pretty"
                >
                    Access retail, SME, and corporate loan products through a structured execution platform designed for speed, transparency, and scalability.
                </motion.p>

                {/* CTA Buttons */}
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.3 }}
                    className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4"
                >
                    <Button onClick={() => setOpen(true)} size="lg" className="rounded-full h-12 px-8 text-lg shadow-lg hover:shadow-xl transition-all">
                        Apply for a Loan <ArrowRight className="ml-2 w-5 h-5" />
                    </Button>
                </motion.div>
            </div>

            <LoanFormDialog open={open} onOpenChange={setOpen} />
        </section >
    )
}
