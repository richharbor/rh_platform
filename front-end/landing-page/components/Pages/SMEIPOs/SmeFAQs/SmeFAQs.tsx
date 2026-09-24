"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";
import {motion} from 'framer-motion'

export default function SmeIpoFAQs() {
  const [openIndex, setOpenIndex] = useState(null);

  const faqs = [
    {
      question: "What is an SME IPO?",
      answer:
        "An SME IPO (Small and Medium Enterprises Initial Public Offering) is when a small or medium-sized business lists its shares on the stock exchange to raise capital from the public.",
    },
    {
      question: "Who can apply for SME IPOs?",
      answer:
        "Retail investors, high net-worth individuals (HNIs), and qualified institutional buyers (QIBs) can all participate in SME IPOs, subject to eligibility and SEBI guidelines.",
    },
    {
      question: "What is the minimum investment for an SME IPO?",
      answer:
        "The minimum investment amount varies but is usually higher than mainboard IPOs, often ranging between ₹1-2 lakhs.",
    },
    {
      question: "Are SME IPOs riskier than mainboard IPOs?",
      answer:
        "Yes, SME IPOs generally carry higher risks due to smaller business sizes, less liquidity, and market volatility. However, they also have potential for higher returns.",
    },
    {
      question: "How can I check SME IPO allotment status?",
      answer:
        "You can check the allotment status on the registrar's website or the stock exchange (NSE/BSE) after the allotment is finalized.",
    },
  ];

  const toggleFAQ = (index:any) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <section className="w-full max-w-7xl mx-auto text-white py-16 px-6 md:px-12 lg:px-20 rounded-2xl">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-10">
          <h2 className="text-2xl md:text-3xl font-bold font-batman">FAQs</h2>
          <p className="text-gray-400 mt-2">
            Find answers to the most commonly asked questions about SME IPOs.
          </p>
        </div>

        {/* FAQ Items */}
        <div className="mt-12 flex flex-col gap-6 max-w-6xl mx-auto">
          {faqs.map((faq, index) => (
            <div
              key={index}
              className="border border-gray-800 rounded-xl overflow-hidden"
            >
              <button
                className="w-full flex justify-between items-center px-6 py-4 text-left focus:outline-none"
                onClick={() => toggleFAQ(index)}
              >
                <span className="font-medium">{faq.question}</span>
                <ChevronDown
                  className={`w-5 h-5 transition-transform duration-300 ${
                    openIndex === index ? "rotate-180" : ""
                  }`}
                />
              </button>
              {openIndex === index && (
                <motion.div
                    initial={{
                      height: 0,
                      marginTop: 0,
                    }}
                    animate={{
                      height: "auto",
                      marginTop: 24,
                    }}
                    exit={{
                      height: 0,
                      marginTop: 0,
                    }}
                    className="overflow-hidden px-4 pb-2"
                  >
                    <p className="text-white/50">{faq.answer}</p>
                  </motion.div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
