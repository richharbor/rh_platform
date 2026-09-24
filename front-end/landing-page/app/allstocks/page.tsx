import AllStocks from "@/components/Pages/AllStocks/AllStocks";
import { Metadata } from "next";

export const metadata: Metadata = {
    alternates: {
        canonical: "/allstocks",
    },
};


export default function AllStockPages() {
    return <AllStocks />
}