"use client";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { z } from "zod";
import { postLogin } from "@/services/Auth/authServices";
import Cookies from "js-cookie";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import Link from "next/link";

interface ILoginBody {
  email: string;
  password: string;
}

const loginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

export default function Login({
  className,
  ...props
}: React.ComponentProps<"div">) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState<ILoginBody>({
    email: "",
    password: "",
  });
  const [errors, setErrors] = useState<Partial<ILoginBody>>({});

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const postLoginFn = async (requestBody: ILoginBody) => {
    try {
      setLoading(true);
      const response = await postLogin(requestBody);

      console.log(response);
      Cookies.set("authToken", response.token);
      // Cookies.set("currentRole","wq")
      // Cookies.set("refreshToken", response.refreshToken);
      toast.success("Login successfully");
      router.push("/");
    } catch (error) {
      console.log(error);
      const status =
        (error as any)?.status ??
        (error as any)?.response?.status ??
        (error as any)?.response?.statusCode;

      const backendError = (error as any)?.response?.data?.error;

      if (status === 401) {
        toast.error(backendError || "Unauthorized");
      } else {
        toast.error(
          backendError || "Internal server error, Please try again later"
        );
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const result = loginSchema.safeParse(form);
    if (!result.success) {
      const fieldErrors: Partial<ILoginBody> = {};
      result.error.issues.forEach((err) => {
        const fieldName = err.path[0] as keyof ILoginBody;
        fieldErrors[fieldName] = err.message;
      });
      setErrors(fieldErrors);
      return;
    }

    setErrors({});
    console.log("Form Data:", result.data);

    postLoginFn(result.data);
  };

  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <Card className="overflow-hidden p-0">
        <CardContent className="grid p-0 md:grid-cols-2">
          <form className="p-6 md:p-8" onSubmit={handleSubmit}>
            <div className="flex flex-col gap-6">
              <div className="flex flex-col items-center text-center">
                <h1 className="text-2xl font-bold">Welcome Back</h1>
                <p className="text-muted-foreground text-balance">
                  Rich Harbor is waiting for you
                </p>
              </div>

              {/* Email */}
              <div className="grid gap-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="m@example.com"
                  value={form.email}
                  onChange={handleChange}
                />
                {errors.email && (
                  <p className="text-red-500 text-sm">{errors.email}</p>
                )}
              </div>

              {/* Password */}
              <div className="grid gap-2">
                <div className="flex items-center">
                  <Label htmlFor="password">Password</Label>
                  <p
                    onClick={() => router.push("/auth/forgot-password")}
                    className="ml-auto text-sm underline-offset-2 hover:underline cursor-pointer">
                    Forgot your password?
                  </p>
                </div>
                <Input
                  id="password"
                  name="password"
                  type="password"
                  placeholder="password"
                  value={form.password}
                  onChange={handleChange}
                />
                {errors.password && (
                  <p className="text-red-500 text-sm">{errors.password}</p>
                )}
              </div>

              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? (
                  <Loader2 className="animate-spin" size={32} />
                ) : (
                  "Login"
                )}
              </Button>
            </div>
            <div className="mt-4 text-center">
              <p className="text-sm text-gray-600">
                Don’t have an account?{" "}
                <Link
                  href="/auth/signup?franchiseId=1"
                  className="dark:text-white text-black font-medium hover:underline"
                >
                  Sign up
                </Link>
              </p>
            </div>
          </form>

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
}
