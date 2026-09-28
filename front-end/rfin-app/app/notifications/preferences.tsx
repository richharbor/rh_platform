import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Lock } from "lucide-react-native";
import { Switch, View } from "react-native";
import { api } from "@/api/client";
import { usePrefs } from "@/api/hooks";
import type { NotificationPrefs } from "@/domain/models";
import { useTheme } from "@/design";
import { CATEGORY_LABEL } from "@/features/notify";
import { PageHeader } from "@/features/PageHeader";
import { QueryView, Row, Screen, Section, Text, TrustBanner, useToast } from "@/ui";

const CHANNELS: { id: keyof NotificationPrefs["channels"]; label: string; detail: string }[] = [
  { id: "push", label: "Push", detail: "On this device" },
  { id: "email", label: "Email", detail: "Statements and confirmations" },
  { id: "sms", label: "SMS", detail: "Critical alerts only" },
  { id: "whatsapp", label: "WhatsApp", detail: "Only if you opt in" },
];

/** Channels + categories, with money/verification messages locked on (report #49). */
export default function Preferences() {
  const qc = useQueryClient();
  const toast = useToast();
  const { colors } = useTheme();
  const prefs = usePrefs();
  const save = useMutation({
    mutationFn: (patch: Parameters<typeof api<"prefs.update">>[1]) => api("prefs.update", patch),
    onSuccess: (p) => qc.setQueryData(["prefs"], p),
    onError: (e: Error) => toast(e.message, "danger"),
  });

  return (
    <Screen header={<PageHeader label="Preferences" />} eyebrow="Notifications" title="How we reach you." subtitle="Service messages about your money always come through. Everything else is your call.">
      <QueryView query={prefs}>
        {(p) => (
          <>
            <Section title="Channels" gap={0}>
              {CHANNELS.map((c) => (
                <Row key={c.id} style={{ justifyContent: "space-between", paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: colors.lineSoft }}>
                  <View>
                    <Text variant="title">{c.label}</Text>
                    <Text variant="xs">{c.detail}</Text>
                  </View>
                  <Switch accessibilityLabel={c.label} value={p.channels[c.id]} onValueChange={(v) => save.mutate({ channels: { [c.id]: v } })} />
                </Row>
              ))}
            </Section>
            <Section title="What we send" gap={0}>
              {(Object.keys(p.categories) as (keyof NotificationPrefs["categories"])[]).map((k) => {
                const locked = p.locked.includes(k);
                return (
                  <Row key={k} style={{ justifyContent: "space-between", paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: colors.lineSoft }}>
                    <View style={{ flex: 1 }}>
                      <Text variant="title">{CATEGORY_LABEL[k]}</Text>
                      {locked ? (
                        <Row gap={4}>
                          <Lock size={11} color={colors.mute} />
                          <Text variant="xs">Always on — it's about your money or verification</Text>
                        </Row>
                      ) : null}
                    </View>
                    <Switch accessibilityLabel={CATEGORY_LABEL[k]} value={p.categories[k]} disabled={locked} onValueChange={(v) => save.mutate({ categories: { [k]: v } })} />
                  </Row>
                );
              })}
            </Section>
            <TrustBanner>We never use your phone number or email for third-party marketing.</TrustBanner>
          </>
        )}
      </QueryView>
    </Screen>
  );
}
