'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Icons } from '@/components/ui/icons';
import { useAuthStore } from '@/stores/auth.store';
import { loginSchema, type LoginFormData } from '@/features/auth/auth.schema';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { toast } from 'sonner';
import { Fingerprint } from 'lucide-react';
import { loginPasskeyBegin, loginPasskeyComplete } from '@/services/passkey.api';
import { startPasskeyAuthentication, isWebAuthnSupported } from '@/lib/webauthn';
import { Role, User } from '@/types/auth';

export default function LoginPage() {
  const router = useRouter();
  const { login, isLoading, error, clearError, setUser, setToken } = useAuthStore();
  const [showPassword, setShowPassword] = useState(false);
  const [passkeyLoading, setPasskeyLoading] = useState(false);
  const [showPasskeyLogin, setShowPasskeyLogin] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  });

  // Function to get redirect path based on user role
  const getRedirectPath = (roleName?: string): string => {
    switch (roleName) {
      case 'ADMIN':
      case 'MANAGER':
        return '/admin';
      case 'RECEPTIONIST':
        return '/admin/bookings';
      case 'HOUSEKEEPING':
        return '/admin/rooms';
      case 'GUEST':
      default:
        return '/';
    }
  };

  const onSubmit = async (data: LoginFormData) => {
    try {
      clearError();
      await login(data);

      // Get updated user from store after login
      const { user } = useAuthStore.getState();
      const redirectPath = getRedirectPath(user?.role?.name);

      toast.success('Đăng nhập thành công!');
      router.push(redirectPath);
    } catch (err) {
      // Error handled by store
      console.error('Login error:', err);
      toast.error('Đăng nhập thất bại');
    }
  };

  const handlePasskeyLogin = async () => {
    if (!isWebAuthnSupported()) {
      toast.error('Trình duyệt của bạn không hỗ trợ Passkey');
      return;
    }

    const email = (document.getElementById('email') as HTMLInputElement)?.value;
    if (!email) {
      toast.error('Vui lòng nhập email để đăng nhập bằng Passkey');
      return;
    }

    setPasskeyLoading(true);
    try {
      // Step 1: Get authentication options
      const options = await loginPasskeyBegin(email);

      // Step 2: Start WebAuthn authentication
      const credential = await startPasskeyAuthentication(options);

      // Step 3: Complete authentication
      const response = await loginPasskeyComplete(email, credential);

      // Store token and user
      setToken(response.access_token);
      setUser({
        ...response.user,
        status: 'ACTIVE',
        roleId: response.user.role.id as string,
        phone: response.user.phone as string,
        avatarUrl: response.user.avatarUrl as string,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      } as User);

      // Store refresh token in localStorage (in production, use httpOnly cookie)
      localStorage.setItem('refresh_token', response.refresh_token);

      const redirectPath = getRedirectPath(response.user.role.name);
      toast.success('Đăng nhập thành công ');
      router.push(redirectPath);
    } catch (error: any) {
      console.error('Passkey login error:', error);
      toast.error(error.message || 'Không thể đăng nhập bằng Passkey');
    } finally {
      setPasskeyLoading(false);
    }
  };

  return (
    <div className="flex flex-col space-y-6">
      <div className="flex flex-col space-y-2 text-center">
        <h1 className="text-2xl font-semibold tracking-tight">
          Chào mừng trở lại
        </h1>
        <p className="text-sm text-muted-foreground">
          Nhập email và mật khẩu để đăng nhập
        </p>
      </div>

      <div className="grid gap-6">
        {error && (
          <Alert variant="destructive">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="grid gap-4">
            <div className="grid gap-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                placeholder="name@example.com"
                type="email"
                autoCapitalize="none"
                autoComplete="email"
                autoCorrect="off"
                disabled={isLoading}
                {...register('email')}
              />
              {errors.email && (
                <p className="text-sm text-red-500">{errors.email.message}</p>
              )}
            </div>

            <div className="grid gap-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="password">Mật khẩu</Label>
                <Link
                  href="/auth/forgot-password"
                  className="text-sm text-muted-foreground hover:underline"
                >
                  Quên mật khẩu?
                </Link>
              </div>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  autoCapitalize="none"
                  autoComplete="current-password"
                  disabled={isLoading}
                  {...register('password')}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  {showPassword ? (
                    <Icons.eyeOff className="h-4 w-4" />
                  ) : (
                    <Icons.eye className="h-4 w-4" />
                  )}
                </button>
              </div>
              {errors.password && (
                <p className="text-sm text-red-500">
                  {errors.password.message}
                </p>
              )}
            </div>

            <Button type="submit" className="w-full" disabled={isLoading || passkeyLoading}>
              {isLoading && (
                <Icons.spinner className="mr-2 h-4 w-4 animate-spin" />
              )}
              Đăng nhập
            </Button>

            {isWebAuthnSupported() && (
              <Button
                type="button"
                variant="outline"
                className="w-full"
                onClick={handlePasskeyLogin}
                disabled={isLoading || passkeyLoading}
              >
                {passkeyLoading ? (
                  <Icons.spinner className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <Fingerprint className="mr-2 h-4 w-4" />
                )}
                Đăng nhập bằng Passkey
              </Button>
            )}
          </div>
        </form>

        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <span className="w-full border-t" />
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-slate-50 px-2 text-muted-foreground dark:bg-slate-950">
              Hoặc tiếp tục với
            </span>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <Button
            className="cursor-pointer"
            variant="outline"
            type="button"
            disabled={isLoading}
            onClick={() => {
              window.location.href = `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}/auth/google`;
            }}
          >
            <Icons.google className="mr-2 h-4 w-4" />
            Google
          </Button>
          <Button className="cursor-pointer" variant="outline" type="button" disabled>
            <Icons.github className="mr-2 h-4 w-4" />
            GitHub
          </Button>
        </div>
      </div>

      <p className="px-8 text-center text-sm text-muted-foreground">
        <Link
          href="/auth/register"
          className="hover:text-brand underline underline-offset-4"
        >
          Chưa có tài khoản? Đăng ký ngay
        </Link>
      </p>
    </div>
  );
}
