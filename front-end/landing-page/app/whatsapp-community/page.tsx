import { Metadata } from "next";
import WhatsAppCommunityClient from "./WhatsAppCommunityClient";

export const metadata: Metadata = {
    alternates: {
        canonical: "/whatsapp-community",
    },
};

export default function WhatsAppCommunityPage() {
    return <WhatsAppCommunityClient />;
}
