"use client";

import { Button } from "@/components/ui/button";
import { CircleX, Mail, Phone } from "lucide-react";
import { useState } from "react";
import { motion } from "framer-motion";
import { CircleCheckBig } from "lucide-react";
import { sendEmail } from "@/services/emailServices";

import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { z } from "zod";

const formSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
  phone: z
    .string()
    .regex(/^[0-9]{10}$/, "Phone number must be 10 digits"),
  subject: z.string().min(1, "Please select a subject"),
  source: z.string().min(1, "Please select a source"),
  message: z.string().min(5, "Message must be at least 5 characters"),
});

type FormData = z.infer<typeof formSchema>;

import { convertToHtmlForm } from "@/helpers/emailHelper";




export default function ContactForm() {
  const [formData, setFormData] = useState<FormData>({
    name: "",
    email: "",
    phone: "",
    subject: "",
    source: "",
    message: "",
  });
  const [SuccOpen, setSuccOpen] = useState<boolean>(false);
  const [ErrOpen, setErrOpen] = useState<boolean>(false);
  const [error, setError] = useState<string>("");

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  // Handle submit
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const result = formSchema.safeParse(formData);

    if (!result.success) {
      // Get first error message
      const firstError = result.error.issues[0]?.message;
      setError(firstError);
      return;
    }



    const emailHTML = convertToHtmlForm(formData);
    const email = {
      to: "frontend@rhinontech.com",
      subject: formData.subject + " - " + formData.name,
      content: emailHTML,
      isHtml: true,
    };
    try {
      setError("");
      const response = await sendEmail(email);
      if (response.status === 200) {
        setSuccOpen(true);
      }
    } catch (error) {
      setErrOpen(true);
    }

    setFormData({
      name: "",
      email: "",
      phone: "",
      subject: "",
      source: "",
      message: "",
    });
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="bg-background px-2 py-5 mt-15 mx-auto max-w-2xl"
    >
      <h1
        style={{ fontFamily: "Batman, sans-serif" }}
        className="text-2xl md:text-3xl lg:text-4xl  font-bold text-center mb-6"
      >
        Contact Us
      </h1>
      <p className="text-center mb-6 text-muted-foreground">
        We’re here to help and answer any questions you might have. We look
        forward to hearing from you!
      </p>
      <form
        onSubmit={handleSubmit}
        className="space-y-4 p-6 border rounded mx-auto"
      >
        {/* Name + Email */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="flex flex-col gap-2">
            <label className="block font-medium">Name</label>
            <Input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="Name"
              className="border p-2 w-full rounded"
              required
            />
          </div>
          <div className="flex flex-col gap-2">
            <label className="block font-medium">Email</label>
            <Input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="Email"
              className="border p-2 w-full rounded"
              required
            />
          </div>
        </div>

        {/* Phone + Subject */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="flex flex-col gap-2">
            <label className="block font-medium">Phone Number</label>
            <Input
              type="number"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              placeholder="Phone"
              className="border p-2 w-full rounded appearance-none [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none [&::-moz-inner-spin-button]:appearance-none"
              required
            />
          </div>
          <div className="flex flex-col gap-2">
            <label className="block font-medium">Subject</label>
            <Select
              name="subject"
              value={formData.subject}
              onValueChange={(value: string) =>
                setFormData((prev) => ({ ...prev, subject: value }))
              }
            >
              <SelectTrigger className="w-full border rounded p-2 bg-background">
                <SelectValue placeholder="Select an Option" />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  <SelectItem value="buy">Buy</SelectItem>
                  <SelectItem value="sell">Sell</SelectItem>
                  <SelectItem value="partner">Want to be a partner</SelectItem>
                </SelectGroup>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Source */}
        <div className="flex flex-col gap-2">
          <label className="block font-medium">Where did you find us?</label>
          <Select
            name="source"
            value={formData.source}
            onValueChange={(value: string) =>
              setFormData((prev) => ({ ...prev, source: value }))
            }
          >
            <SelectTrigger className="w-full border rounded p-2 bg-background">
              <SelectValue placeholder="Select an Option" />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                <SelectItem value="google">Google</SelectItem>
                <SelectItem value="social">Social Media</SelectItem>
                <SelectItem value="friend">Friend/Referral</SelectItem>
                <SelectItem value="other">Other</SelectItem>
              </SelectGroup>
            </SelectContent>
          </Select>
        </div>

        {/* Message */}
        <div className="flex flex-col gap-2">
          <label className="block font-medium">Message</label>
          <Textarea
            name="message"
            value={formData.message}
            onChange={handleChange}
            placeholder="Message"
            rows={4}
            className="border p-2 w-full rounded"
            required
          />
        </div>
        <p className="text-red-500 text-sm">{error}</p>

        {/* Submit */}
        <Button type="submit">Submit</Button>
      </form>

      {/*Success Dialog */}

      <Dialog open={SuccOpen} onOpenChange={setSuccOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Success 🎉</DialogTitle>
            <DialogDescription>
              Your data has been sent successfully.
            </DialogDescription>
          </DialogHeader>
          <div className="my-5 text-green-500 w-full ">
            <CircleCheckBig className="mx-auto font-light" size={100} />
          </div>
          <Button onClick={() => setSuccOpen(false)}>Close</Button>
        </DialogContent>
      </Dialog>

      {/* Error Dialog */}

      <Dialog open={ErrOpen} onOpenChange={setErrOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Error</DialogTitle>
            <DialogDescription>Unable to sent data.</DialogDescription>
          </DialogHeader>
          <div className="my-5 text-red-500 w-full ">
            <CircleX className="mx-auto font-light" size={100} />
          </div>
          <Button onClick={() => setErrOpen(false)}>Close</Button>
        </DialogContent>
      </Dialog>

      <div className="flex justify-center max-sm:flex-col py-10 max-sm:py-5 gap-10 max-sm:gap-3 mt-5 border-t">
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
      </div>
    </motion.div>
  );
}
