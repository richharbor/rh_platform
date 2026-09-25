"use client";
import { formatINR, PAYOUT } from "@rfin/shared";
import { useCommission, usePoints } from "@/lib/hooks";
import { Page } from "@/components/shell";
import { Disclosure, PageTitle, QueryView, SectionLabel, StatusCode } from "@/components/ui";

/** Money Centre — three ledgers, never summed (report #53, #88). */
export default function Earnings() {
  const commission = useCommission();
  const points = usePoints();
  return (
    <Page>
      <PageTitle eyebrow="Money centre" title="Three ledgers. Never mixed." lede="Commission is money. Points and promotional benefits are tracked separately." />
      <div className="grid gap-8 lg:grid-cols-3">
        <section className="space-y-3 lg:col-span-2">
          <SectionLabel>Business commission</SectionLabel>
          <QueryView query={commission} empty={{ title: "No commission yet" }}>
            {(list) => (
              <div className="divide-y divide-rfin-line/10 rounded-2xl border border-rfin-line/10">
                {list.map((e) => (
                  <div key={e.id} className="flex items-center justify-between gap-4 p-4">
                    <div>
                      <p className="font-mono text-[11px] text-rfin-mute">{e.caseId ?? e.id}</p>
                      <p className="text-sm font-semibold">{e.description}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-display text-2xl">{formatINR(e.amount)}</p>
                      <StatusCode label={PAYOUT.label[e.state]} tone={PAYOUT.tone(e.state)} small />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </QueryView>
        </section>
        <div className="space-y-8">
          <section className="space-y-3">
            <SectionLabel>RFIN Points</SectionLabel>
            <QueryView query={points}>
              {(list) => (
                <div className="rounded-2xl border border-rfin-line/10 p-4">
                  <p className="font-display text-4xl">{list.reduce((s, e) => s + e.points, 0).toLocaleString("en-IN")} pts</p>
                  <p className="text-[13px] text-rfin-mute">Not cash. Can&apos;t be withdrawn.</p>
                </div>
              )}
            </QueryView>
          </section>
          <section className="space-y-3">
            <SectionLabel>Promotional benefits</SectionLabel>
            <p className="rounded-2xl border border-rfin-line/10 p-4 text-sm text-rfin-mute">No active campaign benefits.</p>
          </section>
        </div>
      </div>
      <Disclosure title="Payout terms" items={["Commission becomes available after the provider confirms the case", "TDS is deducted as applicable before payout", "Reversed cases reverse their commission"]} />
    </Page>
  );
}
