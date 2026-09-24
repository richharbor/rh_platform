import biraIcon from '@/public/images/bira91.webp'
import boatIcon from '@/public/images/boat.webp'
import capgeminiIcon from '@/public/images/capgemini.webp'
import mseIcon from '@/public/images/mse.png'
import nseIcon from '@/public/images/NSE.png'
import oyoIcon from '@/public/images/oyo.png'
import peIcon from '@/public/images/pe.webp'
import tapariaIcon from '@/public/images/taparia.webp'

import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/Avatar";
import { useEffect, useState } from 'react';
import UnlistedShareEnquiryDialog from "@/components/Common/components/UnlistedShareEnquiryDialog";
import { motion } from 'framer-motion';
import { getShares } from '@/services/shareServices';
import { Skeleton } from "@/components/ui/skeleton";

type Stock = {
    name: string
    sector: string
    symbol: string
    price: string | number
}

export default function HotSelling() {
    const route = useRouter();
    const [open, setOpen] = useState(false)
    const [shares, setShares] = useState<any[]>([])
    const [loading, setLoading] = useState(true);
    const [selectedStock, setSelectedStock] = useState<Stock | null>(null)


    useEffect(() => {
        fetchShares();
    }, [])

    const fetchShares = async () => {
        try {
            const data = await getShares();
            setShares(data);
        } catch (error) {
            console.log(error);
        } finally {
            setLoading(false);
        }
    }

    const handleOpenDialog = (item: Stock) => {
        setSelectedStock(item)
        setOpen(true)
    }

    const showViewAll = shares.length > 6;
    const displayedShares = showViewAll ? shares.slice(0, 5) : shares;

    return (
        <section id='hot-ipo' className="max-w-7xl mx-auto py-20 overflow-hidden max-sm:py-10">
            <div className="container mx-auto">
                <div className="flex flex-col items-center lg:gap-10">
                    <motion.div
                        initial={{ opacity: 0, y: 50 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true, amount: 0.5 }}
                        transition={{ duration: 0.3, ease: 'easeInOut' }}
                    >
                        <h2 className="text-3xl font-batman md:text-4xl text-center lg:text-5xl font-medium !leading-tight text-transparent bg-clip-text bg-gradient-to-b from-foreground to-neutral-400">
                            Hot IPO’s on the Rise
                        </h2>

                        <p className="text-white/50 mt-4 text-lg text-center">
                            Explore the most in-demand equities and make informed trading decisions.
                        </p>
                    </motion.div>
                    <div
                        className="grid grid-cols-3 max-sm:px-4 gap-5 md:gap-10 max-lg:grid-cols-3 max-md:grid-cols-2 max-sm:grid-cols-1 max-sm:mt-5"
                    >
                        {loading ? (
                            Array.from({ length: 6 }).map((_, index) => (
                                <div
                                    key={index}
                                    className="z-10 bg-card border border-white/10 rounded-3xl p-6 min-w-[250px] md:min-w-[300px] flex-shrink-0"
                                >
                                    <div className="flex justify-center h-32 max-sm:h-28 items-center">
                                        <Skeleton className="h-24 w-24 rounded-3xl" />
                                    </div>
                                    <Skeleton className="h-8 w-3/4 mt-6 rounded-lg" />
                                    <div className="flex justify-between gap-4 mt-3">
                                        <div className="w-full">
                                            <Skeleton className="h-4 w-1/2 rounded-lg" />
                                            <Skeleton className="h-4 w-3/4 mt-1 rounded-lg" />
                                        </div>
                                        <div className="w-full flex flex-col items-end">
                                            <Skeleton className="h-4 w-1/2 rounded-lg" />
                                            <Skeleton className="h-4 w-3/4 mt-1 rounded-lg" />
                                        </div>
                                    </div>
                                </div>
                            ))
                        ) : shares.length === 0 ? (
                            <div className="col-span-full min-h-[200px] flex items-center justify-center">
                                <p className="text-xl text-white/50 font-medium">No share available now</p>
                            </div>
                        ) : (
                            <>
                                {displayedShares.map((item, index) => (
                                    <motion.div
                                        initial={{ opacity: 0, y: 50 }}
                                        whileInView={{ opacity: 1, y: 0 }}
                                        viewport={{ once: true, amount: 0.5 }}
                                        transition={{ duration: 0.3, ease: 'easeInOut' }}
                                        key={index}
                                        className="z-10 bg-card group/items cursor-pointer ease-in-out hover:border-rich-violet transition-all duration-200 border border-white/10 rounded-3xl p-6 min-w-[250px] md:min-w-[300px] flex-shrink-0"
                                        onClick={() => handleOpenDialog(item)}
                                    >
                                        <div className="flex justify-center h-32 max-sm:h-28 items-center">
                                            <Avatar className="h-24 w-24 rounded-3xl group-hover/items:scale-85 transition-all duration-500 ease-in-out bg-transparent">
                                                <AvatarImage
                                                    src={item.symbol}
                                                    alt={`${item.name}-icon`}
                                                    className="object-contain"
                                                />
                                                <AvatarFallback className="rounded-3xl text-2xl font-bold bg-neutral-800 text-white">
                                                    {item.name?.substring(0, 2).toUpperCase()}
                                                </AvatarFallback>
                                            </Avatar>
                                        </div>
                                        <h3 className="text-2xl max-sm:text-xl mt-6 truncate" title={item.name}>
                                            {item.name}
                                        </h3>
                                        <div className="flex justify-between items-end mt-3">
                                            <div>
                                                <p className="text-white/30 text-sm">Sector</p>
                                                <p className="text-white/50 mt-1">
                                                    {item.sector}
                                                </p>
                                            </div>
                                            <div className="text-right">
                                                <p className="text-white/30 text-sm">Price</p>
                                                <p className="text-white/50 mt-1">
                                                    ₹{item.price}
                                                </p>
                                            </div>
                                        </div>
                                    </motion.div>
                                ))}

                                {showViewAll && (
                                    <motion.div
                                        initial={{ opacity: 0, y: 50 }}
                                        whileInView={{ opacity: 1, y: 0 }}
                                        viewport={{ once: true, amount: 0.5 }}
                                        transition={{ duration: 0.3, ease: 'easeInOut' }}
                                        className="z-10 bg-card group/items cursor-pointer ease-in-out hover:border-rich-violet transition-all duration-200 border border-white/10 rounded-3xl p-6 min-w-[250px] flex-shrink-0 flex flex-col justify-center items-center min-h-[300px]"
                                        onClick={() => route.push("/allstocks")}
                                    >
                                        <div className="w-20 h-20 rounded-full bg-white/5 flex items-center justify-center group-hover/items:bg-rich-violet/20 transition-all duration-300">
                                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-8 h-8 group-hover/items:text-rich-violet transition-all duration-300">
                                                <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5 21 12m0 0-7.5 7.5M21 12H3" />
                                            </svg>
                                        </div>
                                        <h3 className="text-2xl max-sm:text-xl mt-6 font-medium">
                                            View All
                                        </h3>
                                        <p className="text-white/50 mt-2 text-center text-sm">
                                            Explore all available stocks
                                        </p>
                                    </motion.div>
                                )}
                            </>
                        )}
                    </div>
                </div>

            </div>
            <UnlistedShareEnquiryDialog
                open={open}
                onOpenChange={setOpen}
                defaultShareName={selectedStock?.name}
            />
        </section>
    );
}