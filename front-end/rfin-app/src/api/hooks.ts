import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { Ops } from "./transport";
import { api, newIdempotencyKey } from "./client";

export const useMe = () => useQuery({ queryKey: ["me"], queryFn: () => api("me.get", undefined) });

export const useProducts = (input: Ops["products.list"]["in"] = {}) =>
  useQuery({ queryKey: ["products", input], queryFn: () => api("products.list", input) });

export const useProduct = (id: string) =>
  useQuery({ queryKey: ["product", id], queryFn: () => api("products.get", { id }) });

export const useCompanies = (input: Ops["companies.list"]["in"] = {}) =>
  useQuery({ queryKey: ["companies", input], queryFn: () => api("companies.list", input) });

export const useCompany = (id: string) =>
  useQuery({ queryKey: ["company", id], queryFn: () => api("companies.get", { id }) });

export const useKycItems = () => useQuery({ queryKey: ["kyc"], queryFn: () => api("kyc.items", undefined) });

/** Orders poll while any is still moving, so status never goes stale (report #8). */
export const useOrders = () =>
  useQuery({
    queryKey: ["orders"],
    queryFn: () => api("orders.list", undefined),
    refetchInterval: (q) =>
      q.state.data?.some((o) => o.state === "submitted" || o.state === "processing") ? 3000 : false,
  });

export const useOrder = (id: string) =>
  useQuery({
    queryKey: ["order", id],
    queryFn: () => api("orders.get", { id }),
    refetchInterval: (q) => (q.state.data?.state === "processing" || q.state.data?.state === "submitted" ? 3000 : false),
  });

export function useCreateOrder() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: Ops["orders.create"]["in"] & { idempotencyKey?: string }) =>
      api("orders.create", input, { idempotencyKey: input.idempotencyKey ?? newIdempotencyKey() }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["orders"] }),
  });
}

export const usePointsLedger = () => useQuery({ queryKey: ["points"], queryFn: () => api("points.ledger", undefined) });

export const useDraws = () => useQuery({ queryKey: ["draws"], queryFn: () => api("draws.list", undefined) });

export const useLeads = () => useQuery({ queryKey: ["leads"], queryFn: () => api("leads.list", undefined) });

export const useCommission = () =>
  useQuery({ queryKey: ["commission"], queryFn: () => api("commission.ledger", undefined), staleTime: 0, refetchInterval: (q) => (q.state.data?.some((c) => c.state === "pending" || c.state === "on_hold") ? 3000 : false) });

export const useBanks = () =>
  useQuery({
    queryKey: ["banks"],
    queryFn: () => api("bank.list", undefined),
    refetchInterval: (q) => (q.state.data?.some((b) => b.state === "verifying") ? 1500 : false),
  });

/** KYC polls while any document is under review. */
export const useKycLive = () =>
  useQuery({
    queryKey: ["kyc"],
    queryFn: () => api("kyc.items", undefined),
    refetchInterval: (q) => (q.state.data?.some((k) => k.state === "in_progress") ? 1500 : false),
  });

// ---- step 4: activity, documents, notifications, support ----

// staleTime 0: documents are issued by the server as orders complete.
export const useDocuments = () => useQuery({ queryKey: ["documents"], queryFn: () => api("documents.list", undefined), staleTime: 0 });

/** Polls so the bell badge stays current while the app is open. */
export const useNotifications = () =>
  useQuery({ queryKey: ["notifications"], queryFn: () => api("notifications.list", undefined), refetchInterval: 15_000, staleTime: 0 });

export function useMarkRead() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (ids?: number[]) => api("notifications.read", { ids }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["notifications"] }),
  });
}

export const usePrefs = () => useQuery({ queryKey: ["prefs"], queryFn: () => api("prefs.get", undefined) });

export const useFaqs = () => useQuery({ queryKey: ["faqs"], queryFn: () => api("support.faqs", undefined), staleTime: Infinity });

export const useTickets = () => useQuery({ queryKey: ["tickets"], queryFn: () => api("support.tickets", undefined) });

/** Polls while the advisor's reply is on its way. */
export const useTicket = (id: string) =>
  useQuery({
    queryKey: ["ticket", id],
    queryFn: () => api("support.ticket", { id }),
    refetchInterval: (q) => (q.state.data?.advisorTyping ? 1500 : false),
  });

// ---- step 5: private markets ----

export const useQuote = (id: string, quantity: number) =>
  useQuery({ queryKey: ["quote", id, quantity], queryFn: () => api("companies.quote", { id, quantity }), enabled: quantity > 0 });

export const usePriceDiscovery = (id: string) => useQuery({ queryKey: ["discovery", id], queryFn: () => api("companies.priceDiscovery", { id }) });

export const useWatchlist = () => useQuery({ queryKey: ["watchlist"], queryFn: () => api("watchlist.list", undefined) });

export function useToggleWatch() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ companyId, on }: { companyId: string; on: boolean }) => api(on ? "watchlist.add" : "watchlist.remove", { companyId }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["watchlist"] }),
  });
}

