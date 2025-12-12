'use client';

import { useState } from 'react';
import { useUsers } from '@/hooks/useUsers';
import { useRoles } from '@/hooks/useRoles';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { UserPlus, Search } from 'lucide-react';
import { UsersTable } from '@/components/admin/users/users-table';
import { CreateUserDialog } from '@/components/admin/users/create-user-dialog';

export default function UsersPage() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState<string>('');
  const [roleId, setRoleId] = useState<string>('');
  const [createDialogOpen, setCreateDialogOpen] = useState(false);

  const { data, isLoading } = useUsers({
    page,
    limit: 20,
    search: search || undefined,
    status: status && status !== 'all' ? (status as any) : undefined,
    roleId: roleId && roleId !== 'all' ? roleId : undefined,
  });

  const { data: roles } = useRoles();

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-slate-900 to-slate-600 dark:from-white dark:to-slate-400 bg-clip-text text-transparent">
            Quản lý người dùng
          </h1>
          <p className="text-muted-foreground mt-1">
            Quản lý tài khoản người dùng trong hệ thống
          </p>
        </div>
        <Button
          onClick={() => setCreateDialogOpen(true)}
          className="rounded-xl bg-gradient-to-r from-blue-500 to-indigo-500 text-white shadow-lg shadow-blue-500/30"
        >
          <UserPlus className="mr-2 h-4 w-4" />
          Thêm người dùng
        </Button>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Tìm kiếm theo email, tên, SĐT..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10 rounded-xl"
          />
        </div>

        <Select value={status} onValueChange={setStatus}>
          <SelectTrigger className="w-full sm:w-[180px] rounded-xl">
            <SelectValue placeholder="Trạng thái" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tất cả</SelectItem>
            <SelectItem value="ACTIVE">Hoạt động</SelectItem>
            <SelectItem value="INACTIVE">Không hoạt động</SelectItem>
            <SelectItem value="BANNED">Đã khóa</SelectItem>
          </SelectContent>
        </Select>

        <Select value={roleId} onValueChange={setRoleId}>
          <SelectTrigger className="w-full sm:w-[180px] rounded-xl">
            <SelectValue placeholder="Vai trò" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tất cả</SelectItem>
            {roles?.map((role) => (
              <SelectItem key={role.id} value={role.id}>
                {role.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Table */}
      <UsersTable
        data={data?.data || []}
        meta={data?.meta}
        isLoading={isLoading}
        onPageChange={setPage}
      />

      {/* Create Dialog */}
      <CreateUserDialog
        open={createDialogOpen}
        onOpenChange={setCreateDialogOpen}
      />
    </div>
  );
}
