"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Send, HelpCircle, CircleCheckBig, CircleX } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";

import { useQueryWidgetStore } from "@/store/queryWidgetStore";
import { z } from "zod";
import { convertToHtmlForm } from "@/helpers/emailHelper";
import { sendEmail } from "@/services/emailServices";

const formSchema = z.object({
    email: z.string().email("Invalid email address"),
    userType: z.string().min(1, "User role is required"),
    interest: z.string().min(1, "Interest is required"),
    description: z.string().min(10, "Query must be at least 10 characters"),
});

export default function QueryWidget() {
    const { isOpen, open, close } = useQueryWidgetStore();
    const [formData, setFormData] = useState({
        email: "",
        userType: "",
        interest: "",
        description: "",
    });
    const [submitting, setSubmitting] = useState(false);
    const [succOpen, setSuccOpen] = useState(false);
    const [errOpen, setErrOpen] = useState(false);

    const [error, setError] = useState("");

    const handleInputChange = (field: string, value: string) => {
        setFormData((prev) => ({ ...prev, [field]: value }));
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
            subject: `New Query from ${formData.userType} - ${formData.interest}`,
            content: emailHTML,
            isHtml: true,
        };

        try {
            const response = await sendEmail(email);

            setSuccOpen(true);
            setFormData({
                email: "",
                userType: "",
                interest: "",
                description: "",
            });
            close()
        } catch (error) {
            console.error(error);
            close();
            setErrOpen(true);
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <>
            <div className="fixed top-1/2 right-0 transform -translate-y-1/2 z-50 flex items-center">
                <AnimatePresence>
                    {!isOpen && (
                        <motion.button
                            initial={{ x: 100, opacity: 0 }}
                            animate={{ x: 0, opacity: 1 }}
                            exit={{ x: 100, opacity: 0 }}
                            whileHover={{ x: -5 }}
                            transition={{ type: "spring", stiffness: 300, damping: 30 }}
                            onClick={open}
                            className="bg-[#2a2a2a] text-white py-3 px-2 rounded-l-lg shadow-xl cursor-pointer flex flex-col items-center gap-2 border-l border-t border-b border-gray-700/50 backdrop-blur-md hover:bg-[#333] transition-colors"
                        >
                            <HelpCircle size={20} className="text-white/70" />
                            <span className="text-xs font-medium [writing-mode:vertical-rl] rotate-180 uppercase tracking-widest text-white/50">
                                Have a Query?
                            </span>
                        </motion.button>
                    )}
                </AnimatePresence>
            </div>

            <AnimatePresence>
                {isOpen && (
                    <>
                        {/* Backdrop */}
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={close}
                            className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40"
                        />

                        {/* Drawer/Dialog */}
                        <div className="fixed inset-0 z-60 flex items-center justify-end pointer-events-none">
                            <motion.div
                                initial={{ x: "100%", opacity: 0.5 }}
                                animate={{ x: 0, opacity: 1 }}
                                exit={{ x: "100%", opacity: 0, transition: { duration: 0.3 } }}
                                transition={{ type: "spring", stiffness: 300, damping: 30 }}
                                className="pointer-events-auto h-[590px] w-full sm:w-[400px] bg-background border-l border-border shadow-2xl flex flex-col"
                            >
                                <div className="flex items-center justify-between p-6 border-b border-border bg-secondary/5">
                                    <div>
                                        <h3 className="text-xl font-bold font-batman">Ask Us Anything</h3>
                                        <p className="text-sm text-muted-foreground mt-1">
                                            Our experts are here to help you.
                                        </p>
                                    </div>
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        onClick={close}
                                        className="hover:bg-destructive/10 hover:text-destructive rounded-full"
                                    >
                                        <X size={20} />
                                    </Button>
                                </div>

                                <div className="flex-1 p-6 overflow-y-auto">
                                    <form onSubmit={handleSubmit} className="space-y-6">
                                        <div className="space-y-2">
                                            <Label htmlFor="email" className="text-sm font-medium">Email Address</Label>
                                            <Input
                                                id="email"
                                                type="email"
                                                placeholder="you@example.com"
                                                value={formData.email}
                                                onChange={(e) => handleInputChange("email", e.target.value)}
                                                required
                                                className="bg-secondary/20 border-border focus:ring-1 transition-all"
                                            />
                                        </div>

                                        <div className="space-y-2">
                                            <Label htmlFor="userType" className="text-sm font-medium">I am a</Label>
                                            <Select value={formData.userType} onValueChange={(val) => handleInputChange("userType", val)} required>
                                                <SelectTrigger className="bg-secondary/20 border-border">
                                                    <SelectValue placeholder="Select your role" />
                                                </SelectTrigger>
                                                <SelectContent className="z-[100]">
                                                    <SelectItem value="partner">Partner</SelectItem>
                                                    <SelectItem value="seller">Seller</SelectItem>
                                                    <SelectItem value="buyer">Buyer</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </div>

                                        <div className="space-y-2">
                                            <Label htmlFor="interest" className="text-sm font-medium">Interested in</Label>
                                            <Select value={formData.interest} onValueChange={(val) => handleInputChange("interest", val)} required>
                                                <SelectTrigger className="bg-secondary/20 border-border">
                                                    <SelectValue placeholder="Select an interest" />
                                                </SelectTrigger>
                                                <SelectContent className="z-[100]">
                                                    <SelectItem value="unlisted_shares">Unlisted Shares</SelectItem>
                                                    <SelectItem value="insurance">Insurance</SelectItem>
                                                    <SelectItem value="loans">Loans</SelectItem>
                                                    <SelectItem value="corporate_finance">Corporate Finance</SelectItem>
                                                    <SelectItem value="private_markets">Private Markets</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </div>

                                        <div className="space-y-2">
                                            <Label htmlFor="description" className="text-sm font-medium">Your Query</Label>
                                            <Textarea
                                                id="description"
                                                placeholder="Type your question detail here..."
                                                value={formData.description}
                                                onChange={(e) => handleInputChange("description", e.target.value)}
                                                required
                                                className="min-h-[150px] bg-secondary/20 border-border focus:ring-1 transition-all resize-none"
                                            />
                                        </div>

                                        {error && <p className="text-red-500 text-sm text-center">{error}</p>}

                                        <Button disabled={submitting} type="submit" className="w-full bg-primary hover:bg-primary/90 text-primary-foreground py-6 text-lg font-semibold shadow-lg hover:shadow-xl transition-all">
                                            {submitting ? "Sending..." : "Submit Query"} <Send size={18} className="ml-2" />
                                        </Button>
                                    </form>
                                </div>

                                <div className="p-4 border-t border-border bg-secondary/5 text-center">
                                    <p className="text-xs text-muted-foreground">
                                        We typically reply within 2-4 hours during business days.
                                    </p>
                                </div>
                            </motion.div>
                        </div>
                    </>
                )}
            </AnimatePresence>

            <Dialog open={succOpen} onOpenChange={setSuccOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Success 🎉</DialogTitle>
                        <DialogDescription>
                            Your query has been submitted successfully.
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
                        <DialogDescription>Unable to submit query. Please try again.</DialogDescription>
                    </DialogHeader>
                    <div className="my-5 text-red-500 w-full ">
                        <CircleX className="mx-auto font-light" size={100} />
                    </div>
                </DialogContent>
            </Dialog>
        </>
    );
}
