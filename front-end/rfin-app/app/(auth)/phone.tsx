import { useMutation } from "@tanstack/react-query";
import { useRouter } from "expo-router";
import { useState } from "react";
import { KeyboardAvoidingView, Platform } from "react-native";
import { api } from "@/api/client";
import { AuthHeader } from "@/features/AuthHeader";
import { Button, FormField, Screen, StickyCTA, Text } from "@/ui";

const clean = (s: string) => s.replace(/\D/g, "").slice(0, 10);

/** Mobile + OTP only; everything else is captured later (report #12). */
export default function Phone() {
  const router = useRouter();
  const [phone, setPhone] = useState("");
  const [showReferral, setShowReferral] = useState(false);
  const [referral, setReferral] = useState("");
  const valid = /^[6-9]\d{9}$/.test(phone);

  const send = useMutation({
    mutationFn: () => api("auth.sendOtp", { phone }),
    onSuccess: ({ requestId, resendInSec }) =>
      router.push({ pathname: "/otp", params: { requestId, phone, resendInSec: String(resendInSec), referral: referral.trim() } }),
  });

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === "ios" ? "padding" : undefined}>
      <Screen
        footer={
          <StickyCTA note="By continuing you agree to RFIN's Terms and Privacy Policy.">
            <Button label="Send code" block loading={send.isPending} disabled={!valid} onPress={() => send.mutate()} />
          </StickyCTA>
        }
      >
        <AuthHeader step={1} total={2} label="Mobile" />
        <Text variant="hero">Your mobile number</Text>
        <Text variant="muted" style={{ marginTop: -16 }}>We'll text a 6-digit code. This number becomes your RFIN ID.</Text>
        <FormField
          label="Mobile · +91"
          value={phone}
          onChangeText={(t) => setPhone(clean(t))}
          keyboardType="number-pad"
          textContentType="telephoneNumber"
          autoComplete="tel"
          placeholder="98765 43210"
          autoFocus
          maxLength={10}
          error={phone.length === 10 && !valid ? "Indian mobile numbers start with 6, 7, 8 or 9" : send.error?.message}
          why="Used to sign in and for transaction alerts. Never shared for marketing."
        />
        {showReferral ? (
          <FormField
            label="Referral or partner code"
            value={referral}
            onChangeText={setReferral}
            autoCapitalize="characters"
            placeholder="e.g. RH-PRIYA"
            why="Credits the person who invited you. Optional."
          />
        ) : (
          <Button label="Have a referral code? →" variant="link" onPress={() => setShowReferral(true)} />
        )}
      </Screen>
    </KeyboardAvoidingView>
  );
}
