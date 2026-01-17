"use client";
import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { getRMs } from '@/services/Users/userService';
import SidePanel from '@/components/ui/SidePanel';
import { PrivateAxios } from '@/helpers/PrivateAxios';
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

export default function TeamPage() {
    const [team, setTeam] = useState<any[]>([]);
    const [roles, setRoles] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [isInvitePanelOpen, setIsInvitePanelOpen] = useState(false);
    const [isRolePanelOpen, setIsRolePanelOpen] = useState(false);
    const [deleting, setDeleting] = useState<number | null>(null);

    // Alert Dialog State
    const [memberToDelete, setMemberToDelete] = useState<{ id: number; name: string } | null>(null);

    const [inviteEmail, setInviteEmail] = useState('');
    const [inviteRole, setInviteRole] = useState('');
    const [inviteName, setInviteName] = useState('');
    const [inviting, setInviting] = useState(false);

    // Role Form
    const [newRoleName, setNewRoleName] = useState('');
    const [creating, setCreating] = useState(false);

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        setLoading(true);
        try {
            // Fetch Team and Roles
            const teamData = await getRMs();
            setTeam(teamData);

            // Fetch roles
            const rolesRes = await PrivateAxios.get(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5003/v1'}/admin/roles`);
            setRoles(rolesRes.data);
        } catch (error) {
            console.error("Failed to load team data", error);
        } finally {
            setLoading(false);
        }
    };

    const handleInvite = async () => {
        setInviting(true);
        try {
            await PrivateAxios.post(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5003/v1'}/admin/invite`, {
                email: inviteEmail,
                name: inviteName,
                roleId: inviteRole
            });
            toast.success('Invitation sent successfully!');
            setIsInvitePanelOpen(false);
            setInviteEmail('');
            setInviteName('');
            setInviteRole('');
            loadData(); // Reload to see new pending user
        } catch (error) {
            toast.error('Failed to send invitation');
        } finally {
            setInviting(false);
        }
    };

    const confirmDelete = (memberId: number, memberName: string, memberEmail: string) => {
        setMemberToDelete({ id: memberId, name: memberName || memberEmail });
    };

    const handleExecuteDelete = async () => {
        if (!memberToDelete) return;

        const { id: memberId } = memberToDelete;
        setDeleting(memberId);
        try {
            await PrivateAxios.delete(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5003/v1'}/admin/team/${memberId}`);
            toast.success('Team member removed successfully');
            loadData(); // Reload team list
        } catch (error: any) {
            console.error('Failed to delete team member', error);
            // @ts-ignore
            toast.error(error.response?.data?.error || 'Failed to remove team member');
        } finally {
            setDeleting(null);
            setMemberToDelete(null);
        }
    };

    const handleCreateRole = async () => {
        setCreating(true);
        try {
            await PrivateAxios.post(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5003/v1'}/admin/roles`, {
                name: newRoleName,
                permissions: {}, // Default empty perms
                description: 'Custom Role'
            });
            toast.success('Role created successfully!');
            setIsRolePanelOpen(false);
            setNewRoleName('');
            loadData();
        } catch (error) {
            toast.error('Failed to create role');
        } finally {
            setCreating(false);
        }
    };

    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold">Team Management</h1>
                <div className="space-x-2">
                    <button className="btn bg-gray-200 text-gray-800 hover:bg-gray-300" onClick={() => setIsRolePanelOpen(true)}>Manage Roles</button>
                    <button className="btn btn-primary" onClick={() => setIsInvitePanelOpen(true)}>Invite Member</button>
                </div>
            </div>

            {/* Team List */}
            <div className="card">
                <h3 className="font-bold mb-4 text-gray-700">Team Members</h3>
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead>
                            <tr className="border-b text-left">
                                <th className="p-3">Name</th>
                                <th className="p-3">Email</th>
                                <th className="p-3">Role</th>
                                <th className="p-3">Status</th>
                                <th className="p-3">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? <tr><td colSpan={5} className="p-4 text-center">Loading...</td></tr> :
                                team.length === 0 ? <tr><td colSpan={5} className="p-4 text-center text-gray-500">No team members found</td></tr> :
                                    team.map((member: any) => (
                                        <tr key={member.id} className="border-b hover:bg-gray-50 transition-colors">
                                            <td className="p-3">
                                                <div className="flex items-center gap-2">
                                                    {member.name || '-'}
                                                    {!member.is_active && (
                                                        <span className="text-xs text-yellow-600 italic">(Pending)</span>
                                                    )}
                                                </div>
                                            </td>
                                            <td className="p-3 text-gray-700">{member.email}</td>
                                            <td className="p-3">
                                                <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-xs font-bold">
                                                    {member.role ? member.role.name : 'Unknown'}
                                                </span>
                                            </td>
                                            <td className="p-3">
                                                {member.is_active ? (
                                                    <span className="px-3 py-1 rounded-full text-xs font-bold bg-green-100 text-green-700">
                                                        ACTIVE
                                                    </span>
                                                ) : (
                                                    <span className="px-3 py-1 rounded-full text-xs font-bold bg-yellow-100 text-yellow-700">
                                                        INVITED
                                                    </span>
                                                )}
                                            </td>
                                            <td className="p-3">
                                                <button
                                                    onClick={() => confirmDelete(member.id, member.name, member.email)}
                                                    disabled={deleting === member.id}
                                                    className="flex items-center gap-1 px-3 py-1 text-sm text-red-600 hover:text-red-700 hover:bg-red-50 rounded transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                                >
                                                    {deleting === member.id ? (
                                                        <>
                                                            <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                                                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                                            </svg>
                                                            Deleting...
                                                        </>
                                                    ) : (
                                                        <>
                                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                                            </svg>
                                                            Delete
                                                        </>
                                                    )}
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Invite Panel */}
            <SidePanel isOpen={isInvitePanelOpen} onClose={() => setIsInvitePanelOpen(false)} title="Invite Team Member">
                <div className="space-y-4">
                    <div>
                        <label className="label">Name (Optional)</label>
                        <input className="input" value={inviteName} onChange={e => setInviteName(e.target.value)} placeholder="John Doe" />
                    </div>
                    <div>
                        <label className="label">Email Address</label>
                        <input className="input" value={inviteEmail} onChange={e => setInviteEmail(e.target.value)} placeholder="john@example.com" type="email" />
                    </div>
                    <div>
                        <label className="label">Assign Role</label>
                        <select className="input" value={inviteRole} onChange={e => setInviteRole(e.target.value)}>
                            <option value="">Select Role</option>
                            {roles.map((r: any) => <option key={r.id} value={r.id}>{r.name}</option>)}
                        </select>
                    </div>
                    <button
                        className="btn btn-primary w-full"
                        onClick={handleInvite}
                        disabled={inviting}
                    >
                        {inviting ? 'Sending...' : 'Send Invitation'}
                    </button>
                </div>
            </SidePanel>

            {/* Role Panel */}
            <SidePanel isOpen={isRolePanelOpen} onClose={() => setIsRolePanelOpen(false)} title="Create New Role">
                <div className="space-y-4">
                    {/* List existing roles */}
                    <div className="mb-4">
                        <h4 className="font-bold text-sm mb-2">Existing Roles</h4>

                        <ul className="flex flex-col gap-2">
                            {roles.map((r: any) => (
                                <li key={r.id}>
                                    <span className="bg-gray-100 px-2 py-1 rounded text-xs inline-block">
                                        {r.name}
                                    </span>
                                </li>
                            ))}
                        </ul>
                    </div>


                    <div>
                        <label className="label">New Role Name</label>
                        <input className="input" value={newRoleName} onChange={e => setNewRoleName(e.target.value)} placeholder="e.g. Finance Manager" />
                    </div>

                    <button
                        className="btn btn-primary w-full"
                        onClick={handleCreateRole}
                        disabled={creating}
                    >
                        {creating ? 'Creating...' : 'Create Role'}
                    </button>
                </div>
            </SidePanel>

            <AlertDialog open={!!memberToDelete} onOpenChange={(open) => !open && setMemberToDelete(null)}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                        <AlertDialogDescription>
                            This action cannot be undone. This will permanently remove{" "}
                            <span className="font-bold">{memberToDelete?.name}</span> from the
                            team.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                            className="bg-red-600 hover:bg-red-700 focus:ring-red-600"
                            onClick={handleExecuteDelete}
                        >
                            Delete Member
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    );
}
