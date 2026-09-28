import { useRouter, type Href } from "expo-router";
import type { ReactNode } from "react";
import { Pressable, type StyleProp, type ViewStyle } from "react-native";

/**
 * Pressable link.
 *
 * Deliberately NOT `<Link asChild>`: expo-router renders `asChild` through a Radix
 * `Slot`, whose `mergeProps` combines `style` with an object spread
 * (`{ ...slotStyle, ...childStyle }`). A Pressable *function* style has no enumerable
 * own properties, so it spreads to `{}` and the child's styling is silently dropped.
 * Navigating via `useRouter()` keeps full control of the style, including press state.
 */
export function Touchable({
  href,
  onPress,
  style,
  pressedStyle,
  disabled,
  children,
  accessibilityLabel,
  hitSlop,
  replace,
}: {
  href?: Href;
  onPress?: () => void;
  style?: StyleProp<ViewStyle>;
  /** Applied while pressed. Defaults to a light dim. */
  pressedStyle?: StyleProp<ViewStyle>;
  disabled?: boolean;
  children: ReactNode;
  accessibilityLabel?: string;
  hitSlop?: number;
  replace?: boolean;
}) {
  const router = useRouter();

  const handlePress = () => {
    if (disabled) return;
    onPress?.();
    if (href !== undefined) {
      if (replace) router.replace(href);
      else router.push(href);
    }
  };

  return (
    <Pressable
      onPress={handlePress}
      disabled={disabled}
      accessibilityRole={href !== undefined ? "link" : "button"}
      accessibilityLabel={accessibilityLabel}
      hitSlop={hitSlop}
      style={({ pressed }) => [
        style,
        pressed && !disabled ? (pressedStyle ?? { opacity: 0.85 }) : null,
        disabled ? { opacity: 0.5 } : null,
      ]}
    >
      {children}
    </Pressable>
  );
}
