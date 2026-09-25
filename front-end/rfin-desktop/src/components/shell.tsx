"use client";
import { can, canUseMode, canVisit, ROLE_LABEL, type Mode, type Module } from "@rfin/shared";
import { FileText, IndianRupee, LayoutDashboard, Search, ShieldCheck, Trophy, UserRound, Users, Workflow, type LucideIcon } from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import type { ReactNode } from "react";
import { cn } from "@/lib/cn";
import { useSession } from "@/stores/session";
import { Brand, Button, IdentityCard, LockedState } from "./ui";

type NavItem = { label: string; href: string; icon: LucideIcon; module: Module };

/** Navigation per mode; each item is shown only if the user's roles grant `<module>.view`. */
const NAV: Record<Mode, NavItem[]> = {
  investor: [
    { label: "Home", href: "/home", icon: LayoutDashboard, module: "dashboard" },
    { label: "Discover", href: "/explore", icon: Search, module: "explore" },
    { label: "Applications", href: "/activity", icon: FileText, module: "orders" },
    { label: "KYC & bank", href: "/kyc", icon: ShieldCheck, module: "kyc" },
    { label: "Rewards", href: "/rewards", icon: Trophy, module: "rewards" },
  ],
  partner: [
    { label: "Home", href: "/partner/home", icon: LayoutDashboard, module: "partner_dashboard" },
    { label: "Leads", href: "/partner/leads", icon: Workflow, module: "leads" },
    { label: "Clients", href: "/partner/clients", icon: Users, module: "clients" },
    { label: "Earnings", href: "/partner/earnings", icon: IndianRupee, module: "earnings" },
    { label: "KYC & bank", href: "/kyc", icon: ShieldCheck, module: "kyc" },
  ],
};

const isActive = (path: string, href: string) => path === href || (href !== "/home" && href !== "/partner/home" && path.startsWith(href + "/")) || (href === "/kyc" && path.startsWith("/bank"));

/** Investor ↔ Partner — same RFIN ID, different context (report #3). */
function ModeSwitch() {
  const router = useRouter();
  const { roles, mode, setMode } = useSession();
  const modes = (["investor", "partner"] as Mode[]).filter((m) => canUseMode(roles, m));
  if (modes.length < 2) return null;
  return (
    <div role="tablist" aria-label="Mode" className="flex rounded-full border border-rfin-line/15 p-1">
      {modes.map((m) => (
        <button
          key={m}
          role="tab"
          aria-selected={m === mode}
          onClick={() => {
            if (m === mode) return;
            setMode(m);
            router.push(m === "partner" ? "/partner/home" : "/home");
          }}
          className={cn("flex-1 rounded-full px-3 py-2 text-[13px] font-semibold capitalize transition-colors", m === mode ? "bg-rfin-inverse text-rfin-on-inverse" : "hover:bg-rfin-text/5")}
        >
          {m}
        </button>
      ))}
    </div>
  );
}

function Forbidden() {
  const router = useRouter();
  const { roles, mode } = useSession();
  return (
    <div className="mx-auto max-w-lg p-8">
      <LockedState
        title="Not available for your role"
        body={`Your RFIN ID is set up as ${roles.map((r) => ROLE_LABEL[r]).join(" + ")}. This area needs a different role — you can add roles from your profile.`}
        action={{ label: "Go to profile", onClick: () => router.push("/profile") }}
      />
      <p className="mt-4 text-center font-mono text-[11px] uppercase tracking-[.18em] text-rfin-mute">403 · {mode} mode</p>
    </div>
  );
}

/**
 * Desktop frame from pixel-perfect-main: 256px sidebar (brand, numbered nav, One
 * ID card), fluid main, and — on pages that want it — a 320px right rail. Below
 * `lg` the sidebar collapses to the reference's bottom nav.
 */
