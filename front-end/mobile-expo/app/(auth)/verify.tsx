import { useRouter } from "expo-router";
import { MessageSquare } from "lucide-react-native";
import { useEffect, useRef, useState } from "react";
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useToast } from "@/components/Toast";
import { Btn, IconBadge, PageHeader } from "@/components/ui";
import { DEMO_OTP_HINT, useAuth } from "@/lib/auth-context";
import { fonts, radius, useTheme, useThemedStyles, type Theme } from "@/theme";

const LENGTH = 6;
const RESEND_SECONDS = 30;

export default function VerifyScreen() {
  const { colors, t } = useTheme();
  const styles = useThemedStyles(makeStyles);
  const router = useRouter();
  const toast = useToast();
  const insets = useSafeAreaInsets();
  const { verifyOtp, resendOtp, pendingPhone, pendingIntent, busy } = useAuth();

  const [code, setCode] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [seconds, setSeconds] = useState(RESEND_SECONDS);
  const input = useRef<TextInput>(null);

  useEffect(() => {
    if (seconds <= 0) return;
    const id = setTimeout(() => setSeconds((sec) => sec - 1), 1000);
    return () => clearTimeout(id);
  }, [seconds]);

  // Auto-submit once the last digit lands, the way OTP fields are expected to behave.
  useEffect(() => {
    if (code.length === LENGTH) void submit(code);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [code]);

  const submit = async (value: string) => {
    setError(null);
    const result = await verifyOtp(value);
    if (!result.ok) {
      setError("That code didn't match. Try again.");
      setCode("");
      return;
    }
    // Only a new account continues into role selection + onboarding; an existing
    // account drops straight into the app.
    router.replace(result.next === "onboarding" ? "/(auth)/role" : "/");
  };

  const masked = pendingPhone
    ? `+91 ${pendingPhone.slice(0, 5)} ${pendingPhone.slice(5)}`
    : "your number";

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <View style={{ paddingTop: insets.top, flex: 1 }}>
        <PageHeader
          title="Verify your number"
          subtitle={`Code sent to ${masked}`}
          back="/(auth)/login"
        />

        <View style={styles.body}>
          <IconBadge
            icon={MessageSquare}
            size={56}
            iconSize={26}
            bg={colors.earnSoft}
            color={colors.onEarnSoft}
            style={{ alignSelf: "center" }}
          />

          <Pressable style={styles.boxes} onPress={() => input.current?.focus()}>
            {Array.from({ length: LENGTH }).map((_, i) => {
              const char = code[i] ?? "";
              const active = i === code.length;
              return (
                <View
                  key={i}
                  style={[
                    styles.box,
                    char ? styles.boxFilled : null,
                    active ? styles.boxActive : null,
                    error ? styles.boxError : null,
                  ]}
                >
                  <Text style={styles.boxText}>{char}</Text>
                </View>
              );
            })}
          </Pressable>

          {/* One real input behind the boxes — far more reliable than six refs. */}
          <TextInput
            ref={input}
            value={code}
            onChangeText={(v) => setCode(v.replace(/\D/g, "").slice(0, LENGTH))}
            keyboardType="number-pad"
            textContentType="oneTimeCode"
            autoComplete="sms-otp"
            autoFocus
            maxLength={LENGTH}
            style={styles.hiddenInput}
          />

          {error ? (
            <Text style={styles.error}>{error}</Text>
          ) : (
            <Text style={[t.xs, { textAlign: "center" }]}>{DEMO_OTP_HINT}</Text>
          )}

          <Btn
            label={busy ? "Verifying…" : "Verify"}
            variant="earn"
            glow
            disabled={busy || code.length !== LENGTH}
            onPress={() => submit(code)}
          />

          {seconds > 0 ? (
            <Text style={[t.xs, { textAlign: "center" }]}>Resend code in {seconds}s</Text>
          ) : (
            <Pressable
              onPress={async () => {
                await resendOtp();
                setSeconds(RESEND_SECONDS);
                toast("Code resent", { description: `Sent to ${masked}` });
              }}
              hitSlop={8}
            >
              <Text style={styles.link}>Resend code</Text>
            </Pressable>
          )}
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}

const makeStyles = ({ colors }: Theme) =>
  StyleSheet.create({
    body: { paddingHorizontal: 20, paddingTop: 24, gap: 20 },
    boxes: { flexDirection: "row", justifyContent: "space-between", gap: 8 },
    box: {
      flex: 1,
      aspectRatio: 0.82,
      maxHeight: 62,
      borderRadius: radius.md,
      borderWidth: 1.5,
      borderColor: colors.input,
      backgroundColor: colors.card,
      alignItems: "center",
      justifyContent: "center",
    },
    boxFilled: { borderColor: colors.earn, backgroundColor: colors.earnSoft },
    boxActive: { borderColor: colors.earn },
    boxError: { borderColor: colors.destructive },
    boxText: {
      fontFamily: fonts.displayBold,
      fontSize: 24,
      lineHeight: 32,
      color: colors.foreground,
      includeFontPadding: false,
    },
    hiddenInput: { position: "absolute", opacity: 0, height: 1, width: 1 },
    error: {
      textAlign: "center",
      fontSize: 12,
      lineHeight: 16,
      fontFamily: fonts.medium,
      color: colors.destructive,
    },
    link: {
      textAlign: "center",
      fontSize: 13,
      lineHeight: 18,
      fontFamily: fonts.semibold,
      color: colors.earn,
    },
  });
