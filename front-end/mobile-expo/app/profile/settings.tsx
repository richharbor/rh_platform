import * as Clipboard from "expo-clipboard";
import {
  ChevronDown,
  FileText,
  Globe,
  IndianRupee,
  LogOut,
  Moon,
  ScrollText,
  Trash2,
  Vibrate,
} from "lucide-react-native";
import { useState } from "react";
import { Modal, Pressable, StyleSheet, Text, View } from "react-native";
import { Screen } from "@/components/Screen";
import { useToast } from "@/components/Toast";
import { RoleSwitcher } from "@/components/AppShell";
import { Btn, DividedSurface, ListRow, PageHeader, SwitchRow } from "@/components/ui";
import { ROLE_LABEL, user } from "@/lib/rfin-data";
import { useAuth } from "@/lib/auth-context";
import { useRole } from "@/lib/role-context";
import { fonts, radius, useTheme, useThemedStyles, type Theme } from "@/theme";

const LANGUAGES = ["English", "हिन्दी", "मराठी", "ગુજરાતી", "தமிழ்"];
const APP_VERSION = "1.0.0 (1)";

export default function SettingsScreen() {
  const { colors, t, pref, setPref, isDark } = useTheme();
  const styles = useThemedStyles(makeStyles);
  const toast = useToast();
  const { role } = useRole();
  const { signOut } = useAuth();
  const [language, setLanguage] = useState("English");
  const [picker, setPicker] = useState(false);
  const [haptics, setHaptics] = useState(true);
  const [confirmSignOut, setConfirmSignOut] = useState(false);

  return (
    <Screen>
      <PageHeader
        title="Settings"
        subtitle={`${user.rfinId} · ${ROLE_LABEL[role]}`}
        back="/profile"
      />

      <View style={{ paddingHorizontal: 20 }}>
        <Text style={[t.eyebrow, { color: colors.mutedForeground, marginBottom: 8 }]}>
          Active role
        </Text>
        <RoleSwitcher />

        <Text style={[t.eyebrow, styles.label]}>Preferences</Text>
        <DividedSurface>
          <ListRow
            icon={Globe}
            title="Language"
            subtitle={language}
            onPress={() => setPicker(true)}
          />
          <ListRow
            icon={IndianRupee}
            title="Currency"
            subtitle="Indian Rupee (₹) · fixed"
            onPress={() =>
              toast("Currency is fixed to ₹", { description: "RFIN settles all payouts in INR." })
            }
          />
          <SwitchRow
            icon={Vibrate}
            title="Haptic feedback"
            value={haptics}
            onValueChange={setHaptics}
          />
          <View style={styles.appearance}>
            <View style={styles.appearanceHead}>
              <View style={styles.appearanceIcon}>
                <Moon size={20} color={colors.brandText} />
              </View>
              <View style={{ flex: 1, minWidth: 0 }}>
                <Text style={styles.appearanceTitle}>Appearance</Text>
                <Text style={t.xs}>
                  {pref === "system"
                    ? `Following your device (${isDark ? "dark" : "light"})`
                    : `Always ${pref}`}
                </Text>
              </View>
            </View>
            <View style={styles.segmented}>
              {(["system", "light", "dark"] as const).map((opt) => {
                const active = pref === opt;
                return (
                  <Pressable
                    key={opt}
                    onPress={() => setPref(opt)}
                    style={[styles.segment, active && styles.segmentActive]}
                    accessibilityRole="button"
                    accessibilityState={{ selected: active }}
                  >
                    <Text
                      style={[
                        styles.segmentLabel,
                        { color: active ? colors.navyForeground : colors.mutedForeground },
                      ]}
                    >
                      {opt === "system" ? "System" : opt === "light" ? "Light" : "Dark"}
                    </Text>
                  </Pressable>
                );
              })}
            </View>
          </View>
        </DividedSurface>

        <Text style={[t.eyebrow, styles.label]}>Legal</Text>
        <DividedSurface>
          <ListRow
            icon={ScrollText}
            title="Terms of service"
            onPress={() => toast("Opens rfin.app/terms")}
          />
          <ListRow
            icon={FileText}
            title="Privacy policy"
            onPress={() => toast("Opens rfin.app/privacy")}
          />
          <ListRow
            icon={FileText}
            title="Grievance redressal"
            subtitle="IRDAI & RBI complaint routes"
            onPress={() => toast("Opens rfin.app/grievance")}
          />
        </DividedSurface>

        <Text style={[t.eyebrow, styles.label]}>Account</Text>
        <DividedSurface>
          <ListRow
            icon={FileText}
            title="App version"
            subtitle={APP_VERSION}
            right={<Text style={t.xs}>Copy</Text>}
            onPress={async () => {
              await Clipboard.setStringAsync(`RFIN ${APP_VERSION} · ${user.rfinId}`);
              toast("Copied", { description: "Version and RFIN ID — handy for support." });
            }}
          />
          <ListRow
            icon={Trash2}
            title="Delete account"
            subtitle="Permanently closes your RFIN account"
            onPress={() =>
              toast("Deletion needs verification", {
                description: "Raise a request from Support so we can confirm your identity.",
              })
            }
          />
        </DividedSurface>

        <Btn
          label="Sign out"
          icon={LogOut}
          variant="ghost"
          style={{ marginTop: 16 }}
          onPress={() => setConfirmSignOut(true)}
        />
        <Text style={[t.xs, { textAlign: "center", marginTop: 12 }]}>RFIN {APP_VERSION}</Text>
      </View>

      {/* Language picker */}
      <Modal
        visible={picker}
        transparent
        animationType="slide"
        onRequestClose={() => setPicker(false)}
      >
        <Pressable style={styles.backdrop} onPress={() => setPicker(false)} />
        <View style={styles.sheet}>
          <View style={styles.handle} />
          <Text style={styles.sheetTitle}>Language</Text>
          {LANGUAGES.map((l) => (
            <Pressable
              key={l}
              onPress={() => {
                setLanguage(l);
                setPicker(false);
                toast(`Language set to ${l}`, {
                  description:
                    l === "English"
                      ? undefined
                      : "Translations land with the localisation release.",
                });
              }}
              style={({ pressed }) => [
                styles.langRow,
                (pressed || l === language) && { backgroundColor: colors.secondary },
              ]}
            >
              <Text style={styles.langLabel}>{l}</Text>
              {l === language && (
                <ChevronDown
                  size={16}
                  color={colors.earn}
                  style={{ transform: [{ rotate: "-90deg" }] }}
                />
              )}
            </Pressable>
          ))}
        </View>
      </Modal>

      {/* Sign-out confirm */}
      <Modal
        visible={confirmSignOut}
        transparent
        animationType="fade"
        onRequestClose={() => setConfirmSignOut(false)}
      >
        <Pressable style={styles.centerBackdrop} onPress={() => setConfirmSignOut(false)}>
          <View style={styles.dialog}>
            <Text style={styles.dialogTitle}>Sign out?</Text>
            <Text style={[t.muted, { textAlign: "center", marginTop: 8 }]}>
              You'll need your credentials to get back in. Your role preference stays on this
              device.
            </Text>
            <Btn
              label="Sign out"
              variant="primary"
              style={{ marginTop: 20, width: "100%" }}
              onPress={() => {
                setConfirmSignOut(false);
                signOut();
              }}
            />
            <Btn
              label="Stay signed in"
              variant="ghost"
              style={{ marginTop: 8, width: "100%" }}
              onPress={() => setConfirmSignOut(false)}
            />
          </View>
        </Pressable>
      </Modal>
    </Screen>
  );
}

