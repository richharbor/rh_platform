import type { AlertItem, AssistantReply, ExternalProduct, FamilyMember, FinancialLife, FinancialProfile, Goal, InsightsContent, PartnerInsights, Recommendations, CaseItem, ClientItem, Opportunity, PartnerLead, PartnerProfile, PartnerResources, PayoutItem, Benefit, Holding, PmQuote, Portfolio, PriceDiscovery, ReferralItem, ReferralShare, RewardsSummary, SellListing, DocumentItem, Faq, NotificationItem, NotificationPrefs, SupportContext, SupportTicket, BankAccount, ConsentRecord, Eligibility, CommissionEntry, Company, KycItem, Lead, LuckyDraw, Order, PointEntry, Product, RfinUser, Need, Role } from "./models";
import type { LeadState } from "./states";

/**
 * Every call the clients make, and exactly what rhserver's /rfin API returns.
 * `http.ts` maps each op to its REST endpoint.
 */
export type Ops = {
  "auth.sendOtp": { in: { phone: string }; out: { requestId: string; resendInSec: number } };
  "auth.verifyOtp": { in: { requestId: string; code: string; referralCode?: string }; out: { token: string; isNew: boolean; customer: RfinUser } };
  "me.get": { in: void; out: RfinUser };
  "me.update": { in: { name?: string; email?: string; city?: string; needs?: Need[]; roles?: Role[]; onboarded?: boolean }; out: RfinUser };
  "products.list": { in: { category?: Product["category"]; q?: string }; out: Product[] };
  "products.get": { in: { id: string }; out: Product };
  "companies.list": { in: { q?: string; theme?: string }; out: Company[] };
  "companies.get": { in: { id: string }; out: Company };
  "kyc.items": { in: void; out: KycItem[] };
  "orders.list": { in: void; out: Order[] };
  "orders.get": { in: { id: string }; out: Order };
  /** products: amount; private-market companies: quantity (priced server-side) */
  "orders.create": { in: { kind: Order["kind"]; subjectId: string; amount?: number; quantity?: number; pay: boolean }; out: Order };
  "orders.retryPayment": { in: { id: string }; out: Order };
  "points.ledger": { in: void; out: PointEntry[] };
  "draws.list": { in: void; out: LuckyDraw[] };
  "leads.list": { in: void; out: PartnerLead[] };
  "eligibility.check": { in: { productId: string; monthlyIncome: number; amount?: number }; out: Eligibility };
  "kyc.upload": { in: { itemId: string; fileName: string }; out: KycItem };
  "bank.list": { in: void; out: BankAccount[] };
  "bank.add": { in: { holder: string; account: string; ifsc: string }; out: BankAccount };
  "consent.record": { in: { subject: string; items: string[] }; out: ConsentRecord };
  "commission.ledger": { in: void; out: CommissionEntry[] };
  "orders.act": { in: { id: string; choice: string }; out: Order };
  "documents.list": { in: void; out: DocumentItem[] };
  "notifications.list": { in: void; out: { unread: number; items: NotificationItem[] } };
  "notifications.read": { in: { ids?: number[] }; out: { updated: number } };
  "prefs.get": { in: void; out: NotificationPrefs };
  "prefs.update": { in: { channels?: Partial<NotificationPrefs["channels"]>; categories?: Partial<NotificationPrefs["categories"]> }; out: NotificationPrefs };
  "support.faqs": { in: void; out: Faq[] };
  "support.tickets": { in: void; out: SupportTicket[] };
  "support.ticket": { in: { id: string }; out: SupportTicket };
  "support.create": { in: { subject: string; message: string; contextType?: SupportContext; contextId?: string }; out: SupportTicket };
  "support.reply": { in: { id: string; text: string }; out: SupportTicket };
  "support.resolve": { in: { id: string }; out: SupportTicket };
  // step 5 — private markets
  "companies.quote": { in: { id: string; quantity: number }; out: PmQuote };
  "companies.priceDiscovery": { in: { id: string }; out: PriceDiscovery };
  "watchlist.list": { in: void; out: Company[] };
  "watchlist.add": { in: { companyId: string }; out: { watching: boolean } };
  "watchlist.remove": { in: { companyId: string }; out: { watching: boolean } };
  "portfolio.get": { in: void; out: Portfolio };
  "listings.list": { in: void; out: SellListing[] };
  "listings.get": { in: { id: string }; out: SellListing };
  "listings.create": { in: { companyId: string; quantity: number; ask: number }; out: SellListing };
  "listings.cancel": { in: { id: string }; out: SellListing };
  // step 6 — rewards
  "rewards.summary": { in: void; out: RewardsSummary };
  "draws.get": { in: { id: string }; out: LuckyDraw };
  "benefits.list": { in: void; out: Benefit[] };
  "benefits.get": { in: { id: number }; out: Benefit };
  "benefits.redeem": { in: { id: number }; out: Benefit };
  "referrals.list": { in: void; out: ReferralItem[] };
  "referrals.create": { in: { need: Need; name: string; phone?: string }; out: ReferralShare };
  // step 7 — partner
  "partner.profile": { in: void; out: PartnerProfile };
  "partner.update": { in: Partial<Pick<PartnerProfile, "basic" | "professional" | "capabilities" | "network" | "business" | "compliance" | "payout">> & { partnerType?: string; step?: number; signAgreement?: boolean }; out: PartnerProfile };
  "partner.submit": { in: void; out: PartnerProfile };
  "partner.resources": { in: void; out: PartnerResources };
  "leads.get": { in: { id: string }; out: PartnerLead };
  "leads.create": { in: { client: string; phone?: string; need: Need; productId?: string; companyId?: string; quantity?: number; documents?: string[] }; out: PartnerLead };
  "leads.update": { in: { id: string; state?: LeadState; note?: string }; out: PartnerLead };
  "cases.list": { in: void; out: CaseItem[] };
  "cases.get": { in: { id: string }; out: CaseItem };
  "clients.list": { in: void; out: ClientItem[] };
  "clients.get": { in: { key: string }; out: ClientItem };
  "opportunities.list": { in: void; out: Opportunity[] };
  "payouts.list": { in: void; out: PayoutItem[] };
  "payouts.request": { in: void; out: PayoutItem };
  // step 8 — Customer 360, goals, family, insights, assistant
  "financial.get": { in: void; out: FinancialProfile };
  "financial.update": { in: Partial<Omit<FinancialProfile, "options">>; out: FinancialProfile };
  "external.list": { in: void; out: ExternalProduct[] };
  "external.add": { in: Omit<ExternalProduct, "id">; out: ExternalProduct };
  "external.remove": { in: { id: number }; out: { removed: boolean } };
  "family.list": { in: void; out: FamilyMember[] };
  "family.add": { in: Omit<FamilyMember, "id" | "dependent" | "cover"> & { dependent?: boolean; cover?: FamilyMember["cover"] }; out: FamilyMember };
  "family.update": { in: { id: number; dependent?: boolean; cover?: FamilyMember["cover"] }; out: FamilyMember };
  "family.remove": { in: { id: number }; out: { removed: boolean } };
  "goals.list": { in: void; out: Goal[] };
  "goals.get": { in: { id: number }; out: Goal };
  "goals.create": { in: { need: Need; title: string; target: number; targetDate: string }; out: Goal };
  "goals.contribute": { in: { id: number; amount: number; note?: string }; out: Goal };
  "goals.archive": { in: { id: number }; out: Goal };
  "life.get": { in: void; out: FinancialLife };
  "recommendations.get": { in: void; out: Recommendations };
  "alerts.list": { in: void; out: AlertItem[] };
  "alerts.create": { in: { companyId: string; kind: AlertItem["kind"]; threshold?: number }; out: AlertItem[] };
  "alerts.remove": { in: { id: number }; out: AlertItem[] };
  "content.get": { in: void; out: InsightsContent };
  "support.suggest": { in: { q: string }; out: Faq[] };
  "assistant.ask": { in: { message: string; history?: { role: "user" | "assistant"; text: string }[] }; out: AssistantReply };
  "partner.insights": { in: void; out: PartnerInsights };
  /** Dev only (404 in production): force failure paths server-side. */
  "dev.scenario": { in: { failPayments?: boolean }; out: { failPayments: boolean } };
};

export type Op = keyof Ops;

export type RequestOptions = {
  /** required for mutations — the server de-duplicates on it (report #37, #70) */
  idempotencyKey?: string;
};

export interface Transport {
  request<K extends Op>(op: K, input: Ops[K]["in"], opts?: RequestOptions): Promise<Ops[K]["out"]>;
}

export class ApiError extends Error {
  constructor(
    public code: "not_found" | "network" | "validation" | "conflict" | "unauthorized" | "forbidden",
    message: string,
  ) {
    super(message);
  }
}
