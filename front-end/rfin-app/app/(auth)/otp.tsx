import { useMutation } from "@tanstack/react-query";
import { useLocalSearchParams } from "expo-router";
import { useEffect, useRef, useState } from "react";
import { Pressable, TextInput, View } from "react-native";
import { api } from "@/api/client";
import { track } from "@/analytics";
import { fonts, radius, useTheme } from "@/design";
import { AuthHeader } from "@/features/AuthHeader";
import { useSession } from "@/stores/session";
import { Button, Row, Screen, Text, useToast } from "@/ui";

const LEN = 6;

export default function Otp() {
  const { colors, figure } = useTheme();
  const toast = useToast();
  const params = useLocalSearchParams<{ requestId: string; phone: string; resendInSec?: string; referral?: string }>();
  const signedIn = useSession((s) => s.signedIn);
  const [requestId, setRequestId] = useState(params.requestId);
  const [code, setCode] = useState("");
  const [left, setLeft] = useState(Number(params.resendInSec ?? 30));
  const input = useRef<TextInput>(null);

  useEffect(() => {
    if (left <= 0) return;
    const t = setTimeout(() => setLeft((n) => n - 1), 1000);
    return () => clearTimeout(t);
  }, [left]);

  const verify = useMutation({
    mutationFn: (c: string) => api("auth.verifyOtp", { requestId, code: c, referralCode: params.referral || undefined }),
    onSuccess: ({ token, customer, isNew }) => {
      track("otp_completed", { isNew });
      if (params.referral) track("referral_source", { code: params.referral });
      // The root gate routes on the new status: onboarding (resumed) or straight home.
      signedIn({ token, customer });
    },
    onError: () => setCode(""),
  });

  const resend = useMutation({
    mutationFn: () => api("auth.sendOtp", { phone: params.phone }),
    onSuccess: (r) => {
      setRequestId(r.requestId);
      setLeft(r.resendInSec);
      toast("New code sent", "info");
    },
  });

  const onChange = (t: string) => {
    const c = t.replace(/\D/g, "").slice(0, LEN);
    setCode(c);
    if (c.length === LEN) verify.mutate(c); // auto-submit on the 6th digit
  };

  const masked = `+91 ${params.phone.slice(0, 5)} ${params.phone.slice(5)}`;

  return (
    <Screen>
      <AuthHeader step={2} total={2} label="Verify" />
      <Text variant="hero">Enter the code</Text>
      <Text variant="muted" style={{ marginTop: -16 }}>Sent to {masked}.</Text>

      <Pressable onPress={() => input.current?.focus()} accessibilityLabel="One-time code">
        <Row gap={8}>
          {Array.from({ length: LEN }).map((_, i) => {
            const active = i === code.length && !verify.isPending;
            const border = verify.isError ? colors.red : active ? colors.foreground : colors.line;
            return (
              <View key={i} style={{ flex: 1, aspectRatio: 0.82, borderWidth: active ? 2 : 1, borderColor: border, borderRadius: radius.xl, alignItems: "center", justifyContent: "center" }}>
                <Text style={figure(28)}>{code[i] ?? ""}</Text>
              </View>
            );
          })}
        </Row>
        <TextInput
          ref={input}
          value={code}
          onChangeText={onChange}
          keyboardType="number-pad"
          textContentType="oneTimeCode"
          autoComplete="sms-otp"
          autoFocus
          maxLength={LEN}
          style={{ position: "absolute", opacity: 0, width: 1, height: 1 }}
        />
      </Pressable>

      {verify.isError ? <Text variant="xs" style={{ color: colors.red, marginTop: -12 }}>{verify.error.message}</Text> : null}
      {verify.isPending ? <Text variant="code" style={{ marginTop: -12 }}>VERIFYING…</Text> : null}

      <Row style={{ justifyContent: "space-between" }}>
        <Text variant="caption">Didn't get it?</Text>
        {left > 0 ? (
          <Text style={{ fontFamily: fonts.mono, fontSize: 12, color: colors.mute }}>Resend in 0:{String(left).padStart(2, "0")}</Text>
        ) : (
          <Button label="Resend code" variant="link" loading={resend.isPending} onPress={() => resend.mutate()} />
        )}
      </Row>
      <Text variant="xs">Mock: any 6 digits work except 000000. 98765 43210 is an existing account.</Text>
    </Screen>
  );
}
