'use client'

import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "@/components/ui/sheet";



interface CloseDealProp {
    id: number;
    buyerId: number;
    dealQuantity: string;
    price: string;
    shareName: string;
    goodBuyer: string;

}

interface BuyQueryProp {
    id: number;
    userId: number;
    franchiseId: number;
    shareName: string;
    quantity: number;
    price: string; // stored as string ("25.000")
    createdAt: string; // ISO timestamp
    updatedAt: string; // ISO timestamp
    buyer: {
        id: number;
        firstName: string;
        lastName: string;
    };
}

interface PartnerDetailsDrawerProps {
    isOpen: boolean;
    onClose: () => void;
    details: BuyQueryProp;
    isSending: boolean;
    setCloseDealDetails: React.Dispatch<React.SetStateAction<CloseDealProp>>;
    closeDealDetails: CloseDealProp;
    setOpenCloseDeal: React.Dispatch<React.SetStateAction<boolean>>;
    setOpenDiscard: React.Dispatch<React.SetStateAction<boolean>>;
    setDiscardId: React.Dispatch<React.SetStateAction<number>>;
    handleBuyerDetail: (buyerId: number) => void;
}



export default function QueryDetails({
    isOpen,
    onClose,
    details,
    isSending,
    setCloseDealDetails,
    closeDealDetails,
    setOpenCloseDeal,
    setOpenDiscard,
    setDiscardId,
    handleBuyerDetail
}: PartnerDetailsDrawerProps) {
    if (!details) return null;

    return (
        <Sheet open={isOpen} onOpenChange={onClose}>
            <SheetContent side={'bottom'} className="w-full h-[45vh] flex flex-col overflow-y-auto">
                <SheetHeader>
                    <SheetTitle className="flex items-center gap-2">
                        {/* <User className="h-5 w-5" /> */}
                        Query Details
                    </SheetTitle>
                    <SheetDescription className="flex items-start">
                        Detailed information about the selected Query.
                    </SheetDescription>
                </SheetHeader>
                {details ? (
                    <div className="mt-4 flex-1 flex h-full flex-col space-y-4 text-sm">

                        <div className="flex justify-between">
                            <span className="text-muted-foreground">Buyer Name</span>
                            <span className="font-medium">{details.buyer.firstName} {details.buyer.lastName}</span>
                        </div>

                        <div className="flex justify-between">
                            <span className="text-muted-foreground">Share Name</span>
                            <span className="font-medium">{details.shareName}</span>
                        </div>

                        <div className="flex justify-between">
                            <span className="text-muted-foreground">Price</span>
                            <span className="font-medium">{details.price}</span>
                        </div>

                        <div className="flex justify-between">
                            <span className="text-muted-foreground">Quantity</span>
                            <span className="font-medium">{details.quantity}</span>
                        </div>

                        <div className="flex justify-between">
                            <span className="text-muted-foreground">Date</span>
                            <span className="font-medium">
                                {new Date(details.createdAt).toLocaleDateString("en-IN")}
                            </span>
                        </div>

                        {/* ACTION BUTTONS */}
                        <div className="pt-4 flex-1  flex items-end justify-evenly gap-2">
                            <Button
                                variant="default"
                                size="default"
                                disabled={isSending}
                                onClick={() => {
                                    setCloseDealDetails({
                                        ...closeDealDetails,
                                        id: details.id,
                                        buyerId: details.userId,
                                        shareName: details.shareName
                                    });
                                    onClose();
                                    setOpenCloseDeal(true);
                                }}
                            >
                                Close Deal
                            </Button>

                            <Button
                                variant="outline"
                                size="default"
                                disabled={isSending}
                                onClick={() => {
                                    onClose();
                                    handleBuyerDetail(details.userId)
                                }}
                            >
                                Buyer Details
                            </Button>

                            <Button
                                variant="outline"
                                size="default"
                                disabled={isSending}
                                onClick={() => {
                                    setDiscardId(details.id);
                                    onClose();
                                    setOpenDiscard(true);
                                }}
                            >
                                Discard
                            </Button>
                        </div>

                    </div>
                ) : (
                    <div className="text-center py-10 text-muted-foreground">
                        No data selected.
                    </div>
                )}
            </SheetContent>
        </Sheet>
    )

}