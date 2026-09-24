import SignUp from "@/components/Pages/Auth/SignUp/SignUp";
import { Metadata } from "next";

export const metadata: Metadata = {
    alternates: {
        canonical: "/signup",
    },
};

export default function signup() {
    return <SignUp />
}