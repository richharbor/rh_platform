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
  /** personal code others sign up with */
  referralCode?: string;
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
  founded?: number;
  hq?: string;
  business?: { model: string; segments: string[]; moat: string };
  /** ₹ crore */
  financials: { year: string; revenue: number; profit: number; margin: number }[];
  peers: { name: string; listed: boolean; metric: string }[];
  documents: { title: string; kind: string }[];
  /** indicative bid / ask per share (paise), only where the desk has them */
  bidAsk?: { bid: Paise; ask: Paise };
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
  action?: OrderAction;
  /** private-market buys */
  quantity?: number;
  unitPrice?: Paise;
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
  results?: { drawnAt: string; winners: { entryId: string; prize: string }[] };
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

/** The single next step on an order (report #39). `schedule` offers slots to pick from. */
export type OrderAction =
  | { type: "schedule"; label: string; route: string; reason: string; options: string[] }
  | { type: "retry_payment"; label: string; route: string; reason: string }
  | { type?: undefined; label: string; route: string; reason: string };

export type DocKind = "policy" | "receipt" | "sanction" | "statement" | "kyc";
export type DocState = "available" | "in_review" | "requested" | "expired";

export type DocumentItem = { id: string; kind: DocKind; title: string; state: DocState; orderId?: string; kycItem?: string; fileName?: string; at: string };

export type NotificationCategory = "applications" | "kyc" | "payments" | "rewards" | "product_updates" | "promotions" | "support";

export type NotificationItem = {
  id: number;
  category: NotificationCategory;
  title: string;
  body: string;
  route?: string;
  tone: "success" | "pending" | "info" | "action" | "danger" | "neutral";
  read: boolean;
  at: string;
};

export type NotificationPrefs = {
  channels: { push: boolean; email: boolean; sms: boolean; whatsapp: boolean };
  categories: Record<Exclude<NotificationCategory, "support">, boolean>;
  /** categories that can't be muted — money and verification messages */
  locked: NotificationCategory[];
};

export type Faq = { id: string; q: string; a: string };

export type SupportContext = "order" | "kyc" | "product" | "company" | "listing" | "general";

export type SupportTicket = {
  id: string;
  subject: string;
  contextType: SupportContext;
  contextId?: string;
  state: "open" | "awaiting_you" | "resolved";
  messages: { at: string; from: "you" | "rfin"; author?: string; text: string }[];
  updatedAt: string;
  /** true while the advisor's reply is on its way */
  advisorTyping: boolean;
};

// ---- step 5: private markets ----

export type PmQuote = { unitPrice: Paise; quantity: number; consideration: Paise; platformFee: Paise; stampDuty: Paise; total: Paise; minLot: number; settlement: string };

export type PriceDiscovery = { prices: PricePoint[]; bidAsk?: { bid: Paise; ask: Paise }; buyerInterest: number; transferRestrictions: string[]; note: string };

/** Indicative gain is never presented as realised (report #94). */
export type Holding = {
  companyId: string;
  name: string;
  sector: string;
  quantity: number;
  /** committed to an open sell listing */
  reserved: number;
  avgCost: Paise;
  costBasis: Paise;
  indicativePrice: Paise;
  indicativeValue: Paise;
  indicativeGain: Paise;
  realizedGain: Paise;
  priceKind?: PriceKind;
};

export type Portfolio = {
  holdings: Holding[];
  totals: { indicativeValue: Paise; costBasis: Paise; indicativeGain: Paise; realizedGain: Paise };
  sectors: { sector: string; pct: number }[];
};

export type ListingState = "verifying" | "listed" | "matched" | "approvals" | "transferring" | "paid" | "cancelled";

export type SellListing = {
  id: string;
  companyId: string;
  companyName?: string;
  quantity: number;
  ask: Paise;
  state: ListingState;
  timeline: TimelineStep[];
  buyerInterest: number;
  matchPrice?: Paise;
  proceeds?: Paise;
  createdAt: string;
};

// ---- step 6: rewards ----

export type Tier = { id: string; name: string; minPoints: number; perks: string[] };

export type RewardsSummary = {
  points: { available: number; locked: number; lifetime: number };
  tier: Tier & { next: (Tier & { pointsToGo: number }) | null };
  tiers: Tier[];
  benefits: { available: number; pending: number };
  referral: { code?: string; reward: Paise; rule: string };
  note: string;
};

export type Benefit = {
  id: number;
  ledger: "benefits";
  kind: "gift_card" | "loaded_card";
  title: string;
  issuer: string;
  value: Paise;
  state: GiftCardState;
  /** only revealed once ready */
  code?: string;
  terms: string;
  source: string;
  sourceRef?: string;
  at: string;
  expiresAt?: string;
  redeemedAt?: string;
};

export type ReferralItem = { id: string; need: Need; inviteeName: string; state: ReferralState; reward: Paise; joined: boolean; at: string; updatedAt: string };

export type ReferralShare = { referral: ReferralItem; share: { code: string; link: string; message: string } };

// ---- step 7: partner ----

