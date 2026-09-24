"use client";

import { useState, useEffect } from "react";
import Cookies from "js-cookie";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { motion, AnimatePresence } from "framer-motion";
import { Bell, CircleCheckBig, CircleX } from "lucide-react";
import { z } from "zod";
import { convertToHtmlForm } from "@/helpers/emailHelper";
import { sendEmail } from "@/services/emailServices";

const formSchema = z.object({
    name: z.string().min(2, "Name is required"),
    phone: z.string().regex(/^[0-9]{10}$/, "Invalid phone number"),
    email: z.string().email("Invalid email address"),
});

export default function NewsletterPopup() {
    const [isOpen, setIsOpen] = useState(false);
    const [isSubscribed, setIsSubscribed] = useState(false);
    const [formData, setFormData] = useState({
        name: "",
        phone: "",
        email: "",
    });
    const [timeOut, setTimeOut] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [succOpen, setSuccOpen] = useState(false);
    const [errOpen, setErrOpen] = useState(false);

    const [error, setError] = useState("");

    useEffect(() => {
        // Check if user has already subscribed (via cookie)
        const existingEmail = Cookies.get("userEmail");

        if (existingEmail) {
            setIsSubscribed(true);
        } else {
            // If not subscribed, show popup after 10 seconds
            const timer = setTimeout(() => {
                // Double check cookie in case user subscribed in another tab/window
                if (!Cookies.get("userEmail")) {
                    setIsOpen(true);
                    setTimeOut(true);
                }
            }, 10000);

            return () => clearTimeout(timer);
        }
    }, []);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { id, value } = e.target;
        setFormData((prev) => ({ ...prev, [id]: value }));
        if (error) setError("");
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSubmitting(true);
        setError("");

        const result = formSchema.safeParse(formData);

        if (!result.success) {
            setError(result.error.issues[0].message);
            setSubmitting(false);
            return;
        }

        const emailHTML = convertToHtmlForm(formData);
        const email = {
            to: "frontend@rhinontech.com",
            subject: `New Newsletter Subscription - ${formData.name}`,
            content: emailHTML,
            isHtml: true,
        };

        try {
            const response = await sendEmail(email);
            if (response.status === 200) {
                // Set cookie to prevent popup from showing again
                // Expires in 365 days
                Cookies.set("userEmail", formData.email, { expires: 365 });
                setIsSubscribed(true);
                setIsOpen(false);
                setSuccOpen(true);
            } else {
                setErrOpen(true);
            }
        } catch (error) {
            console.error(error);
            setErrOpen(true);
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <>
            <div className="fixed top-1/2 left-0 transform -translate-y-1/2 z-50 flex items-center">
                <AnimatePresence>
                    {!isOpen && !isSubscribed && timeOut && (
                        <motion.button
                            initial={{ x: -100, opacity: 0 }}
                            animate={{ x: 0, opacity: 1 }}
                            exit={{ x: -100, opacity: 0 }}
                            whileHover={{ x: 5 }}
                            transition={{ type: "spring", stiffness: 300, damping: 30 }}
                            onClick={() => setIsOpen(true)}
                            className="bg-[#2a2a2a] text-white py-3 px-2 rounded-r-lg shadow-xl cursor-pointer flex flex-col items-center gap-2 border-r border-t border-b border-gray-700/50 backdrop-blur-md hover:bg-[#333] transition-colors"
                        >
                            <Bell size={20} className="text-white/70" />
                            <span className="text-xs font-medium [writing-mode:vertical-rl] rotate-180 uppercase tracking-widest text-white/50">
                                Stay Updated
                            </span>
                        </motion.button>
                    )}
                </AnimatePresence>
            </div>

            <Dialog open={isOpen} onOpenChange={setIsOpen}>
                <DialogContent className="sm:max-w-[425px]" onInteractOutside={(e) => e.preventDefault()}>
                    <DialogHeader>
                        <DialogTitle>Stay Updated!</DialogTitle>
                        <DialogDescription>
                            Subscribe to get latest updates on upcoming IPOs and exclusive unlisted shares offers.
                        </DialogDescription>
                    </DialogHeader>
                    <form onSubmit={handleSubmit} className="grid gap-4 py-4">
                        <div className="grid gap-2">
                            <Label htmlFor="name">Name</Label>
                            <Input
                                id="name"
                                value={formData.name}
                                onChange={handleChange}
                                placeholder="John Doe"
                                required
                            />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="phone">Phone Number</Label>
                            <Input
                                id="phone"
                                type="tel"
                                value={formData.phone}
                                onChange={handleChange}
                                placeholder="+91 98765 43210"
                                required
                            />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="email">Email</Label>
                            <Input
                                id="email"
                                type="email"
                                value={formData.email}
                                onChange={handleChange}
                                placeholder="john@example.com"
                                required
                            />
                        </div>
                        <div className="flex justify-end mt-4 gap-2 flex-col">
                            {error && <p className="text-red-500 text-sm text-center">{error}</p>}
                            <div className="flex justify-end gap-2">
                                <Button type="button" variant="outline" onClick={() => setIsOpen(false)}>Cancel</Button>
                                <Button disabled={submitting} type="submit">
                                    {submitting ? "Subscribing..." : "Subscribe Now"}
                                </Button>
                            </div>
                        </div>
                    </form>
                </DialogContent>
            </Dialog>

            <Dialog open={succOpen} onOpenChange={setSuccOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Success 🎉</DialogTitle>
                        <DialogDescription>
                            You have successfully subscribed to our newsletter.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="my-5 text-green-500 w-full ">
                        <CircleCheckBig className="mx-auto font-light" size={100} />
                    </div>
                </DialogContent>
            </Dialog>

            <Dialog open={errOpen} onOpenChange={setErrOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Error</DialogTitle>
                        <DialogDescription>Unable to subscribe at the moment. Please try again later.</DialogDescription>
                    </DialogHeader>
                    <div className="my-5 text-red-500 w-full ">
                        <CircleX className="mx-auto font-light" size={100} />
                    </div>
                </DialogContent>
            </Dialog>
        </>
    );
}
