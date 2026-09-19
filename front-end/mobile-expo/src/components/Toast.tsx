import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { Animated, Platform, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { fonts, MAX_WIDTH, radius, useThemedStyles, type Theme } from "@/theme";

type ToastOpts = { description?: string };
type ToastFn = (title: string, opts?: ToastOpts) => void;

const ToastContext = createContext<ToastFn>(() => {});

/** Replacement for the web app's `sonner` toaster (position="top-center"). */
export function ToastProvider({ children }: { children: ReactNode }) {
  const styles = useThemedStyles(makeStyles);
  const [current, setCurrent] = useState<{
    title: string;
    description?: string;
    key: number;
  } | null>(null);
  const anim = useRef(new Animated.Value(0)).current;
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const insets = useSafeAreaInsets();

  const toast = useCallback<ToastFn>((title, opts) => {
    setCurrent({ title, description: opts?.description, key: Date.now() });
  }, []);

  useEffect(() => {
    if (!current) return;
    anim.setValue(0);
    Animated.spring(anim, {
      toValue: 1,
      useNativeDriver: true,
      damping: 18,
      stiffness: 180,
    }).start();
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(() => {
      Animated.timing(anim, { toValue: 0, duration: 200, useNativeDriver: true }).start(() =>
        setCurrent(null),
      );
    }, 3200);
    return () => {
      if (timer.current) clearTimeout(timer.current);
    };
  }, [current, anim]);

  return (
    <ToastContext.Provider value={toast}>
      {children}
      {current && (
        <View pointerEvents="none" style={[styles.wrap, { top: insets.top + 8 }]}>
          <Animated.View
            style={[
              styles.toast,
              {
                opacity: anim,
                transform: [
                  { translateY: anim.interpolate({ inputRange: [0, 1], outputRange: [-24, 0] }) },
                ],
              },
            ]}
          >
            <Text style={styles.title}>{current.title}</Text>
            {current.description && <Text style={styles.desc}>{current.description}</Text>}
          </Animated.View>
        </View>
      )}
    </ToastContext.Provider>
  );
}

export const useToast = () => useContext(ToastContext);

const makeStyles = ({ colors, shadowElevated }: Theme) =>
  StyleSheet.create({
    wrap: {
      position: "absolute",
      left: 0,
      right: 0,
      alignItems: "center",
      zIndex: 100,
      ...(Platform.OS === "web" ? { position: "fixed" as "absolute" } : null),
    },
    toast: {
      maxWidth: MAX_WIDTH - 32,
      minWidth: 220,
      backgroundColor: colors.navy,
      borderRadius: radius.lg,
      paddingHorizontal: 16,
      paddingVertical: 12,
      ...shadowElevated,
    },
    title: {
      fontFamily: fonts.semibold,
      fontSize: 14,
      lineHeight: 20,
      color: colors.navyForeground,
    },
    desc: {
      fontFamily: fonts.regular,
      fontSize: 12,
      lineHeight: 16,
      color: colors.navyMuted,
      marginTop: 2,
    },
  });
