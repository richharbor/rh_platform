"use client"

import { motion } from "framer-motion"
import { Card } from "@/components/ui/card"
import { Zap, Shield, TrendingUp, Clock, PiggyBank, HeadphonesIcon } from "lucide-react"

const features = [
  {
    icon: TrendingUp,
    title: "Multiple Lender Options",
    description:
      "Access a wide network of leading banks and NBFCs to find the best rate and terms for your profile.",
  },
  {
    icon: Zap,
    title: "Faster Eligibility Assessment",
    description: "Instant eligibility check and quick approval process to get you funded sooner.",
  },
  {
    icon: HeadphonesIcon,
    title: "End to End Application Support",
    description: "Dedicated support team to guide you from documentation to disbursal.",
  },
]

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
}

const itemVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0 },
}

export function FeaturesSection() {
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
          <h2 className="text-3xl sm:text-4xl font-bold font-batman tracking-tight mb-4">Why Apply Through Richharbor</h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            We've reimagined business lending from the ground up, making it faster, simpler, and more transparent.
          </p>
        </motion.div>

        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="grid md:grid-cols-2 lg:grid-cols-3 gap-6"
        >
          {features.map((feature) => (
            <motion.div key={feature.title} variants={itemVariants}>
              <Card className="p-6 h-full bg-background border-border hover:shadow-lg transition-shadow duration-300">
                <div className="w-12 h-12 rounded-xl bg-secondary flex items-center justify-center mb-4">
                  <feature.icon size={24} className="text-foreground" />
                </div>
                <h3 className="text-lg font-medium mb-2">{feature.title}</h3>
                <p className="text-muted-foreground text-sm leading-relaxed">{feature.description}</p>
              </Card>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  )
}
