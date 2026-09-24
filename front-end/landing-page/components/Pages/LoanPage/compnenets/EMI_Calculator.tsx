"use client"

import { useState, useEffect, useRef } from "react"
import { motion, useSpring, useTransform } from "framer-motion"
import { Slider } from "@/components/ui/slider"
import { Card } from "@/components/ui/card"
import { Calculator, IndianRupee, Calendar, Percent, TrendingUp } from "lucide-react"

function AnimatedNumber({ value, prefix = "₹", suffix = "" }: { value: number; prefix?: string; suffix?: string }) {
    const spring = useSpring(0, { stiffness: 100, damping: 30 })
    const display = useTransform(spring, (current) => prefix + Math.round(current).toLocaleString("en-IN") + suffix)
    const ref = useRef<HTMLSpanElement>(null)

    useEffect(() => {
        spring.set(value)
    }, [value, spring])

    useEffect(() => {
        const unsubscribe = display.on("change", (latest) => {
            if (ref.current) {
                ref.current.textContent = latest
            }
        })
        return () => unsubscribe()
    }, [display])

    return (
        <span ref={ref}>
            {prefix}0{suffix}
        </span>
    )
}

export function EMICalculator() {
    const [amount, setAmount] = useState(500000)
    const [years, setYears] = useState(3)
    const [interestRate, setInterestRate] = useState(11.5)

    // EMI Calculation: EMI = P × r × (1 + r)^n / ((1 + r)^n - 1)
    const monthlyRate = interestRate / 12 / 100
    const totalMonths = years * 12
    const emi =
        (amount * monthlyRate * Math.pow(1 + monthlyRate, totalMonths)) / (Math.pow(1 + monthlyRate, totalMonths) - 1)
    const totalAmount = emi * totalMonths
    const totalInterest = totalAmount - amount

    return (
        <section className="py-24 ">
            <div className="container mx-auto px-4 md:px-6">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.6 }}
                    className="text-center mb-16"
                >
                    <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/5 border border-primary/10 mb-6">
                        <Calculator className="w-4 h-4" />
                        <span className="text-sm font-medium">EMI Calculator</span>
                    </div>
                    <h2 className="text-3xl md:text-4xl font-bold font-batman tracking-tight text-balance mb-4">
                        Calculate Your Monthly EMI
                    </h2>
                    <p className="text-muted-foreground max-w-2xl mx-auto text-pretty">
                        Plan your loan repayment with our easy-to-use calculator. Adjust the amount and tenure to see your monthly
                        payments.
                    </p>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.6, delay: 0.2 }}
                    className="max-w-4xl mx-auto"
                >
                    <Card className="p-8 md:p-10 shadow-sm border-border/50">
                        <div className="grid md:grid-cols-2 gap-10">
                            {/* Input Controls */}
                            <div className="space-y-10">
                                {/* Loan Amount Slider */}
                                <div className="space-y-4">
                                    <div className="flex items-center justify-between">
                                        <label className="flex items-center gap-2 text-sm font-medium">
                                            <IndianRupee className="w-4 h-4 text-muted-foreground" />
                                            Loan Amount
                                        </label>
                                        <span className="text-sm font-semibold bg-secondary px-3 py-1 rounded-md">
                                            ₹{amount.toLocaleString("en-IN")}
                                        </span>
                                    </div>
                                    <Slider
                                        value={[amount]}
                                        onValueChange={(val) => setAmount(val[0])}
                                        min={50000}
                                        max={5000000}
                                        step={10000}
                                        className="w-full"
                                    />
                                    <div className="flex justify-between text-xs text-muted-foreground">
                                        <span>₹50,000</span>
                                        <span>₹50,00,000</span>
                                    </div>
                                </div>

                                {/* Loan Tenure Slider */}
                                <div className="space-y-4">
                                    <div className="flex items-center justify-between">
                                        <label className="flex items-center gap-2 text-sm font-medium">
                                            <Calendar className="w-4 h-4 text-muted-foreground" />
                                            Loan Tenure
                                        </label>
                                        <span className="text-sm font-semibold bg-secondary px-3 py-1 rounded-md">
                                            {years} {years === 1 ? "Year" : "Years"}
                                        </span>
                                    </div>
                                    <Slider
                                        value={[years]}
                                        onValueChange={(val) => setYears(val[0])}
                                        min={1}
                                        max={10}
                                        step={1}
                                        className="w-full"
                                    />
                                    <div className="flex justify-between text-xs text-muted-foreground">
                                        <span>1 Year</span>
                                        <span>10 Years</span>
                                    </div>
                                </div>

                                {/* Interest Rate Slider */}
                                <div className="space-y-4">
                                    <div className="flex items-center justify-between">
                                        <label className="flex items-center gap-2 text-sm font-medium">
                                            <Percent className="w-4 h-4 text-muted-foreground" />
                                            Interest Rate
                                        </label>
                                        <span className="text-sm font-semibold bg-secondary px-3 py-1 rounded-md">
                                            {interestRate}%
                                        </span>
                                    </div>
                                    <Slider
                                        value={[interestRate]}
                                        onValueChange={(val) => setInterestRate(val[0])}
                                        min={8}
                                        max={24}
                                        step={0.5}
                                        className="w-full"
                                    />
                                    <div className="flex justify-between text-xs text-muted-foreground">
                                        <span>8%</span>
                                        <span>24%</span>
                                    </div>
                                </div>
                            </div>

                            {/* Results Display */}
                            <div className="space-y-6">
                                {/* Monthly EMI - Highlighted */}
                                <motion.div className="p-6 bg-primary text-primary-foreground rounded-xl" layout>
                                    <div className="flex items-center gap-2 mb-2 opacity-80">
                                        <TrendingUp className="w-4 h-4" />
                                        <span className="text-sm">Monthly EMI</span>
                                    </div>
                                    <div className="text-3xl md:text-4xl font-bold">
                                        <AnimatedNumber value={Math.round(emi)} />
                                    </div>
                                    <p className="text-xs mt-2 opacity-70">For {totalMonths} months</p>
                                </motion.div>

                                {/* Total Interest */}
                                <div className="p-5 bg-secondary rounded-xl">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <p className="text-sm text-muted-foreground mb-1">Total Interest</p>
                                            <p className="text-xl md:text-2xl font-semibold text-destructive">
                                                <AnimatedNumber value={Math.round(totalInterest)} />
                                            </p>
                                        </div>
                                        <div className="w-12 h-12 rounded-full bg-destructive/10 flex items-center justify-center">
                                            <Percent className="w-5 h-5 text-destructive" />
                                        </div>
                                    </div>
                                </div>

                                {/* Total Amount */}
                                <div className="p-5 bg-secondary rounded-xl">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <p className="text-sm text-muted-foreground mb-1">Total Amount Payable</p>
                                            <p className="text-xl md:text-2xl font-semibold">
                                                <AnimatedNumber value={Math.round(totalAmount)} />
                                            </p>
                                        </div>
                                        <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                                            <IndianRupee className="w-5 h-5 text-primary" />
                                        </div>
                                    </div>
                                </div>

                                {/* Summary Bar */}
                                <div className="pt-4">
                                    <div className="flex justify-between text-xs text-muted-foreground mb-2">
                                        <span>Principal</span>
                                        <span>Interest</span>
                                    </div>
                                    <div className="h-3 rounded-full overflow-hidden bg-secondary flex">
                                        <motion.div
                                            className="bg-primary rounded-l-full"
                                            initial={{ width: 0 }}
                                            animate={{ width: `${(amount / totalAmount) * 100}%` }}
                                            transition={{ duration: 0.5, ease: "easeOut" }}
                                        />
                                        <motion.div
                                            className="bg-[#4AA651]"
                                            initial={{ width: 0 }}
                                            animate={{ width: `${(totalInterest / totalAmount) * 100}%` }}
                                            transition={{ duration: 0.5, ease: "easeOut", delay: 0.1 }}
                                        />
                                    </div>
                                    <div className="flex justify-between text-xs mt-2">
                                        <span className="flex items-center gap-1">
                                            <span className="w-2 h-2 rounded-full bg-primary" />
                                            {((amount / totalAmount) * 100).toFixed(1)}%
                                        </span>
                                        <span className="flex items-center gap-1">
                                            <span className="w-2 h-2 rounded-full bg-[#4AA651]" />
                                            {((totalInterest / totalAmount) * 100).toFixed(1)}%
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </Card>
                </motion.div>
            </div>
        </section>
    )
}
