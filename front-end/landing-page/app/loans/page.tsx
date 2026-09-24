import LoanPage from "@/components/Pages/LoanPage/LoanPage";
import { Metadata } from "next";

export const metadata: Metadata = {
    title: "Loans & Credit Solutions | Rich Harbor",
    description: "Richharbor offers access to a wide range of loan products across leading banks and NBFCs.",
    alternates: {
        canonical: "/loans",
    },
};

export default function page() {

    return <LoanPage />
}