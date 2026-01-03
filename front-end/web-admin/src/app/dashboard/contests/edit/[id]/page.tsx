"use client";
import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";

import { contestService, Contest } from "@/services/Contest/contestService";
import { toast } from "sonner";
import ContestForm from "../../components/ContestForm";

export default function EditContestPage() {
    const params = useParams();
    const router = useRouter();
    const [contest, setContest] = useState<Contest | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (params.id) {
            loadContest(Number(params.id));
        }
    }, [params.id]);

    const loadContest = async (id: number) => {
        try {
            const all = await contestService.getAllContests();
            const found = all.find((c: Contest) => c.id === id);

            if (found) {
                setContest(found);
            } else {
                toast.error("Contest not found");
                router.push("/dashboard/contests");
            }
        } catch (error) {
            console.error(error);
            toast.error("Failed to load contest details");
        } finally {
            setLoading(false);
        }
    };

    if (loading) return <div className="p-10 text-center">Loading...</div>;
    if (!contest) return <div className="p-10 text-center">Contest not found</div>;

    return <ContestForm initialData={contest} isEditing={true} />;
}
