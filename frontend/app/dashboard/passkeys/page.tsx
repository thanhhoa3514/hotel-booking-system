'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { Fingerprint, Trash2, Edit2, Plus, Loader2, Smartphone, Laptop } from 'lucide-react';
import {
  getPasskeyCredentials,
  removePasskeyCredential,
  updatePasskeyCredential,
  type PasskeyCredential,
} from '@/services/passkey.api';
import PasskeyRegistrationDialog from '@/components/features/passkey/PasskeyRegistrationDialog';
import { formatDistanceToNow } from 'date-fns';
import { vi } from 'date-fns/locale';

export default function PasskeysPage() {
  const [credentials, setCredentials] = useState<PasskeyCredential[]>([]);
  const [loading, setLoading] = useState(true);
  const [showRegisterDialog, setShowRegisterDialog] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [selectedCredential, setSelectedCredential] = useState<PasskeyCredential | null>(null);
  const [newDeviceName, setNewDeviceName] = useState('');
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    loadCredentials();
  }, []);

  const loadCredentials = async () => {
    try {
      setLoading(true);
      const data = await getPasskeyCredentials();
      setCredentials(data);
    } catch (error: any) {
      console.error('Error loading passkeys:', error);
      toast.error('Không thể tải danh sách passkey');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!selectedCredential) return;

    try {
      setActionLoading(true);
      await removePasskeyCredential(selectedCredential.id);
      toast.success('Đã xóa passkey');
      setDeleteDialogOpen(false);
      setSelectedCredential(null);
      loadCredentials();
    } catch (error: any) {
      console.error('Error deleting passkey:', error);
      toast.error(error.response?.data?.message || 'Không thể xóa passkey');
    } finally {
      setActionLoading(false);
    }
  };

  const handleUpdate = async () => {
    if (!selectedCredential || !newDeviceName.trim()) return;

    try {
      setActionLoading(true);
      await updatePasskeyCredential(selectedCredential.id, newDeviceName);
      toast.success('Đã cập nhật tên thiết bị');
      setEditDialogOpen(false);
      setSelectedCredential(null);
      setNewDeviceName('');
      loadCredentials();
    } catch (error: any) {
      console.error('Error updating passkey:', error);
      toast.error('Không thể cập nhật tên thiết bị');
    } finally {
      setActionLoading(false);
    }
  };

  const openDeleteDialog = (credential: PasskeyCredential) => {
    setSelectedCredential(credential);
    setDeleteDialogOpen(true);
  };

  const openEditDialog = (credential: PasskeyCredential) => {
    setSelectedCredential(credential);
    setNewDeviceName(credential.deviceName || '');
    setEditDialogOpen(true);
  };

  const getDeviceIcon = (transports: string[]) => {
    if (transports.includes('internal') || transports.includes('hybrid')) {
      return <Smartphone className="h-5 w-5" />;
    }
    return <Laptop className="h-5 w-5" />;
  };

  return (
    <div className="container mx-auto py-10">
      <div className="max-w-4xl mx-auto space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Quản lý Passkey</h1>
          <p className="text-muted-foreground mt-2">
            Quản lý các passkey của bạn để đăng nhập nhanh và an toàn
          </p>
        </div>

        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <Fingerprint className="h-5 w-5" />
                  Passkey của bạn
                </CardTitle>
                <CardDescription className="mt-2">
                  Bạn có {credentials.length} passkey được đăng ký
                </CardDescription>
              </div>
              <Button onClick={() => setShowRegisterDialog(true)}>
                <Plus className="mr-2 h-4 w-4" />
                Thêm Passkey
              </Button>
            </div>
          </CardHeader>

          <CardContent>
            {loading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
              </div>
            ) : credentials.length === 0 ? (
              <div className="text-center py-8">
                <Fingerprint className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold">Chưa có passkey nào</h3>
                <p className="text-sm text-muted-foreground mt-2 mb-4">
                  Thêm passkey để đăng nhập nhanh hơn với sinh trắc học
                </p>
                <Button onClick={() => setShowRegisterDialog(true)}>
                  <Plus className="mr-2 h-4 w-4" />
                  Đăng ký Passkey đầu tiên
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                {credentials.map((credential) => (
                  <div
                    key={credential.id}
                    className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors"
                  >
                    <div className="flex items-center gap-4">
                      <div className="p-2 bg-primary/10 rounded-full">
                        {getDeviceIcon(credential.transports)}
                      </div>
                      <div>
                        <p className="font-medium">
                          {credential.deviceName || 'Thiết bị không xác định'}
                        </p>
                        <div className="flex items-center gap-2 mt-1">
                          <p className="text-sm text-muted-foreground">
                            Đăng ký {formatDistanceToNow(new Date(credential.createdAt), { addSuffix: true, locale: vi })}
                          </p>
                          {credential.lastUsedAt && (
                            <>
                              <span className="text-muted-foreground">•</span>
                              <p className="text-sm text-muted-foreground">
                                Dùng lần cuối {formatDistanceToNow(new Date(credential.lastUsedAt), { addSuffix: true, locale: vi })}
                              </p>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => openEditDialog(credential)}
                      >
                        <Edit2 className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => openDeleteDialog(credential)}
                      >
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Về Passkey</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h4 className="font-medium mb-2">Passkey là gì?</h4>
              <p className="text-sm text-muted-foreground">
                Passkey là phương thức xác thực hiện đại sử dụng sinh trắc học (vân tay, khuôn mặt) 
                hoặc PIN thiết bị thay vì mật khẩu truyền thống.
              </p>
            </div>
            <div>
              <h4 className="font-medium mb-2">Tại sao nên dùng Passkey?</h4>
              <ul className="list-disc list-inside text-sm text-muted-foreground space-y-1">
                <li>An toàn hơn mật khẩu - không thể bị đánh cắp hoặc lừa đảo</li>
                <li>Đăng nhập nhanh hơn - chỉ cần sinh trắc học</li>
                <li>Không cần nhớ mật khẩu phức tạp</li>
                <li>Hoạt động trên nhiều thiết bị</li>
              </ul>
            </div>
            <div>
              <h4 className="font-medium mb-2">Thiết bị hỗ trợ</h4>
              <p className="text-sm text-muted-foreground">
                Face ID, Touch ID (iOS/macOS), Windows Hello, Android biometrics, 
                và các khóa bảo mật vật lý (YubiKey, Titan Security Key).
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      <PasskeyRegistrationDialog
        open={showRegisterDialog}
        onOpenChange={setShowRegisterDialog}
        onSuccess={loadCredentials}
      />

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Xác nhận xóa passkey</AlertDialogTitle>
            <AlertDialogDescription>
              Bạn có chắc chắn muốn xóa passkey "{selectedCredential?.deviceName || 'này'}"? 
              Bạn sẽ không thể đăng nhập bằng passkey này nữa.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={actionLoading}>Hủy</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={actionLoading}
              className="bg-destructive hover:bg-destructive/90"
            >
              {actionLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Đang xóa...
                </>
              ) : (
                'Xóa'
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Đổi tên thiết bị</AlertDialogTitle>
            <AlertDialogDescription>
              Đặt tên mới cho passkey này để dễ nhận diện
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="py-4">
            <Label htmlFor="newDeviceName">Tên thiết bị</Label>
            <Input
              id="newDeviceName"
              value={newDeviceName}
              onChange={(e) => setNewDeviceName(e.target.value)}
              placeholder="Ví dụ: iPhone 13, MacBook Pro"
              className="mt-2"
            />
          </div>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={actionLoading}>Hủy</AlertDialogCancel>
            <AlertDialogAction onClick={handleUpdate} disabled={actionLoading || !newDeviceName.trim()}>
              {actionLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Đang lưu...
                </>
              ) : (
                'Lưu'
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
