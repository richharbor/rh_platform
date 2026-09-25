import type { SupportTicket } from "@/domain/models";
import type { Tone } from "@/domain/states";

export const TICKET_STATE: Record<SupportTicket["state"], { label: string; tone: Tone }> = {
  open: { label: "With RFIN", tone: "pending" },
  awaiting_you: { label: "Replied", tone: "action" },
  resolved: { label: "Resolved", tone: "success" },
};

const DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

/** "Mon 28 Sep · 9 am" for appointment slots. */
export function slotLabel(iso: string) {
  const d = new Date(iso);
  const h = d.getHours();
  return `${DAYS[d.getDay()]} ${d.getDate()} ${MONTHS[d.getMonth()]} · ${h % 12 || 12} ${h < 12 ? "am" : "pm"}`;
}
