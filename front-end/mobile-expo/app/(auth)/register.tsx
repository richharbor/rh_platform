import { useRouter } from "expo-router";
import { Check, Eye, EyeOff, Lock, Mail, Phone, User } from "lucide-react-native";
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
import { Btn, Field, PageHeader, ProgressBar } from "@/components/ui";
import { useAuth } from "@/lib/auth-context";
import { fonts, radius, useTheme, useThemedStyles, type Theme } from "@/theme";

function strengthOf(pw: string) {
  let score = 0;
  if (pw.length >= 8) score++;
  if (/[A-Z]/.test(pw)) score++;
  if (/[0-9]/.test(pw)) score++;
  if (/[^A-Za-z0-9]/.test(pw)) score++;
  return score; // 0..4
}

export default function RegisterScreen() {
  const { colors, t } = useTheme();
  const styles = useThemedStyles(makeStyles);
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { register, busy } = useAuth();

  const [form, setForm] = useState({ name: "", phone: "", email: "", password: "" });
  const [show, setShow] = useState(false);
  const [agreed, setAgreed] = useState(false);
  const [touched, setTouched] = useState(false);
  const set = (k: keyof typeof form) => (v: string) => setForm((f) => ({ ...f, [k]: v }));

  const digits = form.phone.replace(/\D/g, "");
  const emailOk = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email);
  const score = useMemo(() => strengthOf(form.password), [form.password]);

  const errors = {
    name: touched && form.name.trim().length < 2 ? "Enter your full name" : undefined,
    phone: touched && digits.length !== 10 ? "Enter a 10-digit mobile number" : undefined,
    email: touched && !emailOk ? "Enter a valid email" : undefined,
    password: touched && score < 2 ? "Use 8+ characters with a number or capital" : undefined,
  };
  const valid =
    form.name.trim().length >= 2 && digits.length === 10 && emailOk && score >= 2 && agreed;

  const submit = async () => {
    setTouched(true);
    if (!valid) return;
    await register({
      name: form.name.trim(),
      phone: digits,
      email: form.email.trim(),
      password: form.password,
    });
    router.push("/(auth)/verify");
  };

  const strengthLabel = ["Too short", "Weak", "Fair", "Good", "Strong"][score];
  const strengthColor =
    score >= 3 ? colors.earn : score === 2 ? colors.warning : colors.destructive;

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
      keyboardVerticalOffset={8}
    >
      <ScrollView
        contentContainerStyle={{
          paddingTop: insets.top,
          paddingBottom: Math.max(insets.bottom, 24) + 24,
        }}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <PageHeader
          title="Create your account"
          subtitle="One account for all three roles"
          back="/(auth)/welcome"
        />

        <View style={styles.form}>
          <FieldBlock label="Full name" error={errors.name}>
            <User size={18} color={colors.mutedForeground} />
            <Field
              placeholder="Aarav Mehta"
              value={form.name}
              onChangeText={set("name")}
              autoCapitalize="words"
              autoComplete="name"
              style={styles.bareInput}
            />
          </FieldBlock>

          <FieldBlock label="Mobile number" error={errors.phone}>
            <Phone size={18} color={colors.mutedForeground} />
            <Field
              placeholder="98765 43210"
              value={form.phone}
              onChangeText={set("phone")}
              keyboardType="phone-pad"
              autoComplete="tel"
              maxLength={13}
              style={styles.bareInput}
            />
          </FieldBlock>

          <FieldBlock label="Email" error={errors.email}>
            <Mail size={18} color={colors.mutedForeground} />
            <Field
              placeholder="you@example.com"
              value={form.email}
              onChangeText={set("email")}
              keyboardType="email-address"
              autoCapitalize="none"
              autoComplete="email"
              style={styles.bareInput}
            />
          </FieldBlock>

          <View>
            <Text style={styles.label}>Password</Text>
            <View style={[styles.inputWrap, errors.password && styles.inputWrapError]}>
              <Lock size={18} color={colors.mutedForeground} />
              <Field
                placeholder="8+ characters"
                value={form.password}
                onChangeText={set("password")}
                secureTextEntry={!show}
                autoComplete="new-password"
                style={styles.bareInput}
              />
              <Pressable
                onPress={() => setShow(!show)}
                hitSlop={8}
                accessibilityLabel={show ? "Hide password" : "Show password"}
              >
                {show ? (
                  <EyeOff size={18} color={colors.mutedForeground} />
                ) : (
                  <Eye size={18} color={colors.mutedForeground} />
                )}
              </Pressable>
            </View>
            {form.password.length > 0 && (
              <View style={styles.strength}>
                <ProgressBar value={(score / 4) * 100} tone={score >= 3 ? "earn" : "gold"} />
                <Text style={[styles.strengthText, { color: strengthColor }]}>{strengthLabel}</Text>
              </View>
            )}
            {errors.password && <Text style={styles.error}>{errors.password}</Text>}
          </View>

          <Pressable onPress={() => setAgreed(!agreed)} style={styles.consent}>
            <View style={[styles.checkbox, agreed && styles.checkboxOn]}>
              {agreed && <Check size={14} color={colors.earnForeground} />}
            </View>
            <Text style={styles.consentText}>
              I agree to RFIN's Terms of Service and Privacy Policy, and consent to being contacted
              about products I enquire about.
            </Text>
          </Pressable>

          <Btn
            label={busy ? "Creating account…" : "Create account"}
            variant="earn"
            glow
            disabled={busy || (touched && !valid)}
            onPress={submit}
          />

          <View style={styles.footer}>
            <Text style={t.xs}>Already have an account? </Text>
            <Pressable onPress={() => router.replace("/(auth)/login")} hitSlop={8}>
              <Text style={styles.link}>Sign in</Text>
            </Pressable>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

