"use client";
import { QueryClientProvider } from "@tanstack/react-query";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState, type ReactNode } from "react";
import { api, makeQueryClient } from "@/lib/api";
import { useHydrated, useSession } from "@/stores/session";
import { useThemePref } from "@/stores/theme";
import { ToastProvider } from "./toast";

const SIGNED_OUT = ["/welcome", "/phone", "/otp"];
const ONBOARDING = { profile: "/profile-setup", needs: "/needs" } as const;

/**
 * Route gate — same rules as the Expo app: signed-out users stay in the sign-in
 * screens, onboarding resumes at its saved step, ready users land on their mode's home.
 */
function AuthGate({ children }: { children: ReactNode }) {
  const router = useRouter();
  const path = usePathname() ?? "/";
  const hydrated = useHydrated();
  const { status, step, mode } = useSession();

  const target = (() => {
    if (!hydrated || path.startsWith("/dev")) return null;
    if (status === "signedOut") return SIGNED_OUT.includes(path) ? null : "/welcome";
    if (status === "onboarding") return path === ONBOARDING[step] ? null : ONBOARDING[step];
    const inAuth = SIGNED_OUT.includes(path) || Object.values(ONBOARDING).includes(path as never) || path === "/";
    return inAuth ? (mode === "partner" ? "/partner/home" : "/home") : null;
  })();

  useEffect(() => {
    if (target) router.replace(target);
  }, [target, router]);

  // Pull the server's copy of the profile on load (roles / onboarding may have changed elsewhere).
  const token = useSession((s) => s.token);
  useEffect(() => {
    if (!hydrated || !token) return;
    api("me.get", undefined).then(useSession.getState().sync).catch(() => {});
  }, [hydrated, token]);

  if (!hydrated || target) {
    return (
      <div className="grid min-h-screen place-items-center">
        <span className="size-5 animate-spin rounded-full border-2 border-rfin-text border-t-transparent" aria-label="Loading" />
      </div>
    );
  }
  return <>{children}</>;
}

function ThemeClass() {
  const pref = useThemePref((s) => s.pref);
  useEffect(() => {
    const mq = window.matchMedia("(prefers-color-scheme: dark)");
    const apply = () => document.documentElement.classList.toggle("dark", pref === "dark" || (pref === "system" && mq.matches));
    apply();
    mq.addEventListener("change", apply);
    return () => mq.removeEventListener("change", apply);
  }, [pref]);
  return null;
}

export function Providers({ children }: { children: ReactNode }) {
  const [qc] = useState(makeQueryClient);
  return (
    <QueryClientProvider client={qc}>
      <ToastProvider>
        <ThemeClass />
        <AuthGate>{children}</AuthGate>
      </ToastProvider>
    </QueryClientProvider>
  );
}
