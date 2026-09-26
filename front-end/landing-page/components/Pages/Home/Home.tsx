"use client";

import { ArrowDown, ArrowUpRight } from "lucide-react";
import Link from "next/link";
import { useQueryWidgetStore } from "@/store/queryWidgetStore";
import Faq from "./Faq/Faq";
import TrustStrip from "./TrustStrip";
import CoreOfferings from "./CoreOfferings";
import HowItWorks from "./HowItWorks";
import WhyRichHarbor from "./WhyRichHarbor";
import WhoWeServe from "./WhoWeServe";
import FinalCTA from "./FinalCTA";
import { Testimonials2 } from "./Testimonials2/Testimonials2";
import WhatsAppBanner from "./WhatsAppBanner/WhatsAppBanner";
import { accentAt, buttonClass, Eyebrow, Headline, pad, Section } from "./brand";

const faq = [
  {
    question: "Is investing in unlisted shares legal in India?",
    answer: "Yes. Off-market transfer of unlisted shares is legal when executed with proper documentation and compliance."
  },
  {
    question: "Does Richharbor guarantee returns or IPO listing?",
    answer: "No. Richharbor does not assure returns or listing outcomes. All investments carry inherent risk."
  },
  {
    question: "Can retail investors use Richharbor?",
    answer: "Yes. Access depends on product suitability and regulatory eligibility."
  },
  {
    question: "Does Richharbor provide investment advice?",
    answer: "No. Richharbor operates as an execution and facilitation platform, not an investment advisor."
  },
  {
    question: "Is my information kept confidential?",
    answer: "Yes. All engagements are handled with strict confidentiality protocols"
  }
];

/** The four doors into the platform, shown as tiles in the hero. */
const DOORS = [
  { label: "Invest", detail: "Unlisted & pre-IPO shares", href: "/unlisted-shares" },
  { label: "Trade", detail: "Bulk deals in listed shares", href: "/bulk-deals" },
  { label: "Borrow", detail: "Retail, SME & corporate credit", href: "/loans" },
  { label: "Protect", detail: "Life, health, motor, business", href: "/insurance" },
];

export default function HomePage() {
  const { open: openQueryWidget } = useQueryWidgetStore();

  return (
    <div className="flex w-full flex-col pt-28 sm:pt-32">
      <main className="flex flex-1 flex-col gap-24 pb-24 text-rh-navy md:gap-32">
        {/* Hero */}
        <Section className="grid items-center gap-12 lg:grid-cols-[minmax(0,1.15fr)_minmax(0,0.85fr)]">
          <div className="space-y-7">
            <Eyebrow>Unlisted shares · Private markets · Credit · Insurance</Eyebrow>
            <Headline as="h1" className="text-[44px] sm:text-6xl lg:text-7xl xl:text-[84px]">
              Access unlisted shares, capital &amp; financial solutions
              <span className="block text-rh-gold">— transparently.</span>
            </Headline>
            <p className="max-w-xl text-base leading-relaxed text-rh-mute sm:text-lg">
              Richharbor is a unified financial execution platform for unlisted shares, private markets, loans,
              insurance and structured credit — backed by institutional processes, compliance and secure execution.
            </p>
            <div className="flex flex-col gap-3 sm:flex-row">
              <button
                type="button"
                className={buttonClass("navy")}
                onClick={() => document.getElementById("products")?.scrollIntoView({ behavior: "smooth" })}
              >
                Explore opportunities <ArrowDown className="size-4" />
              </button>
              <button type="button" className={buttonClass("outline")} onClick={openQueryWidget}>
                Submit your requirement
              </button>
            </div>
            <p className="font-mono text-[11px] uppercase tracking-[0.16em] text-rh-mute">
              Execution &amp; facilitation · not investment advice
            </p>
          </div>

          <div className="grid grid-cols-2 gap-3 sm:gap-4">
            {DOORS.map((d, i) => (
              <Link
                key={d.href}
                href={d.href}
                className={`group flex min-h-40 flex-col justify-between rounded-3xl p-5 transition-transform hover:-translate-y-1 sm:min-h-48 sm:p-6 ${accentAt(i).tile}`}
              >
                <div className="flex items-start justify-between">
                  <span className="font-mono text-sm">{pad(i + 1)}</span>
                  <ArrowUpRight className="size-5 opacity-60 transition-opacity group-hover:opacity-100" />
                </div>
                <div>
                  <p className="font-display text-4xl leading-none sm:text-5xl">{d.label}</p>
                  <p className="mt-2 text-[13px] leading-snug opacity-80">{d.detail}</p>
                </div>
              </Link>
            ))}
          </div>
        </Section>

        <TrustStrip />
        <WhatsAppBanner />
        <CoreOfferings />
        <HowItWorks />
        <WhyRichHarbor />
        <WhoWeServe />
        <Testimonials2 />
        <Faq items={faq} tone="light" />
        <FinalCTA />
      </main>
    </div>
  );
}
