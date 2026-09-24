import ComingSoon from "@/components/Pages/ComingSoon/ComingSoon";
import { Metadata } from "next";

export const metadata: Metadata = {
    robots: {
        index: false,
        follow: false,
    },
};

export default function page() {
    return <ComingSoon />
}