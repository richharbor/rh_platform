import { useState } from "react";
import { StyleSheet, TextInput, View, type TextInputProps } from "react-native";
import { fonts, radius, useTheme, useThemedStyles, type Theme } from "@/design";
import { Text } from "./primitives";

/** Mono label, hairline field that darkens to ink on focus. Every field says why it's asked (UX rule 4). */
export function FormField({ label, why, error, onFocus, onBlur, ...input }: TextInputProps & { label: string; why?: string; error?: string }) {
  const s = useThemedStyles(makeStyles);
  const { colors } = useTheme();
  const [focused, setFocused] = useState(false);
  return (
    <View style={{ gap: 8 }}>
      <Text variant="label">{label}</Text>
      <TextInput
        placeholderTextColor={colors.mute}
        style={[s.input, focused && { borderColor: colors.foreground }, error ? { borderColor: colors.red } : null]}
        accessibilityLabel={label}
        onFocus={(e) => {
          setFocused(true);
          onFocus?.(e);
        }}
        onBlur={(e) => {
          setFocused(false);
          onBlur?.(e);
        }}
        {...input}
      />
      {error ? <Text variant="xs" style={{ color: colors.red }}>{error}</Text> : why ? <Text variant="xs">{why}</Text> : null}
    </View>
  );
}

const makeStyles = (th: Theme) =>
  StyleSheet.create({
    input: {
      minHeight: 50,
      borderWidth: 1,
      borderColor: th.colors.line,
      borderRadius: radius.xl,
      paddingHorizontal: 16,
      fontFamily: fonts.medium,
      fontSize: 15,
      color: th.colors.foreground,
      backgroundColor: "transparent",
    },
  });
