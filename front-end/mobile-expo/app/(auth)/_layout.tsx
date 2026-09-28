import { Stack } from "expo-router";
import { useTheme } from "@/theme";

/** Auth lives outside the tabbed shell — no bottom nav, no role switcher. */
export default function AuthLayout() {
  const { colors } = useTheme();
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: colors.background },
        animation: "slide_from_right",
      }}
    />
  );
}
