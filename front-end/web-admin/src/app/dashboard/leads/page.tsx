"use client";
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { getLeads } from '@/services/Leads/leadService';

export default function LeadsPage() {
    const [leads, setLeads] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [filters, setFilters] = useState({ product: '', status: '' });

    useEffect(() => {
        loadLeads();
    }, [filters]);

    const loadLeads = async () => {
        setLoading(true);
        try {
            // In a real app, params would be passed here
            // const data = await getLeads(filters);
            // Mocking for now as endpoint needs update
            const data = await getLeads(); // Assuming controller returns list
            setLeads(data);
        } catch (error) {
            console.error("Failed to load leads", error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold">Lead Management</h1>
                <button className="btn btn-primary" onClick={() => loadLeads()}>Refresh</button>
            </div>

            <div className="card mb-6">
                <div className="flex gap-4">
                    <input
                        className="input"
                        placeholder="Search Client..."
                    />
                    <select
                        className="input"
                        value={filters.status}
                        onChange={e => setFilters({ ...filters, status: e.target.value })}
                    >
                        <option value="">All Statuses</option>
                        <option value="New">New</option>
                        <option value="In Progress">In Progress</option>
                        <option value="Closed">Closed</option>
                    </select>
                </div>
            </div>

            <div className="table-container">
                <table>
                    <thead>
                        <tr>
                            <th>Lead ID</th>
                            <th>Client Name</th>
                            <th>Product</th>
                            <th>Status (Int)</th>
                            <th>Assigned RM</th>
                            <th>Created</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {loading ? (
                            <tr><td colSpan={7} className="text-center p-4">Loading...</td></tr>
                        ) : leads.length === 0 ? (
                            <tr><td colSpan={7} className="text-center p-4">No leads found.</td></tr>
                        ) : (
                            leads.map((lead) => (
                                <tr key={lead.id} className="hover:bg-gray-50">
                                    <td>{lead.id}</td>
                                    <td>{lead.name}</td>
                                    <td>{lead.product_type}</td>
                                    <td>
                                        <span className={`status-badge status-${(lead.internal_status || 'new').toLowerCase()}`}>
                                            {lead.internal_status || 'New'}
                                        </span>
                                    </td>
                                    <td>{lead.assigned_rm_id ? 'Assigned' : 'Unassigned'}</td>
                                    <td>{new Date(lead.createdAt).toLocaleDateString()}</td>
                                    <td>
                                        <Link href={`/dashboard/leads/${lead.id}`} className="text-blue-600 hover:underline">
                                            View Details
                                        </Link>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
