"use client";
import { motion } from "framer-motion";

export default function ComingSoon() {
  return (
    <div className="flex items-center justify-center h-screen w-full relative overflow-hidden">
      
      {/* Animated Pulsing Circle Background */}
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: [1, 1.2, 1] }}
        transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
        className="absolute w-96 h-96 bg-white/10 rounded-full blur-3xl"
      />

      {/* Content */}
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1.2, ease: "easeOut" }}
        className="relative z-10 text-center"
      >
        <h1 className="text-5xl font-batman md:text-7xl font-extrabold text-white drop-shadow-lg">
          Coming Soon 🚀
        </h1>
        <p className="mt-6 text-xl md:text-2xl text-white/90 font-light">
          Good things take time. Almost there.
        </p>

        {/* Animated Button */}
        {/* <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.95 }}
          className="mt-10 px-8 py-3 rounded-2xl bg-white text-indigo-700 font-semibold shadow-lg hover:bg-indigo-100 transition-all"
        >
          Notify Me
        </motion.button> */}
      </motion.div>
    </div>
  );
}
