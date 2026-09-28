"use client";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import biraIcon from '@/public/images/bira91.webp'
import boatIcon from '@/public/images/boat.webp'
import capgeminiIcon from '@/public/images/capgemini.webp'
import mseIcon from '@/public/images/mse.png'
import nseIcon from '@/public/images/NSE.png'
import oyoIcon from '@/public/images/oyo.png'
import peIcon from '@/public/images/pe.webp'
import tapariaIcon from '@/public/images/taparia.webp'
import Image from "next/image";


export default function TomorrowBigBets() {
  const items = [
    {
      name: "B9 Beverages (BIRA 91)",
      icon: biraIcon,
      sector: "FMCG",
    },
    {
      name: "Imagine Marketing (boAt)",
      icon: boatIcon,
      sector: "Consumer Durables",
    },
    {
      name: "API Holdings (Pharmeasy)",
      icon: peIcon,
      sector: "Healthcare",
    },
    {
      name: "Taparia Tools",
      icon: tapariaIcon,
      sector: "Manufacturing",
    },
    {
      name: "Oravel Stays (OYO Rooms)",
      icon: oyoIcon,
      sector: "Design",
    },
    {
      name: "Capgemini",
      icon: capgeminiIcon,
      sector: "Information Technology",
    }
  ];

  return (
    <section className="w-full text-white my-10 max-sm:px-4 rounded-2xl py-10 max-sm:py-10 shadow-lg overflow-hidden">
      {/* Title + Subtitle */}
      <div className="text-center mb-12 max-w-3xl mx-auto">
        <h2 className="text-3xl font-batman md:text-4xl text-center lg:text-5xl font-medium !leading-tight text-transparent bg-clip-text bg-gradient-to-b from-foreground to-neutral-400">
          Tomorrow’s Big Bets
        </h2>
        <p className="mt-3 text-gray-300 text-lg">
          Be among the first to invest in the IPOs shaping the future.
          Unlock opportunities before they hit the mainstream.
        </p>
      </div>

      {/* IPO Cards */}
      <div className="grid grid-cols-1 px-10 max-md:px-2 sm:grid-cols-2 md:grid-cols-3 gap-6">
        {items.map((ipo, idx) => (
          <Card
            key={idx}
            className="bg-card border z-10 border-gray-800 hover:border-rich-violet transition-all rounded-2xl shadow-lg hover:shadow-purple-500/20"
          >
            <CardContent className="px-6 flex flex-col gap-5 items-center text-center">
              <div className='h-24 max-sm:h-16 w-full flex justify-center items-center'>
                <Image src={ipo.icon} alt={ipo.name} className="h-full w-auto object-contain" />
              </div>
              <h3 className="text-xl font-semibold">{ipo.name}</h3>
              <p className="mt-2 text-gray-400 text-sm">{ipo.sector}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* CTA */}
      <div className="flex justify-center mt-12">
        <button className="z-10 bg-gradient-to-r from-rich-violet to-[#704bd2] px-6 py-3 rounded-xl text-white font-medium hover:from-rich-violet/60 hover:to-[#704bd2]/60 transition ease-in-out duration-200">
          Explore <span className="max-sm:hidden">All IPOs</span>
        </button>
      </div>
    </section>
  );
}
