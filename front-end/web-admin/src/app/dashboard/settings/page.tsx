"use client";
import { useEffect, useState } from 'react';
import axios from 'axios';

// Service Function (Ideally move to services/adminService.ts, keeping here for speed as per user req style)
import { settingsService } from '@/services/Settings/settingsService';

// Service calls moved to settings Service.ts

interface RolePercentages {
    partner_percentage?: number;
    customer_percentage?: number;
    referral_partner_percentage?: number;
}

export default function SettingsPage() {
    const [rules, setRules] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [updates, setUpdates] = useState<Record<number, RolePercentages>>({});
    const [saving, setSaving] = useState<string | null>(null); // "ruleId-role" format

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

    const handlePercentageChange = (ruleId: number, role: 'partner' | 'customer' | 'referral_partner', value: number) => {
        setUpdates(prev => ({
            ...prev,
            [ruleId]: {
                ...prev[ruleId],
                [`${role}_percentage`]: value
            }
        }));
    };

    const handleUpdate = async (ruleId: number, role: 'partner' | 'customer' | 'referral_partner') => {
        const percentageKey = `${role}_percentage`;
        const updateData = updates[ruleId];

        if (!updateData || updateData[percentageKey as keyof RolePercentages] === undefined) return;

        setSaving(`${ruleId}-${role}`);
        try {
            const updated = await settingsService.updateProductRule(ruleId, { [percentageKey]: updateData[percentageKey as keyof RolePercentages] });
            setRules(prev => prev.map(r => r.id === ruleId ? updated : r));

            // Clear this specific field from updates
            setUpdates(prev => {
                const newUpdates = { ...prev };
                if (newUpdates[ruleId]) {
                    delete newUpdates[ruleId][percentageKey as keyof RolePercentages];
                    if (Object.keys(newUpdates[ruleId]).length === 0) {
                        delete newUpdates[ruleId];
                    }
                }
                return newUpdates;
            });

            alert(`${role.replace('_', ' ')} percentage updated successfully`);
        } catch (error) {
            alert('Failed to update percentage');
        } finally {
            setSaving(null);
        }
    };

    return (
        <div>
            <h1 className="text-2xl font-bold mb-6">Settings</h1>

            <div className="card max-w-6xl">
                <h2 className="text-xl font-bold mb-4">Role-Based Reward Configuration</h2>
                <p className="text-gray-600 mb-4 text-sm">Set different reward percentages for each user role per product type.</p>

                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead>
                            <tr className="border-b text-left bg-gray-50">
                                <th className="p-3 font-semibold">Product Type</th>
                                <th className="p-3 font-semibold">Partner %</th>
                                <th className="p-3 font-semibold">Referral Partner %</th>
                                <th className="p-3 font-semibold">Customer %</th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? <tr><td colSpan={4} className="p-4 text-center">Loading...</td></tr> :
                                rules.map(rule => {
                                    const partnerValue = updates[rule.id]?.partner_percentage !== undefined ? updates[rule.id].partner_percentage : rule.partner_percentage;
                                    const customerValue = updates[rule.id]?.customer_percentage !== undefined ? updates[rule.id].customer_percentage : rule.customer_percentage;
                                    const referralValue = updates[rule.id]?.referral_partner_percentage !== undefined ? updates[rule.id].referral_partner_percentage : rule.referral_partner_percentage;

                                    return (
                                        <tr key={rule.id} className="border-b border-gray-100 last:border-0 hover:bg-gray-50">
                                            <td className="p-3 font-medium capitalize">{rule.product_type}</td>

                                            {/* Partner Percentage */}
                                            <td className="p-3">
                                                <div className="flex items-center gap-2">
                                                    <input
                                                        type="number"
                                                        step="0.1"
                                                        className="input w-20 py-1"
                                                        value={partnerValue}
                                                        onChange={(e) => handlePercentageChange(rule.id, 'partner', parseFloat(e.target.value))}
                                                    />
                                                    <span className="text-gray-500">%</span>
                                                    {updates[rule.id]?.partner_percentage !== undefined && (
                                                        <button
                                                            onClick={() => handleUpdate(rule.id, 'partner')}
                                                            disabled={saving === `${rule.id}-partner`}
                                                            className="btn btn-primary py-1 px-2 text-xs"
                                                        >
                                                            {saving === `${rule.id}-partner` ? '...' : '✓'}
                                                        </button>
                                                    )}
                                                </div>
                                            </td>

                                            {/* Referral Partner Percentage */}
                                            <td className="p-3">
                                                <div className="flex items-center gap-2">
                                                    <input
                                                        type="number"
                                                        step="0.1"
                                                        className="input w-20 py-1"
                                                        value={referralValue}
                                                        onChange={(e) => handlePercentageChange(rule.id, 'referral_partner', parseFloat(e.target.value))}
                                                    />
                                                    <span className="text-gray-500">%</span>
                                                    {updates[rule.id]?.referral_partner_percentage !== undefined && (
                                                        <button
                                                            onClick={() => handleUpdate(rule.id, 'referral_partner')}
                                                            disabled={saving === `${rule.id}-referral_partner`}
                                                            className="btn btn-primary py-1 px-2 text-xs"
                                                        >
                                                            {saving === `${rule.id}-referral_partner` ? '...' : '✓'}
                                                        </button>
                                                    )}
                                                </div>
                                            </td>

                                            {/* Customer Percentage */}
                                            <td className="p-3">
                                                <div className="flex items-center gap-2">
                                                    <input
                                                        type="number"
                                                        step="0.1"
                                                        className="input w-20 py-1"
                                                        value={customerValue}
                                                        onChange={(e) => handlePercentageChange(rule.id, 'customer', parseFloat(e.target.value))}
                                                    />
                                                    <span className="text-gray-500">%</span>
                                                    {updates[rule.id]?.customer_percentage !== undefined && (
                                                        <button
                                                            onClick={() => handleUpdate(rule.id, 'customer')}
                                                            disabled={saving === `${rule.id}-customer`}
                                                            className="btn btn-primary py-1 px-2 text-xs"
                                                        >
                                                            {saving === `${rule.id}-customer` ? '...' : '✓'}
                                                        </button>
                                                    )}
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })
                            }
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
