"use client";
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { postLogout } from '@/services/Auth/authServices';

export default function Sidebar() {
    const pathname = usePathname();

    const menuItems = [
        { name: 'Dashboard', path: '/dashboard' },
        { name: 'Leads', path: '/dashboard/leads' },
        { name: 'RMs / Users', path: '/dashboard/users' },
        { name: 'Payouts', path: '/dashboard/payouts' },
        { name: 'Reports', path: '/dashboard/reports' },
    ];

    return (
        <aside className="sidebar">
            <div className="sidebar-header">
                Admin
            </div>
            <nav className="mt-4">
                {menuItems.map((item) => (
                    <Link
                        key={item.path}
                        href={item.path}
                        className={`nav-link ${pathname === item.path ? 'active' : ''}`}
                    >
                        {item.name}
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
