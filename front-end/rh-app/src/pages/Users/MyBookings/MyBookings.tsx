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
import { closeDeal, deleteMyBooking, discardBooking, getAllbookings, getMyBookings } from "@/services/purchase/bookingService"
import { getPartnerDetailsbyId } from "@/services/Role/partnerServices"
import useAuthStore from "@/helpers/authStore"
import App from "next/app"
import { set } from "zod"
import Loading from "@/app/loading"
import { CircleQuestionMark, Delete, ThumbsDown, ThumbsUp, Trash, User } from "lucide-react"
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { toast } from "sonner"

interface Booking {
  id: number;
  sellId: number;
  quantity: number;
  bookingDate: string; // ISO date string
  sell: {
    id: number;
    userId: number;
    shareId: number;
    price: string; // Sequelize often returns DECIMAL as string
    share: {
      id: number;
      name: string;
    };
  };
}

interface CloseDealProp {
  id: number;
  sellId: number;
  sellerId: number;
  buyerId: number;
  dealQuantity: string;
  goodBuyer: string;
  goodSeller: string;
}


export default function MyBookingPage() {
  const [loading, setLoading] = useState(false);
  const [bookings, setBookings] = useState<Booking[] | []>([])
  const [openDiscard, setOpenDiscard] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [discardId, setDiscardId] = useState<number>(0);

  useEffect(() => {
    fetchMyBookings();
  }, [])

  const fetchMyBookings = async () => {
    setLoading(true);
    try {
      const response = await getMyBookings();
      setBookings(response.data);
    } catch (error) {
      console.error("Error fetching bookings:", error);
    } finally {
      setLoading(false);
    }
  }

  const handleDeleteBooking = async (id: string | number) => {
    try {
      setIsSending(true);
      const response: any = await deleteMyBooking(id);
      toast.success("Booking Deleted");
      setBookings((prevBookings) => prevBookings.filter(b => b.id !== id));
      setDiscardId(0);
      setOpenDiscard(false);
    } catch (error: any) {
      console.error("Error in deleting booking");
      toast.error(error?.message)
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
    <div className="flex h-[calc(100vh-4.5rem)]  w-full overflow-hidden rounded-lg border-2 max-md:border-none flex-col relative gap-6 p-6 max-md:p-2">
      <div className="flex-1 min-h-0">
        <ScrollArea className="h-full">
          <Card className="max-md:bg-transparent max-md:border-none">
            <CardHeader className="max-md:px-3">
              <CardTitle>Bookings Overview</CardTitle>
            </CardHeader>
            <CardContent className="max-md:p-0">

              {/* web version */}
              <Table className="hidden md:table">
                <TableCaption>All recent booking records.</TableCaption>
                <TableHeader>
                  <TableRow>
                    <TableHead>Seller Id</TableHead>
                    <TableHead>Share Name</TableHead>
                    <TableHead>Price</TableHead>
                    <TableHead>Booked Quantity</TableHead>
                    <TableHead>Booked Date</TableHead>
                    <TableHead>Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {bookings.map((row) => (
                    <TableRow key={row.id}>
                      <TableCell >{row?.sell?.userId}</TableCell>
                      <TableCell >{row.sell.share.name}</TableCell>
                      <TableCell>₹{row.sell.price}</TableCell>
                      <TableCell>{row.quantity}</TableCell>
                      <TableCell>{new Date(row.bookingDate).toLocaleDateString("en-IN")}</TableCell>
                      <TableCell className="space-x-2">
                        <Button
                          variant="outline"
                          size="icon"
                          className="text-red-600 hover:text-red-700 hover:bg-red-50"
                          disabled={isSending}
                          onClick={() => {
                            setDiscardId(row.id);
                            setOpenDiscard(true);
                          }}
                        >
                          <Trash />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                  {bookings.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center text-muted-foreground">
                        No bookings available.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>

              {/* mobile version */}
              <div className="md:hidden space-y-3 p-2">
                {bookings.map((row) => (
                  <Card key={row.id}>
                    <CardContent className="p-4 space-y-3">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-semibold">{row.sell.share.name}</p>
                          <p className="text-sm text-muted-foreground">Seller: {row.sell.userId}</p>
                        </div>
                        <Button
                          variant="outline"
                          size="icon"
                          className="text-red-600 hover:text-red-700 hover:bg-red-50"
                          disabled={isSending}
                          onClick={() => {
                            setDiscardId(row.id);
                            setOpenDiscard(true);
                          }}
                        >
                          <Trash className="h-4 w-4" />
                        </Button>
                      </div>

                      <div className="grid grid-cols-3 gap-2 text-sm">
                        <div>
                          <p className="text-muted-foreground">Price</p>
                          <p className="font-medium">₹{row.sell.price}</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Quantity</p>
                          <p className="font-medium">{row.quantity}</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Booked On</p>
                          <p className="font-medium">{new Date(row.bookingDate).toLocaleDateString("en-IN")}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
                {bookings.length === 0 && (
                  <p className="text-center text-muted-foreground">
                    No bookings available.
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
        </ScrollArea>
      </div>



      {/* Discard dialog */}
      <Dialog open={openDiscard} onOpenChange={setOpenDiscard}>
        <DialogContent className="sm:max-w-md max-w-[300px] max-md:rounded-lg">
          <DialogHeader className="text-left">
            <p className="">
              Are you sure?
            </p>
          </DialogHeader>
          <DialogFooter className="max-sm:flex-row max-sm:justify-end max-sm:gap-3">
            <Button
              variant="outline"
              onClick={() => setOpenDiscard(false)}
              disabled={isSending}
            >
              No
            </Button>
            <Button
              onClick={() => handleDeleteBooking(discardId)}
              disabled={
                isSending
              }
            >
              {isSending ? "Deleting..." : "Yes"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

    </div>
  )
}
