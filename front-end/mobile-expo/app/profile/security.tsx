import {
  Fingerprint,
  KeyRound,
  LogOut,
  Monitor,
  ShieldCheck,
  Smartphone,
} from "lucide-react-native";
import { useState } from "react";
import { StyleSheet, Text, View } from "react-native";
import { Screen } from "@/components/Screen";
import { useToast } from "@/components/Toast";
import {
  Btn,
  DividedSurface,
  GradientSurface,
  IconBadge,
  ListRow,
  PageHeader,
  Pill,
  SwitchRow,
} from "@/components/ui";
import { sessions as seed } from "@/lib/rfin-data";
import { fonts, useTheme, useThemedStyles, type Theme } from "@/theme";

export default function SecurityScreen() {
  const { colors, t } = useTheme();
  const styles = useThemedStyles(makeStyles);
  const toast = useToast();
  const [biometric, setBiometric] = useState(true);
  const [appLock, setAppLock] = useState(true);
  const [twoFa, setTwoFa] = useState(false);
  const [payoutOtp, setPayoutOtp] = useState(true);
  const [sessions, setSessions] = useState(seed);

  const others = sessions.filter((s) => !s.current);

  return (
    <Screen>
      <PageHeader title="Security" subtitle="Protect your account and payouts" back="/profile" />

      <View style={{ paddingHorizontal: 20 }}>
        <GradientSurface tone="navy" style={styles.hero}>
          <IconBadge
            icon={ShieldCheck}
            size={48}
            iconSize={24}
            bg={colors.onDark12}
            color={colors.navyForeground}
          />
          <View style={{ flex: 1 }}>
            <Text style={[t.eyebrow, { color: colors.navyMuted }]}>Account security</Text>
            <Text style={styles.heroTitle}>{twoFa ? "Strong" : "Good"}</Text>
            <Text style={styles.heroSub}>
              {twoFa ? "Two-factor is on" : "Turn on two-factor to reach Strong"}
            </Text>
          </View>
        </GradientSurface>

        <Text style={[t.eyebrow, styles.label]}>Sign-in</Text>
        <DividedSurface>
          <SwitchRow
            icon={Fingerprint}
            title="Biometric unlock"
            subtitle="Face ID or fingerprint"
            value={biometric}
            onValueChange={(v) => {
              setBiometric(v);
              toast(v ? "Biometric unlock on" : "Biometric unlock off");
            }}
          />
          <SwitchRow
            icon={KeyRound}
            title="App lock"
            subtitle="Ask on every launch"
            value={appLock}
            onValueChange={setAppLock}
          />
          <SwitchRow
            icon={Smartphone}
            title="Two-factor authentication"
            subtitle="OTP on sign-in from a new device"
            value={twoFa}
            onValueChange={(v) => {
              setTwoFa(v);
              toast(v ? "Two-factor enabled" : "Two-factor disabled", {
                description: v
                  ? "You'll get an OTP on new devices."
                  : "Your account is less protected.",
              });
            }}
          />
        </DividedSurface>

        <Text style={[t.eyebrow, styles.label]}>Payouts</Text>
        <DividedSurface>
          <SwitchRow
            icon={ShieldCheck}
            title="OTP before payout changes"
            subtitle="Required to add or switch a bank account"
            value={payoutOtp}
            onValueChange={setPayoutOtp}
          />
          <ListRow
            icon={KeyRound}
            title="Change PIN"
            subtitle="6-digit transaction PIN"
            onPress={() =>
              toast("Change PIN", { description: "Flow opens once the auth API is connected." })
            }
          />
        </DividedSurface>

        <Text style={[t.eyebrow, styles.label]}>Active sessions</Text>
        <DividedSurface>
          {sessions.map((s) => (
            <View key={s.id} style={styles.session}>
              <IconBadge
                icon={s.device.toLowerCase().includes("chrome") ? Monitor : Smartphone}
                bg={colors.muted}
                color={colors.brandText}
              />
              <View style={{ flex: 1, minWidth: 0 }}>
                <View style={styles.sessionHead}>
                  <Text style={styles.sessionDevice} numberOfLines={1}>
                    {s.device}
                  </Text>
                  {s.current && (
                    <Pill
                      label="This device"
                      bg={colors.earnSoft}
                      color={colors.earn}
                      size="sm"
                      weight="semibold"
                    />
                  )}
                </View>
                <Text style={t.xs}>
                  {s.location} · {s.lastActive}
                </Text>
              </View>
            </View>
          ))}
        </DividedSurface>

        {others.length > 0 && (
          <Btn
            label={`Sign out ${others.length} other session${others.length > 1 ? "s" : ""}`}
            icon={LogOut}
            variant="ghost"
            style={{ marginTop: 12 }}
            onPress={() => {
              setSessions((all) => all.filter((s) => s.current));
              toast("Other sessions signed out");
            }}
          />
        )}
      </View>
    </Screen>
  );
}

const makeStyles = ({ colors }: Theme) =>
  StyleSheet.create({
    hero: { flexDirection: "row", alignItems: "center", gap: 16, padding: 20 },
    heroTitle: {
      fontFamily: fonts.displayBold,
      fontSize: 18,
      lineHeight: 28,
      color: colors.navyForeground,
    },
    heroSub: { fontSize: 12, lineHeight: 16, fontFamily: fonts.regular, color: colors.navyMuted },
    label: { color: colors.mutedForeground, marginTop: 24, marginBottom: 8 },
    session: {
      flexDirection: "row",
      alignItems: "center",
      gap: 12,
      paddingHorizontal: 16,
      paddingVertical: 14,
    },
    sessionHead: { flexDirection: "row", alignItems: "center", gap: 8 },
    sessionDevice: {
      flexShrink: 1,
      fontSize: 14,
      lineHeight: 20,
      fontFamily: fonts.semibold,
      color: colors.foreground,
    },
  });
