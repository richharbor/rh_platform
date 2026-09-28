import Login from "@/components/Pages/Auth/Login/Login";
import { Metadata } from "next";

export const metadata: Metadata = {
    alternates: {
        canonical: "/login",
    },
};

export default function login() {
    return (
        <Login />
    )
}