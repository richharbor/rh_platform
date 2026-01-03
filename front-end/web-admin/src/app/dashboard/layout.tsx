import Sidebar from '@/components/Sidebar';
import { ScrollArea } from '@/components/ui/scroll-area';

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
                <ScrollArea className='flex-1 min-h-0'>
                <div className="page-content">
                    {children}
                </div>
                </ScrollArea>
            </main>
        </div>
    );
}
