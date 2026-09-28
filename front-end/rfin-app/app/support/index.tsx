import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useLocalSearchParams, useRouter } from "expo-router";
import { ChevronDown, ChevronUp } from "lucide-react-native";
import { useEffect, useState } from "react";
import { KeyboardAvoidingView, Platform, Pressable, View } from "react-native";
import { api } from "@/api/client";
import { useFaqs, useTickets } from "@/api/hooks";
import type { SupportContext } from "@/domain/models";
import { useTheme } from "@/design";
import { ago } from "@/features/notify";
import { PageHeader } from "@/features/PageHeader";
import { TICKET_STATE } from "@/features/support";
import { BottomSheet, Button, FormField, QueryView, Row, Screen, Section, StatusChip, Text } from "@/ui";


/**
 * Support centre (report #9, #47): FAQs first, then your requests. Opened from
 * an order / KYC item / product with ?contextType&contextId&subject, the new
 * request carries that context so you never have to explain it.
 */
export default function Support() {
  const router = useRouter();
  const qc = useQueryClient();
  const { colors } = useTheme();
  const params = useLocalSearchParams<{ contextType?: SupportContext; contextId?: string; subject?: string }>();
  const faqs = useFaqs();
  const tickets = useTickets();
  const [openFaq, setOpenFaq] = useState<string>();
  const [composing, setComposing] = useState(false);
  const [subject, setSubject] = useState(params.subject ?? "");
  const [message, setMessage] = useState("");

  useEffect(() => {
    if (params.contextType) setComposing(true);
  }, [params.contextType]);

  // Intelligent support (Phase 3): suggest answers before a ticket is needed.
  const [suggestions, setSuggestions] = useState<{ id: string; q: string; a: string }[]>([]);
  useEffect(() => {
    const q = `${subject} ${message}`.trim();
    if (q.length < 4) return setSuggestions([]);
    const t = setTimeout(() => api("support.suggest", { q }).then(setSuggestions).catch(() => {}), 300);
    return () => clearTimeout(t);
  }, [subject, message]);

  const create = useMutation({
    mutationFn: () => api("support.create", { subject: subject.trim(), message: message.trim(), contextType: params.contextType ?? "general", contextId: params.contextId }),
    onSuccess: (t) => {
      qc.invalidateQueries({ queryKey: ["tickets"] });
      setComposing(false);
      setMessage("");
      router.push(`/support/${t.id}`);
    },
  });

  return (
    <Screen header={<PageHeader label="Support" />} eyebrow="Support" title="Talk to a human." subtitle="Real advisors, with the context of what you're asking about already in front of them.">
      <Button label="New request" onPress={() => setComposing(true)} />

      <Section title="Your requests">
        <QueryView query={tickets} empty={{ title: "No requests yet", body: "Ask anything — an advisor usually replies within minutes." }}>
          {(list) => (
            <View>
              {list.map((t) => (
                <Pressable key={t.id} onPress={() => router.push(`/support/${t.id}`)} style={({ pressed }) => ({ paddingVertical: 14, gap: 4, borderBottomWidth: 1, borderBottomColor: colors.lineSoft, backgroundColor: pressed ? colors.pressed : "transparent" })}>
                  <Row style={{ justifyContent: "space-between" }}>
                    <Text variant="code">{t.id}{t.contextId ? ` · ${t.contextId}` : ""}</Text>
                    <StatusChip label={t.advisorTyping ? "Typing…" : TICKET_STATE[t.state].label} tone={t.advisorTyping ? "pending" : TICKET_STATE[t.state].tone} />
                  </Row>
                  <Text variant="title">{t.subject}</Text>
                  <Text variant="xs" numberOfLines={1}>{t.messages[t.messages.length - 1]?.text} · {ago(t.updatedAt)}</Text>
                </Pressable>
              ))}
            </View>
          )}
        </QueryView>
      </Section>

      <Section title="Common questions" gap={0}>
        <QueryView query={faqs}>
          {(list) =>
            list.map((f) => {
              const on = openFaq === f.id;
              return (
                <Pressable key={f.id} accessibilityRole="button" accessibilityState={{ expanded: on }} onPress={() => setOpenFaq(on ? undefined : f.id)} style={{ paddingVertical: 14, borderBottomWidth: 1, borderBottomColor: colors.lineSoft, gap: 8 }}>
                  <Row style={{ justifyContent: "space-between" }} gap={12}>
                    <Text variant="title" style={{ flex: 1 }}>{f.q}</Text>
                    {on ? <ChevronUp size={16} color={colors.mute} /> : <ChevronDown size={16} color={colors.mute} />}
                  </Row>
                  {on ? <Text variant="muted">{f.a}</Text> : null}
                </Pressable>
              );
            })
          }
        </QueryView>
      </Section>

      <BottomSheet open={composing} onClose={() => setComposing(false)} title="New request">
        <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : undefined} style={{ gap: 14 }}>
          {params.contextId ? <Text variant="code">ABOUT · {params.contextId}</Text> : null}
          <FormField label="Subject" value={subject} onChangeText={setSubject} placeholder="What's it about?" />
          {suggestions.length ? (
            <View style={{ gap: 8, padding: 12, borderRadius: 16, backgroundColor: colors.amberSoft }}>
              <Text variant="label">This might answer it</Text>
              {suggestions.map((s) => (
                <View key={s.id} style={{ gap: 2 }}>
                  <Text variant="title">{s.q}</Text>
                  <Text variant="xs">{s.a}</Text>
                </View>
              ))}
            </View>
          ) : null}
          <FormField label="Message" value={message} onChangeText={setMessage} placeholder="Tell us what you need" multiline style={{ minHeight: 96, paddingTop: 14, textAlignVertical: "top" }} error={create.error?.message} />
          <Button label="Send" block disabled={subject.trim().length < 3 || message.trim().length < 2} loading={create.isPending} onPress={() => create.mutate()} />
        </KeyboardAvoidingView>
      </BottomSheet>
    </Screen>
  );
}
