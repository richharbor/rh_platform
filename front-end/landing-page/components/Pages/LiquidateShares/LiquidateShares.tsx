"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import {
  AArrowDown as BanknoteArrowDown,
  CircleCheckBig,
  CircleX,
  Handshake,
  Users,
  UserSearch as UserStar,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { postLiquidateShares } from "@/services/shareServices";

const formSchema = z.object({
  fullName: z.string().min(2, "Full name must be at least 2 characters"),
  email: z.string().email("Please enter a valid email address"),
  phone: z.string().min(10, "Phone number must be at least 10 digits"),
  profile: z.string().min(2, "Profile must be at least 2 characters"),
  shareName: z.string().min(1, "Share name is required"),
  quantity: z
    .string()
    .min(1, "Quantity is required")
    .refine(
      (val) => !isNaN(Number(val)) && Number(val) > 0,
      "Quantity must be a positive number"
    ),
  price: z
    .string()
    .min(1, "Price is required")
    .refine(
      (val) => !isNaN(Number(val)) && Number(val) > 0,
      "Price must be a positive number"
    ),
});

type FormData = z.infer<typeof formSchema>;

const features = [
  {
    icon: <UserStar className="w-8 h-8 text-rich-violet" />,
    title: "Shareholder",
    description: "Liquidate your stocks to unlock your true net worth.",
  },
  {
    icon: <Handshake className="w-8 h-8 text-rich-violet" />,
    title: "Institutional Sellers",
    description:
      "Work with our dedicated team to gain unique insights and sell block inventory.",
  },
  {
    icon: <BanknoteArrowDown className="w-8 h-8 text-rich-violet" />,
    title: "Funds",
    description: "Liquidate your Unlisted Funds with Rich Harbor.",
  },
  {
    icon: <Users className="w-8 h-8 text-rich-violet" />,
    title: "Employees",
    description: "Join us to explore new options for selling your ESOP's.",
  },
];

export default function SellSharesForm() {
  const [successOpen, setSuccessOpen] = useState<boolean>(false);
  const [errorOpen, setErrorOpen] = useState<boolean>(false);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      fullName: "",
      email: "",
      phone: "",
      profile: "",
      shareName: "",
      quantity: "",
      price: "",
    },
  });

  const handleSubmit = async (data: FormData) => {
    setIsSubmitting(true);

    try {
      const response = await postLiquidateShares(data);

      console.log(response);
      

      // Reset form on successful submission
      form.reset();
      setSuccessOpen(true);
    } catch (error) {
      console.error("Form submission error:", error);
      setErrorOpen(true);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="bg-background px-2 max-sm:px-0 py-5 mt-15"
    >
      <div className="py-20 mb-5 w-full rounded-2xl flex items-center justify-center relative px-10 max-sm:p-3 overflow-hidden bg-black">
        <motion.img
          src="https://static.seekingalpha.com/cdn/s3/uploads/getty_images/1500507449/image_1500507449.jpg?io=getty-c-w750"
          className="h-auto w-full object-center absolute inset-0 [mask-image:radial-gradient(circle,transparent,black_80%)] pointer-events-none -top-50"
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.5 }}
          transition={{ duration: 1 }}
          alt="Investment background"
        />
        <h1
          style={{ fontFamily: "Batman, sans-serif" }}
          className="text-2xl md:text-5xl lg:text-6xl font-bold text-center text-white relative z-2"
        >
          Liquidate Investments
        </h1>
      </div>

      <p className="text-xl md:text-3xl font-bold text-center mb-6 max-w-3xl mx-auto">
        We can assist you with the liquidation of Unlisted, Startup Shares and
        ESOPs
      </p>

      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(handleSubmit)}
          className="space-y-6 max-w-3xl mx-auto p-6 border rounded shadow-md"
        >
          {/* Full Name + Email */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="fullName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Full Name *</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter Full Name" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email *</FormLabel>
                  <FormControl>
                    <Input type="email" placeholder="Enter Email" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          {/* Phone + Profile */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="phone"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Mobile Number *</FormLabel>
                  <FormControl>
                    <Input
                      type="tel"
                      placeholder="Enter Mobile Number"
                      className="appearance-none [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="profile"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Profile *</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter Profile Name" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          {/* Share Name */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="shareName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Share Name *</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter Share Name" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          {/* Quantity + Price */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="quantity"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Quantity Available *</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      placeholder="Enter Quantities"
                      className="appearance-none [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="price"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Selling Price (Per share) *</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      placeholder="Enter Selling Price"
                      className="appearance-none [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <Button type="submit" className="w-full" disabled={isSubmitting}>
            {isSubmitting ? "Submitting..." : "Submit"}
          </Button>
        </form>
      </Form>

      {/* Success Dialog */}
      <Dialog open={successOpen} onOpenChange={setSuccessOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Success 🎉</DialogTitle>
            <DialogDescription>
              Your form has been submitted successfully.
            </DialogDescription>
          </DialogHeader>
          <div className="my-5 text-green-500 w-full">
            <CircleCheckBig className="mx-auto" size={100} />
          </div>
          <Button onClick={() => setSuccessOpen(false)}>Close</Button>
        </DialogContent>
      </Dialog>

      {/* Error Dialog */}
      <Dialog open={errorOpen} onOpenChange={setErrorOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Error</DialogTitle>
            <DialogDescription>
              Unable to submit your form. Please try again later.
            </DialogDescription>
          </DialogHeader>
          <div className="my-5 text-red-500 w-full">
            <CircleX className="mx-auto" size={100} />
          </div>
          <Button onClick={() => setErrorOpen(false)}>Close</Button>
        </DialogContent>
      </Dialog>

      <section className="relative text-gray-100 py-20 px-6 md:px-12 lg:px-20">
        <div className="max-w-6xl mx-auto text-center">
          <h2 className="text-4xl md:text-5xl font-bold mb-6 text-rich-violet font-batman">
            Liquidate your Unlisted & Startup Investments
          </h2>
          <p className="text-lg text-gray-400 max-w-2xl mx-auto mb-14">
            Whether you’re looking to diversify your portfolio or seeking
            liquidity from an Early Stage Investment, Rich Harbor can help you
            get the liquidity you deserve. Liquidate your Unlisted & Startup
            Investments through Rich Harbor.
          </p>

          <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-4">
            {features.map((feature, index) => (
              <div
                key={index}
                className="flex z-10 flex-col items-center bg-card rounded-2xl p-6 shadow-md hover:shadow-xl hover:scale-105 transition-all duration-300"
              >
                <div className="mb-4">{feature.icon}</div>
                <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
                <p className="text-gray-400 text-sm">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </motion.div>
  );
}
