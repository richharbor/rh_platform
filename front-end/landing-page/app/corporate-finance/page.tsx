
import CorporateFinance from "@/components/Pages/CorporateFinance/CorporateFinance";
import { Metadata } from "next";

export const metadata: Metadata = {
    title: "Corporate Finance & Growth Capital | Rich Harbor",
    description: "Richharbor enables businesses to access revenue based and structured financing solutions without equity dilution.",
    alternates: {
        canonical: "/corporate-finance",
    },
};

export default function page() {
    return <CorporateFinance />
}
