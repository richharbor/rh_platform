const DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
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

/** "Mon 28 Sep · 9 am" for appointment slots. */
export function slotLabel(iso: string) {
  const d = new Date(iso);
  const h = d.getHours();
  return `${DAYS[d.getDay()]} ${d.getDate()} ${MONTHS[d.getMonth()]} · ${h % 12 || 12} ${h < 12 ? "am" : "pm"}`;
}

export const CATEGORY_LABEL = {
  applications: "Applications",
  kyc: "KYC",
  payments: "Payments",
  rewards: "Rewards",
  product_updates: "Product updates",
  promotions: "Offers",
  support: "Support",
} as const;

export const TICKET_STATE = {
  open: { label: "With RFIN", tone: "pending" },
  awaiting_you: { label: "Replied", tone: "action" },
  resolved: { label: "Resolved", tone: "success" },
} as const;
