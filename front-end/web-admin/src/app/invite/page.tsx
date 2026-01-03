"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { PrivateAxios } from "@/helpers/PrivateAxios";
import { toast } from "sonner";
import { Loader2 } from "lucide-react"; // Assuming lucide-react is available, else use text

function InviteContent() {
    const searchParams = useSearchParams();
    const router = useRouter();

    // State
    const [verifying, setVerifying] = useState(true);
    const [valid, setValid] = useState(false);
    const [token, setToken] = useState<string | null>(null);
    const [error, setError] = useState("");

    // Setup Form
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        const tokenParam = searchParams.get("token");
        if (!tokenParam) {
            setVerifying(false);
            setError("Invalid invitation link");
            return;
        }

        setToken(tokenParam);
        verifyToken(tokenParam);
    }, [searchParams]);

    const verifyToken = async (token: string) => {
        try {
            const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5003/v1';
            await PrivateAxios.get(`${API_URL}/admin/auth/verify-invite?token=${token}`);
            setValid(true);
        } catch (error: any) {
            console.error("Verification error", error);
            setError(error.response?.data?.error || "Invalid or expired invitation");
        } finally {
            setVerifying(false);
        }
    };

    const handleSetup = async (e: React.FormEvent) => {
        e.preventDefault();

        if (password !== confirmPassword) {
            toast.error("Passwords do not match");
            return;
        }

        if (password.length < 6) {
            toast.error("Password must be at least 6 characters");
            return;
        }

        setSubmitting(true);
        try {
            const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5003/v1';
            await PrivateAxios.post(`${API_URL}/admin/auth/complete-invite`, {
                token,
                password
            });

            toast.success("Account setup successfully! Redirecting to login...");
            setTimeout(() => router.push("/login"), 2000);
        } catch (error: any) {
            toast.error(error.response?.data?.error || "Setup failed");
            setSubmitting(false);
        }
    };

    if (verifying) {
        return (
            <div className="flex min-h-screen items-center justify-center bg-gray-50 p-4">
                <div className="w-full max-w-md bg-white rounded-xl shadow-lg border border-gray-100 p-8 text-center">
                    <h2 className="text-xl font-semibold text-gray-800 mb-4">Verifying Invitation...</h2>
                    <div className="flex justify-center">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                    </div>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex min-h-screen items-center justify-center bg-gray-50 p-4">
                <div className="w-full max-w-md bg-white rounded-xl shadow-lg border border-gray-100 p-8 text-center">
                    <h2 className="text-xl font-semibold text-red-600 mb-2">Invitation Error</h2>
                    <p className="text-gray-600 mb-6">{error}</p>
                    <button
                        onClick={() => router.push("/login")}
                        className="w-full py-2 px-4 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors"
                    >
                        Go to Login
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="flex min-h-screen items-center justify-center bg-gray-50 p-4">
            <div className="w-full max-w-md bg-white rounded-xl shadow-lg border border-gray-100 p-8">
                <div className="text-center mb-6">
                    <h1 className="text-2xl font-bold text-gray-900">Set Up Your Account</h1>
                    <p className="text-gray-500 mt-1">Create a password to access the admin panel</p>
                </div>

                <form onSubmit={handleSetup} className="space-y-4">
                    <div className="space-y-2">
                        <label htmlFor="password" className="block text-sm font-medium text-gray-700">Password</label>
                        <input
                            id="password"
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                            required
                        />
                    </div>
                    <div className="space-y-2">
                        <label htmlFor="confirm" className="block text-sm font-medium text-gray-700">Confirm Password</label>
                        <input
                            id="confirm"
                            type="password"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                            required
                        />
                    </div>
                    <button
                        type="submit"
                        className="w-full py-3 px-4 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                        disabled={submitting}
                    >
                        {submitting ? "Setting up..." : "Complete Setup"}
                    </button>
                </form>
            </div>
        </div>
    );
}

export default function InvitePage() {
    return (
        <Suspense fallback={
            <div className="flex min-h-screen items-center justify-center bg-gray-50">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
        }>
            <InviteContent />
        </Suspense>
    );
}
