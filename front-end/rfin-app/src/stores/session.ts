import AsyncStorage from "@react-native-async-storage/async-storage";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import type { Mode, Need, RfinUser, Role } from "@/domain/models";

/**
 * Session + onboarding, backed by rhserver (/rfin/me is the source of truth).
 *
 *   signedOut ──verify OTP──> onboarding ──finish──> ready
 *       ^                        │ (saved server-side; resumes on any device)
 *       └──────── signOut ───────┴──────────────────────┘
 *
 * One RFIN ID owns every role. `mode` only changes which tab set is shown and
 * stays on the device. Only the token and a cached copy of the profile are
 * persisted locally.
 */
export type Status = "signedOut" | "onboarding" | "ready";

export const ONBOARDING_STEPS = ["profile", "needs"] as const;
export type OnboardingStep = (typeof ONBOARDING_STEPS)[number];

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
  hydrated: boolean;
};

type Actions = {
  signedIn: (x: { token: string; customer: RfinUser }) => void;
  /** apply the server's copy of the customer */
  sync: (c: RfinUser) => void;
  saveProfile: (p: Profile) => Promise<void>;
  saveNeeds: (n: Need[]) => void;
  finishOnboarding: () => Promise<void>;
  setMode: (m: Mode) => void;
  setRoles: (r: Role[]) => Promise<void>;
  addRole: (r: Role) => Promise<void>;
  signOut: () => void;
};

const initial: Omit<State, "hydrated"> = {
  status: "signedOut",
  profile: { name: "", email: "", city: "" },
  needs: [],
  roles: ["buyer"],
  mode: "investor",
  step: "profile",
};

// Lazy import: api/client reads the token from this store.
const api = () => import("@/api/client").then((m) => m.api);

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
      hydrated: false,
      signedIn: ({ token, customer }) => set({ ...initial, token, ...fromCustomer(customer) }),
      sync: (c) =>
        set((s) => {
          const next = fromCustomer(c);
          // Roles may have changed elsewhere; drop out of a mode they no longer allow.
          const mode = s.mode === "partner" && !c.roles.includes("partner") ? "investor" : s.mode;
          return { ...next, mode };
        }),
      saveProfile: async (profile) => {
        const c = await (await api())("me.update", profile);
        get().sync(c);
        set({ step: "needs" });
      },
      saveNeeds: (needs) => {
        set({ needs });
        // save-and-resume (report #13): best effort, finishOnboarding re-sends.
        api()
          .then((call) => call("me.update", { needs }))
          .catch(() => {});
      },
      finishOnboarding: async () => {
        const c = await (await api())("me.update", { needs: get().needs, onboarded: true });
        get().sync(c);
      },
      setMode: (mode) => set({ mode }),
      setRoles: async (roles) => {
        const c = await (await api())("me.update", { roles });
        get().sync(c);
      },
      addRole: async (r) => {
        const roles = get().roles;
        if (!roles.includes(r)) await get().setRoles([...roles, r]);
      },
      signOut: () => set({ ...initial }),
    }),
    {
      name: "rfin.session",
      storage: createJSONStorage(() => AsyncStorage),
      partialize: ({ hydrated: _h, ...rest }) => rest,
      // v2: server-backed sessions. Anything older has no token — start signed out.
      version: 2,
      migrate: () => ({ ...initial }) as State & Actions,
      onRehydrateStorage: () => () => useSession.setState({ hydrated: true }),
    },
  ),
);

export const isPartner = (roles: Role[]) => roles.includes("partner");
