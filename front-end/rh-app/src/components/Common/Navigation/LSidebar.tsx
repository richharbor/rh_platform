"use client";
import * as React from "react";
import {
  BanknoteArrowDown,
  BanknoteArrowUp,
  Sparkles,
  SquareTerminal,
  UserCog,
  Building2,
  NotebookText,
  Gavel,
  Handshake,
} from "lucide-react";
import { NavMain } from "@/components/Common/Providers/nav-main";
import { NavUser } from "@/components/Common/Providers/nav-user";
import { RoleSwitcher } from "@/components/Common/Providers/team-switcher";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
} from "@/components/ui/sidebar";
import { switchRole } from "@/services/Role/roleServices";
import Cookies from "js-cookie";
import { ComponentProps, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import useAuthStore, { Role } from "@/helpers/authStore";


// Helper to normalize franchise name for URLs and cookies
const formatFranchiseName = (name: string): string => {
  return name.trim().toLowerCase().replace(/\s+/g, "-");
};

export function LSidebar(props: ComponentProps<typeof Sidebar>) {
  const router = useRouter();
  const { user, allRoles, currentRole } = useAuthStore();
  const [loading, setLoading] = useState(true);
  const [franchiseName, setFranchiseName] = useState("Broker");

  useEffect(() => {
    const cookieValue = Cookies.get("franchiseName");
    if (cookieValue) {
      setFranchiseName(cookieValue);
    }
  }, []);

  useEffect(() => {
    if (user && allRoles.length > 0) setLoading(false);
  }, [user, allRoles]);

  // ✅ Determine URL segment based on tier
  const getRoleUrlSegment = (role: Role) => {
    if (!user) return "";

    const formattedFranchise = user.franchiseName
      ? formatFranchiseName(user.franchiseName)
      : "";

    if (user.tier === 3) {
      return `b/${formattedFranchise}/superadmin`;
    }

    if (user.tier === 4 && user.franchiseName) {
      return `b/${formattedFranchise}/${role.name.toLowerCase()}`;
    }

    return `a/${role.name.toLowerCase()}`;
  };

  // ✅ Role switching with updated franchise cookie format
  const handleRoleChange = async (role: Role) => {
    if (!user) return;
    try {
      const response = await switchRole({ roleId: role.id });
      Cookies.set("authToken", response.token);

      const urlSegment = getRoleUrlSegment(role);
      const formattedFranchise = user.franchiseName
        ? formatFranchiseName(user.franchiseName)
        : "";

      Cookies.set("currentRole", role.name.toLowerCase());
      if (formattedFranchise) Cookies.set("franchiseName", formattedFranchise);

      useAuthStore.getState().setCurrentRole(role.id);

      router.push(`/${urlSegment}/dashboard`);
    } catch (error) {
      console.error("Failed to switch role", error);
    }
  };

  if (loading)
    return (
      <Sidebar {...props}>
        <SidebarHeader>
          <div className="px-4 py-2 text-sm text-muted-foreground">
            Loading...
          </div>
        </SidebarHeader>
      </Sidebar>
    );

  const roleNameForUrl = getRoleUrlSegment(currentRole!);

  // ✅ Navigation items with correctly formatted URLs
  const allNavItems = [
    {
      title: "Dashboard",
      url: `/${roleNameForUrl}/dashboard`,
      icon: SquareTerminal,
      permission: "dashboard",
    },
    {
      title: "Buy",
      url: `/${roleNameForUrl}/buy`,
      icon: BanknoteArrowUp,
      permission: "buying",
    },
    {
      title: "Sell",
      url: `/${roleNameForUrl}/sell`,
      icon: BanknoteArrowDown,
      permission: "selling",
    },
    {
      title: "Best Deals",
      url: `/${roleNameForUrl}/best-deals`,
      icon: Sparkles,
      permission: "best_deals",
    },
    {
      title: "Teams",
      url: `/${roleNameForUrl}/teams`,
      icon: UserCog,
      permission: "manage_team",
    },
    {
      title: "Franchises",
      url: `/${roleNameForUrl}/franchises`,
      icon: Building2,
      permission: "manage_franchise",
    },
    {
      title: "Partners",
      url: `/${roleNameForUrl}/partners`,
      icon: Handshake,
      permission: "manage_partners",
    },
    {
      title: "Bookings",
      url: `/${roleNameForUrl}/bookings`,
      icon: NotebookText,
      permission: "manage_bookings",
    },
    {
      title: "Bids",
      url: `/${roleNameForUrl}/bids`,
      icon: Gavel,
      permission: "manage_bids",
    },
    {
      title: "My Bookings",
      url: `/${roleNameForUrl}/my-bookings`,
      icon: NotebookText,
      permission: "manage_my_bookings",
    },
    {
      title: "My Bids",
      url: `/${roleNameForUrl}/my-bids`,
      icon: Gavel,
      permission: "manage_my_bids",
    },
  ];

  // ✅ Role-based nav filtering
  let navMain: typeof allNavItems = [];

  const tier3AllowedPermissions = [
    "dashboard",
    "buying",
    "selling",
    "best_deals",
    "manage_partners",
    "manage_bookings",
    "manage_bids",
    "manage_my_bookings",
    "manage_my_bids",
  ];

  if (user?.tier === 3) {
    navMain = allNavItems.filter((item) =>
      tier3AllowedPermissions.includes(item.permission)
    );
  } else if (currentRole?.name.toLowerCase() === "superadmin") {
    navMain = allNavItems;
  } else if (currentRole) {
    navMain = allNavItems.filter((item) =>
      currentRole.permissions?.includes(item.permission)
    );
  }

  return (
    <Sidebar collapsible="icon" {...props} className="md:hidden">
      <SidebarHeader>
        {user && currentRole && (
          <RoleSwitcher
            franchiseName={franchiseName}
            currentRole={currentRole}
            availableRoles={allRoles}
            onRoleChange={handleRoleChange}
          />
        )}
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={navMain} />
      </SidebarContent>
      {/* <SidebarFooter>{user && <NavUser user={user} />}</SidebarFooter> */}
    </Sidebar>
  );
}
