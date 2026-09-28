/** Event dictionary from the report's "Analytics Requirements". */
export const EVENTS = [
  // acquisition
  "app_install", "signup_started", "otp_completed", "onboarding_completed", "referral_source", "partner_attribution", "campaign_attribution",
  // discovery
  "explore_opened", "category_selected", "product_viewed", "company_viewed", "search_used", "filter_used", "watchlist_added", "compare_started", "eligibility_started",
  // transaction
  "application_started", "kyc_started", "kyc_completed", "document_uploaded", "payment_started", "payment_completed", "order_submitted", "order_completed", "transfer_started", "settlement_completed",
  // rewards
  "welcome_reward_issued", "points_viewed", "eligible_transaction_completed", "benefit_unlocked", "gift_card_issued", "gift_card_redeemed", "lucky_draw_progress_updated", "lucky_draw_entry_created", "referral_created", "referral_converted", "reward_reversed",
  // partner
  "partner_signup", "partner_type_selected", "partner_profile_completed", "partner_kyc_completed", "partner_activated", "lead_created", "lead_qualified", "case_created", "case_converted", "payout_generated", "payout_paid", "opportunity_created",
] as const;

export type EventName = (typeof EVENTS)[number];
