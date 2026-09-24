import UnlistedShares from "@/components/Pages/UnlistedShares/UnlistedShares";
import { Metadata } from "next";

export const metadata: Metadata = {
    title: "Buy Unlisted & Pre-IPO Shares in India | Richharbor",
    description: "Invest in unlisted and pre-IPO shares in India with transparent pricing, secure demat transfer, and expert execution support. Start with Richharbor.",
    keywords: ["unlisted shares india", "buy unlisted shares", "pre ipo shares india", "unlisted share prices", "private market investments", "off market shares india"],
    alternates: {
        canonical: "/unlisted-shares",
    },
};

export default function Page() {
    return <UnlistedShares />;
}
