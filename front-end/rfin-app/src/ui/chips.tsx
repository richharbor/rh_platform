import { Pressable, ScrollView } from "react-native";
import { fonts, radius, useTheme } from "@/design";
import { Text } from "./primitives";

/** Horizontal filter pills — ink when selected, hairline otherwise. */
export function Chips<T extends string>({ items, value, onChange }: { items: { id: T; label: string; count?: number }[]; value: T; onChange: (v: T) => void }) {
  const { colors } = useTheme();
  return (
    <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginHorizontal: -20 }} contentContainerStyle={{ gap: 8, paddingHorizontal: 20 }}>
      {items.map((c) => {
        const on = c.id === value;
        return (
          <Pressable
            key={c.id}
            accessibilityRole="tab"
            accessibilityState={{ selected: on }}
            onPress={() => onChange(c.id)}
            style={{ paddingHorizontal: 16, paddingVertical: 10, borderRadius: radius.full, borderWidth: 1, borderColor: on ? colors.inverse : colors.line, backgroundColor: on ? colors.inverse : "transparent" }}
          >
            <Text style={{ fontFamily: fonts.semibold, fontSize: 13, color: on ? colors.onInverse : colors.foreground }}>
              {c.label}
              {c.count ? ` · ${c.count}` : ""}
            </Text>
          </Pressable>
        );
      })}
    </ScrollView>
  );
}
