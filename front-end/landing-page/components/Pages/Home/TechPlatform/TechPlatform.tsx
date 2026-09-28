import { cn } from "@/lib/cn";
import AnimationContainer from "../Transfrom/AnimatedContainer/AnimatedContainer";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import phoneImg from '@/public/images/phone.png'
import { WavyBackground } from "@/components/ui/wavy-background";
import { CardBody, CardContainer, CardItem } from "@/components/ui/3d-card";

interface WrapperProps {
  className?: string;
  children: React.ReactNode;
}

const Wrapper = ({ className, children }: WrapperProps) => {
  return (
    <section
      className={cn(
        "h-full mx-auto w-full lg:max-w-screen-xl px-4 lg:px-20",
        className
      )}
    >
      {children}
    </section>
  );
};

export default function TechPlatform(){
    return (
        <Wrapper className="relative py-10  backdrop-blur-md max-md:py-7 rounded-2xl overflow-hidden">
            {/* <div className=" absolute inset-0 z-0">
    Blue blur on the right side 
    <div className=" max-md:hidden absolute right-0 top-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-gradient-to-r from-purple-400 to-pink-400 rounded-full blur-[300px]"></div>
  </div> */}
  <WavyBackground className=" bg-transparent w-full mx-auto" waveOpacity={0.1}>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-16 items-center relative z-10">
        <div className="flex flex-col items-center md:items-start text-center md:text-left gap-4">
          <AnimationContainer animation="fadeUp" delay={0.3}>
            <h2 className="text-2xl font-batman md:text-3xl lg:text-4xl font-medium !leading-tight text-transparent bg-clip-text bg-gradient-to-b from-foreground to-neutral-400">
              Your Portal to Smarter Diversification

            </h2>
          </AnimationContainer>

          <AnimationContainer animation="fadeUp" delay={0.4}>
            <p className="text-sm md:text-base lg:text-lg text-white/80 max-w-2xl mx-auto">
                RichHarbor offers a curated gateway to leading private growth companies and global trade finance opportunities, helping you diversify with confidence and access markets beyond the ordinary.
            </p>
          </AnimationContainer>

          <AnimationContainer animation="fadeUp" delay={0.5}>
            <Button className="mt-4 hover:bg-rich-violet hover:text-black hover:scale-115 transition-all duration:300 ease-in-out">Live soon</Button>
          </AnimationContainer>
        </div>

        
        <CardContainer className="inter-var">
      <CardBody className="relative group/card w-auto sm:w-[30rem] h-auto rounded-xl ">
        
        <CardItem translateZ="100" className="w-full">
          
          <Image src={phoneImg} alt="holding phone" className="size-full max-md:size-52 max-lg:size-64 object-cover rounded-xl mx-auto "/>
        </CardItem>
        
      </CardBody>
    </CardContainer>

      </div>
      </WavyBackground>
    </Wrapper>
    )
}