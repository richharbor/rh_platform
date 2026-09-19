import { useLocalSearchParams } from "expo-router";
import { CheckCircle2, Sparkles } from "lucide-react-native";
import { useState } from "react";
import { StyleSheet, Text, View } from "react-native";
import { Pop, Rise } from "@/components/motion";
import { Screen } from "@/components/Screen";
import {
  Btn,
  DividedSurface,
  EmptyState,
  Field,
  GradientSurface,
  PageHeader,
  ProgressBar,
} from "@/components/ui";
import { productBySlug } from "@/lib/rfin-data";
import { fonts, useTheme, useThemedStyles, type Theme } from "@/theme";

const steps = ["Basics", "Requirement", "Confirm"];

export default function ApplyScreen() {
  const { colors, t } = useTheme();
  const styles = useThemedStyles(makeStyles);
  const { slug } = useLocalSearchParams<{ slug: string }>();
  const product = productBySlug(slug);

  const [step, setStep] = useState(0);
  const [done, setDone] = useState(false);
  const [reference, setReference] = useState("");
  const [form, setForm] = useState({ name: "", phone: "", city: "", amount: "", tenure: "" });
  const set = (k: keyof typeof form) => (v: string) => setForm((f) => ({ ...f, [k]: v }));

  if (!product) {
    return (
      <Screen>
        <PageHeader title="Product not found" back="/explore" />
        <EmptyState title="Unavailable" body="This product isn't on RFIN yet." />
      </Screen>
    );
  }

  // Step gating matches the web form's `required` fields.
  const canContinue =
    step === 0
      ? form.name.trim() !== "" && form.phone.trim() !== "" && form.city.trim() !== ""
      : step === 1
        ? form.amount.trim() !== ""
        : true;

  const submit = () => {
    if (step < steps.length - 1) {
      setStep(step + 1);
    } else {
      setReference(`AP-${Date.now().toString().slice(-6)}`);
      setDone(true);
    }
  };

  if (done) {
    return (
      <Screen contentStyle={styles.doneWrap}>
        <Pop>
          <View style={styles.doneBadge}>
            <CheckCircle2 size={40} color={colors.earn} />
          </View>
        </Pop>
        <Text style={styles.doneTitle}>Application received</Text>
        <Text style={[t.muted, { marginTop: 8, textAlign: "center" }]}>
          Reference <Text style={styles.doneRef}>{reference}</Text>. An RFIN advisor will reach out
          within 2 hours.
        </Text>
        <Rise delay={120} style={{ width: "100%", marginTop: 24 }}>
          <GradientSurface tone="gold" style={styles.benefitCard}>
            <Sparkles size={20} color={colors.goldForeground} />
            <View style={{ flex: 1 }}>
              <Text style={styles.benefitLabel}>Eligible benefit</Text>
              <Text style={styles.benefitValue}>{product.buyerBenefit}</Text>
            </View>
          </GradientSurface>
        </Rise>
        <Btn
          label="Track application"
          variant="primary"
          to="/transactions"
          style={styles.doneBtn}
        />
        <Btn label="Back to home" variant="ghost" to="/" style={{ width: "100%", marginTop: 8 }} />
      </Screen>
    );
  }

  return (
    <Screen>
      <PageHeader
        title={product.name}
        subtitle={`Step ${step + 1} of ${steps.length} · ${steps[step]}`}
        back={{ pathname: "/product/[slug]", params: { slug: product.slug } }}
      />
      <View style={{ paddingHorizontal: 20 }}>
        <ProgressBar value={((step + 1) / steps.length) * 100} />

        <View style={{ marginTop: 24, gap: 12 }}>
          {step === 0 && (
            <>
              <Field
                placeholder="Full name"
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
                placeholder="City"
                value={form.city}
                onChangeText={set("city")}
                autoCapitalize="words"
              />
            </>
          )}
          {step === 1 && (
            <>
              <Field
                placeholder={product.category === "insurance" ? "Cover amount (₹)" : "Amount (₹)"}
                value={form.amount}
                onChangeText={set("amount")}
                keyboardType="numeric"
              />
              <Field
                placeholder={
                  product.category === "insurance" ? "Policy term (years)" : "Tenure / horizon"
                }
                value={form.tenure}
                onChangeText={set("tenure")}
              />
              <Text style={t.xs}>
                We only ask what's needed to match you to suitable options. Documents come later.
              </Text>
            </>
          )}
          {step === 2 && (
            <DividedSurface>
              <Row k="Name" v={form.name} />
              <Row k="Mobile" v={form.phone} />
              <Row k="City" v={form.city} />
              <Row k="Amount" v={form.amount ? `₹${form.amount}` : "—"} />
              <Row k="Documents next" v={product.docs.join(", ")} />
              <Row k="Eligible benefit" v={product.buyerBenefit} highlight />
            </DividedSurface>
          )}

          <View style={styles.actions}>
            {step > 0 && <Btn label="Back" variant="ghost" onPress={() => setStep(step - 1)} />}
            <Btn
              label={step === steps.length - 1 ? "Submit application" : "Continue"}
              variant="earn"
              onPress={submit}
              disabled={!canContinue}
              style={{ flex: 1 }}
            />
          </View>
        </View>
      </View>
    </Screen>
  );
}

function Row({ k, v, highlight }: { k: string; v: string; highlight?: boolean }) {
  const { colors, t } = useTheme();
  const styles = useThemedStyles(makeStyles);
  return (
    <View style={styles.row}>
      <Text style={[t.body, { fontSize: 14, lineHeight: 20, color: colors.mutedForeground }]}>
        {k}
      </Text>
      <Text
        style={[
          styles.rowValue,
          highlight
            ? { fontFamily: fonts.bold, color: colors.earn }
            : { fontFamily: fonts.medium, color: colors.foreground },
        ]}
      >
        {v || "—"}
      </Text>
    </View>
  );
}

const makeStyles = ({ colors }: Theme) =>
  StyleSheet.create({
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
      textAlign: "center",
    },
    doneRef: { fontFamily: fonts.semibold, color: colors.foreground },
    benefitCard: { flexDirection: "row", alignItems: "center", gap: 12, padding: 16 },
    benefitLabel: {
      fontSize: 12,
      lineHeight: 16,
      fontFamily: fonts.semibold,
      color: colors.goldForeground,
      opacity: 0.8,
    },
    benefitValue: {
      fontFamily: fonts.displayBold,
      fontSize: 18,
      lineHeight: 28,
      letterSpacing: -0.63,
      color: colors.goldForeground,
    },
    doneBtn: { width: "100%", marginTop: 24 },
    actions: { flexDirection: "row", gap: 8, paddingTop: 12 },
    row: {
      flexDirection: "row",
      justifyContent: "space-between",
      gap: 16,
      paddingHorizontal: 16,
      paddingVertical: 12,
    },
    rowValue: { flex: 1, fontSize: 14, lineHeight: 20, textAlign: "right" },
  });
