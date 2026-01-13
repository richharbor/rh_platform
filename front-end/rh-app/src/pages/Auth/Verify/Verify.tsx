"use client";

import type React from "react";
import { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { toast } from "sonner";
import { verifyEmailAndSetNewPassword } from "@/services/Auth/authServices";
import Image from "next/image";

export default function Verify() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const token = searchParams?.get("token");

  const [isTokenValid, setIsTokenValid] = useState<boolean | null>(null);
  const [tempPassword, setTempPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const verifyToken = async () => {
      if (!token) {
        toast.error("Invalid or missing token");
        router.push("/auth/login");
        return;
      }

      try {
        const res = await verifyEmailAndSetNewPassword({
          token,
        });

        if (res?.Result === "SUCCESS") {
          setIsTokenValid(true);
        } else {
          toast.error(res?.message || "Token verification failed");
          setIsTokenValid(false);
          router.push("/auth/login");
        }
      } catch (error: any) {
        console.error("Token verification failed:", error);
        toast.error(
          error?.response?.data?.message || "An unexpected error occurred"
        );
        setIsTokenValid(false);
        router.push("/auth/login");
      }
    };

    verifyToken();
  }, [token, router]);

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!tempPassword || !newPassword || !confirmPassword) {
      toast.error("Please fill in all fields");
      return;
    }

    if (newPassword !== confirmPassword) {
      toast.error("New password and confirm password do not match");
      return;
    }

    setLoading(true);
    try {
      const res = await verifyEmailAndSetNewPassword({
        token: token!,
        tempPassword,
        newPassword,
      });

      if (res?.Result === "SUCCESS") {
        toast.success(res?.message || "Password updated successfully");
        router.push("/auth/login");
      } else {
        toast.error(res?.message || "Failed to update password");
      }
    } catch (error: any) {
      console.error("Password update failed:", error);
      toast.error(
        error?.response?.data?.message || "An unexpected error occurred"
      );
    } finally {
      setLoading(false);
    }
  };

  if (isTokenValid === null) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="w-16 h-16 border-4 border-gray-300 border-t-blue-500 rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen px-4">
      <div className="mb-8">
        <img
          src="https://richharbor.com/_next/image?url=%2F_next%2Fstatic%2Fmedia%2FRH-Logo.dfcfd1c1.png&w=3840&q=75"
          alt="Rich Harbor Logo"
          width={180}
          height={180}
        />
      </div>

      <form
        className="flex flex-col gap-4 w-full max-w-sm"
        onSubmit={handlePasswordSubmit}>
        <h2 className="text-2xl font-semibold text-center mb-6">
          Set New Password
        </h2>

        <input
          type="password"
          placeholder="Temporary Password"
          value={tempPassword}
          onChange={(e) => setTempPassword(e.target.value)}
          className="border border-input bg-background px-3 py-2 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-ring"
          required
        />
        <input
          type="password"
          placeholder="New Password"
          value={newPassword}
          onChange={(e) => setNewPassword(e.target.value)}
          className="border border-input bg-background px-3 py-2 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-ring"
          required
        />
        <input
          type="password"
          placeholder="Confirm New Password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          className="border border-input bg-background px-3 py-2 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-ring"
          required
        />

        <button
          type="submit"
          disabled={loading}
          className="bg-primary text-primary-foreground px-4 py-2 rounded-md font-medium hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed mt-2">
          {loading ? "Updating..." : "Update Password"}
        </button>
      </form>
    </div>
  );
}
