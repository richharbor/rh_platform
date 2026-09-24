"use client"

import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { ArrowRight } from "lucide-react"

export function CTASection() {
  return (
    <section className="py-24 px-6">
      <div className="max-w-4xl mx-auto">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="bg-primary text-primary-foreground rounded-3xl p-12 md:p-16 text-center"
        >
          <h2 className="text-3xl sm:text-4xl font-bold font-batman tracking-tight mb-4">Ready to Grow Your Business?</h2>
          <p className="text-primary-foreground/80 max-w-xl mx-auto mb-8">
            Join thousands of businesses that have accelerated their growth with LoanFlow. Get started in minutes.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Button size="lg" variant="secondary" className="rounded-full px-8 gap-2">
              Apply Now
              <ArrowRight size={16} />
            </Button>
            <Button
              size="lg"
              variant="ghost"
              className="rounded-full px-8 text-primary-foreground hover:bg-primary-foreground/10 hover:text-primary-foreground"
            >
              Talk to Sales
            </Button>
          </div>
        </motion.div>
      </div>
    </section>
  )
}
