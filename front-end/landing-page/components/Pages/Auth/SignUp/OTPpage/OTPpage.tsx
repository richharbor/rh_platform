"use client";

import React, { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import axios from "axios";
import { Loader2 } from "lucide-react";
import { useAuthStore } from "@/store/authStore.js";




interface OTPPageProps {
  page: string;
  data: string;
  setStep: React.Dispatch<React.SetStateAction<number>>;
}

export default function OTPpage({ page, data, setStep }: OTPPageProps) {
  console.log("otp page" + data)
  const [code, setCode] = useState<string[]>(["", "", "", ""]);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const route = useRouter();
  const { verifyOTP, authUser } = useAuthStore();


  const handleChange = (index: number, value: string) => {
    const newCode = [...code];

    if (value.length > 1) {
      const pastedCode = value.slice(0, 6).split("");
      for (let i = 0; i < 4; i++) {
        newCode[i] = pastedCode[i] || "";
      }
      setCode(newCode);

      const lastFilledIndex = newCode.findLastIndex((digit) => digit !== "");
      const focusIndex = lastFilledIndex < 3 ? lastFilledIndex + 1 : 3;
      inputRefs.current[focusIndex]?.focus();
    } else {
      newCode[index] = value;
      setCode(newCode);

      if (value && index < 3) {
        inputRefs.current[index + 1]?.focus();
      }
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace" && !code[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement> | Event) => {
    e.preventDefault();
    setLoading(true);
    const verificationCode = code.join("");

    try {
      const response = await verifyOTP(data, verificationCode, page);

      if (response) {
        console.log("OTP => "+authUser);
        route.push("/");
      } else {
        setStep((pre) => pre + 1);
      }

    } catch (error) {

    }

    setLoading(false);



  };

  useEffect(() => {
    if (code.every((digit) => digit !== "")) {
      handleSubmit(new Event("submit"));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [code]);

  return (
    <div className="px-10 py-10 flex flex-col gap-5 max-sm:px-0">

      <h2 className="text-4xl max-md:text-3xl max-sm:text-2xl font-bold">
        Verify Your {page === 'email' ? "Email" : "Number"}
      </h2>
      <p className="text-gray-300 mb-6">
        Enter the 4-digit code sent to *****{page === 'email' ? data.slice(-13) : data.slice(-4)} <button className="underline" onClick={() => setStep((pre) => pre - 1)}>{page === 'email' ? 'change email' : 'change number'}</button>
      </p>
      <form onSubmit={handleSubmit} autoComplete="off" className="space-y-6">
        <div className="flex justify-between">
          {code.map((digit, index) => (
            <input
              key={index}
              ref={(el: any) => (inputRefs.current[index] = el)}
              type="number"
              maxLength={1}
              value={digit}
              autoComplete="off"
              onChange={(e) => handleChange(index, e.target.value)}
              onKeyDown={(e) => handleKeyDown(index, e)}
              className="w-12 h-12 text-center text-2xl font-bold bg-gray-700 text-white border-2 border-gray-500 rounded-lg  focus:outline-none appearance-none [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none [&::-moz-inner-spin-button]:appearance-none"
            />
          ))}
        </div>
        <Button

        >
          {loading ? <Loader2 className="animate-spin" /> : "Verify"}
        </Button>
      </form>

    </div>
  );
}
