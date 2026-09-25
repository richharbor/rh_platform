"use client";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { formatINR, GIFT_CARD } from "@rfin/shared";
import { Copy } from "lucide-react";
import { useParams } from "next/navigation";
import { api } from "@/lib/api";
import { useBenefit } from "@/lib/hooks";
import { shortDate } from "@/lib/markets";
import { BackLink, Page } from "@/components/shell";
import { useToast } from "@/components/toast";
import { Button, Disclosure, QueryView, StatusCode } from "@/components/ui";

/** Gift-card detail (report #58). */
export default function BenefitDetail() {
  const { id } = useParams<{ id: string }>();
  const qc = useQueryClient();
  const toast = useToast();
  const benefit = useBenefit(Number(id));
  const redeem = useMutation({
    mutationFn: () => api("benefits.redeem", { id: Number(id) }),
    onSuccess: (b) => {
      qc.setQueryData(["benefit", Number(id)], b);
      qc.invalidateQueries({ queryKey: ["benefits"] });
      toast("Marked as used", "success");
    },
    onError: (e: Error) => toast(e.message, "danger"),
  });
  return (
    <Page back={<BackLink href="/rewards" label="Rewards" />}>
      <QueryView query={benefit}>
        {(b) => (
          <>
            <div className="space-y-5 rounded-3xl bg-rfin-inverse p-7 text-rfin-on-inverse">
              <div className="flex justify-between"><span className="font-mono text-[11px] uppercase tracking-widest text-rfin-amber">{b.issuer}</span><StatusCode label={GIFT_CARD.label[b.state]} tone={GIFT_CARD.tone(b.state)} /></div>
              <p className="font-display text-7xl">{formatINR(b.value)}</p>
              <p className="text-sm text-rfin-on-inverse/60">{b.title}</p>
              {b.code ? (
                <div className="flex items-center justify-between border-t border-rfin-on-inverse/20 pt-4">
                  <span className="font-mono text-2xl tracking-[.15em]">{b.code}</span>
                  <Button variant="paper" onClick={() => navigator.clipboard.writeText(b.code!).then(() => toast("Code copied", "success"))}><Copy className="size-4" /> Copy</Button>
                </div>
              ) : (
                <p className="font-mono text-xs text-rfin-on-inverse/60">{b.state === "processing" ? "ISSUING — USUALLY A FEW SECONDS" : "CODE NO LONGER AVAILABLE"}</p>
              )}
            </div>
            <div className="divide-y divide-rfin-line/10 rounded-2xl border border-rfin-line/10">
              {[["Issued", shortDate(b.at)], ["Valid until", shortDate(b.expiresAt)], ["Earned from", b.sourceRef ? `${b.source === "first_txn" ? "First transaction" : b.source} · ${b.sourceRef}` : b.source], ["Used", b.redeemedAt ? shortDate(b.redeemedAt) : "Not yet"]].map(([k, v]) => (
                <div key={k} className="flex justify-between p-4"><span className="text-[13px] text-rfin-mute">{k}</span><span className="text-sm font-semibold">{v}</span></div>
              ))}
            </div>
            <Disclosure title="Terms" items={[b.terms, "Redeem at checkout on the issuer's site by entering the code."]} />
            {["ready", "partially_used"].includes(b.state) ? <Button variant="outline" loading={redeem.isPending} onClick={() => redeem.mutate()}>I&apos;ve used this</Button> : null}
          </>
        )}
      </QueryView>
    </Page>
  );
}
