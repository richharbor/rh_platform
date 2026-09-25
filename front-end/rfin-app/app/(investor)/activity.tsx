import { useOrders } from "@/api/hooks";
import { OrderCard, QueryView, Screen, Section, Timeline } from "@/ui";

/** Activity centre (report #44). Full order detail + actions arrive in step 4. */
export default function Activity() {
  const orders = useOrders();
  return (
    <Screen eyebrow="Activity" title="Everything in motion." subtitle="Applications, orders and payments — and exactly what's next.">
      <QueryView query={orders} empty={{ title: "Nothing yet", body: "When you apply or invest, every step shows up here." }}>
        {(list) =>
          list.map((o) => (
            <Section key={o.id} title={o.id}>
              <OrderCard order={o} />
              <Timeline steps={o.timeline} />
            </Section>
          ))
        }
      </QueryView>
    </Screen>
  );
}
