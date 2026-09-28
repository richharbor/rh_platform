'use client'

import { Bookmark } from "lucide-react";
import Image from "next/image";
import nseIcon from '@/public/images/NSE.png'
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { motion } from "framer-motion";

export default function News() {

    const [count, setCount] = useState<number>(1);
    const [newsState, setNewsState] = useState<string>("all");

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, ease: 'easeInOut' }}
            className="flex flex-col gap-10 px-20 py-10 max-lg:px-5 max-md:px-5">
            <div>
                <div className="flex gap-5 p-2 bg-white/10 rounded-lg w-fit">
                    <button onClick={() => setNewsState('all')} className={`px-3 py-2 rounded-lg ${newsState === 'all' ? 'bg-white/30' : 'hover:bg-white/20'} `} >All News</button>
                    <button onClick={() => setNewsState('bookmarks')} className={`px-3 py-2 rounded-lg ${newsState === 'bookmarks' ? 'bg-white/30' : 'hover:bg-white/20'}  `}>Your Bookmarks</button>
                </div>
            </div>


            <div className="grid grid-cols-2 max-sm:grid-cols-1 gap-10 max-lg:gap-5">
                {Array.from({ length: 2 * count }).map((_, i) => (
                    <div key={i} onClick={() => console.log("clicked")} className="bg-[#0c0f1a] border border-white/10 rounded-2xl px-10 py-10 max-md:px-5 flex flex-col gap-3 w-fit text-white relative hover:border-rich-violet transition-all duration-200 ease-in-out cursor-pointer">
                        {/* Header */}
                        <div className="flex items-center gap-3">
                            <Image
                                src={nseIcon} // replace with your logo path
                                alt="NSE Logo"
                                className="rounded-md h-auto w-16 max-md:w-10 max-sm:w-16"
                            />
                            <div className="flex flex-col text-sm">
                                <span className="font-normal text-2xl max-md:text-lg">National Stock Exchange (NSE)</span>
                                <span className="text-white/60">Unlisted Shares</span>
                            </div>

                            {/* Save Icon */}
                            <button className="ml-auto text-white/70 hover:text-white">
                                <Bookmark className="size-8" />
                            </button>
                        </div>

                        {/* Title */}
                        <h2 className="text-lg font-semibold leading-snug">
                            NSE introduces 20 pc lower price cap for SME IPO pre-open session from
                            Aug 4
                        </h2>

                        {/* Source */}
                        <span className="text-sm text-white/60">Msn</span>

                        {/* Footer */}
                        <div className=" flex justify-between items-center mt-15">
                            <div className="flex items-center gap-10 text-sm text-white/50">
                                <p>2 min read</p>
                                <p>31 Jul 2025</p>
                            </div>
                            <button className=" text-2xl px-3 py-1 bg-white/10 hover:bg-white/20 transition rounded-lg">
                                +
                            </button>
                        </div>

                        {/* Floating button (bottom right) */}

                    </div>
                ))}
            </div>
            <div className="w-full flex justify-center">
                <Button onClick={() => setCount(pre => pre + 1)} variant={"outline"}>View more</Button>
            </div>
        </motion.div>
    )
}