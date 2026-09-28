import InsurancePage from "@/components/Pages/InsurancePage/InsurancePage";
import { Metadata } from "next";

export const metadata: Metadata = {
    alternates: {
        canonical: "/insurance",
    },
};

export default function page() {

    return <InsurancePage />
}