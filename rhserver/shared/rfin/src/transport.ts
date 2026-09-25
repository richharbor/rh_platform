import type { BankAccount, ConsentRecord, Eligibility, CommissionEntry, Company, KycItem, Lead, LuckyDraw, Order, PointEntry, Product, RfinUser, Need, Role } from "./models";

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
  "orders.create": { in: { kind: Order["kind"]; subjectId: string; amount: number; pay: boolean }; out: Order };
  "orders.retryPayment": { in: { id: string }; out: Order };
  "points.ledger": { in: void; out: PointEntry[] };
  "draws.list": { in: void; out: LuckyDraw[] };
  "leads.list": { in: void; out: Lead[] };
  "eligibility.check": { in: { productId: string; monthlyIncome: number; amount?: number }; out: Eligibility };
  "kyc.upload": { in: { itemId: string; fileName: string }; out: KycItem };
  "bank.list": { in: void; out: BankAccount[] };
  "bank.add": { in: { holder: string; account: string; ifsc: string }; out: BankAccount };
  "consent.record": { in: { subject: string; items: string[] }; out: ConsentRecord };
  "commission.ledger": { in: void; out: CommissionEntry[] };
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
