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
import { getSellbySellId, getSellsByShareId, getUsersAllShares } from "@/services/sell/sellService";
import Loading from "@/app/loading";

interface SharePageProps {
    id: string;
}

export interface Seller {
    sellerId: string;
    quantity: string;
    price: string;
    deliveryTimeline: string;
    confirmDelivery: boolean;
    shareInStock: boolean;
    preShareTransfer: boolean;
    moq: string;
    fixed: boolean;
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
export default function MySharePage({ id }: SharePageProps) {
    const [share, setShare] = useState<ShareItem | null>(null);
    const [loading, setLoading] = useState(true);
    const [bids, setBids] = useState<Bid[] | []>([]);
    const [userId, setUserId] = useState<number | null>(null);
    const [userName, setUserName] = useState<string | null>(null);
    const [myShares, setMyShares] = useState<ShareItem[] | null>(null);


    useEffect(() => {
        getUserSell();
    }, [])

    // useEffect(() => {

    //     const found = myShares?.find((s) => s.shareId.toString() === id);
    //     setShare(found || null);

    // }, [myShares])




    const getUserSell = async () => {
        try {
            const response = await getSellbySellId(id);
            console.log(response);
            setShare(response);
        } catch (error) {
            console.log("failed to get shares");
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="flex h-[calc(100vh-4.5rem)]  w-full overflow-hidden rounded-lg border-2 max-md:border-noneflex-col relative">
                <Loading areaOnly={true} />
            </div>
        );
    }
    if (!share) return <div className="flex h-[calc(100vh-4.5rem)]  w-full overflow-hidden rounded-lg border-2 max-md:border-none  flex-col relative justify-center items-center">No shares found.</div>;

    return (
        <div className="flex h-[calc(100vh-4.5rem)]  w-full overflow-hidden rounded-lg border-2 max-md:border-none flex-col p-6 space-y-6">
            {/* Share Details */}
            <div className="border flex gap-5 rounded-xl shadow-xs p-6 bg-card">
                <div className="flex-1">
                    {/* Header */}
                    <div className="flex items-center justify-between">
                        <h2 className="text-3xl font-bold tracking-tight">
                            {share.share.name}
                        </h2>
                        
                    </div>

                    {/* Grid Details */}
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                        <div className="flex flex-col">
                            <span className="text-muted-foreground text-sm">
                                Available Quantity
                            </span>
                            <span className="text-lg font-semibold">
                                {share.quantityAvailable}
                            </span>
                        </div>
                        <div className="flex flex-col">
                            <span className="text-muted-foreground text-sm">Price</span>
                            <span className="text-lg font-semibold">
                                ₹{share.price}
                            </span>
                        </div>
                        <div className="flex flex-col">
                            <span className="text-muted-foreground text-sm">
                                Delivery Timeline
                            </span>
                            <span className="text-lg font-semibold">
                                {share.deliveryTimeline}
                            </span>
                        </div>
                        <div className="flex flex-col">
                            <span className="text-muted-foreground text-sm">
                                Confirm Delivery
                            </span>
                            <span className="text-lg font-semibold">
                                {share.confirmDelivery ? "Yes" : "No"}
                            </span>
                        </div>
                        <div className="flex flex-col">
                            <span className="text-muted-foreground text-sm">
                                Pre-Share Transfer
                            </span>
                            <span className="text-lg font-semibold">
                                {share.preShareTransfer ? "Yes" : "No"}
                            </span>
                        </div>
                        <div className="flex flex-col">
                            <span className="text-muted-foreground text-sm">
                                Minimum Order Quantity
                            </span>
                            <span className="text-lg font-semibold">
                                {share.minimumOrderQuatity}
                            </span>
                        </div>
                        <div className="flex flex-col">
                            <span className="text-muted-foreground text-sm">
                                Deal Type
                            </span>
                            <span className="text-lg font-semibold">
                                {share.fixedPrice ? "Fixed" : "Negotiable"}
                            </span>
                        </div>
                    </div>
                </div>
                
            </div>
            

            {/* bids tabel for the owner */}

            <h1 className="text-3xl mb-3">Bids</h1>

            <div className=" rounded-md flex-1 min-h-0">
                <ScrollArea className="h-full rounded-md border">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>User ID</TableHead>
                                <TableHead>Quantity</TableHead>
                                
                                <TableHead>Count</TableHead>
                                
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {bids?.map((bid: Bid, index: any) => (
                                <TableRow key={index}>
                                    <TableCell>{bid.userId}</TableCell>
                                    <TableCell>{bid.quantity}</TableCell>
                                    
                                    <TableCell>{bid.count}</TableCell>
                                    
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </ScrollArea>
            </div>

        </div>
    );
}
