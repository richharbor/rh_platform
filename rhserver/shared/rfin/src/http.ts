import { ApiError, type Op, type Ops, type RequestOptions, type Transport } from "./transport";

type Route = { method: "GET" | "POST" | "PATCH" | "PUT" | "DELETE"; path: (i: any) => string; body?: boolean; query?: boolean };

/** Op → rhserver /rfin endpoint. Keep in sync with rhserver/routes/rfinRoutes.js. */
const ROUTES: { [K in Op]: Route } = {
  "auth.sendOtp": { method: "POST", path: () => "/rfin/auth/otp", body: true },
  "auth.verifyOtp": { method: "POST", path: () => "/rfin/auth/verify", body: true },
  "me.get": { method: "GET", path: () => "/rfin/me" },
  "me.update": { method: "PATCH", path: () => "/rfin/me", body: true },
  "products.list": { method: "GET", path: () => "/rfin/products", query: true },
  "products.get": { method: "GET", path: (i) => `/rfin/products/${enc(i.id)}` },
  "companies.list": { method: "GET", path: () => "/rfin/companies", query: true },
  "companies.get": { method: "GET", path: (i) => `/rfin/companies/${enc(i.id)}` },
  "eligibility.check": { method: "POST", path: () => "/rfin/eligibility", body: true },
  "kyc.items": { method: "GET", path: () => "/rfin/kyc" },
  "kyc.upload": { method: "POST", path: (i) => `/rfin/kyc/${enc(i.itemId)}/upload`, body: true },
  "bank.list": { method: "GET", path: () => "/rfin/banks" },
  "bank.add": { method: "POST", path: () => "/rfin/banks", body: true },
  "consent.record": { method: "POST", path: () => "/rfin/consents", body: true },
  "orders.list": { method: "GET", path: () => "/rfin/orders" },
  "orders.get": { method: "GET", path: (i) => `/rfin/orders/${enc(i.id)}` },
  "orders.create": { method: "POST", path: () => "/rfin/orders", body: true },
  "orders.retryPayment": { method: "POST", path: (i) => `/rfin/orders/${enc(i.id)}/retry-payment` },
  "points.ledger": { method: "GET", path: () => "/rfin/points" },
  "draws.list": { method: "GET", path: () => "/rfin/draws" },
  "leads.list": { method: "GET", path: () => "/rfin/leads" },
  "commission.ledger": { method: "GET", path: () => "/rfin/commissions" },
  "orders.act": { method: "POST", path: (i) => `/rfin/orders/${enc(i.id)}/action`, body: true },
  "documents.list": { method: "GET", path: () => "/rfin/documents" },
  "notifications.list": { method: "GET", path: () => "/rfin/notifications" },
  "notifications.read": { method: "POST", path: () => "/rfin/notifications/read", body: true },
  "prefs.get": { method: "GET", path: () => "/rfin/notification-preferences" },
  "prefs.update": { method: "PATCH", path: () => "/rfin/notification-preferences", body: true },
  "support.faqs": { method: "GET", path: () => "/rfin/support/faqs" },
  "support.tickets": { method: "GET", path: () => "/rfin/support/tickets" },
  "support.ticket": { method: "GET", path: (i) => `/rfin/support/tickets/${enc(i.id)}` },
  "support.create": { method: "POST", path: () => "/rfin/support/tickets", body: true },
  "support.reply": { method: "POST", path: (i) => `/rfin/support/tickets/${enc(i.id)}/messages`, body: true },
  "support.resolve": { method: "POST", path: (i) => `/rfin/support/tickets/${enc(i.id)}/resolve` },
  "companies.quote": { method: "GET", path: (i) => `/rfin/companies/${enc(i.id)}/quote?quantity=${i.quantity}` },
  "companies.priceDiscovery": { method: "GET", path: (i) => `/rfin/companies/${enc(i.id)}/price-discovery` },
  "watchlist.list": { method: "GET", path: () => "/rfin/watchlist" },
  "watchlist.add": { method: "PUT", path: (i) => `/rfin/watchlist/${enc(i.companyId)}` },
  "watchlist.remove": { method: "DELETE", path: (i) => `/rfin/watchlist/${enc(i.companyId)}` },
  "portfolio.get": { method: "GET", path: () => "/rfin/portfolio" },
  "listings.list": { method: "GET", path: () => "/rfin/sell-listings" },
  "listings.get": { method: "GET", path: (i) => `/rfin/sell-listings/${enc(i.id)}` },
  "listings.create": { method: "POST", path: () => "/rfin/sell-listings", body: true },
  "listings.cancel": { method: "POST", path: (i) => `/rfin/sell-listings/${enc(i.id)}/cancel` },
  "rewards.summary": { method: "GET", path: () => "/rfin/rewards/summary" },
  "draws.get": { method: "GET", path: (i) => `/rfin/draws/${enc(i.id)}` },
  "benefits.list": { method: "GET", path: () => "/rfin/benefits" },
  "benefits.get": { method: "GET", path: (i) => `/rfin/benefits/${i.id}` },
  "benefits.redeem": { method: "POST", path: (i) => `/rfin/benefits/${i.id}/redeem` },
  "referrals.list": { method: "GET", path: () => "/rfin/referrals" },
  "referrals.create": { method: "POST", path: () => "/rfin/referrals", body: true },
  "partner.profile": { method: "GET", path: () => "/rfin/partner/profile" },
  "partner.update": { method: "PATCH", path: () => "/rfin/partner/profile", body: true },
  "partner.submit": { method: "POST", path: () => "/rfin/partner/profile/submit" },
  "partner.resources": { method: "GET", path: () => "/rfin/partner/resources" },
  "leads.get": { method: "GET", path: (i) => `/rfin/leads/${enc(i.id)}` },
  "leads.create": { method: "POST", path: () => "/rfin/leads", body: true },
  "leads.update": { method: "PATCH", path: (i) => `/rfin/leads/${enc(i.id)}`, body: true },
  "cases.list": { method: "GET", path: () => "/rfin/cases" },
  "cases.get": { method: "GET", path: (i) => `/rfin/cases/${enc(i.id)}` },
  "clients.list": { method: "GET", path: () => "/rfin/clients" },
  "clients.get": { method: "GET", path: (i) => `/rfin/clients/${enc(i.key)}` },
  "opportunities.list": { method: "GET", path: () => "/rfin/opportunities" },
  "payouts.list": { method: "GET", path: () => "/rfin/payouts" },
  "payouts.request": { method: "POST", path: () => "/rfin/payouts" },
  "financial.get": { method: "GET", path: () => "/rfin/financial-profile" },
  "financial.update": { method: "PATCH", path: () => "/rfin/financial-profile", body: true },
  "external.list": { method: "GET", path: () => "/rfin/external-products" },
  "external.add": { method: "POST", path: () => "/rfin/external-products", body: true },
  "external.remove": { method: "DELETE", path: (i) => `/rfin/external-products/${i.id}` },
  "family.list": { method: "GET", path: () => "/rfin/family" },
  "family.add": { method: "POST", path: () => "/rfin/family", body: true },
  "family.update": { method: "PATCH", path: (i) => `/rfin/family/${i.id}`, body: true },
  "family.remove": { method: "DELETE", path: (i) => `/rfin/family/${i.id}` },
  "goals.list": { method: "GET", path: () => "/rfin/goals" },
  "goals.get": { method: "GET", path: (i) => `/rfin/goals/${i.id}` },
  "goals.create": { method: "POST", path: () => "/rfin/goals", body: true },
  "goals.contribute": { method: "POST", path: (i) => `/rfin/goals/${i.id}/contributions`, body: true },
  "goals.archive": { method: "POST", path: (i) => `/rfin/goals/${i.id}/archive` },
  "life.get": { method: "GET", path: () => "/rfin/financial-life" },
  "recommendations.get": { method: "GET", path: () => "/rfin/recommendations" },
  "alerts.list": { method: "GET", path: () => "/rfin/alerts" },
  "alerts.create": { method: "POST", path: () => "/rfin/alerts", body: true },
  "alerts.remove": { method: "DELETE", path: (i) => `/rfin/alerts/${i.id}` },
  "content.get": { method: "GET", path: () => "/rfin/insights/content" },
  "support.suggest": { method: "GET", path: () => "/rfin/support/suggest", query: true },
  "assistant.ask": { method: "POST", path: () => "/rfin/assistant", body: true },
  "partner.insights": { method: "GET", path: () => "/rfin/partner/insights" },
  "dev.scenario": { method: "POST", path: () => "/rfin/dev/scenario", body: true },
};

