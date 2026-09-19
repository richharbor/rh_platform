import AsyncStorage from "@react-native-async-storage/async-storage";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import type { Role } from "./rfin-data";

/**
 * Auth + onboarding state machine.
 *
 *   signedOut ──sign in/up──> onboarding ──completeOnboarding──> ready
 *       ^                                                          │
 *       └──────────────────── signOut ─────────────────────────────┘
 *
 * An existing account that has already onboarded goes straight to `ready`.
 * There is no backend yet, so credentials are accepted optimistically and the
 * session is persisted to AsyncStorage; swap `fakeDelay` for real calls later.
 */
export type AuthStatus = "loading" | "signedOut" | "onboarding" | "ready";

export type AuthProfile = {
  name: string;
  phone: string;
  email: string;
  city: string;
  roles: Role[];
  /** answers captured during onboarding, keyed by step id */
  answers: Record<string, string[]>;
};

const emptyProfile: AuthProfile = {
  name: "",
  phone: "",
  email: "",
  city: "",
  roles: ["buyer"],
  answers: {},
};

type Ctx = {
  status: AuthStatus;
  profile: AuthProfile;
  /** the number awaiting OTP confirmation */
  pendingPhone: string;
  busy: boolean;
  signIn: (phone: string, password: string) => Promise<void>;
  register: (data: {
    name: string;
    phone: string;
    email: string;
    password: string;
  }) => Promise<void>;
  verifyOtp: (code: string) => Promise<boolean>;
  resendOtp: () => Promise<void>;
  setRoles: (roles: Role[]) => void;
  patchProfile: (p: Partial<AuthProfile>) => void;
  completeOnboarding: () => void;
  signOut: () => void;
};

const KEY_SESSION = "rfin.auth.session";
const KEY_PROFILE = "rfin.auth.profile";

/** Any 6 digits are accepted while there is no backend; 000000 always fails. */
export const DEMO_OTP_HINT = "Enter any 6 digits (000000 fails)";

const AuthContext = createContext<Ctx>({
  status: "loading",
  profile: emptyProfile,
  pendingPhone: "",
  busy: false,
  signIn: async () => {},
  register: async () => {},
  verifyOtp: async () => false,
  resendOtp: async () => {},
  setRoles: () => {},
  patchProfile: () => {},
  completeOnboarding: () => {},
  signOut: () => {},
});

const fakeDelay = (ms = 650) => new Promise((r) => setTimeout(r, ms));

export function AuthProvider({ children }: { children: ReactNode }) {
  const [status, setStatus] = useState<AuthStatus>("loading");
  const [profile, setProfile] = useState<AuthProfile>(emptyProfile);
  const [pendingPhone, setPendingPhone] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        const [session, saved] = await Promise.all([
          AsyncStorage.getItem(KEY_SESSION),
          AsyncStorage.getItem(KEY_PROFILE),
        ]);
        if (!alive) return;
        if (saved) setProfile({ ...emptyProfile, ...JSON.parse(saved) });
        setStatus(
          session === "ready" ? "ready" : session === "onboarding" ? "onboarding" : "signedOut",
        );
      } catch {
        if (alive) setStatus("signedOut");
      }
    })();
    return () => {
      alive = false;
    };
  }, []);

  const persist = useCallback(async (s: AuthStatus, p?: AuthProfile) => {
    try {
      await AsyncStorage.setItem(KEY_SESSION, s);
      if (p) await AsyncStorage.setItem(KEY_PROFILE, JSON.stringify(p));
    } catch {
      /* a failed write only costs the user a re-login */
    }
  }, []);

  const signIn = useCallback(async (phone: string, _password: string) => {
    setBusy(true);
    await fakeDelay();
    setPendingPhone(phone);
    setBusy(false);
  }, []);

  const register = useCallback(
    async (data: { name: string; phone: string; email: string; password: string }) => {
      setBusy(true);
      await fakeDelay();
      setProfile((p) => ({ ...p, name: data.name, phone: data.phone, email: data.email }));
      setPendingPhone(data.phone);
      setBusy(false);
    },
    [],
  );

  const verifyOtp = useCallback(
    async (code: string) => {
      setBusy(true);
      await fakeDelay(500);
      setBusy(false);
      if (!/^\d{6}$/.test(code) || code === "000000") return false;
      const next = { ...profile, phone: pendingPhone || profile.phone };
      setProfile(next);
      setStatus("onboarding");
      await persist("onboarding", next);
      return true;
    },
    [profile, pendingPhone, persist],
  );

  const resendOtp = useCallback(async () => {
    setBusy(true);
    await fakeDelay(400);
    setBusy(false);
  }, []);

  const setRoles = useCallback(
    (roles: Role[]) => setProfile((p) => ({ ...p, roles: roles.length ? roles : ["buyer"] })),
    [],
  );

  const patchProfile = useCallback((patch: Partial<AuthProfile>) => {
    setProfile((p) => ({ ...p, ...patch }));
  }, []);

  const completeOnboarding = useCallback(() => {
    setStatus("ready");
    void persist("ready", profile);
  }, [persist, profile]);

  const signOut = useCallback(() => {
    setStatus("signedOut");
    setPendingPhone("");
    void AsyncStorage.removeItem(KEY_SESSION);
  }, []);

  const value = useMemo<Ctx>(
    () => ({
      status,
      profile,
      pendingPhone,
      busy,
      signIn,
      register,
      verifyOtp,
      resendOtp,
      setRoles,
      patchProfile,
      completeOnboarding,
      signOut,
    }),
    [
      status,
      profile,
      pendingPhone,
      busy,
      signIn,
      register,
      verifyOtp,
      resendOtp,
      setRoles,
      patchProfile,
      completeOnboarding,
      signOut,
    ],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export const useAuth = () => useContext(AuthContext);
