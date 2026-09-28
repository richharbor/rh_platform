import { QueryClient } from "@tanstack/react-query";
import { createHttpTransport } from "@rfin/shared/http";
import { Platform } from "react-native";
import { useSession } from "@/stores/session";
import type { Op, Ops, RequestOptions, Transport } from "./transport";

/**
 * rhserver's /rfin API. Set EXPO_PUBLIC_API_URL for a device on the network;
 * the defaults reach a local server from the iOS simulator / Android emulator.
 */
export const API_URL = process.env.EXPO_PUBLIC_API_URL ?? (Platform.OS === "android" ? "http://10.0.2.2:5050" : "http://localhost:5050");

const transport: Transport = createHttpTransport({
  baseUrl: API_URL,
  getToken: () => useSession.getState().token,
  // Expired / revoked token, or a session from before sign-in was server-backed.
  onUnauthorized: () => {
    if (useSession.getState().status !== "signedOut") useSession.getState().signOut();
  },
});

export const api = <K extends Op>(op: K, input: Ops[K]["in"], opts?: RequestOptions) => transport.request(op, input, opts);

export const newIdempotencyKey = () => `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;

export const queryClient = new QueryClient({
  defaultOptions: { queries: { staleTime: 30_000, retry: 1 } },
});
