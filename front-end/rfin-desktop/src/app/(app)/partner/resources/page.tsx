"use client";
import { BookOpen, Megaphone } from "lucide-react";
import { useResources } from "@/lib/hooks";
import { Page } from "@/components/shell";
import { useToast } from "@/components/toast";
import { ActivityRow, PageTitle, QueryView, SectionLabel } from "@/components/ui";

/** Training and marketing resources (report #81, #90). */
export default function Resources() {
  const toast = useToast();
  const res = useResources();
  return (
    <Page>
      <PageTitle eyebrow="Grow" title="Learn, then share." lede="Short courses and compliance-approved material to use with clients." />
      <QueryView query={res}>
        {(r) => (
          <div className="grid gap-8 md:grid-cols-2">
            <section className="space-y-4">
              <SectionLabel>Training</SectionLabel>
              {r.training.map((t) => <button key={t.id} type="button" onClick={() => toast("Courses open in the learning portal", "info")} className="block w-full text-left"><ActivityRow icon={<BookOpen className="size-4" />} tone="info" title={t.title} detail={`${t.kind} · ${t.minutes} min`} /></button>)}
            </section>
            <section className="space-y-4">
              <SectionLabel>Marketing kit</SectionLabel>
              {r.marketing.map((m) => <button key={m.id} type="button" onClick={() => toast("Saved to your downloads", "success")} className="block w-full text-left"><ActivityRow icon={<Megaphone className="size-4" />} tone="pending" title={m.title} detail={m.kind} /></button>)}
            </section>
          </div>
        )}
      </QueryView>
    </Page>
  );
}
