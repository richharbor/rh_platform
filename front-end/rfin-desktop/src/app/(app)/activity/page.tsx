"use client";
import { formatINR, ORDER } from "@rfin/shared";
import { useRouter } from "next/navigation";
import { useOrders } from "@/lib/hooks";
import { Page } from "@/components/shell";
import { PageTitle, QueryView, SectionLabel, StatusCode } from "@/components/ui";

/** Applications & orders (report #44). Full activity centre arrives in step 4. */
export default function Activity() {
  const router = useRouter();
  const orders = useOrders();
  return (
    <Page>
      <PageTitle eyebrow="Applications" title="Everything in motion." lede="Applications, orders and payments — and exactly what's next." />
      <QueryView query={orders} empty={{ title: "Nothing yet", body: "When you apply or invest, every step shows up here.", action: { label: "Discover products", onClick: () => router.push("/explore") } }}>
        {(list) => (
          <section className="space-y-3">
            <SectionLabel>{`${list.length} total`}</SectionLabel>
            <div className="divide-y divide-rfin-line/10 rounded-2xl border border-rfin-line/10">
              {list.map((o) => (
                <button key={o.id} type="button" onClick={() => router.push(`/order/${o.id}`)} className="grid w-full grid-cols-[1fr_auto] items-center gap-x-6 gap-y-1 p-4 text-left hover:bg-rfin-text/5 sm:grid-cols-[120px_1fr_auto_auto]">
                  <span className="font-mono text-[11px] text-rfin-mute">{o.id}</span>
                  <span className="text-sm font-semibold">{o.title}</span>
                  <span className="font-display text-xl">{formatINR(o.amount)}</span>
                  <StatusCode label={ORDER.label[o.state]} tone={ORDER.tone(o.state)} />
                  {o.action ? <span className="col-span-full text-xs text-rfin-mute sm:col-start-2">Next · {o.action.label}</span> : null}
                </button>
              ))}
            </div>
          </section>
        )}
      </QueryView>
    </Page>
  );
}
