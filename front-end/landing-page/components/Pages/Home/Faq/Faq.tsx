"use client";

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
  /** "light" (default) on paper; "dark" for use inside a navy panel. */
  tone?: "light" | "dark";
}

export default function Faqs({ items, tone = "light" }: FaqsProps) {
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const displayFaqs = items || faqs;
  const light = tone === "light";

  return (
    <section id="faq" className={twMerge("w-full scroll-mt-28 py-20 max-md:py-10 px-3", light && "mx-auto max-w-7xl px-0 py-0 max-md:py-0 md:px-6")}>
      <div className={twMerge("container mx-auto grid gap-10 lg:grid-cols-[minmax(0,0.8fr)_minmax(0,1.2fr)]", light && "max-w-none")}>
        <div className="space-y-4">
          <p className={twMerge("font-mono text-[11px] uppercase tracking-[0.2em]", light ? "text-rh-gold" : "text-rh-champagne")}>FAQ</p>
          <h2 className={twMerge("font-display text-5xl leading-[0.98] tracking-tight max-md:text-4xl", light ? "text-rh-navy" : "text-rh-paper")}>
            Questions? We&apos;ve got <span className={light ? "text-rh-gold" : "text-rh-champagne"}>answers.</span>
          </h2>
        </div>

        <div className={twMerge("flex flex-col border-t", light ? "border-rh-navy/15" : "border-rh-paper/15")}>
          {displayFaqs.map((faq, faqIndex) => {
            const open = selectedIndex === faqIndex;
            return (
              <div key={faq.question} className={twMerge("border-b", light ? "border-rh-navy/10" : "border-rh-paper/10")}>
                <button
                  type="button"
                  aria-expanded={open}
                  onClick={() => setSelectedIndex(open ? -1 : faqIndex)}
                  className={twMerge("flex w-full items-start justify-between gap-6 py-6 text-left text-lg font-semibold", light ? "text-rh-navy" : "text-rh-paper")}
                >
                  {faq.question}
                  <Plus
                    size={24}
                    className={twMerge("mt-0.5 shrink-0 transition duration-300", light ? "text-rh-gold" : "text-rh-champagne", open && "rotate-45")}
                  />
                </button>

                <AnimatePresence initial={false}>
                  {open && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="overflow-hidden"
                    >
                      <p className={twMerge("max-w-2xl pb-6 leading-relaxed", light ? "text-rh-mute" : "text-rh-paper/60")}>{faq.answer}</p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
