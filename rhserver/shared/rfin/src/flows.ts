import type { KycItem, Product, ProductCategory } from "./models";
import FLOWS from "./flows.json";

/**
 * Review → Consent → KYC → Order/Application → Pay → Fulfil → Track (report #31).
 * Per-category rules live in flows.json so rhserver enforces the same KYC
 * requirements the clients show.
 */
export type FlowStep = "review" | "consent" | "kyc" | "pay" | "submit";

export type Flow = {
  steps: FlowStep[];
  kycRequired: KycItem["id"][];
  consents: string[];
  kind: "application" | "pm_buy";
  cta: string;
};

type FlowConfig = { steps: FlowStep[]; kycRequired: string[]; extraConsent: string; kind: Flow["kind"]; cta: string };

export function flowFor(p: Product): Flow {
  const c = (FLOWS as Record<ProductCategory, FlowConfig>)[p.category];
  return {
    steps: c.steps,
    kycRequired: c.kycRequired,
    kind: c.kind,
    cta: c.cta,
    consents: ["I've read the key features, costs and risks", `RFIN may share my details with ${p.provider} to process this`, c.extraConsent],
  };
}

export const STEP_LABEL: Record<FlowStep, string> = {
  review: "Review",
  consent: "Consent",
  kyc: "KYC",
  pay: "Pay",
  submit: "Submit",
};

/** First-premium / minimum amounts from the catalogue copy, in paise. */
export function defaultAmount(p: Product): number {
  if (p.minAmount) return p.minAmount;
  const m = p.costs[0]?.value.match(/₹([\d,]+)/);
  return m ? Number(m[1].replace(/,/g, "")) * 100 : 0;
}
