import { useMutation } from "@tanstack/react-query";
import { useRouter, type Href } from "expo-router";
import { Send, Sparkles } from "lucide-react-native";
import { useRef, useState } from "react";
import { KeyboardAvoidingView, Platform, Pressable, ScrollView, TextInput, View } from "react-native";
import { api } from "@/api/client";
import type { AssistantReply } from "@/domain/models";
import { fonts, radius, useTheme } from "@/design";
import { PageHeader } from "@/features/PageHeader";
import { Button, Row, Screen, Text } from "@/ui";

type Turn = { role: "user" | "assistant"; text: string; actions?: AssistantReply["actions"] };
const STARTERS = ["How are my goals doing?", "What is my portfolio worth?", "What's left in my KYC?", "How does selling unlisted shares work?"];

/** RFIN Assistant (Phase 3): grounded in your RFIN data, explains — never advises or promises returns. */
export default function Assistant() {
  const router = useRouter();
  const { colors } = useTheme();
  const [turns, setTurns] = useState<Turn[]>([]);
  const [text, setText] = useState("");
  const [disclaimer, setDisclaimer] = useState<string>();
  const scroll = useRef<ScrollView>(null);
  const ask = useMutation({
    mutationFn: (message: string) => api("assistant.ask", { message, history: turns.map((t) => ({ role: t.role, text: t.text })) }),
    onSuccess: (r) => {
      setTurns((t) => [...t, { role: "assistant", text: r.reply, actions: r.actions }]);
      setDisclaimer(r.disclaimer);
      setTimeout(() => scroll.current?.scrollToEnd({ animated: true }), 50);
    },
    onError: (e: Error) => setTurns((t) => [...t, { role: "assistant", text: `Sorry — ${e.message}` }]),
  });
  const send = (m: string) => {
    const msg = m.trim();
    if (!msg || ask.isPending) return;
    setTurns((t) => [...t, { role: "user", text: msg }]);
    setText("");
    ask.mutate(msg);
  };

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === "ios" ? "padding" : undefined}>
      <Screen
        header={<PageHeader label="Assistant" />}
        footer={
          <View style={{ flexDirection: "row", gap: 8, padding: 12, borderTopWidth: 1, borderTopColor: colors.line, backgroundColor: colors.background }}>
            <TextInput value={text} onChangeText={setText} onSubmitEditing={() => send(text)} placeholder="Ask about your money on RFIN…" placeholderTextColor={colors.mute} accessibilityLabel="Message" returnKeyType="send" style={{ flex: 1, minHeight: 44, borderWidth: 1, borderColor: colors.line, borderRadius: radius.full, paddingHorizontal: 16, fontFamily: fonts.regular, fontSize: 15, color: colors.foreground }} />
            <Pressable accessibilityLabel="Send" onPress={() => send(text)} disabled={!text.trim() || ask.isPending} style={{ width: 44, height: 44, borderRadius: 22, backgroundColor: colors.inverse, alignItems: "center", justifyContent: "center", opacity: text.trim() ? 1 : 0.5 }}>
              <Send size={18} color={colors.onInverse} />
            </Pressable>
          </View>
        }
      >
        {!turns.length ? (
          <View style={{ gap: 14 }}>
            <View style={{ width: 56, height: 56, borderRadius: 18, backgroundColor: colors.inverse, alignItems: "center", justifyContent: "center" }}><Sparkles size={24} color={colors.amber} /></View>
            <Text variant="hero">Ask RFIN.</Text>
            <Text variant="muted">Answers come from your own RFIN data. It explains — it doesn't give investment advice.</Text>
            {STARTERS.map((s) => <Button key={s} label={s} variant="outline" onPress={() => send(s)} />)}
          </View>
        ) : (
          <ScrollView ref={scroll} contentContainerStyle={{ gap: 12 }}>
            {turns.map((t, i) => {
              const mine = t.role === "user";
              return (
                <View key={i} style={{ alignSelf: mine ? "flex-end" : "flex-start", maxWidth: "88%", gap: 8 }}>
                  <View style={{ padding: 14, borderRadius: radius["2xl"], backgroundColor: mine ? colors.inverse : colors.amberSoft }}>
                    <Text style={{ fontFamily: fonts.regular, fontSize: 15, lineHeight: 22, color: mine ? colors.onInverse : colors.foreground }}>{t.text}</Text>
                  </View>
                  {t.actions?.length ? <Row style={{ flexWrap: "wrap" }}>{t.actions.map((a) => <Button key={a.route} label={a.label} variant="outline" onPress={() => router.push(a.route as Href)} />)}</Row> : null}
                </View>
              );
            })}
            {ask.isPending ? <Text variant="code">THINKING…</Text> : null}
            {disclaimer ? <Text variant="xs">{disclaimer}</Text> : null}
          </ScrollView>
        )}
      </Screen>
    </KeyboardAvoidingView>
  );
}
