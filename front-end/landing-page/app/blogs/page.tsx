import Blogs from "@/components/Pages/Blogs/Blogs";
import { Metadata } from "next";

export const metadata: Metadata = {
    alternates: {
        canonical: "/blogs",
    },
};

export default function Page() {
    return <Blogs />
}