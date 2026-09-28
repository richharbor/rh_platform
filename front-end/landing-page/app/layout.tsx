import type React from "react";
import "@/app/globals.css";
import { Inter } from "next/font/google";
import "@radix-ui/themes/styles.css";
import type { Metadata } from "next";
import Script from "next/script"; // 👈 important
import Footer from "../components/Common/Footer/Footer";
import Navbar from "@/components/Common/Navbar/Navbar";
import Whatsapp from "@/components/Common/Whatsapp/Whatsapp";
import Chatbot from "@/components/Common/Chatbot/Chatbot";
import QueryWidget from "@/components/Common/QueryWidget/QueryWidget";
import NewsletterPopup from "@/components/Common/NewsletterPopup/NewsletterPopup";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Rich Harbor | Invest in Unlisted Shares & Upcoming IPOs",
  description: "Rich Harbor provides exclusive access to curated unlisted shares and upcoming IPO opportunities in India. Partner with us to build your future-ready portfolio.",
  verification: {
    google: "PvrpLhAVJG58lfDd71fEKcjSRyXLZFvXNogrNK2lYcc",
  },
  metadataBase: new URL('https://richharbor.com'),
  alternates: {
    canonical: '/',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="preload" as="font" href="/fonts/batman.ttf" type="font/truetype" crossOrigin="anonymous"></link>

        {/* Google Analytics (gtag.js) */}
        <Script
          src="https://www.googletagmanager.com/gtag/js?id=G-S23L52FW0T"
          strategy="afterInteractive"
          async
        />
        <Script id="google-analytics" strategy="afterInteractive">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', 'G-S23L52FW0T');
          `}
        </Script>

        {/* ✅ Meta Pixel Code */}
        <Script
          id="facebook-pixel"
          strategy="afterInteractive"
          dangerouslySetInnerHTML={{
            __html: `
              !function(f,b,e,v,n,t,s)
              {if(f.fbq)return;n=f.fbq=function(){n.callMethod ?
                n.callMethod.apply(n, arguments) : n.queue.push(arguments)};
              if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
              n.queue=[];t=b.createElement(e);t.async=!0;
              t.src=v;s=b.getElementsByTagName(e)[0];
              s.parentNode.insertBefore(t,s)}(window, document,'script',
              'https://connect.facebook.net/en_US/fbevents.js');
              fbq('init', '1819190408970160');
              fbq('track', 'PageView');
            `,
          }}
        />


        <noscript>
          <img
            height="1"
            width="1"
            style={{ display: "none" }}
            src="https://www.facebook.com/tr?id=1819190408970160&ev=PageView&noscript=1"
            alt="facebook pixel"
          />
        </noscript>
      </head>
      <body className={inter.className}>
        <Navbar />
        <div className="mx-auto items-center max-md:px-4 flex flex-col relative">
          {children}
          <div className="fixed bottom-4 right-4 z-10">
            <Whatsapp />
          </div>

          {/* <Chatbot /> */}

          <QueryWidget />
          <NewsletterPopup />
        </div>
        <Footer />
      </body>
    </html>
  );
}
