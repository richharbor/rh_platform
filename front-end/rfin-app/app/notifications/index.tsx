import { useRouter, type Href } from "expo-router";
import { Bell, Check, CreditCard, FileText, LifeBuoy, ShieldCheck, Trophy } from "lucide-react-native";
import { useState } from "react";
import { Pressable, View } from "react-native";
import { useMarkRead, useNotifications } from "@/api/hooks";
import type { NotificationItem } from "@/domain/models";
import { useTheme } from "@/design";
import { ago, CATEGORY_LABEL } from "@/features/notify";
import { PageHeader } from "@/features/PageHeader";
import { Button, Chips, QueryView, Row, Screen, Text, toneColors } from "@/ui";

const ICON = { applications: FileText, kyc: ShieldCheck, payments: CreditCard, rewards: Trophy, product_updates: Bell, promotions: Bell, support: LifeBuoy } as const;

/** Notifications centre (report #48). Tapping one marks it read and opens what it's about. */
export default function Notifications() {
  const router = useRouter();
  const th = useTheme();
  const { colors } = th;
  const notes = useNotifications();
  const markRead = useMarkRead();
  const [filter, setFilter] = useState<"all" | "unread">("all");

  const open = (n: NotificationItem) => {
    if (!n.read) markRead.mutate([n.id]);
    if (n.route) router.push(n.route as Href);
  };

  return (
    <Screen header={<PageHeader label="Notifications" />} eyebrow="Alerts" title="What changed." subtitle="Every status change on your money, KYC and rewards — nothing promotional unless you ask for it.">
      <Row style={{ justifyContent: "space-between" }}>
        <Chips<"all" | "unread"> value={filter} onChange={setFilter} items={[{ id: "all", label: "All" }, { id: "unread", label: "Unread", count: notes.data?.unread }]} />
      </Row>
      <Row>
        <Button label="Mark all read" variant="outline" disabled={!notes.data?.unread} loading={markRead.isPending && !markRead.variables} icon={<Check size={16} color={colors.foreground} />} onPress={() => markRead.mutate(undefined)} />
        <Button label="Preferences" variant="outline" onPress={() => router.push("/notifications/preferences")} />
      </Row>
      <QueryView query={notes} isEmpty={(d) => d.items.length === 0} empty={{ title: "All quiet", body: "Updates about your applications and KYC appear here." }}>
        {(d) => {
          const items = d.items.filter((n) => filter === "all" || !n.read);
          if (!items.length) return <Text variant="muted">You're all caught up.</Text>;
          return (
            <View>
              {items.map((n) => {
                const Icon = ICON[n.category];
                const c = toneColors(th, n.tone);
                return (
                  <Pressable key={n.id} onPress={() => open(n)} style={({ pressed }) => ({ flexDirection: "row", gap: 12, paddingVertical: 14, borderBottomWidth: 1, borderBottomColor: colors.lineSoft, backgroundColor: pressed ? colors.pressed : "transparent" })}>
                    <View style={{ width: 32, height: 32, borderRadius: 16, backgroundColor: c.soft, alignItems: "center", justifyContent: "center" }}>
                      <Icon size={16} color={c.text} />
                    </View>
                    <View style={{ flex: 1, gap: 2 }}>
                      <Row style={{ justifyContent: "space-between" }}>
                        <Text variant="code">{CATEGORY_LABEL[n.category].toUpperCase()}</Text>
                        <Text variant="xs">{ago(n.at)}</Text>
                      </Row>
                      <Text variant="title" style={{ opacity: n.read ? 0.7 : 1 }}>{n.title}</Text>
                      <Text variant="xs">{n.body}</Text>
                    </View>
                    {!n.read ? <View accessibilityLabel="Unread" style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: colors.red, marginTop: 6 }} /> : null}
                  </Pressable>
                );
              })}
            </View>
          );
        }}
      </QueryView>
    </Screen>
  );
}