function FieldBlock({
  label,
  error,
  children,
}: {
  label: string;
  error?: string;
  children: React.ReactNode;
}) {
  const styles = useThemedStyles(makeStyles);
  return (
    <View>
      <Text style={styles.label}>{label}</Text>
      <View style={[styles.inputWrap, error && styles.inputWrapError]}>{children}</View>
      {error && <Text style={styles.error}>{error}</Text>}
    </View>
  );
}

const makeStyles = ({ colors }: Theme) =>
  StyleSheet.create({
    form: { paddingHorizontal: 20, paddingTop: 12, gap: 16 },
    label: {
      fontSize: 12,
      lineHeight: 16,
      fontFamily: fonts.semibold,
      color: colors.mutedForeground,
      marginBottom: 6,
    },
    inputWrap: {
      flexDirection: "row",
      alignItems: "center",
      gap: 10,
      borderRadius: radius.md,
      borderWidth: 1,
      borderColor: colors.input,
      backgroundColor: colors.card,
      paddingHorizontal: 14,
    },
    inputWrapError: { borderColor: colors.destructive },
    bareInput: { flex: 1, borderWidth: 0, backgroundColor: "transparent", paddingHorizontal: 0 },
    error: {
      marginTop: 6,
      fontSize: 12,
      lineHeight: 16,
      fontFamily: fonts.medium,
      color: colors.destructive,
    },
    strength: { marginTop: 10, gap: 6 },
    strengthText: { fontSize: 11, lineHeight: 15, fontFamily: fonts.semibold },
    consent: { flexDirection: "row", alignItems: "flex-start", gap: 12 },
    checkbox: {
      width: 22,
      height: 22,
      borderRadius: 7,
      borderWidth: 1.5,
      borderColor: colors.border,
      backgroundColor: colors.card,
      alignItems: "center",
      justifyContent: "center",
    },
    checkboxOn: { backgroundColor: colors.earn, borderColor: colors.earn },
    consentText: {
      flex: 1,
      fontSize: 13,
      lineHeight: 18,
      fontFamily: fonts.regular,
      color: colors.foreground,
    },
    link: { fontSize: 13, lineHeight: 18, fontFamily: fonts.semibold, color: colors.earn },
    footer: { flexDirection: "row", justifyContent: "center", alignItems: "center", marginTop: 4 },
  });
