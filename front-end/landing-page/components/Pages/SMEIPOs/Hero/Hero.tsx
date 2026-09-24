"use client";

import { Button } from "@/components/ui/button";
import { ArrowRight, Bell } from "lucide-react";
import Link from "next/link";

export default function SmeIpoHero() {
  return (
    <section className="relative w-full bg-gradient-to-br from-indigo-600 via-indigo-500 to-purple-600 text-white py-20 px-6 md:px-12 lg:px-20 shadow-lg overflow-hidden">
      {/* Background Glow */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent" />

      <div className="relative max-w-4xl mx-auto text-center">
        <h1 className="text-3xl md:text-5xl font-batman font-bold leading-tight mb-4">
          SME IPOs: Gateway to High-Potential Companies
        </h1>
        <p className="text-lg md:text-xl text-indigo-100 mb-8">
          Explore upcoming and ongoing SME IPOs listed on NSE Emerge and BSE SME. 
          Get early access to promising businesses before they enter the main market.
        </p>

        <div className="flex justify-center gap-4 flex-wrap">
          <Link href='#filter-search'>
          <Button
            size="lg"
            className="bg-white text-indigo-600 hover:bg-indigo-100 font-semibold"
            
          >
            <ArrowRight className="mr-2 h-5 w-5" /> View Upcoming IPOs
          </Button>
          </Link>

          {/* <Button
            size="lg"
            variant="outline"
            className="border-white text-white hover:bg-white/10"
          >
            <Bell className="mr-2 h-5 w-5" /> Get Alerts
          </Button> */}
        </div>
      </div>
    </section>
  );
}
