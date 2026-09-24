import { AppSidebar } from "@/components/Common/AppSidebar/AppSidebar";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Admin - Dashboard",
  description: "Admin Panel Dashboard",
};

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <SidebarProvider className="h-screen overflow-hidden">
      <AppSidebar />
      <SidebarInset className="m-0 min-w-0">
        <main className="flex-1 min-w-0 overflow-hidden rounded-2xl">{children}</main>
      </SidebarInset>
    </SidebarProvider>
  );
}
