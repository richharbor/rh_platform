"use client";

import Tag from "@/components/ui/Tag";
import { AnimatePresence, motion } from "framer-motion";
import { Plus } from "lucide-react";
import { useState } from "react";
import { twMerge } from "tailwind-merge";

const faqs = [
  {
    question: "What makes Rich Harbor different?",
    answer:
      "Rich Harbor unifies trading, research, compliance, and AI into one platform—bringing transparency, liquidity, and intelligence together.",
  },
  {
    question: "How do I buy Pre-IPO shares in India?",
    answer:
      "Pre-IPO shares are typically sold through private placements, which are made available to select investors through brokers or investment banks. Investors can buy Pre IPO shares online and offline through www.richharbor.com ",
  },
  {
    question: "What are Pre-IPO Shares",
    answer: "Pre-IPO shares are stocks of a company that are available for purchase before the company goes public and lists its shares on a stock exchange. Companies may offer Pre-IPO shares to investors, such as venture capitalists, angel investors, and high net worth individuals, in order to raise capital before going pulic. Investing in Pre-IPO shares can offer high potential returns, but also comes with high risk."
  },
  {
    question: "How are IPO shares taxed?",
    answer: "In India, IPO shares are subject to capital gains tax. Capital gains tax is the tax levied on the profit that an individual or company makes by selling an asset. The tax rate depends on whether the shares are sold within or after a certain period, and whether the profit is short-term or long-term."
  },
  {
    question: "What Happens to Pre Ipo Shares After IPO?",
    answer: "After an IPO, pre-IPO shares become tradable on the stock exchange. The price of the shares is determined by market forces and may fluctuate based on various factors, such as company performance and market conditions. To know the share price contact us"
  },
  {
    question: "What is the benefit of pre-IPO?",
    answer: "The benefit of pre-IPO is the opportunity for investors to buy shares of a company before it goes public, potentially resulting in higher returns when the company goes public."
  },
  {
    question: "When can I sell my Pre-IPO shares?",
    answer: "Pre-IPO shares can only be sold after the company goes public, which means after the IPO (Initial Public Offering) is completed and the shares are listed on the stock exchange."
  },
  {
    question: "Who can Invest in Pre-IPO shares in India?",
    answer: "Pre-IPO shares can be purchased by institutional investors, high net worth individuals, and certain qualified retail investors. But now retail investors can also invest easily in Pre IPO-Shares online through Richharbor.com"
  },
  {
    question: "What is the minimum investment for Pre-IPO shares in India?",
    answer: "The minimum investment for Pre-IPO shares in India can vary depending on the company and minimum number of shares, but it is typically a substantial amount and may range from Rs. 10 thousand to Rs. 100 crore."
  },
  {
    question: "What are the risks associated with investing in Pre-IPO shares in India?",
    answer: "Investing in pre-IPO shares is considered a high-risk, high-reward proposition. The risks include the possibility of the company not going public, a delay in the IPO, or a drop in the stock price after the IPO."
  },
  {
    question: "What are the advantages of investing in Pre-IPO shares in India?",
    answer: "The advantages of investing in Pre-IPO shares include the potential for high returns, access to investment opportunities that are not available to the general public, and the ability to invest in promising companies at a lower valuation than the IPO price."
  }
];

interface FaqItem {
  question: string;
  answer: string;
}

interface FaqsProps {
  items?: FaqItem[];
}

export default function Faqs({ items }: FaqsProps) {
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const displayFaqs = items || faqs;

  return (
    <section id="faq" className="py-20 max-md:py-10 px-3 ">
      <div className="container mx-auto">
        <h2 className="text-5xl max-md:text-4xl max-sm:text-3xl font-medium font-batman text-center max-w-3xl mx-auto">
          Questions? We&apos;ve got{" "}
          <span className="text-[#FFFFFF]">answers</span>
        </h2>

        <div className="mt-12 flex flex-col gap-6 max-w-6xl mx-auto">
          {displayFaqs.map((faq, faqIndex) => (
            <div
              key={faq.question}
              onClick={() => {
                if (selectedIndex === faqIndex) {
                  setSelectedIndex(-1)
                } else {
                  setSelectedIndex(faqIndex)
                }
              }}
              className="bg-neutral-900 z-10 rounded-2xl border border-white/10 p-6 "
            >
              <div className="flex justify-between items-start">
                <h3 className="font-medium m-0">{faq.question}</h3>
                <Plus
                  size={30}
                  className={twMerge(
                    "feather feather-plus text-[#FFFFFF] flex-shrink-0 transition duration-300",
                    selectedIndex === faqIndex && "rotate-45"
                  )}
                />
              </div>

              <AnimatePresence>
                {selectedIndex === faqIndex && (
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
                    className="overflow-hidden"
                  >
                    <p className="text-white/50">{faq.answer}</p>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
