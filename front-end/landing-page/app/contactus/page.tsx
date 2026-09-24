import ContactUsPage from '@/components/Pages/ContactUs/page'
import { Metadata } from "next";

export const metadata: Metadata = {
  alternates: {
    canonical: "/contactus",
  },
};

export default function ContactPage() {
  return (
    <ContactUsPage />
  );
}