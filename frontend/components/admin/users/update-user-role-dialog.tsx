'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { useUpdateUserRole } from '@/hooks/useUsers';
import { useRoles } from '@/hooks/useRoles';
import { User } from '@/types/auth';
import { useEffect } from 'react';

const updateRoleSchema = z.object({
  roleId: z.string().min(1, 'Vui lòng chọn vai trò'),
});

type UpdateRoleForm = z.infer<typeof updateRoleSchema>;

interface UpdateUserRoleDialogProps {
  user: User;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function UpdateUserRoleDialog({ user, open, onOpenChange }: UpdateUserRoleDialogProps) {
  const { data: roles } = useRoles();
  const { mutate: updateRole, isPending } = useUpdateUserRole();

  const form = useForm<UpdateRoleForm>({
    resolver: zodResolver(updateRoleSchema),
    defaultValues: {
      roleId: user.roleId,
    },
  });

  // Reset form when user changes
  useEffect(() => {
    form.reset({
      roleId: user.roleId,
    });
  }, [user, form]);

  const onSubmit = (data: UpdateRoleForm) => {
    updateRole(
      {
        id: user.id,
        data: {
          roleId: data.roleId,
        },
      },
      {
        onSuccess: () => {
          onOpenChange(false);
        },
      }
    );
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px] rounded-2xl">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold">Cập nhật vai trò</DialogTitle>
          <DialogDescription>
            Thay đổi vai trò của người dùng: {user.email}
          </DialogDescription>
        </DialogHeader>

        <div className="rounded-xl bg-slate-100 dark:bg-slate-800 p-4 space-y-2">
          <div className="flex justify-between items-center">
            <span className="text-sm text-muted-foreground">Vai trò hiện tại:</span>
            <span className="font-semibold text-slate-900 dark:text-slate-100">
              {user.role?.name}
            </span>
          </div>
          {user.role?.description && (
            <p className="text-xs text-muted-foreground">
              {user.role.description}
            </p>
          )}
        </div>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="roleId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Vai trò mới</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger className="rounded-xl">
                        <SelectValue placeholder="Chọn vai trò" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {roles?.map((role) => (
                        <SelectItem key={role.id} value={role.id}>
                          <div className="flex flex-col items-start">
                            <span className="font-medium">{role.name}</span>
                            {role.description && (
                              <span className="text-xs text-muted-foreground">
                                {role.description}
                              </span>
                            )}
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                disabled={isPending}
                className="rounded-xl"
              >
                Hủy
              </Button>
              <Button
                type="submit"
                disabled={isPending}
                className="rounded-xl bg-gradient-to-r from-blue-500 to-indigo-500"
              >
                {isPending ? 'Đang cập nhật...' : 'Cập nhật'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
