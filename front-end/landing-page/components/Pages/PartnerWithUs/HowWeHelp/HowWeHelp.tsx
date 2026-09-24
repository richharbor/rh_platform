import { GlowingEffect } from "@/components/ui/glowing-effect";
import { cn } from "@/lib/utils";
import { BadgeIndianRupee, ChartBarBig, Coins, Headphones, IndianRupee, LockKeyhole, ShieldCheck, Users, Zap } from "lucide-react";



const features = [
    {
        title: "Expand Revenue Streams",
        icon: <Coins className="size-full text-rich-violet" />, // Placeholder for icon path
        description: "Access new sources of income by offering Pre-IPO and IPO investment opportunities directly to your clients.",
    },
    {
        title: "Build Credibility",
        icon: <ShieldCheck className="size-full text-rich-violet" />, // Placeholder for icon path
        description: "Strengthen your brand by associating with a trusted, transparent, and compliant marketplace.",
    },
    {
        title: "Attract New Clients",
        icon: <Users className="size-full text-rich-violet" />,
        description: "Stand out from competitors by providing unique investment options that your clients can’t find elsewhere.",
    },
    {
        title: "Dedicated Support",
        icon: <Headphones className="size-full text-rich-violet " />, // Placeholder for icon path
        description: "Our team provides complete onboarding, training, and ongoing support so you can focus on growing your business.",
    },
];

const Feature = ({
    title,
    description,
    icon,
    index,
}: {
    title: string;
    description: string;
    icon: React.ReactNode;
    index: number;
}) => {
    return (
        <div
            className={cn(
                "flex flex-col lg:border-r  py-10 relative group/feature border-neutral-800",
                (index === 0 || index === 4) && "lg:border-l border-neutral-800",
                index < 4 && "lg:border-b dark:border-neutral-800"
            )}
        >
            {index < 4 && (
                <div className="opacity-0 group-hover/feature:opacity-100 ease-in-out transition-all duration-300 absolute inset-0 h-full w-full bg-gradient-to-t from-rich-violet/25 to-transparent pointer-events-none" />
            )}
            {index >= 4 && (
                <div className="opacity-0 group-hover/feature:opacity-100 ease-in-out transition-all duration-300 absolute inset-0 h-full w-full bg-gradient-to-b from-text-violet/25 to-transparent pointer-events-none" />
            )}
            <div className="mb-4 w-fit group-hover/feature:scale-75 ease-in-out transition-all duration-500 h-12 relative z-10 px-10 text-neutral-400">
                {icon}
            </div>
            <div className="text-lg font-bold mb-2 relative z-10 px-10">
                <div className="absolute  left-0 inset-y-0 h-6 group-hover/feature:h-8 group-hover/feature:-translate-y-1 transform-gpu w-1 rounded-tr-full ease-in-out rounded-br-full bg-neutral-700 group-hover/feature:bg-rich-violet transition-all duration-300 origin-center" />
                <span className=" inline-block text-neutral-100">
                    {title}
                </span>
            </div>
            <p className="text-sm text-white/50 max-w-xs relative z-10 px-10">
                {description}
            </p>
        </div>
    );
};


export default function JoinLeague() {
    return (
        <div className="flex rounded-2xl flex-col gap-10 max-md:gap-2 h-full mx-auto w-full lg:max-w-screen-xl px-2 lg:px-20 py-20 max-md:py-5">
            <h2 className="text-2xl font-batman mx-20 max-sm:mx-5 md:text-4xl text-center lg:text-5xl font-medium !leading-tight text-transparent bg-clip-text bg-gradient-to-b from-foreground to-neutral-400">How Can Rich Harbor Help Your Business?</h2>
            <p className="text-center text-white/50">
               Partnering with us means unlocking new opportunities, expanding your reach, and creating lasting value for your business. 
            </p>
            <div className="grid grid-cols-4 max-md:grid-cols-2 max-sm:grid-cols-1 relative z-10 py-10 max-w-7xl mx-auto">
                {features.map((feature, index) => (
                    <Feature key={feature.title} {...feature} index={index} />
                ))}


            </div>
        </div>
    )
}