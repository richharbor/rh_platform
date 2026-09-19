import {
  Bell,
  Coins,
  FileText,
  Handshake,
  Landmark,
  LifeBuoy,
  Lock,
  ReceiptText,
  Settings,
  Share2,
  ShieldCheck,
  Wallet,
} from "lucide-react-native";
import type { ReactNode } from "react";
import { StyleSheet, Text, View } from "react-native";
import { RoleSwitcher } from "@/components/AppShell";
import { Screen } from "@/components/Screen";
import { DividedSurface, GradientSurface, ListRow, Pill, StatusChip } from "@/components/ui";
import { formatIN, formatINR, ROLE_LABEL, user } from "@/lib/rfin-data";
import { useDisplayUser } from "@/lib/use-display-user";
import { fonts, radius, useTheme, useThemedStyles, type Theme } from "@/theme";

export default function ProfileScreen() {
  const displayUser = useDisplayUser();
  const { colors, t } = useTheme();
  const styles = useThemedStyles(makeStyles);
  return (
    <Screen>
      <View style={styles.header}>
        <Text style={t.h1}>Profile</Text>
      </View>

      <View style={{ paddingHorizontal: 20, paddingTop: 16 }}>
        <GradientSurface tone="navy" style={{ padding: 20 }}>
          <View style={styles.identity}>
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>{displayUser.firstName[0]}</Text>
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.userName}>{displayUser.name}</Text>
              <Text style={styles.userMeta}>
                {displayUser.rfinId} · {displayUser.city}
              </Text>
            </View>
          </View>
          <View style={styles.roles}>
            {displayUser.roles.map((r) => (
              <Pill
                key={r}
                label={ROLE_LABEL[r]}
                bg={colors.onDark12}
                color={colors.navyForeground}
                size="sm"
                weight="semibold"
              />
            ))}
          </View>
          <View style={styles.summaryRow}>
            <View style={styles.summaryCell}>
              <Text style={[t.eyebrow, { color: colors.navyMuted }]}>Business earnings</Text>
              <Text style={styles.summaryValue} numberOfLines={1} adjustsFontSizeToFit>
                {formatINR(user.earnings.lifetime + user.referralEarnings.lifetime)}
              </Text>
            </View>
            <View style={styles.summaryCell}>
              <Text style={[t.eyebrow, { color: colors.navyMuted }]}>RFIN Points</Text>
              <Text
                style={[styles.summaryValue, { color: colors.gold }]}
                numberOfLines={1}
                adjustsFontSizeToFit
              >
                {formatIN(user.points)}
              </Text>
            </View>
          </View>
        </GradientSurface>
      </View>

      <View style={{ paddingHorizontal: 20, paddingTop: 16 }}>
        <Text style={[t.eyebrow, { color: colors.mutedForeground, marginBottom: 8 }]}>
          Active role
        </Text>
        <RoleSwitcher />
      </View>

      <Group title="Verification">
        <ListRow
          icon={ShieldCheck}
          title="KYC"
          subtitle="PAN & Aadhaar"
          right={<StatusChip label={user.kyc} />}
          to="/profile/kyc"
        />
        <ListRow
          icon={Landmark}
          title="Bank account"
          subtitle={user.bank}
          right={<StatusChip label="Verified" />}
          to="/profile/bank"
        />
      </Group>

      <Group title="Money">
        <ListRow
          icon={Wallet}
          title="Business earnings"
          subtitle="Commissions & referral income"
          to="/seller/earnings"
        />
        <ListRow icon={Coins} title="RFIN Points" subtitle="Loyalty points wallet" to="/rewards" />
        <ListRow
          icon={ReceiptText}
          title="Transactions"
          subtitle="Auditable ledger"
          to="/transactions"
        />
      </Group>

      <Group title="Activity">
        <ListRow icon={Handshake} title="Leads" subtitle="Seller pipeline" to="/seller/leads" />
        <ListRow icon={Share2} title="Referrals" subtitle="Shared & converted" to="/refer" />
        <ListRow
          icon={FileText}
          title="Documents"
          subtitle="Uploaded & requested"
          to="/profile/documents"
        />
      </Group>

      <Group title="Account">
        <ListRow icon={Bell} title="Notifications" to="/profile/notifications" />
        <ListRow icon={LifeBuoy} title="Support" to="/profile/support" />
        <ListRow icon={Lock} title="Security" to="/profile/security" />
        <ListRow icon={Settings} title="Settings" to="/profile/settings" />
      </Group>
    </Screen>
  );
}

function Group({ title, children }: { title: string; children: ReactNode }) {
  const { colors, t } = useTheme();
  return (
    <View style={{ paddingHorizontal: 20, paddingTop: 24 }}>
      <Text style={[t.eyebrow, { color: colors.mutedForeground, marginBottom: 8 }]}>{title}</Text>
      <DividedSurface>{children}</DividedSurface>
    </View>
  );
}

const makeStyles = ({ colors }: Theme) =>
  StyleSheet.create({
    header: { paddingHorizontal: 20, paddingTop: 24 },
    identity: { flexDirection: "row", alignItems: "center", gap: 16 },
    avatar: {
      width: 56,
      height: 56,
      borderRadius: radius.full,
      backgroundColor: colors.gold,
      alignItems: "center",
      justifyContent: "center",
    },
    avatarText: {
      fontFamily: fonts.displayBold,
      fontSize: 20,
      lineHeight: 28,
      color: colors.goldForeground,
    },
    userName: {
      fontFamily: fonts.bold,
      fontSize: 18,
      lineHeight: 28,
      color: colors.navyForeground,
    },
    userMeta: { fontSize: 14, lineHeight: 20, fontFamily: fonts.regular, color: colors.navyMuted },
    roles: { marginTop: 16, flexDirection: "row", flexWrap: "wrap", gap: 6 },
    summaryRow: { marginTop: 16, flexDirection: "row", gap: 8 },
    summaryCell: {
      flex: 1,
      borderRadius: radius["2xl"],
      backgroundColor: colors.onDark10,
      padding: 12,
    },
    summaryValue: {
      fontFamily: fonts.displayBold,
      fontSize: 20,
      lineHeight: 28,
      letterSpacing: -0.7,
      marginTop: 2,
      color: colors.navyForeground,
    },
  });
