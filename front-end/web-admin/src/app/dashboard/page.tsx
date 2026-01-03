"use client";
import { useEffect, useState } from 'react';
import { getDashboardStats } from '@/services/Dashboard/dashboardService';
import { motion } from "framer-motion";
import {
    Users,
    FileText,
    TrendingUp,
    Wallet,
    CheckCircle,
    Activity
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";

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

    const container = {
        hidden: { opacity: 0 },
        show: {
            opacity: 1,
            transition: {
                staggerChildren: 0.1
            }
        }
    };

    const item = {
        hidden: { y: 20, opacity: 0 },
        show: { y: 0, opacity: 1 }
    };

    if (loading) {
        return (
            <div className="flex h-[50vh] items-center justify-center">
                <div className="flex flex-col items-center gap-2">
                    <div className="h-8 w-8 animate-spin rounded-full border-4 border-slate-200 border-t-blue-600"></div>
                    <div className="text-sm text-slate-500 font-medium">Loading dashboard...</div>
                </div>
            </div>
        );
    }

    const statCards = [
        { label: "Total Leads", value: stats?.totalLeads || 0, icon: FileText, color: "text-slate-600", desc: "Total leads generated" },
        { label: "Active Leads", value: stats?.activeLeads || 0, icon: Activity, color: "text-blue-600", desc: "Currently active leads" },
        { label: "Partners", value: stats?.totalPartners || 0, icon: Users, color: "text-indigo-600", desc: "Registered partners" },
        { label: "Conversion Rate", value: `${stats?.conversionRate || 0}%`, icon: TrendingUp, color: "text-emerald-600", desc: "Lead conversion rate" },
        { label: "Expected Payouts", value: `₹${(stats?.expectedPayouts || 0).toLocaleString()}`, icon: Wallet, color: "text-orange-600", desc: "Pending payouts" },
        { label: "Disbursed", value: `₹${(stats?.disbursedPayouts || 0).toLocaleString()}`, icon: CheckCircle, color: "text-purple-600", desc: "Total amount disbursed" },
    ];

    return (
        <motion.div
            variants={container}
            initial="hidden"
            animate="show"
            className="space-y-8 max-w-7xl mx-auto"
        >
            <div className="flex items-center justify-between">
                <h1 className="text-3xl font-bold tracking-tight text-slate-900">Overview</h1>
            </div>

            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {statCards.map((stat) => (
                    <motion.div key={stat.label} variants={item}>
                        <Card className="h-full border-slate-200">
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium text-slate-600">
                                    {stat.label}
                                </CardTitle>
                                <stat.icon className={`h-4 w-4 ${stat.color}`} />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold text-slate-900 mt-2">{stat.value}</div>
                                <p className="text-xs text-slate-500 mt-1">
                                    {stat.desc}
                                </p>
                            </CardContent>
                        </Card>
                    </motion.div>
                ))}
            </div>

            <motion.div variants={item}>
                <Card className="border-slate-200">
                    <CardHeader>
                        <CardTitle>Recent Activity</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="flex flex-col items-center justify-center py-12 text-center">
                            <div className="h-12 w-12 rounded-full bg-slate-50 flex items-center justify-center mb-4">
                                <Activity className="h-6 w-6 text-slate-400" />
                            </div>
                            <h3 className="text-sm font-medium text-slate-900">No recent activity</h3>
                            <p className="text-sm text-slate-500 mt-1 max-w-sm">
                                New activities involving leads, partners, and payouts will appear here.
                            </p>
                        </div>
                    </CardContent>
                </Card>
            </motion.div>
        </motion.div>
    );
}
