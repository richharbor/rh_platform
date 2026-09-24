"use client";

import Link from "next/link";
import Icons from "../../global/icons";
import { Button } from "../../ui/button";
import { Particles } from "../../ui/particles";
import RichHarbor from "@/assets/logo/Rich Harbor R.png";
import RichHarbor2 from '@/assets/logo/RH-Logo.png'




import { cn } from "@/lib/cn";
import { motion } from "framer-motion";
import Image from "next/image";
import { Mail, MapPin, Phone } from "lucide-react";

interface Props {
    className?: string;
    children: React.ReactNode;
    delay?: number;
    reverse?: boolean;
    simple?: boolean;
}

const Container = ({ children, className, delay = 0.2, reverse, simple }: Props) => {
    return (
        <motion.div
            className={cn("w-full h-full", className)}
            initial={{ opacity: 0, y: reverse ? -20 : 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: false }}
            transition={{ delay: delay, duration: simple ? 0.2 : 0.4, type: simple ? "keyframes" : "spring" }}
        >
            {children}
        </motion.div>
    )
};



interface Props {
    className?: string;
    children: React.ReactNode;
}

const Wrapper = ({ children, className }: Props) => {
    return (
        <div
            className={cn(
                "size-full mx-auto max-w-6xl px-4 md:px-12",
                className
            )}
        >
            {children}
        </div>
    )
};





// export const FOOTER_LINKS = [
//     {
//         title: "Product",
//         links: [
//             { name: "Home", href: "/" },
//             { name: "Features", href: "/" },
//             { name: "Pricing", href: "/" },
//             { name: "Contact", href: "/" },
//             { name: "Download", href: "/" },
//         ],
//     },
//     {
//         title: "Resources",
//         links: [
//             { name: "Blog", href: "/blog" },
//             { name: "Help Center", href: "/help-center" },
//             { name: "Community", href: "/community" },
//             { name: "Guides", href: "/guides" },
//         ],
//     },
//     {
//         title: "Legal",
//         links: [
//             { name: "Privacy", href: "/privacy" },
//             { name: "Terms", href: "/terms" },
//             { name: "Cookies", href: "/cookies" },
//         ],
//     },
//     {
//         title: "Developers",
//         links: [
//             { name: "API Docs", href: "/api-docs" },
//             { name: "SDKs", href: "/sdks" },
//             { name: "Tools", href: "/tools" },
//             { name: "Open Source", href: "/open-source" },
//             { name: "Changelog", href: "/changelog" },
//         ],
//     },
// ];

export const FOOTER_LINKS = [
    {
        title: "Quick Links",
        links: [
            { name: "Home", href: "/" },
            { name: "Unlisted Shares", href: "/#hot-ipo" },
            { name: "SME IPO", href: "/coming-soon" },
            { name: "Liquidated Shares", href: "/liquidate-shares" },
            // { name: "About Us", href: "/#aboutus" },
            { name: "Contact Us", href: "/contactus" },
        ],
    },
    {
        title: "Resources",
        links: [
            { name: "FAQS", href: "/#faq" },
            // { name: "Blogs", href: "/blogs" },

        ],
    },
];




const Footer = () => {
    return (
        <footer className="w-full py-10 relative">
            <Container>
                <Wrapper className="relative flex flex-col md:flex-row justify-between pb-10 overflow-hidden footer">
                    <Particles
                        className="absolute inset-0 w-full -z-10"
                        quantity={40}
                        ease={10}
                        color="#d4d4d8"
                        refresh
                    />
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-24 w-full mt-10 md:mt-0">
                        <div className="col-span-2 flex flex-col items-start">
                            <div className="flex items-center gap-2">
                                <Link href="/" className="flex items-center gap-2">
                                    <Image
                                        src={RichHarbor2}
                                        alt="Rich Harbor Logo"
                                        className="h-22 w-auto"
                                        
                                    />
                                </Link>
                            </div>
                            <p className="text-base max-w mt-4">
                                Invest smart, grow steady, secure your future.
                            </p>
                            <div className="flex flex-col gap-3 mt-5">
                                <a
                                    href="mailto:info@richharbor.com"
                                    className="flex gap-2 items-center"
                                >
                                    <Mail size={15} />
                                    <p>info@richharbor.com</p>
                                </a>
                                <a href="tel:+919211265558" className="flex gap-2 items-center">
                                    <Phone size={15} />
                                    <p>+91 92112 65558</p>
                                </a>
                                <div className="flex gap-2 items-center">
                                    <MapPin size={15} /> 
                                    <p>GURUGRAM, Haryana 122018, IN</p>
                                </div>
                            </div>
                            {/* <Button className="mt-8">
                                <Link href="/app">
                                    About Us
                                </Link>
                            </Button> */}
                        </div>
                        {/* <Button className="mt-8">
                            <Link href="/#aboutus">
                                About Us
                            </Link>
                        </Button>
                        <Button className="mt-8">
                            <Link href="/contactus">
                                Contact Us
                            </Link>
                        </Button> */}
                        {FOOTER_LINKS?.map((section, index) => (
                            <div key={index} className="flex flex-col gap-4">
                                <h4 className="text-lg font-medium">
                                    {section.title}
                                </h4>
                                <ul className="space-y-4 w-full">
                                    {section.links.map((link, index) => (
                                        <li key={index} className="text-md text-muted-foreground hover:text-foreground transition-all w-full">
                                            <Link href={link.href} className="w-full">
                                                {link.name}
                                            </Link>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        ))}
                    </div>
                </Wrapper>
            </Container>
            <Container>
                <Wrapper className=" flex items-center max-sm:flex-col gap-3 justify-between relative">
                    <p className="text-sm text-secondary-foreground">
                        &copy; {new Date().getFullYear()} RH. All rights reserved.
                    </p>
                    <div className="flex items-center gap-2">
                        <Link href={'/privacy-policy'} className=" text-sm text-secondary-foreground mr-5 hover:underline"> Privacy & Policy</Link>
                        <Link href="https://www.instagram.com/richharborofficial/" target="_blank" className="p-1">
                            <Icons.instagram className="w-10 h-10 text-muted-foreground hover:text-secondary-foreground" />
                        </Link>
                        <Link href="https://x.com/Rich_harbor" target="blank" className="p-1">
                            <Icons.x className="w-10 h-10 text-muted-foreground hover:text-secondary-foreground" />
                        </Link>
                        <Link href="https://www.linkedin.com/company/richharbor/?viewAsMember=true" target="_blank" className="p-1">
                            <Icons.linkedin className="w-10 h-10 text-muted-foreground hover:text-secondary-foreground" />
                        </Link>
                        <Link href="https://www.facebook.com/profile.php?id=61580613956975" target="_blank" className="p-1">
                            <Icons.facebook className="w-10 h-10 text-muted-foreground hover:text-secondary-foreground" />
                        </Link>
                    </div>
                </Wrapper>
            </Container>

            {/* <div className="flex justify-center px-2 max-sm:flex-col py-5 max-sm:py-5 gap-10 max-sm:gap-3 mt-5 border-t">

            </div> */}
        </footer>
    )
};

export default Footer

