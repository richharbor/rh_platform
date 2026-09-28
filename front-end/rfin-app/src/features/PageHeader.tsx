import { useRouter } from "expo-router";
import { ArrowLeft, X } from "lucide-react-native";
import { Pressable } from "react-native";
import { useTheme } from "@/design";
import { Row, Text } from "@/ui";

/** Back (or close) arrow with an optional mono context label on the right. */
export function PageHeader({ label, close, onBack }: { label?: string; close?: boolean; onBack?: () => void }) {
  const router = useRouter();
  const { colors } = useTheme();
  const Icon = close ? X : ArrowLeft;
  return (
    <Row style={{ justifyContent: "space-between", minHeight: 32 }}>
      <Pressable
        accessibilityLabel={close ? "Close" : "Back"}
        hitSlop={12}
        onPress={onBack ?? (() => (router.canGoBack() ? router.back() : router.replace("/home")))}
      >
        <Icon size={20} color={colors.foreground} />
      </Pressable>
      {label ? <Text variant="code">{label.toUpperCase()}</Text> : null}
    </Row>
  );
}