export type CapabilityLevel = "none" | "interested" | "experienced";

/** Partner 360 (report #72): identity, capability, network, intent, compliance, growth. */
export type PartnerProfile = {
  state: "draft" | "verifying" | "active" | "rejected";
  step: number;
  partnerType?: string;
  basic: { organisation?: string; designation?: string; experienceYears?: number; city?: string; state?: string };
  professional: { previousOrgs?: string; certifications?: string[]; businessModel?: string; teamSize?: string; profileLink?: string };
  capabilities: Record<string, CapabilityLevel>;
  network: { clientBase?: string; geographies?: string[]; segments?: string[] };
  business: { annualBusiness?: string; monthlyLeads?: number; avgTicket?: number };
  compliance: { pan?: string; gstin?: string; licence?: string; declarations?: boolean };
  payout: { preference?: string; threshold?: number; tdsAcknowledged?: boolean };
  partnerId?: string;
  agreementSignedAt?: string;
  activatedAt?: string;
  dimensions: Record<"identity" | "capability" | "network" | "intent" | "compliance" | "growth", boolean>;
};

export type PartnerLead = Lead & {
  phone?: string;
  city?: string;
  segment?: string;
  companyId?: string;
  quantity?: number;
  documents: string[];
  notes: { at: string; text: string }[];
  caseId?: string;
  allowedNext: LeadState[];
};

export type CaseItem = {
  id: string;
  leadId: string;
  client: string;
  subject: string;
  value: Paise;
  stage: string;
  stageLabel: string;
  owner: string;
  nextAction?: string;
  slaDue?: string;
  timeline: TimelineStep[];
  createdAt: string;
};

export type ClientItem = {
  key: string;
  name: string;
  phone?: string;
  city?: string;
  segment?: string;
  needs: Need[];
  leads: PartnerLead[];
  openValue: Paise;
  nextAction: string;
  cases?: CaseItem[];
};

export type Opportunity = { id: string; client: string; clientKey: string; title: string; reason: string; action: string; companyId?: string; signal: "new_supply" | "buyer_interest" | "cross_sell" };

export type PayoutItem = { id: string; gross: Paise; tds: Paise; net: Paise; state: "processing" | "paid"; bank?: string; count: number; at: string };

export type PartnerResources = { training: { id: string; title: string; minutes: number; kind: string }[]; marketing: { id: string; title: string; kind: string }[] };

// ---- step 8: Customer 360, goals, family, insights, assistant (Phase 2 + 3) ----

export type FinancialProfile = {
  incomeBand?: string;
  risk?: "low" | "moderate" | "high";
  horizon?: string;
  liquidity?: "low" | "medium" | "high";
  investible?: Paise;
  options: { incomeBand: string[]; risk: string[]; horizon: string[]; liquidity: string[] };
};

export type ExternalProduct = { id: number; kind: "investment" | "insurance" | "loan"; name: string; provider?: string; value: Paise };

export type FamilyMember = { id: number; name: string; relation: "spouse" | "child" | "parent" | "sibling"; birthYear?: number; dependent: boolean; cover: { health?: boolean; life?: boolean } };

export type Goal = {
  id: number;
  need: Need;
  title: string;
  target: Paise;
  targetDate: string;
  saved: Paise;
  pct: number;
  state: "active" | "achieved" | "archived";
  onTrack: boolean;
  monthlyNeeded: Paise;
  monthsLeft: number;
  contributions: { at: string; amount: Paise; note?: string }[];
};

export type LifeItem = { id: string; externalId?: number; source: "rfin" | "external"; kind: "investment" | "insurance" | "loan"; name: string; provider?: string; value: Paise; at: string };

export type Insight = { tone: "action" | "pending" | "info" | "success"; title: string; detail: string };

export type FinancialLife = {
  netWorth: Paise;
  totals: { investments: Paise; unlisted: Paise; cover: Paise; loans: Paise };
  items: LifeItem[];
  holdings: Holding[];
  goals: Goal[];
  family: FamilyMember[];
  insights: Insight[];
  note: string;
};

export type Recommendation = { id: string; title: string; detail: string; route: string; kind?: "product" | "company" | "action"; reasons: string[] };

export type Recommendations = { alerts: Recommendation[]; forYou: Recommendation[]; note: string };

export type AlertItem = { id: number; companyId: string; companyName: string; kind: "price_above" | "price_below" | "new_supply"; threshold?: Paise; active: boolean; triggeredAt?: string };

export type InsightsContent = {
  research: { id: string; companyId: string; title: string; kind: string; minutes: number; summary: string; points: string[] }[];
  education: { id: string; title: string; minutes: number; summary: string }[];
  events: { id: string; title: string; date: string; format: string; host: string }[];
};

export type AssistantReply = { reply: string; actions: { label: string; route: string }[]; source: "claude" | "rules"; disclaimer: string };

export type PartnerInsights = { leads: number; conversionRate: number; avgTicket: Paise; openPipeline: Paise; earned: Paise; commissionPct: number; tips: string[] };
