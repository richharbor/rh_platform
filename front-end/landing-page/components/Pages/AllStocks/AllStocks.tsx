'use client'
import { useRouter } from "next/navigation";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import { Button } from "@/components/ui/button";
import { useEffect, useState } from "react";
import UnlistedShareEnquiryDialog from "@/components/Common/components/UnlistedShareEnquiryDialog";
import { getShares } from "@/services/shareServices";




// Removed unused mock data and Type

import { Loader2 } from "lucide-react";

export default function AllStocks() {
    const [open, setOpen] = useState(false)
    const [selectedStock, setSelectedStock] = useState<any | null>(null)
    const [shares, setShares] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const route = useRouter();

    const handleOpenDialog = (item: any) => {
        setSelectedStock(item)
        setOpen(true)
    }

    useEffect(() => {
        fetchShares()
    }, [])

    const fetchShares = async () => {
        try {
            const data = await getShares();
            setShares(data);
        } catch (error) {
            console.log(error);
        } finally {
            setLoading(false);
        }
    }

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <Loader2 className="h-10 w-10 animate-spin text-white/50" />
            </div>
        )
    }

    return (
        <div className="mt-20 max-w-7xl min-h-screen py-10 flex flex-col gap-10 max-md:gap-5">
            <div className="w-full items-center flex flex-col gap-10 max-md:gap-5">
                <h1 className="text-2xl md:text-3xl lg:text-5xl font-batman text-center">
                    Where Your Wealth Takes Shape
                </h1>
                <p className="text-white/50 max-w-3xl text-center mx-auto">
                    See all your stocks come together in one powerful view, giving you the clarity, confidence, and control to navigate your financial future.
                </p>
            </div>
            <div className="p-6 max-sm:p-2">
                <h2 className="text-2xl font-bold mb-4 max-sm:text-center">Unlisted Shares Price List</h2>

                {shares.length === 0 ? (
                    <div className="flex flex-col items-center justify-center min-h-[300px] border border-white/10 rounded-xl bg-card">
                        <p className="text-xl text-white/50 font-medium">No stock available now</p>
                    </div>
                ) : (
                    <>
                        <div className="hidden md:block overflow-x-auto">
                            <Table className="w-full text-sm">
                                <TableHeader>
                                    <TableRow>
                                        <TableHead className="px-2 py-2 md:px-4">Name</TableHead>
                                        <TableHead className="px-2 py-2 md:px-4">Tentative Price</TableHead>
                                        <TableHead className="px-2 py-2 md:px-4 text-center">Action</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {shares.map((stock, index) => (
                                        <TableRow key={index}>
                                            <TableCell className="font-medium px-2 py-2 md:px-4">{stock?.name}</TableCell>
                                            <TableCell className="px-2 py-2 md:px-4">{stock?.price}</TableCell>
                                            <TableCell className="px-2 py-2 md:px-4 text-center">
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    className="cursor-pointer bg-transparent"
                                                    onClick={() => handleOpenDialog(stock)}
                                                >
                                                    Enquiry
                                                </Button>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </div>

                        <div className="md:hidden space-y-3">
                            {shares.map((stock, index) => (
                                <div key={index} className="border border-border rounded-lg p-2 bg-card">
                                    <div className="flex justify-between items-start mb-1">
                                        <div>
                                            <p className="text-xs text-muted-foreground">Script Name</p>
                                            <p className="font-semibold text-base">{stock?.name}</p>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-xs text-muted-foreground">Tentative Price</p>
                                            <p className="font-semibold text-base">{stock?.price}</p>
                                        </div>
                                    </div>
                                    {stock?.faceValue && <div className="mb-2 pb-1 border-b border-border">
                                        <p className="text-xs text-muted-foreground">Face Value</p>
                                        <p className="text-sm">{stock?.faceValue}</p>
                                    </div>}
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        className="w-full cursor-pointer bg-transparent"
                                        onClick={() => handleOpenDialog(stock)}
                                    >
                                        Send Enquiry
                                    </Button>
                                </div>
                            ))}
                        </div>
                    </>
                )}

            </div>

            <div className="flex justify-center -mt-5">
                <Button variant={"outline"} onClick={() => setOpen(true)}>
                    Others
                </Button>
            </div>

            <UnlistedShareEnquiryDialog
                open={open}
                onOpenChange={setOpen}
                defaultShareName={selectedStock?.name}
            />

        </div>
    )
}