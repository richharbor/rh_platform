"use client";
import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { getLeads, assignLead, updateLeadInternalStatus, createLead, updateLead } from '@/services/Leads/leadService';
import { getRMs } from '@/services/Users/userService';
import SidePanel from '@/components/ui/SidePanel';
// import Modal from '@/components/ui/Modal';

import { settingsService } from '@/services/Settings/settingsService';
import { ScrollArea } from '@/components/ui/scroll-area';

export default function LeadsPage() {
    const [leads, setLeads] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [filters, setFilters] = useState({ product: '', status: '', search: '' });

    // Side Panel & Action States
    const [selectedLead, setSelectedLead] = useState<any>(null);
    const [isPanelOpen, setIsPanelOpen] = useState(false);
    const [activeTab, setActiveTab] = useState('summary');
    const [rms, setRms] = useState<any[]>([]);

    // Edit States
    const [newStatus, setNewStatus] = useState('');
    const [assigneeId, setAssigneeId] = useState('');
    const [notifyUser, setNotifyUser] = useState(true); // Default true
    const [actionLoading, setActionLoading] = useState(false);

    // Reward Confirmation State
    // Reward Confirmation State
    const [isRewardConfirmOpen, setIsRewardConfirmOpen] = useState(false);
    const [rewardAmount, setRewardAmount] = useState(0);
    const [calculationDetails, setCalculationDetails] = useState<any>(null); // Store breakdown
    const [productRules, setProductRules] = useState<any[]>([]);

    // Create/Edit Form State
    const [isCreateOpen, setIsCreateOpen] = useState(false);
    const [isEditRequirements, setIsEditRequirements] = useState(false);
    const [formData, setFormData] = useState<any>({
        name: '', email: '', phone: '', city: '',
        product_type: 'Unlisted Shares',
        requirement: '',
        product_details: {}
    });

    useEffect(() => {
        loadData();
        loadRules();
    }, [filters]);

    const loadRules = async () => {
        try {
            const rules = await settingsService.getProductRules();
            setProductRules(rules);
        } catch (e) { console.error("Error loading rules", e); }
    };

    const loadData = async () => {
        setLoading(true);
        try {
            const [leadsData, rmsData] = await Promise.all([getLeads(), getRMs()]);
            setRms(rmsData);

            let filtered = leadsData;
            if (filters.status) filtered = filtered.filter((l: any) => l.internal_status === filters.status);
            if (filters.product) filtered = filtered.filter((l: any) => l.product_type === filters.product);
            if (filters.search) {
                const q = filters.search.toLowerCase();
                filtered = filtered.filter((l: any) =>
                    l.name.toLowerCase().includes(q) ||
                    l.email?.toLowerCase().includes(q) ||
                    l.phone?.includes(q)
                );
            }
            setLeads(filtered);
        } catch (error) {
            console.error("Failed to load data", error);
        } finally {
            setLoading(false);
        }
    };

    const openLead = (lead: any) => {
        setSelectedLead(lead);
        setNewStatus(lead.status || 'New');
        setAssigneeId(lead.assignee_id || '');
        setActiveTab('summary');
        setIsPanelOpen(true);
    };

    const handleStatusUpdate = async () => {
        if (!selectedLead) return;

        // Check if moving to Disbursed/Closed - Show Confirmation
        if ((newStatus === 'Disbursed' || newStatus === 'Closed') && selectedLead.status !== newStatus) {
            // Calculate Estimated Reward
            const leadType = selectedLead.product_type;
            const rule = productRules.find(r => r.product_type === leadType || r.product_type.toLowerCase() === leadType.toLowerCase());
            // Determine percentage based on user's role
            // Determine percentage based on user's role
            let percentage = 0;
            const rawRole = selectedLead.user?.role || 'partner';
            const role = rawRole.toLowerCase();

            if (rule) {
                if (role === 'customer') {
                    percentage = rule.customer_percentage || 0;
                } else if (role === 'referral partner' || role === 'referral_partner') {
                    percentage = rule.referral_partner_percentage || 0;
                } else {
                    // Default to Partner (role === 'partner' or other)
                    percentage = rule.partner_percentage || 0;
                }
                console.log(`Calculating incentive for ${role}: ${percentage}%`);
            }

            const details = selectedLead.product_details || {};
            // Extract value based on known fields or generic amount
            const val = details.amount || details.capital || details.ticketSize || details.budget || details.coverage || details.sumInsured || details.price || 0;
            const leadValue = parseFloat(val) || 0;
            // Also consider quantity if price exists (e.g. Unlisted)
            const finalValue = (details.price && details.quantity) ? (parseFloat(details.price) * parseFloat(details.quantity)) : leadValue;

            const estAmount = finalValue * (percentage / 100);

            // Store details for display
            setCalculationDetails({
                role: rawRole, // Display the raw role name (e.g. "Partner" or "partner")
                percentage: percentage,
                leadValue: finalValue,
                productType: leadType
            });

            setRewardAmount(estAmount);
            setIsRewardConfirmOpen(true);
            return;
        }

        // otherwise regular update
        await finalizeStatusUpdate();
    };

    const finalizeStatusUpdate = async () => {
        setActionLoading(true);
        try {
            const payload = {
                status: newStatus,
                incentive_amount: rewardAmount, // Will be 0 if not set via modal, which logic ignores or uses as 0 override?
                // Actually backend logic: if undefined/null -> calc. If provide -> use. 
                // We should pass it ONLY if we confirmed it. But if we skip confirmation, we pass 0?
                // Better: pass it only if isRewardConfirmOpen was true. 
                // But simplified: pass it always? No, strict check backend checks for undefined.
                notifyUser: notifyUser
            };

            // If we are confirming reward, pass it.
            if (isRewardConfirmOpen) {
                // @ts-ignore
                payload.incentive_amount = rewardAmount;
            }

            const updated = await updateLeadInternalStatus(selectedLead.id, payload);

            setLeads(prev => prev.map(l => l.id === updated.id ? { ...l, ...updated } : l));
            setSelectedLead({ ...selectedLead, ...updated });

            toast.success('Status updated successfully');
            setIsRewardConfirmOpen(false);
        } catch (error) {
            console.error(error);
            toast.error('Failed to update status');
        } finally {
            setActionLoading(false);
        }
    };

    const handleAssign = async () => {
        if (!selectedLead || !assigneeId) return;
        setActionLoading(true);
        try {
            const updated = await assignLead({ leadId: selectedLead.id, rmId: assigneeId });

            // We need to re-fetch or manual merge because assignLead returns the lead but might not populate 'assigned_rm' relation immediately if backend just returns row
            // Ideally we re-fetch, but for speed let's manually find the name
            const rm = rms.find(r => r.id === assigneeId);
            const enrichedC = { ...updated, assigned_admin: rm }; // Mock relation update

            setLeads(prev => prev.map(l => l.id === updated.id ? enrichedC : l));
            setSelectedLead({ ...selectedLead, ...updated, assigned_admin: rm });

            toast.success('RM Assigned successfully');
        } catch (error) {
            toast.error('Failed to assign RM');
        } finally {
            setActionLoading(false);
        }
    };

    return (
        <div>
            {/* Header & Filters (Keep same structure) */}
            {/* Header & Filters */}
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold">Lead Management</h1>
                <div className="flex gap-2">
                    <button className="btn bg-gray-200 text-gray-800" onClick={() => loadData()}>Refresh</button>
                    <button className="btn btn-primary" onClick={() => {
                        setFormData({ name: '', email: '', phone: '', city: '', product_type: 'Unlisted Shares', requirement: '', product_details: {} });
                        setIsCreateOpen(true);
                    }}>+ Create Lead</button>
                </div>
            </div>

            <div className="card mb-6">
                <div className="flex gap-4">
                    <input className="input" placeholder="Search Client..." value={filters.search} onChange={e => setFilters({ ...filters, search: e.target.value })} />
                    <select className="input" value={filters.status} onChange={e => setFilters({ ...filters, status: e.target.value })}>
                        <option value="">All Statuses</option>
                        <option value="New">New</option>
                        <option value="In Progress">In Progress</option>
                        <option value="Credit Approved">Credit Approved</option>
                        <option value="Disbursed">Disbursed</option>
                        <option value="Closed">Closed</option>
                        <option value="Rejected">Rejected</option>
                    </select>
                </div>
            </div>

            {/* Table */}
            <div className="table-container">
                <table>
                    <thead>
                        <tr>
                            <th>Lead ID</th><th>Client Name</th><th>Product</th><th>Status</th><th>Assigned RM</th><th>Created</th><th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {loading ? <tr><td colSpan={7} className="text-center p-4">Loading...</td></tr> :
                            leads.map((lead) => (
                                <tr key={lead.id} className="hover:bg-gray-50 cursor-pointer" onClick={() => openLead(lead)}>
                                    <td>{lead.id}</td>
                                    <td>{lead.name}</td>
                                    <td>{lead.product_type}</td>
                                    <td><span className={`status-badge`}>{lead.status}</span></td>
                                    <td>{lead.assigned_admin ? lead.assigned_admin.name : 'Unassigned'}</td>
                                    <td>{new Date(lead.createdAt).toLocaleDateString()}</td>
                                    <td><button className="text-blue-600 hover:underline">View</button></td>
                                </tr>
                            ))}
                    </tbody>
                </table>
            </div>

            {/* Right Side Panel */}
            <SidePanel isOpen={isPanelOpen} onClose={() => { setIsPanelOpen(false); setIsRewardConfirmOpen(false); }} title={`Lead #${selectedLead?.id} - ${selectedLead?.name}`}>
                {selectedLead && (
                    <div className="space-y-6">
                        {/* Tabs */}
                        <div className="flex border-b border-gray-200">
                            {['summary', 'assignment', 'status'].map(t => (
                                <button key={t} onClick={() => setActiveTab(t)} className={`px-4 py-2 capitalize ${activeTab === t ? 'border-b-2 border-blue-600 text-blue-600 font-bold' : 'text-gray-500'}`}>{t}</button>
                            ))}
                        </div>

                        {activeTab === 'summary' && (
                            <div className="space-y-4">
                                <div className="p-4 bg-gray-50 rounded">
                                    <h4 className="font-bold text-gray-700 mb-2">Contact Details</h4>
                                    <p>Email: {selectedLead.email}</p>
                                    <p>Phone: {selectedLead.phone}</p>
                                    <p>City: {selectedLead.city}</p>
                                </div>

                                {/* Requirement & Product Details (Editable) */}
                                <div className="border p-4 rounded-lg">
                                    <div className="flex justify-between items-center mb-3">
                                        <h4 className="font-bold text-gray-700">Requirement Details</h4>
                                        {!isEditRequirements ? (
                                            <button className="text-blue-600 text-sm hover:underline" onClick={() => {
                                                setFormData({
                                                    ...selectedLead,
                                                    product_details: selectedLead.product_details || {},
                                                    requirement: selectedLead.requirement || ''
                                                });
                                                setIsEditRequirements(true);
                                            }}>Edit</button>
                                        ) : (
                                            <div className="flex gap-2">
                                                <button className="text-gray-500 text-xs" onClick={() => setIsEditRequirements(false)}>Cancel</button>
                                                <button className="text-green-600 text-xs font-bold" onClick={async () => {
                                                    const res = await updateLead(selectedLead.id, {
                                                        product_details: formData.product_details,
                                                        requirement: formData.requirement
                                                    });
                                                    setLeads(prev => prev.map(l => l.id === res.id ? { ...l, ...res } : l));
                                                    setSelectedLead({ ...selectedLead, ...res });
                                                    setIsEditRequirements(false);
                                                    toast.success('Updated');
                                                }}>Save</button>
                                            </div>
                                        )}
                                    </div>

                                    {!isEditRequirements ? (
                                        <>
                                            <div className="mb-2">
                                                <p className="text-sm font-semibold text-gray-500">Requirement</p>
                                                <p className="text-sm">{selectedLead.requirement || '-'}</p>
                                            </div>
                                            <div>
                                                <p className="text-sm font-semibold text-gray-500">Specs</p>
                                                <pre className="bg-gray-50 p-2 rounded text-xs overflow-x-auto font-mono">
                                                    {Object.entries(selectedLead.product_details || {}).map(([k, v]) => `${k}: ${v}`).join('\n')}
                                                </pre>
                                            </div>
                                        </>
                                    ) : (
                                        <div className="animation-fade-in space-y-3">
                                            {selectedLead.product_type === 'Unlisted Shares' && (
                                                <>
                                                    <div>
                                                        <label className="text-xs font-semibold text-gray-500">Scrip Name</label>
                                                        <input className="input h-8 text-sm"
                                                            value={formData.product_details.scripName || ''}
                                                            onChange={e => setFormData({ ...formData, product_details: { ...formData.product_details, scripName: e.target.value } })}
                                                        />
                                                    </div>
                                                    <div className="grid grid-cols-2 gap-2">
                                                        <div>
                                                            <label className="text-xs font-semibold text-gray-500">Qty</label>
                                                            <input className="input h-8 text-sm" type="number"
                                                                value={formData.product_details.quantity || ''}
                                                                onChange={e => setFormData({ ...formData, product_details: { ...formData.product_details, quantity: e.target.value } })}
                                                            />
                                                        </div>
                                                        <div>
                                                            <label className="text-xs font-semibold text-gray-500">Price</label>
                                                            <input className="input h-8 text-sm" type="number"
                                                                value={formData.product_details.price || ''}
                                                                onChange={e => setFormData({ ...formData, product_details: { ...formData.product_details, price: e.target.value } })}
                                                            />
                                                        </div>
                                                    </div>
                                                </>
                                            )}
                                            {selectedLead.product_type === 'Insurance' && (
                                                <>
                                                    <div>
                                                        <label className="text-xs font-semibold text-gray-500">Type</label>
                                                        <select className="input h-8 text-sm py-0"
                                                            value={formData.product_details.type || 'Health'}
                                                            onChange={e => setFormData({ ...formData, product_details: { ...formData.product_details, type: e.target.value } })}
                                                        >
                                                            <option value="Health">Health</option>
                                                            <option value="Life">Life</option>
                                                            <option value="Motor">Motor</option>
                                                        </select>
                                                    </div>
                                                    <div>
                                                        <label className="text-xs font-semibold text-gray-500">Coverage</label>
                                                        <input className="input h-8 text-sm"
                                                            value={formData.product_details.coverage || ''}
                                                            onChange={e => setFormData({ ...formData, product_details: { ...formData.product_details, coverage: e.target.value } })}
                                                        />
                                                    </div>
                                                </>
                                            )}
                                            <div>
                                                <label className="text-xs font-semibold text-gray-500">General Requirement</label>
                                                <textarea className="input text-sm p-2 h-20"
                                                    value={formData.requirement || ''}
                                                    onChange={e => setFormData({ ...formData, requirement: e.target.value })}
                                                />
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}

                        {activeTab === 'assignment' && (
                            <div className="space-y-4">
                                <p>Current RM: <b>{selectedLead.assigned_admin ? selectedLead.assigned_admin.name : 'None'}</b></p>
                                <select className="input" value={assigneeId} onChange={e => setAssigneeId(e.target.value)}>
                                    <option value="">Select RM</option>
                                    {rms.map(r => <option key={r.id} value={r.id}>{r.name}</option>)}
                                </select>
                                <button className="btn btn-primary w-full" onClick={handleAssign} disabled={actionLoading}>
                                    {actionLoading ? 'Assigning...' : 'Update Assignment'}
                                </button>
                            </div>
                        )}

                        {activeTab === 'status' && (
                            <div className="space-y-4">
                                <label className="block text-sm font-bold">Internal Status</label>
                                <select
                                    className="input"
                                    value={newStatus}
                                    onChange={e => {
                                        setNewStatus(e.target.value);
                                        setIsRewardConfirmOpen(false); // Reset on change
                                    }}
                                    disabled={isRewardConfirmOpen || selectedLead.status === 'Closed'}
                                >
                                    <option value="New">New</option>
                                    <option value="In Progress">In Progress</option>
                                    <option value="Credit Approved">Credit Approved</option>
                                    <option value="Disbursed">Disbursed</option>
                                    <option value="Closed">Closed</option>
                                    <option value="Rejected">Rejected</option>
                                </select>

                                {newStatus === 'Rejected' && (
                                    <div className="bg-yellow-50 p-2 rounded text-xs text-yellow-800 mb-2">
                                        Note: Lead will be marked as rejected.
                                    </div>
                                )}

                                {(newStatus === 'Closed' || newStatus === 'Disbursed') && (
                                    <div className="bg-blue-50 p-2 rounded text-xs text-blue-800 mb-2">
                                        Note: If you change the status to {newStatus}, it creates a payout you can see in the payout page. {newStatus === 'Closed' ? 'Once the lead is Closed, you cannot change it again.' : ''}
                                    </div>
                                )}

                                {/* Inline Confirmation for Disbursed/Closed */}
                                {isRewardConfirmOpen ? (
                                    <div className="bg-blue-50 p-4 rounded-lg animation-fade-in border border-blue-100">
                                        <h4 className="font-bold text-blue-900 mb-2 text-sm">Confirm Incentive Payout</h4>
                                        <p className="text-xs text-blue-700 mb-3">
                                            Status change to <b>{newStatus}</b> will trigger a payout.
                                        </p>

                                        {/* Calculation Breakdown */}
                                        {calculationDetails && (
                                            <div className="bg-white/50 p-3 rounded mb-3 text-xs border border-blue-100">
                                                <div className="flex justify-between mb-1">
                                                    <span className="text-gray-500">User Role:</span>
                                                    <span className="font-bold">{calculationDetails.role}</span>
                                                </div>
                                                <div className="flex justify-between mb-1">
                                                    <span className="text-gray-500">Lead Value:</span>
                                                    <span>₹{calculationDetails.leadValue.toLocaleString()}</span>
                                                </div>
                                                <div className="flex justify-between mb-1">
                                                    <span className="text-gray-500">Rate ({calculationDetails.productType}):</span>
                                                    <span>{calculationDetails.percentage}%</span>
                                                </div>
                                                <div className="border-t border-blue-200 my-1 pt-1 flex justify-between font-bold text-blue-900">
                                                    <span>Calculated:</span>
                                                    <span>₹{(calculationDetails.leadValue * (calculationDetails.percentage / 100)).toLocaleString()}</span>
                                                </div>
                                            </div>
                                        )}

                                        <label className="text-xs font-bold text-gray-500 uppercase">Incentive Amount (₹)</label>
                                        <input
                                            type="number"
                                            className="input text-lg font-bold text-gray-900 w-full mb-4"
                                            value={rewardAmount || ''}
                                            placeholder="0"
                                            onChange={(e) => setRewardAmount(Number(e.target.value))}
                                        />

                                        <button
                                            className="btn btn-primary w-full mb-2 bg-green-600 hover:bg-green-700"
                                            onClick={finalizeStatusUpdate}
                                            disabled={actionLoading}
                                        >
                                            {actionLoading ? 'Processing...' : `Confirm & Update Status`}
                                        </button>
                                        <button
                                            className="btn w-full bg-white border border-gray-200 text-gray-600 hover:bg-gray-50"
                                            onClick={() => setIsRewardConfirmOpen(false)}
                                        >
                                            Cancel
                                        </button>
                                    </div>
                                ) : (
                                    <div>
                                        {selectedLead.status === 'Closed' && (
                                            <div className="bg-red-50 p-2 rounded text-xs text-red-800 mb-4 border border-red-100">
                                                Locked: This lead is Closed and status cannot be changed.
                                            </div>
                                        )}
                                        <div className="flex items-center gap-2 mb-4">
                                            <input
                                                type="checkbox"
                                                id="notifyUser"
                                                className="w-4 h-4 text-blue-600 rounded"
                                                checked={notifyUser}
                                                onChange={e => setNotifyUser(e.target.checked)}
                                                disabled={selectedLead.status === 'Closed'}
                                            />
                                            <label htmlFor="notifyUser" className="text-sm font-medium text-slate-700">Notify User via App 🔔</label>
                                        </div>

                                        <button
                                            className="btn btn-primary w-full disabled:opacity-50 disabled:cursor-not-allowed"
                                            onClick={handleStatusUpdate}
                                            disabled={actionLoading || selectedLead.status === 'Closed'}
                                        >
                                            {actionLoading ? 'Updating...' : 'Update Status'}
                                        </button>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                )}
            </SidePanel>



            {
                isCreateOpen && (
                    <div onClick={() => setIsCreateOpen(false)} className="fixed inset-0 backdrop-blur-sm bg-black/20 flex items-center justify-center p-4 z-50">
                        <div onClick={(e) => e.stopPropagation()} className="bg-white flex flex-col rounded-xl shadow-xl max-w-xl w-full h-[90vh] overflow-hidden">
                            <div className="p-6 border-b flex justify-between items-center bg-white z-10">
                                <h2 className="text-xl font-bold">Create New Lead</h2>
                                <button onClick={() => setIsCreateOpen(false)} className="text-gray-500 hover:text-gray-700">✕</button>
                            </div>
                            <ScrollArea className='flex-1 min-h-0'>
                                <div className="p-6 space-y-4">
                                    {/* Basic Info */}
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="label">Client Name</label>
                                            <input className="input" value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} />
                                        </div>
                                        <div>
                                            <label className="label">City</label>
                                            <input className="input" value={formData.city} onChange={e => setFormData({ ...formData, city: e.target.value })} />
                                        </div>
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="label">Phone</label>
                                            <input className="input" value={formData.phone} onChange={e => setFormData({ ...formData, phone: e.target.value })} />
                                        </div>
                                        <div>
                                            <label className="label">Email</label>
                                            <input className="input" type="email" value={formData.email} onChange={e => setFormData({ ...formData, email: e.target.value })} />
                                        </div>
                                    </div>

                                    {/* Product Type Selection */}
                                    <div>
                                        <label className="label">Product Type</label>
                                        <select className="input" value={formData.product_type} onChange={e => setFormData({ ...formData, product_type: e.target.value, product_details: {} })}>
                                            <option value="Unlisted Shares">Unlisted Shares</option>
                                            <option value="Pre-IPO">Pre-IPO</option>
                                            <option value="Insurance">Insurance</option>
                                            <option value="Loan">Loan</option>
                                            <option value="generic">Generic / Other</option>
                                            <option value="insurance">insurance</option>
                                            <option value="loans">loans</option>
                                            <option value="equity">equity</option>
                                            <option value="unlisted">unlisted</option>
                                            <option value="stocks">stocks</option>
                                        </select>
                                    </div>

                                    {/* Dynamic Requirements */}
                                    <div className="p-4 bg-gray-50 rounded border">
                                        <h4 className="font-bold text-sm mb-3 text-gray-700">Requirement Details</h4>
                                        {(formData.product_type === 'Unlisted Shares' || formData.product_type === 'unlisted') && (
                                            <div className="space-y-3">
                                                <div>
                                                    <label className="text-xs font-semibold text-gray-500">Scrip Name / Company</label>
                                                    <input className="input" placeholder="e.g. Reliance Retail"
                                                        value={formData.product_details.scripName || ''}
                                                        onChange={e => setFormData({ ...formData, product_details: { ...formData.product_details, scripName: e.target.value } })}
                                                    />
                                                </div>
                                                <div className="grid grid-cols-2 gap-3">
                                                    <div>
                                                        <label className="text-xs font-semibold text-gray-500">Quantity</label>
                                                        <input className="input" type="number"
                                                            value={formData.product_details.quantity || ''}
                                                            onChange={e => setFormData({ ...formData, product_details: { ...formData.product_details, quantity: e.target.value } })}
                                                        />
                                                    </div>
                                                    <div>
                                                        <label className="text-xs font-semibold text-gray-500">Target Price</label>
                                                        <input className="input" type="number"
                                                            value={formData.product_details.price || ''}
                                                            onChange={e => setFormData({ ...formData, product_details: { ...formData.product_details, price: e.target.value } })}
                                                        />
                                                    </div>
                                                </div>
                                            </div>
                                        )}
                                        {(formData.product_type === 'Insurance' || formData.product_type === 'insurance') && (
                                            <div className="space-y-3">
                                                <div>
                                                    <label className="text-xs font-semibold text-gray-500">Insurance Type</label>
                                                    <select className="input"
                                                        value={formData.product_details.type || 'Health'}
                                                        onChange={e => setFormData({ ...formData, product_details: { ...formData.product_details, type: e.target.value } })}
                                                    >
                                                        <option value="Health">Health</option>
                                                        <option value="Life">Life / Term</option>
                                                        <option value="Motor">Motor</option>
                                                    </select>
                                                </div>
                                                <div>
                                                    <label className="text-xs font-semibold text-gray-500">Sum Insured / Coverage</label>
                                                    <input className="input" placeholder="e.g. 1 Cr"
                                                        value={formData.product_details.coverage || ''}
                                                        onChange={e => setFormData({ ...formData, product_details: { ...formData.product_details, coverage: e.target.value } })}
                                                    />
                                                </div>
                                            </div>
                                        )}
                                        {(!['Unlisted Shares', 'unlisted', 'Insurance', 'insurance'].includes(formData.product_type)) && (
                                            <div>
                                                <label className="text-xs font-semibold text-gray-500">Description / Amount</label>
                                                <textarea className="input h-20" placeholder="Enter details..."
                                                    value={formData.requirement}
                                                    onChange={e => setFormData({ ...formData, requirement: e.target.value })}
                                                />
                                            </div>
                                        )}
                                    </div>

                                    <button className="btn btn-primary w-full py-3" onClick={async () => {
                                        setActionLoading(true);
                                        try {
                                            await createLead(formData);
                                            toast.success('Lead created successfully');
                                            setIsCreateOpen(false);
                                            loadData();
                                        } catch (e) {
                                            toast.error('Failed to create lead');
                                        } finally {
                                            setActionLoading(false);
                                        }
                                    }} disabled={actionLoading}>
                                        {actionLoading ? 'Creating...' : 'Create Lead'}
                                    </button>
                                </div>
                            </ScrollArea>
                        </div>
                    </div>
                )
            }

            {/* Incentive Confirmation Modal */}

        </div >
    )
}
