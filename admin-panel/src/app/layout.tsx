import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { NotificationProvider } from "@/helpers/NotificationContext";
import { AuthProvider } from "@/helpers/AuthContext";
import { Toaster } from "sonner";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Admin Panel",
  description: "Admin Panel",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${geistSans.variable} ${geistMono.variable}`}>
      <body className="antialiased">
        <AuthProvider>
          <NotificationProvider>
            {children}
            <Toaster
              position="bottom-center"
              theme="light"
              toastOptions={{
                classNames: {
                  toast:
                    "bg-[#fffdf8] border border-neutral-200 text-black shadow-lg rounded-xl px-4 py-3",
                  title: "text-sm font-medium text-black",
                  description: "text-xs text-neutral-600",
                  actionButton:
                    "bg-neutral-100 text-black hover:bg-neutral-200 rounded-md px-3 py-1 text-xs",
                },
              }}
            />
          </NotificationProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
