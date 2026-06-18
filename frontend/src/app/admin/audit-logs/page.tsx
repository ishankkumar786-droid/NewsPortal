import type { Metadata } from 'next';
import { AdminAuditLogs } from '@/components/admin/audit-logs/AdminAuditLogs';

export const metadata: Metadata = {
  title: 'Audit Logs',
  robots: { index: false },
};

export default function AdminAuditLogsPage() {
  return <AdminAuditLogs />;
}
