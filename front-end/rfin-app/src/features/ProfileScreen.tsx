import { useRouter } from "expo-router";
import { ChevronRight, type LucideIcon, FileText, Landmark, Lock, ShieldCheck, Bell, Wrench } from "lucide-react-native";
import { Pressable, View } from "react-native";
import { useTheme, type ThemePref, fonts, radius } from "@/design";
import { needLabel } from "@/features/needs";
import { ModeSwitch } from "@/features/ModeSwitch";
import { useSession } from "@/stores/session";
import { useKycLive } from "@/api/hooks";
import { Button, IdentityCard, Row, Screen, Section, Text } from "@/ui";

function LinkRow({ icon: Icon, label, detail, onPress }: { icon: LucideIcon; label: string; detail?: string; onPress?: () => void }) {
  const { colors } = useTheme();
  return (
    <Pressable onPress={onPress} style={({ pressed }) => ({ paddingVertical: 14, borderBottomWidth: 1, borderBottomColor: colors.lineSoft, backgroundColor: pressed ? colors.pressed : "transparent" })}>
      <Row gap={12}>
        <Icon size={18} color={colors.foreground} />
        <View style={{ flex: 1 }}>
          <Text variant="title">{label}</Text>
          {detail ? <Text variant="xs" style={{ marginTop: 2 }}>{detail}</Text> : null}
        </View>
        <ChevronRight size={16} color={colors.mute} />
      </Row>
    </Pressable>
  );
}

/** Shared by both modes — one identity, one profile (report #2). */
export function ProfileScreen() {
  const router = useRouter();
  const { colors } = useTheme();
  const { pref, setPref } = useTheme();
  const { profile, phone, rfinId, needs, roles, mode, signOut } = useSession();
  const kyc = useKycLive();
  const soon = () => {}; // documents, notifications, security: step 4
  const items = kyc.data ?? [];
  const verified = items.filter((k) => k.state === "verified").length;
  const flagged = items.find((k) => k.state === "action_required");
  const kycDetail = items.length ? `${verified} of ${items.length} verified${flagged ? ` · ${flagged.label.toLowerCase()} needs attention` : ""}` : "Loading…";

  return (
    <Screen eyebrow="Profile" title="One ID." subtitle={`${rfinId ?? "RFIN"} · +91 ${phone ?? ""}`}>
      <IdentityCard name={profile.name.split(" ")[0] || "You"} meta={`${roles.map((r) => r[0].toUpperCase() + r.slice(1)).join(" · ")} · ${mode === "partner" ? "Partner mode" : "Investor mode"}`} />

      <Section title="Mode">
        <ModeSwitch />
      </Section>

      <Section title="Your goals">
        <Text variant="muted">{needs.length ? needs.map(needLabel).join(" · ") : "No goals picked yet."}</Text>
      </Section>

      <Section title="Account" gap={0}>
        <LinkRow icon={ShieldCheck} label="KYC" detail={kycDetail} onPress={() => router.push("/kyc")} />
        <LinkRow icon={Landmark} label="Bank accounts" detail="For payouts and refunds" onPress={() => router.push("/bank")} />
        <LinkRow icon={FileText} label="Documents" onPress={soon} />
        <LinkRow icon={Bell} label="Notifications" detail="Push, email, WhatsApp — your choice" onPress={soon} />
        <LinkRow icon={Lock} label="Security & consent" detail="Sessions, biometric lock, consent history" onPress={soon} />
        {__DEV__ ? <LinkRow icon={Wrench} label="Developer" detail="Component gallery, mock scenarios" onPress={() => router.push("/dev")} /> : null}
      </Section>

      <Section title="Appearance">
        <View style={{ flexDirection: "row", borderWidth: 1, borderColor: colors.line, borderRadius: radius.full, padding: 4 }}>
          {(["system", "light", "dark"] as ThemePref[]).map((p) => (
            <Pressable key={p} onPress={() => setPref(p)} style={{ flex: 1, alignItems: "center", paddingVertical: 8, borderRadius: radius.full, backgroundColor: pref === p ? colors.inverse : "transparent" }}>
              <Text style={{ fontFamily: fonts.semibold, fontSize: 13, color: pref === p ? colors.onInverse : colors.foreground, textTransform: "capitalize" }}>{p}</Text>
            </Pressable>
          ))}
        </View>
      </Section>

      <Button label="Sign out" variant="outline" onPress={signOut} />
    </Screen>
  );
}
