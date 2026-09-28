import PrivateMarkets from "@/components/Pages/PrivateMarkets/PrivateMarkets";
import { Metadata } from "next";

export const metadata: Metadata = {
    title: "Private Markets & Institutional Capital Solutions | Rich Harbor",
    description: "Richharbor partners with growth-stage and pre-IPO companies to facilitate confidential capital introductions to institutional investors.",
};

export default function Page() {
    return <PrivateMarkets />;
}
