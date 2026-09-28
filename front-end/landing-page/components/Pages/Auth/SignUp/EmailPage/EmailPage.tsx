'use client'
import { Button } from "@/components/ui/button";
import { useAuthStore } from "@/store/authStore";
import axios from "axios";
import { Loader2 } from "lucide-react";
import { useState } from "react";

type FormData = {
    name: string;
    email: string;
};

export default function EmailPage({formData, setFormData, setStep, mobileNumber}:{formData:FormData, setFormData:React.Dispatch<React.SetStateAction<FormData>>, setStep:React.Dispatch<React.SetStateAction<number>>, mobileNumber:string}) {
    
    const [loading, setLoading] = useState<boolean>(false);
    const { signupEmail } = useAuthStore();

    const handleChange = (
        e: React.ChangeEvent<
            HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
        >
    ) => {
        const { name, value } = e.target;
        setFormData({
            ...formData,
            [name]: value,
        });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            await signupEmail(formData.name, formData.email, mobileNumber);
            
            setStep((pre)=> pre+1);

        } catch (error) {
            
        }
        
        

        setLoading(false);

        
    };


    return (
        <div className="px-10 py-10 flex flex-col gap-5 max-sm:px-0">

            <h1 className="text-4xl max-md:text-3xl max-sm:text-2xl font-bold ">Verify you email</h1>
            <form onSubmit={handleSubmit} className="flex flex-col gap-5">
                <div className="p-3 rounded-2xl border-2 ">
                    <input onChange={handleChange} name="name" autoComplete="off" className="border-none bg-background outline-none w-full h-[40px] " value={formData.name} type="text" placeholder="Enter your Name" />
                </div>
                <div className="p-3 rounded-2xl border-2 ">
                    <input onChange={handleChange} className="border-none outline-none w-full h-[40px] " name="email" value={formData.email} type="email" placeholder="Enter your Email" />
                </div>
                <div>
                    <Button type="submit">{loading ?<Loader2 className="animate-spin" /> :"Get OTP"  }</Button>
                </div>
            </form>
            <p className="text-white/50">By proceeding, I accept the <a href="#" className="underline"> Terms & Conditions</a>.</p>
        </div>
    )
}