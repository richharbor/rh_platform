import { useRouter } from "expo-router";
import { ChevronRight } from "lucide-react-native";
import { Pressable, View } from "react-native";
import { useKycLive } from "@/api/hooks";
import { KYC } from "@/domain/states";
import { useTheme } from "@/design";
import { PageHeader } from "@/features/PageHeader";
import { ProgressBar, QueryView, Row, Screen, StatusChip, Text, TrustBanner } from "@/ui";

/** KYC as an explicit checklist — never a bare "KYC pending" (report #34). */
export default function KycChecklist() {
  const router = useRouter();
  const { colors } = useTheme();
  const kyc = useKycLive();

  return (
    <Screen header={<PageHeader label="Checklist" />} eyebrow="KYC" title="Verify once, use everywhere." subtitle="Each check says why it's needed. Do them in any order — progress is saved.">
      <QueryView query={kyc}>
        {(items) => {
          const done = items.filter((i) => i.state === "verified").length;
          return (
            <>
              <View style={{ gap: 8 }}>
                <Row style={{ justifyContent: "space-between" }}>
                  <Text variant="label">Progress</Text>
                  <Text variant="code">{done} / {items.length}</Text>
                </Row>
                <ProgressBar value={(done / items.length) * 100} tone={done === items.length ? "success" : "info"} />
              </View>
              {items.map((k) => {
                const actionable = k.state !== "verified" && k.state !== "in_progress";
                return (
                  <Pressable
                    key={k.id}
                    disabled={!actionable}
                    onPress={() => router.push(k.id === "bank" ? "/bank" : { pathname: "/kyc/upload/[item]", params: { item: k.id } })}
                    style={({ pressed }) => ({ padding: 16, borderRadius: 18, borderWidth: 1, borderColor: k.state === "action_required" ? colors.red : colors.lineSoft, backgroundColor: pressed ? colors.pressed : "transparent", gap: 6 })}
                  >
                    <Row style={{ justifyContent: "space-between" }}>
                      <Text variant="title">{k.label}</Text>
                      <Row gap={6}>
                        <StatusChip label={k.state === "in_progress" ? "In review" : KYC.label[k.state]} tone={KYC.tone(k.state)} />
                        {actionable ? <ChevronRight size={16} color={colors.mute} /> : null}
                      </Row>
                    </Row>
                    <Text variant="xs" style={k.rejectionReason ? { color: colors.red } : undefined}>{k.rejectionReason ?? k.why}</Text>
                  </Pressable>
                );
              })}
              {done === items.length ? <TrustBanner>You're fully verified. You won't be asked again unless something expires.</TrustBanner> : null}
            </>
          );
        }}
      </QueryView>
    </Screen>
  );
}
