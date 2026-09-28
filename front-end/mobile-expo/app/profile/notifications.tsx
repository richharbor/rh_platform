import {
  Bell,
  Gift,
  Handshake,
  Share2,
  TrendingUp,
  Info,
  type LucideIcon,
} from "lucide-react-native";
import { useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { Screen } from "@/components/Screen";
import { useToast } from "@/components/Toast";
import { DividedSurface, EmptyState, IconBadge, PageHeader, SwitchRow } from "@/components/ui";
import {
  notificationChannels,
  notifications as seed,
  type NotificationItem,
} from "@/lib/rfin-data";
import { fonts, useTheme, useThemedStyles, type Palette, type Theme } from "@/theme";

const kindIcon: Record<NotificationItem["kind"], LucideIcon> = {
  earning: TrendingUp,
  lead: Handshake,
  referral: Share2,
  reward: Gift,
  system: Info,
};
const kindTone = (c: Palette): Record<NotificationItem["kind"], { bg: string; fg: string }> => ({
  earning: { bg: c.earnSoft, fg: c.onEarnSoft },
  lead: { bg: c.infoSoft, fg: c.onInfoSoft },
  referral: { bg: c.goldSoft, fg: c.onGoldSoft },
  reward: { bg: c.goldSoft, fg: c.onGoldSoft },
  system: { bg: c.muted, fg: c.mutedForeground },
});

export default function NotificationsScreen() {
  const { colors, t } = useTheme();
  const styles = useThemedStyles(makeStyles);
  const toast = useToast();
  const [items, setItems] = useState(seed);
  const [channels, setChannels] = useState(notificationChannels);
  const [tab, setTab] = useState<"feed" | "preferences">("feed");
  const unread = items.filter((n) => n.unread).length;

  return (
    <Screen>
      <PageHeader
        title="Notifications"
        subtitle={unread ? `${unread} unread` : "All caught up"}
        back="/profile"
      />

      <View style={{ paddingHorizontal: 20 }}>
        <View style={styles.tabs}>
          {(["feed", "preferences"] as const).map((k) => (
            <Pressable
              key={k}
              onPress={() => setTab(k)}
              style={[styles.tab, tab === k && styles.tabActive]}
            >
              <Text
                style={[
                  styles.tabLabel,
                  { color: tab === k ? colors.foreground : colors.mutedForeground },
                ]}
              >
                {k === "feed" ? "Activity" : "Preferences"}
              </Text>
            </Pressable>
          ))}
        </View>
      </View>

      {tab === "feed" ? (
        <View style={{ paddingHorizontal: 20, paddingTop: 16 }}>
          {unread > 0 && (
            <Pressable
              onPress={() => {
                setItems((n) => n.map((x) => ({ ...x, unread: false })));
                toast("All marked as read");
              }}
              style={({ pressed }) => [styles.markAll, pressed && { opacity: 0.7 }]}
            >
              <Text style={styles.markAllText}>Mark all as read</Text>
            </Pressable>
          )}
          {items.length === 0 ? (
            <EmptyState
              title="Nothing yet"
              body="Payouts, lead updates and campaigns will show up here."
            />
          ) : (
            <DividedSurface>
              {items.map((n) => {
                const Icon = kindIcon[n.kind];
                const tone = kindTone(colors)[n.kind];
                return (
                  <Pressable
                    key={n.id}
                    onPress={() =>
                      setItems((all) =>
                        all.map((x) => (x.id === n.id ? { ...x, unread: false } : x)),
                      )
                    }
                    style={({ pressed }) => [
                      styles.item,
                      pressed && { backgroundColor: colors.secondary },
                    ]}
                  >
                    <IconBadge icon={Icon} bg={tone.bg} color={tone.fg} />
                    <View style={{ flex: 1, minWidth: 0 }}>
                      <View style={styles.titleRow}>
                        <Text style={styles.itemTitle} numberOfLines={1}>
                          {n.title}
                        </Text>
                        {n.unread && <View style={styles.unreadDot} />}
                      </View>
                      <Text style={[t.xs, { color: colors.mutedForeground }]}>{n.body}</Text>
                      <Text style={[t.xs, { marginTop: 2 }]}>{n.ts}</Text>
                    </View>
                  </Pressable>
                );
              })}
            </DividedSurface>
          )}
        </View>
      ) : (
        <View style={{ paddingHorizontal: 20, paddingTop: 16 }}>
          <Text style={[t.eyebrow, { color: colors.mutedForeground, marginBottom: 8 }]}>
            Channels
          </Text>
          <DividedSurface>
            {channels.map((c) => (
              <SwitchRow
                key={c.id}
                icon={Bell}
                title={c.label}
                subtitle={c.detail}
                value={c.enabled}
                onValueChange={(v) =>
                  setChannels((all) => all.map((x) => (x.id === c.id ? { ...x, enabled: v } : x)))
                }
              />
            ))}
          </DividedSurface>
          <Text style={[t.xs, { marginTop: 12 }]}>
            Critical payout and security alerts are always sent, regardless of these settings.
          </Text>
        </View>
      )}
    </Screen>
  );
}

const makeStyles = ({ colors }: Theme) =>
  StyleSheet.create({
    tabs: { flexDirection: "row", borderRadius: 9999, backgroundColor: colors.muted, padding: 4 },
    tab: { flex: 1, borderRadius: 9999, paddingVertical: 8, alignItems: "center" },
    tabActive: { backgroundColor: colors.card },
    tabLabel: { fontSize: 12, lineHeight: 16, fontFamily: fonts.semibold },
    markAll: { alignSelf: "flex-end", paddingVertical: 8 },
    markAllText: { fontSize: 12, lineHeight: 16, fontFamily: fonts.semibold, color: colors.earn },
    item: {
      flexDirection: "row",
      gap: 12,
      paddingHorizontal: 16,
      paddingVertical: 14,
      alignItems: "flex-start",
    },
    titleRow: { flexDirection: "row", alignItems: "center", gap: 8 },
    itemTitle: {
      flex: 1,
      fontSize: 14,
      lineHeight: 20,
      fontFamily: fonts.semibold,
      color: colors.foreground,
    },
    unreadDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: colors.earn },
  });
