import React from 'react'
import { motion } from "framer-motion";
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { BadgeIndianRupee, BanknoteArrowDown, Handshake, LineChart, PackageCheck, Sprout } from 'lucide-react';
import { Highlight } from '@/components/ui/hero-highlight';
import { CometCard } from "@/components/ui/comet-card";
import { useRouter } from 'next/navigation';
import { title } from 'process';



const cards = [
    {
        title: 'Unlisted Shares',
        icon: <LineChart className='size-10 group-hover:text-black max-sm:size-8' />,
        href: '/#hot-ipo'
    },
    {
        title: 'PreIPO | Unicorns',
        icon: <PackageCheck className='size-10 group-hover:text-black' />,
        href: '/coming-soon'
    },
    {
        title: 'SME IPO',
        icon: <Sprout className='size-10 group-hover:text-black' />,
        href: '/coming-soon'
    },
    {
        title: 'Angel Investing',
        icon: <BadgeIndianRupee className='size-10 group-hover:text-black' />,
        href: '/coming-soon'
    },

]

export default function OurProduct() {

    const route = useRouter();



    return (
        <section className="max-w-7xl rounded-2xl h-full mx-auto w-full px-4 lg:px-20 md:py-20 py-5 bg-muted/30 relative overflow-hidden">
            <div className="absolute inset-0 -z-10 h-full w-full bg-black bg-[linear-gradient(to_right,#1f1f1f_1px,transparent_1px),linear-gradient(to_bottom,#1f1f1f_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_80%_50%_at_50%_50%,#000_40%,transparent_100%)] rounded-lg"></div>
            <div className='flex flex-col justify-center items-center gap-10 max-md:gap-12'>
                <div>
                    <motion.div
                        initial={{
                            opacity: 0,
                            y: 20,
                        }}
                        whileInView={{
                            opacity: 1,
                            y: [20, -5, 0],
                        }}
                        viewport={{ once: true }}
                        transition={{
                            duration: 0.5,
                            ease: [0.4, 0.0, 0.2, 1],
                        }}
                        className='flex flex-col gap-5 items-center'

                    >
                        {/* <h1 className='text-3xl max-md:text-center md:text-4xl lg:text-5xl font-medium !leading-tight text-transparent bg-clip-text bg-gradient-to-b from-foreground to-neutral-400'>
                            Indian Private Markets At Your <span className='bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent'>Fingertips</span>
                        </h1> */}
                        <motion.h2
                            
                            className="text-2xl font-batman text-center max-md:text-center md:text-4xl lg:text-5xl font-normal !leading-tight text-transparent bg-clip-text bg-gradient-to-b from-foreground to-neutral-400 "
                        >
                            Indian Private Markets At Your{" "}
                            <Highlight className="text-black dark:text-white">
                                Fingertips.
                            </Highlight>
                        </motion.h2>
                        <p className='text-sm text-center md:text-base lg:text-lg text-white/80 max-w-2xl mx-auto'>
                            As your premier destination, we provide curated access to a diverse portfolio of private market opportunities, including high-growth startups, SMEs, exclusive pre-IPO placements, and Unicorn investments.
                        </p>

                        <Button className='w-fit'>Get Started</Button>
                    </motion.div>
                </div>
                <div className='grid grid-cols-4 min-h-[8rem] gap-5 w-full max-md:grid-cols-2'>

                    {cards.map((item, idx) => (
                        <motion.div
                            initial={{ opacity: 0, y: 50 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{
                                duration: 0.5,
                                ease: 'easeInOut',
                                delay: idx * 0.1,
                            }}
                            key={idx}
                        >
                            <CometCard rotateDepth={6} translateDepth={10} >
                                <div
                                    onClick={() => route.push(item.href)}
                                    className='bg-card cursor-pointer h-[8rem] max-sm:h-[6rem] rounded-xl flex gap-3 justify-center items-center py-3 px-5 max-sm:px-5 group hover:bg-rich-violet  transition-all duration-300 ease-in-out '
                                >
                                    {item.icon}
                                    <h2 className='font-bold max-md:font-normal group-hover:text-black '>{item.title}</h2>
                                </div>
                            </CometCard>
                        </motion.div>
                    ))}
                </div>

            </div>

        </section>
    )
}