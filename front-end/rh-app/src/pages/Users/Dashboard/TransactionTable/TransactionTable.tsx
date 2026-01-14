"use client"

import { Download, MoreVertical, CheckCircle2, AlertCircle, Clock } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Table, TableBody, TableCaption, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import useAuthStore from "@/helpers/authStore"

export interface Transaction {
  id: number;
  closedBy: number;
  franchiseId: number;
  sellerId: number;
  buyerId: number;
  shareName: string;
  quantity: number;
  price: string;        // If you want number, tell me & I'll convert it.
  createdAt: string;    // Or Date if you prefer
  updatedAt: string;    // Or Date if you prefer
}

interface TransactionTableProps {
  transactions: Transaction[];
}




export default function TransactionTable({ transactions }: TransactionTableProps) {
  const userId = useAuthStore((state) => state.user?.id);
  const firstName = useAuthStore((state) => state.user?.firstName);
  const lastName = useAuthStore((state) => state.user?.lastName);
  return (
    <div className={` ${transactions?.length === 0 ? "h-96 max-md:h-40":"h-96"} max-md:hidden `}>

      <Card className="h-full max-md:border-none max-md:bg-transparent">
        <ScrollArea className="h-full">
          <CardHeader className="flex flex-row w-full justify-between max-md:px-3">
            <CardTitle>Transaction History</CardTitle>
          </CardHeader>
          <CardContent className="max-md:p-0">
            <Table className="h-full">
              <TableHeader>
                <TableRow>
                  <TableHead>Seller Id</TableHead>
                  <TableHead>Buyer Id</TableHead>
                  <TableHead>Share Name</TableHead>
                  <TableHead>Price</TableHead>
                  <TableHead>Buying Quantity</TableHead>
                  <TableHead>Date</TableHead>

                </TableRow>
              </TableHeader>
              <TableBody>




                {transactions?.length === 0 ? <TableRow>
                  <TableCell colSpan={9} className="text-center py-20 text-muted-foreground">
                    No Transaction available.
                  </TableCell>
                </TableRow> :
                  transactions?.map((transaction) => (
                    <TableRow key={transaction.id}>
                      <TableCell className="py-3">{transaction.sellerId === userId ? firstName + " " + lastName : transaction.sellerId}</TableCell>
                      <TableCell className="py-3">{transaction.buyerId === userId ? firstName + " " + lastName : transaction.buyerId}</TableCell>
                      <TableCell className="py-3">{transaction.shareName}</TableCell>
                      <TableCell className="py-3">{transaction.price}</TableCell>
                      <TableCell className="py-3">{transaction.quantity}</TableCell>
                      <TableCell className="py-3">{new Date(transaction.createdAt).toLocaleDateString("en-IN")}</TableCell>
                    </TableRow>
                  ))
                }




              </TableBody>
            </Table>
            {/* <div className="md:hidden space-y-3">
              {transactions?.map((transaction) => (
                <Card key={transaction.id}>
                  <CardContent className="p-2 space-y-2">
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="text-xs text-muted-foreground">Share Name</p>
                        <p className="font-medium">{transaction.shareName}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-xs text-muted-foreground">Date</p>
                        <p className="text-sm">{new Date(transaction.createdAt).toLocaleDateString("en-IN")}</p>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4 pt-2 border-t">
                      <div>
                        <p className="text-xs text-muted-foreground">Seller</p>
                        <p className="text-sm truncate">
                          {transaction.sellerId === userId ? `${firstName} ${lastName}` : transaction.sellerId}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">Buyer</p>
                        <p className="text-sm truncate">
                          {transaction.buyerId === userId ? `${firstName} ${lastName}` : transaction.buyerId}
                        </p>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4 pt-2 border-t">
                      <div>
                        <p className="text-xs text-muted-foreground">Price</p>
                        <p className="text-sm font-medium">{transaction.price}</p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">Quantity</p>
                        <p className="text-sm font-medium">{transaction.quantity}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
              {transactions?.length === 0 && (
                <div className="text-center h-full flex items-center justify-center text-muted-foreground">
                  No Transaction available.
                </div>
              )}
            </div> */}
          </CardContent>
        </ScrollArea>
      </Card>

    </div>

  )
}
