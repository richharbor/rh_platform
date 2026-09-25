import type { Metadata, Viewport } from "next";
import { Providers } from "@/components/providers";
// The reference loads Anton + Inter 400–700 + JetBrains Mono 400/500. Self-hosted
// via @fontsource so builds never depend on reaching Google Fonts.
import "@fontsource/anton/400.css";
import "@fontsource/inter/400.css";
import "@fontsource/inter/500.css";
import "@fontsource/inter/600.css";
import "@fontsource/inter/700.css";
import "@fontsource/jetbrains-mono/400.css";
import "@fontsource/jetbrains-mono/500.css";
import "./globals.css";

export const metadata: Metadata = {
  title: "RFIN — Your financial life, in one place",
  description: "Discover, understand and manage your financial goals with RFIN.",
};

export const viewport: Viewport = { themeColor: "#f6f3ed" };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
