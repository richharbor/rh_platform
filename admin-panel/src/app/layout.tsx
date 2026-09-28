import type { Metadata } from "next";
import { Anton, Inter, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import { NotificationProvider } from "@/helpers/NotificationContext";
import { AuthProvider } from "@/helpers/AuthContext";
import { Toaster } from "sonner";

const inter = Inter({ variable: "--font-inter", subsets: ["latin"] });
const anton = Anton({ variable: "--font-anton", subsets: ["latin"], weight: "400" });
const mono = JetBrains_Mono({ variable: "--font-jetbrains", subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Rich Harbor Admin",
  description: "Rich Harbor admin panel",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${inter.variable} ${anton.variable} ${mono.variable}`}>
      <body className="font-sans antialiased">
        <AuthProvider>
          <NotificationProvider>
            {children}
            <Toaster
              position="bottom-center"
              theme="light"
              toastOptions={{
                classNames: {
                  toast:
                    "bg-rfin-ink border border-rfin-ink text-rfin-paper shadow-lg rounded-2xl px-4 py-3",
                  title: "text-sm font-semibold text-rfin-paper",
                  description: "text-xs text-rfin-paper/70",
                  actionButton:
                    "bg-rfin-champagne text-rfin-ink hover:bg-[#e4cb96] rounded-full px-3 py-1 text-xs font-semibold",
                },
              }}
            />
          </NotificationProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
