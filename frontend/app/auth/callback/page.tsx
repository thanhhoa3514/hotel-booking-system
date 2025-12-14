'use client';

import { useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuthStore } from '@/stores/auth.store';
import { toast } from 'sonner';

function CallbackContent() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const { setToken, loadUser } = useAuthStore();

    useEffect(() => {
        const handleCallback = async () => {
            const token = searchParams.get('token');
            const error = searchParams.get('error');

            if (error) {
                toast.error('Đăng nhập thất bại', {
                    description: error,
                });
                router.push('/auth/login');
                return;
            }

            if (token) {
                try {
                    // Store the token
                    setToken(token);

                    // Load user profile
                    await loadUser();

                    // Get updated user to determine redirect
                    const { user } = useAuthStore.getState();

                    let redirectPath = '/';
                    switch (user?.role?.name) {
                        case 'ADMIN':
                        case 'MANAGER':
                            redirectPath = '/admin';
                            break;
                        case 'RECEPTIONIST':
                            redirectPath = '/admin/bookings';
                            break;
                        case 'HOUSEKEEPING':
                            redirectPath = '/admin/rooms';
                            break;
                    }

                    toast.success('Đăng nhập thành công!');
                    router.push(redirectPath);
                } catch (err) {
                    console.error('OAuth callback error:', err);
                    toast.error('Có lỗi xảy ra khi đăng nhập');
                    router.push('/auth/login');
                }
            } else {
                router.push('/auth/login');
            }
        };

        handleCallback();
    }, [searchParams, router, setToken, loadUser]);

    return (
        <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600"></div>
            <p className="text-muted-foreground">Đang xử lý đăng nhập...</p>
        </div>
    );
}

export default function AuthCallbackPage() {
    return (
        <Suspense fallback={
            <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600"></div>
                <p className="text-muted-foreground">Đang xử lý...</p>
            </div>
        }>
            <CallbackContent />
        </Suspense>
    );
}
