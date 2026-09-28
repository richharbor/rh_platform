/**
 * Lifecycle state machines (report: "Core State Model").
 *
 * Every journey maps onto one generic lifecycle so the UI can render any status
 * with the same chip tone and a single next action. Journey-specific states keep
 * their own names but declare which generic phase they belong to.
 */

export type Lifecycle =
  | "draft"
  | "submitted"
  | "processing"
  | "action_required"
  | "completed"
  | "rejected"
  | "cancelled"
  | "expired"
  | "failed"
  | "reversed";

export type Tone = "neutral" | "info" | "pending" | "action" | "success" | "danger";

export const LIFECYCLE_TONE: Record<Lifecycle, Tone> = {
  draft: "neutral",
  submitted: "info",
  processing: "pending",
  action_required: "action",
  completed: "success",
  rejected: "danger",
  cancelled: "neutral",
  expired: "neutral",
  failed: "danger",
  reversed: "danger",
};

export const TERMINAL: ReadonlySet<Lifecycle> = new Set([
  "completed",
  "rejected",
  "cancelled",
  "expired",
  "failed",
  "reversed",
]);

type Machine<S extends string> = {
  label: Record<S, string>;
  phase: Record<NoInfer<S>, Lifecycle>;
  next: Partial<Record<NoInfer<S>, readonly NoInfer<S>[]>>;
};

function machine<S extends string>(m: Machine<S>) {
  return {
    ...m,
    states: Object.keys(m.label) as S[],
    tone: (s: S): Tone => LIFECYCLE_TONE[m.phase[s]],
    canTransition: (from: S, to: S) => (m.next[from] ?? []).includes(to),
    isTerminal: (s: S) => TERMINAL.has(m.phase[s]),
  };
}

export const KYC = machine({
  label: {
    not_started: "Not started",
    in_progress: "In progress",
    action_required: "Action required",
    verified: "Verified",
    failed: "Failed",
    expired: "Expired",
  },
  phase: {
    not_started: "draft",
    in_progress: "processing",
    action_required: "action_required",
    verified: "completed",
    failed: "failed",
    expired: "expired",
  },
  next: {
    not_started: ["in_progress"],
    in_progress: ["action_required", "verified", "failed"],
    action_required: ["in_progress"],
    verified: ["expired"],
    failed: ["in_progress"],
    expired: ["in_progress"],
  },
});
export type KycState = keyof typeof KYC.label;

export const PAYMENT = machine({
  label: { initiated: "Initiated", pending: "Pending", success: "Successful", failed: "Failed", cancelled: "Cancelled", reversed: "Refunded" },
  phase: { initiated: "submitted", pending: "processing", success: "completed", failed: "failed", cancelled: "cancelled", reversed: "reversed" },
  next: { initiated: ["pending", "cancelled"], pending: ["success", "failed"], success: ["reversed"] },
});
export type PaymentState = keyof typeof PAYMENT.label;

export const ORDER = machine({
  label: {
    draft: "Draft",
    submitted: "Submitted",
    processing: "Processing",
    action_required: "Action required",
    fulfilled: "Completed",
    rejected: "Rejected",
    cancelled: "Cancelled",
    expired: "Expired",
  },
  phase: {
    draft: "draft",
    submitted: "submitted",
    processing: "processing",
    action_required: "action_required",
    fulfilled: "completed",
    rejected: "rejected",
    cancelled: "cancelled",
    expired: "expired",
  },
  next: {
    draft: ["submitted", "cancelled", "expired"],
    submitted: ["processing", "rejected", "cancelled"],
    processing: ["action_required", "fulfilled", "rejected"],
    action_required: ["processing", "cancelled", "expired"],
  },
});
export type OrderState = keyof typeof ORDER.label;

export const REWARD = machine({
  label: { issued: "Issued", locked: "Locked", eligible: "Eligible", converted: "Converted", expired: "Expired", reversed: "Reversed" },
  phase: { issued: "submitted", locked: "processing", eligible: "action_required", converted: "completed", expired: "expired", reversed: "reversed" },
  next: { issued: ["locked", "reversed"], locked: ["eligible", "expired", "reversed"], eligible: ["converted", "expired", "reversed"] },
});
export type RewardState = keyof typeof REWARD.label;

export const GIFT_CARD = machine({
  label: { processing: "Processing", ready: "Ready", partially_used: "Partially used", used: "Used", expired: "Expired" },
  phase: { processing: "processing", ready: "action_required", partially_used: "action_required", used: "completed", expired: "expired" },
  next: { processing: ["ready"], ready: ["partially_used", "used", "expired"], partially_used: ["used", "expired"] },
});
export type GiftCardState = keyof typeof GIFT_CARD.label;

export const LUCKY_DRAW = machine({
  label: { not_eligible: "Not eligible", progress: "In progress", eligible: "Eligible", entry_confirmed: "Entry confirmed", result: "Result out" },
  phase: { not_eligible: "draft", progress: "processing", eligible: "action_required", entry_confirmed: "submitted", result: "completed" },
  next: { not_eligible: ["progress"], progress: ["eligible"], eligible: ["entry_confirmed"], entry_confirmed: ["result"] },
});
export type LuckyDrawState = keyof typeof LUCKY_DRAW.label;

export const LEAD = machine({
  label: { new: "New", contacted: "Contacted", qualified: "Qualified", processing: "Processing", converted: "Converted", lost: "Lost" },
  phase: { new: "draft", contacted: "submitted", qualified: "action_required", processing: "processing", converted: "completed", lost: "cancelled" },
  next: {
    new: ["contacted", "lost"],
    contacted: ["qualified", "lost"],
    qualified: ["processing", "lost"],
    processing: ["converted", "lost"],
  },
});
export type LeadState = keyof typeof LEAD.label;

export const REFERRAL = machine({
  label: { pending: "Pending", approved: "Approved", paid: "Paid", rejected: "Not eligible" },
  phase: { pending: "processing", approved: "action_required", paid: "completed", rejected: "rejected" },
  next: { pending: ["approved", "rejected"], approved: ["paid"] },
});
export type ReferralState = keyof typeof REFERRAL.label;

export const PAYOUT = machine({
  label: { pending: "Pending", available: "Available", paid: "Paid", on_hold: "On hold" },
  phase: { pending: "processing", available: "submitted", paid: "completed", on_hold: "action_required" },
  next: { pending: ["available", "on_hold"], on_hold: ["available"], available: ["paid"] },
});
export type PayoutState = keyof typeof PAYOUT.label;
