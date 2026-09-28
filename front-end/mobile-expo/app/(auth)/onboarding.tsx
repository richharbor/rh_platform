import { CheckCircle2, Sparkles } from "lucide-react-native";
import { useMemo, useState } from "react";
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Pop, Rise } from "@/components/motion";
import { Btn, Field, GradientSurface, PageHeader, ProgressBar } from "@/components/ui";
import { useAuth } from "@/lib/auth-context";
import { ROLE_LABEL, type Role } from "@/lib/rfin-data";
import { fonts, radius, useTheme, useThemedStyles, type Theme } from "@/theme";

type Step = {
  id: string;
  role: Role | "common";
  title: string;
  subtitle: string;
  /** free-text step when absent */
  options?: string[];
  multi?: boolean;
  placeholder?: string;
  optional?: boolean;
};

/** Steps are assembled from the roles chosen on the previous screen. */
function stepsFor(roles: Role[]): Step[] {
  const steps: Step[] = [
    {
      id: "city",
      role: "common",
      title: "Where are you based?",
      subtitle: "We use this to show products available in your state",
      placeholder: "City",
    },
  ];

  if (roles.includes("buyer")) {
    steps.push({
      id: "interests",
      role: "buyer",
      title: "What are you looking for?",
      subtitle: "Pick as many as you like — this shapes your Home feed",
      options: [
        "Life Insurance",
        "Health Insurance",
        "Motor Insurance",
        "Personal Loan",
        "Home Loan",
        "Business Loan",
        "Unlisted Shares",
        "Pre-IPO",
      ],
      multi: true,
    });
  }

  if (roles.includes("seller")) {
    steps.push(
      {
        id: "sellerExperience",
        role: "seller",
        title: "How much selling experience do you have?",
        subtitle: "This sets your starting commission tier",
        options: ["New to this", "Under 1 year", "1–3 years", "3–5 years", "5+ years"],
      },
      {
        id: "sellerProducts",
        role: "seller",
        title: "What will you sell?",
        subtitle: "You can add more products later",
        options: ["Insurance", "Loans", "Private Markets"],
        multi: true,
      },
      {
        id: "sellerPan",
        role: "seller",
        title: "Your PAN",
        subtitle: "Required before your first commission payout",
        placeholder: "ABCDE1234F",
        optional: true,
      },
    );
  }

  if (roles.includes("referral")) {
    steps.push(
      {
        id: "referChannels",
        role: "referral",
        title: "How will you share?",
        subtitle: "We'll put your preferred channel first",
        options: ["WhatsApp", "Instagram", "LinkedIn", "In person", "Link or QR"],
        multi: true,
      },
      {
        id: "referNetwork",
        role: "referral",
        title: "Roughly how large is your network?",
        subtitle: "Helps us suggest realistic earning targets",
        options: ["Under 50", "50–200", "200–1,000", "1,000+"],
      },
    );
  }

  return steps;
}

