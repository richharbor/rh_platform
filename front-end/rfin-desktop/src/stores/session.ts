"use client";
import { useEffect, useState } from "react";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import { canUseMode, type Mode, type Need, type RfinUser, type Role } from "@rfin/shared";

/**
 * Same session machine as the Expo app, backed by rhserver (/rfin/me is the
 * source of truth): signedOut → onboarding (saved server-side) → ready.
 * One RFIN ID, many roles; `mode` only picks the navigation and stays local.
 * The token and a cached profile are persisted to localStorage.
 */
export type Status = "signedOut" | "onboarding" | "ready";
export type OnboardingStep = "profile" | "needs";
export type Profile = { name: string; email: string; city: string };

type State = {
  status: Status;
  token?: string;
  rfinId?: string;
  phone?: string;
  profile: Profile;
  needs: Need[];
  roles: Role[];
  mode: Mode;
  step: OnboardingStep;
};

type Actions = {
  signedIn: (x: { token: string; customer: RfinUser }) => void;
  sync: (c: RfinUser) => void;
  saveProfile: (p: Profile) => Promise<void>;
  saveNeeds: (n: Need[]) => void;
  finishOnboarding: () => Promise<void>;
  setMode: (m: Mode) => void;
  setRoles: (r: Role[]) => Promise<void>;
  signOut: () => void;
};

const initial: State = {
  status: "signedOut",
  profile: { name: "", email: "", city: "" },
  needs: [],
  roles: ["buyer"],
  mode: "investor",
  step: "profile",
};

// Lazy: lib/api reads the token from this store.
const api = () => import("@/lib/api").then((m) => m.api);

const fromCustomer = (c: RfinUser) => ({
  rfinId: c.rfinId,
  phone: c.phone,
  profile: { name: c.name ?? "", email: c.email ?? "", city: c.city ?? "" },
  needs: c.needs,
  roles: c.roles,
  status: (c.onboarded ? "ready" : "onboarding") as Status,
  step: (c.name ? "needs" : "profile") as OnboardingStep,
});

export const useSession = create<State & Actions>()(
  persist(
    (set, get) => ({
      ...initial,
      signedIn: ({ token, customer }) => set({ ...initial, token, ...fromCustomer(customer) }),
      // Keep the current mode if the roles still allow it, else fall back to one they do.
      sync: (c) => set((s) => ({ ...fromCustomer(c), mode: canUseMode(c.roles, s.mode) ? s.mode : s.mode === "partner" ? "investor" : "partner" })),
      saveProfile: async (profile) => {
        get().sync(await (await api())("me.update", profile));
        set({ step: "needs" });
      },
      saveNeeds: (needs) => {
        set({ needs });
        api().then((call) => call("me.update", { needs })).catch(() => {});
      },
      finishOnboarding: async () => {
        get().sync(await (await api())("me.update", { needs: get().needs, onboarded: true }));
      },
      setMode: (mode) => set({ mode }),
      setRoles: async (roles) => {
        get().sync(await (await api())("me.update", { roles }));
      },
      signOut: () => set({ ...initial }),
    }),
    {
      name: "rfin.session",
      storage: createJSONStorage(() => localStorage),
      // v2: server-backed sessions. Anything older has no token — start signed out.
      version: 2,
      migrate: () => ({ ...initial }) as State & Actions,
    },
  ),
);

/**
 * True once localStorage has been read. localStorage rehydrates synchronously
 * during store creation, so this reads zustand's own flag. Starts false on the
 * server and the first client render, so markup matches.
 */
export function useHydrated() {
  const [done, setDone] = useState(false);
  useEffect(() => {
    setDone(useSession.persist.hasHydrated());
    return useSession.persist.onFinishHydration(() => setDone(true));
  }, []);
  return done;
}
