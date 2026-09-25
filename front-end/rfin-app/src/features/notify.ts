import type { NotificationItem } from "@/domain/models";

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

/** "Just now", "12 min ago", "3 h ago", "25 Sep". */
export function ago(iso: string) {
  const s = (Date.now() - new Date(iso).getTime()) / 1000;
  if (s < 60) return "Just now";
  if (s < 3600) return `${Math.floor(s / 60)} min ago`;
  if (s < 86400) return `${Math.floor(s / 3600)} h ago`;
  const d = new Date(iso);
  return `${d.getDate()} ${MONTHS[d.getMonth()]}`;
}

export const CATEGORY_LABEL: Record<NotificationItem["category"], string> = {
  applications: "Applications",
  kyc: "KYC",
  payments: "Payments",
  rewards: "Rewards",
  product_updates: "Product updates",
  promotions: "Offers",
  support: "Support",
};
