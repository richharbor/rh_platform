"use client";

import { FileText, UserCheck, CreditCard, CheckCircle2 } from "lucide-react";

const steps = [
  {
    icon: FileText,
    title: "Step 1: Open a Demat Account",
    desc: "Ensure you have a valid Demat and trading account with a registered broker.",
  },
  {
    icon: UserCheck,
    title: "Step 2: Complete KYC",
    desc: "Verify your PAN, Aadhaar, and bank details to be eligible for IPO applications.",
  },
  {
    icon: CreditCard,
    title: "Step 3: Apply via ASBA/UPI",
    desc: "Submit your IPO application through net banking (ASBA) or UPI mandate.",
  },
  {
    icon: CheckCircle2,
    title: "Step 4: Allotment & Listing",
    desc: "Wait for allotment. If successful, shares will be credited directly to your Demat account.",
  },
];

export default function SmeIpoHowToApply() {
  return (
    
    <section className="w-full max-w-7xl mx-auto text-white py-20 px-6 md:px-12 lg:px-20 rounded-2xl">
      <div className="max-w-5xl mx-auto text-center mb-12">
        <h2 className="text-3xl md:text-4xl font-bold mb-4 font-batman">
          How to Apply for SME IPOs?
        </h2>
        <p className="text-lg text-gray-400">
          Follow these simple steps to participate in SME IPOs with ease.
        </p>
      </div>

      {/* Timeline */}
      <div className="relative h-full w-full overflow-hidden">
                <img
                    src='https://aicdn.picsart.com/98139f24-96f4-492a-a7e9-46a4df7ba81b.png'
                    alt="Background"
                    className="absolute max-sm:size-[18rem] top-1/2 -translate-y-1/2 max-md:hidden right-10 size-[25rem] object-cover"
                />
                <div className="absolute inset-0 bg-transparent "></div>
      <div className="relative border-l border-gray-700 ml-4 space-y-10">
        {steps.map((step, i) => (
          <div key={i} className="ml-8">
            <div className="absolute -left-4 flex items-center justify-center h-10 w-10 rounded-full bg-rich-violet text-white">
              <step.icon className="h-5 w-5" />
            </div>
            <h3 className="text-xl font-semibold mb-2">{step.title}</h3>
            <p className="text-gray-400 text-sm">{step.desc}</p>
          </div>
        ))}
      </div>
      </div>
    </section>
    
  );
}
