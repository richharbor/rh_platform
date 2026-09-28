import TechSupport from "@/components/Pages/TechSupport/TechSupport";
import { Metadata } from "next";

export const metadata: Metadata = {
    title: "Enterprise Tech Support & Development Services | Rich Harbor",
    description: "End-to-end technology support for enterprises. From development to deployment - React.js, Next.js, Node.js, FastAPI, AWS, GCP, Docker, Jenkins & more.",
    alternates: {
        canonical: "/tech-support",
    },
};

export default function page() {
    return <TechSupport />
}
