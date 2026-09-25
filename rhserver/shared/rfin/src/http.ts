import { ApiError, type Op, type Ops, type RequestOptions, type Transport } from "./transport";

type Route = { method: "GET" | "POST" | "PATCH"; path: (i: any) => string; body?: boolean; query?: boolean };

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
