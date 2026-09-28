import { useFonts } from "expo-font";
import { QueryClientProvider } from "@tanstack/react-query";
import { Stack, useRouter, useSegments } from "expo-router";
import { useEffect } from "react";
import { StatusBar } from "expo-status-bar";
import { ActivityIndicator, View } from "react-native";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { api, queryClient } from "@/api/client";
import { fontAssets, ThemeProvider, useTheme } from "@/design";
import { useSession } from "@/stores/session";
import { ToastProvider } from "@/ui";

const SIGNED_OUT_SCREENS = ["welcome", "phone", "otp"];
const ONBOARDING_ROUTE = { profile: "/profile-setup", needs: "/needs" } as const;

/**
 * Route gate: signed-out users stay in (auth), onboarding resumes at the saved
 * step (report #13), and ready users land on their current mode's tabs.
 */
function useAuthGate() {
  const router = useRouter();
  const segments = useSegments() as string[];
  const { hydrated, status, step, mode } = useSession();
  const [top, screen] = segments;

  useEffect(() => {
    if (!hydrated || top === "dev") return;
    const inAuth = top === "(auth)";
    if (status === "signedOut") {
      if (!inAuth || !SIGNED_OUT_SCREENS.includes(screen ?? "")) router.replace("/welcome");
    } else if (status === "onboarding") {
      const target = ONBOARDING_ROUTE[step];
      if (!inAuth || "/" + screen !== target) router.replace(target);
    } else if (inAuth || !top) {
      router.replace(mode === "partner" ? "/partner/home" : "/home");
    }
  }, [hydrated, status, step, mode, top, screen, router]);

  // Pull the server's copy of the profile on launch (roles / onboarding may
  // have changed on another device).
  const token = useSession((s) => s.token);
  useEffect(() => {
    if (!hydrated || !token) return;
    api("me.get", undefined).then(useSession.getState().sync).catch(() => {});
  }, [hydrated, token]);

  return hydrated;
}

function Root() {
  const { colors, isDark } = useTheme();
  const [loaded] = useFonts(fontAssets);
  const hydrated = useAuthGate();

  if (!loaded || !hydrated) {
    return (
      <View style={{ flex: 1, alignItems: "center", justifyContent: "center", backgroundColor: colors.background }}>
        <ActivityIndicator color={colors.foreground} />
      </View>
    );
  }

  return (
    <ToastProvider>
      <StatusBar style={isDark ? "light" : "dark"} />
      <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: colors.background } }} />
    </ToastProvider>
  );
}

export default function RootLayout() {
  return (
    <SafeAreaProvider>
      <QueryClientProvider client={queryClient}>
        <ThemeProvider>
          <Root />
        </ThemeProvider>
      </QueryClientProvider>
    </SafeAreaProvider>
  );
}
