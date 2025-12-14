"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { Textarea } from "@/components/ui/textarea";
import {
    Check,
    CreditCard,
    User,
    Building,
    ChevronLeft,
    ChevronRight,
    Calendar,
    Users,
    ArrowLeft,
    Loader2,
} from "lucide-react";
import { format, differenceInDays } from "date-fns";
import { vi } from "date-fns/locale";
import Image from "next/image";
import Link from "next/link";
import { toast } from "sonner";
import { roomsApi } from "@/services/rooms.api";
import { bookingsApi } from "@/services/bookings.api";
import { stripeApi } from "@/services/stripe.api";
import { useAuthStore } from "@/stores/auth.store";

const STEPS = ["Xác nhận", "Thông tin", "Thanh toán"];

const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("vi-VN", {
        style: "currency",
        currency: "VND",
    }).format(amount);
};

function BookingContent() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const { user, isAuthenticated } = useAuthStore();

    // Get params from URL
    const roomTypeId = searchParams.get("roomTypeId");
    const checkInParam = searchParams.get("checkIn");
    const checkOutParam = searchParams.get("checkOut");
    const guestsParam = searchParams.get("guests") || "2";

    const checkInDate = checkInParam ? new Date(checkInParam) : null;
    const checkOutDate = checkOutParam ? new Date(checkOutParam) : null;
    const numberOfGuests = parseInt(guestsParam);

    const [currentStep, setCurrentStep] = useState(0);
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Guest details form state
    const [guestDetails, setGuestDetails] = useState({
        fullName: user?.fullName || "",
        email: user?.email || "",
        phone: user?.phone || "",
        specialRequests: "",
    });

    // Fetch room type
    const { data: roomType, isLoading: isLoadingRoom } = useQuery({
        queryKey: ["roomType", roomTypeId],
        queryFn: () => roomsApi.getRoomType(roomTypeId!),
        enabled: !!roomTypeId,
    });

    // Update form with user data when authenticated
    useEffect(() => {
        if (user) {
            setGuestDetails(prev => ({
                ...prev,
                fullName: user.fullName || prev.fullName,
                email: user.email || prev.email,
                phone: user.phone || prev.phone,
            }));
        }
    }, [user]);

    const nights = checkInDate && checkOutDate
        ? differenceInDays(checkOutDate, checkInDate)
        : 0;

    const subtotal = roomType ? roomType.basePrice * nights : 0;
    const serviceFee = Math.round(subtotal * 0.1);
    const totalPrice = subtotal + serviceFee;

    const progress = ((currentStep + 1) / STEPS.length) * 100;

    const canProceed = () => {
        switch (currentStep) {
            case 0:
                return roomType && checkInDate && checkOutDate && nights > 0;
            case 1:
                return guestDetails.fullName && guestDetails.email && guestDetails.phone;
            default:
                return true;
        }
    };

    const handleNext = () => {
        if (currentStep < STEPS.length - 1) {
            setCurrentStep(currentStep + 1);
        }
    };

    const handleBack = () => {
        if (currentStep > 0) {
            setCurrentStep(currentStep - 1);
        }
    };

    const handleConfirmAndPay = async () => {
        if (!roomType || !checkInDate || !checkOutDate) return;

        // Check if user is logged in
        if (!isAuthenticated || !user) {
            toast.error("Vui lòng đăng nhập", {
                description: "Bạn cần đăng nhập để đặt phòng.",
            });
            router.push(`/auth/login?redirect=/booking?roomTypeId=${roomTypeId}&checkIn=${checkInParam}&checkOut=${checkOutParam}&guests=${guestsParam}`);
            return;
        }

        setIsSubmitting(true);

        try {
            // Step 1: Check availability and get available room IDs
            const availabilityData = {
                roomTypeId: roomType.id,
                checkInDate: checkInDate.toISOString(),
                checkOutDate: checkOutDate.toISOString(),
                numberOfRooms: 1,
            };

            const availability = await roomsApi.checkAvailability(availabilityData);

            if (!availability.available || availability.availableRooms.length === 0) {
                toast.error("Phòng không khả dụng", {
                    description: "Không còn phòng trống trong khoảng thời gian này. Vui lòng chọn ngày khác.",
                });
                setIsSubmitting(false);
                return;
            }

            // Get the first available room ID
            const selectedRoomId = availability.availableRooms[0].id;

            // Step 2: Create booking with PENDING status
            const bookingData = {
                userId: user.id,
                roomIds: [selectedRoomId],
                checkInDate: checkInDate.toISOString(),
                checkOutDate: checkOutDate.toISOString(),
                guestName: guestDetails.fullName,
                guestEmail: guestDetails.email,
                guestPhone: guestDetails.phone,
                numberOfGuests: numberOfGuests,
                specialRequests: guestDetails.specialRequests || undefined,
            };

            const booking = await bookingsApi.createBooking(bookingData);

            // Step 3: Create Stripe checkout session
            const stripeSession = await stripeApi.createCheckoutSession(booking.id);

            // Step 4: Redirect to Stripe
            if (stripeSession.url) {
                window.location.href = stripeSession.url;
            } else {
                throw new Error("No checkout URL returned");
            }
        } catch (error: any) {
            console.error("Booking error:", error);
            toast.error("Có lỗi xảy ra", {
                description: error.response?.data?.message || "Vui lòng thử lại sau.",
            });
            setIsSubmitting(false);
        }
    };


    // Loading state
    if (isLoadingRoom) {
        return (
            <div className="min-h-screen bg-slate-50 dark:bg-slate-950 py-8 px-4">
                <div className="container mx-auto max-w-4xl">
                    <Skeleton className="h-10 w-48 mx-auto mb-8" />
                    <div className="grid gap-8 lg:grid-cols-3">
                        <div className="lg:col-span-2">
                            <Skeleton className="h-96 w-full rounded-2xl" />
                        </div>
                        <div>
                            <Skeleton className="h-64 w-full rounded-2xl" />
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    // Missing data state
    if (!roomTypeId || !checkInDate || !checkOutDate || !roomType) {
        return (
            <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex items-center justify-center">
                <div className="text-center">
                    <h1 className="text-2xl font-bold text-slate-700 mb-4">Thông tin đặt phòng không hợp lệ</h1>
                    <p className="text-slate-500 mb-6">Vui lòng chọn phòng và ngày trước khi đặt.</p>
                    <Link href="/rooms">
                        <Button>
                            <ArrowLeft className="h-4 w-4 mr-2" />
                            Quay lại chọn phòng
                        </Button>
                    </Link>
                </div>
            </div>
        );
    }

    const primaryImage = roomType.images?.find(img => img.isPrimary) || roomType.images?.[0];

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-950 py-8 px-4">
            <div className="container mx-auto max-w-4xl">
                {/* Header */}
                <div className="text-center mb-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                    <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">
                        Hoàn tất đặt phòng
                    </h1>
                    <p className="text-slate-500 dark:text-slate-400">
                        Theo các bước dưới đây để xác nhận đặt phòng
                    </p>
                </div>

                {/* Progress */}
                <div className="mb-8 animate-in fade-in slide-in-from-bottom-4 duration-500 delay-100">
                    <Progress value={progress} className="h-2 mb-4" />
                    <div className="flex justify-between">
                        {STEPS.map((step, index) => (
                            <div
                                key={step}
                                className={`flex items-center gap-2 ${index <= currentStep
                                    ? "text-orange-600 dark:text-orange-400"
                                    : "text-slate-400"
                                    }`}
                            >
                                <div
                                    className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium transition-all ${index < currentStep
                                        ? "bg-orange-600 text-white"
                                        : index === currentStep
                                            ? "bg-orange-100 text-orange-600 dark:bg-orange-900/30"
                                            : "bg-slate-200 dark:bg-slate-700"
                                        }`}
                                >
                                    {index < currentStep ? <Check className="h-4 w-4" /> : index + 1}
                                </div>
                                <span className="hidden sm:inline text-sm font-medium">{step}</span>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Main Content */}
                <div className="grid gap-8 lg:grid-cols-3 animate-in fade-in slide-in-from-bottom-4 duration-500 delay-200">
                    {/* Form Section */}
                    <div className="lg:col-span-2">
                        <Card className="rounded-2xl shadow-lg border-0">
                            <CardContent className="p-6">
                                {/* Step 1: Xác nhận thông tin phòng */}
                                {currentStep === 0 && (
                                    <div className="space-y-6 animate-in fade-in duration-300">
                                        <h2 className="text-xl font-semibold flex items-center gap-2">
                                            <Building className="h-5 w-5 text-orange-500" />
                                            Xác nhận thông tin đặt phòng
                                        </h2>

                                        {/* Room Info */}
                                        <div className="flex gap-4 p-4 bg-slate-50 dark:bg-slate-800 rounded-xl">
                                            {primaryImage ? (
                                                <div className="relative w-32 h-24 rounded-lg overflow-hidden flex-shrink-0">
                                                    <Image
                                                        src={primaryImage.url}
                                                        alt={roomType.name}
                                                        fill
                                                        className="object-cover"
                                                    />
                                                </div>
                                            ) : (
                                                <div className="w-32 h-24 bg-orange-100 rounded-lg flex items-center justify-center flex-shrink-0">
                                                    <Building className="h-8 w-8 text-orange-300" />
                                                </div>
                                            )}
                                            <div className="flex-1">
                                                <h3 className="font-semibold text-lg">{roomType.name}</h3>
                                                <p className="text-2xl font-bold text-orange-600">
                                                    {formatCurrency(roomType.basePrice)}
                                                    <span className="text-sm font-normal text-slate-500">/đêm</span>
                                                </p>
                                            </div>
                                        </div>

                                        <Separator />

                                        {/* Booking Details */}
                                        <div className="grid grid-cols-2 gap-4">
                                            <div className="p-4 bg-slate-50 dark:bg-slate-800 rounded-xl">
                                                <div className="flex items-center gap-2 text-slate-500 mb-1">
                                                    <Calendar className="h-4 w-4" />
                                                    <span className="text-sm">Nhận phòng</span>
                                                </div>
                                                <p className="font-semibold">
                                                    {format(checkInDate, "EEEE, dd/MM/yyyy", { locale: vi })}
                                                </p>
                                            </div>
                                            <div className="p-4 bg-slate-50 dark:bg-slate-800 rounded-xl">
                                                <div className="flex items-center gap-2 text-slate-500 mb-1">
                                                    <Calendar className="h-4 w-4" />
                                                    <span className="text-sm">Trả phòng</span>
                                                </div>
                                                <p className="font-semibold">
                                                    {format(checkOutDate, "EEEE, dd/MM/yyyy", { locale: vi })}
                                                </p>
                                            </div>
                                            <div className="p-4 bg-slate-50 dark:bg-slate-800 rounded-xl">
                                                <div className="flex items-center gap-2 text-slate-500 mb-1">
                                                    <Users className="h-4 w-4" />
                                                    <span className="text-sm">Số khách</span>
                                                </div>
                                                <p className="font-semibold">{numberOfGuests} khách</p>
                                            </div>
                                            <div className="p-4 bg-slate-50 dark:bg-slate-800 rounded-xl">
                                                <div className="flex items-center gap-2 text-slate-500 mb-1">
                                                    <Calendar className="h-4 w-4" />
                                                    <span className="text-sm">Số đêm</span>
                                                </div>
                                                <p className="font-semibold">{nights} đêm</p>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {/* Step 2: Thông tin khách hàng */}
                                {currentStep === 1 && (
                                    <div className="space-y-6 animate-in fade-in duration-300">
                                        <h2 className="text-xl font-semibold flex items-center gap-2">
                                            <User className="h-5 w-5 text-orange-500" />
                                            Thông tin khách hàng
                                        </h2>
                                        <div className="grid gap-4 sm:grid-cols-2">
                                            <div className="space-y-2">
                                                <Label htmlFor="fullName">Họ và tên *</Label>
                                                <Input
                                                    id="fullName"
                                                    value={guestDetails.fullName}
                                                    onChange={(e) => setGuestDetails({ ...guestDetails, fullName: e.target.value })}
                                                    placeholder="Nguyễn Văn A"
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <Label htmlFor="email">Email *</Label>
                                                <Input
                                                    id="email"
                                                    type="email"
                                                    value={guestDetails.email}
                                                    onChange={(e) => setGuestDetails({ ...guestDetails, email: e.target.value })}
                                                    placeholder="email@example.com"
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <Label htmlFor="phone">Số điện thoại *</Label>
                                                <Input
                                                    id="phone"
                                                    value={guestDetails.phone}
                                                    onChange={(e) => setGuestDetails({ ...guestDetails, phone: e.target.value })}
                                                    placeholder="0901 234 567"
                                                />
                                            </div>
                                            <div className="space-y-2 sm:col-span-2">
                                                <Label htmlFor="requests">Yêu cầu đặc biệt (không bắt buộc)</Label>
                                                <Textarea
                                                    id="requests"
                                                    value={guestDetails.specialRequests}
                                                    onChange={(e) => setGuestDetails({ ...guestDetails, specialRequests: e.target.value })}
                                                    placeholder="Ví dụ: Cần phòng tầng cao, giường phụ..."
                                                    rows={3}
                                                />
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {/* Step 3: Thanh toán */}
                                {currentStep === 2 && (
                                    <div className="space-y-6 animate-in fade-in duration-300">
                                        <h2 className="text-xl font-semibold flex items-center gap-2">
                                            <CreditCard className="h-5 w-5 text-orange-500" />
                                            Xác nhận & Thanh toán
                                        </h2>

                                        {/* Summary */}
                                        <div className="bg-slate-50 dark:bg-slate-800 rounded-xl p-4 space-y-3">
                                            <div className="flex justify-between">
                                                <span className="text-slate-600">Phòng:</span>
                                                <span className="font-medium">{roomType.name}</span>
                                            </div>
                                            <div className="flex justify-between">
                                                <span className="text-slate-600">Ngày:</span>
                                                <span className="font-medium">
                                                    {format(checkInDate, "dd/MM")} - {format(checkOutDate, "dd/MM/yyyy")}
                                                </span>
                                            </div>
                                            <div className="flex justify-between">
                                                <span className="text-slate-600">Khách:</span>
                                                <span className="font-medium">{guestDetails.fullName}</span>
                                            </div>
                                            <div className="flex justify-between">
                                                <span className="text-slate-600">Email:</span>
                                                <span className="font-medium">{guestDetails.email}</span>
                                            </div>
                                            <Separator />
                                            <div className="flex justify-between text-lg font-bold">
                                                <span>Tổng cộng:</span>
                                                <span className="text-orange-600">{formatCurrency(totalPrice)}</span>
                                            </div>
                                        </div>

                                        {/* Stripe Notice */}
                                        <div className="p-4 bg-blue-50 dark:bg-blue-950/30 rounded-xl border border-blue-200 dark:border-blue-800">
                                            <p className="text-sm text-blue-700 dark:text-blue-300">
                                                <strong>Bảo mật:</strong> Bạn sẽ được chuyển đến trang thanh toán an toàn của Stripe để hoàn tất giao dịch.
                                            </p>
                                        </div>

                                        {!isAuthenticated && (
                                            <div className="p-4 bg-amber-50 dark:bg-amber-950/30 rounded-xl border border-amber-200 dark:border-amber-800">
                                                <p className="text-sm text-amber-700 dark:text-amber-300">
                                                    <strong>Lưu ý:</strong> Đăng nhập để lưu thông tin đặt phòng vào tài khoản của bạn.{" "}
                                                    <Link href="/auth/login" className="underline font-medium">
                                                        Đăng nhập ngay
                                                    </Link>
                                                </p>
                                            </div>
                                        )}
                                    </div>
                                )}

                                {/* Navigation */}
                                <div className="flex justify-between mt-8 pt-6 border-t">
                                    <Button
                                        variant="outline"
                                        onClick={handleBack}
                                        disabled={currentStep === 0}
                                        className="cursor-pointer"
                                    >
                                        <ChevronLeft className="h-4 w-4 mr-2" />
                                        Quay lại
                                    </Button>
                                    {currentStep < STEPS.length - 1 ? (
                                        <Button
                                            onClick={handleNext}
                                            disabled={!canProceed()}
                                            className="bg-orange-600 hover:bg-orange-700 cursor-pointer"
                                        >
                                            Tiếp tục
                                            <ChevronRight className="h-4 w-4 ml-2" />
                                        </Button>
                                    ) : (
                                        <Button
                                            onClick={handleConfirmAndPay}
                                            disabled={isSubmitting}
                                            className="bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 cursor-pointer"
                                        >
                                            {isSubmitting ? (
                                                <>
                                                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                                    Đang xử lý...
                                                </>
                                            ) : (
                                                <>
                                                    <CreditCard className="h-4 w-4 mr-2" />
                                                    Thanh toán với Stripe
                                                </>
                                            )}
                                        </Button>
                                    )}
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Summary Sidebar */}
                    <div className="lg:col-span-1">
                        <Card className="sticky top-24 rounded-2xl shadow-lg border-0">
                            <CardHeader>
                                <CardTitle>Tóm tắt đặt phòng</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                {primaryImage && (
                                    <div className="relative aspect-video rounded-lg overflow-hidden">
                                        <Image
                                            src={primaryImage.url}
                                            alt={roomType.name}
                                            fill
                                            className="object-cover"
                                        />
                                    </div>
                                )}
                                <h3 className="font-semibold">{roomType.name}</h3>
                                <div className="space-y-2 text-sm">
                                    <div className="flex justify-between">
                                        <span className="text-slate-500">
                                            {formatCurrency(roomType.basePrice)} x {nights} đêm
                                        </span>
                                        <span>{formatCurrency(subtotal)}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-slate-500">Phí dịch vụ</span>
                                        <span>{formatCurrency(serviceFee)}</span>
                                    </div>
                                    <Separator />
                                    <div className="flex justify-between text-lg font-bold">
                                        <span>Tổng cộng</span>
                                        <span className="text-orange-600">{formatCurrency(totalPrice)}</span>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default function BookingPage() {
    return (
        <Suspense fallback={
            <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600"></div>
            </div>
        }>
            <BookingContent />
        </Suspense>
    );
}

