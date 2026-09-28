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
          width: visible ? "40%" : "100%",
          y: visible ? 20 : 0,
        }}
        transition={{
          type: "spring",
          stiffness: 200,
          damping: 40,
        }}
        style={{
          minWidth: "1100px",
        }}
        className={cn(
          "hidden lg:flex bg-transparent self-start items-center justify-between py-4 rounded-full relative z-[50] mx-auto w-full backdrop-blur",
          visible &&
          "bg-background/60 py-2 border border-t-foreground/20 border-b-foreground/10 border-x-foreground/15 w-full"
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
          <div className="hidden lg:flex flex-row flex-1 absolute inset-0 items-center justify-center w-max mx-auto gap-x-2 text-sm text-muted-foreground font-medium">
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
                        "hover:text-foreground text-[17px] transition-all duration-500 hover:bg-accent rounded-md px-4 py-2 flex items-center gap-1",
                        hoveredIndex === index && link.subItems && "text-foreground bg-accent"
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
                          className="absolute top-full left-0 mt-2 w-[280px] bg-background/95 backdrop-blur-md border border-border rounded-xl shadow-xl overflow-hidden p-2 z-50"
                        >
                          {link.subItems.map((subItem, subIndex) => (
                            <Link
                              key={subIndex}
                              href={subItem.link}
                              className="block px-4 py-3 text-sm text-muted-foreground hover:text-foreground hover:bg-accent rounded-lg transition-colors"
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

          <div className="w-[100px]"></div> {/* Spacer to balance logo */}
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
          "flex relative flex-col lg:hidden w-full justify-between items-center mx-auto py-4 z-50",
          visible && "bg-neutral-950 w-11/12 border",
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
                    className="text-black dark:text-white"
                    onClick={() => setOpen(!open)}
                  />
                ) : (
                  <MenuIcon
                    className="text-black dark:text-white"
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
              className="flex rounded-b-xl absolute top-16 bg-neutral-950 inset-x-0 z-50 flex-col items-start justify-start gap-2 w-full px-8 py-8 shadow-xl shadow-neutral-950"
            >
              <div className="w-full">
                <Accordion type="single" collapsible className="w-full">
                  {NAV_LINKS.map((navItem, idx) => (
                    navItem.subItems ? (
                      <AccordionItem key={`nav-${idx}`} value={`item-${idx}`} className="border-b-neutral-800">
                        <AccordionTrigger className="text-neutral-300 hover:no-underline py-3 px-2 text-md font-medium">
                          {navItem.name}
                        </AccordionTrigger>
                        <AccordionContent>
                          <div className="flex flex-col gap-1 pl-4 pb-2">
                            {navItem.subItems.map((sub, subIdx) => (
                              <Link
                                key={`sub-${subIdx}`}
                                href={sub.link}
                                onClick={() => setOpen(false)}
                                className="block py-2 px-2 text-sm text-neutral-400 hover:text-white rounded-md hover:bg-neutral-800"
                              >
                                {sub.name}
                              </Link>
                            ))}
                          </div>
                        </AccordionContent>
                      </AccordionItem>
                    ) : (
                      <div key={`nav-${idx}`} className="border-b border-b-neutral-800 last:border-0">
                        <Link
                          href={navItem.link}
                          onClick={() => setOpen(false)}
                          className="flex items-center w-full py-3 px-2 text-neutral-300 font-medium hover:text-white"
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
