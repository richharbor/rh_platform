'use Client'
import { useState } from "react";
import AboutSection from "./AboutCom/AboutCom";
import Fundamentals from "./Fundamentals/Fundamentals";
import TradingViewWidget from "./StockChart/StockChart";
import SWsection from "./Strength&Weakness/Strength&Weakness";
import { motion } from "framer-motion";

export default function Research(){

    const [page, setPage] = useState<string>('fundamentals');


    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, ease:'easeInOut' }} 
            
        className="flex items-center gap-10 flex-col py-10 px-20 max-md:px-0">
            <div className="w-full flex items-center justify-center">
                <TradingViewWidget />
            </div>
            <div className="flex w-full gap-5 max-sm:gap-2 border-b">
                <button onClick={()=> setPage('fundamentals')} className={`border-b px-3 py-2 ${page === 'fundamentals'?'border-rich-violet':'cursor-pointer'} `}>Fundamentals</button>
                <button onClick={()=> setPage('strength&weakness')} className={`border-b px-3 py-2 ${page === 'strength&weakness'?'border-rich-violet':'cursor-pointer'}`}>Strength & Weakness</button>
                <button onClick={()=> setPage('about')} className={`border-b px-3 py-2 ${page === 'about'?'border-rich-violet':'cursor-pointer'}`}>About Co.</button>
            </div>
            
            {/* <Fundamentals />
            <SWsection />
            <AboutSection /> */}
            <div className="w-full">
                {page === 'fundamentals' && <Fundamentals />}
                {page === 'strength&weakness' && <SWsection />}
                {page === 'about' && <AboutSection />}
            </div>
        </motion.div>
    )
}