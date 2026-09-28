import { Tabs } from "expo-router/js-tabs";
import { FileText, LayoutDashboard, Search, Trophy, UserRound } from "lucide-react-native";
import { makeTabBar } from "@/features/TabBar";

const TABS = [
  { name: "home", label: "Home", icon: LayoutDashboard },
  { name: "explore", label: "Explore", icon: Search },
  { name: "activity", label: "Activity", icon: FileText },
  { name: "rewards", label: "Rewards", icon: Trophy },
  { name: "profile", label: "Profile", icon: UserRound },
];

const TabBar = makeTabBar(TABS);

/** Investor mode — Home · Explore · Activity · Rewards · Profile (report "Recommended Navigation"). */
export default function InvestorTabs() {
  return (
    <Tabs tabBar={(p) => <TabBar {...p} />} screenOptions={{ headerShown: false }}>
      {TABS.map((t) => (
        <Tabs.Screen key={t.name} name={t.name} options={{ title: t.label }} />
      ))}
    </Tabs>
  );
}
