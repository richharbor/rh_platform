"use client";
import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { payoutService } from '@/services/Payouts/payoutService';
import SidePanel from '@/components/ui/SidePanel';
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog";

export default function PayoutsPage() {
    const [payouts, setPayouts] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [filterStatus, setFilterStatus] = useState('');

    // SidePanel State
    const [selectedPayout, setSelectedPayout] = useState<any>(null);
    const [isPanelOpen, setIsPanelOpen] = useState(false);
    const [processingId, setProcessingId] = useState<number | null>(null);

    // Confirm Dialog State
    const [isConfirmOpen, setIsConfirmOpen] = useState(false);

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        setLoading(true);
        try {
            const data = await payoutService.getPayouts();
            setPayouts(data);
        } catch (error) {
            console.error("Failed to load payouts", error);
        } finally {
            setLoading(false);
        }
    };

    const handleMarkPaidClick = () => {
        setIsConfirmOpen(true);
    };

    const handleConfirmMarkPaid = async () => {
        if (!selectedPayout) return;

        setProcessingId(selectedPayout.id);
        try {
            await payoutService.updateIncentiveStatus(selectedPayout.id, 'paid');
            const updated = { ...selectedPayout, status: 'paid', updated_at: new Date() };

            setPayouts(prev => prev.map(p => p.id === selectedPayout.id ? updated : p));
            setSelectedPayout(updated);
            toast.success('Marked as Paid!');
        } catch (error) {
            toast.error('Failed to update status');
        } finally {
            setProcessingId(null);
            setIsConfirmOpen(false);
        }
    };

    const openPanel = (payout: any) => {
        setSelectedPayout(payout);
        setIsPanelOpen(true);
    };

    const filteredPayouts = filterStatus
        ? payouts.filter(p => p.status === filterStatus)
        : payouts;

    const stats = {
        total: payouts.reduce((acc, curr) => acc + (curr.amount || 0), 0),
        pending: payouts.filter(p => p.status === 'pending').reduce((acc, curr) => acc + (curr.amount || 0), 0),
        paid: payouts.filter(p => p.status === 'paid').reduce((acc, curr) => acc + (curr.amount || 0), 0)
    };

    return (
        <div>
            {/* Header */}
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold">Payout Management</h1>
                <button className="btn bg-gray-200 text-gray-800" onClick={loadData}>Refresh</button>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-6 mb-6">
                <div className="card border-l-4 border-blue-500">
                    <p className="text-xs text-gray-500 font-bold uppercase mb-1">Total Rewards</p>
                    <p className="text-2xl font-bold">₹{stats.total.toLocaleString()}</p>
                </div>
                <div className="card border-l-4 border-orange-500">
                    <p className="text-xs text-orange-500 font-bold uppercase mb-1">Pending Payout</p>
                    <p className="text-2xl font-bold text-orange-600">₹{stats.pending.toLocaleString()}</p>
                </div>
                <div className="card border-l-4 border-green-500">
                    <p className="text-xs text-green-500 font-bold uppercase mb-1">Disbursed / Paid</p>
                    <p className="text-2xl font-bold text-green-600">₹{stats.paid.toLocaleString()}</p>
                </div>
            </div>

            {/* Filters */}
            <div className="card mb-6 flex gap-2">
                <button
                    className={`px-4 py-2 rounded text-sm font-medium transition-colors ${filterStatus === '' ? 'bg-gray-800 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
                    onClick={() => setFilterStatus('')}
                >All</button>
                <button
                    className={`px-4 py-2 rounded text-sm font-medium transition-colors ${filterStatus === 'pending' ? 'bg-orange-500 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
                    onClick={() => setFilterStatus('pending')}
                >Pending</button>
                <button
                    className={`px-4 py-2 rounded text-sm font-medium transition-colors ${filterStatus === 'paid' ? 'bg-green-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
                    onClick={() => setFilterStatus('paid')}
                >Paid</button>
            </div>

            {/* Table */}
            <div className="table-container">
                <table>
                    <thead>
                        <tr>
                            <th>Updated</th>
                            <th>Partner</th>
                            <th>Lead</th>
                            <th>Amount</th>
                            <th>Status</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {loading ? (
                            <tr><td colSpan={6} className="p-8 text-center text-gray-500">Loading...</td></tr>
                        ) : filteredPayouts.length === 0 ? (
                            <tr><td colSpan={6} className="p-8 text-center text-gray-500">No records found.</td></tr>
                        ) : (
                            filteredPayouts.map(p => (
                                <tr key={p.id} className="hover:bg-gray-50 cursor-pointer" onClick={() => openPanel(p)}>
                                    <td className="text-gray-500">
                                        {new Date(p.updatedAt).toLocaleDateString()}
                                        <div className="text-xs">{new Date(p.updatedAt).toLocaleTimeString()}</div>
                                    </td>
                                    <td>
                                        <div className="font-medium text-gray-900">{p.partner?.name || 'Unknown'}</div>
                                        <div className="text-xs text-gray-500">{p.partner?.phone}</div>
                                    </td>
                                    <td>
                                        <div className="font-medium">#{p.lead_id} {p.lead?.name}</div>
                                        <div className="text-xs text-gray-500 uppercase">{p.lead?.product_type}</div>
                                    </td>
                                    <td className="font-bold text-gray-900">₹{p.amount?.toLocaleString()}</td>
                                    <td>
                                        <span className={`status-badge ${p.status === 'paid' ? 'bg-green-100 text-green-800' : 'bg-orange-100 text-orange-800'}`}>
                                            {p.status}
                                        </span>
                                    </td>
                                    <td>
                                        <button className="text-blue-600 hover:underline">View Details</button>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            {/* Side Panel */}
            <SidePanel isOpen={isPanelOpen} onClose={() => setIsPanelOpen(false)} title="Payout Details" disableClickOutside={isConfirmOpen}>
                {selectedPayout && (
                    <div className="space-y-6">
                        {/* Summary Card */}
                        <div className="bg-gray-50 p-6 rounded-lg text-center border border-gray-100">
                            <p className="text-sm text-gray-500 font-bold uppercase mb-1">Incentive Amount</p>
                            <p className="text-4xl font-bold text-gray-900 mb-2">₹{selectedPayout.amount?.toLocaleString()}</p>
                            <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase ${selectedPayout.status === 'paid' ? 'bg-green-100 text-green-700' : 'bg-orange-100 text-orange-700'}`}>
                                {selectedPayout.status}
                            </span>
                        </div>

                        {/* Partner Details */}
                        <div>
                            <h4 className="font-bold text-gray-900 mb-3 border-b pb-2">Partner Information</h4>
                            <div className="space-y-2 text-sm">
                                <div className="flex justify-between">
                                    <span className="text-gray-500">Name</span>
                                    <span className="font-medium">{selectedPayout.partner?.name || 'Unknown'}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-gray-500">Phone</span>
                                    <span className="font-medium">{selectedPayout.partner?.phone || '-'}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-gray-500">Email</span>
                                    <span className="font-medium">{selectedPayout.partner?.email || '-'}</span>
                                </div>
                            </div>
                        </div>

                        {/* Lead Details */}
                        <div>
                            <h4 className="font-bold text-gray-900 mb-3 border-b pb-2">Lead Information</h4>
                            <div className="space-y-2 text-sm">
                                <div className="flex justify-between">
                                    <span className="text-gray-500">Lead ID</span>
                                    <span className="font-medium">#{selectedPayout.lead_id}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-gray-500">Client Name</span>
                                    <span className="font-medium">{selectedPayout.lead?.name || '-'}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-gray-500">Product</span>
                                    <span className="font-medium">{selectedPayout.lead?.product_type || '-'}</span>
                                </div>
                            </div>
                        </div>

                        {/* Actions */}
                        {selectedPayout.status === 'pending' && (
                            <div className="pt-4 mt-4 border-t">
                                <button
                                    className="btn bg-green-600 hover:bg-green-700 text-white w-full py-3 text-lg"
                                    onClick={handleMarkPaidClick}
                                    disabled={processingId === selectedPayout.id}
                                >
                                    {processingId === selectedPayout.id ? 'Processing...' : 'Mark as Paid'}
                                </button>
                                <p className="text-xs text-center text-gray-400 mt-2">
                                    This will mark the incentive as disbursed in the system.
                                </p>
                            </div>
                        )}

                        {selectedPayout.status === 'paid' && (
                            <div className="bg-green-50 p-4 rounded text-center">
                                <p className="text-green-700 font-bold">Paid on {new Date(selectedPayout.updatedAt).toLocaleDateString()}</p>
                            </div>
                        )}
                    </div>
                )}
            </SidePanel>

            <AlertDialog open={isConfirmOpen} onOpenChange={setIsConfirmOpen}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Confirm Payout Details</AlertDialogTitle>
                        <AlertDialogDescription>
                            Are you sure you want to mark this reward as <span className="font-bold text-green-600">PAID</span>?
                            This action cannot be undone.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={handleConfirmMarkPaid}
                            className="bg-green-600 hover:bg-green-700 focus:ring-green-600"
                        >
                            Confirm Payment
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    );
}
