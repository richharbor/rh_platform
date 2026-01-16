"use client";
import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { supportService } from '@/services/Support/supportService';
import SidePanel from '@/components/ui/SidePanel';

export default function SupportPage() {
    const [tickets, setTickets] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    // SidePanel State
    const [selectedTicket, setSelectedTicket] = useState<any>(null);
    const [isPanelOpen, setIsPanelOpen] = useState(false);
    const [newStatus, setNewStatus] = useState('');
    const [actionLoading, setActionLoading] = useState(false);

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        setLoading(true);
        try {
            const data = await supportService.getAllTickets();
            setTickets(data);
        } catch (error) {
            console.error("Failed to load tickets", error);
        } finally {
            setLoading(false);
        }
    };

    const openPanel = (ticket: any) => {
        setSelectedTicket(ticket);
        setNewStatus(ticket.status);
        setIsPanelOpen(true);
    };

    const handleUpdateStatus = async () => {
        if (!selectedTicket || !newStatus) return;
        setActionLoading(true);
        try {
            const updated = await supportService.updateTicket(selectedTicket.id, { status: newStatus });
            setTickets(prev => prev.map(t => t.id === updated.id ? updated : t));
            setSelectedTicket(updated);
            toast.success('Ticket Updated');
        } catch (error) {
            toast.error('Failed to update ticket');
        } finally {
            setActionLoading(false);
        }
    };

    const getStatusColor = (status: string) => {
        if (status === 'Open') return 'bg-red-100 text-red-800';
        if (status === 'In Progress') return 'bg-yellow-100 text-yellow-800';
        if (status === 'Resolved') return 'bg-green-100 text-green-800';
        return 'bg-gray-100 text-gray-800';
    };

    return (
        <div>
            {/* Header */}
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold">Reports / Requests</h1>
                <button className="btn bg-gray-200 text-gray-800" onClick={loadData}>Refresh</button>
            </div>

            {/* Table */}
            <div className="table-container">
                <table>
                    <thead>
                        <tr>
                            <th>ID</th>
                            <th>Subject</th>
                            <th>User</th>
                            <th>Status</th>
                            <th>Created</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {loading ? (
                            <tr><td colSpan={6} className="p-8 text-center text-gray-500">Loading...</td></tr>
                        ) : tickets.length === 0 ? (
                            <tr><td colSpan={6} className="p-8 text-center text-gray-500">No reports found.</td></tr>
                        ) : (
                            tickets.map(ticket => (
                                <tr key={ticket.id} className="hover:bg-gray-50 cursor-pointer" onClick={() => openPanel(ticket)}>
                                    <td>#{ticket.id}</td>
                                    <td className="font-medium text-gray-900">{ticket.subject}</td>
                                    <td>
                                        <div>{ticket.user?.name || 'Unknown'}</div>
                                        <div className="text-xs text-gray-500">{ticket.user?.phone}</div>
                                    </td>
                                    <td>
                                        <span className={`px-2 py-1 rounded-full text-xs font-bold uppercase ${getStatusColor(ticket.status)}`}>
                                            {ticket.status}
                                        </span>
                                    </td>
                                    <td className="text-gray-500">{new Date(ticket.createdAt).toLocaleDateString()}</td>
                                    <td>
                                        <button className="text-blue-600 hover:underline">View</button>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            {/* Side Panel */}
            <SidePanel isOpen={isPanelOpen} onClose={() => setIsPanelOpen(false)} title={`Report #${selectedTicket?.id}`}>
                {selectedTicket && (
                    <div className="space-y-6">

                        {/* Status Update Block */}
                        <div className="bg-gray-50 p-4 rounded border">
                            <label className="text-xs font-bold text-gray-500 uppercase mb-2 block">Current Status</label>
                            <div className="flex gap-2">
                                <select
                                    className="input flex-1"
                                    value={newStatus}
                                    onChange={(e) => setNewStatus(e.target.value)}
                                >
                                    <option value="Open">Open</option>
                                    <option value="In Progress">In Progress</option>
                                    <option value="Resolved">Resolved</option>
                                    <option value="Closed">Closed</option>
                                </select>
                                <button
                                    className="btn btn-primary"
                                    onClick={handleUpdateStatus}
                                    disabled={actionLoading || newStatus === selectedTicket.status}
                                >
                                    {actionLoading ? '...' : 'Update'}
                                </button>
                            </div>
                        </div>

                        {/* Description */}
                        <div>
                            <h4 className="font-bold text-gray-900 mb-2">Subject</h4>
                            <p className="text-lg text-gray-800 mb-4">{selectedTicket.subject}</p>

                            <h4 className="font-bold text-gray-900 mb-2">Description</h4>
                            <div className="bg-white p-4 rounded border text-gray-700 whitespace-pre-wrap min-h-[100px]">
                                {selectedTicket.description}
                            </div>
                        </div>

                        {/* User Info */}
                        <div>
                            <h4 className="font-bold text-gray-900 mb-3 border-b pb-2">User Details</h4>
                            <div className="space-y-2 text-sm">
                                <div className="flex justify-between">
                                    <span className="text-gray-500">Name</span>
                                    <span className="font-medium">{selectedTicket.user?.name}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-gray-500">Email</span>
                                    <span className="font-medium">{selectedTicket.user?.email || '-'}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-gray-500">Phone</span>
                                    <span className="font-medium">{selectedTicket.user?.phone || '-'}</span>
                                </div>
                            </div>
                        </div>

                        {/* Meta */}
                        <div className="text-xs text-gray-400 text-center mt-6">
                            Created on {new Date(selectedTicket.createdAt).toLocaleString()}
                            {selectedTicket.assignedTo && (
                                <div>Assigned to: {selectedTicket.assignedTo.name}</div>
                            )}
                        </div>

                    </div>
                )}
            </SidePanel>
        </div>
    );
}
