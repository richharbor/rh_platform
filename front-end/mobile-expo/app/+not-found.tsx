import { Stack } from "expo-router";
import { StyleSheet, Text, View } from "react-native";
import { Btn } from "@/components/ui";
import { fonts, useTheme, useThemedStyles, type Theme } from "@/theme";

export default function NotFoundScreen() {
  const { t } = useTheme();
  const styles = useThemedStyles(makeStyles);
  return (
    <>
      <Stack.Screen options={{ title: "Not found" }} />
      <View style={styles.wrap}>
        <Text style={styles.code}>404</Text>
        <Text style={styles.title}>Page not found</Text>
        <Text style={[t.muted, { marginTop: 8, textAlign: "center" }]}>
          The page you're looking for doesn't exist or has been moved.
        </Text>
        <Btn
          label="Go home"
          to="/"
          variant="primary"
          style={{ marginTop: 24, paddingHorizontal: 28 }}
        />
      </View>
    </>
  );
}

const makeStyles = ({ colors }: Theme) =>
  StyleSheet.create({
    wrap: { flex: 1, alignItems: "center", justifyContent: "center", paddingHorizontal: 24 },
    code: {
      fontFamily: fonts.display,
      fontSize: 72,
      // 1.2x floor — RN clips glyphs to the line box, unlike CSS `leading-none`
      lineHeight: 87,
      letterSpacing: -1.44,
      color: colors.foreground,
    },
    title: {
      fontFamily: fonts.displaySemi,
      fontSize: 20,
      lineHeight: 28,
      letterSpacing: -0.4,
      color: colors.foreground,
      marginTop: 16,
    },
  });
