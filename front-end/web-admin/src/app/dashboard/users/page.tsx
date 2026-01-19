"use client";
import { useEffect, useState } from 'react';
import { getUsers, approvePartner, getUpgradeRequests, reviewUpgradeRequest } from '@/services/Users/userService'; // Updated import
import SidePanel from '@/components/ui/SidePanel';
import { toast } from 'sonner';

// User Interface
interface User {
    id: number;
    name: string;
    email: string;
    phone: string;
    role: string;
    kyc_status: string;
    createdAt: string;
    city?: string;
    signup_data?: any;
}

interface UpgradeRequest {
    id: number;
    user_id: number;
    current_role: string;
    requested_role: string;
    status: 'pending' | 'approved' | 'rejected';
    reason: string;
    business_data?: any;
    admin_notes?: string;
    created_at: string;
    user: User;
}

export default function UsersPage() {
    const [activeTab, setActiveTab] = useState<'users' | 'requests'>('users');

    // Users State
    const [users, setUsers] = useState<User[]>([]);
    const [loadingUsers, setLoadingUsers] = useState(true);
    const [selectedUser, setSelectedUser] = useState<User | null>(null);
    const [isUserPanelOpen, setIsUserPanelOpen] = useState(false);
    const [approvingKYC, setApprovingKYC] = useState(false);

    // Requests State
    const [requests, setRequests] = useState<UpgradeRequest[]>([]);
    const [loadingRequests, setLoadingRequests] = useState(true);
    const [selectedRequest, setSelectedRequest] = useState<UpgradeRequest | null>(null);
    const [isRequestPanelOpen, setIsRequestPanelOpen] = useState(false);
    const [reviewing, setReviewing] = useState(false);
    const [adminNotes, setAdminNotes] = useState('');

    useEffect(() => {
        if (activeTab === 'users') loadUsers();
        else loadRequests();
    }, [activeTab]);

    const loadUsers = async () => {
        setLoadingUsers(true);
        try {
            const data = await getUsers();
            setUsers(data);
        } catch (error) {
            console.error("Failed to load users", error);
        } finally {
            setLoadingUsers(false);
        }
    };

    const loadRequests = async () => {
        setLoadingRequests(true);
        try {
            const data = await getUpgradeRequests();
            setRequests(data);
        } catch (error) {
            console.error("Failed to load requests", error);
        } finally {
            setLoadingRequests(false);
        }
    };

    // User Actions
    const handleUserClick = (user: User) => {
        setSelectedUser(user);
        setIsUserPanelOpen(true);
    };

    const handleApproveKYC = async () => {
        if (!selectedUser) return;
        setApprovingKYC(true);
        try {
            await approvePartner(selectedUser.id.toString());
            toast.success('KYC approved successfully!');
            setIsUserPanelOpen(false);
            loadUsers();
        } catch (error) {
            toast.error('Failed to approve KYC');
        } finally {
            setApprovingKYC(false);
        }
    };

    // Request Actions
    const handleRequestClick = (req: UpgradeRequest) => {
        setSelectedRequest(req);
        setAdminNotes('');
        setIsRequestPanelOpen(true);
    };

    const handleReviewRequest = async (action: 'approve' | 'reject') => {
        if (!selectedRequest) return;
        setReviewing(true);
        try {
            await reviewUpgradeRequest(selectedRequest.id, action, adminNotes);
            alert(`Request ${action}ed successfully!`);
            setIsRequestPanelOpen(false);
            loadRequests();
        } catch (error) {
            console.error(error);
            alert(`Failed to ${action} request`);
        } finally {
            setReviewing(false);
        }
    };

    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h1 className="text-2xl font-bold mb-2">User Management</h1>
                    <div className="flex gap-4 border-b border-gray-200">
                        <button
                            className={`pb-2 px-1 ${activeTab === 'users' ? 'border-b-2 border-brand-600 text-brand-600 font-bold' : 'text-gray-500'}`}
                            onClick={() => setActiveTab('users')}
                        >
                            App Users
                        </button>
                        <button
                            className={`pb-2 px-1 ${activeTab === 'requests' ? 'border-b-2 border-brand-600 text-brand-600 font-bold' : 'text-gray-500'}`}
                            onClick={() => setActiveTab('requests')}
                        >
                            Upgrade Requests
                            {requests.filter(r => r.status === 'pending').length > 0 && (
                                <span className="ml-2 bg-red-100 text-red-600 text-xs px-2 py-0.5 rounded-full">
                                    {requests.filter(r => r.status === 'pending').length}
                                </span>
                            )}
                        </button>
                    </div>
                </div>
                <button
                    className="btn bg-gray-200 text-gray-800 hover:bg-gray-300"
                    onClick={() => activeTab === 'users' ? loadUsers() : loadRequests()}
                >
                    Refresh
                </button>
            </div>

            <div className="card">
                <div className="overflow-x-auto">
                    {activeTab === 'users' ? (
                        <table className="w-full">
                            <thead>
                                <tr className="border-b border-gray-200 text-left">
                                    <th className="p-3">Name</th>
                                    <th className="p-3">Contact</th>
                                    <th className="p-3">Role</th>
                                    <th className="p-3">KYC Status</th>
                                    <th className="p-3">Joined</th>
                                </tr>
                            </thead>
                            <tbody>
                                {loadingUsers ? (
                                    <tr><td colSpan={5} className="text-center p-4">Loading...</td></tr>
                                ) : users.length === 0 ? (
                                    <tr><td colSpan={5} className="text-center p-4">No users found.</td></tr>
                                ) : (
                                    users.map(user => (
                                        <tr
                                            key={user.id}
                                            className="border-b border-gray-100 hover:bg-gray-50 cursor-pointer transition-colors"
                                            onClick={() => handleUserClick(user)}
                                        >
                                            <td className="p-3 font-medium">{user.name || '-'}</td>
                                            <td className="p-3 text-gray-600">{user.email || user.phone || '-'}</td>
                                            <td className="p-3">
                                                <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs font-bold capitalize">{user.role}</span>
                                            </td>
                                            <td className="p-3">
                                                <span className={`px-2 py-1 rounded text-xs font-bold ${user.kyc_status === 'approved' ? 'bg-green-100 text-green-700' :
                                                    user.kyc_status === 'pending' ? 'bg-yellow-100 text-yellow-700' : 'bg-gray-100 text-gray-600'
                                                    }`}>
                                                    {user.kyc_status?.toUpperCase() || 'PENDING'}
                                                </span>
                                            </td>
                                            <td className="p-3 text-gray-500">{new Date(user.createdAt).toLocaleDateString()}</td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    ) : (
                        <table className="w-full">
                            <thead>
                                <tr className="border-b border-gray-200 text-left">
                                    <th className="p-3">User</th>
                                    <th className="p-3">Request</th>
                                    <th className="p-3">Status</th>
                                    <th className="p-3">Date</th>
                                </tr>
                            </thead>
                            <tbody>
                                {loadingRequests ? (
                                    <tr><td colSpan={4} className="text-center p-4">Loading...</td></tr>
                                ) : requests.length === 0 ? (
                                    <tr><td colSpan={4} className="text-center p-4">No requests found.</td></tr>
                                ) : (
                                    requests.map(req => (
                                        <tr
                                            key={req.id}
                                            className="border-b border-gray-100 hover:bg-gray-50 cursor-pointer transition-colors"
                                            onClick={() => handleRequestClick(req)}
                                        >
                                            <td className="p-3">
                                                <p className="font-medium">{req.user?.name}</p>
                                                <p className="text-xs text-gray-500">{req.user?.email || req.user?.phone}</p>
                                            </td>
                                            <td className="p-3">
                                                <div className="flex items-center gap-2">
                                                    <span className="text-gray-500 capitalize">{req.current_role}</span>
                                                    <span>→</span>
                                                    <span className="font-bold text-brand-700 capitalize">{req.requested_role?.replace('_', ' ')}</span>
                                                </div>
                                            </td>
                                            <td className="p-3">
                                                <span className={`px-2 py-1 rounded text-xs font-bold capitalize ${req.status === 'approved' ? 'bg-green-100 text-green-700' :
                                                    req.status === 'rejected' ? 'bg-red-100 text-red-700' : 'bg-yellow-100 text-yellow-700'
                                                    }`}>
                                                    {req.status}
                                                </span>
                                            </td>
                                            <td className="p-3 text-gray-500">{new Date(req.created_at).toLocaleDateString()}</td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    )}
                </div>
            </div>

            {/* User Details SidePanel */}
            <SidePanel
                isOpen={isUserPanelOpen}
                onClose={() => setIsUserPanelOpen(false)}
                title="User Details"
            >
                {selectedUser && (
                    <div className="space-y-6">
                        {/* Reuse existing User Details Logic */}
                        <div>
                            <h3 className="text-lg font-bold mb-4 text-gray-800">Basic Information</h3>
                            <div className="space-y-3">
                                <div><label className="text-sm text-gray-500">Name</label><p>{selectedUser.name}</p></div>
                                <div><label className="text-sm text-gray-500">Email/Phone</label><p>{selectedUser.email || selectedUser.phone}</p></div>
                                <div><label className="text-sm text-gray-500">Role</label><p className="capitalize">{selectedUser.role}</p></div>
                            </div>
                        </div>
                        {selectedUser.signup_data && (
                            <div className="bg-gray-50 p-4 rounded-lg">
                                <h3 className="font-bold mb-2">Onboarding Data</h3>
                                {Object.entries(selectedUser.signup_data).map(([k, v]) => (
                                    <div key={k} className="mb-2">
                                        <span className="text-xs text-gray-500 capitalize">{k.replace(/([A-Z])/g, ' $1')}</span>
                                        <p className="text-sm">{Array.isArray(v) ? v.join(', ') : String(v)}</p>
                                    </div>
                                ))}
                            </div>
                        )}
                        {selectedUser.kyc_status !== 'approved' && (
                            <button onClick={handleApproveKYC} disabled={approvingKYC} className="btn btn-primary w-full mt-4">
                                {approvingKYC ? 'Approving...' : 'Approve KYC'}
                            </button>
                        )}
                    </div>
                )}
            </SidePanel>

            {/* Request Details SidePanel */}
            <SidePanel
                isOpen={isRequestPanelOpen}
                onClose={() => setIsRequestPanelOpen(false)}
                title="Review Upgrade Request"
            >
                {selectedRequest && (
                    <div className="space-y-6">
                        <div className="bg-blue-50 p-4 rounded-lg border border-blue-100">
                            <h3 className="font-bold text-blue-900 mb-2">Request Summary</h3>
                            <p className="text-sm text-blue-800">
                                <span className="font-semibold">{selectedRequest.user?.name}</span> wants to upgrade
                                from <span className="font-bold capitalize">{selectedRequest.current_role}</span> to
                                <span className="font-bold capitalize"> {selectedRequest.requested_role?.replace('_', ' ')}</span>
                            </p>
                            <p className="text-xs text-blue-600 mt-2">Requested on {new Date(selectedRequest.created_at).toLocaleString()}</p>
                        </div>

                        {selectedRequest.reason && (
                            <div>
                                <h4 className="text-sm font-bold text-gray-500 uppercase">Reason</h4>
                                <p className="text-gray-900 bg-gray-50 p-3 rounded mt-1">{selectedRequest.reason}</p>
                            </div>
                        )}

                        {selectedRequest.business_data && Object.keys(selectedRequest.business_data).length > 0 && (
                            <div>
                                <h4 className="text-sm font-bold text-gray-500 uppercase mb-2">Business Details Provided</h4>
                                <div className="space-y-3 bg-gray-50 p-4 rounded-lg border border-gray-200">
                                    {Object.entries(selectedRequest.business_data).map(([key, value]) => (
                                        <div key={key}>
                                            <label className="text-xs font-semibold text-gray-500 capitalize">{key.replace(/([A-Z])/g, ' $1').trim()}</label>
                                            <p className="text-sm text-gray-900 font-medium">
                                                {Array.isArray(value) ? value.join(', ') : String(value)}
                                            </p>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {selectedRequest.status === 'pending' ? (
                            <div className="border-t border-gray-100 pt-6">
                                <h4 className="text-sm font-bold text-gray-900 mb-2">Admin Review</h4>
                                <textarea
                                    className="input w-full min-h-[80px] mb-4"
                                    placeholder="Add notes (visible to user if rejected)..."
                                    value={adminNotes}
                                    onChange={e => setAdminNotes(e.target.value)}
                                />
                                <div className="grid grid-cols-2 gap-3">
                                    <button
                                        className="btn bg-red-50 text-red-600 hover:bg-red-100 border border-red-200"
                                        onClick={() => handleReviewRequest('reject')}
                                        disabled={reviewing}
                                    >
                                        Reject
                                    </button>
                                    <button
                                        className="btn bg-green-600 text-white hover:bg-green-700"
                                        onClick={() => handleReviewRequest('approve')}
                                        disabled={reviewing}
                                    >
                                        Approve Upgrade
                                    </button>
                                </div>
                            </div>
                        ) : (
                            <div className={`p-4 rounded-lg border ${selectedRequest.status === 'approved' ? 'bg-green-50 border-green-200 text-green-800' : 'bg-red-50 border-red-200 text-red-800'}`}>
                                <p className="font-bold flex items-center gap-2">
                                    Status: <span className="capitalize">{selectedRequest.status}</span>
                                </p>
                                {selectedRequest.admin_notes && (
                                    <p className="text-sm mt-1">Note: {selectedRequest.admin_notes}</p>
                                )}
                            </div>
                        )}
                    </div>
                )}
            </SidePanel>
        </div>
    );
}
