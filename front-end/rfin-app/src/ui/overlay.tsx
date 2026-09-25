import { MessageCircle } from "lucide-react-native";
import { createContext, useCallback, useContext, useRef, useState, type ReactNode } from "react";
import { Animated, Modal, Pressable, StyleSheet, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import type { Tone } from "@/domain/states";
import { radius, useTheme, useThemedStyles, type Theme } from "@/design";
import { Row, Text } from "./primitives";
import { toneColors } from "./tone";

export function BottomSheet({ open, onClose, title, children }: { open: boolean; onClose: () => void; title?: string; children: ReactNode }) {
  const s = useThemedStyles(makeStyles);
  const { figure } = useTheme();
  const insets = useSafeAreaInsets();
  return (
    <Modal visible={open} transparent animationType="slide" onRequestClose={onClose}>
      <Pressable style={s.scrim} onPress={onClose} accessibilityLabel="Close" />
      <View style={[s.sheet, { paddingBottom: Math.max(insets.bottom, 20) }]}>
        <View style={s.grabber} />
        {title ? <Text style={[figure(28), { marginBottom: 12 }]}>{title}</Text> : null}
        {children}
      </View>
    </Modal>
  );
}

type ToastMsg = { text: string; tone: Tone };
const ToastCtx = createContext<(text: string, tone?: Tone) => void>(() => {});
export const useToast = () => useContext(ToastCtx);

/** Ink toast with a coloured status dot. */
export function ToastProvider({ children }: { children: ReactNode }) {
  const th = useTheme();
  const insets = useSafeAreaInsets();
  const [msg, setMsg] = useState<ToastMsg | null>(null);
  const v = useRef(new Animated.Value(0)).current;
  const timer = useRef<ReturnType<typeof setTimeout>>(undefined);

  const show = useCallback(
    (text: string, tone: Tone = "neutral") => {
      clearTimeout(timer.current);
      setMsg({ text, tone });
      Animated.timing(v, { toValue: 1, duration: 220, useNativeDriver: true }).start();
      timer.current = setTimeout(() => {
        Animated.timing(v, { toValue: 0, duration: 220, useNativeDriver: true }).start(() => setMsg(null));
      }, 2600);
    },
    [v],
  );

  return (
    <ToastCtx.Provider value={show}>
      {children}
      {msg ? (
        <Animated.View
          pointerEvents="none"
          accessibilityLiveRegion="polite"
          style={{
            position: "absolute",
            left: 20,
            right: 20,
            top: insets.top + 8,
            opacity: v,
            transform: [{ translateY: v.interpolate({ inputRange: [0, 1], outputRange: [-12, 0] }) }],
            backgroundColor: th.colors.inverse,
            borderRadius: radius["2xl"],
            padding: 16,
            ...th.shadowElevated,
          }}
        >
          <Row gap={12}>
            <View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: msg.tone === "neutral" ? th.colors.amber : toneColors(th, msg.tone).solid }} />
            <Text variant="title" style={{ color: th.colors.onInverse, flex: 1 }}>{msg.text}</Text>
          </Row>
        </Animated.View>
      ) : null}
    </ToastCtx.Provider>
  );
}

/** Human support on every high-stakes screen, carrying the context along (report #9, #47). */
export function SupportFab({ context, onPress }: { context: string; onPress: (context: string) => void }) {
  const s = useThemedStyles(makeStyles);
  const { colors } = useTheme();
  return (
    <Pressable accessibilityLabel="Talk to a human" onPress={() => onPress(context)} style={({ pressed }) => [s.fab, pressed && { backgroundColor: colors.red }]}>
      <MessageCircle size={20} color={colors.onInverse} />
    </Pressable>
  );
}

const makeStyles = (th: Theme) =>
  StyleSheet.create({
    scrim: { flex: 1, backgroundColor: th.colors.scrim },
    sheet: {
      backgroundColor: th.colors.background,
      borderTopLeftRadius: radius["3xl"],
      borderTopRightRadius: radius["3xl"],
      padding: 24,
    },
    grabber: { alignSelf: "center", width: 40, height: 4, borderRadius: 2, backgroundColor: th.colors.line, marginBottom: 20 },
    fab: {
      position: "absolute",
      right: 20,
      bottom: 88,
      width: 52,
      height: 52,
      borderRadius: 26,
      backgroundColor: th.colors.inverse,
      alignItems: "center",
      justifyContent: "center",
      ...th.shadowElevated,
    },
  });
