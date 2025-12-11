import { AdminSidebar } from '@/components/admin/admin-sidebar';

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // TODO: Add auth check here for admin/manager roles
  // const session = await getServerSession();
  // if (!session || !['ADMIN', 'MANAGER'].includes(session.user.role?.name)) {
  //   redirect('/auth/login');
  // }

  return (
    <div className="flex min-h-screen">
      <AdminSidebar />
      <main className="flex-1 p-8 bg-slate-50 dark:bg-slate-900">
        {children}
      </main>
    </div>
  );
}
