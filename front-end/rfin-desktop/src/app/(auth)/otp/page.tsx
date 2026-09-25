"use client";
import { useMutation } from "@tanstack/react-query";
import { useSearchParams } from "next/navigation";
import { Suspense, useEffect, useRef, useState } from "react";
import { api, track } from "@/lib/api";
import { useSession } from "@/stores/session";
import { useToast } from "@/components/toast";
import { Button, PageTitle, Stepper } from "@/components/ui";
import { cn } from "@/lib/cn";

const LEN = 6;

function Otp() {
  const q = useSearchParams();
  const phone = q.get("phone") ?? "";
  const referral = q.get("referral") ?? "";
  const toast = useToast();
  const signedIn = useSession((s) => s.signedIn);
  const [requestId, setRequestId] = useState(q.get("requestId") ?? "");
  const [code, setCode] = useState("");
  const [left, setLeft] = useState(Number(q.get("resendInSec") ?? 30));
  const input = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (left <= 0) return;
    const t = setTimeout(() => setLeft((n) => n - 1), 1000);
    return () => clearTimeout(t);
  }, [left]);

  const verify = useMutation({
    mutationFn: (c: string) => api("auth.verifyOtp", { requestId, code: c, referralCode: referral || undefined }),
    onSuccess: ({ token, customer, isNew }) => {
      track("otp_completed", { isNew });
      if (referral) track("referral_source", { code: referral });
      signedIn({ token, customer });
    },
    onError: () => setCode(""),
  });

  const resend = useMutation({
    mutationFn: () => api("auth.sendOtp", { phone }),
    onSuccess: (r) => {
      setRequestId(r.requestId);
      setLeft(r.resendInSec);
      toast("New code sent", "info");
    },
  });

  return (
    <div className="space-y-8">
      <Stepper steps={["Mobile", "Verify"]} current={1} />
      <PageTitle title="Enter the code" lede={`Sent to +91 ${phone.slice(0, 5)} ${phone.slice(5)}.`} />
      <div className="relative" onClick={() => input.current?.focus()}>
        <div className="grid grid-cols-6 gap-2" aria-hidden>
          {Array.from({ length: LEN }).map((_, i) => (
            <div
              key={i}
              className={cn(
                "grid aspect-[0.82] place-items-center rounded-xl border font-display text-3xl",
                verify.isError ? "border-rfin-red" : i === code.length && !verify.isPending ? "border-2 border-rfin-text" : "border-rfin-line/15",
              )}
            >
              {code[i] ?? ""}
            </div>
          ))}
        </div>
        <input
          ref={input}
          aria-label="One-time code"
          value={code}
          onChange={(e) => {
            const c = e.target.value.replace(/\D/g, "").slice(0, LEN);
            setCode(c);
            if (c.length === LEN) verify.mutate(c);
          }}
          inputMode="numeric"
          autoComplete="one-time-code"
          autoFocus
          className="absolute inset-0 opacity-0"
        />
      </div>
      {verify.isError ? <p className="-mt-4 text-xs text-rfin-red">{verify.error.message}</p> : null}
      {verify.isPending ? <p className="-mt-4 font-mono text-[11px] text-rfin-mute">VERIFYING…</p> : null}
      <div className="flex items-center justify-between">
        <span className="text-[13px] text-rfin-mute">Didn&apos;t get it?</span>
        {left > 0 ? (
          <span className="font-mono text-xs text-rfin-mute">Resend in 0:{String(left).padStart(2, "0")}</span>
        ) : (
          <Button variant="link" loading={resend.isPending} onClick={() => resend.mutate()}>
            Resend code
          </Button>
        )}
      </div>
      <p className="text-xs text-rfin-mute">Mock: any 6 digits work except 000000. 98765 43210 is an existing account.</p>
    </div>
  );
}

export default function OtpPage() {
  return (
    <Suspense>
      <Otp />
    </Suspense>
  );
}
