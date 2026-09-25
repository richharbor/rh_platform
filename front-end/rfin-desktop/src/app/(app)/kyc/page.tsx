"use client";
import { can, KYC } from "@rfin/shared";
import { ChevronRight } from "lucide-react";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/cn";
import { useBanks, useKyc } from "@/lib/hooks";
import { useSession } from "@/stores/session";
import { Page } from "@/components/shell";
import { PageTitle, ProgressBar, QueryView, SectionLabel, StatusCode, TrustBanner } from "@/components/ui";

/** Explicit checklist — never a bare "KYC pending" (report #34). */
export default function KycChecklist() {
  const router = useRouter();
  const roles = useSession((s) => s.roles);
  const kyc = useKyc();
  const banks = useBanks();
  const canUpload = can(roles, "kyc", "upload");

  const rail = (
    <>
      <SectionLabel>Bank accounts</SectionLabel>
      <QueryView query={banks} empty={{ title: "None yet", body: "Add one for payouts and refunds.", action: { label: "Add bank", onClick: () => router.push("/bank") } }}>
        {(list) => (
          <div className="space-y-3">
            {list.map((b) => (
              <button key={b.id} type="button" onClick={() => router.push("/bank")} className="w-full rounded-2xl border border-rfin-line/10 p-4 text-left hover:bg-rfin-text/5">
                <div className="flex justify-between">
                  <span className="text-sm font-semibold">{b.bank}</span>
                  <StatusCode label={b.state} tone={b.state === "verified" ? "success" : b.state === "failed" ? "action" : "pending"} small />
                </div>
                <p className="mt-1 font-mono text-[11px] text-rfin-mute">•••• {b.last4}</p>
              </button>
            ))}
          </div>
        )}
      </QueryView>
    </>
  );

  return (
    <Page rail={rail}>
      <PageTitle eyebrow="KYC" title="Verify once, use everywhere." lede="Each check says why it's needed. Do them in any order — progress is saved." />
      <QueryView query={kyc}>
        {(items) => {
          const done = items.filter((i) => i.state === "verified").length;
          return (
            <div className="space-y-4">
              <div className="space-y-2">
                <div className="flex justify-between font-mono text-[11px] uppercase tracking-[.18em] text-rfin-mute">
                  <span>Progress</span>
                  <span className="tracking-normal">
                    {done} / {items.length}
                  </span>
                </div>
                <ProgressBar value={(done / items.length) * 100} tone={done === items.length ? "success" : "info"} thick />
              </div>
              {items.map((k) => {
                const actionable = k.state !== "verified" && k.state !== "in_progress" && canUpload;
                return (
                  <button
                    key={k.id}
                    type="button"
                    disabled={!actionable}
                    onClick={() => router.push(k.id === "bank" ? "/bank" : `/kyc/upload/${k.id}`)}
                    className={cn("block w-full space-y-1.5 rounded-2xl border p-4 text-left transition-colors enabled:hover:bg-rfin-text/5", k.state === "action_required" ? "border-rfin-red" : "border-rfin-line/10")}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-semibold">{k.label}</span>
                      <span className="flex items-center gap-1.5">
                        <StatusCode label={k.state === "in_progress" ? "In review" : KYC.label[k.state]} tone={KYC.tone(k.state)} />
                        {actionable ? <ChevronRight className="size-4 text-rfin-mute" /> : null}
                      </span>
                    </div>
                    <p className={cn("text-xs", k.rejectionReason ? "text-rfin-red" : "text-rfin-mute")}>{k.rejectionReason ?? k.why}</p>
                  </button>
                );
              })}
              {done === items.length ? <TrustBanner>You&apos;re fully verified. You won&apos;t be asked again unless something expires.</TrustBanner> : null}
            </div>
          );
        }}
      </QueryView>
    </Page>
  );
}
