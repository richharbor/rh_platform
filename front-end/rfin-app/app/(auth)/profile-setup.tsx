import { useMutation } from "@tanstack/react-query";
import { useState } from "react";
import { KeyboardAvoidingView, Platform } from "react-native";
import { AuthHeader } from "@/features/AuthHeader";
import { useSession } from "@/stores/session";
import { Button, FormField, Screen, StickyCTA, Stepper, Text } from "@/ui";
import { useTheme } from "@/design";

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/** Basic profile — only what's needed now; financial profile comes later (report #12, #14). */
export default function ProfileSetup() {
  const { colors } = useTheme();
  const { profile, saveProfile } = useSession();
  const [name, setName] = useState(profile.name);
  const [email, setEmail] = useState(profile.email);
  const [city, setCity] = useState(profile.city);
  const [touched, setTouched] = useState(false);

  const save = useMutation({ mutationFn: () => saveProfile({ name: name.trim(), email: email.trim(), city: city.trim() }) });

  const emailError = email && !EMAIL.test(email) ? "That doesn't look like an email address" : undefined;
  const valid = name.trim().length >= 2 && !emailError;

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === "ios" ? "padding" : undefined}>
      <Screen
        footer={
          <StickyCTA note="Saved as you go — you can finish this later.">
            <Button
              label="Continue"
              block
              disabled={!valid}
              loading={save.isPending}
              onPress={() => {
                setTouched(true);
                if (valid) save.mutate();
              }}
            />
          </StickyCTA>
        }
      >
        <AuthHeader back={false} />
        <Stepper steps={["About you", "Your goals"]} current={0} />
        <Text variant="hero">A little about you</Text>
        <Text variant="muted" style={{ marginTop: -16 }}>Just the basics. We'll ask for more only when a product needs it.</Text>
        <FormField label="Full name" value={name} onChangeText={setName} autoComplete="name" textContentType="name" placeholder="As on your PAN" why="Must match your PAN when you complete KYC." error={touched && name.trim().length < 2 ? "Enter your full name" : undefined} />
        <FormField label="Email · optional" value={email} onChangeText={setEmail} keyboardType="email-address" autoCapitalize="none" autoComplete="email" placeholder="you@example.com" why="Where we send statements and policy documents." error={emailError} />
        <FormField label="City · optional" value={city} onChangeText={setCity} autoComplete="postal-address-locality" placeholder="Mumbai" why="Some products and advisors are city-specific." />
        {save.isError ? <Text variant="xs" style={{ color: colors.destructive }}>{save.error.message}</Text> : null}
      </Screen>
    </KeyboardAvoidingView>
  );
}
