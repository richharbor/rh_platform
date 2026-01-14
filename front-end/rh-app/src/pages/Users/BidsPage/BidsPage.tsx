'use client'
import { useEffect, useState } from "react"
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { closeDeal, discardBooking, getAllbookings } from "@/services/purchase/bookingService"
import { closeDealBid, discardBid, getAllBids } from "@/services/purchase/bidsService"
import useAuthStore from "@/helpers/authStore"
import { fetchAllFranshisesForAdmin, getPartnerDetailsbyId } from "@/services/Role/partnerServices"
import ApplicationDialog from "../Bookings/ApplicationDialog"
import Loading from "@/app/loading"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"
import { CircleQuestionMark, ThumbsDown, ThumbsUp } from "lucide-react"
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { ScrollArea } from "@/components/ui/scroll-area"
import { toast } from "sonner"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

interface Share {
  id: number;
  name: string;
  symbol: string | null;
  price: string;
  market_cap: string | null;
  volume: string | null;
  sector: string | null;
  exchange: string | null;
  createdAt: string;
  updatedAt: string;
}

interface Seller {
  id: number;
  firstName: string;
  lastName: string;
}

interface Sell {
  id: number;
  userId: number;
  shareId: number;
  actualPrice: string;
  sellingPrice: string;
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
  createdAt: string;
  updatedAt: string;
  share: Share;
  seller: Seller;
}

interface Buyer {
  id: number;
  firstName: string;
  lastName: string;
}

interface Bids {
  id: number;
  sellId: number;
  buyerId: number;
  quantity: number;
  bidPrice: number;
  createdAt: string;
  updatedAt: string;
  sell: Sell;
  bidder: Buyer;
}
interface CloseDealProp {
  id: number;
  sellId: number;
  sellerId: number;
  buyerId: number;
  price: number;
  dealQuantity: string;
  goodBuyer: string;
  goodSeller: string;
}


