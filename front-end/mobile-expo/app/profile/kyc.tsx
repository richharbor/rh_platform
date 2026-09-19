import { BadgeCheck, Check, ShieldCheck, Upload } from "lucide-react-native";
import { StyleSheet, Text, View } from "react-native";
import { Rise } from "@/components/motion";
import { Screen } from "@/components/Screen";
import { useToast } from "@/components/Toast";
import {
  Btn,
  DividedSurface,
  GradientSurface,
  IconBadge,
  PageHeader,
  ProgressBar,
  StatusChip,
  Surface,
} from "@/components/ui";
import { kycSteps, user } from "@/lib/rfin-data";
import { fonts, useTheme, useThemedStyles, type Theme } from "@/theme";

export default function KycScreen() {
  const { colors, t } = useTheme();
  const styles = useThemedStyles(makeStyles);
  const toast = useToast();
  const done = kycSteps.filter((k) => k.state === "Verified").length;
  const pct = (done / kycSteps.length) * 100;
  const blocked = kycSteps.filter((k) => k.state !== "Verified");

  return (
    <Screen>
      <PageHeader title="KYC" subtitle="Identity verification" back="/profile" />

      <View style={{ paddingHorizontal: 20 }}>
        <Rise>
          <GradientSurface tone="navy" style={{ padding: 20 }}>
            <View style={styles.heroRow}>
              <IconBadge
                icon={ShieldCheck}
                size={48}
                iconSize={24}
                bg={colors.onDark12}
                color={colors.navyForeground}
              />
              <View style={{ flex: 1 }}>
                <Text style={[t.eyebrow, { color: colors.navyMuted }]}>Overall status</Text>
                <Text style={styles.heroTitle}>{user.kyc}</Text>
              </View>
              <StatusChip label={user.kyc} />
            </View>
            <ProgressBar
              value={pct}
              tone="light"
              trackColor={colors.onDark15}
              style={{ marginTop: 16 }}
            />
            <Text style={styles.heroSub}>
              {done} of {kycSteps.length} checks complete
            </Text>
          </GradientSurface>
        </Rise>

        <Text style={[t.eyebrow, styles.groupLabel]}>Checks</Text>
        <DividedSurface>
          {kycSteps.map((k) => (
            <View key={k.id} style={styles.step}>
              <View
                style={[
                  styles.dot,
                  k.state === "Verified"
                    ? { backgroundColor: colors.earn }
                    : { backgroundColor: colors.muted },
                ]}
              >
                {k.state === "Verified" ? <Check size={13} color={colors.earnForeground} /> : null}
              </View>
              <View style={{ flex: 1, minWidth: 0 }}>
                <Text style={styles.stepLabel}>{k.label}</Text>
                <Text style={t.xs} numberOfLines={1}>
                  {k.detail}
                  {k.updated ? ` · ${k.updated}` : ""}
                </Text>
              </View>
              <StatusChip label={k.state} />
            </View>
          ))}
        </DividedSurface>

        {blocked.length > 0 && (
          <Surface style={styles.note}>
            <BadgeCheck size={18} color={colors.warning} />
            <Text style={styles.noteText}>
              {blocked.length} check{blocked.length > 1 ? "s" : ""} left. Private-market products
              need every check cleared before you can transact.
            </Text>
          </Surface>
        )}

        <Btn
          label="Upload address proof"
          icon={Upload}
          variant="earn"
          style={{ marginTop: 16 }}
          onPress={() =>
            toast("Document picker", {
              description: "Hook this to expo-document-picker when the upload API is ready.",
            })
          }
        />
        <Btn
          label="Re-run verification"
          variant="ghost"
          style={{ marginTop: 8 }}
          onPress={() =>
            toast("Verification queued", { description: "We'll notify you when it completes." })
          }
        />
      </View>
    </Screen>
  );
}

const makeStyles = ({ colors }: Theme) =>
  StyleSheet.create({
    heroRow: { flexDirection: "row", alignItems: "center", gap: 12 },
    heroTitle: {
      fontFamily: fonts.displayBold,
      fontSize: 18,
      lineHeight: 28,
      color: colors.navyForeground,
    },
    heroSub: {
      marginTop: 8,
      fontSize: 12,
      lineHeight: 16,
      fontFamily: fonts.medium,
      color: colors.navyMuted,
    },
    groupLabel: { color: colors.mutedForeground, marginTop: 24, marginBottom: 8 },
    step: {
      flexDirection: "row",
      alignItems: "center",
      gap: 12,
      paddingHorizontal: 16,
      paddingVertical: 14,
    },
    dot: {
      width: 22,
      height: 22,
      borderRadius: 11,
      alignItems: "center",
      justifyContent: "center",
    },
    stepLabel: {
      fontSize: 14,
      lineHeight: 20,
      fontFamily: fonts.semibold,
      color: colors.foreground,
    },
    note: { flexDirection: "row", gap: 12, alignItems: "flex-start", padding: 16, marginTop: 16 },
    noteText: {
      flex: 1,
      fontSize: 13,
      lineHeight: 18,
      fontFamily: fonts.regular,
      color: colors.foreground,
    },
  });
