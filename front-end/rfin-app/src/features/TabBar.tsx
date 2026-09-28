import type { BottomTabBarProps } from "expo-router/js-tabs";
import type { LucideIcon } from "lucide-react-native";
import { BottomNav } from "@/ui";

/** expo-router Tabs → the reference's mobile nav. */
export function makeTabBar(items: { name: string; label: string; icon: LucideIcon }[]) {
  return function TabBar({ state, navigation }: BottomTabBarProps) {
    const active = state.routes[state.index]?.name;
    return (
      <BottomNav
        items={items.map((i) => ({ key: i.name, label: i.label, icon: i.icon }))}
        active={active ?? ""}
        onChange={(key) => {
          const route = state.routes.find((r) => r.name === key);
          if (!route || route.name === active) return;
          navigation.navigate(route.name);
        }}
      />
    );
  };
}
