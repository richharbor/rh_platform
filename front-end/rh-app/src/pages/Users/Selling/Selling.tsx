"use client";

import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

import { Edit, Plus, Search, Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import AddStockForm from "./AddShare/AddShareForm";
import { useShareStore } from "@/store/useShareStore";
import { ScrollArea } from "@/components/ui/scroll-area";
import Cookies from "js-cookie";
import {
  deleteSell,
  getAllShares,
  getUsersAllShares,
  updateSell,
} from "@/services/sell/sellService";
import Loading from "@/app/loading";
import { getTieredPath } from "@/helpers/getTieredPath";
import { toast } from "sonner";
import useAuthStore from "@/helpers/authStore";

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

interface AllShareItem {
  id: number;
  name: string;
}

export default function Selling() {
  const [search, setSearch] = useState("");
  const [teams, setTeams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isFormOpen, setIsFormOpen] = useState(false);
  //   const { dummyShares } = useShareStore() as { dummyShares: ShareItem[] };
  const [editShare, setEditShare] = useState<ShareItem | null>(null);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [allShares, setAllShares] = useState<AllShareItem[] | null>(null);
  const [myShares, setMyShares] = useState<ShareItem[] | []>([]);

  const currentRole = Cookies.get("currentRole");
  const route = useRouter();
  const [isMyShares, setIsMyShares] = useState(false);
  const [isAllShareOpen, setIsAllShareOpen] = useState(false);
  const [popupSearch, setPopupSearch] = useState("");

  const [discardId, setDiscardId] = useState<number>(0);
  const [openDiscard, setOpenDiscard] = useState(false);
  const [isSending, setIsSending] = useState(false);

  const onboardingRequired = useAuthStore((state) => state.onboardingRequired);
  const onboardingStatus = Cookies.get('onboardingStatus')

  const [updatedData, setUpdatedData] = useState<{
    quantityAvailable: string;
    price: string;
  }>({
    quantityAvailable: "",
    price: "",
  });

  useEffect(() => {
    if (editShare) {
      setUpdatedData({
        quantityAvailable: String(editShare.quantityAvailable),
        price: String(editShare.price),
      });
    }
  }, [editShare]);

  useEffect(() => {
    getShares();
    getUsersShares();
  }, []);

  const getShares = async () => {
    try {
      const response = await getAllShares();
      console.log(response.data);
      setAllShares(response?.data);
    } catch (error) {
      console.log("failed to get shares");
    }
  };

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

  const handleDeleteSell = async (id: string | number) => {
    try {
      setIsSending(true);
      const response: any = await deleteSell(id);
      toast.success("Sell Deleted");
      setMyShares((prevShare) => prevShare.filter(b => b.id !== id));
      setDiscardId(0);
      setOpenDiscard(false);
    } catch (error: any) {
      console.error("Error in deleting sell");
      toast.error(error?.message)
    } finally {
      setIsSending(false);
    }
  }

  // const handleUpdateShare = async (e: React.FormEvent<HTMLFormElement>) => {
  //   e.preventDefault();
  //   if (!editShare) return;

  //   try {
  //     await updateSell(editShare.id, {
  //       price: Number(updatedData.price),
  //       quantityAvailable: Number(updatedData.quantityAvailable),
  //     });

  //     setMyShares(
  //       (prev) =>
  //         prev?.map((share) =>
  //           share.id === editShare.id
  //             ? ({
  //               ...share,
  //               price: Number(updatedData.price),
  //               quantityAvailable: Number(updatedData.quantityAvailable),
  //             } as unknown as ShareItem)
  //             : share
  //         ) || []
  //     );

  //     setIsEditOpen(false);
  //   } catch (error) {
  //     console.error("Failed to update share:", error);
  //   }
  // };

  if (loading) {
    return (
      <div className="h-[calc(100vh-4.7rem)] flex flex-col relative overflow-hidden rounded-md">
        <Loading areaOnly={true} />
      </div>
    );
  }

  return (
    <div className="flex h-[calc(100vh-4.5rem)]  w-full overflow-hidden rounded-lg border-2 max-md:border-none flex-col relative space-y-6 p-6 max-md:p-3">
      <div className="flex items-center justify-between gap-2">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Sell</h2>
          <p className="text-muted-foreground">
            Manage super admin and admin users
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            onClick={() => {
              if (onboardingRequired && onboardingStatus === 'pending') {
                toast.info("Wait for the admin to approve your onboarding");
                return;
              }
              if (onboardingRequired && onboardingStatus !== 'approved') {
                toast.error("Please complete onboarding to sell any share");
                return;
              }
              const base = getTieredPath();
              route.push(`/${base}/sell/add`);
            }}>
            <Plus className="h-4 w-4 mr-2" /> Add New Share
          </Button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-3 grid-cols-2">
        <Card
          className={`${isMyShares &&
            "dark:bg-background bg-white cursor-pointer hover:scale-105 transition-all duration-200 ease-in-out"
            }`}
          onClick={() => setIsMyShares(false)}>
          <CardHeader>
            <CardTitle>Total Shares</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{allShares ? allShares?.length : "0"}</div>
          </CardContent>
        </Card>
        <Card
          className={`${!isMyShares &&
            "dark:bg-background bg-white cursor-pointer hover:scale-105 transition-all duration-200 ease-in-out"
            }`}
          onClick={() => setIsMyShares(true)}>
          <CardHeader>
            <CardTitle>My Shares</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{myShares ? myShares?.length : "0"}</div>
          </CardContent>
        </Card>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 h-4 w-4" />
        <Input
          placeholder="Search Shares..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* Table */}

      {isMyShares ? (
        <div className="flex-1 min-h-0">
          <ScrollArea className="h-full">
            <div className="rounded-md md:border">
              <Table className="hidden md:table">
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
                  {loading ? (
                    <TableRow>
                      <TableCell colSpan={8} className="text-center">
                        Loading...
                      </TableCell>
                    </TableRow>
                  ) : myShares?.length ? (
                    myShares
                      .filter((t: any) =>
                        t.share.name
                          .toLowerCase()
                          .includes(search.toLowerCase())
                      )
                      .map((t: any) => (
                        <TableRow
                          key={t.id}
                          className="cursor-pointer"
                          onClick={() => {
                            const base = getTieredPath();
                            route.push(`/${base}/sell/${t.id}`);
                          }}>
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
                          <TableCell className="space-x-2">
                            <Button
                              variant="outline"
                              size="sm"
                              className="cursor-pointer"
                              onClick={(e) => {
                                e.stopPropagation();
                                const base = getTieredPath();
                                route.push(`/${base}/sell/update/${t.id}`);

                              }}>
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              className="cursor-pointer"
                              onClick={(e) => {
                                e.stopPropagation();
                                setDiscardId(t.id);
                                setOpenDiscard(true);
                              }}
                            >
                              <Trash2 />
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={8} className="text-center">
                        No shares found
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
              <div className="md:hidden flex flex-col gap-3">
                {myShares?.length ? (
                  myShares
                    .filter((t: any) =>
                      t.share.name
                        .toLowerCase()
                        .includes(search.toLowerCase())
                    )
                    .map((t: any) => (
                      <Card
                        key={t.id}
                        className="cursor-pointer hover:bg-muted/50 transition-colors"
                        onClick={() => {
                          const base = getTieredPath();
                          route.push(`/${base}/sell/${t.id}`);
                        }}
                      >
                        <CardHeader className=" p-3">
                          <div className="flex items-center justify-between">
                            <CardTitle className="text-base font-semibold hover:underline">{t.share.name}</CardTitle>
                            <Badge variant={t.fixedPrice ? "default" : "secondary"}>{t.fixedPrice ? "Fixed" : "Negotiable"}</Badge>
                          </div>
                        </CardHeader>
                        <CardContent className="space-y-3 p-3 pt-0">
                          <div className="grid grid-cols-2 gap-2 text-sm">
                            <div>
                              <span className="text-muted-foreground">Quantity:</span>{" "}
                              <span className="font-medium">{t.quantityAvailable}</span>
                            </div>
                            <div>
                              <span className="text-muted-foreground">Price:</span> <span className="font-medium">{t.price}</span>
                            </div>
                            <div>
                              <span className="text-muted-foreground">MOQ:</span>{" "}
                              <span className="font-medium">{t.minimumOrderQuatity}</span>
                            </div>
                            <div>
                              <span className="text-muted-foreground">Delivery:</span>{" "}
                              <span className="font-medium">{t.deliveryTimeline}</span>
                            </div>
                          </div>

                          <div className="flex flex-wrap gap-2">
                            <Badge variant={t.confirmDelivery ? "default" : "outline"} className="text-xs">
                              {t.confirmDelivery ? "Delivery Confirmed" : "Delivery Unconfirmed"}
                            </Badge>
                            <Badge variant={t.shareInStock ? "default" : "outline"} className="text-xs">
                              {t.shareInStock ? "In Stock" : "Out of Stock"}
                            </Badge>
                            <Badge variant={t.preShareTransfer ? "default" : "outline"} className="text-xs">
                              {t.preShareTransfer ? "Pre-Transfer" : "No Pre-Transfer"}
                            </Badge>
                          </div>

                          <div className="flex gap-2 pt-2 border-t">
                            <Button
                              variant="outline"
                              size="sm"
                              className="flex-1 bg-transparent"
                              onClick={(e) => {
                                e.stopPropagation();
                                const base = getTieredPath();
                                route.push(`/${base}/sell/update/${t.id}`);

                              }}
                            >
                              <Edit className="h-4 w-4 mr-1" />
                              Edit
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              className="flex-1 bg-transparent"
                              onClick={(e) => {
                                e.stopPropagation();
                                setDiscardId(t.id);
                                setOpenDiscard(true);
                              }}
                            >
                              <Trash2 className="h-4 w-4 mr-1" />
                              Delete
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    ))) : (
                  <div className="text-center">
                    No shares found
                  </div>
                )}
              </div>

            </div>
          </ScrollArea>
        </div>
      ) : (
        <div className="flex-1 min-h-0">
          <ScrollArea className="h-full">
            <div className="rounded-md border">
              <Table>
                <TableHeader className="sticky top-0 z-10">
                  <TableRow>
                    <TableHead>Share Name</TableHead>
                    {/* <TableHead>Price</TableHead> */}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {loading ? (
                    <TableRow>
                      <TableCell colSpan={8} className="text-center">
                        Loading...
                      </TableCell>
                    </TableRow>
                  ) : allShares?.length ? (
                    allShares
                      .filter((t: any) =>
                        t.name.toLowerCase().includes(search.toLowerCase())
                      )
                      .map((t: any) => (
                        <TableRow
                          key={t.name}
                          className="cursor-pointer"
                          onClick={() => {
                            if (onboardingRequired && onboardingStatus === 'pending') {
                              toast.info("Wait for the admin to approve your onboarding");
                              return;
                            }
                            if (onboardingRequired && onboardingStatus !== 'approved') {
                              toast.error("Please complete onboarding to sell any share");
                              return;
                            }

                            const base = getTieredPath();
                            route.push(
                              `/${base}/sell/add/${t.id}`
                            );
                          }}>
                          <TableCell className="p-3 hover:underline">
                            {t.name}
                          </TableCell>
                          {/* <TableCell>{t.price}</TableCell> */}
                        </TableRow>
                      ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={8} className="text-center">
                        No shares found
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          </ScrollArea>
        </div>
      )}

      {/* Delete dialog */}
      <Dialog open={openDiscard} onOpenChange={setOpenDiscard}>
        <DialogContent className="sm:max-w-md max-w-[300px] max-sm:rounded-lg">
          <DialogHeader className="text-left">
            <p className="">
              Are you sure?
            </p>
          </DialogHeader>
          <DialogFooter className="max-sm:flex-row max-sm:justify-end max-sm:space-x-2">
            <Button
              variant="outline"
              onClick={() => setOpenDiscard(false)}
              disabled={isSending}
            >
              No
            </Button>
            <Button
              onClick={() => handleDeleteSell(discardId)}
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
  );
}
