"use client";

import { use, useEffect, useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import {
  Form,
  FormField,
  FormItem,
  FormControl,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { useRouter } from "next/navigation";
import Cookies from "js-cookie";
import { createSell, getSellbySellId, getShareByShareId, getUsersAllShares, updateSell } from "@/services/sell/sellService";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import { getTieredPath } from "@/helpers/getTieredPath";
import Loading from "@/app/loading";

const deliveryTimelineOptions = [
  "t",
  "t+1",
  "t+2",
  "t+3",
  "t+4",
  "t+5",
] as const;

const baseSchema = z.object({
  shareName: z.string().min(1, "Please Enter the share name"),
  quantityAvailable: z
    .string()
    .min(1, "Quantity is required")
    .refine(
      (v) => !isNaN(Number(v)) && Number(v) > 0,
      "Must be a positive number"
    ),
  price: z
    .string()
    .min(1, "Price is required")
    .refine(
      (v) => !isNaN(Number(v)) && Number(v) > 0,
      "Must be a positive number"
    ),
  deliveryTimeline: z.enum(deliveryTimelineOptions, {
    error: "Select a timeline",
  }),
  moq: z
    .string()
    .min(1, "Min quantity is required")
    .refine(
      (v) => !isNaN(Number(v)) && Number(v) > 0,
      "Must be a positive number"
    ),
  fixed: z.boolean(),
  confirmDelivery: z.boolean(),
  shareInStock: z.boolean(),
  preShareTransfer: z.boolean(),
  bestDeal: z.boolean(),
  endSellerName: z.string().optional(),
  endSellerProfile: z.string().optional(),
  endSellerLocation: z.string().optional(),
});

const formSchema = baseSchema.superRefine((data, ctx) => {
  // If share is NOT in stock, require end-seller details
  if (!data.shareInStock) {
    if (!data.endSellerName || data.endSellerName.trim().length < 2) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["endSellerName"],
        message: "End-Seller name is required",
      });
    }
    if (!data.endSellerProfile || data.endSellerProfile.trim().length < 2) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["endSellerProfile"],
        message: "End-Seller profile is required",
      });
    }
    if (!data.endSellerLocation || data.endSellerLocation.trim().length < 2) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["endSellerLocation"],
        message: "End-Seller location is required",
      });
    }
  }
});

type FormValues = z.infer<typeof formSchema>;

interface AddSharePageProps {
  id?: string;
  bestDeal?: boolean;
  update?: boolean;
}
export interface ShareDetail {
  id: number;
  name: string;
  symbol: string | null;
  price: string;
}

export interface ShareItem {
  id: number;
  userId: number;
  shareId: number;
  price: string;
  quantityAvailable: number;
  minimumOrderQuatity: number;
  shareInStock: boolean;
  preShareTransfer: boolean;
  fixedPrice: boolean;
  confirmDelivery: boolean;
  deliveryTimeline: string;
  endSellerLocation: string;
  endSellerName: string;
  endSellerProfile: string;
  createdAt: string; // ISO date string
  updatedAt: string; // ISO date string
  share: ShareDetail;
}

