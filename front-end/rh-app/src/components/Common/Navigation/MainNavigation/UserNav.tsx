"use client";

import Link from "next/link";
import { LayoutGrid, LogOut, User } from "lucide-react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
  TooltipProvider,
} from "@/components/ui/tooltip";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import Cookies from "js-cookie";
import { postLogout } from "@/services/Auth/authServices";
import useAuthStore from "@/helpers/authStore";
import { getTieredPath } from "@/helpers/getTieredPath";

export function UserNav() {
  const router = useRouter();

  const role = Cookies.get("currentRole");
  const postLogoutFn = async () => {
    try {
      // await postLogout();
      Cookies.remove("authToken");
      Cookies.remove("currentRole");
      Cookies.remove("franchiseName");
      Cookies.remove("onboardingStatus");
      Cookies.remove("tier");
      router.push("/auth/login");
    } catch (error) {
      console.error(error);
    }
  };

  const logOut = () => {
    postLogoutFn();
  };


  const firstName = useAuthStore((state) => state.user?.firstName);
  const lastName = useAuthStore((state) => state.user?.lastName);
  const email = useAuthStore((state) => state.user?.email);

  // Derive initials for the AvatarFallback
  const userInitials = `${firstName ? firstName.charAt(0) : ""}${lastName ? lastName.charAt(0) : ""
    }`.toUpperCase();

  return (
    <DropdownMenu>
      <TooltipProvider disableHoverableContent>
        <Tooltip delayDuration={100}>
          <TooltipTrigger asChild>
            <DropdownMenuTrigger asChild>
              <Button
                variant="outline"
                className="relative h-8 w-8 rounded-full">
                <Avatar className="h-8 w-8">
                  <AvatarImage src="#" alt="Avatar" />
                  <AvatarFallback className="bg-transparent">
                    {userInitials || "JD"}
                  </AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
          </TooltipTrigger>
          <TooltipContent side="bottom">Profile</TooltipContent>
        </Tooltip>
      </TooltipProvider>

      <DropdownMenuContent className="w-56" align="end" forceMount>
        <DropdownMenuLabel className="font-normal">
          <div className="flex flex-col space-y-1">
            <p className="text-sm font-medium leading-none">
              {firstName} {lastName}
            </p>
            <p className="text-xs leading-none text-muted-foreground">
              {email}
            </p>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuGroup>
          {/* <DropdownMenuItem className="hover:cursor-pointer" asChild>
            <Link href={`/${role}/dashboard`} className="flex items-center">
              <LayoutGrid className="w-4 h-4 mr-3 text-muted-foreground" />
              Dashboard
            </Link>
          </DropdownMenuItem> */}
          <DropdownMenuItem className="hover:cursor-pointer" asChild>
            <div
              className="flex items-center"
              onClick={() => {
                const base = getTieredPath();
                router.push(`/${base}/my-profile`);
              }}
            >
              <User className="w-4 h-4 mr-3 text-muted-foreground" />
              Profile
            </div>
          </DropdownMenuItem>
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          className="hover:cursor-pointer"
          onClick={logOut}>
          <LogOut className="w-4 h-4 mr-3 text-muted-foreground" />
          Sign out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
