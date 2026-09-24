
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogClose } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { LeadData, postLead } from "@/services/leadService";

import { useState, useEffect } from "react";
import z from "zod";

interface UnlistedShareEnquiryDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    defaultShareName?: string;
}

const enquirySchema = z.object({
    shareName: z.string().min(1, "Share name is required"),
    quantity: z
        .string()
        .regex(/^\d+$/, "Quantity must be a number"),
    name: z.string().min(2, "Name is required"),
    email: z.string().email("Invalid email address"),
    phone: z.string().regex(/^[0-9]{10}$/, "Phone must be 10 digits"),
    city: z.string().min(2, "City is required"),
});

export default function UnlistedShareEnquiryDialog({ open, onOpenChange, defaultShareName }: UnlistedShareEnquiryDialogProps) {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string>("");
    const [formData, setFormData] = useState({
        shareName: "",
        quantity: "",
        name: "",
        email: "",
        phone: "",
        city: "",
    });

    useEffect(() => {
        if (open) {
            setFormData(prev => ({
                ...prev,
                shareName: defaultShareName || ""
            }));
            setError("");
        }
    }, [open, defaultShareName]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData({
            ...formData,
            [name]: value,
        });
    };

    const handleEnquirySubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setLoading(true);
        try {
            const result = enquirySchema.safeParse(formData);
            if (!result.success) {
                const firstError = result.error.issues[0]?.message;
                setError(firstError);
                return;
            }

            setError("");
            const { name, email, phone, city, shareName, quantity, ...rest } = result.data;

            const leadData: LeadData = {
                product_type: "unlisted_share",
                lead_type: "self",
                name,
                email,
                phone,
                city,
                product_details: {
                    shareName,
                    quantity,
                    ...rest,
                    source: "web",
                },
            };

            await postLead(leadData);
            onOpenChange(false);
            const whatsappUrl = `https://wa.me/919211265558?text=Hello!%20I%20have%20a%20enquiry%20about%20unlisted%20shares.`;
            window.open(whatsappUrl, "_blank");

            // Reset form but keep share name if it was passed as default
            setFormData({
                shareName: defaultShareName || "",
                quantity: "",
                name: "",
                email: "",
                phone: "",
                city: "",
            });

        } catch (error) {
            console.error("Form submission error:", error);
            setError("Form submission error");
        } finally {
            setLoading(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Send Enquiry</DialogTitle>
                    <DialogDescription>
                        Please fill in the details below to send an enquiry{defaultShareName ? ` for ${defaultShareName}` : ""}.
                    </DialogDescription>
                </DialogHeader>

                <form onSubmit={handleEnquirySubmit} className="grid gap-4">
                    {/* Share Name */}
                    <div className="grid gap-3">
                        <Label htmlFor="shareName">Share Name</Label>
                        <Input
                            id="shareName"
                            name="shareName"
                            value={formData.shareName}
                            onChange={handleChange}
                            placeholder="Enter share name"
                            readOnly={!!defaultShareName}
                            className={defaultShareName ? "bg-gray-100 cursor-not-allowed" : ""}
                        />
                    </div>

                    {/* Quantity */}
                    <div className="grid gap-3">
                        <Label htmlFor="quantity">Quantity</Label>
                        <Input onChange={handleChange} value={formData.quantity} id="quantity" name="quantity" type="number" placeholder="Enter quantity" />
                    </div>

                    {/* Name */}
                    <div className="grid gap-3">
                        <Label htmlFor="name">Name</Label>
                        <Input onChange={handleChange} value={formData.name} id="name" name="name" placeholder="Enter your name" />
                    </div>

                    {/* Email */}
                    <div className="grid gap-3">
                        <Label htmlFor="email">Email</Label>
                        <Input onChange={handleChange} value={formData.email} id="email" name="email" type="email" placeholder="Enter your email" />
                    </div>

                    {/* Phone */}
                    <div className="grid gap-3">
                        <Label htmlFor="phone">Phone</Label>
                        <Input onChange={handleChange} value={formData.phone} id="phone" name="phone" type="tel" placeholder="Enter your phone number" />
                    </div>

                    {/* City */}
                    <div className="grid gap-3">
                        <Label htmlFor="city">City</Label>
                        <Input onChange={handleChange} value={formData.city} id="city" name="city" placeholder="Enter your city" />
                    </div>

                    {error && <p className='text-red-500 text-sm'>{error}</p>}

                    <DialogFooter>
                        <DialogClose asChild>
                            <Button variant="outline" type="button">Cancel</Button>
                        </DialogClose>
                        <Button disabled={loading} type="submit">{loading ? 'Sending...' : 'Send Enquiry'}</Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
