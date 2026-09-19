import { Banknote, Landmark, Plus, Trash2 } from "lucide-react-native";
import { useState } from "react";
import { Modal, Pressable, StyleSheet, Text, View } from "react-native";
import { Screen } from "@/components/Screen";
import { useToast } from "@/components/Toast";
import { Btn, Field, IconBadge, PageHeader, Pill, StatusChip, Surface } from "@/components/ui";
import { bankAccounts as seed, user, type BankAccount } from "@/lib/rfin-data";
import { fonts, radius, useTheme, useThemedStyles, type Theme } from "@/theme";

export default function BankScreen() {
  const { colors, t } = useTheme();
  const styles = useThemedStyles(makeStyles);
  const toast = useToast();
  const [accounts, setAccounts] = useState<BankAccount[]>(seed);
  const [adding, setAdding] = useState(false);
  const [form, setForm] = useState({ bank: "", number: "", ifsc: "" });

  const valid =
    form.bank.trim() !== "" && form.number.trim().length >= 4 && form.ifsc.trim() !== "";

  const makePrimary = (id: string) => {
    setAccounts((a) => a.map((x) => ({ ...x, primary: x.id === id })));
    toast("Primary account updated", { description: "Future payouts go to this account." });
  };

  const remove = (id: string) => {
    const acc = accounts.find((a) => a.id === id);
    if (acc?.primary) {
      toast("Can't remove the primary account", {
        description: "Make another account primary first.",
      });
      return;
    }
    setAccounts((a) => a.filter((x) => x.id !== id));
    toast("Account removed");
  };

  const add = () => {
    const id = `BA-${Math.random().toString(36).slice(2, 5).toUpperCase()}`;
    setAccounts((a) => [
      ...a,
      {
        id,
        bank: form.bank.trim(),
        masked: `•••• ${form.number.trim().slice(-4)}`,
        ifsc: form.ifsc.trim().toUpperCase(),
        type: "Savings",
        primary: a.length === 0,
        state: "Pending",
      },
    ]);
    setForm({ bank: "", number: "", ifsc: "" });
    setAdding(false);
    toast("Account added", {
      description: "We'll verify it with a ₹1 test credit within 24 hours.",
    });
  };

  return (
    <Screen>
      <PageHeader title="Bank accounts" subtitle="Where your earnings are paid" back="/profile" />

      <View style={{ paddingHorizontal: 20, gap: 12 }}>
        <Surface style={styles.payoutCard}>
          <IconBadge icon={Banknote} bg={colors.earnSoft} color={colors.earn} />
          <View style={{ flex: 1 }}>
            <Text style={styles.payoutTitle}>Payout destination</Text>
            <Text style={t.xs}>
              {accounts.find((a) => a.primary)?.bank ?? "None selected"} · {user.rfinId}
            </Text>
          </View>
        </Surface>

        {accounts.map((a) => (
          <Surface key={a.id} style={{ padding: 16 }}>
            <View style={styles.accRow}>
              <IconBadge icon={Landmark} bg={colors.infoSoft} color={colors.brandText} />
              <View style={{ flex: 1, minWidth: 0 }}>
                <View style={styles.nameRow}>
                  <Text style={styles.bankName} numberOfLines={1}>
                    {a.bank}
                  </Text>
                  {a.primary && (
                    <Pill
                      label="Primary"
                      bg={colors.goldSoft}
                      color={colors.goldForeground}
                      size="sm"
                      weight="semibold"
                    />
                  )}
                </View>
                <Text style={t.xs}>
                  {a.masked} · {a.type} · {a.ifsc}
                </Text>
              </View>
              <StatusChip label={a.state} />
            </View>
            <View style={styles.actions}>
              {!a.primary && (
                <Btn
                  label="Make primary"
                  variant="ghost"
                  onPress={() => makePrimary(a.id)}
                  style={{ flex: 1 }}
                />
              )}
              <Pressable
                onPress={() => remove(a.id)}
                style={({ pressed }) => [styles.removeBtn, pressed && { opacity: 0.7 }]}
                accessibilityLabel={`Remove ${a.bank}`}
              >
                <Trash2 size={16} color={colors.destructive} />
              </Pressable>
            </View>
          </Surface>
        ))}

        <Btn label="Add bank account" icon={Plus} variant="earn" onPress={() => setAdding(true)} />
        <Text style={[t.xs, { textAlign: "center" }]}>
          Accounts are verified with a ₹1 test credit. Payouts only ever go to a verified account in
          your own name.
        </Text>
      </View>

      <Modal
        visible={adding}
        transparent
        animationType="slide"
        onRequestClose={() => setAdding(false)}
      >
        <Pressable style={styles.backdrop} onPress={() => setAdding(false)} />
        <View style={styles.sheet}>
          <View style={styles.handle} />
          <Text style={styles.sheetTitle}>Add bank account</Text>
          <View style={{ paddingHorizontal: 20, gap: 12 }}>
            <Field
              placeholder="Bank name"
              value={form.bank}
              onChangeText={(v) => setForm({ ...form, bank: v })}
            />
            <Field
              placeholder="Account number"
              value={form.number}
              onChangeText={(v) => setForm({ ...form, number: v })}
              keyboardType="number-pad"
            />
            <Field
              placeholder="IFSC code"
              value={form.ifsc}
              onChangeText={(v) => setForm({ ...form, ifsc: v })}
              autoCapitalize="characters"
            />
            <Btn
              label="Add account"
              variant="earn"
              disabled={!valid}
              onPress={add}
              style={{ marginTop: 4 }}
            />
            <Btn label="Cancel" variant="ghost" onPress={() => setAdding(false)} />
          </View>
        </View>
      </Modal>
    </Screen>
  );
}

const makeStyles = ({ colors }: Theme) =>
  StyleSheet.create({
    payoutCard: { flexDirection: "row", alignItems: "center", gap: 12, padding: 16 },
    payoutTitle: { fontSize: 14, lineHeight: 20, fontFamily: fonts.bold, color: colors.foreground },
    accRow: { flexDirection: "row", alignItems: "center", gap: 12 },
    nameRow: { flexDirection: "row", alignItems: "center", gap: 8 },
    bankName: { fontSize: 15, lineHeight: 20, fontFamily: fonts.bold, color: colors.foreground },
    actions: { flexDirection: "row", alignItems: "center", gap: 8, marginTop: 12 },
    removeBtn: {
      width: 44,
      height: 44,
      borderRadius: radius.full,
      backgroundColor: colors.destructiveSoft,
      alignItems: "center",
      justifyContent: "center",
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
