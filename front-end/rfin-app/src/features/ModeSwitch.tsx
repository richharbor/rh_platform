import { useRouter } from "expo-router";
import { Pressable, View } from "react-native";
import type { Mode } from "@/domain/models";
import { fonts, radius, useTheme } from "@/design";
import { isPartner, useSession } from "@/stores/session";
import { Button, Text } from "@/ui";

const OPTIONS: { mode: Mode; label: string }[] = [
  { mode: "investor", label: "Investor" },
  { mode: "partner", label: "Partner" },
];

/**
 * Investor ↔ Partner. Same RFIN ID, different context (report #3). Partner is
 * offered only once the role exists; otherwise the user is invited to add it.
 */
export function ModeSwitch() {
  const router = useRouter();
  const { colors } = useTheme();
  const { mode, roles, setMode } = useSession();
  const partner = isPartner(roles);

  const go = (m: Mode) => {
    if (m === mode) return;
    setMode(m);
    router.replace(m === "partner" ? "/partner/home" : "/home");
  };


  if (!partner) {
    return (
      <View style={{ gap: 12 }}>
        <Text variant="muted">Refer clients and earn on every case — using the same RFIN ID you invest with.</Text>
        {/* Full partner onboarding (type, capability, KYC, payout) arrives in step 7. */}
        {/* Onboarding + verification grant the role (report #71–#81). */}
        <Button label="Become a partner" event="partner_signup" onPress={() => router.push("/partner/onboarding")} />
      </View>
    );
  }

  return (
    <View accessibilityRole="tablist" style={{ flexDirection: "row", borderWidth: 1, borderColor: colors.line, borderRadius: radius.full, padding: 4 }}>
      {OPTIONS.map((o) => {
        const on = o.mode === mode;
        return (
          <Pressable
            key={o.mode}
            accessibilityRole="tab"
            accessibilityState={{ selected: on }}
            onPress={() => go(o.mode)}
            style={{ flex: 1, alignItems: "center", paddingVertical: 10, borderRadius: radius.full, backgroundColor: on ? colors.inverse : "transparent" }}
          >
            <Text style={{ fontFamily: fonts.semibold, fontSize: 14, color: on ? colors.onInverse : colors.foreground }}>{o.label}</Text>
          </Pressable>
        );
      })}
    </View>
  );
}
