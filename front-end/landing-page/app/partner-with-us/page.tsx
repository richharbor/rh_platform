import PartnerWithUs from "@/components/Pages/PartnerWithUs/PartnerWithUs";
import { Metadata } from "next";

export const metadata: Metadata = {
    alternates: {
        canonical: "/partner-with-us",
    },
};

export default function page() {

    return <PartnerWithUs />
}