export default function OnboardingScreen() {
  const { colors, t } = useTheme();
  const styles = useThemedStyles(makeStyles);
  const insets = useSafeAreaInsets();
  const { profile, patchProfile, completeOnboarding } = useAuth();

  const steps = useMemo(() => stepsFor(profile.roles), [profile.roles]);
  const [index, setIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string[]>>({});
  const [done, setDone] = useState(false);

  const step = steps[index];
  const current = answers[step?.id] ?? [];
  const isLast = index === steps.length - 1;
  const canContinue = step?.optional || current.length > 0;

  const choose = (opt: string) => {
    setAnswers((a) => {
      const cur = a[step.id] ?? [];
      if (step.multi) {
        return {
          ...a,
          [step.id]: cur.includes(opt) ? cur.filter((x) => x !== opt) : [...cur, opt],
        };
      }
      return { ...a, [step.id]: [opt] };
    });
  };

  const next = () => {
    if (!isLast) {
      setIndex(index + 1);
      return;
    }
    patchProfile({ city: (answers.city ?? [""])[0] ?? "", answers });
    setDone(true);
  };

  if (done) {
    return (
      <ScrollView
        contentContainerStyle={[
          styles.doneWrap,
          { paddingTop: insets.top + 40, paddingBottom: Math.max(insets.bottom, 24) + 24 },
        ]}
      >
        <Pop>
          <View style={styles.doneBadge}>
            <CheckCircle2 size={40} color={colors.onEarnSoft} />
          </View>
        </Pop>
        <Text style={styles.doneTitle}>You're all set</Text>
        <Text style={[t.muted, { marginTop: 8, textAlign: "center" }]}>
          {profile.name ? `${profile.name.split(" ")[0]}, your` : "Your"} RFIN account is ready with{" "}
          {profile.roles.map((r) => ROLE_LABEL[r]).join(", ")} enabled.
        </Text>

        <Rise delay={120} style={{ width: "100%", marginTop: 24 }}>
          <GradientSurface tone="gold" style={styles.bonus}>
            <Sparkles size={20} color={colors.goldForeground} />
            <View style={{ flex: 1 }}>
              <Text style={styles.bonusLabel}>Welcome bonus</Text>
              <Text style={styles.bonusValue}>250 RFIN Points</Text>
            </View>
          </GradientSurface>
        </Rise>

        <Btn
          label="Start exploring"
          variant="earn"
          glow
          style={{ marginTop: 24, width: "100%" }}
          onPress={completeOnboarding}
        />
      </ScrollView>
    );
  }

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <View style={{ flex: 1, paddingTop: insets.top }}>
        <PageHeader
          title={`Step ${index + 1} of ${steps.length}`}
          subtitle={step.role === "common" ? "About you" : ROLE_LABEL[step.role]}
          back="/(auth)/role"
        />
        <View style={{ paddingHorizontal: 20 }}>
          <ProgressBar value={((index + 1) / steps.length) * 100} />
        </View>

        <ScrollView
          contentContainerStyle={{ paddingHorizontal: 20, paddingTop: 24, paddingBottom: 20 }}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <Text style={styles.question}>{step.title}</Text>
          <Text style={[t.muted, { marginTop: 6 }]}>{step.subtitle}</Text>

          {step.options ? (
            <View style={styles.options}>
              {step.options.map((opt) => {
                const on = current.includes(opt);
                return (
                  <Pressable
                    key={opt}
                    onPress={() => choose(opt)}
                    accessibilityRole={step.multi ? "checkbox" : "radio"}
                    accessibilityState={{ checked: on }}
                    style={[styles.option, on && styles.optionOn]}
                  >
                    <Text style={[styles.optionText, on && { color: colors.onEarnSoft }]}>
                      {opt}
                    </Text>
                  </Pressable>
                );
              })}
            </View>
          ) : (
            <View style={{ marginTop: 20 }}>
              <Field
                placeholder={step.placeholder}
                value={current[0] ?? ""}
                onChangeText={(v) => setAnswers((a) => ({ ...a, [step.id]: v ? [v] : [] }))}
                autoCapitalize={step.id === "sellerPan" ? "characters" : "words"}
              />
              {step.optional && (
                <Text style={[t.xs, { marginTop: 8 }]}>
                  You can add this later from Profile → KYC.
                </Text>
              )}
            </View>
          )}
        </ScrollView>

        <View style={[styles.footer, { paddingBottom: Math.max(insets.bottom, 16) + 8 }]}>
          <View style={{ flexDirection: "row", gap: 8 }}>
            {index > 0 && <Btn label="Back" variant="ghost" onPress={() => setIndex(index - 1)} />}
            <Btn
              label={
                isLast ? "Finish" : step.optional && current.length === 0 ? "Skip" : "Continue"
              }
              variant="earn"
              disabled={!canContinue}
              onPress={next}
              style={{ flex: 1 }}
            />
          </View>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}

const makeStyles = ({ colors }: Theme) =>
  StyleSheet.create({
    question: {
      fontFamily: fonts.displayBold,
      fontSize: 24,
      lineHeight: 32,
      letterSpacing: -0.48,
      color: colors.foreground,
    },
    options: { marginTop: 20, flexDirection: "row", flexWrap: "wrap", gap: 10 },
    option: {
      borderRadius: radius.full,
      borderWidth: 1.5,
      borderColor: colors.border,
      backgroundColor: colors.card,
      paddingHorizontal: 16,
      paddingVertical: 11,
    },
    optionOn: { borderColor: colors.earn, backgroundColor: colors.earnSoft },
    optionText: {
      fontSize: 14,
      lineHeight: 18,
      fontFamily: fonts.semibold,
      color: colors.foreground,
    },
    footer: {
      paddingHorizontal: 20,
      paddingTop: 12,
      borderTopWidth: 1,
      borderTopColor: colors.border,
      backgroundColor: colors.background,
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
      textAlign: "center",
    },
    bonus: { flexDirection: "row", alignItems: "center", gap: 12, padding: 16 },
    bonusLabel: {
      fontSize: 12,
      lineHeight: 16,
      fontFamily: fonts.semibold,
      color: colors.goldForeground,
      opacity: 0.85,
    },
    bonusValue: {
      fontFamily: fonts.displayBold,
      fontSize: 18,
      lineHeight: 28,
      letterSpacing: -0.63,
      color: colors.goldForeground,
    },
  });
