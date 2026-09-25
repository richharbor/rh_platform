import { useMutation, useQueryClient } from "@tanstack/react-query";
import * as DocumentPicker from "expo-document-picker";
import * as ImagePicker from "expo-image-picker";
import { useLocalSearchParams, useRouter } from "expo-router";
import { Camera, FileText, Image as ImageIcon, type LucideIcon } from "lucide-react-native";
import { useState } from "react";
import { Image, Pressable, View } from "react-native";
import { api } from "@/api/client";
import { useKycLive } from "@/api/hooks";
import { track } from "@/analytics";
import { radius, useTheme } from "@/design";
import { PageHeader } from "@/features/PageHeader";
import { Button, DisclosureBlock, ErrorState, Row, Screen, StickyCTA, Text } from "@/ui";

type Picked = { name: string; uri: string; isImage: boolean };

const TIPS: Record<string, string[]> = {
  address: ["Aadhaar, passport, driving licence or a utility bill under 3 months old", "All four corners visible, in daylight, no glare", "Name must match your PAN"],
  selfie: ["Face the camera in good light", "Remove glasses and caps", "Only you in the frame"],
  pan: ["Clear photo of the front of your PAN card"],
};

/** Secure upload with a reason, validation feedback and re-upload (report #35). */
export default function Upload() {
  const { item } = useLocalSearchParams<{ item: string }>();
  const router = useRouter();
  const qc = useQueryClient();
  const { colors } = useTheme();
  const kyc = useKycLive();
  const k = kyc.data?.find((x) => x.id === item);
  const [file, setFile] = useState<Picked | null>(null);
  const [pickError, setPickError] = useState<string>();
  const isSelfie = item === "selfie";

  const upload = useMutation({
    mutationFn: () => api("kyc.upload", { itemId: item, fileName: file!.name }),
    onSuccess: () => {
      track("document_uploaded", { item });
      qc.invalidateQueries({ queryKey: ["kyc"] });
      router.back();
    },
  });

  const fromCamera = async () => {
    const perm = await ImagePicker.requestCameraPermissionsAsync();
    if (!perm.granted) return setPickError("Camera access is off. Turn it on in Settings, or choose a photo instead.");
    const r = await ImagePicker.launchCameraAsync({ quality: 0.7, cameraType: isSelfie ? ImagePicker.CameraType.front : ImagePicker.CameraType.back });
    if (!r.canceled) setFile({ name: r.assets[0].fileName ?? `${item}.jpg`, uri: r.assets[0].uri, isImage: true });
  };
  const fromLibrary = async () => {
    const r = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ["images"], quality: 0.7 });
    if (!r.canceled) setFile({ name: r.assets[0].fileName ?? `${item}.jpg`, uri: r.assets[0].uri, isImage: true });
  };
  const fromFiles = async () => {
    const r = await DocumentPicker.getDocumentAsync({ type: ["application/pdf", "image/*"], copyToCacheDirectory: true });
    if (r.canceled) return;
    const a = r.assets[0];
    if (a.size && a.size > 5 * 1024 * 1024) return setPickError("That file is over 5 MB. Try a smaller scan or a photo.");
    setFile({ name: a.name, uri: a.uri, isImage: !!a.mimeType?.startsWith("image/") });
  };

  const sources: { label: string; icon: LucideIcon; onPress: () => void }[] = isSelfie
    ? [{ label: "Take a selfie", icon: Camera, onPress: fromCamera }]
    : [
        { label: "Camera", icon: Camera, onPress: fromCamera },
        { label: "Photos", icon: ImageIcon, onPress: fromLibrary },
        { label: "Files", icon: FileText, onPress: fromFiles },
      ];

  if (kyc.data && !k) return <Screen><PageHeader /><ErrorState title="Not found" body="This KYC item doesn't exist." /></Screen>;

  return (
    <Screen
        header={<PageHeader label="KYC" />}
      eyebrow={k?.state === "action_required" ? "Re-upload" : "Upload"}
      title={k?.label ?? "Document"}
      subtitle={k?.why}
      footer={
        <StickyCTA note="Encrypted in transit and at rest. Shared only with providers you transact with.">
          <Button label={file ? "Submit for review" : "Choose a file first"} block disabled={!file} loading={upload.isPending} onPress={() => upload.mutate()} />
        </StickyCTA>
      }
    >

      {k?.rejectionReason ? (
        <View style={{ padding: 16, borderRadius: radius["2xl"], backgroundColor: colors.redSoft, gap: 4 }}>
          <Text variant="label" style={{ color: colors.red }}>Why it was returned</Text>
          <Text variant="body">{k.rejectionReason}</Text>
        </View>
      ) : null}

      <DisclosureBlock title="Get it right first time" items={TIPS[item] ?? ["A clear, readable copy"]} />

      <Row gap={10}>
        {sources.map((s) => (
          <Pressable key={s.label} onPress={() => { setPickError(undefined); s.onPress(); }} style={({ pressed }) => ({ flex: 1, alignItems: "center", gap: 8, paddingVertical: 20, borderRadius: radius["2xl"], borderWidth: 1, borderColor: colors.line, backgroundColor: pressed ? colors.pressed : "transparent" })}>
            <s.icon size={22} color={colors.foreground} />
            <Text variant="title">{s.label}</Text>
          </Pressable>
        ))}
      </Row>

      {pickError ? <Text variant="xs" style={{ color: colors.red }}>{pickError}</Text> : null}
      {upload.isError ? <Text variant="xs" style={{ color: colors.red }}>{upload.error.message}</Text> : null}

      {file ? (
        <View style={{ gap: 10 }}>
          <Text variant="label">Selected</Text>
          {file.isImage ? <Image source={{ uri: file.uri }} style={{ width: "100%", aspectRatio: 1.5, borderRadius: radius["2xl"], backgroundColor: colors.track }} resizeMode="cover" /> : null}
          <Row style={{ justifyContent: "space-between" }}>
            <Text variant="title" numberOfLines={1} style={{ flex: 1 }}>{file.name}</Text>
            <Button label="Change" variant="link" onPress={() => setFile(null)} />
          </Row>
        </View>
      ) : null}
      <Text variant="xs">Mock: file names containing "blur" are rejected again after review.</Text>
    </Screen>
  );
}
