"use client";

import React, { useState, useEffect } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useShareStore } from "@/store/useShareStore";
import { useSearchParams } from "next/navigation";
import { getSellsByShareId } from "@/services/sell/sellService";
import Loading from "@/app/loading";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { set } from "zod";
import { bookShare } from "@/services/purchase/bookingService";
import { toast } from "sonner";
import { BidShare } from "@/services/purchase/bidsService";
import useAuthStore from "@/helpers/authStore";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getSellerDetails } from "@/services/Auth/selfServices";
import { Loader2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import Cookies from "js-cookie";

interface SharePageProps {
  id: string;
}

export interface Seller {
  sellId: string;
  sellerId: string;
  quantity: string;
  price: string;
  deliveryTimeline: string;
  confirmDelivery: boolean;
  shareInStock: boolean;
  preShareTransfer: boolean;
  moq: string;
  fixed: boolean;
  actualPrice?: string;
}

export interface Share {
  id: string;
  shareName: string;
  sellers: Seller[];
}
interface Bid {
  stockId: number; // 1-5
  userId: string; // example: "user1", "user2"
  amount: number; // bid price
  quantity: number; // number of shares
  count: number; // number of bids by this user for this stock
}

interface BidData {
  sellId: number;
  quantity: string;
  bidPrice: string;
}
interface BookingData {
  sellId: number;
  quantity: string;
}

export default function SharePage({ id }: SharePageProps) {
  const [share, setShare] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [bids, setBids] = useState<Bid[] | []>([]);
  const [isBidOpen, setIsBidOpen] = useState(false);
  const [isBookingOpen, setIsBookingOpen] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [selectedSell, setSelectedSell] = useState<Seller | null>(null)
  const [isBestDeal, setIsBestDeal] = useState(false);
  const userId = useAuthStore((state) => state.user?.id);
  const tier = useAuthStore((state) => state.user?.tier);
  const [isFetching, setIsFetching] = useState(false);
  const [sellerDetail, setSellerDetail] = useState<any>(null);
  const [openSellerDetail, setOpenSellerDetail] = useState(false);
  const [bidData, setBidData] = useState<BidData>({
    sellId: 0,
    quantity: "",
    bidPrice: "",
  });
  const [bookingData, setBookingData] = useState<BookingData>({
    sellId: 0,
    quantity: "",
  });
  const onboardingRequired = useAuthStore((state) => state.onboardingRequired);
  const onboardingStatus = Cookies.get('onboardingStatus')


  useEffect(() => {
    const fetchSells = async () => {
      try {
        const data = await getSellsByShareId(id);

        setIsBestDeal(
          data.some((item: any) => item.bestDeal === true && item.approved === true)
        );

        // map API fields to your Seller interface
        const sellers = data.map((s: any) => ({
          sellId: s.id,
          sellerId: s.userId,
          quantity: s.quantityAvailable.toString(),
          price: s.price,
          deliveryTimeline: s.deliveryTimeline,
          confirmDelivery: s.confirmDelivery,
          shareInStock: s.shareInStock,
          preShareTransfer: s.preShareTransfer,
          moq: s.minimumOrderQuatity?.toString() || "-",
          fixed: s.fixedPrice,
          actualPrice: s?.actualPrice,
        }));



        setShare({ shareName: data[0]?.share.name || "", sellers });
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };

    fetchSells();
  }, [id]);

  const fetchSellerDetail = async (id: number | string) => {
    try {
      setIsFetching(true);
      const response = await getSellerDetails(id);
      setSellerDetail(response.data);
    } catch (error) {
      console.error(error);
    } finally {
      setIsFetching(false);
    }
  };

  const handleSellerIdClick = (id: number | string) => {
    fetchSellerDetail(id);
    setOpenSellerDetail(true);
  }



  if (loading) {
    return (
      <div className="h-[calc(100vh-4.7rem)] flex flex-col relative overflow-hidden rounded-md">
        <Loading areaOnly={true} />
      </div>
    );
  }
  if (!share) return <div className="h-[calc(100vh-4.7rem)] flex flex-col relative justify-center items-center overflow-hidden rounded-md">No shares found.</div>;

  // Get all prices as numbers
  let prices = share.sellers.map((seller: Seller) => parseFloat(seller.price));

  // Find min and max
  let minPrice = Math.min(...prices);
  let maxPrice = Math.max(...prices);

  const quantity = share.sellers.map((seller: Seller) =>
    parseInt(seller.quantity)
  );

  const minQuantity = Math.min(...quantity);
  const maxQuantity = Math.max(...quantity);


  const handleBook = (sellId: string) => {
    if (onboardingRequired && onboardingStatus === 'pending') {
      toast.info("Wait for the admin to approve your onboarding");
      return;
    }
    if (onboardingRequired && onboardingStatus !== 'approved') {
      toast.error("Please complete onboarding to raise a booking");
      return;
    }

    setSelectedSell(share.sellers.find((s: Seller) => s.sellId === sellId) || null);

    setBookingData({
      ...bookingData,
      sellId: parseInt(sellId),
    });
    setIsBookingOpen(true);
  }


  const handleBookingSubmit = async () => {
    setIsSending(true);
    try {
      // Map frontend form fields to backend API field names

      const payload = {
        sellId: bookingData.sellId,
        quantity: parseInt(bookingData.quantity),
      };


      const result = await bookShare(payload);

      if (result.success) {
        // Redirect to selling page after successful creation
        toast.success("Share is booked successfully");
        setBookingData({
          sellId: 0,
          quantity: "",
        })
        setIsBookingOpen(false);

      }
    } catch (error: any) {
      console.error("Failed to book share:", error);
      toast.error("Failed to book share. Please try again.");
    } finally {
      setIsSending(false);
    }

  }

  const handleBid = (sellId: string) => {
    if (onboardingRequired && onboardingStatus === 'pending') {
      toast.info("Wait for the admin to approve your onboarding");
      return;
    }
    if (onboardingRequired && onboardingStatus !== 'approved') {
      toast.error("Please complete onboarding to raise a bid");
      return;
    }


    setSelectedSell(share.sellers.find((s: Seller) => s.sellId === sellId) || null);
    setBidData({
      ...bidData,
      sellId: parseInt(sellId),
    });
    setIsBidOpen(true);
  }

  const handleBidSubmit = async () => {
    setIsSending(true);
    try {
      // Map frontend form fields to backend API field names
      const payload = {
        sellId: bidData.sellId,
        quantity: parseInt(bidData.quantity),
        bidPrice: parseFloat(bidData.bidPrice),
      };


      const result = await BidShare(payload);

      if (result.success) {
        // Redirect to selling page after successful creation
        toast.success("Bid raised successfully");
        setBidData({
          sellId: 0,
          quantity: "",
          bidPrice: "",
        })
        setIsBidOpen(false);

      }
    } catch (error: any) {
      console.error("Failed to bid share:", error);
      toast.error("Failed to bid share. Please try again.");
    } finally {
      setIsSending(false);
    }
  }

  return (
    <div className="flex h-[calc(100vh-4.5rem)]  w-full overflow-hidden rounded-lg border-2 max-md:border-none  flex-col p-6 space-y-6 max-md:p-2">
      {/* Share Details */}
      <div className=" flex gap-5 shadow-xs px-6 py-12 max-md:p-3">
        <div className="flex-1">
          {/* Header */}
          <div className="flex items-center justify-between">
            <h2 className="text-3xl mb-3 font-bold tracking-tight">
              {share.shareName}
            </h2>
            <span className={`${!isBestDeal && 'hidden'} px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800`}
            >
              {isBestDeal && "Available on Best Deals"}
            </span>
          </div>

          {/* Grid Details */}
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            <div className="flex flex-col">
              <span className="text-muted-foreground text-sm">
                Available Quantity
              </span>
              <span className="text-lg font-semibold">
                {minQuantity !== maxQuantity ? minQuantity + " - " + maxQuantity : maxQuantity}
              </span>
            </div>
            <div className="flex flex-col">
              <span className="text-muted-foreground text-sm">Price</span>
              <span className="text-lg font-semibold">
                {minPrice !== maxPrice ? "₹" + minPrice + " - ₹" + maxPrice : maxPrice}
              </span>
            </div>
          </div>
        </div>

      </div>

      {/* Sellers Table */}

      <Card className="shadow-md overflow-hidden flex flex-1 flex-col ">
        <CardHeader>
          <CardTitle>Seller Table</CardTitle>
        </CardHeader>
        <ScrollArea className="flex-1">
          <CardContent className="flex-1 min-h-0 max-md:p-2">
            {/* Desktop version table */}
            <Table className="hidden md:table">
              <TableHeader>
                <TableRow>
                  <TableHead>Seller ID</TableHead>
                  <TableHead>Quantity</TableHead>
                  <TableHead>Price</TableHead>
                  {(tier ?? 4) <= 3 && <TableHead>ActualPrice</TableHead>}
                  <TableHead>Deal Type</TableHead>
                  <TableHead>MOQ</TableHead>
                  <TableHead>Delivery Timeline</TableHead>
                  <TableHead>Confirm Delivery</TableHead>
                  <TableHead>Pre-Share Transfer</TableHead>
                  <TableHead>Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {share.sellers.map((seller: Seller, index: any) => (
                  <TableRow key={index} className={`${(userId != null && Number(userId) === Number(seller.sellerId)) && 'hidden'}`}>
                    <TableCell className="cursor-pointer" onClick={() => handleSellerIdClick(seller.sellerId)} >{seller.sellerId}</TableCell>
                    <TableCell>{seller.quantity}</TableCell>
                    <TableCell>{seller.price}</TableCell>
                    {(tier ?? 4) <= 3 && <TableCell>{seller?.actualPrice}</TableCell>}
                    <TableCell>
                      {seller.fixed ? "Fixed" : "Negotiable"}
                    </TableCell>
                    <TableCell>{seller.moq}</TableCell>
                    <TableCell>
                      {seller.deliveryTimeline}
                    </TableCell>
                    <TableCell>
                      {seller.confirmDelivery ? "Yes" : "No"}
                    </TableCell>
                    <TableCell>
                      {seller.preShareTransfer ? "Yes" : "No"}
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Button
                          onClick={() => {
                            handleBook(seller.sellId)
                          }
                          }

                          size="sm"
                          variant="default"
                        >
                          Book
                        </Button>
                        <Button
                          onClick={() => {
                            handleBid(seller.sellId)
                          }
                          }

                          size="sm"
                          variant="outline"
                        >
                          Bid
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>

            {/* Mobile version table */}
            <div className="flex flex-col gap-3 md:hidden">
              {share.sellers.map((seller: Seller, index: any) => {
                if (userId != null && Number(userId) === Number(seller.sellerId)) {
                  return null
                }
                return (
                  <Card key={index}>
                    <CardContent className="p-4 space-y-3">
                      <div className="flex items-center justify-between">
                        <span
                          className="text-sm font-medium text-primary cursor-pointer hover:underline"
                          onClick={() => handleSellerIdClick(seller.sellerId)}
                        >
                          Seller Id - {seller.sellerId}
                        </span>
                        <Badge variant={seller.fixed ? "default" : "secondary"}>{seller.fixed ? "Fixed" : "Negotiable"}</Badge>
                      </div>

                      <div className="grid grid-cols-2 gap-2 text-sm">
                        <div>
                          <span className="text-muted-foreground">Quantity:</span>
                          <span className="ml-1 font-medium">{seller.quantity}</span>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Price:</span>
                          <span className="ml-1 font-medium">{seller.price}</span>
                        </div>
                        <div>
                          <span className="text-muted-foreground">MOQ:</span>
                          <span className="ml-1 font-medium">{seller.moq}</span>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Delivery:</span>
                          <span className="ml-1 font-medium">{seller.deliveryTimeline}</span>
                        </div>
                      </div>

                      <div className="flex gap-4 text-sm">
                        <div className="flex items-center gap-1">
                          <span className="text-muted-foreground">Confirm Delivery:</span>
                          <span className={seller.confirmDelivery ? "text-green-600" : "text-red-600"}>
                            {seller.confirmDelivery ? "Yes" : "No"}
                          </span>
                        </div>
                        <div className="flex items-center gap-1">
                          <span className="text-muted-foreground">Pre-Transfer:</span>
                          <span className={seller.preShareTransfer ? "text-green-600" : "text-red-600"}>
                            {seller.preShareTransfer ? "Yes" : "No"}
                          </span>
                        </div>
                      </div>

                      <div className="flex gap-2 pt-2">
                        <Button
                          onClick={() => handleBook(seller.sellId)}
                          size="sm"
                          variant="default"
                          className="flex-1">
                          Book
                        </Button>
                        <Button onClick={() => handleBid(seller.sellId)} size="sm" variant="outline" className="flex-1">
                          Bid
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                )
              })}
            </div>


          </CardContent>
        </ScrollArea>


      </Card>




      {/* Bid dialog */}
      <Dialog open={isBidOpen} onOpenChange={setIsBidOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Raise a Bid</DialogTitle>
            <p className="text-sm text-muted-foreground">
              Enter your bid amount below. <br />
              <span className={`${(bidData.quantity !== "" && selectedSell !== null && Number(bidData.quantity) < Number(selectedSell.moq)) && 'text-red-500'}  ${(bidData.bidPrice !== "" && selectedSell !== null && Number(bidData.bidPrice) < Number(selectedSell.price) - 5) && 'text-red-500'}`}>The quantity must be greater then MOQ and bid price must be greater then price - 5</span>
            </p>
          </DialogHeader>
          <div className=" grid gap-4 space-y-4 py-4">
            <div className="flex flex-col space-y-2">
              <Label htmlFor="number">Bidding Price</Label>
              <Input
                id="price"
                placeholder="Enter Price"
                value={bidData.bidPrice}
                onChange={(e) => {
                  const value = e.target.value.replace(/[^0-9.]/g, "");
                  setBidData({ ...bidData, bidPrice: value });
                }}
                disabled={isSending}
              />
            </div>
            <div className="flex flex-col space-y-2">
              <Label htmlFor="number">Quantity</Label>
              <Input
                id="quantity"
                placeholder="Enter Quantity"
                value={bidData.quantity}
                onChange={(e) => {
                  const value = e.target.value.replace(/[^0-9]/g, "");
                  setBidData({ ...bidData, quantity: value });
                }}
                disabled={isSending}
              />
            </div>

          </div>
          <DialogFooter className="gap-2">
            <Button
              variant="outline"
              onClick={() => setIsBidOpen(false)}
              disabled={isSending}
            >
              Cancel
            </Button>
            <Button onClick={handleBidSubmit} disabled={isSending || bidData.bidPrice === "" || bidData.quantity === "" || (selectedSell != null && !isNaN(Number(selectedSell.moq))
              ? Number(bidData.quantity) < Number(selectedSell.moq)
              : false)
              || (selectedSell != null && !isNaN(Number(selectedSell.price))
                ? Number(bidData.bidPrice) < (Number(selectedSell.price) - 5)
                : false)
            }>
              {isSending ? "Sending..." : "Send"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>


      {/* Booking dialog */}
      <Dialog open={isBookingOpen} onOpenChange={setIsBookingOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Book the Share</DialogTitle>
            <p className="text-sm text-muted-foreground">
              Enter your booking quantity below to book this share. <br />
              <span className={`${(bookingData.quantity !== "" && selectedSell !== null && Number(bookingData.quantity) < Number(selectedSell.moq)) && 'text-red-500'}`}>The quantity must be greater then MOQ</span>
            </p>
          </DialogHeader>
          <div className=" grid gap-4 space-y-4 py-4">
            <div className="flex flex-col space-y-2">
              <Label htmlFor="number">Quantity</Label>
              <Input
                id="quantity"
                placeholder="Enter Quantity"
                // className={`${(selectedSell !== null && Number(bookingData.quantity) <= Number(selectedSell.moq))}`}
                value={bookingData.quantity}
                onChange={(e) => {
                  const value = e.target.value.replace(/[^0-9]/g, "");
                  setBookingData({ ...bookingData, quantity: value });
                }}
                disabled={isSending}
              />
            </div>

          </div>
          <DialogFooter className="gap-2">
            <Button
              variant="outline"
              onClick={() => setIsBookingOpen(false)}
              disabled={isSending}
            >
              Cancel
            </Button>
            <Button
              onClick={handleBookingSubmit}
              disabled={
                isSending ||
                bookingData.quantity === "" ||
                (selectedSell != null && !isNaN(Number(selectedSell.moq))
                  ? Number(bookingData.quantity) < Number(selectedSell.moq)
                  : false)
              }
            >
              {isSending ? "Sending..." : "Send"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>


      {/* seller detail dialog */}
      <Dialog
        open={openSellerDetail}
        onOpenChange={setOpenSellerDetail}
      >
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Seller Details</DialogTitle>
          </DialogHeader>

          {isFetching ? (
            // 🌀 Loading state
            <div className="flex justify-center items-center py-10 text-gray-500">
              <Loader2 className="h-8 w-8 animate-spin mb-2" />
            </div>
          ) : sellerDetail ? (
            // ✅ Data loaded
            <div className="space-y-3 text-sm">
              {Object.entries(sellerDetail).map(([key, value]) => {
                // Convert camelCase -> Title Case (e.g., joiningSince -> Joining Since)
                const label = key
                  .replace(/([A-Z])/g, " $1")
                  .replace(/^./, (str) => str.toUpperCase());

                return (
                  <div key={key} className="flex justify-between">
                    <span className="font-medium">{label}:</span>
                    <span>
                      {value !== undefined && value !== null
                        ? typeof value === "object"
                          ? JSON.stringify(value)
                          : String(value)
                        : "N/A"}
                    </span>
                  </div>
                );
              })}
            </div>
          ) : (
            // ❌ No data found
            <div className="text-center py-10 text-gray-500">No seller details available.</div>
          )}
        </DialogContent>
      </Dialog>

    </div >
  );
}