const enc = encodeURIComponent;

const CODE: Record<number, ApiError["code"]> = { 400: "validation", 401: "unauthorized", 403: "forbidden", 404: "not_found", 409: "conflict", 422: "validation" };

export type HttpTransportOptions = {
  baseUrl: string;
  /** current customer JWT, if signed in */
  getToken: () => string | undefined;
  /** called on 401 so the app can sign the user out */
  onUnauthorized?: () => void;
};

/** fetch-based Transport against rhserver. Works in React Native and the browser. */
export function createHttpTransport({ baseUrl, getToken, onUnauthorized }: HttpTransportOptions): Transport {
  return {
    async request<K extends Op>(op: K, input: Ops[K]["in"], opts?: RequestOptions) {
      const r = ROUTES[op];
      let url = baseUrl.replace(/\/$/, "") + r.path(input);
      if (r.query && input) {
        const qs = new URLSearchParams(Object.entries(input as Record<string, unknown>).filter(([, v]) => v != null && v !== "").map(([k, v]) => [k, String(v)]));
        if ([...qs].length) url += `?${qs}`;
      }
      const headers: Record<string, string> = { Accept: "application/json" };
      const token = getToken();
      if (token) headers.Authorization = `Bearer ${token}`;
      if (opts?.idempotencyKey) headers["Idempotency-Key"] = opts.idempotencyKey;
      if (r.body) headers["Content-Type"] = "application/json";

      let res: Response;
      try {
        res = await fetch(url, { method: r.method, headers, body: r.body ? JSON.stringify(input ?? {}) : undefined });
      } catch {
        throw new ApiError("network", "Couldn't reach RFIN. Check your connection.");
      }
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        if (res.status === 401) onUnauthorized?.();
        throw new ApiError(CODE[res.status] ?? "network", data?.error ?? data?.message ?? `Request failed (${res.status})`);
      }
      return data as Ops[K]["out"];
    },
  };
}
