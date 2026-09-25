import { useRouter } from "expo-router";
import { ArrowLeft } from "lucide-react-native";
import { Pressable } from "react-native";
import { useTheme } from "@/design";
import { Row, Stepper, Text } from "@/ui";

/** Back arrow + mono step counter, shared by the sign-in and onboarding screens. */
export function AuthHeader({ step, total, label, back = true }: { step?: number; total?: number; label?: string; back?: boolean }) {
  const router = useRouter();
  const { colors } = useTheme();
  return (
    <Row style={{ justifyContent: "space-between", minHeight: 32 }}>
      {back && router.canGoBack() ? (
        <Pressable accessibilityLabel="Back" hitSlop={12} onPress={() => router.back()}>
          <ArrowLeft size={20} color={colors.foreground} />
        </Pressable>
      ) : (
        <Text variant="code">RFIN</Text>
      )}
      {step !== undefined && total ? <Text variant="code">{String(step).padStart(2, "0")} / {String(total).padStart(2, "0")}{label ? ` · ${label.toUpperCase()}` : ""}</Text> : null}
    </Row>
  );
}

export { Stepper };
