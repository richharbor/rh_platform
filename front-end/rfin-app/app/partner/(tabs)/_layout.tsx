import { Tabs } from "expo-router/js-tabs";
import { IndianRupee, LayoutDashboard, UserRound, Users, Workflow } from "lucide-react-native";
import { makeTabBar } from "@/features/TabBar";

const TABS = [
  { name: "home", label: "Home", icon: LayoutDashboard },
  { name: "leads", label: "Leads", icon: Workflow },
  { name: "clients", label: "Clients", icon: Users },
  { name: "earnings", label: "Earnings", icon: IndianRupee },
  { name: "profile", label: "Profile", icon: UserRound },
];

const TabBar = makeTabBar(TABS);

/** Partner mode — same RFIN ID, operational tab set (report #81–#90). */
export default function PartnerTabs() {
  return (
    <Tabs tabBar={(p) => <TabBar {...p} />} screenOptions={{ headerShown: false }}>
      {TABS.map((t) => (
        <Tabs.Screen key={t.name} name={t.name} options={{ title: t.label }} />
      ))}
    </Tabs>
  );
}
