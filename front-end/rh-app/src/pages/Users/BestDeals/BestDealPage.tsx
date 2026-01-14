"use client";

import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import Loading from "@/app/loading";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { bookShare } from "@/services/purchase/bookingService";
import { toast } from "sonner";
import { BidShare } from "@/services/purchase/bidsService";
import { getBestDealBySellId } from "@/services/BestDeals/bestDealsService";
import { Card } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import useAuthStore from "@/helpers/authStore";
import Cookies from "js-cookie";

interface SharePageProps {
  id: string;
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
export interface ShareDetail {
  id: number;
  name: string;
  symbol: string | null;
  price: string;
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

interface DetailCardProps {
  label: string
  value: string
  highlight?: boolean
}

function DetailCard({ label, value, highlight = false }: DetailCardProps) {
  return (
    <div className="p-4 max-md:py-2 rounded-lg border border-border bg-card hover:bg-secondary/30 transition-colors">
      <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">{label}</p>
      <p className={`text-lg font-bold ${highlight ? "text-primary" : "text-foreground"}`}>{value}</p>
    </div>
  )
}

export default function BestDealPage({ id }: SharePageProps) {
  const [share, setShare] = useState<ShareItem | null>(null);
  const [loading, setLoading] = useState(true);
  const [isBidOpen, setIsBidOpen] = useState(false);
  const [isBookingOpen, setIsBookingOpen] = useState(false);
  const [isSending, setIsSending] = useState(false);
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
    const fetchBestDeal = async () => {
      try {
        const data = await getBestDealBySellId(id);
        setShare(data);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };

    fetchBestDeal();
  }, [id]);

  if (loading) {
    return (
      <div className="h-[calc(100vh-4.7rem)] flex flex-col relative overflow-hidden rounded-md">
        <Loading areaOnly={true} />
      </div>
    );
  }
  if (!share) return <div className="h-[calc(100vh-4.7rem)] flex flex-col relative justify-center items-center overflow-hidden rounded-md">No shares found.</div>;


  const handleBook = () => {
    if (onboardingRequired && onboardingStatus === 'pending') {
      toast.info("Wait for the admin to approve your onboarding");
      return;
    }
    if (onboardingRequired && onboardingStatus !== 'approved') {
      toast.error("Please complete onboarding to raise a booking");
      return;
    }
    setBookingData({
      ...bookingData,
      sellId: share.id,
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

  const handleBid = () => {
    if (onboardingRequired && onboardingStatus === 'pending') {
      toast.info("Wait for the admin to approve your onboarding");
      return;
    }
    if (onboardingRequired && onboardingStatus !== 'approved') {
      toast.error("Please complete onboarding to raise a bid");
      return;
    }
    setBidData({
      ...bidData,
      sellId: share.id,
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
    <div className="flex h-[calc(100vh-4.5rem)]  w-full overflow-hidden rounded-lg border-2 max-md:border-none flex-col p-6 space-y-6 max-md:p-0 ">
      <div className="flex-1 flex min-h-0">
        <div className=" flex-1 overflow-y-auto">
          {/* Share Details */}
          <div className="p-8 max-md:p-3 h-full bg-transparent flex flex-col border-none rounded-none shadow-lg">
            {/* Header Section */}
            <div className="mb-8 max-md:mb-4">
              <div className="flex items-start justify-between mb-6 max-md:mb-0">
                <div>
                  <h1 className="text-4xl font-bold text-foreground mb-2">{share.share.name}</h1>
                  <p className="text-muted-foreground">Share Listing Details</p>
                </div>
                {/* <div className="flex gap-2 flex-wrap justify-end">
            <Badge variant="outline" className="bg-primary/10 text-primary border-primary/20">
              In Stock
            </Badge>
          </div> */}
              </div>
            </div>

            {/* Main Price Section */}
            <div className="mb-8 p-6 max-md:p-3 max-md:mb-4 bg-secondary/50 rounded-lg border border-border">
              <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
                <div>
                  <p className="text-sm text-muted-foreground font-medium mb-2">Current Price</p>
                  <p className="text-3xl max-md:text-xl font-bold text-foreground">₹{share.price}</p>
                </div>
                {/* <div>
            <p className="text-sm text-muted-foreground font-medium mb-2">Base Price</p>
            <p className="text-2xl font-semibold text-foreground">₹{share.share.price}</p>
          </div> */}
                <div>
                  <p className="text-sm text-muted-foreground font-medium mb-2">Available Quantity</p>
                  <p className="text-2xl max-md:text-xl font-semibold text-foreground">{share.quantityAvailable.toLocaleString()} units</p>
                </div>
              </div>
            </div>

            {/* Details Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-md:gap-3 mb-8 max-md:mb-4">
              <DetailCard label="Minimum Order Quantity" value={`${share.minimumOrderQuatity} units`} />
              <DetailCard label="Delivery Timeline" value={share.deliveryTimeline} />
              <DetailCard
                label="Pre-Share Transfer"
                value={share.preShareTransfer ? "Yes" : "No"}
                highlight={share.preShareTransfer}
              />
              <DetailCard label="Fixed Price" value={share.fixedPrice ? "Yes" : "No"} highlight={share.fixedPrice} />
              <DetailCard
                label="Confirm Delivery"
                value={share.confirmDelivery ? "Yes" : "No"}
                highlight={share.confirmDelivery}
              />
              <DetailCard label="Negotiable" value={share.fixedPrice ? "No" : "Yes"} highlight={!share.fixedPrice} />
            </div>

            {/* Action Buttons */}
            <div className="flex-1 flex items-end">
              <div className="flex gap-4 pt-6 border-t w-full border-border">
                <Button
                  onClick={handleBook}
                  size="lg"
                  className="flex-1 bg-primary hover:bg-primary/90 text-primary-foreground font-semibold"
                  disabled={isSending}
                >
                  Book Now
                </Button>
                <Button disabled={isSending} onClick={handleBid} size="lg" variant="outline" className="flex-1 font-semibold">
                  Place Bid
                </Button>
              </div>
            </div>
          </div>

        </div>
      </div>


      {/* Bid dialog */}
      <Dialog open={isBidOpen} onOpenChange={setIsBidOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Raise a Bid</DialogTitle>
            <p className="text-sm text-muted-foreground">
              Enter your bid amount below. <br />
              <span className={`${(bidData.quantity !== "" && share !== null && Number(bidData.quantity) < Number(share.minimumOrderQuatity)) && 'text-red-500'}  ${(bidData.bidPrice !== "" && share !== null && Number(bidData.bidPrice) < Number(share.price) - 2) && 'text-red-500'}`}>The quantity must be greater then MOQ and bid price must be greater then price - 3</span>
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
            <Button onClick={handleBidSubmit} disabled={isSending || bidData.bidPrice === "" || bidData.quantity === "" || (share != null && !isNaN(Number(share.minimumOrderQuatity))
              ? Number(bidData.quantity) < Number(share.minimumOrderQuatity)
              : false)
              || (share != null && !isNaN(Number(share.price))
                ? Number(bidData.bidPrice) < (Number(share.price) - 2)
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
              <span className={`${(bookingData.quantity !== "" && share !== null && Number(bookingData.quantity) < Number(share.minimumOrderQuatity)) && 'text-red-500'}`}>The quantity must be greater then MOQ</span>
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
                (share != null && !isNaN(Number(share.minimumOrderQuatity))
                  ? Number(bookingData.quantity) < Number(share.minimumOrderQuatity)
                  : false)
              }
            >
              {isSending ? "Sending..." : "Send"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

    </div>
  );
}
