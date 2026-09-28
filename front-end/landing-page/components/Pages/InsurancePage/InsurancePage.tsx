'use client'
import WhatAre from "@/components/Common/components/WhatAre";
import { Search, MessageCircle, FileSignature, ArrowRightLeft } from "lucide-react";
import Disclosure from "@/components/Common/components/Disclosure";

import { Hero } from "./components/Hero";

import { Stats } from "./components/Stats";
import WhyInvest from "@/components/Common/components/WhyInvest";
import HowItWorks from "@/components/Common/components/HowItWorks";
import Faq from "../Home/Faq/Faq";
import CommonCTA from "@/components/Common/components/CommonCTA";
import InsuranceProducts from "./components/InsuranceProducts";
import { useState } from "react";
import { InsuranceFormDialog } from "./components/InsuranceFormDialog";


const steps = [
    {
        id: 1,
        title: "Requirement Submission",
        description: "Share your insurance requirement and coverage details.",
        icon: Search,
    },
    {
        id: 2,
        title: "Product Mapping",
        description: "Suitable options are identified through licensed insurance partners.",
        icon: MessageCircle,
    },
    {
        id: 3,
        title: "Policy Issuance",
        description: "Documentation is completed and policies are issued by the insurer.",
        icon: FileSignature,
    },
    {
        id: 4,
        title: "Ongoing Support",
        description: "Assistance for renewals, endorsements, and claims coordination.",
        icon: ArrowRightLeft,
    },
];

export default function InsurancePage() {
    const [open, setOpen] = useState(false);

    return (
        <section className="mt-10 max-sm:mt-10 max-w-screen">
            <Hero />
            <Stats />
            {/* What Are Unlisted Shares */}
            <WhatAre
                title="Comprehensive Insurance Coverage, Simplified"
                description="Richharbor enables access to a wide range of insurance products. We connect you with the right life insurance company in India to secure life insurance in India or health insurance in India. Additionally, we facilitate comprehensive car insurance, business liability insurance, and home insurance policy issuance. Our role is to ensure clarity, efficiency, and compliance at every stage."
            />

            <InsuranceProducts />

            {/* Why Invest */}
            <WhyInvest
                title="Why Choose Richharbor for Insurance"
                description="Richharbor is a platform that provides access to multiple insurers through one platform, transparent product comparison, structured documentation and policy issuance, claims coordination support, and partner-led distribution with compliance focus."
                reasons={[
                    "Access to multiple insurers through one platform",
                    "Transparent product comparison",
                    "Structured documentation and policy issuance",
                    "Claims coordination support",
                    "Partner-led distribution with compliance focus"
                ]}
            />

            <HowItWorks
                title="How the Insurance Process Works"
                description="Simple, transparent, and secure process to get started."
                steps={steps}
            />







            <Disclosure
                title="Regulatory & Risk Disclosure"
                description="Richharbor operates as a facilitation and distribution platform through licensed insurance partners. Richharbor does not provide insurance advice or guarantee claim outcomes. Policy terms, coverage, and claims are subject to the respective insurer’s conditions."
            />

            {/* FAQ */}
            <Faq items={[
                {
                    question: "Can I compare insurance products on Richharbor?",
                    answer: "Yes. Options are presented through partner insurers for comparison."
                },
                {
                    question: "Does Richharbor handle claims?",
                    answer: "Claims are processed by insurers; Richharbor assists in coordination."
                },
                {
                    question: "Is my data secure?",
                    answer: "Yes. All data is handled confidentially and securely."
                }
            ]} />
            <CommonCTA
                title={<span>Looking for the Right <span className="text-primary">Insurance Coverage?</span></span>}
                description="Submit your requirement for a quick and confidential quote."
                buttonText="Request an Insurance Quote"
                buttonLink="#contact"
                onClick={() => setOpen(true)}
            />

            <InsuranceFormDialog open={open} onOpenChange={setOpen} />
        </section>
    )
}