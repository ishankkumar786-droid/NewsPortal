import { AdminGuard } from '@/components/auth/AdminGuard';
import { AdminSidebar } from '@/components/admin/AdminSidebar';
import { AdminHeader } from '@/components/admin/AdminHeader';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <AdminGuard>
      <div className="flex h-screen overflow-hidden bg-background">
        <AdminSidebar />
        <div className="flex flex-col flex-1 min-w-0 overflow-hidden">
          <AdminHeader />
          <main
            className="flex-1 overflow-y-auto p-4 md:p-6"
            role="main"
            aria-label="Admin content"
          >
            {children}
          </main>
        </div>
      </div>
    </AdminGuard>
  );
}
