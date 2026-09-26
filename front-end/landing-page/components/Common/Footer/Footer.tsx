"use client";

import Link from "next/link";
import Icons from "../../global/icons";
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
        <footer className="relative w-full bg-rh-navy text-rh-paper">
            <Container>
                <Wrapper className="grid gap-12 py-16 md:grid-cols-[minmax(0,1.4fr)_repeat(2,minmax(0,0.8fr))] md:py-20">
                    <div className="flex flex-col items-start">
                        <Link href="/" className="flex items-center gap-2">
                            <Image src={RichHarbor2} alt="Rich Harbor Logo" className="h-16 w-auto" />
                        </Link>
                        <p className="mt-6 max-w-sm font-display text-3xl leading-[1.02] tracking-tight">
                            Invest smart, grow steady, secure your future<span className="text-rh-champagne">.</span>
                        </p>
                        <div className="mt-8 flex flex-col gap-3 text-[15px] text-rh-paper/70">
                            <a href="mailto:info@richharbor.com" className="flex items-center gap-3 hover:text-rh-paper">
                                <Mail size={15} className="text-rh-champagne" />
                                info@richharbor.com
                            </a>
                            <a href="tel:+919211265558" className="flex items-center gap-3 hover:text-rh-paper">
                                <Phone size={15} className="text-rh-champagne" />
                                +91 92112 65558
                            </a>
                            <p className="flex items-center gap-3">
                                <MapPin size={15} className="text-rh-champagne" />
                                Gurugram, Haryana 122018, IN
                            </p>
                        </div>
                    </div>
                    {FOOTER_LINKS?.map((section) => (
                        <div key={section.title} className="flex flex-col gap-5">
                            <h4 className="font-mono text-[11px] uppercase tracking-[0.2em] text-rh-champagne">{section.title}</h4>
                            <ul className="space-y-3">
                                {section.links.map((link) => (
                                    <li key={link.name}>
                                        <Link href={link.href} className="text-[15px] text-rh-paper/70 transition-colors hover:text-rh-paper">
                                            {link.name}
                                        </Link>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    ))}
                </Wrapper>
            </Container>
            <Wrapper className="flex items-center justify-between gap-4 border-t border-rh-paper/10 py-6 max-sm:flex-col">
                <p className="text-sm text-rh-paper/55">&copy; {new Date().getFullYear()} Rich Harbor. All rights reserved.</p>
                <div className="flex items-center gap-1">
                    <Link href="/privacy-policy" className="mr-4 text-sm text-rh-paper/55 hover:text-rh-paper">Privacy policy</Link>
                    {[
                        { href: "https://www.instagram.com/richharborofficial/", Icon: Icons.instagram, label: "Instagram" },
                        { href: "https://x.com/Rich_harbor", Icon: Icons.x, label: "X" },
                        { href: "https://www.linkedin.com/company/richharbor/?viewAsMember=true", Icon: Icons.linkedin, label: "LinkedIn" },
                        { href: "https://www.facebook.com/profile.php?id=61580613956975", Icon: Icons.facebook, label: "Facebook" },
                    ].map(({ href, Icon, label }) => (
                        <Link key={label} href={href} target="_blank" aria-label={label} className="rounded-full p-2 text-rh-paper/55 transition-colors hover:bg-rh-paper/10 hover:text-rh-champagne">
                            <Icon className="h-5 w-5" />
                        </Link>
                    ))}
                </div>
            </Wrapper>
        </footer>
    )
};

export default Footer
