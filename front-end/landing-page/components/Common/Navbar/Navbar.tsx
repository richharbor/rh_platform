"use client";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/cn";
import {
  AnimatePresence,
  motion,
  useMotionValueEvent,
  useScroll,
} from "framer-motion";
import { ChevronDown, CircleUserRound, MenuIcon, User, XIcon } from "lucide-react";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import AnimationContainer from "./AnimatedContainer/AnimatedContainer";
import Image from "next/image";
import RHLogo from "@/assets/logo/RH-Logo.png";
import RichHarbor from "@/assets/logo/Rich Harbor R.png";
import { useRouter } from "next/navigation";
import ContactUsPage from "@/components/Pages/ContactUs/page";
import { useAuthStore } from "@/store/authStore";
import { useQueryWidgetStore } from "@/store/queryWidgetStore";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

export const NAV_LINKS = [
  { name: "Home", link: "/" },
  {
    name: "Invest & Trade",
    link: "#",
    subItems: [
      { name: "Unlisted Shares", link: "/unlisted-shares" },
      { name: "Bulk Deals (Listed Shares)", link: "/bulk-deals" },
      { name: "Private Markets (Pre-IPO, PE/AIF)", link: "/private-markets" },
    ]
  },
  {
    name: "Financial Solutions",
    link: "#",
    subItems: [
      { name: "Loans", link: "/loans" },
      { name: "Insurance (Life / Health / Motor / Business)", link: "/insurance" },
      { name: "Corporate Finance", link: "/corporate-finance" },
    ]
  },
  { name: "Tech Support", link: "/tech-support" },
  // { name: "About Us", link: "/#aboutus" },
  // { name: "Blogs", link: "/blogs" },
  { name: "Contact us", link: "/contactus" },
  { name: "Partner With Us", link: "/partner-with-us" },
];

const useClickOutside = (callback: () => void) => {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (ref.current && !ref.current.contains(event.target as Node)) {
        callback();
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [callback]);

  return ref;
};

