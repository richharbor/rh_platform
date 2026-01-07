"use client";
import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Plus, Trophy, Calendar, Users, Edit, Trash2 } from "lucide-react";
import { contestService, Contest } from "@/services/Contest/contestService";
import { toast } from "sonner";
import { Header } from "@/components/Header";
import SidePanel from "@/components/ui/SidePanel";

interface EligibleUser {
    user: { id: number; name: string; email: string; phone: string };
    progress: number;
    unlockedTiers: string[];
}

export default function ContestsPage() {
    const router = useRouter();
    const [contests, setContests] = useState<Contest[]>([]);
    const [loading, setLoading] = useState(true);

    const [selectedContest, setSelectedContest] = useState<Contest | null>(null);
    const [eligibleUsers, setEligibleUsers] = useState<EligibleUser[]>([]);
    const [loadingUsers, setLoadingUsers] = useState(false);

    useEffect(() => {
        loadContests();
    }, []);

    const loadContests = async () => {
        try {
            const data = await contestService.getAllContests();
            setContests(data);
        } catch (error) {
            console.error(error);
            toast.error("Failed to load contests");
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id: number) => {
        if (!confirm("Are you sure you want to delete this contest?")) return;
        try {
            await contestService.deleteContest(id);
            toast.success("Contest deleted");
            setContests(contests.filter(c => c.id !== id));
        } catch (error) {
            console.error(error);
            toast.error("Failed to delete contest");
        }
    };

    const handleViewEligible = async (contest: Contest) => {
        setSelectedContest(contest);
        setLoadingUsers(true);
        setEligibleUsers([]);
        try {
            const users = await contestService.getEligibleUsers(contest.id!);
            setEligibleUsers(users);
        } catch (error) {
            console.error(error);
            toast.error("Failed to load eligible users");
        } finally {
            setLoadingUsers(false);
        }
    };

    return (
        <div className="flex flex-col h-full bg-slate-50">
            <Header title="Contests" description="Manage sales contests and rewards" />

            <div className="p-6 flex-1 overflow-y-auto">
                <div className="flex justify-end mb-6">
                    <button
                        onClick={() => router.push("/dashboard/contests/create")}
                        className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition"
                    >
                        <Plus size={18} /> Create Contest
                    </button>
                </div>

                {loading ? (
                    <div className="text-center py-10">Loading...</div>
                ) : contests.length === 0 ? (
                    <div className="text-center py-10 text-gray-500">No contests found. Create one to get started.</div>
                ) : (
                    <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                        <table className="w-full text-left text-sm text-slate-600">
                            <thead className="bg-slate-50 border-b border-slate-200 font-medium text-slate-700">
                                <tr>
                                    <th className="px-6 py-4">Title</th>
                                    <th className="px-6 py-4">Duration</th>
                                    <th className="px-6 py-4">Target Type</th>
                                    <th className="px-6 py-4">Category</th>
                                    <th className="px-6 py-4">Status</th>
                                    <th className="px-6 py-4">Rewards</th>
                                    <th className="px-6 py-4 text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {contests.map((contest) => (
                                    <tr key={contest.id} className="hover:bg-slate-50 transition">
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-lg bg-slate-100 flex items-center justify-center overflow-hidden shrink-0">
                                                    {contest.bannerUrl ? (
                                                        <img src={contest.bannerUrl} alt="" className="w-full h-full object-cover" />
                                                    ) : (
                                                        <Trophy size={16} className="text-slate-400" />
                                                    )}
                                                </div>
                                                <span className="font-semibold text-slate-800">{contest.title}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex flex-col text-xs">
                                                <span>{new Date(contest.startDate).toLocaleDateString()}</span>
                                                <span className="text-slate-400">to {new Date(contest.endDate).toLocaleDateString()}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className="capitalize px-2 py-1 bg-slate-100 rounded text-xs">{contest.targetType}</span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex flex-col text-xs">
                                                <span className="font-medium capitalize">{contest.productType || 'All'}</span>
                                                <span className="text-slate-400 capitalize">{contest.productSubType || 'All'}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`px-2 py-1 rounded text-xs font-medium ${contest.isActive ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'}`}>
                                                {contest.isActive ? 'Active' : 'Inactive'}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className="text-xs">{contest.tiers?.length || 0} Tiers</span>
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <div className="flex justify-end gap-2">
                                                <button
                                                    onClick={() => handleViewEligible(contest)}
                                                    className="flex items-center gap-1 px-3 py-1 text-xs font-medium text-purple-700 bg-purple-50 hover:bg-purple-100 rounded-lg border border-purple-200 transition"
                                                >
                                                    <Users size={14} /> Eligible
                                                </button>
                                                <button
                                                    onClick={() => router.push(`/dashboard/contests/edit/${contest.id}`)}
                                                    className="p-2 text-slate-500 hover:text-blue-600 hover:bg-blue-50 rounded"
                                                    title="Edit"
                                                >
                                                    <Edit size={16} />
                                                </button>
                                                <button
                                                    onClick={() => handleDelete(contest.id as number)}
                                                    className="p-2 text-slate-500 hover:text-red-600 hover:bg-red-50 rounded"
                                                    title="Delete"
                                                >
                                                    <Trash2 size={16} />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {/* Eligible Users Side Panel */}
            <SidePanel
                isOpen={!!selectedContest}
                onClose={() => setSelectedContest(null)}
                title={`Eligible Users: ${selectedContest?.title}`}
            >
                <div className="space-y-8">
                    <p className="text-sm text-slate-500 mb-4">
                        {loadingUsers ? "Calculating eligibility..." : `${eligibleUsers.length} users have qualified for rewards.`}
                    </p>

                    {loadingUsers ? (
                        <div className="flex justify-center py-8">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                        </div>
                    ) : eligibleUsers.length === 0 ? (
                        <div className="bg-slate-100 p-8 rounded-lg text-center text-slate-500 text-sm">
                            No users have met the targets yet.
                        </div>
                    ) : (
                        // Group by Tiers (Display highest tier first)
                        (selectedContest?.tiers || [])
                            .slice() // Create a copy before sorting
                            .sort((a, b) => b.minAmount - a.minAmount) // Highest amount first
                            .map((tier) => {
                                // Find users who have unlocked THIS tier
                                const usersInTier = eligibleUsers.filter(u => u.unlockedTiers.includes(tier.name));
                                if (usersInTier.length === 0) return null;

                                return (
                                    <div key={tier.name} className="border border-slate-200 rounded-lg overflow-hidden">
                                        <div className="bg-slate-50 px-4 py-2 border-b border-slate-200 flex justify-between items-center">
                                            <div>
                                                <h3 className="font-semibold text-slate-800">{tier.name}</h3>
                                                <span className="text-xs text-slate-500">Target: ₹{tier.minAmount.toLocaleString()}</span>
                                            </div>
                                            <span className="text-xs font-medium bg-white px-2 py-1 rounded border border-slate-200 shadow-sm text-slate-600">
                                                {usersInTier.length} Eligible
                                            </span>
                                        </div>

                                        <table className="w-full text-left text-sm text-slate-600">
                                            <thead className="bg-white border-b border-slate-100 font-medium text-slate-500 text-xs uppercase tracking-wider">
                                                <tr>
                                                    <th className="px-4 py-2">User</th>
                                                    <th className="px-4 py-2">Contact</th>
                                                    <th className="px-4 py-2 text-right">Progress</th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-slate-50">
                                                {usersInTier.map((item, idx) => (
                                                    <tr key={idx} className="hover:bg-slate-50">
                                                        <td className="px-4 py-2 font-medium text-slate-800">{item.user.name}</td>
                                                        <td className="px-4 py-2 font-mono text-xs text-slate-500">
                                                            {item.user.phone || item.user.email || '-'}
                                                        </td>
                                                        <td className="px-4 py-2 text-right font-semibold text-green-600">
                                                            ₹{item.progress.toLocaleString()}
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                );
                            })
                    )}
                </div>
            </SidePanel>
        </div>
    );
}
