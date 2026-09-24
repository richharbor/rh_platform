import SMEIPOs from "@/components/Pages/SMEIPOs/SMEIPOs";
import { Metadata } from "next";

export const metadata: Metadata = {
    alternates: {
        canonical: "/sme-ipos",
    },
};

export default function page() {
    return <SMEIPOs />
}