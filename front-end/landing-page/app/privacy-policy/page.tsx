import PrivacyPolicy from "@/components/Pages/PrivacyPolicy/PrivacyPolicy";
import { Metadata } from "next";

export const metadata: Metadata = {
    alternates: {
        canonical: "/privacy-policy",
    },
};

export default function page() {

    return <PrivacyPolicy />
}