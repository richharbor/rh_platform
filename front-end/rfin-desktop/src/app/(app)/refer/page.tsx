"use client";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { formatINR, NEEDS, needLabel, REFERRAL, type Need, type ReferralShare } from "@rfin/shared";
import { QRCodeSVG } from "qrcode.react";
import { useState } from "react";
import { api, track } from "@/lib/api";
import { useReferrals, useRewardsSummary } from "@/lib/hooks";
import { ago } from "@/lib/time";
import { BackLink, Page } from "@/components/shell";
import { useToast } from "@/components/toast";
import { Button, Chips, Field, PageTitle, QueryView, SectionLabel, StatusCode, TrustBanner } from "@/components/ui";

/** Refer: requirement → link / QR / WhatsApp → track (report #66, #67). */
export default function Refer() {
  const qc = useQueryClient();
  const toast = useToast();
  const summary = useRewardsSummary();
  const referrals = useReferrals();
  const [need, setNeed] = useState<Need>("grow_wealth");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [share, setShare] = useState<ReferralShare["share"]>();
  const create = useMutation({
    mutationFn: () => api("referrals.create", { need, name: name.trim(), phone: phone || undefined }),
    onSuccess: (r) => {
      track("referral_created", { need });
      setShare(r.share);
      qc.invalidateQueries({ queryKey: ["referrals"] });
    },
  });

  const rail = (
    <>
      <SectionLabel>Your referrals</SectionLabel>
      <QueryView query={referrals} empty={{ title: "None yet", body: "Every step shows up here." }}>
        {(list) => (
          <div className="divide-y divide-rfin-line/10">
            {list.map((r) => (
              <div key={r.id} className="flex items-center justify-between gap-3 py-3">
                <div><p className="text-sm font-semibold">{r.inviteeName}</p><p className="text-xs text-rfin-mute">{needLabel(r.need)} · {r.joined ? "Joined" : "Invited"} {ago(r.at)}</p></div>
                <div className="text-right"><StatusCode label={REFERRAL.label[r.state]} tone={REFERRAL.tone(r.state)} small /><p className="font-mono text-xs">{formatINR(r.reward)}</p></div>
              </div>
            ))}
          </div>
        )}
      </QueryView>
    </>
  );

  return (
    <Page rail={rail} back={<BackLink href="/rewards" label="Rewards" />}>
      <PageTitle eyebrow="Refer & earn" title="Bring someone you trust." lede={summary.data?.referral.rule} />
      {share ? (
        <div className="flex flex-col items-center gap-5 rounded-3xl border border-rfin-line/10 p-8 text-center">
          <p className="font-mono text-[11px] uppercase tracking-[.18em] text-rfin-mute">Share with {name.split(" ")[0]}</p>
          <div className="rounded-2xl bg-white p-3"><QRCodeSVG value={share.link} size={176} /></div>
          <p className="font-mono text-3xl tracking-[.15em]">{share.code}</p>
          <div className="flex flex-wrap justify-center gap-2">
            <a href={`https://wa.me/?text=${encodeURIComponent(share.message)}`} target="_blank" rel="noreferrer" className="inline-flex min-h-11 items-center rounded-full bg-rfin-inverse px-5 text-sm font-semibold text-rfin-on-inverse hover:bg-rfin-red">WhatsApp</a>
            <Button variant="outline" onClick={() => navigator.clipboard.writeText(share.link).then(() => toast("Link copied", "success"))}>Copy link</Button>
          </div>
          <Button variant="link" onClick={() => { setShare(undefined); setName(""); setPhone(""); create.reset(); }}>Refer someone else</Button>
        </div>
      ) : (
        <form className="space-y-5" onSubmit={(e) => { e.preventDefault(); create.mutate(); }}>
          <p className="font-mono text-[11px] uppercase tracking-[.18em] text-rfin-mute">What do they need help with?</p>
          <Chips value={need} onChange={setNeed} items={NEEDS.filter((n) => n.id !== "refer_someone").map((n) => ({ id: n.id, label: n.label }))} />
          <div className="grid gap-5 sm:grid-cols-2">
            <Field label="Their name" value={name} onChange={(e) => setName(e.target.value)} placeholder="Kiran" />
            <Field label="Their mobile · optional" value={phone} onChange={(e) => setPhone(e.target.value.replace(/\D/g, "").slice(0, 10))} inputMode="numeric" placeholder="98765 43210" why="Only used to link them to you when they join." error={create.error?.message} />
          </div>
          <Button type="submit" disabled={name.trim().length < 2} loading={create.isPending}>Create invite</Button>
        </form>
      )}
      <TrustBanner>Referral rewards are tracked separately from points and cash, and reverse if the referred transaction is cancelled.</TrustBanner>
    </Page>
  );
}
