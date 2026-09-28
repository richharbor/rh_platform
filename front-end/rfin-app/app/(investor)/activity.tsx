import { useRouter } from "expo-router";
import { Bell, FileText, LifeBuoy } from "lucide-react-native";
import { useState } from "react";
import { Pressable, View } from "react-native";
import { useNotifications, useOrders } from "@/api/hooks";
import type { Order } from "@/domain/models";
import { useTheme } from "@/design";
import { Chips, OrderCard, QueryView, Row, Screen, Section, Text } from "@/ui";

type Filter = "all" | "action" | "moving" | "done";
const MATCH: Record<Filter, (o: Order) => boolean> = {
  all: () => true,
  action: (o) => o.state === "action_required",
  moving: (o) => o.state === "submitted" || o.state === "processing",
  done: (o) => ["fulfilled", "rejected", "cancelled", "expired"].includes(o.state),
};

/** Activity centre — applications, orders, payments, and what needs you (report #44). */
export default function Activity() {
  const router = useRouter();
  const { colors } = useTheme();
  const orders = useOrders();
  const notes = useNotifications();
  const [filter, setFilter] = useState<Filter>("all");
  const list = orders.data ?? [];
  const count = (f: Filter) => list.filter(MATCH[f]).length;

  const Shortcut = ({ icon: Icon, label, badge, to }: { icon: typeof Bell; label: string; badge?: number; to: "/notifications" | "/documents" | "/support" }) => (
    <Pressable onPress={() => router.push(to)} style={({ pressed }) => ({ flex: 1, alignItems: "center", gap: 6, paddingVertical: 14, borderRadius: 18, borderWidth: 1, borderColor: colors.lineSoft, backgroundColor: pressed ? colors.pressed : "transparent" })}>
      <View>
        <Icon size={18} color={colors.foreground} />
        {badge ? <View style={{ position: "absolute", top: -4, right: -8, minWidth: 16, height: 16, borderRadius: 8, backgroundColor: colors.red, alignItems: "center", justifyContent: "center", paddingHorizontal: 4 }}><Text style={{ color: colors.onRed, fontSize: 10, fontFamily: "Inter_700Bold" }}>{badge}</Text></View> : null}
      </View>
      <Text variant="title">{label}</Text>
    </Pressable>
  );

  return (
    <Screen eyebrow="Activity" title="Everything in motion." subtitle="Applications, orders and payments — and exactly what's next.">
      <Row gap={10}>
        <Shortcut icon={Bell} label="Alerts" badge={notes.data?.unread} to="/notifications" />
        <Shortcut icon={FileText} label="Documents" to="/documents" />
        <Shortcut icon={LifeBuoy} label="Support" to="/support" />
      </Row>
      <Chips<Filter>
        value={filter}
        onChange={setFilter}
        items={[
          { id: "all", label: "All" },
          { id: "action", label: "Needs you", count: count("action") },
          { id: "moving", label: "In progress", count: count("moving") },
          { id: "done", label: "Done" },
        ]}
      />
      <QueryView query={orders} empty={{ title: "Nothing yet", body: "When you apply or invest, every step shows up here.", action: { label: "Explore products", onPress: () => router.push("/explore") } }}>
        {(all) => {
          const shown = all.filter(MATCH[filter]);
          return (
            <Section title={`${shown.length} ${filter === "action" ? "need you" : "applications"}`}>
              {shown.length ? shown.map((o) => <OrderCard key={o.id} order={o} onPress={() => router.push(`/order/${o.id}`)} />) : <Text variant="muted">Nothing here right now.</Text>}
            </Section>
          );
        }}
      </QueryView>
    </Screen>
  );
}
