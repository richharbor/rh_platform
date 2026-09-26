"use client";

import { Building2, FileText, Lock, ShieldCheck } from "lucide-react";
import { pad, RuleLabel, Section } from "./brand";

const TRUST = [
  { icon: FileText, title: "Transparent pricing" },
  { icon: ShieldCheck, title: "Secure off-market execution" },
  { icon: Building2, title: "Institutional network" },
  { icon: Lock, title: "End-to-end support" },
];

export default function TrustStrip() {
  return (
    <Section className="space-y-8">
      <RuleLabel>Why investors trust us</RuleLabel>
      <p className="max-w-3xl text-lg leading-relaxed text-rh-mute md:text-xl">
        Trusted by investors, founders and financial partners across India for{" "}
        <span className="font-semibold text-rh-navy">transparent execution</span> and{" "}
        <span className="font-semibold text-rh-navy">confidential deal handling</span>.
      </p>
      <div className="grid grid-cols-2 border-t border-rh-navy/15 md:grid-cols-4">
        {TRUST.map((t, i) => (
          <div key={t.title} className="flex flex-col gap-6 border-b border-rh-navy/10 py-6 pr-4 md:border-b-0 md:border-r md:px-6 md:first:pl-0 md:last:border-r-0">
            <div className="flex items-center justify-between">
              <t.icon className="size-5 text-rh-gold" strokeWidth={1.6} />
              <span className="font-mono text-[11px] text-rh-mute">{pad(i + 1)}</span>
            </div>
            <p className="text-[15px] font-semibold leading-snug">{t.title}</p>
          </div>
        ))}
      </div>
    </Section>
  );
}
