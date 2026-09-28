"use client"

import { Button } from "@/components/ui/button"
import { ArrowRight, CheckCircle2 } from "lucide-react"
import { motion } from "framer-motion"
import { useState } from "react"
import { InsuranceFormDialog } from "./InsuranceFormDialog"

const benefits = ["Plan comparison support", "Transparent guidance", "Renewal and claim assistance"]

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.2,
    },
  },
}

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
}

export function Hero() {
  const [open, setOpen] = useState(false);

  return (
    <section className="relative overflow-hidden w-[99vw] py-20 lg:py-32">
      <div className="absolute inset-0 bg-[url('https://richharbor.s3.us-east-1.amazonaws.com/WhatsApp+Image+2026-01-20+at+11.58.02.jpeg')] bg-cover bg-center opacity-20 blur-sm scale-105 pointer-events-none" />
      <div className="absolute inset-0 bg-gradient-to-b from-background via-transparent to-background pointer-events-none" />
      <div className="mx-auto max-w-7xl px-6 lg:px-8 relative z-10">
        <motion.div
          className="flex flex-col items-center text-center"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          {/* Announcement badge */}
          <motion.div
            variants={itemVariants}
            className="mb-8 inline-flex items-center gap-2 rounded-full bg-secondary px-4 py-2 text-sm"
          >
            <span className="h-2 w-2 rounded-full bg-[#4AA651]" />
            <span className="text-muted-foreground">Trusted by 500,000+ families nationwide</span>
            <ArrowRight className="h-4 w-4 text-muted-foreground" />
          </motion.div>

          {/* Main heading */}
          <motion.h1
            variants={itemVariants}
            className="max-w-4xl font-bold font-batman tracking-tight text-2xl sm:text-4xl lg:text-5xl text-balance bg-clip-text text-transparent bg-gradient-to-r from-foreground to-foreground/70"
          >
            Insurance Solutions for Individuals & Businesses
          </motion.h1>

          {/* Subheading */}
          <motion.p
            variants={itemVariants}
            className="mt-6 max-w-2xl text-md sm:text-lg leading-relaxed text-muted-foreground text-pretty"
          >
            Access life, health, motor, and business insurance solutions through a structured, partner-led platform with transparent execution and end-to-end support.
          </motion.p>

          {/* CTA buttons */}
          <motion.div variants={itemVariants} className="mt-10 flex flex-col sm:flex-row items-center gap-4">
            <Button onClick={() => setOpen(true)} size="lg" className="rounded-full px-8 h-12 text-base">
              Request an Insurance Quote
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </motion.div>

          {/* Trust indicators */}
          <motion.div variants={itemVariants} className="mt-12 flex flex-wrap justify-center gap-x-8 gap-y-3">
            {benefits.map((benefit, index) => (
              <motion.div
                key={benefit}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.8 + index * 0.1 }}
                className="flex items-center gap-2 text-sm text-muted-foreground"
              >
                <CheckCircle2 className="h-5 w-5 text-[#4AA651]" />
                <span>{benefit}</span>
              </motion.div>
            ))}
          </motion.div>
        </motion.div>
      </div>
      <InsuranceFormDialog open={open} onOpenChange={setOpen} />
    </section>
  )
}
