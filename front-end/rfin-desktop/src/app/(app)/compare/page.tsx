"use client";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense } from "react";
import { useProducts } from "@/lib/hooks";
import { BackLink, Page } from "@/components/shell";
import { Button, PageTitle, QueryView } from "@/components/ui";

/** Side by side on decision-critical dimensions only (report #26). */
function Compare() {
  const router = useRouter();
  const ids = (useSearchParams().get("ids") ?? "").split(",").filter(Boolean);
  const all = useProducts();
  return (
    <Page back={<BackLink />}>
      <PageTitle eyebrow="Compare" title="Side by side." lede="Only what changes the decision: cost, what you'll need, and the main risks." />
      <QueryView query={all}>
        {(list) => {
          const items = ids.map((id) => list.find((p) => p.id === id)).filter((p) => !!p);
          if (!items.length) return null;
          const rows: [string, (p: (typeof items)[number]) => string][] = [
            ["Provider", (p) => p.provider],
            ...items[0].costs.map((c, i) => [c.label, (p: (typeof items)[number]) => p.costs[i]?.value ?? "—"] as [string, (p: (typeof items)[number]) => string]),
            ["You'll need", (p) => p.requirements.join(", ")],
            ["Main risk", (p) => p.risks[0] ?? "—"],
            ["Timeline", (p) => p.whatNext[p.whatNext.length - 1] ?? "—"],
          ];
          return (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[520px] border-collapse text-left">
                <thead>
                  <tr>
                    <th className="w-40" />
                    {items.map((p) => (
                      <th key={p.id} className="px-4 pb-4 align-bottom">
                        <p className="font-display text-2xl font-normal">{p.name}</p>
                        <Button className="mt-3" onClick={() => router.push(`/product/${p.id}`)}>
                          Choose
                        </Button>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {rows.map(([label, value]) => (
                    <tr key={label} className="border-t border-rfin-line/15">
                      <th scope="row" className="py-4 pr-4 align-top font-mono text-[11px] font-normal uppercase tracking-[.18em] text-rfin-mute">
                        {label}
                      </th>
                      {items.map((p) => (
                        <td key={p.id} className="px-4 py-4 align-top text-[15px]">
                          {value(p)}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          );
        }}
      </QueryView>
    </Page>
  );
}

export default function ComparePage() {
  return (
    <Suspense>
      <Compare />
    </Suspense>
  );
}
