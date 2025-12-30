"use client";
import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { getLead, assignLead, updateLeadInternalStatus } from '@/services/Leads/leadService';
import { getRMs } from '@/services/Users/userService';

export default function LeadDetailPage() {
    const { id } = useParams() as { id: string };
    const [lead, setLead] = useState<any>(null);
    const [rms, setRms] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [message, setMessage] = useState('');
    const [activeTab, setActiveTab] = useState('summary');

    // Action States
    const [selectedRm, setSelectedRm] = useState('');
    const [newStatus, setNewStatus] = useState('');
    const [rejectionReason, setRejectionReason] = useState('');

    useEffect(() => {
        loadData();
    }, [id]);

    const loadData = async () => {
        try {
            const [leadData, rmData] = await Promise.all([
                getLead(id),
                getRMs()
            ]);
            setLead(leadData);
            setRms(rmData);
            setNewStatus(leadData.internal_status || 'New');
        } catch (error) {
            console.error("Failed to load details", error);
        } finally {
            setLoading(false);
        }
    };

    const handleAssign = async () => {
        try {
            await assignLead({ leadId: id, rmId: selectedRm });
            setMessage('RM Assigned successfully');
            loadData();
        } catch (error) {
            setMessage('Failed to assign RM');
        }
    };

    const handleStatusUpdate = async () => {
        try {
            await updateLeadInternalStatus(id, {
                status: newStatus,
                reason: newStatus === 'Rejected' ? rejectionReason : null
            });
            setMessage('Status updated successfully');
            loadData();
        } catch (error) {
            setMessage('Failed to update status');
        }
    };

    if (loading) return <div className="p-8">Loading...</div>;
    if (!lead) return <div className="p-8">Lead not found</div>;

    return (
        <div>
            <h1 className="text-2xl font-bold mb-4">Lead: {lead.name}</h1>
            {message && <div className="bg-blue-100 text-blue-800 p-3 rounded mb-4">{message}</div>}

            {/* Tabs */}
            <div className="flex border-b border-gray-200 mb-6">
                {['summary', 'assignment', 'status'].map((tab) => (
                    <button
                        key={tab}
                        className={`py-2 px-4 font-medium ${activeTab === tab ? 'border-b-2 border-blue-500 text-blue-600' : 'text-gray-500 hover:text-gray-700'}`}
                        onClick={() => setActiveTab(tab)}
                    >
                        {tab.charAt(0).toUpperCase() + tab.slice(1)}
                    </button>
                ))}
            </div>

            {activeTab === 'summary' && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="card">
                        <h3 className="font-bold mb-4">Client Details</h3>
                        <div className="space-y-2">
                            <p><span className="font-semibold">Email:</span> {lead.email}</p>
                            <p><span className="font-semibold">Phone:</span> {lead.phone}</p>
                            <p><span className="font-semibold">City:</span> {lead.city}</p>
                        </div>
                    </div>
                    <div className="card">
                        <h3 className="font-bold mb-4">Product Request</h3>
                        <p><span className="font-semibold">Type:</span> {lead.product_type}</p>
                        <p><span className="font-semibold">Expected Payout:</span> {lead.expected_payout || 'N/A'}</p>
                        <div className="mt-4 p-4 bg-gray-50 rounded">
                            <pre className="text-sm overflow-x-auto">
                                {JSON.stringify(lead.product_details, null, 2)}
                            </pre>
                        </div>
                    </div>
                </div>
            )}

            {activeTab === 'assignment' && (
                <div className="card max-w-lg">
                    <h3 className="font-bold mb-4">Assign Relationship Manager</h3>
                    <p className="mb-4">Current RM: <span className="font-bold text-blue-700">{lead.assigned_rm ? lead.assigned_rm.name : 'Unassigned'}</span></p>

                    <div className="mb-4">
                        <label className="label">Select RM</label>
                        <select
                            className="input"
                            value={selectedRm}
                            onChange={(e) => setSelectedRm(e.target.value)}
                        >
                            <option value="">-- Select RM --</option>
                            {rms.map(rm => (
                                <option key={rm.id} value={rm.id}>{rm.name} ({rm.email})</option>
                            ))}
                        </select>
                    </div>
                    <button onClick={handleAssign} className="btn btn-primary">Assign RM</button>
                </div>
            )}

            {activeTab === 'status' && (
                <div className="card max-w-lg">
                    <h3 className="font-bold mb-4">Update Status</h3>
                    <div className="mb-4">
                        <label className="label">Internal Status</label>
                        <select
                            className="input"
                            value={newStatus}
                            onChange={(e) => setNewStatus(e.target.value)}
                        >
                            <option value="New">New</option>
                            <option value="In Progress">In Progress</option>
                            <option value="Credit Approved">Credit Approved</option>
                            <option value="Disbursed">Disbursed</option>
                            <option value="Closed">Closed</option>
                            <option value="Rejected">Rejected</option>
                        </select>
                    </div>

                    {newStatus === 'Rejected' && (
                        <div className="mb-4">
                            <label className="label">Rejection Reason</label>
                            <textarea
                                className="input"
                                value={rejectionReason}
                                onChange={(e) => setRejectionReason(e.target.value)}
                                rows={3}
                            />
                        </div>
                    )}

                    <button onClick={handleStatusUpdate} className="btn btn-primary">Update Status</button>
                </div>
            )}
        </div>
    );
}
