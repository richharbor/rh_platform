"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Cookies from "js-cookie";

import { Card, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Search, ChevronRight } from "lucide-react";

import { getAllSellShares } from "@/services/sell/sellService";
import Loading from "@/app/loading";
import { getTieredPath } from "@/helpers/getTieredPath";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { putBuyQuery } from "@/services/purchase/bookingService";
import { toast } from "sonner";
import useAuthStore from "@/helpers/authStore";


interface ShareItem {
  id: number;
  shareName: string;
  quantityAvailable: string;
  price: string;
  deliveryTimeline: string;
  confirmDelivery: boolean;
  shareInStock: boolean;
  preShareTransfer: boolean;
  fixed: boolean;
  moq: string;
  shareId: number;
}
export interface ShareInfo {
  id: number;
  name: string;
  symbol: string | null;
  price: string;
}

export interface SellerInfo {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
}

export interface SellItem {
  id: number;
  userId: number;
  shareId: number;
  price: string;
  quantityAvailable: number;
  minimumOrderQuatity: number | null;
  shareInStock: boolean;
  preShareTransfer: boolean;
  fixedPrice: boolean;
  confirmDelivery: boolean;
  deliveryTimeline: string;
  endSellerLocation: string;
  endSellerName: string;
  endSellerProfile: string;
  createdAt: string;
  updatedAt: string;
  share: ShareInfo;
  seller: SellerInfo;
  bestDeal: boolean;
  approved: boolean;
}

interface GroupedShares {
  shareId: number;
  shareName: string;
  updatedAt: string;
  listings: SellItem[];
}

interface GroupedSharesWithStats extends GroupedShares {
  minPrice: number;
  maxPrice: number;
  minQuantity: number;
  maxQuantity: number;
  bestDeal: boolean;
}
interface QueryDataProps {
  shareName: string;
  quantity: string;
  price: string;
}

