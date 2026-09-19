import {
  Inter_400Regular,
  Inter_500Medium,
  Inter_600SemiBold,
  Inter_700Bold,
  useFonts,
} from "@expo-google-fonts/inter";
import {
  Manrope_600SemiBold,
  Manrope_700Bold,
  Manrope_800ExtraBold,
} from "@expo-google-fonts/manrope";
import { Stack, useRouter, useSegments } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useEffect } from "react";
import { ActivityIndicator, Platform, StyleSheet, View } from "react-native";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { BottomNav } from "@/components/AppShell";
import { ToastProvider } from "@/components/Toast";
import { AuthProvider, useAuth } from "@/lib/auth-context";
import { RoleProvider } from "@/lib/role-context";
import { MAX_WIDTH, ThemeProvider, useTheme, useThemedStyles, type Theme } from "@/theme";

function RootLayoutInner() {
  const { colors, isDark } = useTheme();
  const { status } = useAuth();
  const segments = useSegments();
  useAuthRedirect();
  const styles = useThemedStyles(makeStyles);
  const [loaded] = useFonts({
    Inter_400Regular,
    Inter_500Medium,
    Inter_600SemiBold,
    Inter_700Bold,
    Manrope_600SemiBold,
    Manrope_700Bold,
    Manrope_800ExtraBold,
  });

  const inAuth = segments[0] === "(auth)";

  if (!loaded || status === "loading") {
    return (
      <View style={styles.splash}>
        <ActivityIndicator color={colors.brandText} />
      </View>
    );
  }

  return (
    <SafeAreaProvider>
      <RoleProvider>
        <ToastProvider>
          <StatusBar style={isDark ? "light" : "dark"} />
          {/* Mirrors the web AppShell: a centred max-w-md frame on a muted backdrop. */}
          <View style={styles.backdrop}>
            <View style={styles.frame}>
              <Stack
                screenOptions={{
                  headerShown: false,
                  contentStyle: { backgroundColor: colors.background },
                  animation: Platform.OS === "ios" ? "default" : "fade_from_bottom",
                }}
              />
              {/* auth screens run outside the tabbed shell */}
              {!inAuth && <BottomNav />}
            </View>
          </View>
        </ToastProvider>
      </RoleProvider>
    </SafeAreaProvider>
  );
}

/**
 * Keeps the URL and the auth state in step: an unauthenticated user is pushed into
 * the (auth) group, and a fully onboarded one is pushed out of it.
 */
function useAuthRedirect() {
  const { status } = useAuth();
  const segments = useSegments();
  const router = useRouter();

  useEffect(() => {
    if (status === "loading") return;
    const inAuth = segments[0] === "(auth)";
    if (status === "signedOut" && !inAuth) router.replace("/(auth)/welcome");
    else if (status === "onboarding" && !inAuth) router.replace("/(auth)/role");
    else if (status === "ready" && inAuth) router.replace("/");
  }, [status, segments, router]);
}

/** ThemeProvider must sit above anything that reads the theme. */
export default function RootLayout() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <RootLayoutInner />
      </AuthProvider>
    </ThemeProvider>
  );
}

const makeStyles = ({ colors }: Theme) =>
  StyleSheet.create({
    splash: {
      flex: 1,
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: colors.background,
    },
    backdrop: { flex: 1, backgroundColor: colors.muted, alignItems: "center" },
    frame: {
      flex: 1,
      width: "100%",
      maxWidth: MAX_WIDTH,
      backgroundColor: colors.background,
    },
  });
