import type { ReactNode } from "react";
import { ScrollView, View, type StyleProp, type ViewStyle } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { NAV_HEIGHT, useTheme } from "@/theme";

/**
 * Standard page container. The web shell used `pb-28` to clear the fixed bottom
 * nav; here the gutter is the nav height plus the device's bottom inset.
 */
export function Screen({
  children,
  scroll = true,
  style,
  contentStyle,
  extraBottom = 0,
}: {
  children: ReactNode;
  scroll?: boolean;
  style?: StyleProp<ViewStyle>;
  contentStyle?: StyleProp<ViewStyle>;
  extraBottom?: number;
}) {
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const paddingBottom = NAV_HEIGHT + Math.max(insets.bottom, 16) + 16 + extraBottom;

  if (!scroll) {
    return (
      <View
        style={[
          { flex: 1, backgroundColor: colors.background, paddingTop: insets.top, paddingBottom },
          style,
        ]}
      >
        {children}
      </View>
    );
  }

  return (
    <ScrollView
      style={[{ flex: 1, backgroundColor: colors.background }, style]}
      contentContainerStyle={[{ paddingTop: insets.top, paddingBottom }, contentStyle]}
      showsVerticalScrollIndicator={false}
      keyboardShouldPersistTaps="handled"
    >
      {children}
    </ScrollView>
  );
}

/** Horizontal carousel row (`no-scrollbar flex gap-3 overflow-x-auto px-5`) */
export function HScroll({ children, gap = 12 }: { children: ReactNode; gap?: number }) {
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={{ paddingHorizontal: 20, gap, paddingBottom: 4 }}
    >
      {children}
    </ScrollView>
  );
}
