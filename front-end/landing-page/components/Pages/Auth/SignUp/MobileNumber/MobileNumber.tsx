'use client'

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import axios from "axios";
import { Loader2 } from "lucide-react";
import { useState } from "react";
import {useAuthStore} from '@/store/authStore.js'



interface MobileNumberPageProps {
    mobileNumber: string;
    setMobileNumber: React.Dispatch<React.SetStateAction<string>>;
    setStep: React.Dispatch<React.SetStateAction<number>>;
}

export default function MobileNumberPage({ mobileNumber, setMobileNumber, setStep }: MobileNumberPageProps) {
    const [loading, setLoading] = useState<boolean>(false);
    const {signupPhone, error} = useAuthStore();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try{
            await signupPhone(mobileNumber);
            setStep((pre) => pre + 1);
        }catch(error){
            console.log(error);
        }
        

        setLoading(false);
    };

    return (
        <div className="px-10 py-10 flex flex-col gap-5">
            <p className="text-white/50">Welcome to Rich Harbor!</p>
            <h1 className="text-4xl max-md:text-3xl max-sm:text-2xl font-bold ">Let's start with your mobile number</h1>
            {error && <p className="text-red-500 text-sm">{error}</p>}
            <form onSubmit={handleSubmit} className="flex flex-col gap-5">
                <div className="p-3 rounded-2xl border-2">
                    <input type="text"
                        inputMode="numeric"
                        pattern="[0-9]*"
                        maxLength={10} value={mobileNumber} onChange={(e) => setMobileNumber(e.target.value)} className="border-none outline-none w-full h-[40px] appearance-none [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none [&::-moz-inner-spin-button]:appearance-none" placeholder="Enter your Number" />
                </div>

                <div>
                    <Button type="submit">{loading ?<Loader2 className="animate-spin" /> :"Get OTP"  }</Button>
                </div>
            </form>
            <p className="text-white/50">By proceeding, I accept the <a href="#" className="underline"> Terms & Conditions</a>, and agree to receive messages</p>
        </div>
    )
}