export default function Buying() {
  const [shares, setShares] = useState<GroupedSharesWithStats[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAll, setIsAll] = useState(true);
  const [isQueryOpen, setIsQueryOpen] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const tier = useAuthStore((state) => state.user?.tier);
  const [queryData, setQueryData] = useState<QueryDataProps>({
    shareName: "",
    quantity: "",
    price: ""
  })

  const currentRole = Cookies.get("currentRole");

  // const onboardingStatus = useAuthStore((state) => state.onboardingStatus);
  const route = useRouter();
  const onboardingRequired = useAuthStore((state) => state.onboardingRequired);
  const onboardingStatus = Cookies.get('onboardingStatus')


  // const groupedByShareId = dummyShares.reduce((acc, item) => {
  //   const shareId = item.shareId;

  //   // if group not created yet, create it
  //   if (!acc[shareId]) {
  //     acc[shareId] = {
  //       shareId,
  //       shareName: item.share.name,
  //       updatedAt: item.updatedAt,
  //       listings: [],
  //     };
  //   }

  //   // push current item into its group
  //   acc[shareId].listings.push(item);

  //   return acc;
  // }, {} as Record<number, { shareId: number; shareName: string; updatedAt: string; listings: typeof dummyShares }>);

  // // convert object to array (optional)
  // const groupedArray = Object.values(groupedByShareId);

  // console.log(groupedArray);

  useEffect(() => {
    const fetchShares = async () => {
      try {
        const response = await getAllSellShares();
        if (response.success && response.data.length) {
          // Map API SellItem[] directly to ShareItem[]
          // const mappedShares: ShareItem[] = response.data.map((sell: any) => ({
          //   id: sell.id,
          //   shareId: sell.share.id,
          //   shareName: sell.share.name,
          //   quantityAvailable: String(sell.quantityAvailable),
          //   price: sell.price,
          //   deliveryTimeline: sell.deliveryTimeline,
          //   confirmDelivery: sell.confirmDelivery,
          //   shareInStock: sell.shareInStock,
          //   preShareTransfer: sell.preShareTransfer,
          //   fixed: sell.fixedPrice,
          //   moq: String(sell.minimumOrderQuatity),
          // }));
          // // ✅ Remove duplicates by shareName
          // const uniqueShares = Array.from(
          //   new Map(mappedShares.map((item) => [item.shareName, item])).values()
          // );
          // setShares(uniqueShares);

          const groupedByShareId = response.data.reduce((acc: any, item: any) => {
            const shareId = item.shareId;

            // if group not created yet, create it
            if (!acc[shareId]) {
              acc[shareId] = {
                shareId,
                shareName: item.share.name,
                updatedAt: item.updatedAt,
                listings: [],
              };
            }

            // push current item into its group
            acc[shareId].listings.push(item);

            return acc;
          }, {} as Record<number, { shareId: number; shareName: string; updatedAt: string; listings: SellItem }>);

          // convert object to array (optional)
          const groupedArray = Object.values(groupedByShareId) as GroupedShares[];

          const groupedWithStats = enhanceGroupedShares(groupedArray);

          setShares(groupedWithStats);


        }
      } catch (error) {
        console.error("Failed to fetch shares:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchShares();
  }, []);

  const enhanceGroupedShares = (groups: GroupedShares[]): GroupedSharesWithStats[] =>
    groups.map((group) => {
      const prices = group.listings.map((l) => parseFloat(l.price));
      const quantities = group.listings.map((l) => l.quantityAvailable);
      const bestDeal = group.listings.some((l) => (l.bestDeal === true && l.approved === true));

      return {
        ...group,
        minPrice: Math.min(...prices),
        maxPrice: Math.max(...prices),
        minQuantity: Math.min(...quantities),
        maxQuantity: Math.max(...quantities),
        bestDeal,
      };
    });

  const handleSendQuery = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSending(true);
    try {
      // Map frontend form fields to backend API field names
      const payload = {
        shareName: queryData.shareName,
        quantity: parseInt(queryData.quantity),
        price: parseFloat(queryData.price),
      };


      const result = await putBuyQuery(payload);

      if (result.success) {
        // Redirect to selling page after successful creation
        toast.success("Query raised successfully");
        setQueryData({
          shareName: "",
          quantity: "",
          price: "",
        })
        setIsQueryOpen(false);

      }
    } catch (error: any) {
      console.error("Failed to put query:", error);
      toast.error("Failed to put query. Please try again.");
    } finally {
      setIsSending(false);
    }
  }



  if (loading) {
    return (
      <div className="h-[calc(100vh-4.7rem)] flex flex-col relative overflow-hidden rounded-md">
        <Loading areaOnly={true} />
      </div>
    );
  }



  return (
    <div className="flex h-[calc(100vh-4.5rem)] flex-col relative overflow-hidden gap-6 w-full rounded-lg border-2 max-md:border-none">
      <div className="flex items-end justify-between px-6 pt-6 max-md:px-3 gap-3">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Buy</h2>
          <p className="text-muted-foreground">
            Manage super admin and admin users
          </p>
        </div>
        {(tier ?? 0) > 3 &&
          <Button onClick={() => {
            if (onboardingRequired && onboardingStatus === 'pending') {
              toast.info("Wait for the admin to approve your onboarding");
              return;
            }
            if (onboardingRequired && onboardingStatus !== 'approved') {
              toast.error("Please complete onboarding to raise a query");
              return;
            }

            setIsQueryOpen(true)
          }
          }
            className="px-7 py-2 mr-10 max-md:mr-0"
          >
            Put Query
          </Button>}
      </div>

      {/* Search */}
      <div className="relative ml-6 max-w-xl max-md:mx-2">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 h-4 w-4" />
        <Input placeholder="Search Shares..." className="pl-10" />
      </div>

      {/* <div className="-mb-6 flex gap-2">
        <button
          onClick={() => setIsAll(true)}
          className={`px-3 py-1 border-b font-medium transition-all duration-300 ease-in-out ${isAll
            ? 'border-primary text-primary'
            : 'border-transparent text-muted-foreground cursor-pointer hover:scale-105'
            }`}
        >
          All
        </button>
        <button
          onClick={() => setIsAll(false)}
          className={`px-3 py-1 border-b font-medium transition-all duration-300 ease-in-out ${!isAll
            ? 'border-primary text-primary'
            : 'border-transparent text-muted-foreground cursor-pointer hover:scale-105'
            }`}
        >
          Best Deals
        </button>
      </div> */}
      {!shares.length &&

        (<div className="h-full flex flex-col relative justify-center items-center overflow-hidden rounded-md">
          No shares found.
        </div>)

      }

      {/* Table / Cards */}
      <div className="flex-1 min-h-0 border-t">
        <ScrollArea className="h-full">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 p-4">
            {shares.map((share, index) => (
              <Card
                key={index}
                onClick={() => {
                  const base = getTieredPath();
                  route.push(`/${base}/buy/${share.shareId}`);
                }}
                className="group relative cursor-pointer border border-border/50 bg-card hover:shadow-lg hover:border-primary/40 transition-all duration-300 rounded-2xl p-4">
                {/* Top Row */}
                <div className="flex items-center justify-between mb-2">
                  <CardTitle className="text-lg font-semibold text-foreground group-hover:text-primary transition-colors">
                    {share.shareName}
                  </CardTitle>
                  {!share.bestDeal && <ChevronRight className="w-5 h-5 text-muted-foreground group-hover:text-primary transition-transform duration-300 group-hover:translate-x-1" />}
                </div>

                {/* Price Section */}
                <div className="flex items-baseline gap-2">
                  <span className="text-sm text-muted-foreground">Price:</span>
                  <span className="text-xl font-bold text-foreground tracking-tight">
                    {share.listings.length > 1 ? "₹" + share.minPrice + " - ₹" + share.maxPrice : share.maxPrice}
                  </span>
                </div>

                {/* Divider */}
                <div className="my-3 h-px bg-border" />

                {/* Quantity + Deal Info */}
                <div className="flex justify-between text-sm text-muted-foreground">
                  <p>
                    <strong>Available:</strong> {share.listings.length > 1 ? share.minQuantity + " - " + share.maxQuantity : share.maxQuantity}
                  </p>

                </div>
                {/* Optional Badge for stock status */}
                {share.bestDeal && (
                  <span className="absolute top-3 right-3 bg-green-100 text-green-700 text-xs font-medium px-2 py-0.5 rounded-full">
                    Best Deal
                  </span>
                )}

              </Card>
            ))}
          </div>
        </ScrollArea>
      </div>


      {/* put query model */}
      <Dialog open={isQueryOpen} onOpenChange={setIsQueryOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Put Buy Query</DialogTitle>
            <p className="text-sm text-muted-foreground">
              Enter the share you want to buy.
            </p>
          </DialogHeader>
          <form onSubmit={handleSendQuery}>
            <div className=" grid space-y-4 py-4">
              <div className="flex flex-col space-y-2">
                <Label htmlFor="text">Share Name</Label>
                <Input
                  id="share-name"
                  placeholder="Enter Share Name"
                  value={queryData.shareName}
                  onChange={(e) => {
                    setQueryData({ ...queryData, shareName: e.target.value });
                  }}
                  disabled={isSending}
                />
              </div>
              <div className="flex flex-col space-y-2">
                <Label htmlFor="number">Price</Label>
                <Input
                  id="price"
                  placeholder="Enter Price"
                  value={queryData.price}
                  onChange={(e) => {
                    const value = e.target.value.replace(/[^0-9.]/g, "");
                    setQueryData({ ...queryData, price: value });
                  }}
                  disabled={isSending}
                />
              </div>
              <div className="flex flex-col space-y-2">
                <Label htmlFor="number">Quantity</Label>
                <Input
                  id="quantity"
                  placeholder="Enter Quantity"
                  value={queryData.quantity}
                  onChange={(e) => {
                    const value = e.target.value.replace(/[^0-9]/g, "");
                    setQueryData({ ...queryData, quantity: value });
                  }}
                  disabled={isSending}
                />
              </div>

            </div>

            <DialogFooter>
              <Button variant="outline" disabled={isSending} >
                Cancel
              </Button>
              <Button disabled={isSending} type="submit">{isSending ? "Sending..." : "Send"}</Button>
            </DialogFooter>
          </form>

        </DialogContent>
      </Dialog>
    </div>
  );
}
