"use client";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { formatINR } from "@rfin/shared";
import { useParams, useRouter } from "next/navigation";
import { api } from "@/lib/api";
import { useListing } from "@/lib/hooks";
import { LISTING, LISTING_STEPS } from "@/lib/markets";
import { BackLink, Page } from "@/components/shell";
import { Button, QueryView, SectionLabel, StatusCode, Stepper, SupportPanel, Timeline } from "@/components/ui";

/** Listing status: Match → Approvals → Transfer → Paid (report #93). */
export default function ListingStatus() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const qc = useQueryClient();
  const listing = useListing(id);
  const cancel = useMutation({
    mutationFn: () => api("listings.cancel", { id }),
    onSuccess: (l) => {
      qc.setQueryData(["listing", id], l);
      qc.invalidateQueries({ queryKey: ["portfolio"] });
    },
  });
  return (
    <Page back={<BackLink href="/portfolio" label="Portfolio" />}>
      <QueryView query={listing}>
        {(l) => (
          <>
            <header className="space-y-3">
              <StatusCode label={LISTING[l.state].label} tone={LISTING[l.state].tone} />
              <h1 className="font-display text-5xl leading-[.95] tracking-tight sm:text-6xl">{l.state === "paid" ? "Sold." : l.state === "cancelled" ? "Listing cancelled." : `${l.quantity} ${l.companyName} shares.`}</h1>
            </header>
            {l.state !== "cancelled" ? <Stepper steps={["Verify", "Listed", "Matched", "Approvals", "Transfer", "Paid"]} current={Math.max(0, LISTING_STEPS.indexOf(l.state))} /> : null}
            <div className="rounded-2xl border border-rfin-line/10 p-5">
              <p className="font-mono text-[11px] uppercase tracking-[.18em] text-rfin-mute">{l.state === "paid" ? "Paid to your bank" : "Asking"}</p>
              <p className="mt-1 font-display text-5xl">{l.state === "paid" && l.proceeds ? formatINR(l.proceeds) : `${formatINR(l.ask)} / share`}</p>
              {l.buyerInterest ? <p className="text-[13px] text-rfin-mute">{l.buyerInterest} interested buyers</p> : null}
            </div>
            <section className="space-y-4"><SectionLabel>Timeline</SectionLabel><Timeline steps={l.timeline} /></section>
            {["verifying", "listed"].includes(l.state) ? <Button variant="outline" loading={cancel.isPending} onClick={() => cancel.mutate()}>Cancel listing</Button> : null}
            {cancel.isError ? <p className="text-xs text-rfin-red">{cancel.error.message}</p> : null}
            <SupportPanel body={`Questions about ${l.id}? An advisor can see where it is in the transfer.`} onClick={() => router.push(`/support?contextType=listing&contextId=${l.id}&subject=${encodeURIComponent(`About listing ${l.id}`)}`)} />
          </>
        )}
      </QueryView>
    </Page>
  );
}
