import { usePointsLedger, useRewardsSummary } from "@/api/hooks";
import { REWARD } from "@/domain/states";
import { useTheme } from "@/design";
import { ago } from "@/features/notify";
import { PageHeader } from "@/features/PageHeader";
import { AmountText, QueryView, Row, Screen, Section, StatusChip, Text } from "@/ui";
import { View } from "react-native";

/** Points ledger — an audit-friendly reward timeline (report #56, #68). */
export default function Points() {
  const { colors } = useTheme();
  const summary = useRewardsSummary();
  const ledger = usePointsLedger();
  return (
    <Screen header={<PageHeader label="Points" />} eyebrow="RFIN Points" title="Every point, accounted for." subtitle="Separate from cash and commission — points only ever unlock benefits.">
      <QueryView query={summary}>
        {(s) => (
          <Row gap={16}>
            <View style={{ flex: 1 }}>
              <Text variant="label">Available</Text>
              <AmountText size={32}>{s.points.available.toLocaleString("en-IN")}</AmountText>
            </View>
            <View style={{ flex: 1 }}>
              <Text variant="label">Locked</Text>
              <AmountText size={32} tone="mute">{s.points.locked.toLocaleString("en-IN")}</AmountText>
            </View>
          </Row>
        )}
      </QueryView>
      <Section title="History" gap={0}>
        <QueryView query={ledger} empty={{ title: "No points yet" }}>
          {(list) =>
            list.map((e) => (
              <Row key={e.id} style={{ justifyContent: "space-between", paddingVertical: 14, borderBottomWidth: 1, borderBottomColor: colors.lineSoft }} gap={12}>
                <View style={{ flex: 1 }}>
                  <Text variant="title">{e.description}</Text>
                  <Text variant="xs">{ago(e.at)}{e.ref ? ` · ${e.ref}` : ""}</Text>
                </View>
                <View style={{ alignItems: "flex-end", gap: 4 }}>
                  <Text variant="title" style={{ color: e.state === "reversed" ? colors.red : colors.green }}>{e.state === "reversed" ? "−" : "+"}{e.points.toLocaleString("en-IN")}</Text>
                  <StatusChip label={REWARD.label[e.state]} tone={REWARD.tone(e.state)} />
                </View>
              </Row>
            ))
          }
        </QueryView>
      </Section>
    </Screen>
  );
}
