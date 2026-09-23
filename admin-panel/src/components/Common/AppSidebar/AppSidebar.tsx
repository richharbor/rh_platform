"use client";

import * as React from "react";
import { Command, NotebookPen, LucideBadgeDollarSign, Megaphone } from "lucide-react";

import { NavMain } from "@/components/Common/NavMain/NavMain";
import { NavUser } from "@/components/Common/NavUser/NavUser";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { useAuth } from "@/helpers/AuthContext";

// Single unified sidebar — exactly 3 main items. Role-based visibility comes
// from RBAC permissions returned by the backend (see AuthContext.hasPermission),
// not from separate route trees per role.
export function AppSidebar({
  ...props
}: React.ComponentProps<typeof Sidebar>) {
  const { user, hasPermission } = useAuth();

  const navMain = [
    hasPermission("blogs", "view") && {
      title: "All Blogs",
      url: "/dashboard/blogs",
      icon: NotebookPen,
    },
    hasPermission("leads", "view") && {
      title: "Leads",
      url: "/dashboard/leads",
      icon: LucideBadgeDollarSign,
    },
    hasPermission("marketing", "view") && {
      title: "Marketing",
      url: "#",
      icon: Megaphone,
      items: [
        { title: "Campaigns", url: "/dashboard/marketing/campaigns" },
        { title: "Contacts", url: "/dashboard/marketing/contacts" },
        { title: "Unsubscribed", url: "/dashboard/marketing/unsubscribed-users" },
      ],
    },
  ].filter(Boolean) as {
    title: string;
    url: string;
    icon: typeof Command;
    items?: { title: string; url: string }[];
  }[];

  return (
    <Sidebar variant="inset" {...props} collapsible="icon">
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" asChild>
              <a href="#">
                <div className="bg-sidebar-primary text-sidebar-primary-foreground flex aspect-square size-8 items-center justify-center rounded-lg">
                  <Command className="size-4" />
                </div>
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate font-bold">Admin Panel</span>
                </div>
              </a>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent className="flex-1 overflow-y-auto sidebar-scroll">
        <NavMain items={navMain} />
      </SidebarContent>
      <SidebarFooter>
        <NavUser
          user={{
            name: user?.name,
            email: user?.email,
            avatar: "",
          }}
        />
      </SidebarFooter>
    </Sidebar>
  );
}
