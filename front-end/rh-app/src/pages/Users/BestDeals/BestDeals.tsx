"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Cookies from "js-cookie";

import { Card, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Search, ChevronRight, Plus, Edit, Check, X, Loader2 } from "lucide-react";

import { getAllSellShares } from "@/services/sell/sellService";
import Loading from "@/app/loading";
import { getTieredPath } from "@/helpers/getTieredPath";
import { Button } from "@/components/ui/button";
import { approveBestDeal, discardBestDeal, getAllBestDeals, getAllNonApprovedBestDeals } from "@/services/BestDeals/bestDealsService";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import useAuthStore from "@/helpers/authStore";
import { toast } from "sonner";

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
}

// const dummyBestDeals: SellItem[] = [
//   {
//     id: 10,
//     userId: 11,
//     shareId: 10,
//     price: "120.000",
//     quantityAvailable: 5000,
//     minimumOrderQuatity: 100,
//     shareInStock: true,
//     preShareTransfer: false,
//     fixedPrice: true,
//     confirmDelivery: true,
//     deliveryTimeline: "t+1",
//     endSellerLocation: "Mumbai",
//     endSellerName: "Vikram Singh",
//     endSellerProfile: "",
//     createdAt: "2025-10-27T09:00:00.000Z",
//     updatedAt: "2025-10-27T09:00:00.000Z",
//     share: {
//       id: 10,
//       name: "Tata Technologies",
//       symbol: "TATA",
//       price: "0.00",
//     },
//     seller: {
//       id: 11,
//       firstName: "Vikram",
//       lastName: "Singh",
//       email: "vikram@tata.com",
//     },
//     specialDeal: true,
//   },
//   {
//     id: 11,
//     userId: 12,
//     shareId: 11,
//     price: "85.000",
//     quantityAvailable: 3000,
//     minimumOrderQuatity: 50,
//     shareInStock: true,
//     preShareTransfer: true,
//     fixedPrice: false,
//     confirmDelivery: true,
//     deliveryTimeline: "t+3",
//     endSellerLocation: "Delhi",
//     endSellerName: "Riya Kapoor",
//     endSellerProfile: "",
//     createdAt: "2025-10-27T09:10:00.000Z",
//     updatedAt: "2025-10-27T09:10:00.000Z",
//     share: {
//       id: 11,
//       name: "Zomato",
//       symbol: "ZOMATO",
//       price: "0.00",
//     },
//     seller: {
//       id: 12,
//       firstName: "Riya",
//       lastName: "Kapoor",
//       email: "riya@zomato.com",
//     },
//     specialDeal: true,
//   },
//   {
//     id: 12,
//     userId: 13,
//     shareId: 12,
//     price: "63.500",
//     quantityAvailable: 2500,
//     minimumOrderQuatity: 75,
//     shareInStock: true,
//     preShareTransfer: false,
//     fixedPrice: false,
//     confirmDelivery: false,
//     deliveryTimeline: "t+2",
//     endSellerLocation: "Bangalore",
//     endSellerName: "Ankit Verma",
//     endSellerProfile: "",
//     createdAt: "2025-10-27T09:20:00.000Z",
//     updatedAt: "2025-10-27T09:20:00.000Z",
//     share: {
//       id: 12,
//       name: "Ola Cabs",
//       symbol: "OLA",
//       price: "0.00",
//     },
//     seller: {
//       id: 13,
//       firstName: "Ankit",
//       lastName: "Verma",
//       email: "ankit@ola.com",
//     },
//     specialDeal: true,
//   },
//   {
//     id: 13,
//     userId: 14,
//     shareId: 13,
//     price: "150.000",
//     quantityAvailable: 800,
//     minimumOrderQuatity: 25,
//     shareInStock: true,
//     preShareTransfer: true,
//     fixedPrice: true,
//     confirmDelivery: true,
//     deliveryTimeline: "t+1",
//     endSellerLocation: "Hyderabad",
//     endSellerName: "Neha Joshi",
//     endSellerProfile: "",
//     createdAt: "2025-10-27T09:30:00.000Z",
//     updatedAt: "2025-10-27T09:30:00.000Z",
//     share: {
//       id: 13,
//       name: "Swiggy",
//       symbol: "SWIGGY",
//       price: "0.00",
//     },
//     seller: {
//       id: 14,
//       firstName: "Neha",
//       lastName: "Joshi",
//       email: "neha@swiggy.com",
//     },
//     specialDeal: true,
//   },
// ];


