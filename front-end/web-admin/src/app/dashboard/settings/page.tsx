"use client";
import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import axios from 'axios';

// Service Function (Ideally move to services/adminService.ts, keeping here for speed as per user req style)
import { settingsService } from '@/services/Settings/settingsService';

// Service calls moved to settingsService.ts

export default function SettingsPage() {
    const [rules, setRules] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [updates, setUpdates] = useState<Record<number, number>>({});
    const [saving, setSaving] = useState<number | null>(null);

    useEffect(() => {
        loadRules();
    }, []);

    const loadRules = async () => {
        try {
            const data = await settingsService.getProductRules();
            setRules(data);
        } catch (error) {
            console.error("Failed to load rules", error);
        } finally {
            setLoading(false);
        }
    };

    const handleUpdate = async (id: number) => {
        if (updates[id] === undefined) return;
        setSaving(id);
        try {
            const updated = await settingsService.updateProductRule(id, updates[id]);
            setRules(prev => prev.map(r => r.id === id ? updated : r));
            const newUpdates = { ...updates };
            delete newUpdates[id];
            setUpdates(newUpdates);
            toast.success('Rule updated successfully');
        } catch (error) {
            toast.error('Failed to update rule');
        } finally {
            setSaving(null);
        }
    };

    return (
        <div>
            <h1 className="text-2xl font-bold mb-6">Settings</h1>

            <div className="card max-w-2xl">
                <h2 className="text-xl font-bold mb-4">Reward Configuration</h2>
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead>
                            <tr className="border-b text-left">
                                <th className="p-3">Product Type</th>
                                <th className="p-3">Reward %</th>
                                <th className="p-3">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? <tr><td colSpan={3} className="p-4 text-center">Loading...</td></tr> :
                                rules.map(rule => (
                                    <tr key={rule.id} className="border-b border-gray-100 last:border-0 hover:bg-gray-50">
                                        <td className="p-3 font-medium">{rule.product_type}</td>
                                        <td className="p-3">
                                            <div className="flex items-center gap-2">
                                                <input
                                                    type="number"
                                                    step="0.1"
                                                    className="input w-24 py-1"
                                                    value={updates[rule.id] !== undefined ? updates[rule.id] : rule.reward_percentage}
                                                    onChange={(e) => setUpdates({ ...updates, [rule.id]: parseFloat(e.target.value) })}
                                                />
                                                <span className="text-gray-500">%</span>
                                            </div>
                                        </td>
                                        <td className="p-3">
                                            {updates[rule.id] !== undefined && (
                                                <button
                                                    onClick={() => handleUpdate(rule.id)}
                                                    disabled={saving === rule.id}
                                                    className="btn btn-primary py-1 px-3 text-sm"
                                                >
                                                    {saving === rule.id ? 'Saving...' : 'Save'}
                                                </button>
                                            )}
                                        </td>
                                    </tr>
                                ))
                            }
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
