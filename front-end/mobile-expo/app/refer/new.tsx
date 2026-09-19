import * as Clipboard from "expo-clipboard";
import { useLocalSearchParams } from "expo-router";
import { Check, ChevronDown, Copy, MessageCircle, QrCode, Share2 } from "lucide-react-native";
import { useMemo, useState } from "react";
import {
  Linking,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  Share,
  StyleSheet,
  Text,
  View,
} from "react-native";
import QRCode from "react-native-qrcode-svg";
import { Rise } from "@/components/motion";
import { productIcon } from "@/components/ProductCard";
import { Screen } from "@/components/Screen";
import { useToast } from "@/components/Toast";
import {
  Btn,
  DividedSurface,
  Field,
  GradientSurface,
  IconBadge,
  PageHeader,
  Surface,
} from "@/components/ui";
import { products, user } from "@/lib/rfin-data";
import { fonts, radius, useTheme, useThemedStyles, type Theme } from "@/theme";

export default function NewReferralScreen() {
  const { colors, t } = useTheme();
  const styles = useThemedStyles(makeStyles);
  const params = useLocalSearchParams<{ product?: string }>();
  const toast = useToast();

  const [slug, setSlug] = useState<string>(
    params.product && products.some((p) => p.slug === params.product)
      ? params.product
      : products[0].slug,
  );
  const [picker, setPicker] = useState(false);
  const [showQr, setShowQr] = useState(false);
  const [person, setPerson] = useState("");
  const [phone, setPhone] = useState("");
  const [consent, setConsent] = useState(false);

  const product = products.find((p) => p.slug === slug)!;
  const Icon = productIcon[slug];

  const link = useMemo(
    () => `https://rfin.app/r/${user.rfinId.replace("RFIN-", "").toLowerCase()}/${slug}`,
    [slug],
  );
  const message = `Hi${person ? ` ${person.split(" ")[0]}` : ""}, I use RFIN for ${product.name} — ${product.tagline}. Have a look: ${link}`;

  const shareWhatsApp = async () => {
    const url = `whatsapp://send?text=${encodeURIComponent(message)}${phone.trim() ? `&phone=${phone.replace(/\D/g, "")}` : ""}`;
    try {
      const supported = await Linking.canOpenURL(url);
      if (supported) {
        await Linking.openURL(url);
        return;
      }
    } catch {
      /* fall through to the system share sheet */
    }
    try {
      await Share.share({ message });
    } catch {
      toast("Couldn't open WhatsApp", { description: "Copy the link and share it manually." });
    }
  };

  const copyLink = async () => {
    await Clipboard.setStringAsync(link);
    toast("Referral link copied", { description: link });
  };

  const shareOther = async () => {
    try {
      await Share.share(Platform.OS === "ios" ? { message, url: link } : { message });
    } catch {
      /* user dismissed the sheet */
    }
  };

  return (
    <Screen>
      <PageHeader
        title="Create referral"
        subtitle="Three taps: pick, consent, share"
        back="/refer"
      />

      <View style={{ paddingHorizontal: 20, gap: 12 }}>
        <Text style={[t.eyebrow, { color: colors.mutedForeground }]}>Product</Text>
        <Pressable onPress={() => setPicker(true)}>
          <Surface style={styles.picker}>
            <IconBadge icon={Icon} bg={colors.navy} color={colors.navyForeground} />
            <View style={{ flex: 1, minWidth: 0 }}>
              <Text style={styles.pickerName}>{product.name}</Text>
              <Text style={t.xs} numberOfLines={1}>
                You earn {product.referralReward}
              </Text>
            </View>
            <ChevronDown size={18} color={colors.mutedForeground} />
          </Surface>
        </Pressable>

        <Rise>
          <GradientSurface tone="gold" style={styles.rewardCard}>
            <Text style={[t.eyebrow, { color: colors.goldForeground, opacity: 0.8 }]}>
              Your referral reward
            </Text>
            <Text style={styles.rewardValue}>{product.referralReward}</Text>
            <Text style={styles.rewardNote}>
              Paid once the referral converts and clears free-look.
            </Text>
          </GradientSurface>
        </Rise>

        <Text style={[t.eyebrow, { color: colors.mutedForeground, marginTop: 8 }]}>
          Who are you referring? (optional)
        </Text>
        <Field placeholder="Name" value={person} onChangeText={setPerson} autoCapitalize="words" />
        <Field
          placeholder="WhatsApp number"
          value={phone}
          onChangeText={setPhone}
          keyboardType="phone-pad"
        />

        <Pressable onPress={() => setConsent(!consent)} style={styles.consentRow}>
          <View style={[styles.checkbox, consent && styles.checkboxOn]}>
            {consent && <Check size={14} color={colors.earnForeground} />}
          </View>
          <Text style={styles.consentText}>
            They agreed to be contacted by RFIN about {product.name}. Consent is recorded on the
            referral.
          </Text>
        </Pressable>

        <DividedSurface>
          <View style={styles.linkRow}>
            <View style={{ flex: 1, minWidth: 0 }}>
              <Text style={[t.eyebrow, { color: colors.mutedForeground }]}>Referral link</Text>
              <Text style={styles.linkText} numberOfLines={1}>
                {link}
              </Text>
            </View>
          </View>
        </DividedSurface>

        <Text style={[t.eyebrow, { color: colors.mutedForeground, marginTop: 8 }]}>Share via</Text>
        <View style={styles.shareRow}>
          <ShareTile
            icon={MessageCircle}
            label="WhatsApp"
            tone="earn"
            disabled={!consent}
            onPress={shareWhatsApp}
          />
          <ShareTile
            icon={Copy}
            label="Copy link"
            tone="navy"
            disabled={!consent}
            onPress={copyLink}
          />
          <ShareTile
            icon={QrCode}
            label="QR code"
            tone="gold"
            disabled={!consent}
            onPress={() => setShowQr(true)}
          />
        </View>
        {!consent && (
          <Text style={[t.xs, { textAlign: "center" }]}>
            Confirm consent above to enable sharing.
          </Text>
        )}

        <Btn
          label="More share options"
          icon={Share2}
          variant="ghost"
          disabled={!consent}
          onPress={shareOther}
          style={{ marginTop: 4 }}
        />
      </View>

      {/* Product picker */}
      <Modal
        visible={picker}
        animationType="slide"
        transparent
        onRequestClose={() => setPicker(false)}
      >
        <Pressable style={styles.sheetBackdrop} onPress={() => setPicker(false)} />
        <View style={styles.sheet}>
          <View style={styles.sheetHandle} />
          <Text style={styles.sheetTitle}>Select product</Text>
          <ScrollView style={{ maxHeight: 420 }} showsVerticalScrollIndicator={false}>
            {products.map((p) => {
              const PIcon = productIcon[p.slug];
              const selected = p.slug === slug;
              return (
                <Pressable
                  key={p.slug}
                  onPress={() => {
                    setSlug(p.slug);
                    setPicker(false);
                  }}
                  style={({ pressed }) => [
                    styles.sheetRow,
                    (pressed || selected) && { backgroundColor: colors.secondary },
                  ]}
                >
                  <IconBadge
                    icon={PIcon}
                    bg={selected ? colors.navy : colors.muted}
                    color={selected ? colors.navyForeground : colors.navy}
                  />
                  <View style={{ flex: 1, minWidth: 0 }}>
                    <Text style={styles.pickerName}>{p.name}</Text>
                    <Text style={t.xs} numberOfLines={1}>
                      {p.referralReward}
                    </Text>
                  </View>
                </Pressable>
              );
            })}
          </ScrollView>
        </View>
      </Modal>

      {/* QR code */}
      <Modal
        visible={showQr}
        animationType="fade"
        transparent
        onRequestClose={() => setShowQr(false)}
      >
        <Pressable style={styles.qrBackdrop} onPress={() => setShowQr(false)}>
          <View style={styles.qrCard}>
            <Text style={styles.qrTitle}>{product.name}</Text>
            <Text style={[t.xs, { textAlign: "center", marginBottom: 16 }]}>
              Scan to open your referral link
            </Text>
            <View style={styles.qrBox}>
              {/* fixed dark-on-white: a themed QR would stop scanning in dark mode */}
              <QRCode value={link} size={196} color="#152341" backgroundColor="#ffffff" />
            </View>
            <Text style={styles.qrLink} numberOfLines={2}>
              {link}
            </Text>
            <Btn
              label="Done"
              variant="primary"
              onPress={() => setShowQr(false)}
              style={{ marginTop: 16, width: "100%" }}
            />
          </View>
        </Pressable>
      </Modal>
    </Screen>
  );
}

