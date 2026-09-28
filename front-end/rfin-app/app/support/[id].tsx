import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useLocalSearchParams } from "expo-router";
import { Send } from "lucide-react-native";
import { useState } from "react";
import { KeyboardAvoidingView, Platform, Pressable, TextInput, View } from "react-native";
import { api } from "@/api/client";
import { useTicket } from "@/api/hooks";
import { fonts, radius, useTheme } from "@/design";
import { ago } from "@/features/notify";
import { PageHeader } from "@/features/PageHeader";
import { Button, QueryView, Row, Screen, StatusChip, Text } from "@/ui";
import { TICKET_STATE } from "@/features/support";

/** One support conversation. Advisor replies arrive on their own (polling while typing). */
export default function Ticket() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const qc = useQueryClient();
  const { colors } = useTheme();
  const ticket = useTicket(id);
  const [text, setText] = useState("");
  const set = (t: Awaited<ReturnType<typeof api<"support.ticket">>>) => {
    qc.setQueryData(["ticket", id], t);
    qc.invalidateQueries({ queryKey: ["tickets"] });
  };
  const send = useMutation({ mutationFn: () => api("support.reply", { id, text: text.trim() }), onSuccess: (t) => { setText(""); set(t); } });
  const resolve = useMutation({ mutationFn: () => api("support.resolve", { id }), onSuccess: set });
  const t = ticket.data;

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === "ios" ? "padding" : undefined}>
      <Screen
        header={<PageHeader label={id} />}
        footer={
          t && t.state !== "resolved" ? (
            <View style={{ flexDirection: "row", gap: 8, padding: 12, borderTopWidth: 1, borderTopColor: colors.line, backgroundColor: colors.background }}>
              <TextInput
                value={text}
                onChangeText={setText}
                placeholder="Reply…"
                placeholderTextColor={colors.mute}
                accessibilityLabel="Reply"
                style={{ flex: 1, minHeight: 44, borderWidth: 1, borderColor: colors.line, borderRadius: radius.full, paddingHorizontal: 16, fontFamily: fonts.regular, fontSize: 15, color: colors.foreground }}
              />
              <Pressable accessibilityLabel="Send" disabled={!text.trim() || send.isPending} onPress={() => send.mutate()} style={{ width: 44, height: 44, borderRadius: 22, backgroundColor: colors.inverse, alignItems: "center", justifyContent: "center", opacity: text.trim() ? 1 : 0.5 }}>
                <Send size={18} color={colors.onInverse} />
              </Pressable>
            </View>
          ) : undefined
        }
      >
        <QueryView query={ticket}>
          {(t) => (
            <>
              <View style={{ gap: 6 }}>
                <StatusChip label={t.advisorTyping ? "Advisor is typing…" : TICKET_STATE[t.state].label} tone={t.advisorTyping ? "pending" : TICKET_STATE[t.state].tone} />
                <Text variant="h1">{t.subject}</Text>
                {t.contextId ? <Text variant="code">ABOUT · {t.contextType.toUpperCase()} {t.contextId}</Text> : null}
              </View>
              <View style={{ gap: 10 }}>
                {t.messages.map((m, i) => {
                  const mine = m.from === "you";
                  return (
                    <View key={i} style={{ alignSelf: mine ? "flex-end" : "flex-start", maxWidth: "85%", gap: 4 }}>
                      <View style={{ padding: 14, borderRadius: radius["2xl"], backgroundColor: mine ? colors.inverse : colors.amberSoft }}>
                        <Text style={{ fontFamily: fonts.regular, fontSize: 15, lineHeight: 22, color: mine ? colors.onInverse : colors.foreground }}>{m.text}</Text>
                      </View>
                      <Text variant="xs" style={{ textAlign: mine ? "right" : "left" }}>{mine ? "You" : m.author ?? "RFIN"} · {ago(m.at)}</Text>
                    </View>
                  );
                })}
              </View>
              {t.state === "awaiting_you" ? (
                <Row>
                  <Button label="This solved it" variant="outline" loading={resolve.isPending} onPress={() => resolve.mutate()} />
                </Row>
              ) : null}
            </>
          )}
        </QueryView>
      </Screen>
    </KeyboardAvoidingView>
  );
}
