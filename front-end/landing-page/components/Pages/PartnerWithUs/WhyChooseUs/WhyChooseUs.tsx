import { CometCard } from "@/components/ui/comet-card";
import { Globe, Headset, IndianRupee, ShieldCheckIcon } from "lucide-react";
import { motion } from 'framer-motion';



const cardContent = [
    {
        title: "Expand Your Reach",
        content: "Get access to a wide investor base actively looking for Pre-IPOs and unlisted opportunities.",
        icon: <Globe className="w-full h-full text-rich-violet" />
    },
    {
        title: "Trusted Platform",
        content: "Backed by transparent processes, secure transactions, and verified listings.",
        icon: <ShieldCheckIcon className="w-full h-full text-rich-violet" />
    },
    {
        title: "Revenue Opportunities",
        content: "Earn commissions, grow your network, and scale your business with us.",
        icon: <IndianRupee className="w-full h-full text-rich-violet" />
    },
    {
        title: "Dedicated Support",
        content: "A partner-first approach with personalized onboarding and ongoing assistance.",
        icon: <Headset className="w-full h-full text-rich-violet" />
    },
]

export default function WhyChooseUs() {
    return (
        <div className="max-w-7xl relative mx-auto flex flex-col items-center gap-10 py-20 max-md:py-5 ">
            <motion.h2
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount:0.5 }}
                transition={{ duration: 0.3, ease: 'easeInOut' }}
                className="text-2xl font-batman mx-20 max-sm:mx-5 md:text-4xl text-center lg:text-5xl font-medium !leading-tight text-transparent bg-clip-text bg-gradient-to-b from-foreground to-neutral-400"
            >Why Partner With Us?</motion.h2>
            <div className="grid grid-cols-4 gap-5 z-10 max-md:grid-cols-2 max-sm:grid-cols-1 ">
                {cardContent.map((item, index) => (
                    <motion.div
                        key={index}
                        initial={{ opacity: 0, y: 50 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true, amount: 0.5 }}
                        transition={{ duration: 0.3, ease: 'easeInOut', delay: index * 0.1 }}
                    >
                        <CometCard rotateDepth={6} translateDepth={10} key={index} className="">
                            <div className="bg-card rounded-xl h-[16rem] max-sm:h-[14rem] max-lg:h-[20rem] flex flex-col items-center gap-3 px-2 py-5">
                                <div className="size-16">
                                    {item.icon}
                                </div>
                                <h2 className="text-xl font-bold max-sm:text-normal text-center">{item.title}</h2>
                                <p className="text-center text-white/50 max-sm:text-sm">{item.content}</p>
                            </div>
                        </CometCard>
                    </motion.div>
                ))}
            </div>
        </div>
    )
}