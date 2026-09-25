import { dayMonth, longDate } from "@rfin/shared/greeting";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import * as Clipboard from "expo-clipboard";
import { useLocalSearchParams } from "expo-router";
import { Copy } from "lucide-react-native";
import { View } from "react-native";
import { api } from "@/api/client";
import { useBenefit } from "@/api/hooks";
import { GIFT_CARD } from "@/domain/states";
import { fonts, radius, useTheme } from "@/design";
import { formatINR } from "@/lib/format";
import { PageHeader } from "@/features/PageHeader";
import { Button, DisclosureBlock, QueryView, Row, Screen, StatusChip, Text, useToast } from "@/ui";

const d = longDate;

/** Gift-card detail (report #58): value, issuer, dates, code, terms, reference. */
export default function BenefitDetail() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const qc = useQueryClient();
  const toast = useToast();
  const { colors, figure } = useTheme();
  const benefit = useBenefit(Number(id));
  const redeem = useMutation({
    mutationFn: () => api("benefits.redeem", { id: Number(id) }),
    onSuccess: (b) => {
      qc.setQueryData(["benefit", Number(id)], b);
      qc.invalidateQueries({ queryKey: ["benefits"] });
      toast("Marked as used", "success");
    },
    onError: (e: Error) => toast(e.message, "danger"),
  });

  return (
    <Screen header={<PageHeader label="Benefit" />}>
      <QueryView query={benefit}>
        {(b) => (
          <>
            <View style={{ backgroundColor: colors.inverse, borderRadius: radius["3xl"], padding: 24, gap: 16 }}>
              <Row style={{ justifyContent: "space-between" }}>
                <Text variant="label" style={{ color: colors.amber }}>{b.issuer}</Text>
                <StatusChip label={GIFT_CARD.label[b.state]} tone={GIFT_CARD.tone(b.state)} />
              </Row>
              <Text style={figure(52, colors.onInverse)}>{formatINR(b.value)}</Text>
              <Text style={{ fontFamily: fonts.medium, color: colors.onInverseMute }}>{b.title}</Text>
              {b.code ? (
                <Row style={{ justifyContent: "space-between", borderTopWidth: 1, borderTopColor: colors.inverseLine, paddingTop: 14 }}>
                  <Text style={{ fontFamily: fonts.monoMedium, fontSize: 20, letterSpacing: 2, color: colors.onInverse }}>{b.code}</Text>
                  <Button label="Copy" variant="paper" icon={<Copy size={14} color={colors.inverse} />} onPress={() => Clipboard.setStringAsync(b.code!).then(() => toast("Code copied", "success"))} />
                </Row>
              ) : (
                <Text style={{ fontFamily: fonts.mono, color: colors.onInverseMute }}>{b.state === "processing" ? "ISSUING — USUALLY A FEW SECONDS" : "CODE NO LONGER AVAILABLE"}</Text>
              )}
            </View>
            <View style={{ gap: 0 }}>
              {[
                ["Issued", d(b.at)],
                ["Valid until", d(b.expiresAt)],
                ["Earned from", b.sourceRef ? `${b.source === "first_txn" ? "First transaction" : b.source} · ${b.sourceRef}` : b.source],
                ["Used", b.redeemedAt ? d(b.redeemedAt) : "Not yet"],
              ].map(([k, v]) => (
                <Row key={k} style={{ justifyContent: "space-between", paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: colors.lineSoft }}>
                  <Text variant="caption">{k}</Text>
                  <Text variant="title">{v}</Text>
                </Row>
              ))}
            </View>
            <DisclosureBlock title="Terms" items={[b.terms, "Redeem at checkout on the issuer's site by entering the code."]} />
            {["ready", "partially_used"].includes(b.state) ? <Button label="I've used this" variant="outline" loading={redeem.isPending} onPress={() => redeem.mutate()} /> : null}
          </>
        )}
      </QueryView>
    </Screen>
  );
}
