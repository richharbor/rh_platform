import LiquidateShares from '@/components/Pages/LiquidateShares/LiquidateShares'
import { Metadata } from "next";

export const metadata: Metadata = {
    alternates: {
        canonical: "/liquidate-shares",
    },
};

export default function page() {
    return <LiquidateShares />
}