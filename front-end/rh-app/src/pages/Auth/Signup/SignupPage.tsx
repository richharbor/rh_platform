"use client";

import type React from "react";
import { useEffect, useState } from "react";
import { z } from "zod";
import { Eye, EyeOff, CheckCircle2, Circle } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { toast } from "sonner";

import Loading from "@/app/loading";
import { Label } from "@/components/ui/label";
import Image from "next/image";
import { postStartOnboard, verifyOnboardingToken } from "@/services/Auth/authServices";
import Cookies from "js-cookie";

const SignupSchema = z.object({
  fullName: z
    .string()
    .trim()
    .min(2, "Full name must be at least 2 characters"),
  email: z
    .string()
    .trim()
    .min(1, "Business email is required")
    .email("Please enter a valid business email"),
  password: z
    .string()
    .min(12, "Password must be at least 12 characters")
    .refine(
      (v) => /[!@#$%^&*(),.?":{}|<>]/.test(v),
      "Must include at least 1 special character"
    )
    .refine((v) => /\d/.test(v), "Must include at least 1 number")
    .refine((v) => /[A-Z]/.test(v), "Must include at least 1 uppercase letter"),
  confirmPassword: z
    .string()
    .min(1, "Please confirm your password"),
  category: z
    .string()
    .trim()
    .min(1, "Category is required"),
  phoneNumber: z
    .string()
    .trim()
    .min(1, "Mobile phone number is required")
    .refine(
      (v) => v.replace(/\D/g, "").length >= 7,
      "Please enter a valid phone number"
    ),
  location: z
    .string()
    .trim()
    .min(2, "Location must be at least 2 characters")
    .regex(/^[A-Za-z\s.,'-]+$/, "Location contains invalid characters"),
  firmName: z
    .string()
    .trim()
    .min(2, "Firm name must be at least 2 characters")
    .regex(/^[A-Za-z0-9\s&.'\-\/]+$/, "Firm name contains invalid characters"),
}).refine(
  (data) => data.password === data.confirmPassword,
  {
    message: "Passwords do not match",
    path: ["confirmPassword"], // attach error to confirmPassword
  }
);;

type FieldErrors = Partial<Record<keyof z.infer<typeof SignupSchema>, string>>;

export default function SignupPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [category, setCategory] = useState("");
  const [accountType, setAccountType] = useState<string[]>([]);
  const [location, setLocation] = useState("");
  const [firmName, setFirmName] = useState("");

  const [errors, setErrors] = useState<FieldErrors>({});
  const [loading, setLoading] = useState(false);
  const [isOAuthCallback, setIsOAuthCallback] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();
  const [inviteEmail, setInviteEmail] = useState<string | null>(null);
  const [inviterId, setInviterId] = useState<number | null>(null);
  const [franchiseId, setFranchiseId] = useState<number | null>(null);
  const [accountRoles, setAccountRoles] = useState<
    { id: string; name: string }[]
  >([]);
  const [isToken, setIsToken] = useState(false);

  //   // Handle OAuth callback from Google/Microsoft
  //   useEffect(() => {
  //     const code = searchParams.get("code");
  //     const state = searchParams.get("state");
  //     const provider = sessionStorage.getItem("oauth_provider");

  //     if (!code || !provider) return;

  //     // we're in OAuth callback mode
  //     setIsOAuthCallback(true);

  //     if (provider === "microsoft") handleMicrosoftCallback(code, state);
  //     if (provider === "google") handleGoogleCallback(code);

  //     sessionStorage.removeItem("oauth_provider"); // clean up
  //   }, [searchParams]);

  const passwordChecks = {
    length: password.length >= 12,
    special: /[!@#$%^&*(),.?":{}|<>]/.test(password),
    number: /\d/.test(password),
    uppercase: /[A-Z]/.test(password),
  };

  useEffect(() => {
    const tokenFromUrl = searchParams?.get("token");
    const franchiseIdFromUrl = searchParams?.get("franchiseId");

    // setFranchiseId(1);
    // setAccountRoles([{ id: "partner", name: "Partner" }]);
    // setAccountType(["partner"]);

    // 1. Token flow
    if (tokenFromUrl) {
      const verifyToken = async () => {
        try {
          const res = await verifyOnboardingToken({ token: tokenFromUrl });
          console.log("Token verified:", res);

          if (res?.data?.partnerEmail) {
            setEmail(res.data.partnerEmail)
            setAccountType(res.data.partnerRoles.map((r: any) => r.name))
            setInviteEmail(res.data.partnerEmail);
            setAccountRoles(res.data.partnerRoles);
          }

          setInviterId(res.data.inviterId);
          setFranchiseId(res.data.franchiseId || null);
          setIsToken(true);
        } catch (error: any) {
          console.error("Invalid or expired token:", error);
          toast.error("Invalid or expired invite link");
          router.replace("/auth/login");
        }
      };

      verifyToken();
      return;
    } else if (franchiseIdFromUrl) {
      setFranchiseId(Number(franchiseIdFromUrl));
      setAccountRoles([{ id: "partner", name: "Partner" }]);
      setAccountType(["partner"]);
    } else {
      router.push("/auth/login");
    }
  }, [searchParams, router]);


  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setErrors({});
    const result = SignupSchema.safeParse({ email, password, category, fullName, phoneNumber, firmName, location, confirmPassword });

    if (!result.success) {
      const fieldErrors: FieldErrors = {};
      for (const issue of result.error.issues) {
        const path = issue.path[0] as keyof FieldErrors;
        fieldErrors[path] = issue.message;
        toast.error(issue.message);
      }
      setErrors(fieldErrors);
      return;
    }
    try {
      setLoading(true);
      const response = await postStartOnboard({
        email: email,
        createdBy: inviterId!,
        password: password,
        fullName: fullName,
        accountType: accountType,
        category: category,
        mobileNumber: phoneNumber,
        location: location,
        firmName: firmName,
        isToken,
        franchiseId, //  include franchiseId in payload
      });

      Cookies.set("authToken", response.token);
      if (!isToken) {
        toast.success("Verify your email to complete your registration!");
      } else {
        toast.success("Account created successfully!");
      }
      router.push("/auth/login");
    } catch (error: any) {
      console.error("Onboarding error:", error);
      toast.error(error.response?.data?.error || "Failed to create account");
      throw error;
    } finally {
      setLoading(false);
    }
  };





  // Email + Password signup
  // const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
  //   e.preventDefault();
  //   setErrors({});
  //   const result = SignupSchema.safeParse({ email, password, category });

  //   if (!result.success) {
  //     const fieldErrors: FieldErrors = {};
  //     for (const issue of result.error.issues) {
  //       const path = issue.path[0] as keyof FieldErrors;
  //       fieldErrors[path] = issue.message;
  //       toast.error(issue.message);
  //     }
  //     setErrors(fieldErrors);
  //     return;
  //   }

  //   // try {
  //   //   setLoading(true);
  //   //   const response = await signup({
  //   //     email,
  //   //     password,
  //   //     phone_number: phoneNumber,
  //   //   });

  //   //   if (response.Result === "SUCCESS") {
  //   //     toast.success("Account created! Please verify your email.");
  //   //     router.push(`/auth/verify?email=${response.Email}`);
  //   //     return;
  //   //   }
  //   //   if (response.Result === "AlreadyRegistered") {
  //   //     toast.info("Account already exists. Please log in.");
  //   //     router.push("/auth/login");
  //   //     return;
  //   //   }
  //   //   if (response.Result === "NotOnboarded") {
  //   //     toast.info("Please complete onboarding.");
  //   //     router.push("/auth/onboarding");
  //   //     return;
  //   //   }
  //   //   if (response.Result === "NotVerified") {
  //   //     toast.info("Please verify your email.");
  //   //     router.push(`/auth/verify?email=${response.Email}`);
  //   //     return;
  //   //   }

  //   //   toast.error("Unexpected server response.");
  //   // } catch (error) {
  //   //   console.error("Signup failed", error);
  //   //   toast.error("Sign up failed! Please try again.");
  //   // } finally {
  //   //   setLoading(false);
  //   // }
  // };



  // ✅ Default signup form (when not processing callback)
  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-md md:max-w-3xl">
        <div className="text-center flex justify-center mb-8">
          {/* <h1 className="text-3xl font-bold text-foreground mb-2">
            Start for free
          </h1>
          <p className="text-muted-foreground text-lg">
            No credit card required
          </p> */}
          <div>
            <Image src='/rhlogo.png' alt="RichHarbor Logo" width={200} height={200} />
          </div>
        </div>

        <form className="space-y-5 md:grid md:grid-cols-2 md:gap-4" onSubmit={handleSubmit} noValidate>
          {/* Full Name */}
          <div>
            <label className="block text-sm font-medium text-foreground mb-1.5">
              Full Name
            </label>
            <input
              type="text"
              placeholder="John Doe"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 bg-input text-foreground placeholder:text-muted-foreground ${errors.fullName
                ? "border-destructive focus:ring-destructive"
                : "border-border focus:ring-ring"
                }`}
            />
            {errors.fullName && (
              <p className="mt-1 text-sm text-destructive">{errors.fullName}</p>
            )}
          </div>
          {/* Email */}
          <div>
            <label className="block text-sm font-medium text-foreground mb-1.5">
              Email Address
            </label>
            <input
              type="email"
              placeholder="name@work-email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 bg-input text-foreground placeholder:text-muted-foreground ${errors.email
                ? "border-destructive focus:ring-destructive"
                : "border-border focus:ring-ring"
                }`}
            />
            {errors.email && (
              <p className="mt-1 text-sm text-destructive">{errors.email}</p>
            )}
          </div>

          {/* Password */}
          <div>
            <label className="block text-sm font-medium text-foreground mb-1.5">
              Password
            </label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                placeholder="Set your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className={`w-full px-4 py-3 pr-12 border rounded-lg focus:outline-none focus:ring-2 bg-input text-foreground placeholder:text-muted-foreground ${errors.password
                  ? "border-destructive focus:ring-destructive"
                  : "border-border focus:ring-ring"
                  }`}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground"
              >
                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>

            {/* Password checks */}
            <div className="mt-3 grid grid-cols-2 gap-2 text-sm">
              {Object.entries(passwordChecks).map(([key, ok]) => (
                <div key={key} className="flex items-center gap-2">
                  {ok ? (
                    <CheckCircle2 size={16} className="text-green-500" />
                  ) : (
                    <Circle size={16} className="text-muted-foreground" />
                  )}
                  <span
                    className={ok ? "text-foreground" : "text-muted-foreground"}
                  >
                    {key === "length"
                      ? "min. 12 characters"
                      : key === "special"
                        ? "min. 1 special character"
                        : key === "number"
                          ? "min. 1 number"
                          : "min. 1 uppercase letter"}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Confirm Password */}
          <div>
            <label className="block text-sm font-medium text-foreground mb-1.5">
              Confirm Password
            </label>
            <div className="relative">
              <input
                type={showConfirmPassword ? "text" : "password"}
                placeholder="Set your password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className={`w-full px-4 py-3 pr-12 border rounded-lg focus:outline-none focus:ring-2 bg-input text-foreground placeholder:text-muted-foreground ${errors.confirmPassword
                  ? "border-destructive focus:ring-destructive"
                  : "border-border focus:ring-ring"
                  }`}
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground"
              >
                {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
            {errors.confirmPassword && (
              <p className="mt-1 text-sm text-destructive">{errors.confirmPassword}</p>
            )}
          </div>

          {/* Phone */}
          <div>
            <label className="block text-sm font-medium text-foreground mb-1.5">
              Mobile phone number
            </label>
            <input
              type="tel"
              placeholder="081234 56789"
              value={phoneNumber}
              onChange={(e) => setPhoneNumber(e.target.value)}
              className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 bg-input text-foreground placeholder:text-muted-foreground ${errors.phoneNumber
                ? "border-destructive focus:ring-destructive"
                : "border-border focus:ring-ring"
                }`}
            />
            {errors.phoneNumber && (
              <p className="mt-1 text-sm text-destructive">
                {errors.phoneNumber}
              </p>
            )}
          </div>
          {/* Location */}
          <div>
            <label className="block text-sm font-medium text-foreground mb-1.5">
              Location
            </label>
            <input
              type="text"
              placeholder="Enter your location"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 bg-input text-foreground placeholder:text-muted-foreground ${errors.location
                ? "border-destructive focus:ring-destructive"
                : "border-border focus:ring-ring"
                }`}
            />
            {errors.location && (
              <p className="mt-1 text-sm text-destructive">{errors.location}</p>
            )}
          </div>
          {/* Firm Name */}
          <div>
            <label className="block text-sm font-medium text-foreground mb-1.5">
              Firm Name
            </label>
            <input
              type="text"
              placeholder="Enter your firm Name"
              value={firmName}
              onChange={(e) => setFirmName(e.target.value)}
              className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 bg-input text-foreground placeholder:text-muted-foreground ${errors.firmName
                ? "border-destructive focus:ring-destructive"
                : "border-border focus:ring-ring"
                }`}
            />
            {errors.firmName && (
              <p className="mt-1 text-sm text-destructive">{errors.firmName}</p>
            )}
          </div>

          {/* Entity type */}
          <div >
            <Label htmlFor="text" className="block text-sm font-medium text-foreground mb-1.5">
              Entity Type
            </Label>
            <select
              id='category'
              value={category}
              onChange={(e) => {
                setCategory(e.target.value)
              }}
              className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 bg-input text-foreground placeholder:text-muted-foreground ${errors.category
                ? "border-destructive focus:ring-destructive"
                : "border-border focus:ring-ring"
                }`}
            >
              <option className="dark:bg-background" value="">
                Select entity type
              </option>

              <option className="dark:bg-background" value="institution">
                Large Institution
              </option>
              <option className="dark:bg-background" value="wealth firm">
                Wealth Firm
              </option>
              <option className="dark:bg-background" value="Large Broker">
                Large Broker
              </option>
              <option className="dark:bg-background" value="broker">
                Broker
              </option>
              <option className="dark:bg-background" value="Family office">
                Family office
              </option>
              <option className="dark:bg-background" value="Individual">
                Individual
              </option>
              <option className="dark:bg-background" value="Other">
                Other
              </option>

            </select>
            {errors.category && (
              <p className="mt-1 text-sm text-destructive">{errors.category}</p>
            )}

          </div>

          {/* Submit */}
          <div className="md:col-span-2 flex justify-center">
            <button
              type="submit"
              disabled={loading}
              className={`w-md font-semibold py-3 rounded-lg text-primary-foreground ${loading
                ? "bg-muted cursor-not-allowed"
                : "bg-primary hover:bg-primary/80"
                }`}
            >
              {loading ? "Signing up..." : "Sign up"}
            </button>
          </div>
          {/* 
          Social logins */}
          {/* <div className="space-y-3">
            <button
              type="button"
              onClick={handleGoogleSignup}
              className="w-full flex items-center justify-center gap-3 px-4 py-3 border border-border rounded-lg hover:bg-secondary transition-colors"
            >
              <GoogleIcon />
              <span className="font-medium text-foreground">
                Sign up with Google
              </span>
            </button>
            <button
              type="button"
              onClick={handleMicrosoftSignup}
              className="w-full flex items-center justify-center gap-3 px-4 py-3 border border-border rounded-lg hover:bg-secondary transition-colors"
            >
              <MicrosoftIcon />
              <span className="font-medium text-foreground">
                Sign up with Microsoft
              </span>
            </button>
          </div> */}

          {/* Footer */}

          {/* <div className="text-center text-xs text-muted-foreground pt-4">
            You agree to our{" "}
            <a href="https://rhinon.tech/terms-and-conditions" className="text-primary hover:underline">
              Terms of Use
            </a>{" "}
            and{" "}
            <a href="https://rhinon.tech/terms-and-conditions" className="text-primary hover:underline">
              Privacy Policy
            </a>
          </div> */}
        </form>
        <div className="text-center text-sm pt-4 text-muted-foreground">
          Already have an account?{" "}
          <a
            href="/auth/login"
            className="text-primary font-medium hover:underline"
          >
            Log in
          </a>
        </div>
      </div>
    </div>
  );
}
