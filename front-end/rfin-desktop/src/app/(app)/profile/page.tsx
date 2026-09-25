"use client";
import { MODULES, needLabel, ROLE_GRANTS, ROLE_LABEL, type Module, type Role } from "@rfin/shared";
import { Check, Minus } from "lucide-react";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/cn";
import { useSession } from "@/stores/session";
import { useThemePref, type ThemePref } from "@/stores/theme";
import { Page } from "@/components/shell";
import { useToast } from "@/components/toast";
import { Button, PageTitle, SectionLabel } from "@/components/ui";

const ROLES: Role[] = ["buyer", "seller", "partner"];
const ROLE_BLURB: Record<Role, string> = {
  buyer: "Apply for insurance, loans and investments; buy private-market shares.",
  seller: "Everything a buyer can do, plus selling private-market holdings.",
  partner: "Refer clients and track leads, cases and earnings.",
};

/** One identity, many roles (report #2, #3). Roles decide permissions; see rhserver/shared/rfin/src/rbac.json (enforced server-side too). */
export default function Profile() {
  const router = useRouter();
  const toast = useToast();
  const { profile, phone, rfinId, needs, roles, setRoles, signOut } = useSession();
  const { pref, setPref } = useThemePref();

  const toggle = (r: Role) => {
    // Partner is granted by onboarding + verification, never toggled on (report #79).
    if (r === "partner" && !roles.includes("partner")) return router.push("/partner/onboarding");
    const next = roles.includes(r) ? roles.filter((x) => x !== r) : [...roles, r];
    if (!next.length) return toast("Keep at least one role", "action");
    setRoles(next)
      .then(() => toast(`${ROLE_LABEL[r]} ${roles.includes(r) ? "removed" : "added"}`, "success"))
      .catch((e: Error) => toast(e.message, "danger"));
  };

  const modules = Object.keys(MODULES) as Module[];

  return (
    <Page>
      <PageTitle eyebrow="Profile" title="One ID." lede={`${rfinId ?? "RFIN"} · +91 ${phone ?? ""} · ${profile.name || "Name not set"}${profile.city ? " · " + profile.city : ""}`} />

      <section className="space-y-4">
        <SectionLabel>Roles</SectionLabel>
        <p className="text-sm text-rfin-mute">Same RFIN ID for every role — no duplicate accounts. Becoming a partner runs through a short onboarding and verification; activation issues your Partner ID.</p>
        <div className="grid gap-3 md:grid-cols-3">
          {ROLES.map((r) => {
            const on = roles.includes(r);
            return (
              <button key={r} type="button" role="switch" aria-checked={on} onClick={() => toggle(r)} className={cn("space-y-2 rounded-2xl p-4 text-left transition-colors", on ? "border-2 border-rfin-text" : "border border-rfin-line/10 hover:bg-rfin-text/5")}>
                <div className="flex items-center justify-between">
                  <span className="font-display text-2xl">{ROLE_LABEL[r]}</span>
                  <span className={cn("grid size-5 place-items-center rounded-full", on ? "bg-rfin-green text-rfin-paper" : "border border-rfin-line/25")}>{on ? <Check className="size-3.5" /> : null}</span>
                </div>
                <p className="text-xs leading-relaxed text-rfin-mute">{ROLE_BLURB[r]}</p>
              </button>
            );
          })}
        </div>
      </section>

      <section className="space-y-4">
        <SectionLabel>What each role can do</SectionLabel>
        <div className="overflow-x-auto rounded-2xl border border-rfin-line/10">
          <table className="w-full min-w-[560px] text-left text-sm">
            <thead>
              <tr className="border-b border-rfin-line/10">
                <th className="p-3 font-mono text-[11px] font-normal uppercase tracking-[.18em] text-rfin-mute">Module</th>
                {ROLES.map((r) => (
                  <th key={r} className={cn("p-3 font-mono text-[11px] font-normal uppercase tracking-[.18em]", roles.includes(r) ? "text-rfin-text" : "text-rfin-mute")}>{ROLE_LABEL[r]}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {modules.map((m) => (
                <tr key={m} className="border-b border-rfin-line/10 last:border-0">
                  <td className="p-3 font-semibold capitalize">{m.replace(/_/g, " ")}</td>
                  {ROLES.map((r) => {
                    const acts = (ROLE_GRANTS[r][m] ?? []) as readonly string[];
                    return (
                      <td key={r} className="p-3 text-xs text-rfin-mute">
                        {acts.length ? acts.map((a) => a.replace(/_/g, " ")).join(" · ") : <Minus className="size-3.5" aria-label="No access" />}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section className="space-y-3">
        <SectionLabel>Your goals</SectionLabel>
        <p className="text-sm text-rfin-mute">{needs.length ? needs.map(needLabel).join(" · ") : "No goals picked yet."}</p>
      </section>

      <section className="space-y-3">
        <SectionLabel>Appearance</SectionLabel>
        <div role="radiogroup" aria-label="Theme" className="inline-flex rounded-full border border-rfin-line/15 p-1">
          {(["system", "light", "dark"] as ThemePref[]).map((p) => (
            <button key={p} role="radio" aria-checked={pref === p} onClick={() => setPref(p)} className={cn("rounded-full px-4 py-2 text-[13px] font-semibold capitalize", pref === p ? "bg-rfin-inverse text-rfin-on-inverse" : "hover:bg-rfin-text/5")}>
              {p}
            </button>
          ))}
        </div>
      </section>

      <div className="flex flex-wrap gap-3 border-t border-rfin-line/15 pt-6">
        <Button variant="outline" onClick={() => router.push("/kyc")}>KYC &amp; bank</Button>
        <Button variant="outline" onClick={() => router.push("/profile/financial")}>Financial profile</Button>
        <Button variant="outline" onClick={() => router.push("/family")}>Family</Button>
        <Button variant="outline" onClick={() => router.push("/goals")}>Goals</Button>
        {process.env.NODE_ENV !== "production" ? <Button variant="outline" onClick={() => router.push("/dev")}>Mock scenarios</Button> : null}
        <Button variant="outline" onClick={signOut}>Sign out</Button>
      </div>
    </Page>
  );
}
