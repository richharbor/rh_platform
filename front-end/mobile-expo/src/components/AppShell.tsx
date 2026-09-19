import { usePathname, useRouter, type Href } from "expo-router";
import * as Haptics from "expo-haptics";
import { BlurView } from "expo-blur";
import { useEffect, useRef, useState } from "react";
import {
  Animated,
  Easing,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  View,
  type LayoutChangeEvent,
  type StyleProp,
  type ViewStyle,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { ROLE_LABEL, type Role } from "@/lib/rfin-data";
import { useRole } from "@/lib/role-context";
import {
  EarnIcon,
  ExploreIcon,
  HomeIcon,
  ProfileIcon,
  RewardsIcon,
  type NavIconProps,
} from "./icons";
import { fonts, MAX_WIDTH, radius, useTheme, useThemedStyles, type Theme } from "@/theme";

const tabs = [
  { to: "/", label: "Home", Icon: HomeIcon },
  { to: "/explore", label: "Explore", Icon: ExploreIcon },
  { to: "/earn", label: "Earn", Icon: EarnIcon },
  { to: "/rewards", label: "Rewards", Icon: RewardsIcon },
  { to: "/profile", label: "Profile", Icon: ProfileIcon },
] as const;

const BAR_PADDING = 6;

/**
 * Floating glass bottom nav.
 *
 * Rendered once in the root layout rather than per screen, so it stays put on pushed
 * routes exactly as the web app's `fixed` nav did. Three things carry the weight:
 * a frosted backdrop, a single indicator that springs between tabs instead of five
 * independent highlights, and icons that switch from outline to solid on selection.
 */
export function BottomNav() {
  const { colors, isDark, shadowElevated } = useTheme();
  const styles = useThemedStyles(makeStyles);
  const pathname = usePathname();
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const activeIndex = Math.max(
    0,
    tabs.findIndex((t) => (t.to === "/" ? pathname === "/" : pathname.startsWith(t.to))),
  );

  const [barWidth, setBarWidth] = useState(0);
  const tabWidth = barWidth > 0 ? (barWidth - BAR_PADDING * 2) / tabs.length : 0;

  const slide = useRef(new Animated.Value(activeIndex)).current;
  const first = useRef(true);

  useEffect(() => {
    if (first.current) {
      slide.setValue(activeIndex);
      first.current = false;
      return;
    }
    Animated.spring(slide, {
      toValue: activeIndex,
      useNativeDriver: true,
      damping: 18,
      stiffness: 220,
      mass: 0.7,
    }).start();
  }, [activeIndex, slide]);

  const onLayout = (e: LayoutChangeEvent) => setBarWidth(e.nativeEvent.layout.width);

  const press = (to: Href, isActive: boolean) => {
    if (!isActive && Platform.OS !== "web") {
      void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    router.push(to);
  };

  return (
    <View
      style={[styles.wrap, { paddingBottom: Math.max(insets.bottom, 14) }]}
      pointerEvents="box-none"
    >
      <View style={[styles.bar, shadowElevated]} onLayout={onLayout}>
        <BlurView
          intensity={isDark ? 40 : 28}
          tint={isDark ? "dark" : "light"}
          experimentalBlurMethod={Platform.OS === "android" ? "dimezisBlurView" : undefined}
          style={StyleSheet.absoluteFill}
        />
        {/* the blur alone is too transparent over busy cards, so a scrim sits on top */}
        <View style={styles.scrim} pointerEvents="none" />

        {tabWidth > 0 && (
          <Animated.View
            pointerEvents="none"
            style={[
              styles.indicator,
              {
                width: tabWidth,
                transform: [
                  {
                    translateX: slide.interpolate({
                      inputRange: tabs.map((_, i) => i),
                      outputRange: tabs.map((_, i) => BAR_PADDING + i * tabWidth),
                    }),
                  },
                ],
              },
            ]}
          />
        )}

        <View style={styles.row}>
          {tabs.map(({ to, label, Icon }, i) => (
            <Tab
              key={to}
              label={label}
              Icon={Icon}
              active={i === activeIndex}
              activeColor={colors.navyForeground}
              idleColor={colors.mutedForeground}
              onPress={() => press(to, i === activeIndex)}
            />
          ))}
        </View>
      </View>
    </View>
  );
}

function Tab({
  label,
  Icon,
  active,
  activeColor,
  idleColor,
  onPress,
}: {
  label: string;
  Icon: (p: NavIconProps) => React.ReactElement;
  active: boolean;
  activeColor: string;
  idleColor: string;
  onPress: () => void;
}) {
  const styles = useThemedStyles(makeStyles);
  const lift = useRef(new Animated.Value(active ? 1 : 0)).current;

  useEffect(() => {
    Animated.timing(lift, {
      toValue: active ? 1 : 0,
      duration: 220,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: true,
    }).start();
  }, [active, lift]);

  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="tab"
      accessibilityState={{ selected: active }}
      accessibilityLabel={label}
      style={styles.tab}
    >
      <Animated.View
        style={{
          transform: [
            { translateY: lift.interpolate({ inputRange: [0, 1], outputRange: [0, -1.5] }) },
            { scale: lift.interpolate({ inputRange: [0, 1], outputRange: [1, 1.06] }) },
          ],
        }}
      >
        <Icon size={23} color={active ? activeColor : idleColor} active={active} />
      </Animated.View>
      <Text
        numberOfLines={1}
        style={[
          styles.tabLabel,
          { color: active ? activeColor : idleColor },
          active && styles.tabLabelActive,
        ]}
      >
        {label}
      </Text>
    </Pressable>
  );
}

export function RoleSwitcher({ style }: { style?: StyleProp<ViewStyle> }) {
  const { colors } = useTheme();
  const styles = useThemedStyles(makeStyles);
  const { role, setRole } = useRole();
  const roles: Role[] = ["buyer", "seller", "referral"];
  return (
    <View
      accessibilityRole="tablist"
      accessibilityLabel="Current role"
      style={[styles.switcher, style]}
    >
      {roles.map((r) => {
        const active = role === r;
        return (
          <Pressable
            key={r}
            accessibilityRole="tab"
            accessibilityState={{ selected: active }}
            onPress={() => setRole(r)}
            style={[styles.switcherTab, active && styles.switcherTabActive]}
          >
            <Text
              style={[
                styles.switcherLabel,
                { color: active ? colors.navyForeground : colors.mutedForeground },
              ]}
              numberOfLines={1}
            >
              {ROLE_LABEL[r]}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const makeStyles = ({ colors, shadowCard }: Theme) =>
  StyleSheet.create({
    wrap: {
      position: Platform.OS === "web" ? ("fixed" as "absolute") : "absolute",
      bottom: 0,
      left: 0,
      right: 0,
      zIndex: 40,
      alignItems: "center",
      paddingHorizontal: 16,
    },
    bar: {
      width: "100%",
      maxWidth: MAX_WIDTH - 32,
      borderRadius: radius.full,
      borderWidth: 1,
      borderColor: colors.border,
      overflow: "hidden",
      padding: BAR_PADDING,
    },
    scrim: { ...StyleSheet.absoluteFill, backgroundColor: colors.navBarScrim },
    row: { flexDirection: "row", alignItems: "center" },
    indicator: {
      position: "absolute",
      top: BAR_PADDING,
      bottom: BAR_PADDING,
      borderRadius: radius.full,
      backgroundColor: colors.navy,
    },
    tab: {
      flex: 1,
      alignItems: "center",
      justifyContent: "center",
      gap: 3,
      paddingVertical: 9,
    },
    tabLabel: { fontSize: 10, lineHeight: 13, fontFamily: fonts.semibold },
    tabLabelActive: { fontFamily: fonts.bold },
    switcher: {
      flexDirection: "row",
      borderRadius: radius.full,
      backgroundColor: colors.muted,
      padding: 4,
    },
    switcherTab: {
      flex: 1,
      borderRadius: radius.full,
      paddingVertical: 8,
      alignItems: "center",
      justifyContent: "center",
    },
    switcherTabActive: { backgroundColor: colors.navy, ...shadowCard },
    switcherLabel: { fontSize: 12, lineHeight: 16, fontFamily: fonts.semibold },
  });
