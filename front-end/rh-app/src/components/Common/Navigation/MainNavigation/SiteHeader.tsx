"use client";

import { UserNav } from "./UserNav";

import { ThemeModeToggle } from "@/components/Common/Providers/ThemeModeToggle";
import useAuthStore, { Role } from "@/helpers/authStore";
import { useEffect, useState } from "react";
import Cookies from "js-cookie";
import { switchRole } from "@/services/Role/roleServices";
import { useRouter } from "next/navigation";
import { RoleSwitcher } from "../../Providers/team-switcher";
import { SidebarTrigger } from "@/components/ui/sidebar";



const formatFranchiseName = (name: string): string => {
  return name.trim().toLowerCase().replace(/\s+/g, "-");
};

export function SiteHeader() {
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




  // const { toggleSidebar } = useSidebar();

  // const roles = useUserStore((state) => state.userData.assignedRoles);

  // const dynamicTeams = roles.map((role: string) => {
  //   return {
  //     name: "RhinonTech",
  //     logo: GalleryVerticalEnd,
  //     role: role,
  //   };
  // });

  // const data = {
  //   teams: [
  //     {
  //       name: "Rhinon Tech",
  //       logo: GalleryVerticalEnd,
  //       href: "Superadmin",
  //       role: "Super Admin",
  //     },
  //     {
  //       name: "Rhinon Tech",
  //       logo: AudioWaveform,
  //       href: "Admin",
  //       role: "Admin",
  //     },
  //     {
  //       name: "Rhinon Tech",
  //       logo: Command,
  //       href: "Support",
  //       role: "Customer Support",
  //     },
  //     {
  //       name: "Rhinon Tech",
  //       logo: CircleDollarSign,
  //       href: "Sales",
  //       role: "Sales Manager",
  //     },
  //   ],
  // };

  return (
    <header className="bg-sidebar sticky top-0 flex w-full items-center">
      <div className="flex h-(--header-height) w-full justify-between items-center gap-2 px-2">

        {user && currentRole && (
          <div className="flex gap-3 items-center">
            <SidebarTrigger className="md:hidden" />
            <RoleSwitcher
              franchiseName={franchiseName}
              currentRole={currentRole}
              availableRoles={allRoles}
              onRoleChange={handleRoleChange}
            />
          </div>

        )}

        <div>

        </div>
        <div className="flex items-center gap-2">
          <ThemeModeToggle />
          {user && <UserNav />}
        </div>
      </div>
    </header>
  );
}
