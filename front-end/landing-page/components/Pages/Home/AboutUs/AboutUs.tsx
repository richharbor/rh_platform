"use client"

import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Check } from "lucide-react"
import { useRouter } from "next/navigation"
import AboutUsImg from "@/public/images/aboutUsImg.jpg"
import {motion} from 'framer-motion';



export default function WhoWeAre() {
  const route = useRouter();

  return (
    <div className="relative h-full w-full overflow-hidden">
      <section id="aboutus" className="max-w-7xl z-10 mx-auto relative w-full text-foreground py-20 px-20 max-md:px-10 max-sm:px-4">
        <div className="container mx-auto grid grid-cols-2 max-md:grid-cols-1 gap-12 items-center">

          {/* Left Side - Images */}
          
          <motion.div 
          initial={{opacity:0, x:-50}}
          whileInView={{opacity:1, x:0}}
          viewport={{once: true, amount:0.5}}
          transition={{duration:0.3, ease:'easeInOut'}}
          className="w-full h-full "
          >
            <Image src={AboutUsImg} alt="dashboard-img" width={819} height={819} className="w-full h-full rounded-2xl object-cover" />
          </motion.div>

          {/* Right Side - Content */}
          <motion.div 
          initial={{opacity:0, x:50}}
          whileInView={{opacity:1, x:0}}
          viewport={{once: true, amount:0.5}}
          transition={{duration:0.3, ease:'easeInOut'}}
          
          className="flex flex-col gap-6"
          >
            <h2 className="text-4xl max-sm:text-2xl font-batman font-bold text-gradient bg-gradient-to-r from-purple-400 to-indigo-600 bg-clip-text text-transparent">
              Who We Are
            </h2>
            <p className="text-lg text-muted-foreground leading-relaxed">

              We are building a trusted, tech-driven marketplace where investors can seamlessly discover, buy, and sell top-tier unlisted shares, Pre-IPOs, and private equity opportunities. Our mission is to make alternative investments accessible, transparent, and secure for every investor.

            </p>
            <h2 className=" text-xl font-semibold max-md:text-xl max-sm:text-lg ">What Sets Us Apart
            </h2>
            <ul className="space-y-3 text-muted-foreground">
              <li className="flex gap-2"><div><Check className="text-rich-violet" /></div>Exclusive access to high-growth pre-IPO and private market opportunities.
              </li>
              <li className="flex gap-2"><div><Check className="text-rich-violet" /></div>Seamless and secure end-to-end trading experience.</li>
              <li className="flex gap-2"><div><Check className="text-rich-violet" /></div>Transparent and compliant transactions for full investor confidence.</li>
              <li className="flex gap-2"><div><Check className="text-rich-violet" /></div>A robust marketplace connecting you to a growing network of investors.
              </li>
              {/* <li className="flex gap-2"><div><Check className="text-rich-violet" /></div>At the heart of our platform is a vision to democratize private markets, empowering investors to enter early, grow smarter, and trade with trust.</li> */}
            </ul>

            <div>
              {/* <Button onClick={() => route.push("/contactus")}>Contact Us</Button> */}
              {/* <Button size="lg" className="mt-4 w-fit">
            Learn More
          </Button> */}
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  )
}
