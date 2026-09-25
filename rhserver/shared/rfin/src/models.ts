import type {
  GiftCardState,
  KycState,
  LeadState,
  LuckyDrawState,
  OrderState,
  PaymentState,
  PayoutState,
  ReferralState,
  RewardState,
} from "./states";

/** Money is always integer paise to avoid float drift. */
export type Paise = number;

export type Role = "buyer" | "seller" | "partner";
export type Mode = "investor" | "partner";

export type Need =
  | "grow_wealth"
  | "protect_family"
  | "need_funding"
  | "invest_surplus"
  | "sell_asset"
  | "save_plan"
  | "find_opportunity"
  | "refer_someone";

/** One person, one RFIN ID, many roles (report #2, #3). */
export type RfinUser = {
  rfinId: string;
  phone: string;
  name?: string;
  email?: string;
  city?: string;
  roles: Role[];
  partnerId?: string;
  needs: Need[];
  kyc: KycState;
  profileCompleteness: number; // 0–100
  /** false until onboarding (profile + needs) is finished */
  onboarded: boolean;
};

export type ProductCategory = "insurance" | "loans" | "investments" | "private_markets";

export type Product = {
  id: string;
  category: ProductCategory;
  name: string;
  provider: string;
  tagline: string;
  whoFor: string;
  requirements: string[];
  costs: { label: string; value: string }[];
  risks: string[];
  whatNext: string[];
  minAmount?: Paise;
  transactable: boolean;
};

/** Report #91: these are four different kinds of number — never merge them. */
export type PriceKind = "current_indicative" | "latest_funding_round" | "secondary_trade" | "indicative_mark";

export type PricePoint = { kind: PriceKind; perShare: Paise; asOf: string; source: string };

export type Company = {
  id: string;
  name: string;
  sector: string;
  themes: string[];
  summary: string;
  prices: PricePoint[];
  minLot: number;
  available: boolean;
  isNewSupply: boolean;
  risks: string[];
  transferRestrictions: string[];
};

export type TimelineStep = { at: string; label: string; done: boolean; actor: "you" | "rfin" | "provider"; failed?: boolean };

export type Order = {
  id: string;
  kind: "application" | "pm_buy" | "pm_sell";
  subjectId: string;
  title: string;
  state: OrderState;
  payment?: PaymentState;
  amount: Paise;
  createdAt: string;
  timeline: TimelineStep[];
  /** set when state is action_required — the one CTA to show (report #39) */
  action?: { label: string; route: string; reason: string };
};

export type KycItem = {
  id: string;
  label: string;
  why: string;
  state: KycState;
  rejectionReason?: string;
};

// ---- Ledgers: kept separate on purpose (report #53, #88). ----

type LedgerBase = { id: string; at: string; description: string; ref?: string };

export type PointEntry = LedgerBase & { ledger: "points"; points: number; state: RewardState };
export type BenefitEntry = LedgerBase & {
  ledger: "benefits";
  kind: "gift_card" | "loaded_card";
  value: Paise;
  state: GiftCardState;
  issuer: string;
  expiresAt?: string;
};
export type CommissionEntry = LedgerBase & { ledger: "commission"; amount: Paise; state: PayoutState; caseId?: string };
export type ReferralEntry = LedgerBase & { ledger: "referral"; amount: Paise; state: ReferralState; referee: string };

export type LuckyDraw = {
  id: string;
  name: string;
  threshold: number;
  progress: number;
  state: LuckyDrawState;
  drawDate: string;
  prize: string;
  entryId?: string;
  terms: string;
};

export type Lead = {
  id: string;
  client: string;
  need: Need;
  productId?: string;
  state: LeadState;
  potential: Paise;
  nextAction: string;
  updatedAt: string;
};

export type Eligibility = {
  productId: string;
  /** indicative = RFIN's estimate; confirmed = provider-verified (report #27) */
  kind: "indicative" | "confirmed";
  eligible: boolean;
  maxAmount?: Paise;
  rate?: string;
  reasons: string[];
};

export type BankAccount = {
  id: string;
  bank: string;
  last4: string;
  ifsc: string;
  holder: string;
  state: "verifying" | "verified" | "failed";
  primary: boolean;
  failureReason?: string;
};

export type ConsentRecord = { id: string; at: string; subject: string; items: string[] };
