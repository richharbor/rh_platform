// import AnimationContainer from "@/components/global/animation-container";
// import MaxWidthWrapper from "@/components/global/max-width-wrapper";
// import { BentoCard, BentoGrid, CARDS } from "@/components/ui/bento-grid";
// import MagicBadge from "@/components/ui/magic-badge";
// import sampleImg from '@/public/images/S.png'
// import sampleImg2 from '@/public/images/S2.png'

// import Image from "next/image";

// export default function Glipms() {
//     return (
//         <MaxWidthWrapper className="pt-10 grid grid-cols-2 max-lg:grid-cols-1 gap-10 py-20 max-md:py-10">
//             <AnimationContainer delay={0.1} className="my-auto">
//                 <div className="flex flex-col w-full justify-center max-lg:items-center py-8">
//                     <h2 className="text-2xl font-batman md:text-3xl lg:text-4xl font-medium !leading-tight text-transparent bg-clip-text bg-gradient-to-b from-foreground to-neutral-400 max-sm:text-center">
//                         Less platform, more portal
//                     </h2>
//                     <p className="mt-4 max-lg:text-center text-lg text-muted-foreground max-w-lg">
//                         We envision a future where entering the world of private assets is as seamless as stepping into public markets—an open gateway that moves beyond traditional investing in India. Precize is your portal to new financial horizons, connecting you with exclusive opportunities once reserved for only a privileged few.
//                     </p>
//                 </div>
//             </AnimationContainer>
//             <AnimationContainer delay={0.2} className="flex justify-center">
//                 {/* <BentoGrid className=" ">
//                     {CARDS.map((feature: any, idx: any) => (
//                         <BentoCard key={idx} {...feature} />
//                     ))}
//                 </BentoGrid> */}
//                 <div className="ml-5">
//                     <Image src={sampleImg} alt="Sample-image" className="w-96 h-auto mx-auto"  />
//                 </div>
//                 {/* <div className="relative w-96 h-[35rem] group">

//                     <Image src={sampleImg2}
//                         alt="No Color"
//                         className="w-full h-auto absolute top-0 left-0 transition-opacity duration-700 opacity-100 group-hover:opacity-0" />


//                     <Image src={sampleImg}
//                         alt="Color"
//                         className="w-full h-auto absolute top-0 left-0 transition-opacity duration-700 opacity-0 group-hover:opacity-100" />
//                 </div> */}
//             </AnimationContainer>
//         </MaxWidthWrapper>
//     )
// }
"use client";

import { Shield, Headphones, Clock, KeyRound } from "lucide-react";
import Image from "next/image";
import circleIcon from '@/public/images/CircleIcon.png'
import { motion } from 'framer-motion'

export default function Glimps() {
  return (
    <motion.div
      className="relative h-full w-full rounded-2xl"
    >
      <motion.div
        initial={{ rotate: -90, x: -200, opacity:0, scale:0.5}}
        whileInView={{ rotate: 0, x: 0, opacity:[0, 0.5, 1], scale:1}}
        viewport={{once: true, amount:0.5}}
        transition={{
          duration: 1,      // full rotation time
          ease: "easeInOut",    // smooth continuous motion
        }}
        className="absolute -top-28 -left-34 max-sm:size-[18rem] max-sm:-top-10 max-sm:-left-15 size-[35rem]"
      >
        <Image
          src={circleIcon}
          alt="Background"
          className="object-cover"
          priority
        />
      </motion.div>
      <div className="absolute rounded-2xl inset-0 bg-transparent backdrop-blur-lg"></div>
      <section className="max-w-7xl relative  mx-auto w-full text-white py-20 px-6 lg:px-20">


        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">

          {/* Left Content */}
          <div className="space-y-6">
            <h2 className="text-3xl md:text-4xl font-batman font-extrabold leading-tight bg-gradient-to-r from-rich-violet to-[#704bd2] bg-clip-text text-transparent">
              Less Platform, <br /> More Portal
            </h2>
            <p className="text-gray-400 text-lg leading-relaxed max-w-lg">
              We envision a future where investing in private assets is as seamless
              as entering public markets—an open gateway that moves beyond traditional
              investing in India. Rich Harbor is your portal to new opportunities once
              reserved for a privileged few.
            </p>
            <button className="bg-gradient-to-r from-rich-violet to-[#704bd2] px-6 py-3 rounded-xl text-white font-medium hover:from-rich-violet/70 hover:to-[#704bd2]/70 transition ease-in-out duration-200 shadow-lg">
              Get Started
            </button>
          </div>

          {/* Right Feature Grid */}
          <div className="grid grid-cols-2 gap-6 max-sm:grid-cols-1">
            {features.map((feature, i) => (
              <div
                key={i}
                className="flex flex-col items-center justify-center text-center bg-white/5 rounded-xl p-6 border border-white/10 hover:border-rich-violet hover:shadow-lg hover:shadow-rich-violet/30 transition duration-300"
              >
                <div className="p-3 rounded-full bg-gradient-to-r from-rich-violet/80 to-[#704bd2]/80 mb-4">
                  <feature.icon className="h-6 w-6 text-white" />
                </div>
                <h3 className="font-semibold text-white">{feature.title}</h3>
                <p className="text-sm text-gray-400 mt-2">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </motion.div>
  );
}

const features = [
  {
    title: "Research-driven Platform",
    desc: "In-depth insights to guide smarter investment decisions.",
    icon: Shield,
  },
  {
    title: "Always-on Assistance",
    desc: "Our care team is available anytime you need help.",
    icon: Headphones,
  },
  {
    title: "Start with ₹10,000",
    desc: "Low entry barrier makes investing accessible for everyone.",
    icon: Clock,
  },
  {
    title: "Invite-only Access",
    desc: "Exclusive opportunities tailored for serious investors.",
    icon: KeyRound,
  },
];
