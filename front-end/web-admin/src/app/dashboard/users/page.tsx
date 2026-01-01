"use client";
import { useEffect, useState } from 'react';
import { getUsers, approvePartner } from '@/services/Users/userService';
import SidePanel from '@/components/ui/SidePanel';

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

export default function UsersPage() {
    const [users, setUsers] = useState<User[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedUser, setSelectedUser] = useState<User | null>(null);
    const [isPanelOpen, setIsPanelOpen] = useState(false);
    const [approving, setApproving] = useState(false);

    useEffect(() => {
        loadUsers();
    }, []);

    const loadUsers = async () => {
        try {
            const data = await getUsers();
            setUsers(data);
        } catch (error) {
            console.error("Failed to load users", error);
        } finally {
            setLoading(false);
        }
    };

    const handleRowClick = (user: User) => {
        setSelectedUser(user);
        setIsPanelOpen(true);
    };

    const handleApproveKYC = async () => {
        if (!selectedUser) return;

        setApproving(true);
        try {
            await approvePartner(selectedUser.id.toString());
            alert('KYC approved successfully!');
            setIsPanelOpen(false);
            loadUsers(); // Reload users
        } catch (error) {
            alert('Failed to approve KYC');
        } finally {
            setApproving(false);
        }
    };

    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold">App Users</h1>
                <button className="btn bg-gray-200 text-gray-800 hover:bg-gray-300" onClick={loadUsers}>Refresh</button>
            </div>

            <div className="card">
                <div className="overflow-x-auto">
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
                            {loading ? (
                                <tr><td colSpan={5} className="text-center p-4">Loading...</td></tr>
                            ) : users.length === 0 ? (
                                <tr><td colSpan={5} className="text-center p-4">No users found.</td></tr>
                            ) : (
                                users.map(user => (
                                    <tr
                                        key={user.id}
                                        className="border-b border-gray-100 hover:bg-gray-50 cursor-pointer transition-colors"
                                        onClick={() => handleRowClick(user)}
                                    >
                                        <td className="p-3 font-medium">{user.name || '-'}</td>
                                        <td className="p-3 text-gray-600">
                                            {user.email || user.phone || '-'}
                                        </td>
                                        <td className="p-3">
                                            <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs font-bold capitalize">
                                                {user.role}
                                            </span>
                                        </td>
                                        <td className="p-3">
                                            <span className={`px-2 py-1 rounded text-xs font-bold ${user.kyc_status === 'approved' ? 'bg-green-100 text-green-700' :
                                                user.kyc_status === 'pending' ? 'bg-yellow-100 text-yellow-700' :
                                                    'bg-gray-100 text-gray-600'
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
                </div>
            </div>

            {/* User Details SidePanel */}
            <SidePanel
                isOpen={isPanelOpen}
                onClose={() => setIsPanelOpen(false)}
                title="User Details"
            >
                {selectedUser && (
                    <div className="space-y-6">
                        {/* Basic Information */}
                        <div>
                            <h3 className="text-lg font-bold mb-4 text-gray-800">Basic Information</h3>
                            <div className="space-y-3">
                                <div>
                                    <label className="text-sm font-medium text-gray-500">Name</label>
                                    <p className="text-gray-900 font-medium">{selectedUser.name || 'Not provided'}</p>
                                </div>
                                <div>
                                    <label className="text-sm font-medium text-gray-500">Email</label>
                                    <p className="text-gray-900">{selectedUser.email}</p>
                                </div>
                                <div>
                                    <label className="text-sm font-medium text-gray-500">Phone</label>
                                    <p className="text-gray-900">{selectedUser.phone || 'Not provided'}</p>
                                </div>
                                <div>
                                    <label className="text-sm font-medium text-gray-500">City</label>
                                    <p className="text-gray-900">{selectedUser.city || 'Not provided'}</p>
                                </div>
                                <div>
                                    <label className="text-sm font-medium text-gray-500">Role</label>
                                    <p>
                                        <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs font-bold capitalize">
                                            {selectedUser.role}
                                        </span>
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* KYC Status */}
                        <div>
                            <h3 className="text-lg font-bold mb-4 text-gray-800">KYC Status</h3>
                            <div className="space-y-3">
                                <div>
                                    <label className="text-sm font-medium text-gray-500">Status</label>
                                    <p>
                                        <span className={`px-2 py-1 rounded text-xs font-bold ${selectedUser.kyc_status === 'approved' ? 'bg-green-100 text-green-700' :
                                            selectedUser.kyc_status === 'pending' ? 'bg-yellow-100 text-yellow-700' :
                                                'bg-gray-100 text-gray-600'
                                            }`}>
                                            {selectedUser.kyc_status?.toUpperCase() || 'PENDING'}
                                        </span>
                                    </p>
                                </div>
                                {selectedUser.kyc_status !== 'approved' && (
                                    <button
                                        onClick={handleApproveKYC}
                                        disabled={approving}
                                        className="btn btn-primary w-full"
                                    >
                                        {approving ? 'Approving...' : 'Approve KYC'}
                                    </button>
                                )}
                            </div>
                        </div>

                        {/* Account Information */}
                        <div>
                            <h3 className="text-lg font-bold mb-4 text-gray-800">Account Information</h3>
                            <div className="space-y-3">
                                <div>
                                    <label className="text-sm font-medium text-gray-500">Account Created</label>
                                    <p className="text-gray-900">{new Date(selectedUser.createdAt).toLocaleString()}</p>
                                </div>
                                <div>
                                    <label className="text-sm font-medium text-gray-500">User ID</label>
                                    <p className="text-gray-900 font-mono text-sm">{selectedUser.id}</p>
                                </div>
                            </div>
                        </div>

                        {/* Onboarding Data */}
                        {selectedUser.signup_data && (
                            <div>
                                <h3 className="text-lg font-bold mb-4 text-gray-800">Onboarding Data</h3>
                                <div className="space-y-3 bg-gray-50 p-4 rounded-lg">
                                    {Object.entries(selectedUser.signup_data).map(([key, value]) => (
                                        <div key={key}>
                                            <label className="text-sm font-medium text-gray-500 capitalize">{key.replace(/([A-Z])/g, ' $1').trim()}</label>
                                            <p className="text-gray-900">
                                                {Array.isArray(value) ? value.join(', ') : String(value)}
                                            </p>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                )}
            </SidePanel >
        </div >
    );
}
