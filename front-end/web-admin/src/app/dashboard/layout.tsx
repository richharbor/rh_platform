import Sidebar from '@/components/Sidebar';

export default function DashboardLayout({
    children,
}: {
    children: React.ReactNode
}) {
    return (
        <div className="admin-container">
            <Sidebar />
            <main className="main-content">
                <header className="top-header">
                    <div className="user-profile">
                        {/* Placeholder for user info */}
                        <span className="font-bold text-sm text-gray-600">Admin User</span>
                    </div>
                </header>
                <div className="page-content">
                    {children}
                </div>
            </main>
        </div>
    );
}