export function Shell({ children }: { children: ReactNode }) {
  const path = usePathname() ?? "/";
  const { roles, mode, profile } = useSession();
  const items = NAV[mode].filter((i) => can(roles, i.module, "view" as never));
  const allowed = canVisit(roles, path) && (path.startsWith("/partner") ? mode === "partner" || canUseMode(roles, "partner") : true);

  return (
    <div className="min-h-screen bg-rfin-surface text-rfin-text">
      <div className="mx-auto flex min-h-screen max-w-[1680px]">
        <aside className="sticky top-0 hidden h-screen w-64 shrink-0 flex-col gap-8 border-r border-rfin-line/15 p-6 lg:flex rfin-rise">
          <Link href={mode === "partner" ? "/partner/home" : "/home"} aria-label="RFIN home">
            <Brand />
          </Link>
          <ModeSwitch />
          <nav className="flex flex-col gap-1 text-[15px] font-medium" aria-label="Main navigation">
            {items.map((item, index) => {
              const on = isActive(path, item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  aria-current={on ? "page" : undefined}
                  className={cn("flex items-center justify-between rounded-xl px-4 py-3 text-left transition-colors", on ? "bg-rfin-inverse text-rfin-on-inverse" : "hover:bg-rfin-text/5")}
                >
                  <span className="flex items-center gap-3">
                    <item.icon className="size-4" aria-hidden />
                    {item.label}
                  </span>
                  <span className={cn("font-mono text-xs", on ? "text-rfin-on-inverse/70" : "text-rfin-mute")}>{String(index + 1).padStart(2, "0")}</span>
                </Link>
              );
            })}
          </nav>
          <div className="mt-auto">
            <IdentityCard
              name={profile.name.split(" ")[0] || "You"}
              meta={roles.map((r) => ROLE_LABEL[r]).join(" · ")}
              action={
                <Link href="/profile" className="mt-4 flex items-center gap-2 text-xs font-semibold hover:text-rfin-red">
                  <UserRound className="size-3.5" aria-hidden /> View profile
                </Link>
              }
            />
          </div>
        </aside>

        <div className="min-w-0 flex-1 pb-24 lg:pb-0">{allowed ? children : <Forbidden />}</div>
      </div>

      <nav className="fixed inset-x-0 bottom-0 border-t border-rfin-line/15 bg-rfin-surface px-5 py-4 lg:hidden" aria-label="Main navigation">
        <div className="mx-auto flex max-w-lg items-center justify-between">
          {[...items.slice(0, 4), { label: "Profile", href: "/profile", icon: UserRound, module: "profile" as Module }].map((item) => {
            const on = isActive(path, item.href);
            return (
              <Link key={item.href} href={item.href} className={cn("flex flex-col items-center gap-1 text-[10px] font-semibold", on ? "text-rfin-red" : "text-rfin-mute")}>
                <item.icon className="size-4" aria-hidden />
                {item.label}
              </Link>
            );
          })}
        </div>
      </nav>
    </div>
  );
}

/** Main column + optional right rail (`w-80 border-l`), as in the reference. */
export function Page({ children, rail, back }: { children: ReactNode; rail?: ReactNode; back?: ReactNode }) {
  return (
    <div className="flex min-h-screen">
      <main className="min-w-0 flex-1 p-5 sm:p-8">
        {back ? <div className="mb-6">{back}</div> : null}
        <div className="mx-auto max-w-3xl space-y-8">{children}</div>
      </main>
      {rail ? <aside className="sticky top-0 hidden h-screen w-80 shrink-0 flex-col gap-6 overflow-y-auto border-l border-rfin-line/15 p-6 xl:flex rfin-rise rfin-delay-2">{rail}</aside> : null}
    </div>
  );
}

export function BackLink({ href, label = "Back" }: { href?: string; label?: string }) {
  const router = useRouter();
  return (
    <Button variant="link" onClick={() => (href ? router.push(href) : router.back())} className="!text-rfin-mute hover:!text-rfin-text">
      ← {label}
    </Button>
  );
}
