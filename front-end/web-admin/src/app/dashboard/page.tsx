"use client";
import { useEffect, useState } from 'react';
import { getDashboardStats } from '@/services/Dashboard/dashboardService';

export default function DashboardPage() {
    const [stats, setStats] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const data = await getDashboardStats();
                setStats(data);
            } catch (error) {
                console.error("Failed to load stats", error);
            } finally {
                setLoading(false);
            }
        };
        fetchStats();
    }, []);

    if (loading) return <div className="p-8">Loading dashboard...</div>;

    return (
        <div>
            <h1 className="text-2xl font-bold mb-6">Overview</h1>

            <div className="dashboard-grid">
                <div className="stat-card">
                    <div className="stat-label">Total Leads</div>
                    <div className="stat-value">{stats?.totalLeads || 0}</div>
                </div>
                <div className="stat-card">
                    <div className="stat-label">Active Leads</div>
                    <div className="stat-value text-blue-600">{stats?.activeLeads || 0}</div>
                </div>
                <div className="stat-card">
                    <div className="stat-label">Partners</div>
                    <div className="stat-value">{stats?.totalPartners || 0}</div>
                </div>
                <div className="stat-card">
                    <div className="stat-label">Conversion Rate</div>
                    <div className="stat-value text-green-600">{stats?.conversionRate || 0}%</div>
                </div>
                <div className="stat-card">
                    <div className="stat-label">Expected Payouts</div>
                    <div className="stat-value">₹{(stats?.expectedPayouts || 0).toLocaleString()}</div>
                </div>
                <div className="stat-card">
                    <div className="stat-label">Disbursed</div>
                    <div className="stat-value text-purple-600">₹{(stats?.disbursedPayouts || 0).toLocaleString()}</div>
                </div>
            </div>

            <div className="card">
                <h3 className="font-bold mb-4">Recent Activity</h3>
                <p className="text-muted">No recent activity to show.</p>
            </div>
        </div>
    );
}
