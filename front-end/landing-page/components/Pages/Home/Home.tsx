"use client";

import { ShootingStars } from "@/components/ui/shooting-stars";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { StarsBackground } from "@/components/ui/stars-background";
import { motion } from "framer-motion";
import Faq from "./Faq/Faq";
import TrustedBy from "./TrustedBy/TrustedBy";
import GlobeComponent from "./Globe/Globe";
import SamplePage from "./SamplePage/SamplePage";

import ExtraFeatures from "./ExtraFeatures/ExtraFeatures";
import ReadyToBoost from "./ReadyToBoost/ReadyToBoost";
import Integration2 from "./Integration2/integration";
import Features2 from "./Features2/Features2";
import Transform from "./Transfrom/Transform";
import OurProduct from "./OurProduct/OurProduct";
import TechPlatform from "./TechPlatform/TechPlatform";
import HotSelling from "./HotSelling/HotSelling";
import JoinLeague from "./JoinLeague/JoinLeague";
import Glipms from "./TechPlatform/Glimps";
import EliteClub from "./EliteClub/EliteClub";
import TrustStrip from "./TrustStrip";
import CoreOfferings from "./CoreOfferings";
import HowItWorks from "./HowItWorks";
import WhyRichHarbor from "./WhyRichHarbor";
import WhoWeServe from "./WhoWeServe";
import Testimonials from "./Testimonials";
import FinalCTA from "./FinalCTA";
import Tagline from "./Tagline/Tagline";
import TomorrowBigBets from "./TomorrowBigBets/TomorrowBigBets";
import AboutUs from "./AboutUs/AboutUs";
import ProductShowcase from "./ProductShowcase/ProductShowcase";
import PromisingOnes from "./PromissingOnes/PromissingOnes";
import { useAuthStore } from "@/store/authStore";
import { useEffect } from "react";
import { Testimonials2 } from "./Testimonials2/Testimonials2";
import ProductSlider from "./ProductSlider/ProductSlider";
import WhatsAppBanner from "./WhatsAppBanner/WhatsAppBanner";
import { useQueryWidgetStore } from "@/store/queryWidgetStore";


const faq = [
  {
    question: "Is investing in unlisted shares legal in India?",
    answer: "Yes. Off-market transfer of unlisted shares is legal when executed with proper documentation and compliance."
  },
  {
    question: "Does Richharbor guarantee returns or IPO listing?",
    answer: "No. Richharbor does not assure returns or listing outcomes. All investments carry inherent risk."
  },
  {
    question: "Can retail investors use Richharbor?",
    answer: "Yes. Access depends on product suitability and regulatory eligibility."
  },
  {
    question: "Does Richharbor provide investment advice?",
    answer: "No. Richharbor operates as an execution and facilitation platform, not an investment advisor."
  },
  {
    question: "Is my information kept confidential?",
    answer: "Yes. All engagements are handled with strict confidentiality protocols"
  }
];



export default function HomePage() {

  const { authUser, checkAuth } = useAuthStore();
  const { open: openQueryWidget } = useQueryWidgetStore();


  // useEffect(()=>{
  //   checkAuth();
  // },[])



  return (

    <div className="flex flex-col pt-5 sm:pt-20">
      <ShootingStars className="fixed inset-0 -z-10" />
      <StarsBackground className="fixed inset-0 -z-10" />

      <main className="flex-1">
        {/* Hero Section */}
        <section className="w-full pt-5 overflow-hidden">
          <div className="container px-2 md:px-6 relative mx-auto">
            <div

              className="text-center max-w-5xl mx-auto  pt-10"
            >
              <h1

                className="text-2xl font-batman sm:text-3xl md:text-4xl lg:text-5xl font-bold tracking-tight mb-6 bg-clip-text text-transparent bg-gradient-to-r from-foreground to-foreground/70"
              >
                Access Unlisted Shares, Capital & Financial Solutions — Transparently
              </h1>
              <p className="text-base sm:text-lg md:text-xl text-muted-foreground mb-8 max-w-2xl mx-auto drop-shadow-[0_0_10px_rgba(255,255,255,0.8)]">
                {/* <Link href={"/unlisted-shares"}>Unlisted Shares</Link> | <Link href={"/bulk-deals"}>Listed Bulk Deals</Link> | <Link href={"/private-markets"}>Private Markets</Link> | <Link href={"/loans"}>Loans</Link> | <Link href={"/insurance"}>Insurance</Link> | <Link href={"/corporate-finance"}>Growth Capital</Link> */}
                Richharbor is a unified financial execution platform enabling access to unlisted shares, private markets, loans, insurance, and structured credit — backed by institutional processes, compliance, and secure execution.
              </p>

              <div className="flex flex-col sm:flex-row items-center justify-center gap-4 relative z-10 mb-8">
                <Button
                  size="lg"
                  className="rounded-full md:text-[16px] font-semibold h-12 px-8"
                  onClick={(e) => {
                    e.preventDefault();
                    document.getElementById('products')?.scrollIntoView({ behavior: 'smooth' });
                  }}
                >
                  Explore Opportunities
                </Button>
                <Button size="lg" variant="outline" onClick={openQueryWidget} className="rounded-full md:text-[16px] font-semibold h-12 px-8 bg-transparent border-white/20 hover:bg-white/10 text-white backdrop-blur-sm">
                  Submit Your Requirement
                </Button>
              </div>
            </div>

            <div className="w-full">
              <div className="relative -top:5 sm:-top-20 w-full">
                <GlobeComponent />

                {/* <div className="absolute top-5/6 left-0 w-full z-10 transform -translate-y-1/2">
                  <SamplePage />
                </div> */}
              </div>
            </div>
          </div>
        </section>










        <ProductSlider />

        <TrustStrip />
        <WhatsAppBanner />

        <CoreOfferings />

        <HowItWorks />

        <WhyRichHarbor />

        <WhoWeServe />
        {/* <Testimonials /> */}









        {/* <Tagline /> */}
        {/* <OurProduct /> */}
        {/* <ProductShowcase /> */}
        {/* <AboutUs /> */}

        {/* <Features2 /> */}
        {/* <ReadyToBoost /> */}
        {/* <EliteClub /> */}

        {/* <Integration2 /> */}
        {/* <Transform /> */}
        {/* <TechPlatform /> */}


        <Testimonials2 />
        {/* <TomorrowBigBets /> */}
        {/* <JoinLeague /> */}
        {/* <Integrations /> */}




        <Faq items={faq} />
        <FinalCTA />



      </main>

    </div >
  );
}
