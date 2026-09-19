import * as Clipboard from "expo-clipboard";
import { ChevronDown, LifeBuoy, Mail, MessageCircle, Phone, Plus } from "lucide-react-native";
import { useState } from "react";
import { Linking, Modal, Platform, Pressable, StyleSheet, Text, View } from "react-native";
import { Screen } from "@/components/Screen";
import { useToast } from "@/components/Toast";
import {
  Btn,
  DividedSurface,
  Field,
  GradientSurface,
  IconBadge,
  ListRow,
  PageHeader,
  StatusChip,
  Surface,
} from "@/components/ui";
import { faqs, tickets as seed, user } from "@/lib/rfin-data";
import { fonts, radius, useTheme, useThemedStyles, type Theme } from "@/theme";

const SUPPORT_PHONE = "+912249001234";
const SUPPORT_EMAIL = "help@rfin.app";

export default function SupportScreen() {
  const { colors, t } = useTheme();
  const styles = useThemedStyles(makeStyles);
  const toast = useToast();
  const [open, setOpen] = useState<string | null>(null);
  const [tickets, setTickets] = useState(seed);
  const [composing, setComposing] = useState(false);
  const [subject, setSubject] = useState("");
  const [body, setBody] = useState("");

  const openUrl = async (url: string, fallback: string) => {
    try {
      if (await Linking.canOpenURL(url)) {
        await Linking.openURL(url);
        return;
      }
    } catch {
      /* fall through */
    }
    await Clipboard.setStringAsync(fallback);
    toast("Copied to clipboard", { description: fallback });
  };

  const submit = () => {
    const id = `TK-${Math.floor(1000 + Math.random() * 9000)}`;
    setTickets((all) => [
      { id, subject: subject.trim(), state: "Open", updated: "Just now" },
      ...all,
    ]);
    setSubject("");
    setBody("");
    setComposing(false);
    toast(`Ticket ${id} raised`, { description: "We reply within 4 working hours." });
  };

  return (
    <Screen>
      <PageHeader title="Support" subtitle="We're here to help" back="/profile" />

      <View style={{ paddingHorizontal: 20 }}>
        <GradientSurface tone="navy" style={styles.hero}>
          <IconBadge
            icon={LifeBuoy}
            size={48}
            iconSize={24}
            bg={colors.onDark12}
            color={colors.navyForeground}
          />
          <View style={{ flex: 1 }}>
            <Text style={[t.eyebrow, { color: colors.navyMuted }]}>
              Priority support · {user.tier}
            </Text>
            <Text style={styles.heroTitle}>Mon–Sat, 9am – 7pm IST</Text>
            <Text style={styles.heroSub}>Quote {user.rfinId} when you reach out</Text>
          </View>
        </GradientSurface>

        <Text style={[t.eyebrow, styles.label]}>Contact</Text>
        <DividedSurface>
          <ListRow
            icon={Phone}
            title="Call support"
            subtitle={SUPPORT_PHONE}
            onPress={() => openUrl(`tel:${SUPPORT_PHONE}`, SUPPORT_PHONE)}
          />
          <ListRow
            icon={MessageCircle}
            title="WhatsApp"
            subtitle="Fastest for lead and payout questions"
            onPress={() =>
              openUrl(
                `whatsapp://send?phone=${SUPPORT_PHONE.replace(/\D/g, "")}&text=${encodeURIComponent(`Hi RFIN, I need help. My ID is ${user.rfinId}.`)}`,
                SUPPORT_PHONE,
              )
            }
          />
          <ListRow
            icon={Mail}
            title="Email"
            subtitle={SUPPORT_EMAIL}
            onPress={() =>
              openUrl(
                `mailto:${SUPPORT_EMAIL}?subject=${encodeURIComponent(`Help — ${user.rfinId}`)}`,
                SUPPORT_EMAIL,
              )
            }
          />
        </DividedSurface>

        <Text style={[t.eyebrow, styles.label]}>Your tickets</Text>
        {tickets.length === 0 ? (
          <Surface style={{ padding: 20 }}>
            <Text style={t.muted}>No tickets yet.</Text>
          </Surface>
        ) : (
          <DividedSurface>
            {tickets.map((tk) => (
              <View key={tk.id} style={styles.ticket}>
                <View style={{ flex: 1, minWidth: 0 }}>
                  <Text style={styles.ticketSubject} numberOfLines={2}>
                    {tk.subject}
                  </Text>
                  <Text style={t.xs}>
                    {tk.id} · {tk.updated}
                  </Text>
                </View>
                <StatusChip label={tk.state} />
              </View>
            ))}
          </DividedSurface>
        )}
        <Btn
          label="Raise a ticket"
          icon={Plus}
          variant="earn"
          style={{ marginTop: 12 }}
          onPress={() => setComposing(true)}
        />

        <Text style={[t.eyebrow, styles.label]}>Frequent questions</Text>
        <DividedSurface>
          {faqs.map((f) => {
            const expanded = open === f.q;
            return (
              <Pressable
                key={f.q}
                onPress={() => setOpen(expanded ? null : f.q)}
                style={({ pressed }) => [
                  styles.faq,
                  pressed && { backgroundColor: colors.secondary },
                ]}
              >
                <View style={styles.faqHead}>
                  <Text style={styles.faqQ}>{f.q}</Text>
                  <ChevronDown
                    size={18}
                    color={colors.mutedForeground}
                    style={{ transform: [{ rotate: expanded ? "180deg" : "0deg" }] }}
                  />
                </View>
                {expanded && <Text style={styles.faqA}>{f.a}</Text>}
              </Pressable>
            );
          })}
        </DividedSurface>
      </View>

      <Modal
        visible={composing}
        transparent
        animationType="slide"
        onRequestClose={() => setComposing(false)}
      >
        <Pressable style={styles.backdrop} onPress={() => setComposing(false)} />
        <View style={styles.sheet}>
          <View style={styles.handle} />
          <Text style={styles.sheetTitle}>Raise a ticket</Text>
          <View style={{ paddingHorizontal: 20, gap: 12 }}>
            <Field placeholder="Subject" value={subject} onChangeText={setSubject} />
            <Field
              placeholder="Describe the issue"
              value={body}
              onChangeText={setBody}
              multiline
              numberOfLines={4}
              style={{ minHeight: 110, textAlignVertical: "top" }}
            />
            <Btn label="Submit" variant="earn" disabled={subject.trim() === ""} onPress={submit} />
            <Btn label="Cancel" variant="ghost" onPress={() => setComposing(false)} />
          </View>
        </View>
      </Modal>
    </Screen>
  );
}

