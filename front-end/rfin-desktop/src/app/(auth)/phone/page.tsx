"use client";
import { useMutation } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { api } from "@/lib/api";
import { Button, Field, PageTitle, Stepper } from "@/components/ui";

/** Mobile + OTP only; everything else later (report #12). */
export default function Phone() {
  const router = useRouter();
  const [phone, setPhone] = useState("");
  const [showRef, setShowRef] = useState(false);
  const [referral, setReferral] = useState("");
  const valid = /^[6-9]\d{9}$/.test(phone);

  const send = useMutation({
    mutationFn: () => api("auth.sendOtp", { phone }),
    onSuccess: ({ requestId, resendInSec }) => {
      const q = new URLSearchParams({ requestId, phone, resendInSec: String(resendInSec), referral: referral.trim() });
      router.push(`/otp?${q}`);
    },
  });

  return (
    <form
      className="space-y-8"
      onSubmit={(e) => {
        e.preventDefault();
        if (valid) send.mutate();
      }}
    >
      <Stepper steps={["Mobile", "Verify"]} current={0} />
      <PageTitle title="Your mobile number" lede="We'll text a 6-digit code. This number becomes your RFIN ID." />
      <Field
        label="Mobile · +91"
        value={phone}
        onChange={(e) => setPhone(e.target.value.replace(/\D/g, "").slice(0, 10))}
        inputMode="numeric"
        autoComplete="tel-national"
        placeholder="98765 43210"
        autoFocus
        error={phone.length === 10 && !valid ? "Indian mobile numbers start with 6, 7, 8 or 9" : send.error?.message}
        why="Used to sign in and for transaction alerts. Never shared for marketing."
      />
      {showRef ? (
        <Field label="Referral or partner code" value={referral} onChange={(e) => setReferral(e.target.value.toUpperCase())} placeholder="e.g. RH-PRIYA" why="Credits the person who invited you. Optional." />
      ) : (
        <Button variant="link" onClick={() => setShowRef(true)}>
          Have a referral code? →
        </Button>
      )}
      <div className="space-y-3">
        <Button type="submit" block disabled={!valid} loading={send.isPending}>
          Send code
        </Button>
        <p className="text-center text-xs text-rfin-mute">By continuing you agree to RFIN&apos;s Terms and Privacy Policy.</p>
      </div>
    </form>
  );
}
