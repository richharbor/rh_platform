'use client'
import { useEffect, useState } from "react";
import MobileNumberPage from "../SignUp/MobileNumber/MobileNumber";
import OTPpage from "../SignUp/OTPpage/OTPpage";
import { useRouter } from "next/navigation";
import { LucideLoader, LucideLoader2 } from "lucide-react";

export default function Login() {
    const [mobileNumber, setMobileNumber] = useState<string>("");
    const [mobileNumberSubmitted, setMobileNumberSubmitted] = useState<boolean>(false);
    const [mOTPVerified, setMOTPVerified] = useState<boolean>(false);
    const [step, setStep] = useState<number>(1);

    const route = useRouter();


    useEffect(()=>{
        if(step === 3){
            console.log("login page"+mobileNumber)
            route.push("/")
        }
    },[mOTPVerified])

    if(mOTPVerified){
        return (
            <div className="min-h-screen flex justify-center items-center">
                <div>
                    <LucideLoader2 className="size-20 animate-spin" />
                </div>
            </div>
        )
    }


    return (
        <div className="mt-10 min-h-screen md:w-5xl mx-auto flex justify-center px-20 max-sm:px-5 items-center">
            <div className="w-full grid grid-cols-2 max-sm:grid-cols-1 overflow-hidden  rounded-2xl">
                <div className="w-full h-[500px] max-sm:hidden">
                    <img src="https://aicdn.picsart.com/539db9a4-2449-42a0-b6c9-35b6df9e2fca.png" alt="auth-img" className="object-cover h-full w-full" />
                </div>
                {(step === 1) && <MobileNumberPage
                    mobileNumber={mobileNumber}
                    setMobileNumber={setMobileNumber}
                    setStep={setStep}
                />}
                {(step === 2) && <OTPpage page="mobile" data={mobileNumber} setStep={setStep} />}
                

            </div>
        </div>
    )
}