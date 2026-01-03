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
        <aside className="fixed top-0 left-0 h-screen w-[250px] bg-white border-r border-slate-200 flex flex-col z-50">
            <div className="h-16 flex items-center px-6 border-b border-slate-100">
                <h1 className="text-xl font-bold tracking-tight text-slate-900">
                    Admin
                </h1>
            </div>

            <nav className="flex-1 px-3 py-6 space-y-1 overflow-y-auto">
                {menuItems.map((item) => {
                    const isActive = pathname === item.href;
                    return (
                        <Link
                            key={item.href}
                            href={item.href}
                            className={`
                                flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 group
                                ${isActive
                                    ? 'bg-slate-400 text-white shadow-sm'
                                    : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900'
                                }
                            `}
                        >
                            <item.icon
                                size={18}
                                className={`transition-colors duration-200 ${isActive ? 'text-white' : 'text-slate-400 group-hover:text-slate-600'}`}
                                strokeWidth={2}
                            />
                            <span>{item.name}</span>
                        </Link>
                    );
                })}
            </nav>

            <div className="p-4 border-t border-slate-100 mt-auto">
                <button
                    onClick={postLogout}
                    className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-slate-500 hover:text-red-600 hover:bg-red-50 transition-colors group"
                >
                    <span className="flex-1 text-left">Logout</span>
                </button>
            </div>
        </aside>
    );
}