export default function BestDeals() {
  const [bestDeals, setBestDeals] = useState<SellItem[]>([]);
  const [nonApprovedBestDeals, setNonApprovedBestDeals] = useState<SellItem[]>([]);
  const [loading, setLoading] = useState(true);
  const tier = useAuthStore((state) => state.user?.tier);
  const [openApproveModel, setOpenApproveModel] = useState(false);
  const [fetchingData, setFetchingData] = useState(false);
  const [approving, setApproving] = useState(false);

  const currentRole = Cookies.get("currentRole");
  const route = useRouter();

  useEffect(() => {
    const fetchBestDeals = async () => {
      try {
        const response = await getAllBestDeals();
        console.log("best deals", response)
        setBestDeals(response.data);
      } catch (error) {
        console.error("Failed to fetch shares:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchBestDeals();
  }, []);

  const fetchNonApprovedBestDeals = async () => {
    setFetchingData(true);
    try {
      const response = await getAllNonApprovedBestDeals();
      console.log("best deals", response)
      setNonApprovedBestDeals(response.data);
    } catch (error) {
      console.error("Failed to fetch shares:", error);
    } finally {
      setFetchingData(false);
    }
  };


  const handleApprove = async (id: string | number) => {
    setApproving(true);
    try {
      const result = await approveBestDeal(id as string);

      if (result.success) {
        // Redirect to selling page after successful creation
        toast.success("Best Deal is approved successfully");
        setNonApprovedBestDeals(prev =>
          prev.filter(item => item.id !== id)
        );

      }

    } catch (error) {
      console.error("Failed to fetch shares:", error);
      toast.error('Unable to approved');
    } finally {
      setApproving(false);
    }
  }

  const handleDiscard = async (id: string | number) => {
    setApproving(true);
    try {
      const result = await discardBestDeal(id as string);

      if (result.success) {
        // Redirect to selling page after successful creation
        toast.success("Best Deal is approved successfully");
        setNonApprovedBestDeals(prev =>
          prev.filter(item => item.id !== id)
        );

      }

    } catch (error) {
      console.error("Failed to fetch shares:", error);
      toast.error('Unable to approved');
    } finally {
      setApproving(false);
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
    <div className="flex h-[calc(100vh-4.5rem)]  w-full overflow-hidden rounded-lg border-2 max-md:border-none flex-col relative  space-y-6">
      <div className="flex items-center justify-between px-6 py-3">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Best Deals</h2>
          <p className="text-muted-foreground">
            Explore best deal shares available for purchase.
          </p>
        </div>
        <div className={`flex items-center gap-2 ${(tier !== undefined && tier > 3) && 'hidden'}`}>
          <Button
            onClick={() => {
              fetchNonApprovedBestDeals();
              setOpenApproveModel(true);
            }}>
            Approve Best Deals
          </Button>
        </div>

      </div>

      {/* Search */}
      <div className="relative ml-6 max-md:mx-3 max-w-xl">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 h-4 w-4" />
        <Input placeholder="Search Shares..." className="pl-10" />
      </div>


      {/* Table / Cards */}
      <div className="flex-1 min-h-0 border-t">
        {!bestDeals.length && <div className="h-full flex flex-col relative justify-center items-center overflow-hidden rounded-md">
          No shares found.
        </div>}
        <ScrollArea className="h-full">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 p-4">

            {bestDeals.map((share, index) => (
              <Card
                key={index}
                onClick={() => {
                  const base = getTieredPath();
                  route.push(`/${base}/best-deals/${share.id}`);
                }}
                className="group relative cursor-pointer border border-border/50 bg-card hover:shadow-lg hover:border-primary/40 transition-all duration-300 rounded-2xl p-4">
                {/* Top Row */}
                <div className="flex items-center justify-between mb-2">
                  <CardTitle className="text-lg font-semibold text-foreground group-hover:text-primary transition-colors">
                    {share.share.name}
                  </CardTitle>
                  {/* <ChevronRight className="w-5 h-5 text-muted-foreground group-hover:text-primary transition-transform duration-300 group-hover:translate-x-1" /> */}
                </div>

                {/* Price Section */}
                <div className="flex items-baseline gap-2">
                  <span className="text-sm text-muted-foreground">Price:</span>
                  <span className="text-xl font-bold text-foreground tracking-tight">
                    ₹{share.price}
                  </span>
                </div>

                {/* Divider */}
                <div className="my-3 h-px bg-border" />

                {/* Quantity + Deal Info */}
                <div className="flex justify-between text-sm text-muted-foreground">
                  <p>
                    <strong>Available:</strong> {share.quantityAvailable}
                  </p>
                  <p>
                    <strong>Deal Type:</strong>{" "}
                    {share.fixedPrice ? "Fixed" : "Negotiable"}
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

      {/* Approve Best Deals Model */}
      <Dialog
        open={openApproveModel}
        onOpenChange={setOpenApproveModel}
      >
        <DialogContent className="sm:max-w-6xl realtive w-[90vw] flex flex-col h-[500px]">
          <DialogHeader className="h-fit">
            <DialogTitle>Approve Best Deals</DialogTitle>
          </DialogHeader>
          <div className="flex-1 min-h-0">
            <div className="h-full w-full overflow-auto">
              <div className="rounded-md border">
                <Table className={`${fetchingData && 'h-32'} min-w-max`}>
                  <TableHeader className="sticky top-0 z-10">
                    <TableRow>
                      <TableHead>Share Name</TableHead>
                      <TableHead>Available Quantity</TableHead>
                      <TableHead>Price</TableHead>
                      <TableHead>Deal Type</TableHead>
                      <TableHead>Delivery Timeline</TableHead>
                      <TableHead>Confirm Delivery</TableHead>
                      <TableHead>MOQ</TableHead>

                      <TableHead>Share in Stock</TableHead>
                      <TableHead>Pre-Share Transfer</TableHead>
                      <TableHead>Action</TableHead>
                    </TableRow>
                  </TableHeader>

                  <TableBody>
                    {fetchingData ? (
                      <TableRow>
                        <TableCell colSpan={10} className="relative min-h-10 text-center">
                          <Loading areaOnly />
                        </TableCell>
                      </TableRow>
                    ) : nonApprovedBestDeals?.length ? (
                      nonApprovedBestDeals
                        .map((t: any) => (
                          <TableRow
                            key={t.id}
                            className="cursor-pointer"
                          // onClick={() => {
                          //   const base = getTieredPath();
                          //   route.push(`/${base}/sell/${t.id}`);
                          // }}
                          >
                            <TableCell className="hover:underline">
                              {t.share.name}
                            </TableCell>
                            <TableCell>{t.quantityAvailable}</TableCell>
                            <TableCell>{t.price}</TableCell>
                            <TableCell>
                              {t.fixedPrice ? "Fixed" : "Negotiable"}
                            </TableCell>
                            <TableCell>{t.deliveryTimeline}</TableCell>
                            <TableCell>
                              {t.confirmDelivery ? "Yes" : "No"}
                            </TableCell>
                            <TableCell>{t.minimumOrderQuatity}</TableCell>

                            <TableCell>{t.shareInStock ? "Yes" : "No"}</TableCell>
                            <TableCell>
                              {t.preShareTransfer ? "Yes" : "No"}
                            </TableCell>
                            <TableCell className="flex gap-2">
                              <Button
                                variant="outline"
                                size="sm"
                                className="relative"
                                disabled={approving}
                                onClick={(e) => {
                                  handleApprove(t.id);
                                }}
                              >
                                {approving ? <Loader2 className="h-5 w-5 animate-spin" aria-hidden="true" /> : <Check className="h-5 w-5 text-green-500" />}
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                disabled={approving}
                                onClick={(e) => {
                                  handleDiscard(t.id);
                                }}
                              >
                                {approving ? <Loader2 className="h-5 w-5 animate-spin" aria-hidden="true" /> : <X className="h-5 w-5 text-red-500" />}

                              </Button>
                            </TableCell>
                          </TableRow>
                        ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={10} className="text-center">
                          No shares found
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>
            </div>
          </div>


        </DialogContent>
      </Dialog>

    </div>
  );
}
