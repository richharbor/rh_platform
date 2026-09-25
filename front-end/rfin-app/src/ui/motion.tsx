import { useEffect, useRef, type ReactNode } from "react";
import { Animated, Easing, type StyleProp, type ViewStyle } from "react-native";
import { motion } from "@/design";

const ease = Easing.bezier(...motion.easing);

/**
 * `rfin-rise` — fade in while lifting 12px, 420ms. `delay` is the step
 * (rfin-delay-1/2/3 = 60/120/180ms).
 */
export function Rise({ children, delay = 0, style }: { children: ReactNode; delay?: number; style?: StyleProp<ViewStyle> }) {
  const v = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    Animated.timing(v, {
      toValue: 1,
      duration: motion.riseDuration,
      delay: delay * motion.riseStagger,
      easing: ease,
      useNativeDriver: true,
    }).start();
  }, [v, delay]);
  return (
    <Animated.View
      style={[
        style,
        {
          opacity: v,
          transform: [{ translateY: v.interpolate({ inputRange: [0, 1], outputRange: [motion.riseDistance, 0] }) }],
        },
      ]}
    >
      {children}
    </Animated.View>
  );
}
