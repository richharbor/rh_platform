"use client";
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, Briefcase, Users, User, Settings, Wallet, Trophy, MessageSquare, ShieldCheck, Bell } from "lucide-react";
import { postLogout } from '@/services/Auth/authServices';

export default function Sidebar() {
    const pathname = usePathname();

    const menuItems = [
        { name: 'Dashboard', icon: LayoutDashboard, href: '/dashboard' },
        { name: 'Leads', icon: Briefcase, href: '/dashboard/leads' },
        { name: 'Users', icon: Users, href: '/dashboard/users' },
        { name: "Team", icon: ShieldCheck, href: "/dashboard/team" },
        { name: "Notifications", icon: Bell, href: "/dashboard/notifications" },
        { name: "Settings", icon: Settings, href: "/dashboard/settings" },
        { name: "Payouts", icon: Wallet, href: "/dashboard/payouts" },
        { name: "Contests", icon: Trophy, href: "/dashboard/contests" },
        { name: "Reports", icon: MessageSquare, href: "/dashboard/support" }, // Renamed from Support
    ];

    return (
        <aside className="sidebar">
            <div className="sidebar-header">
                Admin
            </div>
            <nav className="mt-4">
                {menuItems.map((item) => (
                    <Link
                        key={item.href}
                        href={item.href}
                        className={`nav-link flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${pathname === item.href ? 'bg-blue-50 text-blue-600' : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'}`}
                    >
                        <item.icon size={20} />
                        <span className="font-medium">{item.name}</span>
                    </Link>
                ))}
                <button
                    onClick={postLogout}
                    className="nav-link w-full text-left mt-8 text-red-400 hover:text-red-300"
                >
                    Logout
                </button>
            </nav>
        </aside>
    );
}