const makeStyles = ({ colors }: Theme) =>
  StyleSheet.create({
    label: { color: colors.mutedForeground, marginTop: 24, marginBottom: 8 },
    appearance: { paddingHorizontal: 16, paddingVertical: 14, gap: 12 },
    appearanceHead: { flexDirection: "row", alignItems: "center", gap: 12 },
    appearanceIcon: {
      width: 40,
      height: 40,
      borderRadius: radius["2xl"],
      backgroundColor: colors.muted,
      alignItems: "center",
      justifyContent: "center",
    },
    appearanceTitle: {
      fontSize: 14,
      lineHeight: 20,
      fontFamily: fonts.semibold,
      color: colors.foreground,
    },
    segmented: {
      flexDirection: "row",
      borderRadius: radius.full,
      backgroundColor: colors.muted,
      padding: 4,
    },
    segment: { flex: 1, borderRadius: radius.full, paddingVertical: 8, alignItems: "center" },
    segmentActive: { backgroundColor: colors.navy },
    segmentLabel: { fontSize: 12, lineHeight: 16, fontFamily: fonts.semibold },
    backdrop: { flex: 1, backgroundColor: colors.scrim },
    sheet: {
      backgroundColor: colors.card,
      borderTopLeftRadius: radius["3xl"],
      borderTopRightRadius: radius["3xl"],
      paddingTop: 10,
      paddingBottom: 32,
    },
    handle: {
      alignSelf: "center",
      width: 44,
      height: 4,
      borderRadius: 2,
      backgroundColor: colors.border,
      marginBottom: 12,
    },
    sheetTitle: {
      fontFamily: fonts.displayBold,
      fontSize: 16,
      lineHeight: 24,
      color: colors.foreground,
      paddingHorizontal: 20,
      paddingBottom: 8,
    },
    langRow: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      paddingHorizontal: 20,
      paddingVertical: 14,
    },
    langLabel: { fontSize: 15, lineHeight: 20, fontFamily: fonts.medium, color: colors.foreground },
    centerBackdrop: {
      flex: 1,
      backgroundColor: colors.scrim,
      alignItems: "center",
      justifyContent: "center",
      paddingHorizontal: 32,
    },
    dialog: {
      width: "100%",
      maxWidth: 320,
      alignItems: "center",
      backgroundColor: colors.card,
      borderRadius: radius["2xl"],
      padding: 24,
    },
    dialogTitle: {
      fontFamily: fonts.displayBold,
      fontSize: 18,
      lineHeight: 28,
      color: colors.foreground,
    },
  });