function ShareTile({
  icon: Icon,
  label,
  tone,
  disabled,
  onPress,
}: {
  icon: typeof Copy;
  label: string;
  tone: "earn" | "navy" | "gold";
  disabled?: boolean;
  onPress: () => void;
}) {
  const { colors } = useTheme();
  const styles = useThemedStyles(makeStyles);
  const bg =
    tone === "earn" ? colors.earnSoft : tone === "gold" ? colors.goldSoft : colors.infoSoft;
  const fg =
    tone === "earn" ? colors.onEarnSoft : tone === "gold" ? colors.onGoldSoft : colors.onInfoSoft;
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      style={({ pressed }) => [
        styles.shareTile,
        disabled && { opacity: 0.45 },
        pressed && !disabled && { transform: [{ scale: 0.97 }] },
      ]}
    >
      <IconBadge icon={Icon} size={44} iconSize={22} bg={bg} color={fg} />
      <Text style={styles.shareLabel}>{label}</Text>
    </Pressable>
  );
}

const makeStyles = ({ colors }: Theme) =>
  StyleSheet.create({
    picker: { flexDirection: "row", alignItems: "center", gap: 12, padding: 12 },
    pickerName: {
      fontSize: 14,
      lineHeight: 20,
      fontFamily: fonts.semibold,
      color: colors.foreground,
    },
    rewardCard: { padding: 20 },
    rewardValue: {
      marginTop: 4,
      fontFamily: fonts.displayBold,
      fontSize: 24,
      lineHeight: 32,
      letterSpacing: -0.84,
      color: colors.goldForeground,
    },
    rewardNote: {
      marginTop: 6,
      fontSize: 12,
      lineHeight: 16,
      fontFamily: fonts.regular,
      color: colors.goldForeground,
      opacity: 0.85,
    },
    consentRow: { flexDirection: "row", alignItems: "flex-start", gap: 12, paddingVertical: 4 },
    checkbox: {
      width: 22,
      height: 22,
      borderRadius: 7,
      borderWidth: 1.5,
      borderColor: colors.border,
      backgroundColor: colors.card,
      alignItems: "center",
      justifyContent: "center",
    },
    checkboxOn: { backgroundColor: colors.earn, borderColor: colors.earn },
    consentText: {
      flex: 1,
      fontSize: 13,
      lineHeight: 18,
      fontFamily: fonts.regular,
      color: colors.foreground,
    },
    linkRow: {
      flexDirection: "row",
      alignItems: "center",
      gap: 12,
      paddingHorizontal: 16,
      paddingVertical: 12,
    },
    linkText: { marginTop: 2, fontSize: 13, fontFamily: fonts.medium, color: colors.brandText },
    shareRow: { flexDirection: "row", gap: 12 },
    shareTile: {
      flex: 1,
      alignItems: "center",
      gap: 8,
      borderRadius: radius["2xl"],
      borderWidth: 1,
      borderColor: colors.border,
      backgroundColor: colors.card,
      paddingVertical: 14,
    },
    shareLabel: {
      fontSize: 12,
      lineHeight: 16,
      fontFamily: fonts.semibold,
      color: colors.foreground,
    },
    sheetBackdrop: { flex: 1, backgroundColor: colors.scrim },
    sheet: {
      backgroundColor: colors.card,
      borderTopLeftRadius: radius["3xl"],
      borderTopRightRadius: radius["3xl"],
      paddingBottom: 32,
      paddingTop: 10,
    },
    sheetHandle: {
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
    sheetRow: {
      flexDirection: "row",
      alignItems: "center",
      gap: 12,
      paddingHorizontal: 20,
      paddingVertical: 12,
    },
    qrBackdrop: {
      flex: 1,
      backgroundColor: colors.scrim,
      alignItems: "center",
      justifyContent: "center",
      paddingHorizontal: 32,
    },
    qrCard: {
      width: "100%",
      maxWidth: 320,
      alignItems: "center",
      backgroundColor: colors.card,
      borderRadius: radius["2xl"],
      padding: 24,
    },
    qrTitle: {
      fontFamily: fonts.displayBold,
      fontSize: 18,
      lineHeight: 28,
      letterSpacing: -0.36,
      color: colors.foreground,
    },
    qrBox: { padding: 12, backgroundColor: colors.card, borderRadius: radius.lg },
    qrLink: {
      marginTop: 12,
      fontSize: 11,
      fontFamily: fonts.medium,
      color: colors.mutedForeground,
      textAlign: "center",
    },
  });
