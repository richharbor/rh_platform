"use client";
import { useQuery } from "@tanstack/react-query";
import type { Ops } from "@rfin/shared";
import { api } from "./api";

// Mirrors rfin-app/src/api/hooks.ts — same query keys, same polling rules.

export const useProducts = (input: Ops["products.list"]["in"] = {}) =>
  useQuery({ queryKey: ["products", input], queryFn: () => api("products.list", input) });

export const useProduct = (id: string) => useQuery({ queryKey: ["product", id], queryFn: () => api("products.get", { id }) });

export const useCompanies = (input: Ops["companies.list"]["in"] = {}) =>
  useQuery({ queryKey: ["companies", input], queryFn: () => api("companies.list", input) });

/** KYC polls while anything is under review. */
export const useKyc = () =>
  useQuery({
    queryKey: ["kyc"],
    queryFn: () => api("kyc.items", undefined),
    refetchInterval: (q) => (q.state.data?.some((k) => k.state === "in_progress") ? 1500 : false),
  });

/** Orders poll while any is still moving (report #8). */
export const useOrders = () =>
  useQuery({
    queryKey: ["orders"],
    queryFn: () => api("orders.list", undefined),
    refetchInterval: (q) => (q.state.data?.some((o) => o.state === "submitted" || o.state === "processing") ? 3000 : false),
  });

export const useOrder = (id: string) =>
  useQuery({
    queryKey: ["order", id],
    queryFn: () => api("orders.get", { id }),
    refetchInterval: (q) => (q.state.data?.state === "processing" || q.state.data?.state === "submitted" ? 2000 : false),
  });

export const usePoints = () => useQuery({ queryKey: ["points"], queryFn: () => api("points.ledger", undefined) });
export const useDraws = () => useQuery({ queryKey: ["draws"], queryFn: () => api("draws.list", undefined) });
export const useLeads = () => useQuery({ queryKey: ["leads"], queryFn: () => api("leads.list", undefined) });
export const useCommission = () => useQuery({ queryKey: ["commission"], queryFn: () => api("commission.ledger", undefined) });

export const useBanks = () =>
  useQuery({
    queryKey: ["banks"],
    queryFn: () => api("bank.list", undefined),
    refetchInterval: (q) => (q.state.data?.some((b) => b.state === "verifying") ? 1500 : false),
  });
