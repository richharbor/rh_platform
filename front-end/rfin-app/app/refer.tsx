import { useMutation, useQueryClient } from "@tanstack/react-query";
import * as Clipboard from "expo-clipboard";
import { useState } from "react";
import { KeyboardAvoidingView, Linking, Platform, View } from "react-native";
import { api } from "@/api/client";
import { useReferrals, useRewardsSummary } from "@/api/hooks";
import type { Need, ReferralShare } from "@/domain/models";
import { REFERRAL } from "@/domain/states";
import { fonts, useTheme } from "@/design";
import { formatINR } from "@/lib/format";
import { NEEDS, needLabel } from "@/features/needs";
import { ago } from "@/features/notify";
import { PageHeader } from "@/features/PageHeader";
import QRCode from "react-native-qrcode-svg";
import { Button, Card, Chips, FormField, QueryView, Row, Screen, Section, StatusChip, Text, TrustBanner, useToast } from "@/ui";

/** Refer: requirement → link / QR / WhatsApp → track (report #66, #67). */
export default function Refer() {
  const qc = useQueryClient();
  const toast = useToast();
  const { colors } = useTheme();
  const summary = useRewardsSummary();
  const referrals = useReferrals();
  const [need, setNeed] = useState<Need>("grow_wealth");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [share, setShare] = useState<ReferralShare["share"]>();

  const create = useMutation({
    mutationFn: () => api("referrals.create", { need, name: name.trim(), phone: phone || undefined }),
    onSuccess: (r) => {
      setShare(r.share);
      qc.invalidateQueries({ queryKey: ["referrals"] });
    },
  });

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === "ios" ? "padding" : undefined}>
      <Screen header={<PageHeader label="Refer" />} eyebrow="Refer & earn" title="Bring someone you trust." subtitle={summary.data?.referral.rule}>
        {share ? (
          <Card style={{ gap: 14, alignItems: "center" }}>
            <Text variant="label">Share with {name.split(" ")[0]}</Text>
            <View style={{ padding: 12, backgroundColor: "#fff", borderRadius: 16 }}>
              <QRCode value={share.link} size={160} />
            </View>
            <Text style={{ fontFamily: fonts.monoMedium, fontSize: 22, letterSpacing: 2, color: colors.foreground }}>{share.code}</Text>
            <Row>
              <Button label="WhatsApp" onPress={() => Linking.openURL(`https://wa.me/?text=${encodeURIComponent(share.message)}`)} />
              <Button label="Copy link" variant="outline" onPress={() => Clipboard.setStringAsync(share.link).then(() => toast("Link copied", "success"))} />
            </Row>
            <Button label="Refer someone else" variant="link" onPress={() => { setShare(undefined); setName(""); setPhone(""); create.reset(); }} />
          </Card>
        ) : (
          <View style={{ gap: 16 }}>
            <Text variant="label">What do they need help with?</Text>
            <Chips value={need} onChange={setNeed} items={NEEDS.filter((n) => n.id !== "refer_someone").map((n) => ({ id: n.id, label: n.label }))} />
            <FormField label="Their name" value={name} onChangeText={setName} placeholder="Kiran" />
            <FormField label="Their mobile · optional" value={phone} onChangeText={(t) => setPhone(t.replace(/\D/g, "").slice(0, 10))} keyboardType="number-pad" placeholder="98765 43210" why="Only used to link them to you when they join. We never message them." error={create.error?.message} />
            <Button label="Create invite" block disabled={name.trim().length < 2} loading={create.isPending} event="referral_created" onPress={() => create.mutate()} />
          </View>
        )}

        <Section title="Your referrals">
          <QueryView query={referrals} empty={{ title: "No referrals yet", body: "Invite someone — you'll see every step here." }}>
            {(list) =>
              list.map((r) => (
                <Row key={r.id} style={{ justifyContent: "space-between", paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: colors.lineSoft }}>
                  <View style={{ flex: 1 }}>
                    <Text variant="title">{r.inviteeName}</Text>
                    <Text variant="xs">{needLabel(r.need)} · {r.joined ? "Joined" : "Invited"} {ago(r.at)}</Text>
                  </View>
                  <View style={{ alignItems: "flex-end", gap: 4 }}>
                    <StatusChip label={REFERRAL.label[r.state]} tone={REFERRAL.tone(r.state)} />
                    <Text variant="code">{formatINR(r.reward)}</Text>
                  </View>
                </Row>
              ))
            }
          </QueryView>
        </Section>
        <TrustBanner>Referral rewards are tracked separately from points and cash, and reverse if the referred transaction is cancelled.</TrustBanner>
      </Screen>
    </KeyboardAvoidingView>
  );
}
