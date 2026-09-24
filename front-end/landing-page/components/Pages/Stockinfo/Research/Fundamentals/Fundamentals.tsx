import { motion } from 'framer-motion'
export default function Fundamentals() {
    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, ease: 'easeInOut' }}
            className="bg-transparent font-sans">
            <h2 className=" text-3xl mb-6 max-md:text-xl">Fundamentals</h2>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-10">
                <div>
                    <p className="text-white/50 text-sm mb-1">Current Price</p>
                    <p className="text-xl max-sm:text-lg ">₹195</p>
                </div>
                <div>
                    <p className="text-white/50 text-sm mb-1">Market Cap</p>
                    <p className="text-xl max-sm:text-lg ">₹7,398.79 Cr</p>
                </div>
                <div>
                    <p className="text-white/50 text-sm mb-1">ISIN</p>
                    <p className="text-xl max-sm:text-lg ">INE852S01026</p>
                </div>
                <div>
                    <p className="text-white/50 text-sm mb-1">Face Value</p>
                    <p className="text-xl max-sm:text-lg ">₹0.10</p>
                </div>
                <div>
                    <p className="text-white/50 text-sm mb-1">P/E Ratio</p>
                    <p className="text-xl max-sm:text-lg ">36.04</p>
                </div>
                <div>
                    <p className="text-white/50 text-sm mb-1">EPS</p>
                    <p className="text-xl max-sm:text-lg ">5.41</p>
                </div>
                <div>
                    <p className="text-white/50 text-sm mb-1">P/B Ratio</p>
                    <p className="text-xl max-sm:text-lg ">14.03</p>
                </div>
                <div>
                    <p className="text-white/50 text-sm mb-1">Book Value</p>
                    <p className="text-xl max-sm:text-lg ">13.9</p>
                </div>
                <div>
                    <p className="text-white/50 text-sm mb-1">Debt / Equity Ratio</p>
                    <p className="text-xl max-sm:text-lg">0</p>
                </div>
            </div>
        </motion.div>
    )
}