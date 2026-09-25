"use client";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { can } from "@rfin/shared";
import { useEffect, useRef, useState } from "react";
import { api } from "@/lib/api";
import { useBanks } from "@/lib/hooks";
import { useSession } from "@/stores/session";
import { BackLink, Page } from "@/components/shell";
import { Button, Field, PageTitle, QueryView, SectionLabel, StatusCode, TrustBanner } from "@/components/ui";

const TONE = { verifying: "pending", verified: "success", failed: "action" } as const;
const LABEL = { verifying: "Verifying", verified: "Verified", failed: "Failed" } as const;

/** Bank details with a visible verification state (report #36). */
export default function Bank() {
  const qc = useQueryClient();
  const roles = useSession((s) => s.roles);
  const banks = useBanks();
  const [holder, setHolder] = useState("");
  const [account, setAccount] = useState("");
  const [confirm, setConfirm] = useState("");
  const [ifsc, setIfsc] = useState("");
  const [adding, setAdding] = useState(false);

  // A finished penny-drop also completes the bank KYC item.
  const verifying = banks.data?.filter((b) => b.state === "verifying").length ?? 0;
  const prev = useRef(verifying);
  useEffect(() => {
    if (verifying < prev.current) qc.invalidateQueries({ queryKey: ["kyc"] });
    prev.current = verifying;
  }, [verifying, qc]);

  const add = useMutation({
    mutationFn: () => api("bank.add", { holder: holder.trim(), account, ifsc }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["banks"] });
      setAdding(false);
      setAccount("");
      setConfirm("");
      setIfsc("");
    },
  });

  const valid = holder.trim().length > 2 && account.length >= 9 && confirm === account && ifsc.length === 11;
  const showForm = can(roles, "bank", "add") && (adding || (banks.isSuccess && !banks.data.length));

  return (
    <Page back={<BackLink href="/kyc" label="KYC" />}>
      <PageTitle eyebrow="Bank" title="Where your money lands." lede="Payouts, refunds and loan disbursals go here. We verify it by sending ₹1." />
      <QueryView query={banks}>
        {(list) =>
          list.length ? (
            <section className="space-y-3">
              <SectionLabel>Your accounts</SectionLabel>
              {list.map((b) => (
                <div key={b.id} className="space-y-1.5 rounded-2xl border border-rfin-line/10 p-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-semibold">{b.bank}</span>
                    <StatusCode label={LABEL[b.state]} tone={TONE[b.state]} />
                  </div>
                  <p className="font-mono text-[11px] text-rfin-mute">
                    •••• {b.last4} · {b.ifsc}
                    {b.primary ? " · PRIMARY" : ""}
                  </p>
                  {b.failureReason ? <p className="text-xs text-rfin-red">{b.failureReason}</p> : null}
                  {b.state === "verifying" ? <p className="text-xs text-rfin-mute">Usually under a minute.</p> : null}
                </div>
              ))}
              {!adding && can(roles, "bank", "add") ? <Button variant="outline" onClick={() => setAdding(true)}>Add another account</Button> : null}
            </section>
          ) : null
        }
      </QueryView>

      {showForm ? (
        <form className="grid gap-5 sm:grid-cols-2" onSubmit={(e) => { e.preventDefault(); if (valid) add.mutate(); }}>
          <Field className="sm:col-span-2" label="Account holder name" value={holder} onChange={(e) => setHolder(e.target.value)} autoComplete="name" placeholder="As printed on your passbook" why="Must match your PAN name for payouts to succeed." />
          <Field label="Account number" type="password" value={account} onChange={(e) => setAccount(e.target.value.replace(/\D/g, "").slice(0, 18))} inputMode="numeric" placeholder="••••••••••" />
          <Field label="Confirm account number" value={confirm} onChange={(e) => setConfirm(e.target.value.replace(/\D/g, "").slice(0, 18))} inputMode="numeric" placeholder="Type it again" error={confirm && confirm !== account ? "The numbers don't match" : undefined} />
          <Field label="IFSC" value={ifsc} onChange={(e) => setIfsc(e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, "").slice(0, 11))} placeholder="HDFC0001234" why="11 characters, printed on your cheque book." error={add.error?.message} />
          <div className="flex items-end">
            <Button type="submit" block disabled={!valid} loading={add.isPending}>Verify account</Button>
          </div>
          <p className="text-xs text-rfin-mute sm:col-span-2">We&apos;ll deposit ₹1 to confirm the name matches. Mock: account numbers ending 0000 fail verification.</p>
        </form>
      ) : null}
      <TrustBanner>RFIN never debits this account. It&apos;s used only to send money to you.</TrustBanner>
    </Page>
  );
}
