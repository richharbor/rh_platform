'use client'

import { Button } from "@/components/ui/button";
import EliteImg from '@/public/images/Elite.png';
import { Boxes } from "@/components/ui/background-boxes";
import Image from "next/image";


export default function EliteClub(){
    return (
        <section className=" rounded-2xl h-full mx-auto w-full lg:max-w-screen-xl px-5 lg:px-20 py-20 max-md:py-14 bg-muted/30 relative overflow-hidden">
          <div className="absolute inset-0 w-full h-full bg-slate-900 z-20 [mask-image:radial-gradient(transparent,white)] pointer-events-none" />
          <Boxes />
            <div className='flex max-md:flex-col-reverse gap-20 max-md:gap-3'>
                <div className='flex justify-center'>
                    <Image src={EliteImg} alt="eliteClub" className="size-96 max-md:size-64 relative z-10" />
                </div>


                <div className="flex items-center justify-center">
                    <div className='flex flex-col gap-5 max-md:items-center'>
                        <h1 className='font-batman text-2xl relative z-10 w-fit max-md:text-center md:text-3xl lg:text-4xl font-medium !leading-tight text-transparent bg-clip-text bg-gradient-to-b from-foreground to-neutral-400'>
                           Join the <span className="bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">Elite Circle</span>
                        </h1>
                        <p className='relative z-10 text-sm max-sm:text-center md:text-base lg:text-lg text-muted-foreground max-w-2xl mx-auto'>
                            Unlock entry into an exclusive network of visionary investors with priority access to India’s first tech-powered marketplace for unlisted shares. Where ambition turns into opportunity, and you gain unmatched pricing, seamless transactions, and premium deals—all crafted to accelerate your wealth.
                        </p>

                        <Button className='w-fit relative z-10'>Reserve access</Button>
                    </div>
                </div>
                

            </div>
          
        </section>
    )
}