const Wrapper = ({
  className,
  children,
}: {
  className?: string;
  children: React.ReactNode;
}) => {
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

const Navbar = () => {
  const { user } = { user: "user" };
  const { authUser } = useAuthStore();
  const { open: openQueryWidget } = useQueryWidgetStore();

  const route = useRouter();

  const [open, setOpen] = useState(false);
  const [visible, setVisible] = useState(false);
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  const mobileMenuRef = useClickOutside(() => {
    if (open) setOpen(false);
  });

  // Track page scroll instead of element scroll
  const { scrollY } = useScroll();

  useMotionValueEvent(scrollY, "change", (latest) => {
    setVisible(latest > 100);
  });

  return (
    <header className="fixed w-full top-0 inset-x-0 z-50">
      {/* Desktop Navbar */}
      <motion.div
        animate={{
          width: visible ? "60%" : "100%",
          y: visible ? 20 : 0,
        }}
        transition={{
          type: "spring",
          stiffness: 200,
          damping: 40,
        }}
        style={{
          minWidth: "1180px",
        }}
        className={cn(
          // Solid brand navy in every state, so it reads on the light home page and the dark inner pages alike.
          "hidden lg:flex bg-rh-navy/95 text-rh-paper self-start items-center justify-between py-4 relative z-[50] mx-auto w-full backdrop-blur border-b border-rh-paper/10",
          visible &&
          "bg-rh-navy/90 py-2 rounded-full border border-rh-paper/15 shadow-xl shadow-rh-navy/20 w-full"
        )}
      >
        <Wrapper className="flex items-center justify-between lg:px-4">
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.2 }}
          >
            <Link href="/" className="flex items-center gap-2">
              <Image
                src={RichHarbor}
                alt="Rich Harbor Logo"
                className="h-10 w-auto"
              />
            </Link>
          </motion.div>

          {/* Center Links */}
          <div className="hidden lg:flex flex-row flex-1 absolute inset-0 items-center justify-center w-max mx-auto gap-x-2 text-sm text-rh-paper/75 font-medium">
            <AnimatePresence>
              {NAV_LINKS.map((link, index) => (
                <AnimationContainer
                  key={index}
                  animation="fadeDown"
                  delay={0.1 * index}
                >
                  <div
                    className="relative"
                    onMouseEnter={() => setHoveredIndex(index)}
                    onMouseLeave={() => setHoveredIndex(null)}
                  >
                    <Link
                      href={link.link}
                      className={cn(
                        "hover:text-rh-paper text-[15px] transition-all duration-500 hover:bg-rh-paper/10 rounded-md px-3 py-2 flex items-center gap-1",
                        hoveredIndex === index && link.subItems && "text-rh-paper bg-rh-paper/10"
                      )}
                    >
                      {link.name}
                      {link.subItems && <ChevronDown size={14} className={cn("transition-transform duration-200", hoveredIndex === index && "rotate-180")} />}
                    </Link>

                    {/* Dropdown */}
                    <AnimatePresence>
                      {link.subItems && hoveredIndex === index && (
                        <motion.div
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: 10 }}
                          transition={{ duration: 0.2 }}
                          className="absolute top-full left-0 mt-2 w-[280px] bg-rh-navy/95 backdrop-blur-md border border-rh-paper/15 rounded-xl shadow-xl overflow-hidden p-2 z-50"
                        >
                          {link.subItems.map((subItem, subIndex) => (
                            <Link
                              key={subIndex}
                              href={subItem.link}
                              className="block px-4 py-3 text-sm text-rh-paper/70 hover:text-rh-paper hover:bg-rh-paper/10 rounded-lg transition-colors"
                            >
                              {subItem.name}
                            </Link>
                          ))}
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </AnimationContainer>
              ))}
            </AnimatePresence>
          </div>

          <button
            type="button"
            onClick={openQueryWidget}
            className="relative z-10 rounded-full bg-rh-champagne px-5 py-2 text-sm font-semibold text-rh-navy transition-colors hover:bg-[#e4cb96]"
          >
            Get in touch
          </button>
        </Wrapper>
      </motion.div>

      {/* Mobile Navbar */}
      <motion.div
        animate={{
          y: visible ? 20 : 0,
          borderTopLeftRadius: open ? "0.75rem" : "2rem",
          borderTopRightRadius: open ? "0.75rem" : "2rem",
          borderBottomLeftRadius: open ? "0" : "2rem",
          borderBottomRightRadius: open ? "0" : "2rem",
        }}
        transition={{
          type: "spring",
          stiffness: 200,
          damping: 50,
        }}
        className={cn(
          "flex relative flex-col lg:hidden w-full justify-between items-center mx-auto py-4 z-50 bg-rh-navy text-rh-paper",
          visible && "w-11/12 border border-rh-paper/15 shadow-xl shadow-rh-navy/20",
          open && "border-transparent"
        )}
      >
        <Wrapper className="flex items-center justify-between lg:px-4">
          <div className="flex items-center justify-between gap-x-4 w-full">
            <AnimationContainer animation="fadeRight" delay={0.1}>
              <Link href="/">
                <Image
                  src={RichHarbor}
                  alt="Rich Harbor Logo"
                  className="h-10 w-auto"
                />
              </Link>
            </AnimationContainer>

            <AnimationContainer animation="fadeLeft" delay={0.1}>
              <div className="flex items-center justify-between gap-x-4 w-full">
                {open ? (
                  <XIcon
                    className="text-rh-paper"
                    onClick={() => setOpen(!open)}
                  />
                ) : (
                  <MenuIcon
                    className="text-rh-paper"
                    onClick={() => setOpen(!open)}
                  />
                )}
              </div>
            </AnimationContainer>
          </div>
        </Wrapper>

        {/* Mobile Menu */}
        <AnimatePresence>
          {open && (
            <motion.div
              ref={mobileMenuRef}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex rounded-b-xl absolute top-16 bg-rh-navy inset-x-0 z-50 flex-col items-start justify-start gap-2 w-full px-8 py-8 shadow-xl shadow-rh-navy/30"
            >
              <div className="w-full">
                <Accordion type="single" collapsible className="w-full">
                  {NAV_LINKS.map((navItem, idx) => (
                    navItem.subItems ? (
                      <AccordionItem key={`nav-${idx}`} value={`item-${idx}`} className="border-b-rh-paper/10">
                        <AccordionTrigger className="text-rh-paper/85 hover:no-underline py-3 px-2 text-md font-medium">
                          {navItem.name}
                        </AccordionTrigger>
                        <AccordionContent>
                          <div className="flex flex-col gap-1 pl-4 pb-2">
                            {navItem.subItems.map((sub, subIdx) => (
                              <Link
                                key={`sub-${subIdx}`}
                                href={sub.link}
                                onClick={() => setOpen(false)}
                                className="block py-2 px-2 text-sm text-rh-paper/60 hover:text-rh-paper rounded-md hover:bg-rh-paper/10"
                              >
                                {sub.name}
                              </Link>
                            ))}
                          </div>
                        </AccordionContent>
                      </AccordionItem>
                    ) : (
                      <div key={`nav-${idx}`} className="border-b border-b-rh-paper/10 last:border-0">
                        <Link
                          href={navItem.link}
                          onClick={() => setOpen(false)}
                          className="flex items-center w-full py-3 px-2 text-rh-paper/85 font-medium hover:text-rh-paper"
                        >
                          {navItem.name}
                        </Link>
                      </div>
                    )
                  ))}
                </Accordion>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </header>
  );
};

export default Navbar;
