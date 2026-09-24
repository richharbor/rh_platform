"use client";

import { TrendingUp, Users, Building2, ShieldCheck } from "lucide-react";

const benefits = [
  {
    icon: TrendingUp,
    title: "High Growth Potential",
    desc: "SME IPOs are often from young, ambitious companies with rapid growth opportunities.",
  },
  {
    icon: Users,
    title: "Early Entry Advantage",
    desc: "Get access to companies before they graduate to main exchanges like NSE or BSE.",
  },
  {
    icon: Building2,
    title: "Diversification",
    desc: "Expand your portfolio by investing across new industries and sectors.",
  },
  {
    icon: ShieldCheck,
    title: "SEBI-Regulated",
    desc: "SME IPOs are monitored and regulated, ensuring investor protection and compliance.",
  },
];

export default function SmeIpoBenefits() {
  return (
    <section className="max-w-7xl mx-auto w-full text-white py-20 px-6 md:px-12 lg:px-20 rounded-2xl">
      <div className="max-w-5xl mx-auto text-center mb-12">
        <h2 className="text-3xl font-batman md:text-4xl font-bold mb-4">
          Why Invest in SME IPOs?
        </h2>
        <p className="text-lg text-gray-400">
          Discover the key benefits that make SME IPOs an attractive investment opportunity.
        </p>
      </div>

      {/* Benefits Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
        {benefits.map((item, i) => (
          <div
            key={i}
            className="bg-card border border-gray-800 rounded-xl p-6 hover:border-rich-violet hover:shadow-lg hover:shadow-rich-violet/30 transition"
          >
            <item.icon className="h-10 w-10 text-rich-violet mb-4" />
            <h3 className="text-xl font-semibold mb-2">{item.title}</h3>
            <p className="text-gray-400 text-sm">{item.desc}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
