"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";
import Cookies from "js-cookie";
import Loading from "./loading";
import { getUserDetails } from "@/services/Auth/authServices";
import useAuthStore from "@/helpers/authStore";

const formatFranchiseName = (name: string): string => {
  return name.trim().toLowerCase().replace(/\s+/g, "-");
};

export default function Home() {
  const router = useRouter();
  const authToken = Cookies.get("authToken");

  const getUserDetailsFn = async () => {
    try {
      const response = await getUserDetails();
      const user = response.user;
      const { setAuth, setOnboardingStatus, setCurrentRole } =
        useAuthStore.getState();

      if (!user) {
        router.push("/auth/login");
        return;
      }

      // if (response.onboarding?.required || !user.emailVerified) {
      //   setOnboardingStatus(response.onboarding);
      //   router.push("/auth/onboarding");
      //   return;
      // }

      const roles = user.roles || [];
      setAuth(user, authToken || "", roles);

      let redirectUrl = "";
      let roleCookie = "";
      let franchiseCookie = "";

      // Format franchise name properly
      const formattedFranchise = user.franchiseName
        ? formatFranchiseName(user.franchiseName)
        : "";

      if (user.tier === 1 || user.tier === 2) {
        redirectUrl = `/a/${user.currentRole?.name.toLowerCase()}/dashboard`;
        roleCookie = user.currentRole?.name.toLowerCase() || "";
      } else if (user.tier === 3) {
        redirectUrl = `/b/${formattedFranchise}/superadmin/dashboard`;
        roleCookie = "superadmin";
        franchiseCookie = formattedFranchise;
      } else if (user.tier === 4) {
        redirectUrl = `/b/${formattedFranchise}/${user.currentRole?.name.toLowerCase()}/dashboard`;
        roleCookie = user.currentRole?.name.toLowerCase() || "";
        franchiseCookie = formattedFranchise;
      }

      Cookies.set("currentRole", roleCookie);
      if (franchiseCookie) Cookies.set("franchiseName", franchiseCookie);
      Cookies.set("tier", String(user.tier || 0));

      setCurrentRole(user.currentRole?.id || 0);
      router.push(redirectUrl);
    } catch (error) {
      console.error("Failed to fetch user details:", error);
      useAuthStore.getState().clearAuth();
      router.push("/auth/login");
    }
  };

  useEffect(() => {
    if (authToken) getUserDetailsFn();
    else {
      Cookies.remove("authToken");
      router.push("/auth/login");
    }
  }, []);

  return <Loading />;
}