export default function BookingTable() {
  const [loading, setLoading] = useState(true);
  const [bids, setBids] = useState<Bids[] | []>([])
  const [details, setDetails] = useState<Bids | null>(null);
  const [open, setOpen] = useState(false);
  const franchiseId = useAuthStore((state) => state.user?.franchiseId);
  const [userDetails, setUserDetails] = useState<any>(null);
  const [isFetching, setIsFetching] = useState(false);
  const [userProfile, setUserProfile] = useState<string>("");
  const [openCloseDeal, setOpenCloseDeal] = useState(false);
  const [closeDealDetails, setCloseDealDetails] = useState<CloseDealProp>({
    id: 0,
    sellId: 0,
    sellerId: 0,
    buyerId: 0,
    price: 0,
    dealQuantity: "",
    goodBuyer: "",
    goodSeller: "",
  })
  const [openDiscard, setOpenDiscard] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [discardId, setDiscardId] = useState<number>(0);


  const isSuperAdmin = useAuthStore((state) => state.user?.isSuperAdmin);
  const tier = useAuthStore((state) => state.user?.tier);

  const [franchises, setFranchises] = useState<any[]>([]);
  const [selectedFranchiseId, setSelectedFranchiseId] = useState<number | null>(
    null
  );


  // const handleCloseDeal = (id: number) => {
  //   alert(`Deal closed for booking ID: ${id}`)
  // }

  // const handleDiscard = (id: number) => {
  //   const updated = data.filter((item) => item.id !== id)
  //   setData(updated)
  // }

  useEffect(() => {
    if (isSuperAdmin || tier === 2) {
      fetchAllFranchises();
    } else if (tier === 3 && franchiseId) {
      setSelectedFranchiseId(franchiseId);
    }
  }, [isSuperAdmin, tier, franchiseId]);

  useEffect(() => {
    if (selectedFranchiseId) {
      setBids([]);
      fetchAllBids();
    }
  }, [selectedFranchiseId])

  const fetchAllFranchises = async () => {
    try {
      const response = await fetchAllFranshisesForAdmin();
      if (response?.success) {
        setFranchises(response.franchises || []);
        const firstId = response.franchises[0]?.id || null;
        setSelectedFranchiseId(firstId);

      }
    } catch (err) {
      console.error("Error fetching franchises:", err);
    }
  };

  const fetchAllBids = async () => {
    setLoading(true);
    try {
      const response = await getAllBids(selectedFranchiseId!);
      setBids(response.data);
    } catch (error) {
      console.error("Error fetching bids:", error);
    } finally {
      setLoading(false);
    }
  }

  const fetchPartnersDetailbyId = async (userId: number, fid?: number) => {
    setIsFetching(true);
    try {
      const response = await getPartnerDetailsbyId({
        userId: userId,
        franchiseId: fid || franchiseId!,
      });
      setUserDetails(response.applications);
      // setPartners(formatted);
    } catch (err) {
      console.error("Error fetching partners", err);
      // toast.error("Failed to fetch partners");
    } finally {
      setIsFetching(false);
    }
  };

  const handleSellerDetail = (userId: number) => {
    setOpen(true);
    setUserProfile("Seller");
    fetchPartnersDetailbyId(userId);


  }
  const handleBuyerDetail = (userId: number) => {
    setOpen(true);
    setUserProfile("Buyer");
    fetchPartnersDetailbyId(userId);
  }

  const handleCloseDeal = async () => {
    try {
      setIsSending(true);
      const response: any = await closeDealBid(closeDealDetails);
      toast.success("Deal closed Successfully");
      setBids((prevBookings) => prevBookings.filter(b => b.id !== closeDealDetails.id));
      setOpenCloseDeal(false);
    } catch (error: any) {
      console.error("Error in closing deal");
      toast.error(error?.message);

    } finally {
      setIsSending(false);
    }
  }
  const handleDiscardBooking = async (id: string | number) => {
    try {
      setIsSending(true);
      const response: any = await discardBid(id);
      toast.success("Deal discarded");
      setBids((prevBookings) => prevBookings.filter(b => b.id !== id));
      setDiscardId(0);
      setOpenDiscard(false);
    } catch (error: any) {
      console.error("Error in discarding booking");
      toast.error(error?.message)
    } finally {
      setIsSending(false);
    }
  }


  return (
    <div className="flex h-[calc(100vh-4.5rem)]  w-full overflow-hidden rounded-lg border-2 max-md:border-none flex-col gap-6 p-6 max-md:p-3">
      <div className="flex-1 min-h-0">
        <ScrollArea className="h-full">
          <Card className="shadow-md max-md:w-[calc(100vw-1.5rem)]">
            <CardHeader className="flex flex-row w-full justify-between max-md:p-3 max-md:flex-col gap-3">
              <CardTitle>Bids Overview</CardTitle>
              {(isSuperAdmin || tier === 2) && (
                <div className="flex items-center gap-2">
                  <Label className="font-medium">Select Franchise:</Label>
                  <Select
                    value={selectedFranchiseId?.toString() || ""}
                    onValueChange={(val) => {
                      const fid = parseInt(val);
                      setSelectedFranchiseId(fid);
                    }}>
                    <SelectTrigger className="w-64">
                      <SelectValue placeholder="Select Franchise" />
                    </SelectTrigger>
                    <SelectContent>
                      {franchises.map((f) => (
                        <SelectItem key={f.id} value={f.id.toString()}>
                          {f.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}
            </CardHeader>
            <CardContent className="max-md:p-3">
              <Table className="min-w-max">
                <TableCaption>All recent bids records.</TableCaption>
                <TableHeader>
                  <TableRow>
                    <TableHead>Seller Name</TableHead>
                    <TableHead>Buyer Name</TableHead>
                    <TableHead>Stock Name</TableHead>
                    <TableHead>Selling Price</TableHead>
                    <TableHead>Actual Price</TableHead>
                    <TableHead>Bid Price</TableHead>
                    <TableHead>Share in Stock</TableHead>
                    <TableHead>Available Quantity</TableHead>
                    <TableHead>Require Quantity</TableHead>
                    <TableHead>Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {bids.map((row) => (
                    <TableRow key={row.id}>
                      <TableCell className="cursor-pointer hover:underline" onClick={() => handleSellerDetail(row.sell.seller.id)}>{row.sell.seller.firstName} {row.sell.seller.lastName}</TableCell>
                      <TableCell className="cursor-pointer hover:underline" onClick={() => handleBuyerDetail(row.buyerId)}>{row.bidder.firstName} {row.bidder.lastName}</TableCell>
                      <TableCell>{row.sell.share.name}</TableCell>
                      <TableCell>₹{row.sell.sellingPrice}</TableCell>
                      <TableCell>₹{row.sell.actualPrice}</TableCell>
                      <TableCell>₹{row.bidPrice}</TableCell>
                      <TableCell onClick={() => setDetails(row)}>{row.sell.shareInStock ? 'Yes' : 'No'}
                        {!row.sell.shareInStock && (
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <span className="inline-flex relative top-0.5 items-center ml-2">
                                <CircleQuestionMark className="h-4 w-4" />
                              </span>
                            </TooltipTrigger>

                            <TooltipContent>
                              End seller details
                            </TooltipContent>
                          </Tooltip>
                        )}
                      </TableCell>
                      <TableCell>{row.sell.quantityAvailable}</TableCell>
                      <TableCell>{row.quantity}</TableCell>
                      <TableCell className="space-x-2">
                        <Button
                          variant="default"
                          size="sm"
                          onClick={() => {
                            setCloseDealDetails({ ...closeDealDetails, id: row.id, sellId: row.sell.id, sellerId: row.sell.seller.id, buyerId: row.buyerId, price: row.bidPrice })
                            setOpenCloseDeal(true);
                          }}
                        >
                          Close Deal
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setDiscardId(row.id);
                            setOpenDiscard(true);
                          }}
                        >
                          Discard
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                  {(loading && bids.length === 0) && (
                    <TableRow className="h-32">
                      <TableCell colSpan={7} className="text-center text-muted-foreground">
                        <Loading areaOnly />
                      </TableCell>
                    </TableRow>
                  )}

                  {(bids.length === 0 && !loading) && (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center text-muted-foreground">
                        No bookings available.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </ScrollArea>
      </div>

      <ApplicationDialog userProfile={userProfile} isFetching={isFetching} open={open} onClose={setOpen} data={userDetails} />


      {/* End seller detail dialog */}
      <Dialog
        open={details !== null}
        onOpenChange={(open) => {
          if (!open) setDetails(null);
        }}
      >
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>End Seller Details</DialogTitle>
          </DialogHeader>

          {details && (
            <div className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="font-medium">Name:</span>
                <span>{details.sell.endSellerName || "N/A"}</span>
              </div>

              <div className="flex justify-between">
                <span className="font-medium">Profile:</span>
                <span>{details.sell.endSellerProfile || "N/A"}</span>
              </div>

              <div className="flex justify-between">
                <span className="font-medium">Location:</span>
                <span>{details.sell.endSellerLocation || "N/A"}</span>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>



      {/* close deal dialog */}
      <Dialog open={openCloseDeal} onOpenChange={setOpenCloseDeal}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Close the Deal</DialogTitle>
            {/* <p className="text-sm text-muted-foreground">
              Enter your booking quantity below to book this share. <br />
            </p> */}
          </DialogHeader>
          <div className=" grid gap-4 space-y-4 py-4">
            <div className="flex flex-col space-y-2">
              <Label htmlFor="number">Quantity</Label>
              <Input
                id="quantity"
                placeholder="Enter Quantity"
                // className={`${(selectedSell !== null && Number(bookingData.quantity) <= Number(selectedSell.moq))}`}
                value={closeDealDetails.dealQuantity}
                onChange={(e) => {
                  const value = e.target.value.replace(/[^0-9]/g, "");
                  setCloseDealDetails({ ...closeDealDetails, dealQuantity: value });
                }}
                disabled={isSending}
              />
            </div>
            <div className="flex flex-col space-y-2">
              <Label>What you think about Seller</Label>
              <div className="flex gap-5 mt-1">
                <ThumbsUp
                  fill={closeDealDetails.goodSeller === 'yes' ? "white" : "none"}
                  onClick={() => setCloseDealDetails({ ...closeDealDetails, goodSeller: "yes" })}
                  className='cursor-pointer'
                />
                <ThumbsDown
                  fill={closeDealDetails.goodSeller === 'no' ? "white" : "none"}
                  onClick={() => setCloseDealDetails({ ...closeDealDetails, goodSeller: "no" })}
                  className='cursor-pointer'
                />
              </div>
            </div>
            <div className="flex flex-col space-y-2">
              <Label>What you think about Buyer</Label>
              <div className="flex gap-5 mt-1">
                <ThumbsUp
                  fill={closeDealDetails.goodBuyer === 'yes' ? "white" : "none"}
                  onClick={() => setCloseDealDetails({ ...closeDealDetails, goodBuyer: "yes" })}
                  className='cursor-pointer'
                />
                <ThumbsDown
                  fill={closeDealDetails.goodBuyer === 'no' ? "white" : "none"}
                  onClick={() => setCloseDealDetails({ ...closeDealDetails, goodBuyer: "no" })}
                  className='cursor-pointer'
                />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setOpenCloseDeal(false)}
              disabled={isSending}
            >
              Cancel
            </Button>
            <Button
              onClick={handleCloseDeal}
              disabled={
                isSending ||
                closeDealDetails.dealQuantity === ""
              }
            >
              {isSending ? "Closing..." : "Close deal"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>


      {/* Discard dialog */}
      <Dialog open={openDiscard} onOpenChange={setOpenDiscard}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <p className="">
              Are you sure?
            </p>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setOpenDiscard(false)}
              disabled={isSending}
            >
              No
            </Button>
            <Button
              onClick={() => handleDiscardBooking(discardId)}
              disabled={
                isSending
              }
            >
              {isSending ? "Discarding..." : "Yes"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
