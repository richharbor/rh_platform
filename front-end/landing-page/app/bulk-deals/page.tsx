import BulkDeals from "@/components/Pages/BulkDeals/BulkDeals";
import { Metadata } from "next";

export const metadata: Metadata = {
    title: "Listed Shares — Bulk & Institutional Deals | Rich Harbor",
    description: "Richharbor facilitates bulk and block deals in listed shares, enabling access to large quantities at negotiated pricing for eligible investors.",
};

export default function Page() {
    return <BulkDeals />;
}
