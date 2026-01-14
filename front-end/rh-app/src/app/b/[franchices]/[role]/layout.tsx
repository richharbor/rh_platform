import type { Metadata } from "next";
import {
  SidebarProvider,
  SidebarInset,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { ThemeModeToggle } from "@/components/Common/Providers/ThemeModeToggle";
import { LSidebar } from "@/components/Common/Navigation/LSidebar";
import { cookies } from "next/headers";
import { SiteHeader } from "@/components/Common/Navigation/MainNavigation/SiteHeader";
import { RootSidebar } from "@/components/Common/Navigation/MainNavigation/RootSidebar";

export async function generateMetadata(): Promise<Metadata> {
  const cookieStore = cookies();
  const franchiseName = cookieStore.get("franchiseName")?.value || "Broker";
  return {
    title: `Rich Harbor | ${franchiseName}`,
  };
}

export default function BrokerLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <main className="flex min-h-screen w-full flex-col">
      <div className="[--header-height:calc(--spacing(14))]">
        <SidebarProvider className="flex flex-col">
          <SiteHeader />
          <div className="flex flex-1">
            <RootSidebar />
            {/* <LSidebar /> */}
            <SidebarInset className="shadow-none">
              <div className="flex flex-1 flex-col gap-4">{children}</div>
            </SidebarInset>
          </div>
        </SidebarProvider>
      </div>
    </main>
  );
}
