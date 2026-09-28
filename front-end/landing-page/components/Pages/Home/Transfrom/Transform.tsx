"use client";

import { cn } from "@/lib/cn";
import Image from "next/image";
import AnimationContainer from "./AnimatedContainer/AnimatedContainer";
import { Button } from "@/components/ui/button";

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

interface BadgeProps {
  title: string;
}

const SectionBadge = ({ title }: BadgeProps) => {
  return (
    <div className="px-2.5 py-1 rounded-full bg-neutral-800 flex items-center justify-center gap-2">
      <div className="w-1.5 h-1.5 rounded-full bg-primary/40 flex items-center justify-center relative">
        <div className="w-2 h-2 rounded-full bg-primary/60 flex items-center justify-center animate-ping">
          <div className="w-2 h-2 rounded-full bg-primary/60 flex items-center justify-center animate-ping" />
        </div>
        <div className="w-1.5 h-1.5 rounded-full bg-primary flex items-center justify-center absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
      </div>
      <span className="text-xs font-medium text-transparent bg-clip-text bg-gradient-to-r from-primary to-orange-300">
        {title}
      </span>
    </div>
  );
};

type Metric = {
  number: number;
  suffix?: string;
  label: string;
  image: string;
  reverse?: boolean;
};

export const METRICS: Metric[] = [
  {
    number: 25000,
    label: "Active properties",
    image: "/icons/metric-one.svg",
    reverse: false,
  },
  {
    number: 250,
    suffix: "M+",
    label: "Property value managed",
    image: "/icons/metric-two.svg",
    reverse: true,
  },
  {
    number: 98,
    suffix: "%",
    label: "Successful transactions",
    image: "/icons/metric-three.svg",
    reverse: false,
  },
];

const Transform = () => {
  return (
    <Wrapper className="py-20 lg:py-32">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
        <div className="flex flex-col items-center lg:items-start text-center lg:text-left gap-4">
          <AnimationContainer animation="fadeUp" delay={0.3}>
            <h2 className="text-2xl md:text-4xl lg:text-5xl font-medium !leading-tight text-transparent bg-clip-text bg-gradient-to-b from-foreground to-neutral-400">
              Built by an independent team
              <br />
              transforming how trading works
            </h2>
          </AnimationContainer>

          <AnimationContainer animation="fadeUp" delay={0.4}>
            <p className="text-sm md:text-base lg:text-lg text-muted-foreground max-w-2xl mx-auto">
              From New York to Singapore, we’re globally distributed and focused on better markets.
            </p>
          </AnimationContainer>

          <AnimationContainer animation="fadeUp" delay={0.5}>
            <Button className="mt-4">Start your journey</Button>
          </AnimationContainer>
        </div>

        <div className="flex flex-col gap-6 px-1 md:px-0">
          {METRICS.map((metric, index) => (
            <AnimationContainer
              key={index}
              animation={metric.reverse ? "fadeLeft" : "fadeRight"}
              delay={0.6 + index * 0.2}
            >
              <div className="relative rounded-3xl bg-[#191919] p-4 lg:p-6 overflow-hidden z-0">
                <AnimationContainer
                  animation="scaleUp"
                  delay={0.7 + index * 0.2}
                >
                  <div
                    className={cn(
                      "absolute -bottom-1/2 right-0 bg-primary size-20 lg:size-32 blur-[3rem] lg:blur-[5rem] rounded-full -z-10",
                      metric.reverse && "left-0 right-auto"
                    )}
                  />
                </AnimationContainer>

                <div
                  className={cn(
                    "flex items-center justify-between gap-6 z-30",
                    metric.reverse && "flex-row-reverse"
                  )}
                >
                  <AnimationContainer
                    animation="fadeUp"
                    delay={0.8 + index * 0.2}
                  >
                    <div className="flex flex-col">
                      <div className="flex items-baseline gap-1">
                        <span className="text-4xl font-medium">
                          {metric.number.toLocaleString()}
                        </span>
                        {metric.suffix && (
                          <span className="text-4xl font-medium">
                            {metric.suffix}
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {metric.label}
                      </p>
                    </div>
                  </AnimationContainer>

                  <AnimationContainer
                    animation={metric.reverse ? "fadeRight" : "fadeLeft"}
                    delay={0.9 + index * 0.2}
                  >
                    <div
                      className={cn(
                        "h-32 absolute inset-y-0 my-auto right-0 rounded-2xl flex items-center justify-center",
                        metric.reverse && "left-0 right-auto"
                      )}
                    >
                      <Image
                        src={metric.image}
                        alt={metric.label}
                        width={256}
                        height={256}
                        className="size-full object-contain"
                      />
                    </div>
                  </AnimationContainer>
                </div>
              </div>
            </AnimationContainer>
          ))}
        </div>
      </div>
    </Wrapper>
  );
};

export default Transform;
