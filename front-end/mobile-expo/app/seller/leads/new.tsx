import { useLocalSearchParams } from "expo-router";
import { CheckCircle2, ChevronDown, Handshake } from "lucide-react-native";
import { useState } from "react";
import { Modal, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { Pop } from "@/components/motion";
import { productIcon } from "@/components/ProductCard";
import { Screen } from "@/components/Screen";
import {
  Btn,
  DividedSurface,
  Field,
  GradientSurface,
  IconBadge,
  PageHeader,
  Surface,
} from "@/components/ui";
import { products } from "@/lib/rfin-data";
import { fonts, radius, useTheme, useThemedStyles, type Theme } from "@/theme";

export default function NewLeadScreen() {
  const { colors, t } = useTheme();
  const styles = useThemedStyles(makeStyles);
  const params = useLocalSearchParams<{ product?: string }>();
  const [slug, setSlug] = useState<string>(
    params.product && products.some((p) => p.slug === params.product)
      ? params.product
      : products[0].slug,
  );
  const [picker, setPicker] = useState(false);
  const [form, setForm] = useState({ name: "", phone: "", city: "", amount: "", notes: "" });
  const [created, setCreated] = useState<string | null>(null);

  const set = (k: keyof typeof form) => (v: string) => setForm((f) => ({ ...f, [k]: v }));
  const product = products.find((p) => p.slug === slug)!;
  const Icon = productIcon[slug];
  const valid = form.name.trim() !== "" && form.phone.trim() !== "";

  if (created) {
    return (
      <Screen contentStyle={styles.doneWrap}>
        <Pop>
          <View style={styles.doneBadge}>
            <CheckCircle2 size={40} color={colors.earn} />
          </View>
        </Pop>
        <Text style={styles.doneTitle}>Lead created</Text>
        <Text style={[t.muted, { marginTop: 8, textAlign: "center" }]}>
          <Text style={styles.strong}>{created}</Text> for {form.name} · {product.name}. It starts
          at stage New in your pipeline.
        </Text>
        <GradientSurface tone="earn" style={styles.earnCard}>
          <Handshake size={20} color={colors.earnForeground} />
          <View style={{ flex: 1 }}>
            <Text style={styles.earnLabel}>Your commission on conversion</Text>
            <Text style={styles.earnValue}>{product.sellerCommission}</Text>
          </View>
        </GradientSurface>
        <Btn label="Open pipeline" variant="primary" to="/seller/leads" style={styles.doneBtn} />
        <Btn
          label="Add another lead"
          variant="ghost"
          style={{ width: "100%", marginTop: 8 }}
          onPress={() => {
            setCreated(null);
            setForm({ name: "", phone: "", city: "", amount: "", notes: "" });
          }}
        />
      </Screen>
    );
  }

  return (
    <Screen>
      <PageHeader
        title="Create new lead"
        subtitle="Capture the enquiry, RFIN handles the rest"
        back="/seller"
      />

      <View style={{ paddingHorizontal: 20, gap: 12 }}>
        <Text style={[t.eyebrow, { color: colors.mutedForeground }]}>Product</Text>
        <Pressable onPress={() => setPicker(true)}>
          <Surface style={styles.picker}>
            <IconBadge icon={Icon} bg={colors.navy} color={colors.navyForeground} />
            <View style={{ flex: 1, minWidth: 0 }}>
              <Text style={styles.pickerName}>{product.name}</Text>
              <Text style={t.xs} numberOfLines={1}>
                Commission {product.sellerCommission}
              </Text>
            </View>
            <ChevronDown size={18} color={colors.mutedForeground} />
          </Surface>
        </Pressable>

        <Text style={[t.eyebrow, { color: colors.mutedForeground, marginTop: 8 }]}>
          Lead details
        </Text>
        <Field
          placeholder="Customer name"
          value={form.name}
          onChangeText={set("name")}
          autoCapitalize="words"
        />
        <Field
          placeholder="Mobile number"
          value={form.phone}
          onChangeText={set("phone")}
          keyboardType="phone-pad"
        />
        <Field
          placeholder="City (optional)"
          value={form.city}
          onChangeText={set("city")}
          autoCapitalize="words"
        />
        <Field
          placeholder="Requirement amount (₹)"
          value={form.amount}
          onChangeText={set("amount")}
          keyboardType="numeric"
        />
        <Field
          placeholder="Notes for the advisor (optional)"
          value={form.notes}
          onChangeText={set("notes")}
          multiline
          numberOfLines={3}
          style={{ minHeight: 88, textAlignVertical: "top" }}
        />

        <DividedSurface style={{ marginTop: 4 }}>
          <View style={styles.summaryRow}>
            <Text style={[t.body, { fontSize: 14, lineHeight: 20, color: colors.mutedForeground }]}>
              Documents needed
            </Text>
            <Text style={styles.summaryValue}>{product.docs.join(", ")}</Text>
          </View>
          <View style={styles.summaryRow}>
            <Text style={[t.body, { fontSize: 14, lineHeight: 20, color: colors.mutedForeground }]}>
              Your commission
            </Text>
            <Text style={[styles.summaryValue, { color: colors.earn, fontFamily: fonts.bold }]}>
              {product.sellerCommission}
            </Text>
          </View>
        </DividedSurface>

        <Btn
          label="Create lead"
          icon={Handshake}
          variant="earn"
          glow
          disabled={!valid}
          onPress={() => setCreated(`LD-${Date.now().toString().slice(-4)}`)}
          style={{ marginTop: 8 }}
        />
        <Text style={[t.xs, { textAlign: "center" }]}>
          By creating a lead you confirm the customer agreed to be contacted by RFIN.
        </Text>
      </View>

      <Modal
        visible={picker}
        animationType="slide"
        transparent
        onRequestClose={() => setPicker(false)}
      >
        <Pressable style={styles.sheetBackdrop} onPress={() => setPicker(false)} />
        <View style={styles.sheet}>
          <View style={styles.sheetHandle} />
          <Text style={styles.sheetTitle}>Select product</Text>
          <ScrollView style={{ maxHeight: 420 }} showsVerticalScrollIndicator={false}>
            {products.map((p) => {
              const PIcon = productIcon[p.slug];
              const selected = p.slug === slug;
              return (
                <Pressable
                  key={p.slug}
                  onPress={() => {
                    setSlug(p.slug);
                    setPicker(false);
                  }}
                  style={({ pressed }) => [
                    styles.sheetRow,
                    (pressed || selected) && { backgroundColor: colors.secondary },
                  ]}
                >
                  <IconBadge
                    icon={PIcon}
                    bg={selected ? colors.navy : colors.muted}
                    color={selected ? colors.navyForeground : colors.navy}
                  />
                  <View style={{ flex: 1, minWidth: 0 }}>
                    <Text style={styles.pickerName}>{p.name}</Text>
                    <Text style={t.xs} numberOfLines={1}>
                      {p.sellerCommission}
                    </Text>
                  </View>
                </Pressable>
              );
            })}
          </ScrollView>
        </View>
      </Modal>
    </Screen>
  );
}

const makeStyles = ({ colors }: Theme) =>
  StyleSheet.create({
    picker: { flexDirection: "row", alignItems: "center", gap: 12, padding: 12 },
    pickerName: {
      fontSize: 14,
      lineHeight: 20,
      fontFamily: fonts.semibold,
      color: colors.foreground,
    },
    summaryRow: {
      flexDirection: "row",
      justifyContent: "space-between",
      gap: 16,
      paddingHorizontal: 16,
      paddingVertical: 12,
    },
    summaryValue: {
      flex: 1,
      fontSize: 13,
      fontFamily: fonts.medium,
      color: colors.foreground,
      textAlign: "right",
    },
    doneWrap: {
      flexGrow: 1,
      alignItems: "center",
      justifyContent: "center",
      paddingHorizontal: 32,
    },
    doneBadge: {
      width: 80,
      height: 80,
      borderRadius: 40,
      backgroundColor: colors.earnSoft,
      alignItems: "center",
      justifyContent: "center",
    },
    doneTitle: {
      marginTop: 24,
      fontFamily: fonts.displayBold,
      fontSize: 24,
      lineHeight: 32,
      letterSpacing: -0.48,
      color: colors.foreground,
    },
    strong: { fontFamily: fonts.semibold, color: colors.foreground },
    earnCard: {
      flexDirection: "row",
      alignItems: "center",
      gap: 12,
      padding: 16,
      marginTop: 24,
      width: "100%",
    },
    earnLabel: {
      fontSize: 12,
      lineHeight: 16,
      fontFamily: fonts.semibold,
      color: colors.earnForeground,
      opacity: 0.85,
    },
    earnValue: {
      fontFamily: fonts.displayBold,
      fontSize: 16,
      lineHeight: 24,
      color: colors.earnForeground,
    },
    doneBtn: { width: "100%", marginTop: 24 },
    sheetBackdrop: { flex: 1, backgroundColor: colors.scrim },
    sheet: {
      backgroundColor: colors.card,
      borderTopLeftRadius: radius["3xl"],
      borderTopRightRadius: radius["3xl"],
      paddingBottom: 32,
      paddingTop: 10,
    },
    sheetHandle: {
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
      paddingBottom: 8,
    },
    sheetRow: {
      flexDirection: "row",
      alignItems: "center",
      gap: 12,
      paddingHorizontal: 20,
      paddingVertical: 12,
    },
  });
