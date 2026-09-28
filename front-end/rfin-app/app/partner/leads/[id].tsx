import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useState } from "react";
import { View } from "react-native";
import { api } from "@/api/client";
import { useLead } from "@/api/hooks";
import { LEAD, type LeadState } from "@/domain/states";
import { formatINR } from "@/lib/format";
import { needLabel } from "@/features/needs";
import { ago } from "@/features/notify";
import { PageHeader } from "@/features/PageHeader";
import { AmountText, Button, Card, Display, FocusCard, FormField, QueryView, Row, Screen, Section, StatusChip, Text, useToast } from "@/ui";

const VERB: Partial<Record<LeadState, string>> = { contacted: "Mark contacted", qualified: "Mark qualified", processing: "Open case", lost: "Mark lost" };

/** Lead detail — always exposes the next action and only allowed moves (report #84). */
export default function LeadDetail() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const qc = useQueryClient();
  const toast = useToast();
  const lead = useLead(id);
  const [note, setNote] = useState("");
  const update = useMutation({
    mutationFn: (patch: { state?: LeadState; note?: string }) => api("leads.update", { id, ...patch }),
    onSuccess: (l) => {
      qc.setQueryData(["lead", id], l);
      for (const k of ["leads", "clients", "cases"]) qc.invalidateQueries({ queryKey: [k] });
      setNote("");
    },
    onError: (e: Error) => toast(e.message, "danger"),
  });

  return (
    <Screen header={<PageHeader label={id} />}>
      <QueryView query={lead}>
        {(l) => (
          <>
            <StatusChip label={LEAD.label[l.state]} tone={LEAD.tone(l.state)} />
            <Display size={44}>{l.client}</Display>
            <Text variant="muted">{needLabel(l.need)}{l.city ? ` · ${l.city}` : ""}{l.segment ? ` · ${l.segment}` : ""}{l.phone ? ` · +91 ${l.phone}` : ""}</Text>
            <Card style={{ gap: 2 }}>
              <Text variant="label">Potential</Text>
              <AmountText size={30}>{formatINR(l.potential)}</AmountText>
              {l.quantity ? <Text variant="xs">{l.quantity} shares</Text> : null}
            </Card>
            <FocusCard title={l.nextAction} detail="Next action on this lead." cta={l.caseId ? "Open case" : "Add a note"} onPress={() => (l.caseId ? router.push(`/partner/cases/${l.caseId}`) : undefined)} />
            {l.allowedNext.length ? (
              <Row style={{ flexWrap: "wrap" }}>
                {l.allowedNext.filter((s) => s !== "converted").map((s) => (
                  <Button key={s} label={VERB[s] ?? s} variant={s === "lost" ? "outline" : "ink"} loading={update.isPending && update.variables?.state === s} event={s === "qualified" ? "lead_qualified" : s === "processing" ? "case_created" : undefined} onPress={() => update.mutate({ state: s })} />
                ))}
              </Row>
            ) : null}
            <Section title="Notes">
              <FormField label="Add a note" value={note} onChangeText={setNote} placeholder="Called — wants 100 shares" />
              <Button label="Save note" variant="outline" disabled={!note.trim()} onPress={() => update.mutate({ note: note.trim() })} />
              <View style={{ gap: 10 }}>
                {[...l.notes].reverse().map((n, i) => (
                  <View key={i}>
                    <Text variant="body">{n.text}</Text>
                    <Text variant="xs">{ago(n.at)}</Text>
                  </View>
                ))}
              </View>
            </Section>
            {l.documents.length ? <Section title="Documents">{l.documents.map((d) => <Text key={d} variant="muted">• {d}</Text>)}</Section> : null}
          </>
        )}
      </QueryView>
    </Screen>
  );
}
