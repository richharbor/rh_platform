"use client";
import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Plus, Trash2 } from "lucide-react";
import { contestService, Contest, ContestTier } from "@/services/Contest/contestService";
import { toast } from "sonner";
import { Header } from "@/components/Header";

interface ContestFormProps {
    initialData?: Contest;
    isEditing?: boolean;
}

export default function ContestForm({ initialData, isEditing = false }: ContestFormProps) {
    const router = useRouter();
    const [submitting, setSubmitting] = useState(false);

    const [formData, setFormData] = useState<Partial<Contest>>({
        title: "",
        description: "",
        startDate: "",
        endDate: "",
        bannerUrl: "",
        termsAndConditions: "",
        isActive: true,
        targetType: "incentive",
        notifyUsers: true,
        tiers: [],
        ...initialData
    });

    const [tiers, setTiers] = useState<ContestTier[]>(initialData?.tiers || [
        { name: "", minAmount: 0, rewardDescription: "", segment: "All" }
    ]);

    // Update form when initialData loads (async fetch)
    useEffect(() => {
        if (initialData) {
            setFormData(prev => ({ ...prev, ...initialData }));
            if (initialData.tiers) setTiers(initialData.tiers);
        }
    }, [initialData]);

    const handleTierChange = <K extends keyof ContestTier>(index: number, field: K, value: ContestTier[K]) => {
        const newTiers = [...tiers];
        newTiers[index][field] = value;
        setTiers(newTiers);
    };

    const [selectedFile, setSelectedFile] = useState<File | null>(null);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            setSelectedFile(e.target.files[0]);
        }
    };

    const addTier = () => {
        setTiers([...tiers, { name: "", minAmount: 0, rewardDescription: "", segment: "All" }]);
    };

    const removeTier = (index: number) => {
        setTiers(tiers.filter((_, i) => i !== index));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSubmitting(true);
        try {
            let uploadedUrl = formData.fileUrl;
            if (selectedFile) {
                uploadedUrl = await contestService.uploadPoster(selectedFile);
            }

            const payload: Contest = {
                ...formData as Contest,
                tiers: tiers,
                fileUrl: uploadedUrl,
                bannerUrl: uploadedUrl || formData.bannerUrl || "" // Ensure string
            };

            if (isEditing && initialData?.id) {
                await contestService.updateContest(initialData.id, payload);
                toast.success("Contest updated successfully!");
            } else {
                await contestService.createContest(payload);
                toast.success("Contest created successfully!");
            }
            router.push("/dashboard/contests");
        } catch (error) {
            console.error(error);
            toast.error(isEditing ? "Failed to update contest" : "Failed to create contest");
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="flex flex-col h-full bg-slate-50">
            <Header
                title={isEditing ? "Edit Contest" : "Create Contest"}
                description={isEditing ? "Update contest details" : "Set up a new sales contest"}
            />

            <div className="p-6 flex-1 overflow-y-auto">
                <button
                    onClick={() => router.back()}
                    className="flex items-center gap-2 text-slate-500 hover:text-slate-800 mb-6"
                >
                    <ArrowLeft size={16} /> Back to Contests
                </button>

                <form onSubmit={handleSubmit} className="max-w-4xl space-y-8 pb-20">
                    {/* Basic Info */}
                    <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
                        <h3 className="text-lg font-semibold mb-4">Basic Details</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="col-span-2">
                                <label className="block text-sm font-medium text-slate-700 mb-1">Contest Title</label>
                                <input
                                    required
                                    type="text"
                                    className="w-full border border-slate-300 rounded-lg p-2 focus:ring-2 focus:ring-blue-500 outline-none"
                                    placeholder="e.g. January Dhamaka"
                                    value={formData.title}
                                    onChange={e => setFormData({ ...formData, title: e.target.value })}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Start Date</label>
                                <input
                                    required
                                    type="date"
                                    className="w-full border border-slate-300 rounded-lg p-2"
                                    value={formData.startDate?.toString().split('T')[0]}
                                    onChange={e => setFormData({ ...formData, startDate: e.target.value })}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">End Date</label>
                                <input
                                    required
                                    type="date"
                                    className="w-full border border-slate-300 rounded-lg p-2"
                                    value={formData.endDate?.toString().split('T')[0]}
                                    onChange={e => setFormData({ ...formData, endDate: e.target.value })}
                                />
                            </div>
                            <div className="col-span-2">
                                <label className="block text-sm font-medium text-slate-700 mb-1">Target Type</label>
                                <select
                                    className="w-full border border-slate-300 rounded-lg p-2"
                                    value={formData.targetType}
                                    onChange={e => setFormData({ ...formData, targetType: e.target.value as any })}
                                >
                                    <option value="incentive">Incentive (Earnings)</option>
                                    <option value="leads_count">Leads Count</option>
                                </select>
                            </div>

                            {/* Product Type Selection */}
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Product Category</label>
                                <select
                                    className="w-full border border-slate-300 rounded-lg p-2"
                                    value={formData.productType || ''}
                                    onChange={e => setFormData({ ...formData, productType: e.target.value, productSubType: '' })}
                                >
                                    <option value="">All Categories</option>
                                    <option value="insurance">Insurance</option>
                                    <option value="loans">Loans</option>
                                    <option value="equity">Private Equity / Funding</option>
                                    <option value="unlisted">Unlisted Shares</option>
                                    <option value="stocks">Bulk Listed Stock Deals</option>
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Product Sub-Type</label>
                                <select
                                    className="w-full border border-slate-300 rounded-lg p-2"
                                    value={formData.productSubType || ''}
                                    onChange={e => setFormData({ ...formData, productSubType: e.target.value })}
                                    disabled={!formData.productType}
                                >
                                    <option value="">All / Generic</option>
                                    {formData.productType === 'insurance' && (
                                        <>
                                            <option value="Life">Life</option>
                                            <option value="Health">Health</option>
                                            <option value="Motor">Motor</option>
                                            <option value="General">General</option>
                                        </>
                                    )}
                                    {formData.productType === 'loans' && (
                                        <>
                                            <option value="Home">Home</option>
                                            <option value="Personal">Personal</option>
                                            <option value="Business">Business</option>
                                            <option value="Mortgage">Mortgage</option>
                                            <option value="Education">Education</option>
                                            <option value="Car">Car</option>
                                            <option value="Machinery">Machinery</option>
                                            <option value="WC">Working Capital</option>
                                            <option value="Construction">Construction</option>
                                            <option value="Project Finance">Project Finance</option>
                                            <option value="RBF">RBF</option>
                                            <option value="FTL">FTL</option>
                                            <option value="Channel Financing">Channel Financing</option>
                                        </>
                                    )}
                                    {/* Add other subtypes if needed */}
                                </select>
                            </div>

                            <div className="col-span-2">
                                <label className="block text-sm font-medium text-slate-700 mb-1">Contest Poster / Banner (Image)</label>
                                <input
                                    type="file"
                                    accept="image/*"
                                    className="w-full border border-slate-300 rounded-lg p-2"
                                    onChange={handleFileChange}
                                />
                                {formData.fileUrl && (
                                    <p className="text-xs text-green-600 mt-1">Current Poster: <a href={formData.fileUrl} target="_blank" className="underline">View</a></p>
                                )}
                            </div>

                            <div className="col-span-2">
                                <label className="block text-sm font-medium text-slate-700 mb-1">Description</label>
                                <textarea
                                    rows={3}
                                    className="w-full border border-slate-300 rounded-lg p-2"
                                    value={formData.description}
                                    onChange={e => setFormData({ ...formData, description: e.target.value })}
                                />
                            </div>

                            {/* Active Status Checkbox */}
                            <div className="col-span-2 flex items-center gap-2 mt-2">
                                <input
                                    type="checkbox"
                                    id="isActive"
                                    className="w-4 h-4 text-blue-600 rounded"
                                    checked={formData.isActive}
                                    onChange={e => setFormData({ ...formData, isActive: e.target.checked })}
                                />
                                <label htmlFor="isActive" className="text-sm font-medium text-slate-700">Contest is Active</label>
                            </div>

                            {/* Notify Users Checkbox (Only for new contests) */}
                            {!isEditing && (
                                <div className="col-span-2 flex items-center gap-2 mt-2">
                                    <input
                                        type="checkbox"
                                        id="notifyUsers"
                                        className="w-4 h-4 text-blue-600 rounded"
                                        checked={formData.notifyUsers}
                                        // We need to add notifyUsers to state or handle it separately since it's not part of Contest model usually
                                        onChange={e => setFormData({ ...formData, notifyUsers: e.target.checked } as any)}
                                    />
                                    <label htmlFor="notifyUsers" className="text-sm font-medium text-slate-700">
                                        Send Push Notification to All Users 🔔
                                    </label>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Tiers */}
                    <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="text-lg font-semibold">Reward Tiers</h3>
                            <button type="button" onClick={addTier} className="text-sm text-blue-600 font-medium flex items-center gap-1">
                                <Plus size={16} /> Add Tier
                            </button>
                        </div>

                        <div className="space-y-4">
                            {tiers.map((tier, index) => (
                                <div key={index} className="flex gap-4 items-start bg-slate-50 p-4 rounded-lg">
                                    <div className="flex-1">
                                        <label className="block text-xs font-medium text-slate-500 mb-1">Tier Name (Reward)</label>
                                        <input
                                            required
                                            type="text"
                                            placeholder="e.g. 2 Pax Trip"
                                            className="w-full border border-slate-300 rounded md p-2 text-sm"
                                            value={tier.name}
                                            onChange={e => handleTierChange(index, 'name', e.target.value)}
                                        />
                                    </div>
                                    <div className="w-32">
                                        <label className="block text-xs font-medium text-slate-500 mb-1">Target Amount (₹)</label>
                                        <input
                                            required
                                            type="number"
                                            className="w-full border border-slate-300 rounded md p-2 text-sm"
                                            value={tier.minAmount}
                                            onChange={e => handleTierChange(index, 'minAmount', Number(e.target.value))}
                                        />
                                    </div>
                                    <div className="flex-1">
                                        <label className="block text-xs font-medium text-slate-500 mb-1">Description (Optional)</label>
                                        <input
                                            type="text"
                                            className="w-full border border-slate-300 rounded md p-2 text-sm"
                                            value={tier.rewardDescription}
                                            onChange={e => handleTierChange(index, 'rewardDescription', e.target.value)}
                                        />
                                    </div>
                                    <div className="pt-6">
                                        <button type="button" onClick={() => removeTier(index)} className="text-red-500 p-1 hover:bg-red-50 rounded">
                                            <Trash2 size={16} />
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="flex justify-end gap-4">
                        <button
                            type="button"
                            onClick={() => router.back()}
                            className="px-6 py-2 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={submitting}
                            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
                        >
                            {submitting ? (isEditing ? 'Updating...' : 'Creating...') : (isEditing ? 'Update Contest' : 'Create Contest')}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
