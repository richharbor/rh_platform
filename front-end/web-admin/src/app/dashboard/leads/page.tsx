"use client";
import { useEffect, useState } from 'react';
import { getLeads, assignLead, updateLeadInternalStatus } from '@/services/Leads/leadService';
import { getRMs } from '@/services/Users/userService';
import SidePanel from '@/components/ui/SidePanel';

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
    const [actionLoading, setActionLoading] = useState(false);

    useEffect(() => {
        loadData();
    }, [filters]);

    const loadData = async () => {
        setLoading(true);
        try {
            const [leadsData, rmsData] = await Promise.all([getLeads(), getRMs()]);
            setRms(rmsData);

            let filtered = leadsData;
            // Client-side filtering logic remains...
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
        setActionLoading(true);
        try {
            const payload = {
                status: newStatus
            };
            const updated = await updateLeadInternalStatus(selectedLead.id, payload);

            // Critical Fix: Update local state to reflect change immediately
            setLeads(prev => prev.map(l => l.id === updated.id ? { ...l, ...updated } : l));
            setSelectedLead({ ...selectedLead, ...updated }); // Update panel view too

            alert('Status updated successfully');
        } catch (error) {
            console.error(error);
            alert('Failed to update status');
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

            alert('RM Assigned successfully');
        } catch (error) {
            alert('Failed to assign RM');
        } finally {
            setActionLoading(false);
        }
    };

    return (
        <div>
            {/* Header & Filters (Keep same structure) */}
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold">Lead Management</h1>
                <button className="btn btn-primary" onClick={() => loadData()}>Refresh</button>
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
            <SidePanel isOpen={isPanelOpen} onClose={() => setIsPanelOpen(false)} title={`Lead #${selectedLead?.id} - ${selectedLead?.name}`}>
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
                                <div>
                                    <h4 className="font-bold text-gray-700 mb-2">Requirement</h4>
                                    <p className="text-sm border p-2 rounded">{selectedLead.requirement}</p>
                                </div>
                                <div>
                                    <h4 className="font-bold text-gray-700 mb-2">Product Data</h4>
                                    <pre className="bg-gray-100 p-2 rounded text-xs overflow-x-auto">{JSON.stringify(selectedLead.product_details, null, 2)}</pre>
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
                                <select className="input" value={newStatus} onChange={e => setNewStatus(e.target.value)}>
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

                                <button className="btn btn-primary w-full" onClick={handleStatusUpdate} disabled={actionLoading}>
                                    {actionLoading ? 'Updating...' : 'Update Status'}
                                </button>
                            </div>
                        )}
                    </div>
                )}
            </SidePanel>
        </div>
    );
}
