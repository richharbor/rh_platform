import { dayMonth, longDate } from "@rfin/shared/greeting";
import { useLocalSearchParams } from "expo-router";
import { View } from "react-native";
import { useDraw } from "@/api/hooks";
import { LUCKY_DRAW } from "@/domain/states";
import { useTheme } from "@/design";
import { PageHeader } from "@/features/PageHeader";
import { Card, DisclosureBlock, Display, ProgressRing, QueryView, Row, Screen, Section, StatusChip, Text } from "@/ui";

/** Campaign detail, eligibility rules, entry and result (report #62, #63, #64). */
export default function DrawDetail() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { colors } = useTheme();
  const draw = useDraw(id);
  return (
    <Screen header={<PageHeader label="Lucky draw" />}>
      <QueryView query={draw}>
        {(d) => {
          const left = Math.max(0, d.threshold - d.progress);
          const mine = d.results?.winners.find((w) => w.entryId === d.entryId);
          return (
            <>
              <StatusChip label={LUCKY_DRAW.label[d.state]} tone={LUCKY_DRAW.tone(d.state)} />
              <Display size={44}>{d.name}</Display>
              <Row gap={16}>
                <ProgressRing value={d.progress} total={d.threshold} size={96} />
                <View style={{ flex: 1, gap: 4 }}>
                  <Text variant="title">{d.results ? "Draw complete" : left ? `${left} more eligible transaction${left > 1 ? "s" : ""}` : "You're in"}</Text>
                  <Text variant="caption">Draw on {longDate(d.drawDate)}</Text>
                  {d.entryId ? <Text variant="code">ENTRY · {d.entryId}</Text> : null}
                </View>
              </Row>
              <Card style={{ gap: 4 }}>
                <Text variant="label">Prize</Text>
                <Text variant="h2">{d.prize}</Text>
              </Card>
              {d.results ? (
                <Section title="Result">
                  <Text variant="title" style={{ color: mine ? colors.green : colors.foreground }}>{mine ? `You won: ${mine.prize}` : d.entryId ? "Your entry wasn't picked this time." : "You didn't enter this draw."}</Text>
                  {d.results.winners.map((w) => (
                    <Row key={w.entryId} style={{ justifyContent: "space-between" }}>
                      <Text variant="code">{w.entryId}</Text>
                      <Text variant="caption">{w.prize}</Text>
                    </Row>
                  ))}
                </Section>
              ) : null}
              <DisclosureBlock title="Rules" items={[d.terms, "Only confirmed transactions count; cancelled or reversed ones don't.", "No purchase of a product is required solely to enter."]} />
            </>
          );
        }}
      </QueryView>
    </Screen>
  );
}
