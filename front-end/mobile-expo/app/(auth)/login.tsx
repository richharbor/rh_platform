import { useRouter } from "expo-router";
import { Eye, EyeOff, Lock, Phone } from "lucide-react-native";
import { useState } from "react";
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
import { useToast } from "@/components/Toast";
import { Btn, Field, PageHeader } from "@/components/ui";
import { useAuth } from "@/lib/auth-context";
import { fonts, radius, useTheme, useThemedStyles, type Theme } from "@/theme";

export default function LoginScreen() {
  const { colors, t } = useTheme();
  const styles = useThemedStyles(makeStyles);
  const router = useRouter();
  const toast = useToast();
  const insets = useSafeAreaInsets();
  const { signIn, busy } = useAuth();

  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [show, setShow] = useState(false);
  const [touched, setTouched] = useState(false);

  const digits = phone.replace(/\D/g, "");
  const phoneError = touched && digits.length !== 10 ? "Enter a 10-digit mobile number" : undefined;
  const passError = touched && password.length < 6 ? "At least 6 characters" : undefined;
  const valid = digits.length === 10 && password.length >= 6;

  const submit = async () => {
    setTouched(true);
    if (!valid) return;
    await signIn(digits, password);
    router.push("/(auth)/verify");
  };

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
          title="Welcome back"
          subtitle="Sign in to your RFIN account"
          back="/(auth)/welcome"
        />

        <View style={styles.form}>
          <View>
            <Text style={styles.label}>Mobile number</Text>
            <View style={[styles.inputWrap, phoneError && styles.inputWrapError]}>
              <Phone size={18} color={colors.mutedForeground} />
              <Field
                placeholder="98765 43210"
                value={phone}
                onChangeText={setPhone}
                keyboardType="phone-pad"
                autoComplete="tel"
                maxLength={13}
                style={styles.bareInput}
              />
            </View>
            {phoneError && <Text style={styles.error}>{phoneError}</Text>}
          </View>

          <View>
            <Text style={styles.label}>Password</Text>
            <View style={[styles.inputWrap, passError && styles.inputWrapError]}>
              <Lock size={18} color={colors.mutedForeground} />
              <Field
                placeholder="Your password"
                value={password}
                onChangeText={setPassword}
                secureTextEntry={!show}
                autoComplete="password"
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
            {passError && <Text style={styles.error}>{passError}</Text>}
          </View>

          <Pressable
            onPress={() =>
              toast("Password reset", { description: "We'll text a reset link once auth is live." })
            }
            hitSlop={8}
            style={{ alignSelf: "flex-end" }}
          >
            <Text style={styles.link}>Forgot password?</Text>
          </Pressable>

          <Btn
            label={busy ? "Sending OTP…" : "Continue"}
            variant="earn"
            glow
            disabled={busy}
            onPress={submit}
          />

          <View style={styles.dividerRow}>
            <View style={styles.rule} />
            <Text style={t.xs}>or</Text>
            <View style={styles.rule} />
          </View>

          <Btn
            label="Sign in with OTP instead"
            variant="ghost"
            disabled={busy}
            onPress={async () => {
              setTouched(true);
              if (digits.length !== 10) return;
              await signIn(digits, "otp");
              router.push("/(auth)/verify");
            }}
          />

          <View style={styles.footer}>
            <Text style={t.xs}>New to RFIN? </Text>
            <Pressable onPress={() => router.replace("/(auth)/register")} hitSlop={8}>
              <Text style={styles.link}>Create an account</Text>
            </Pressable>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
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
    link: { fontSize: 13, lineHeight: 18, fontFamily: fonts.semibold, color: colors.earn },
    dividerRow: { flexDirection: "row", alignItems: "center", gap: 12 },
    rule: { flex: 1, height: 1, backgroundColor: colors.border },
    footer: { flexDirection: "row", justifyContent: "center", alignItems: "center", marginTop: 4 },
  });
