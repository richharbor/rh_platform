"use client";

import React, { use, useEffect, useState } from "react";
import {
  requestPasswordReset,
  resetPassword,
  verifyResetToken,
} from "@/services/Auth/authServices";
import { useSearchParams, useRouter } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Eye, EyeOff, Loader2 } from "lucide-react";
import z from "zod";


const passwordSchema = z
  .string()
  .min(8, "Password must be at least 8 characters")
  .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
  .regex(/\d/, "Password must contain at least one number")
  .regex(/[@$!%*?&]/, "Password must contain at least one symbol (@$!%*?&)");

const ForgotPassword = () => {
  const [email, setEmail] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [status, setStatus] = useState<"request" | "reset" | "done">("request");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false)

  const searchParams = useSearchParams();
  const router = useRouter();
  const token = searchParams?.get("token");

  // Auto verify token on load
  useEffect(() => {
    const autoVerify = async () => {
      if (token) {
        setLoading(true);
        try {
          const res = await verifyResetToken({ token });
          setMessage(res.message || "Token verified successfully.");
          setStatus("reset");
        } catch (error: any) {
          setMessage(
            error?.response?.data?.message || "Invalid or expired reset link."
          );
          setStatus("request");
        } finally {
          setLoading(false);
        }
      }
    };
    autoVerify();
  }, [token]);

  // Redirect after success
  useEffect(() => {
    if (status === "done") {
      const timer = setTimeout(() => {
        router.push("/auth/login");
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [status, router]);

  // Request reset link
  const handleRequestReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await requestPasswordReset({ email });
      setMessage(res.message || "Reset link sent to your email.");
    } catch (error: any) {
      setMessage(
        error?.response?.data?.message || "Failed to send reset email."
      );
    } finally {
      setLoading(false);
    }
  };

  // Handle password reset
  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();

    const result = passwordSchema.safeParse(newPassword);
    if (!result.success) {
      const firstError = result.error.issues[0]?.message || "Invalid input.";
      setError(firstError);
      return;
    }


    if (!token) return setError("Token missing.");
    if (newPassword !== confirmPassword)
      return setError("Passwords do not match.");

    setLoading(true);
    try {
      const res = await resetPassword({ token, newPassword });
      setMessage(res.message || "Password updated successfully!");
      setStatus("done");
    } catch (error: any) {
      setMessage(error?.response?.data?.message || "Password reset failed.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={cn("flex flex-col gap-6")}>
      <Card className="overflow-hidden p-0">
        <CardContent className="grid p-0 md:grid-cols-2">
          <div className="rounded-xl shadow-md p-6 w-full max-w-sm text-center">
            <h2 className="text-2xl font-bold ">
              Forgot Password
            </h2>
            {message && (
              <p
                className={`text-sm px-3 py-2 rounded mb-3 ${message.toLowerCase().includes("success")
                  ? "text-muted-foreground "
                  : "text-muted-foreground "
                  }`}>
                {message}
              </p>
            )}

            {/* Step 1: Enter Email */}
            {status === "request" && (
              <form onSubmit={handleRequestReset} className="space-y-3 py-10 text-left">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="m@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
                <Button type="submit" className="w-full" disabled={loading}>
                  {loading ? (
                    <Loader2 className="animate-spin" size={32} />
                  ) : (
                    "Send Reset Link"
                  )}
                </Button>
              </form>
            )}

            {/* Step 2: Enter New Password */}
            {status === "reset" && (
              <form onSubmit={handleResetPassword} className="space-y-3 text-left">
                <Label htmlFor="text">New password</Label>
                <div className="relative">
                  <Input
                    id="password"
                    name="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Enter your new password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="pr-10" // space for the icon on the right
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-3 flex items-center text-muted-foreground hover:text-foreground"
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
                {
                  newPassword && (
                    <ul className="text-xs text-gray-500 mt-1 space-y-0.5">
                      <li
                        className={
                          newPassword.length >= 8
                            ? "text-green-600"
                            : "text-gray-500"
                        }>
                        • At least 8 characters
                      </li>
                      <li
                        className={
                          /[A-Z]/.test(newPassword)
                            ? "text-green-600"
                            : "text-gray-500"
                        }>
                        • At least one uppercase letter
                      </li>
                      <li
                        className={
                          /\d/.test(newPassword)
                            ? "text-green-600"
                            : "text-gray-500"
                        }>
                        • At least one number
                      </li>
                      <li
                        className={
                          /[@$!%*?&]/.test(newPassword)
                            ? "text-green-600"
                            : "text-gray-500"
                        }>
                        • At least one symbol (@$!%*?&)
                      </li>
                    </ul>
                  )
                }
                <Label htmlFor="text">Confirm password</Label>
                <Input
                  id="rePassword"
                  name="rePassword"
                  type="password"
                  placeholder="Enter your password again"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                />
                {error && <p className="text-red-500 text-sm">{error}</p>}


                <Button type="submit" className="w-full" disabled={loading}>
                  {loading ? (
                    <Loader2 className="animate-spin" size={32} />
                  ) : (
                    "Reset Password"
                  )}
                </Button>
              </form>
            )}

            {/* Step 3: Success */}
            {status === "done" && (
              <div>
                <p className="text-green-600 font-medium text-sm mb-3">
                  Password updated successfully! Redirecting to login...
                </p>
                <a
                  href="/auth/login"
                  className="text-primary text-sm font-medium hover:underline">
                  Back to Login
                </a>
              </div>
            )}
          </div>

          {/* Image Section */}
          <div className="bg-muted relative hidden md:block">
            <img
              src="https://img.freepik.com/free-vector/purple-neon-lined-pattern-dark-background-vector_53876-173381.jpg?semt=ais_hybrid&w=740"
              alt="Signup Image"
              className="absolute inset-0 h-full w-full object-cover dark:brightness-[0.2] dark:grayscale"
            />
          </div>
        </CardContent>
      </Card>

      <div className="text-muted-foreground hover:[a]:*:text-primary text-center text-xs text-balance [a]:*:underline [a]:*:underline-offset-4">
        By signing up, you agree to our <a href="#">Terms of Service</a> and{" "}
        <a href="#">Privacy Policy</a>.
      </div>
    </div>
  );
};

export default ForgotPassword;



