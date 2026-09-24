'use client'
import { useEffect, useState } from "react";
import EmailPage from "./EmailPage/EmailPage";
import MobileNumberPage from "./MobileNumber/MobileNumber";
import { number } from "motion/react";
import OTPpage from './OTPpage/OTPpage'
import { useRouter } from "next/navigation";
import { LucideLoader2 } from "lucide-react";



type FormData = {
    name: string;
    email: string;
};

export default function SignUp() {
    const [mobileNumber, setMobileNumber] = useState<string>("");
    const [formData, setFormData] = useState<FormData>({
        name: "",
        email: ""
    })
    const [mobileNumberSubmitted, setMobileNumberSubmitted] = useState<boolean>(false);
    const [mOTPVerified, setMOTPVerified] = useState<boolean>(false);
    const [emailSubmitted, setEmailSubmitted] = useState<boolean>(false);
    const [eOTPVerified, setEOTPVerified] = useState<boolean>(false);
    const [step , setStep] = useState<number>(1);
    const route = useRouter();


    useEffect(()=>{
        if(step === 5){
            console.log( {formData, mobileNumber})
            route.push("/");
        }
    },[step])

    if(step === 5){
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
                {(step == 2) && <OTPpage page = "mobile" data = {mobileNumber} setStep={setStep}/> }
                {(step == 3) && 
                <EmailPage
                 formData = {formData}
                 mobileNumber = {mobileNumber}
                 setFormData = {setFormData}
                 setStep = {setStep}
                />}
                {(step == 4)  &&
                    <OTPpage
                        page = "email"
                        data = {formData.email}
                        setStep={setStep}
                        
                    />
                }
                
            </div>
        </div>
    )
}