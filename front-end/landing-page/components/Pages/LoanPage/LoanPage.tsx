'use client'
import { Search, MessageCircle, FileSignature, ArrowRightLeft } from "lucide-react";
import { CTASection } from "./compnenets/CTA_Section";
import { EMICalculator } from "./compnenets/EMI_Calculator";
import { FeaturesSection } from "./compnenets/featureSection";
import { HeroSection } from "./compnenets/HeroSection";
import { ServicesSection } from "./compnenets/ServicesSection";
import { ProductsSection } from "./compnenets/ProductsSection";
import { HowItWorksSection } from "./compnenets/HowItWorks";
import { StatsSection } from "./compnenets/StatsSection";
import { TestimonialsSection } from "./compnenets/Testimonial";
import WhatAre from "@/components/Common/components/WhatAre";
import WhyInvest from "@/components/Common/components/WhyInvest";
import HowItWorks from "@/components/Common/components/HowItWorks";
import Disclosure from "@/components/Common/components/Disclosure";
import Faq from "../Home/Faq/Faq";
import CommonCTA from "@/components/Common/components/CommonCTA";
import { useState } from "react";
import { LoanFormDialog } from "./compnenets/LoanFormDialog";


const steps = [
    {
        id: 1,
        title: "Requirement Submission",
        description: "Share your loan requirement and basic eligibility details.",
        icon: Search,
    },
    {
        id: 2,
        title: "Lender Mapping & Evaluation",
        description: "Suitable lenders are identified based on product and profile fit.",
        icon: MessageCircle,
    },
    {
        id: 3,
        title: "Documentation & Approval",
        description: "Application processing, documentation, and credit evaluation.",
        icon: FileSignature,
    },
    {
        id: 4,
        title: "Disbursement",
        description: "Loan disbursal directly from lender to borrower.",
        icon: ArrowRightLeft,
    },
];

export default function LoanPage() {
    const [open, setOpen] = useState(false);

    return (
        <section className="mt-10 max-sm:mt-10 max-w-screen">
            <HeroSection />
            <WhatAre
                title="Financing Solutions Across Every Stage"
                description="Richharbor facilitates access to a broad range of business and personal loans. Whether you need working capital loans for your enterprise or a home loan India or personal loan India for individual needs, we connect you with banks, NBFCs, and institutional lenders. We focus on requirement mapping, documentation coordination, and execution support — not advisory."
            />
            <ServicesSection />
            <ProductsSection />
            {/* <FeaturesSection /> */}
            <WhyInvest
                title="Why Choose Richharbor for Loans"
                description="Richharbor simplifies the borrowing journey by providing a unified platform to access diverse lending solutions, ensuring speed, transparency, and optimal financing terms for every need."
                reasons={[
                    "Access to multiple lenders through one platform",
                    "Faster evaluation and execution",
                    "Transparent process and documentation",
                    "Product-agnostic lender matching",
                    "Partner-friendly payout model"
                ]}
            />
            <EMICalculator />
            <HowItWorks
                title="How the Loan Process Works"
                description="Simple, transparent, and secure process to get started."
                steps={steps}
            />
            <StatsSection />

            <Faq items={[
                {
                    question: "Can Richharbor guarantee loan approval?",
                    answer: "No. Approvals are subject to lender credit policies."
                },
                {
                    question: "How long does loan processing take?",
                    answer: "Timelines vary by product and lender."
                },
                {
                    question: "Does Richharbor charge borrowers?",
                    answer: "Charges, if any, are disclosed transparently."
                }
            ]} />

            <CommonCTA
                title={<span>Need Financing for <span className="text-primary">Personal or Business Needs?</span></span>}
                description="Submit your requirement for a structured loan evaluation."
                buttonText="Apply for a Loan"
                buttonLink="#contact"
                onClick={() => setOpen(true)}
            />

            <Disclosure
                title="Regulatory & Risk Disclosure"
                description="Loan approvals, interest rates, and terms are solely determined by the respective lender. Richharbor does not guarantee approvals, rates, or timelines and does not act as a credit advisor."
            />

            <LoanFormDialog open={open} onOpenChange={setOpen} />

        </section>
    )
}