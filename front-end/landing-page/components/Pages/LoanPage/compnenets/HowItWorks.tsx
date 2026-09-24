"use client"

import { motion } from "framer-motion"
import Image from "next/image"

const steps = [
  {
    step: "01",
    title: "Apply Online",
    description: "Fill out our simple application form in under 5 minutes. No paperwork required.",
    image: "https://i.pinimg.com/736x/ae/0e/2f/ae0e2facf75853440a9f0cc37c50d23b.jpg",
  },
  {
    step: "02",
    title: "Get Approved",
    description: "Our AI analyzes your business and provides instant approval decisions.",
    image: "https://i.pinimg.com/736x/b8/58/9c/b8589c1f06996f779444943880d1dd67.jpg",
  },
  {
    step: "03",
    title: "Receive Funds",
    description: "Funds are deposited directly to your account within 24 hours.",
    image: "https://i.pinimg.com/736x/a0/4d/32/a04d3283a8285ea9792ddb8862d41af8.jpg",
  },
]

export function HowItWorksSection() {
  return (
    <section className="py-24 px-6">
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl sm:text-4xl font-bold font-batman tracking-tight mb-4">How It Works</h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Get funded in three simple steps. No complicated processes, no hidden fees.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-8">
          {steps.map((item, index) => (
            <motion.div
              key={item.step}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.15 }}
              className="relative"
            >
              {/* Connector Line */}
              {index < steps.length - 1 && (
                <div className="hidden md:block absolute top-24 left-[60%] w-[80%] h-[2px] bg-border" />
              )}

              {/* Step Image */}
              <div className="relative mb-6 rounded-2xl overflow-hidden aspect-[4/3] bg-secondary">
                <Image
                  src={`${item.image}`}
                  alt={item.title}
                  fill
                  className="object-cover opacity-65"
                />
                {/* Step Number Badge */}
                <div className="absolute top-4 left-4 w-10 h-10 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-semibold text-sm">
                  {item.step}
                </div>
              </div>

              <h3 className="text-xl font-medium mb-2">{item.title}</h3>
              <p className="text-muted-foreground text-sm leading-relaxed">{item.description}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