export default function AddStockForm({ id, bestDeal, update }: AddSharePageProps) {
  const currentRole = Cookies.get("currentRole");
  const [loading, setLoading] = useState(false);
  const [isFillingData, setIsFillingData] = useState(true);
  const [myShares, setMyShares] = useState<ShareItem[] | null>(null);
  const [initialData, setInitialData] = useState<any>(null);
  // console.log("ShareName =>", shareName)

  const route = useRouter();

  useEffect(() => {
    getUsersShares();
  }, []);

  const getUsersShares = async () => {
    try {
      const response = await getUsersAllShares();
      console.log(response.data);
      setMyShares(response?.data);
    } catch (error) {
      console.log("failed to get shares");
    } finally {
      setLoading(false);
    }
  };

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      shareName: "",
      quantityAvailable: "",
      price: "",
      deliveryTimeline: "t",
      moq: "",
      fixed: false,
      confirmDelivery: false,
      shareInStock: true,
      preShareTransfer: false,
      bestDeal: false,
      endSellerName: "",
      endSellerProfile: "",
      endSellerLocation: "",
    },
    mode: "onTouched",
  });

  useEffect(() => {
    const fetchData = async () => {
      if (!id) {
        setIsFillingData(false)
        return;
      }; // no id → normal create mode

      try {
        if (update) {
          // ✅ Update mode - fetch sell record
          const data = await getSellbySellId(id);
          setInitialData(data);
          form.reset({
            shareName: data.share.name,
            quantityAvailable: String(data.quantityAvailable),
            price: String(data.price),
            deliveryTimeline: data.deliveryTimeline,
            moq: String(data.minimumOrderQuatity),
            fixed: data.fixedPrice,
            confirmDelivery: data.confirmDelivery,
            shareInStock: data.shareInStock,
            preShareTransfer: data.preShareTransfer,
            bestDeal: data.preShareTransfer,
            endSellerName: data.endSellerName,
            endSellerProfile: data.endSellerProfile,
            endSellerLocation: data.endSellerLocation,
          });
        } else {
          // ✅ View/Pre-fill share only
          const data = await getShareByShareId(id);
          setInitialData(data);
          form.reset({
            ...form.getValues(), // keep rest defaults
            shareName: data.name,
          });
        }
      } catch (err) {
        console.error(err);
        toast.error("Failed to load data");
      } finally {
        setIsFillingData(false);
      }
    };

    fetchData();
  }, [id, update]);

  const shareInStock = form.watch("shareInStock");

  const onSubmit = async (values: FormValues) => {
    setLoading(true);
    if (update) {

      try {
        // Map frontend form fields to backend API field names
        const payload = {
          shareName: values.shareName,
          quantityAvailable: Number(values.quantityAvailable),
          price: Number(values.price),
          deliveryTimeline: values.deliveryTimeline,
          moq: values.moq ? Number(values.moq) : undefined,
          fixedPrice: values.fixed,
          confirmDelivery: values.confirmDelivery,
          shareInStock: values.shareInStock,
          preShareTransfer: values.preShareTransfer,
          bestDeal: values.bestDeal,
          endSellerName: values.endSellerName,
          endSellerProfile: values.endSellerProfile,
          endSellerLocation: values.endSellerLocation,
        };

        console.log("[update] payload:", payload);

        const result = await updateSell(id as string, payload);

        if (result.success) {
          // Redirect to selling page after successful creation
          toast.success("Sell is updated  successfully");
          const base = getTieredPath();
          route.push(`/${base}/sell`);
        }
      } catch (error: any) {
        console.error("Failed to update sell:", error);
        toast.error("Failed to update sell. Please try again.");
      } finally {
        setLoading(false);
      }
      return;

    }


    try {
      // Map frontend form fields to backend API field names
      const payload = {
        shareName: values.shareName,
        quantityAvailable: Number(values.quantityAvailable),
        price: Number(values.price),
        deliveryTimeline: values.deliveryTimeline,
        moq: values.moq ? Number(values.moq) : undefined,
        fixedPrice: values.fixed,
        confirmDelivery: values.confirmDelivery,
        shareInStock: values.shareInStock,
        preShareTransfer: values.preShareTransfer,
        bestDeal: values.bestDeal,
        endSellerName: values.endSellerName,
        endSellerProfile: values.endSellerProfile,
        endSellerLocation: values.endSellerLocation,
      };

      console.log("[addStock] payload:", payload);

      const found = myShares?.find(
        (item) => item.share.name === payload.shareName
      );

      if (found) {
        toast.error("You alread have that share");
        setLoading(false);
        return;
      }




      // we need to call adding best deal function over here base on the condition like best deal is true or false






      const result = await createSell(payload);

      if (result.success) {
        // Redirect to selling page after successful creation
        toast.success("Share is created successfully");
        const base = getTieredPath();
        route.push(`/${base}/sell`);
      }
    } catch (error: any) {
      console.error("Failed to create sell:", error);
      toast.error("Failed to create sell. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const timelineItems = useMemo(() => deliveryTimelineOptions, []);


  if (isFillingData) {
    return (
      <div className="h-[calc(100vh-4.7rem)] flex flex-col relative overflow-hidden rounded-md">
        <Loading areaOnly={true} />
      </div>
    );
  }

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="space-y-6 p-6 max-w-3xl mx-auto rounded-lg">
        {/* Quantity + Price */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="shareName"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Share Name</FormLabel>
                <FormControl>
                  <Input
                    type="text"
                    inputMode="text"
                    placeholder="Enter share name"
                    readOnly={initialData}
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
            name="quantityAvailable"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Quantity Available</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    inputMode="numeric"
                    placeholder="Enter quantity"
                    className="appearance-none [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="price"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Price</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    inputMode="decimal"
                    placeholder="Enter price"
                    className="appearance-none [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Delivery timeline */}
          <FormField
            control={form.control}
            name="deliveryTimeline"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Delivery timeline</FormLabel>
                <FormControl>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select timeline" />
                    </SelectTrigger>
                    <SelectContent>
                      {timelineItems.map((opt) => (
                        <SelectItem key={opt} value={opt}>
                          {opt.toUpperCase()}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="moq"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Minimum order quantity</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    inputMode="decimal"
                    placeholder="Enter Minimum order quantity"
                    className="appearance-none [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Delivery timeline */}
          <FormField
            control={form.control}
            name="fixed"
            render={({ field }) => (
              <FormItem className="flex items-center gap-2 justify-between rounded-md border p-3">
                <div className="space-y-1">
                  <FormLabel>Fixed price</FormLabel>
                  <p className="text-sm text-muted-foreground">
                    The price of share is fixed.
                  </p>
                </div>
                <FormControl>
                  <div className="flex items-center gap-2">
                    <Label htmlFor="fixed-no" className="text-sm">
                      No
                    </Label>
                    <Switch
                      id="fixed"
                      checked={field.value}
                      onCheckedChange={field.onChange}
                      aria-label="Fixed"
                    />
                    <Label htmlFor="fixed-yes" className="text-sm">
                      Yes
                    </Label>
                  </div>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {/* Toggles */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="confirmDelivery"
            render={({ field }) => (
              <FormItem className="flex items-center gap-2 justify-between rounded-md border p-3">
                <div className="space-y-1">
                  <FormLabel>Confirm Delivery</FormLabel>
                  <p className="text-sm text-muted-foreground">
                    Confirm you can deliver as per timeline.
                  </p>
                </div>
                <FormControl>
                  <div className="flex items-center gap-2">
                    <Label htmlFor="confirmDelivery-no" className="text-sm">
                      No
                    </Label>
                    <Switch
                      id="confirmDelivery"
                      checked={field.value}
                      onCheckedChange={field.onChange}
                      aria-label="Confirm Delivery"
                    />
                    <Label htmlFor="confirmDelivery-yes" className="text-sm">
                      Yes
                    </Label>
                  </div>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="shareInStock"
            render={({ field }) => (
              <FormItem className="flex items-center gap-2 justify-between rounded-md border p-3">
                <div className="space-y-1">
                  <FormLabel>Share in stock</FormLabel>
                  <p className="text-sm text-muted-foreground">
                    Do you currently hold the shares?
                  </p>
                </div>
                <FormControl>
                  <div className="flex items-center gap-2">
                    <Label htmlFor="shareInStock-no" className="text-sm">
                      No
                    </Label>
                    <Switch
                      id="shareInStock"
                      checked={field.value}
                      onCheckedChange={field.onChange}
                      aria-label="Share in stock"
                    />
                    <Label htmlFor="shareInStock-yes" className="text-sm">
                      Yes
                    </Label>
                  </div>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {/* Conditional section when NOT in stock */}
        {!shareInStock && (
          <div className="rounded-lg border p-4 space-y-4">
            <p className="text-sm font-medium">End-Seller Details</p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <FormField
                control={form.control}
                name="endSellerName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>End-Seller name</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter name" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="endSellerProfile"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>End-Seller profile</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter profile" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="endSellerLocation"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Location</FormLabel>
                    <FormControl>
                      <Input placeholder="City, Country" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Pre share transfer toggle */}
          <FormField
            control={form.control}
            name="preShareTransfer"
            render={({ field }) => (
              <FormItem className="flex items-center justify-between rounded-md border p-3">
                <div className="space-y-1">
                  <FormLabel>Pre-share transfer</FormLabel>
                  <p className="text-sm text-muted-foreground">
                    Toggle if pre-transfer is required.
                  </p>
                </div>
                <FormControl>
                  <div className="flex items-center gap-3">
                    <Label htmlFor="preShareTransfer-no" className="text-sm">
                      No
                    </Label>
                    <Switch
                      id="preShareTransfer"
                      checked={field.value}
                      onCheckedChange={field.onChange}
                      aria-label="Pre share transfer"
                    />
                    <Label htmlFor="preShareTransfer-yes" className="text-sm">
                      Yes
                    </Label>
                  </div>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* best deal toggle */}
          <FormField
            control={form.control}
            name="bestDeal"
            render={({ field }) => (
              <FormItem className="flex items-center justify-between rounded-md border border-primary p-3">
                <div className="space-y-1">
                  <FormLabel>Best Deal</FormLabel>
                  <p className="text-sm text-muted-foreground">
                    Toggle if it is a best deal.
                  </p>
                </div>
                <FormControl>
                  <div className="flex items-center gap-3">
                    <Label htmlFor="bestDeal-no" className="text-sm">
                      No
                    </Label>
                    <Switch
                      id="bestDeal"
                      checked={field.value}
                      onCheckedChange={field.onChange}
                      aria-label="Best Deal"
                    />
                    <Label htmlFor="bestDeal-yes" className="text-sm">
                      Yes
                    </Label>
                  </div>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <Button type="submit" disabled={loading} className="w-full">
          {!update && (loading ? <Loader2 className="animate-spin" size={32} /> : "Submit")}
          {update && (loading ? <Loader2 className="animate-spin" size={32} /> : "Update")}
        </Button>
      </form>
    </Form>
  );
}
