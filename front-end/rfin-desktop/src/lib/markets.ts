import { longDate, type Company, type ListingState, type Tone } from "@rfin/shared";

export const LISTING: Record<ListingState, { label: string; tone: Tone }> = {
  verifying: { label: "Verifying holding", tone: "info" },
  listed: { label: "Listed", tone: "pending" },
  matched: { label: "Buyer matched", tone: "action" },
  approvals: { label: "Approvals", tone: "pending" },
  transferring: { label: "Transferring", tone: "pending" },
  paid: { label: "Paid", tone: "success" },
  cancelled: { label: "Cancelled", tone: "neutral" },
};
export const LISTING_STEPS: ListingState[] = ["verifying", "listed", "matched", "approvals", "transferring", "paid"];
export const leadPrice = (c: Company) => c.prices.find((p) => p.kind === "current_indicative") ?? c.prices[0];
export const signed = (paise: number, fmt: (p: number) => string) => `${paise >= 0 ? "+" : "−"}${fmt(Math.abs(paise))}`;
export const shortDate = longDate;
