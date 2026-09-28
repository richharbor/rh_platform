import type { ReactNode } from "react";
import { ScrollView, StyleSheet, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { MAX_WIDTH, useThemedStyles, type Theme } from "@/design";
import { Text } from "./primitives";
import { Rise } from "./motion";

/**
 * Page frame: optional header row (back / close), paper background, 20px gutter (`p-5`), and the reference header —
 * red mono dateline, Anton headline at `max-w-[10ch]`, muted lede.
 */
export function Screen({ header, eyebrow, title, subtitle, children, footer }: { header?: ReactNode; eyebrow?: string; title?: string; subtitle?: string; children: ReactNode; footer?: ReactNode }) {
  const s = useThemedStyles(makeStyles);
  return (
    <SafeAreaView style={s.root} edges={["top"]}>
      <ScrollView contentContainerStyle={s.content} keyboardShouldPersistTaps="handled">
        {header}
        {title ? (
          <Rise delay={1}>
            {eyebrow ? <Text variant="eyebrow">{eyebrow}</Text> : null}
            <Text variant="hero" style={{ marginTop: eyebrow ? 8 : 0, maxWidth: 340 }}>{title}</Text>
            {subtitle ? <Text variant="muted" style={{ marginTop: 16, maxWidth: 560 }}>{subtitle}</Text> : null}
          </Rise>
        ) : null}
        {children}
      </ScrollView>
      {footer}
    </SafeAreaView>
  );
}

const makeStyles = (th: Theme) =>
  StyleSheet.create({
    root: { flex: 1, backgroundColor: th.colors.background },
    content: { padding: 20, gap: 28, paddingBottom: 48, width: "100%", maxWidth: MAX_WIDTH, alignSelf: "center" },
  });
