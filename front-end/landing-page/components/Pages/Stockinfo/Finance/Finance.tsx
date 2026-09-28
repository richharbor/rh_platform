import { FileText } from "lucide-react"
import { motion } from 'framer-motion'

const anualReport = [
    { title: 'FY24' },
    { title: 'FY23' },
    { title: 'FY22' },
    { title: 'FY21' },
    { title: 'FY20' },
    { title: 'FY19' },
    { title: 'FY18' },
]


export default function Finance() {

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, ease: 'easeInOut' }}
            className="flex gap-10 py-10 px-20 flex-wrap items-center justify-center">
            {anualReport.map((item, index) => (
                <div className="py-10 px-10 border flex flex-col items-center gap-3 rounded-xl hover:bg-white/20 transition-all duration-200 ease-in-out" key={index}>
                    <div className="">
                        <FileText />
                    </div>
                    <p className="flex whitespace-nowrap">Annual Report</p>
                    <p>{item.title}</p>
                </div>
            ))}
        </motion.div>
    )
}