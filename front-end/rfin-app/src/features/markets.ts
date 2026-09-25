import type { Company, ListingState } from "@/domain/models";
import type { Tone } from "@/domain/states";

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

/** Current indicative price, else the first price point. */
export const leadPrice = (c: Company) => c.prices.find((p) => p.kind === "current_indicative") ?? c.prices[0];

export const signed = (paise: number, fmt: (p: number) => string) => `${paise >= 0 ? "+" : "−"}${fmt(Math.abs(paise))}`;
