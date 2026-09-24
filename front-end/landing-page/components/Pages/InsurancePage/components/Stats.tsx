"use client"

import { useEffect, useRef, useState } from "react"
import { motion, useInView } from "framer-motion"

const stats = [
  { value: 2, suffix: "B+", prefix: "$", label: "Claims Paid", company: "Annual payouts" },
  { value: 99.2, suffix: "%", prefix: "", label: "Customer Satisfaction", company: "Industry leading" },
  { value: 500, suffix: "K+", prefix: "", label: "Families Protected", company: "Nationwide" },
  { value: 45, suffix: "min", prefix: "", label: "Average Claim Time", company: "Fast processing" },
]

function useCountAnimation(end: number, duration = 2, isInView: boolean) {
  const [count, setCount] = useState(0)
  const hasAnimated = useRef(false)

  useEffect(() => {
    if (!isInView || hasAnimated.current) return
    hasAnimated.current = true

    let startTime: number | null = null
    const animate = (timestamp: number) => {
      if (!startTime) startTime = timestamp
      const progress = Math.min((timestamp - startTime) / (duration * 1000), 1)
      const easeOut = 1 - Math.pow(1 - progress, 3)
      setCount(easeOut * end)

      if (progress < 1) {
        requestAnimationFrame(animate)
      }
    }
    requestAnimationFrame(animate)
  }, [end, duration, isInView])

  return count
}

function StatItem({ stat, index }: { stat: (typeof stats)[0]; index: number }) {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, margin: "-100px" })
  const count = useCountAnimation(stat.value, 2, isInView)

  const displayValue = stat.value % 1 !== 0 ? count.toFixed(1) : Math.floor(count)

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 20 }}
      animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
      className="px-6 py-8 lg:py-12 text-center lg:text-left"
    >
      <p className="text-3xl lg:text-4xl font-bold font-batman text-foreground">
        {stat.prefix}
        {displayValue}
        {stat.suffix}
      </p>
      <p className="mt-1 text-sm text-muted-foreground">{stat.label}</p>
      <p className="mt-3 text-xs font-medium text-muted-foreground/70 uppercase tracking-wide">{stat.company}</p>
    </motion.div>
  )
}

export function Stats() {
  return (
    <section className="border-y border-border">
      <div className="mx-auto max-w-7xl">
        <div className="grid grid-cols-2 lg:grid-cols-4 divide-x divide-y lg:divide-y-0 divide-border">
          {stats.map((stat, index) => (
            <StatItem key={stat.label} stat={stat} index={index} />
          ))}
        </div>
      </div>
    </section>
  )
}
