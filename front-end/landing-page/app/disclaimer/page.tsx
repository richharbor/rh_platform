import Disclaimer from '@/components/Pages/Disclaimer/Disclaimer';
import { Metadata } from "next";

export const metadata: Metadata = {
  alternates: {
    canonical: "/disclaimer",
  },
};

export default function page() {
  return (
    <Disclaimer />
  );
}