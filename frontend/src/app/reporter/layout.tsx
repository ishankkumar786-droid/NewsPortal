import { ReporterGuard } from '@/components/auth/AdminGuard';
import { ReporterSidebar } from '@/components/reporter/ReporterSidebar';
import { AdminHeader } from '@/components/admin/AdminHeader';

export default function ReporterLayout({ children }: { children: React.ReactNode }) {
  return (
    <ReporterGuard>
      <div className="flex h-screen overflow-hidden bg-background">
        <ReporterSidebar />
        <div className="flex flex-col flex-1 min-w-0 overflow-hidden">
          <AdminHeader />
          <main className="flex-1 overflow-y-auto p-4 md:p-6" role="main">
            {children}
          </main>
        </div>
      </div>
    </ReporterGuard>
  );
}
