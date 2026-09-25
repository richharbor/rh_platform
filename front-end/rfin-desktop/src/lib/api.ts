import { QueryClient } from "@tanstack/react-query";
import { createHttpTransport, type EventName, type Op, type Ops, type RequestOptions, type Transport } from "@rfin/shared";
import { useSession } from "@/stores/session";

/** rhserver's /rfin API (NEXT_PUBLIC_API_URL in .env.local). */
export const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:5050";

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

export const makeQueryClient = () => new QueryClient({ defaultOptions: { queries: { staleTime: 30_000, retry: 1 } } });

export function track(event: EventName, props: Record<string, unknown> = {}) {
  if (process.env.NODE_ENV !== "production") console.log("[analytics]", event, props);
}
