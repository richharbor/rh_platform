"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { ArrowRight, MessageCircle } from "lucide-react";

export default function WhatsAppBanner() {
    return (
        <div className="w-full px-4 md:px-6">
            <Link href="/whatsapp-community" className="block w-full relative z-10">
                <motion.div
                    whileHover={{ scale: 1.01 }}
                    whileTap={{ scale: 0.99 }}
                    className="w-full bg-[#128C7E] hover:bg-[#075E54] text-white py-3 md:py-4 px-4 rounded-xl flex flex-row items-center justify-center gap-2 md:gap-3 transition-colors shadow-lg cursor-pointer group"
                >
                    <MessageCircle className="w-5 h-5 md:w-6 md:h-6 animate-bounce shrink-0" />
                    <span className="font-semibold text-xs md:text-lg text-center">Join our exclusive WhatsApp Community for real-time deal flow</span>
                    <ArrowRight className="w-4 h-4 md:w-5 md:h-5 group-hover:translate-x-1 transition-transform shrink-0" />
                </motion.div>
            </Link>
        </div>
    );
}
