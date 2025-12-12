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
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { useUpdateUserStatus } from '@/hooks/useUsers';
import { User } from '@/types/auth';
import { useEffect } from 'react';

const updateStatusSchema = z.object({
  status: z.enum(['ACTIVE', 'INACTIVE', 'BANNED']),
  reason: z.string().optional(),
});

type UpdateStatusForm = z.infer<typeof updateStatusSchema>;

interface UpdateUserStatusDialogProps {
  user: User;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function UpdateUserStatusDialog({ user, open, onOpenChange }: UpdateUserStatusDialogProps) {
  const { mutate: updateStatus, isPending } = useUpdateUserStatus();

  const form = useForm<UpdateStatusForm>({
    resolver: zodResolver(updateStatusSchema),
    defaultValues: {
      status: user.status,
      reason: '',
    },
  });

  // Reset form when user changes
  useEffect(() => {
    form.reset({
      status: user.status,
      reason: '',
    });
  }, [user, form]);

  const onSubmit = (data: UpdateStatusForm) => {
    updateStatus(
      {
        id: user.id,
        data: {
          status: data.status,
          reason: data.reason || undefined,
        },
      },
      {
        onSuccess: () => {
          onOpenChange(false);
          form.reset();
        },
      }
    );
  };

  const statusLabels = {
    ACTIVE: 'Hoạt động',
    INACTIVE: 'Không hoạt động',
    BANNED: 'Đã khóa',
  };

  const statusDescriptions = {
    ACTIVE: 'Người dùng có thể đăng nhập và sử dụng hệ thống',
    INACTIVE: 'Người dùng tạm thời không thể đăng nhập',
    BANNED: 'Người dùng bị cấm vĩnh viễn khỏi hệ thống',
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px] rounded-2xl">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold">Cập nhật trạng thái</DialogTitle>
          <DialogDescription>
            Thay đổi trạng thái tài khoản: {user.email}
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="status"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Trạng thái mới</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger className="rounded-xl">
                        <SelectValue placeholder="Chọn trạng thái" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {Object.entries(statusLabels).map(([value, label]) => (
                        <SelectItem key={value} value={value}>
                          <div className="flex flex-col items-start">
                            <span className="font-medium">{label}</span>
                            <span className="text-xs text-muted-foreground">
                              {statusDescriptions[value as keyof typeof statusDescriptions]}
                            </span>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="reason"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Lý do (tùy chọn)</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Nhập lý do thay đổi trạng thái..."
                      className="rounded-xl resize-none"
                      rows={3}
                      {...field}
                    />
                  </FormControl>
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
