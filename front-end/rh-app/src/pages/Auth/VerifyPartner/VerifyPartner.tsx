"use client";

import type React from "react";
import { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { toast } from "sonner";
import { verifyEmailAndSetNewPassword, verifyPartner } from "@/services/Auth/authServices";
import Image from "next/image";
import Loading from "@/app/loading";

export default function VerifyPartner() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const token = searchParams?.get("token");


    const [loading, setLoading] = useState(false);

    useEffect(() => {
        const verifyToken = async () => {
            if (!token) {
                toast.error("Invalid or missing token");
                router.push("/auth/login");
                return;
            }

            try {
                const res = await verifyPartner({
                    token,
                });

                if (res?.Result === "SUCCESS") {

                    toast.success("Token verified successfully");
                    router.push("/auth/login");
                } else {
                    toast.error(res?.message || "Token verification failed");

                    router.push("/auth/login");
                }
            } catch (error: any) {
                console.error("Token verification failed:", error);
                toast.error(
                    error?.response?.data?.message || "An unexpected error occurred"
                );

                router.push("/auth/login");
            }
        };

        verifyToken();
    }, [token, router]);



    return (
        <div className="flex w-full flex-col items-center justify-center min-h-screen px-4">
            <Loading />
        </div>
    );
}