export const usePortfolio = () => useQuery({ queryKey: ["portfolio"], queryFn: () => api("portfolio.get", undefined), staleTime: 0 });

export const useListings = () =>
  useQuery({
    queryKey: ["listings"],
    queryFn: () => api("listings.list", undefined),
    refetchInterval: (q) => (q.state.data?.some((l) => !["paid", "cancelled"].includes(l.state)) ? 3000 : false),
  });

export const useListing = (id: string) =>
  useQuery({
    queryKey: ["listing", id],
    queryFn: () => api("listings.get", { id }),
    refetchInterval: (q) => (q.state.data && !["paid", "cancelled"].includes(q.state.data.state) ? 2000 : false),
  });

// ---- step 6: rewards ----

export const useRewardsSummary = () => useQuery({ queryKey: ["rewards"], queryFn: () => api("rewards.summary", undefined), staleTime: 0 });

export const useDraw = (id: string) => useQuery({ queryKey: ["draw", id], queryFn: () => api("draws.get", { id }) });

export const useBenefits = () =>
  useQuery({
    queryKey: ["benefits"],
    queryFn: () => api("benefits.list", undefined),
    staleTime: 0,
    refetchInterval: (q) => (q.state.data?.some((b) => b.state === "processing") ? 2000 : false),
  });

export const useBenefit = (id: number) =>
  useQuery({ queryKey: ["benefit", id], queryFn: () => api("benefits.get", { id }), refetchInterval: (q) => (q.state.data?.state === "processing" ? 2000 : false) });

export const useReferrals = () =>
  useQuery({
    queryKey: ["referrals"],
    queryFn: () => api("referrals.list", undefined),
    staleTime: 0,
    refetchInterval: (q) => (q.state.data?.some((r) => r.state === "approved") ? 3000 : false),
  });

// ---- step 7: partner ----

export const usePartnerProfile = () =>
  useQuery({ queryKey: ["partnerProfile"], queryFn: () => api("partner.profile", undefined), refetchInterval: (q) => (q.state.data?.state === "verifying" ? 1500 : false) });

export const useLead = (id: string) => useQuery({ queryKey: ["lead", id], queryFn: () => api("leads.get", { id }) });

export const useCases = () => useQuery({ queryKey: ["cases"], queryFn: () => api("cases.list", undefined), refetchInterval: (q) => (q.state.data?.some((k) => k.stage !== "completed") ? 4000 : false) });

export const useCase = (id: string) =>
  useQuery({ queryKey: ["case", id], queryFn: () => api("cases.get", { id }), refetchInterval: (q) => (q.state.data && q.state.data.stage !== "completed" ? 2000 : false) });

export const useClients = () => useQuery({ queryKey: ["clients"], queryFn: () => api("clients.list", undefined) });
export const useClient = (key: string) => useQuery({ queryKey: ["client", key], queryFn: () => api("clients.get", { key }) });
export const useOpportunities = () => useQuery({ queryKey: ["opportunities"], queryFn: () => api("opportunities.list", undefined) });
export const usePayouts = () =>
  useQuery({ queryKey: ["payouts"], queryFn: () => api("payouts.list", undefined), refetchInterval: (q) => (q.state.data?.some((p) => p.state === "processing") ? 2000 : false) });
export const useResources = () => useQuery({ queryKey: ["resources"], queryFn: () => api("partner.resources", undefined), staleTime: Infinity });

// ---- step 8: Customer 360, goals, family, insights, assistant ----

export const useLife = () => useQuery({ queryKey: ["life"], queryFn: () => api("life.get", undefined), staleTime: 0 });
export const useRecommendations = () => useQuery({ queryKey: ["recs"], queryFn: () => api("recommendations.get", undefined), staleTime: 0 });
export const useGoals = () => useQuery({ queryKey: ["goals"], queryFn: () => api("goals.list", undefined) });
export const useGoal = (id: number) => useQuery({ queryKey: ["goal", id], queryFn: () => api("goals.get", { id }) });
export const useFamily = () => useQuery({ queryKey: ["family"], queryFn: () => api("family.list", undefined) });
export const useFinancial = () => useQuery({ queryKey: ["financial"], queryFn: () => api("financial.get", undefined) });
export const useExternal = () => useQuery({ queryKey: ["external"], queryFn: () => api("external.list", undefined) });
export const useAlerts = () => useQuery({ queryKey: ["alerts"], queryFn: () => api("alerts.list", undefined) });
export const useContent = () => useQuery({ queryKey: ["content"], queryFn: () => api("content.get", undefined), staleTime: Infinity });
export const usePartnerInsights = () => useQuery({ queryKey: ["partnerInsights"], queryFn: () => api("partner.insights", undefined) });

/** Invalidate everything Customer 360 feeds into. */
export function useC360Invalidate() {
  const qc = useQueryClient();
  return () => {
    for (const k of ["life", "recs", "goals", "goal", "family", "financial", "external", "alerts", "notifications"]) qc.invalidateQueries({ queryKey: [k] });
  };
}
