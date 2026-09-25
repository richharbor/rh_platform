import type { Mode, Role } from "./models";
import RBAC from "./rbac.json";

/**
 * Customer-side RBAC. One RFIN ID holds one or more roles (report #2, #3);
 * each role grants module/action permissions. Screens and navigation ask
 * `can(roles, module, action)` — never check role names directly — so a new
 * role or a changed grant is a one-line edit here.
 *
 * Covers everything built through step 3. Later steps add their modules here.
 */
export const MODULES = RBAC.modules;

export type Module = keyof typeof MODULES;
export type Action<M extends Module> = (typeof MODULES)[M][number];
export type Grant = { [M in Module]?: readonly string[] };

/**
 * What each role grants. Lives in rbac.json so rhserver's
 * requireCustomerPermission() enforces exactly what the clients show.
 */
export const ROLE_GRANTS = RBAC.roles as Record<Role, Grant>;

export const ROLE_LABEL: Record<Role, string> = { buyer: "Buyer", seller: "Seller", partner: "Referral Partner" };

export function can<M extends Module>(roles: readonly Role[], module: M, action: Action<M>): boolean {
  return roles.some((r) => ROLE_GRANTS[r]?.[module]?.includes(action as string) ?? false);
}

/**
 * Mode narrows what's shown, roles decide what's allowed. Partner mode needs the
 * partner role; investor mode needs buyer or seller.
 */
export const MODE_MODULES: Record<Mode, Module[]> = {
  investor: ["dashboard", "explore", "products", "applications", "orders", "documents", "kyc", "bank", "rewards", "referrals", "private_markets", "notifications", "support", "profile"],
  partner: ["partner_dashboard", "leads", "clients", "earnings", "documents", "kyc", "bank", "notifications", "support", "profile"],
};

export const canUseMode = (roles: readonly Role[], mode: Mode) =>
  mode === "partner" ? roles.includes("partner") : roles.includes("buyer") || roles.includes("seller");

/** Route prefix → the permission that guards it. First match wins. */
export const ROUTE_GUARDS: { prefix: string; module: Module; action: string }[] = [
  { prefix: "/partner/onboarding", module: "partner_onboarding", action: "view" },
  { prefix: "/partner/leads/new", module: "leads", action: "create" },
  { prefix: "/partner/cases", module: "cases", action: "view" },
  { prefix: "/partner/resources", module: "resources", action: "view" },
  { prefix: "/partner/leads", module: "leads", action: "view" },
  { prefix: "/partner/clients", module: "clients", action: "view" },
  { prefix: "/partner/earnings", module: "earnings", action: "view" },
  { prefix: "/partner", module: "partner_dashboard", action: "view" },
  { prefix: "/eligibility", module: "products", action: "check_eligibility" },
  { prefix: "/compare", module: "products", action: "compare" },
  { prefix: "/product", module: "products", action: "view" },
  { prefix: "/txn", module: "applications", action: "create" },
  { prefix: "/order", module: "orders", action: "view" },
  { prefix: "/activity", module: "orders", action: "view" },
  { prefix: "/kyc", module: "kyc", action: "view" },
  { prefix: "/bank", module: "bank", action: "view" },
  { prefix: "/rewards", module: "rewards", action: "view" },
  { prefix: "/explore", module: "explore", action: "view" },
  { prefix: "/home", module: "dashboard", action: "view" },
  { prefix: "/profile/financial", module: "customer360", action: "view" },
  { prefix: "/profile", module: "profile", action: "view" },
  { prefix: "/documents", module: "documents", action: "view" },
  { prefix: "/markets", module: "private_markets", action: "view" },
  { prefix: "/company", module: "private_markets", action: "view" },
  { prefix: "/portfolio", module: "private_markets", action: "view" },
  { prefix: "/buy", module: "private_markets", action: "buy" },
  { prefix: "/sell", module: "private_markets", action: "sell" },
  { prefix: "/refer", module: "referrals", action: "view" },
  { prefix: "/life", module: "insights", action: "view" },
  { prefix: "/goals", module: "goals", action: "view" },
  { prefix: "/family", module: "family", action: "view" },
  { prefix: "/research", module: "insights", action: "view" },
  { prefix: "/assistant", module: "assistant", action: "use" },
  { prefix: "/notifications", module: "notifications", action: "view" },
  { prefix: "/support", module: "support", action: "view" },
];

export function canVisit(roles: readonly Role[], path: string): boolean {
  const g = ROUTE_GUARDS.find((r) => path === r.prefix || path.startsWith(r.prefix + "/"));
  if (!g) return true;
  return can(roles, g.module, g.action as never);
}
