"use client";
import type { DocumentItem, Tone } from "@rfin/shared";
import { FileText } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useDocuments } from "@/lib/hooks";
import { ago } from "@/lib/time";
import { Page } from "@/components/shell";
import { useToast } from "@/components/toast";
import { Button, Chips, PageTitle, QueryView, StatusCode } from "@/components/ui";

const KIND: Record<DocumentItem["kind"], string> = { policy: "Policies", receipt: "Receipts", sanction: "Loan letters", statement: "Statements", kyc: "KYC" };
const STATE: Record<DocumentItem["state"], { label: string; tone: Tone }> = {
  available: { label: "Available", tone: "success" },
  in_review: { label: "In review", tone: "pending" },
  requested: { label: "Needed", tone: "action" },
  expired: { label: "Expired", tone: "neutral" },
};

/** Documents centre (report #46). */
export default function Documents() {
  const router = useRouter();
  const toast = useToast();
  const docs = useDocuments();
  const [kind, setKind] = useState<"all" | DocumentItem["kind"]>("all");
  const kinds = [...new Set((docs.data ?? []).map((d) => d.kind))];
  return (
    <Page>
      <PageTitle eyebrow="Documents" title="Every record, one place." lede="Policies, receipts and KYC appear here the moment they're issued." />
      <Chips value={kind} onChange={setKind} items={[{ id: "all" as const, label: "All" }, ...kinds.map((k) => ({ id: k, label: KIND[k] }))]} />
      <QueryView query={docs} empty={{ title: "No documents yet", body: "Complete an application and its documents land here." }}>
        {(list) => (
          <div className="divide-y divide-rfin-line/10 rounded-2xl border border-rfin-line/10">
            {list
              .filter((d) => kind === "all" || d.kind === kind)
              .map((d) => (
                <div key={d.id} className="flex items-center gap-4 p-4">
                  <div className="grid h-11 w-9 shrink-0 place-items-center rounded-lg border border-rfin-line/15">
                    <FileText className="size-4" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-semibold">{d.title}</p>
                    <p className="text-xs text-rfin-mute">
                      {KIND[d.kind]} · {ago(d.at)}
                      {d.orderId ? (
                        <>
                          {" · "}
                          <button className="font-semibold hover:text-rfin-red" onClick={() => router.push(`/order/${d.orderId}`)}>{d.orderId}</button>
                        </>
                      ) : null}
                    </p>
                  </div>
                  <StatusCode label={STATE[d.state].label} tone={STATE[d.state].tone} />
                  {d.state === "available" ? (
                    <Button variant="outline" onClick={() => toast("Downloads arrive with file storage (S3)", "info")}>Download</Button>
                  ) : d.state === "requested" && d.kycItem ? (
                    <Button variant="red" onClick={() => router.push(`/kyc/upload/${d.kycItem}`)}>Upload</Button>
                  ) : null}
                </div>
              ))}
          </div>
        )}
      </QueryView>
    </Page>
  );
}