const makeStyles = ({ colors }: Theme) =>
  StyleSheet.create({
    hero: { flexDirection: "row", alignItems: "center", gap: 16, padding: 20 },
    heroTitle: {
      fontFamily: fonts.displayBold,
      fontSize: 16,
      lineHeight: 24,
      color: colors.navyForeground,
    },
    heroSub: { fontSize: 12, lineHeight: 16, fontFamily: fonts.regular, color: colors.navyMuted },
    label: { color: colors.mutedForeground, marginTop: 24, marginBottom: 8 },
    ticket: {
      flexDirection: "row",
      alignItems: "center",
      gap: 12,
      paddingHorizontal: 16,
      paddingVertical: 14,
    },
    ticketSubject: {
      fontSize: 14,
      lineHeight: 20,
      fontFamily: fonts.semibold,
      color: colors.foreground,
    },
    faq: { paddingHorizontal: 16, paddingVertical: 14 },
    faqHead: { flexDirection: "row", alignItems: "center", gap: 12 },
    faqQ: {
      flex: 1,
      fontSize: 14,
      lineHeight: 20,
      fontFamily: fonts.semibold,
      color: colors.foreground,
    },
    faqA: {
      marginTop: 8,
      fontSize: 13,
      lineHeight: 19,
      fontFamily: fonts.regular,
      color: colors.mutedForeground,
    },
    backdrop: { flex: 1, backgroundColor: colors.scrim },
    sheet: {
      backgroundColor: colors.card,
      borderTopLeftRadius: radius["3xl"],
      borderTopRightRadius: radius["3xl"],
      paddingTop: 10,
      paddingBottom: 32,
    },
    handle: {
      alignSelf: "center",
      width: 44,
      height: 4,
      borderRadius: 2,
      backgroundColor: colors.border,
      marginBottom: 12,
    },
    sheetTitle: {
      fontFamily: fonts.displayBold,
      fontSize: 16,
      lineHeight: 24,
      color: colors.foreground,
      paddingHorizontal: 20,
      paddingBottom: 12,
    },
  });
