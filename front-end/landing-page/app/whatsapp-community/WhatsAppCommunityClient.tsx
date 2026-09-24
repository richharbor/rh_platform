"use client";

import { motion } from "framer-motion";
import { ArrowRight, MessageCircle, TrendingUp, ShieldCheck, Zap, Coins, Building } from "lucide-react";
import { Button } from "@/components/ui/button";

const communities = [
    {
        id: 1,
        name: "Unlisted Shares Network",
        description: "Get exclusive access to pre-IPO opportunities and daily price updates for top unlisted companies.",
        icon: TrendingUp,
        color: "bg-blue-500/10 text-blue-600",
        link: "https://chat.whatsapp.com/GltIpxF5emI5PIwiD22VCD" // Placeholder link
    },
    {
        id: 2,
        name: "Loans Community",
        description: "Stay updated on the lowest interest rates for Personal, Home, and Business loans.",
        icon: Coins,
        color: "bg-green-500/10 text-green-600",
        link: "https://chat.whatsapp.com/KCpcv6Ic05k8dCVWNwtCY0"
    },
    {
        id: 3,
        name: "Insurance Insights",
        description: "Expert tips on Life, Health, and General Insurance. Decode policies and find the best coverage.",
        icon: ShieldCheck,
        color: "bg-indigo-500/10 text-indigo-600",
        link: "https://chat.whatsapp.com/Ft4ynhxP8gJEqYXd2WG7YC"
    }
];

export default function WhatsAppCommunityClient() {
    return (
        <div className="min-h-screen bg-background py-20 px-4 md:px-6">
            <div className="max-w-4xl mx-auto">
                <div className="text-center mb-16">
                    <motion.div
                        initial={{ scale: 0.5, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        transition={{ duration: 0.5 }}
                        className="inline-flex items-center justify-center p-3 bg-[#25D366]/10 rounded-full mb-6"
                    >
                        <MessageCircle className="w-10 h-10 text-[#25D366]" />
                    </motion.div>

                    <motion.h1
                        initial={{ y: 20, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        transition={{ delay: 0.2 }}
                        className="text-4xl md:text-5xl font-bold tracking-tight mb-4"
                    >
                        Join Our Exclusive Communities
                    </motion.h1>

                    <motion.p
                        initial={{ y: 20, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        transition={{ delay: 0.3 }}
                        className="text-lg text-muted-foreground max-w-2xl mx-auto"
                    >
                        Connect with like-minded investors and get real-time financial updates delivered straight to your WhatsApp.
                    </motion.p>
                </div>

                <div className="grid gap-6">
                    {communities.map((community, index) => (
                        <motion.div
                            key={community.id}
                            initial={{ x: -20, opacity: 0 }}
                            animate={{ x: 0, opacity: 1 }}
                            transition={{ delay: 0.4 + index * 0.1 }}
                            whileHover={{ scale: 1.02 }}
                            className="group bg-card hover:bg-accent/5 border border-border rounded-xl p-6 flex flex-col md:flex-row items-center gap-6 transition-all shadow-sm hover:shadow-md"
                        >
                            <div className={`w-16 h-16 rounded-2xl flex items-center justify-center shrink-0 ${community.color}`}>
                                <community.icon className="w-8 h-8" />
                            </div>

                            <div className="flex-1 text-center md:text-left">
                                <h3 className="text-xl font-bold mb-2">{community.name}</h3>
                                <p className="text-muted-foreground text-sm">{community.description}</p>
                            </div>

                            <Button
                                asChild
                                className="rounded-full bg-[#25D366] hover:bg-[#128C7E] text-white shrink-0 min-w-[140px]"
                            >
                                <a href={community.link} target="_blank" rel="noopener noreferrer">
                                    Join Now <ArrowRight className="ml-2 w-4 h-4" />
                                </a>
                            </Button>
                        </motion.div>
                    ))}
                </div>
            </div>
        </div>
    );
}
