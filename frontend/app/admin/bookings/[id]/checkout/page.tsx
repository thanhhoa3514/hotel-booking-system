"use client";

import { use } from "react";
import { useQuery } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
    ArrowLeft,
    User,
    Calendar,
    BedDouble,
    HandPlatter,
    Receipt,
    Printer,
    CreditCard,
    Banknote,
} from "lucide-react";
import { bookingsApi } from "@/services/bookings.api";
import { serviceBookingsApi, ServiceBooking } from "@/services/service-bookings.api";
import { getCategoryLabel } from "@/services/services.api";

interface CheckoutPageProps {
    params: Promise<{ id: string }>;
}

const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("vi-VN", {
        style: "currency",
        currency: "VND",
    }).format(amount);
};

const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("vi-VN", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
    });
};

export default function CheckoutPage({ params }: CheckoutPageProps) {
    const router = useRouter();
    const { id } = use(params);

    // Fetch booking details
    const { data: booking, isLoading: loadingBooking } = useQuery({
        queryKey: ["booking", id],
        queryFn: () => bookingsApi.getBooking(id),
    });

    // Fetch service bookings for this room booking
    const { data: serviceBookings, isLoading: loadingServices } = useQuery({
        queryKey: ["service-bookings", id],
        queryFn: () => serviceBookingsApi.getServiceBookingsByBookingId(id),
        enabled: !!id,
    });

    const isLoading = loadingBooking || loadingServices;

    // Calculate totals
    const roomTotal = Number(booking?.subtotal) || 0;
    const serviceTotal = (serviceBookings || []).reduce(
        (sum, sb) => sum + Number(sb.totalPrice),
        0
    );
    const taxAmount = Number(booking?.taxAmount) || 0;
    const grandTotal = roomTotal + serviceTotal + taxAmount;

    // Print invoice
    const handlePrint = () => {
        window.print();
    };

    if (isLoading) {
        return (
            <div className="space-y-6">
                <Skeleton className="h-10 w-48" />
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <Skeleton className="h-96 lg:col-span-2" />
                    <Skeleton className="h-96" />
                </div>
            </div>
        );
    }

    if (!booking) {
        return (
            <div className="text-center py-12">
                <h2 className="text-2xl font-bold mb-4">Không tìm thấy đặt phòng</h2>
                <Link href="/admin/bookings">
                    <Button variant="outline">
                        <ArrowLeft className="h-4 w-4 mr-2" />
                        Quay lại danh sách
                    </Button>
                </Link>
            </div>
        );
    }

    return (
        <div className="space-y-6 print:space-y-4">
            {/* Header */}
            <div className="flex items-center justify-between print:hidden">
                <div className="flex items-center gap-4">
                    <Link href="/admin/bookings">
                        <Button variant="ghost" size="icon" className="rounded-xl">
                            <ArrowLeft className="h-5 w-5" />
                        </Button>
                    </Link>
                    <div>
                        <h1 className="text-2xl font-bold">Checkout & Hóa đơn</h1>
                        <p className="text-muted-foreground">
                            Mã đặt phòng: <strong className="text-orange-600">{booking.bookingCode}</strong>
                        </p>
                    </div>
                </div>
                <div className="flex gap-2">
                    <Button variant="outline" onClick={handlePrint} className="rounded-xl gap-2">
                        <Printer className="h-4 w-4" />
                        In hóa đơn
                    </Button>
                </div>
            </div>

            {/* Print Header - Only visible when printing */}
            <div className="hidden print:block text-center mb-6">
                <h1 className="text-2xl font-bold">STAYZY HOTEL</h1>
                <p className="text-sm">Địa chỉ: 123 Đường ABC, Quận XYZ, TP. HCM</p>
                <p className="text-sm">Hotline: 1900 xxxx</p>
                <hr className="my-4" />
                <h2 className="text-xl font-bold">HÓA ĐƠN THANH TOÁN</h2>
                <p className="text-sm">Mã: {booking.bookingCode}</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Left Column - Booking & Service Details */}
                <div className="lg:col-span-2 space-y-6">
                    {/* Guest Info */}
                    <Card className="border-0 shadow-lg rounded-2xl print:shadow-none print:border">
                        <CardHeader className="pb-2">
                            <CardTitle className="flex items-center gap-2 text-lg">
                                <User className="h-5 w-5 text-orange-500" />
                                Thông tin khách hàng
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="grid grid-cols-2 gap-4 text-sm">
                            <div>
                                <span className="text-muted-foreground">Họ tên:</span>
                                <p className="font-medium">{booking.guestName}</p>
                            </div>
                            <div>
                                <span className="text-muted-foreground">Số điện thoại:</span>
                                <p className="font-medium">{booking.guestPhone}</p>
                            </div>
                            <div>
                                <span className="text-muted-foreground">Email:</span>
                                <p className="font-medium">{booking.guestEmail}</p>
                            </div>
                            <div>
                                <span className="text-muted-foreground">CMND/CCCD:</span>
                                <p className="font-medium">{booking.guestIdNumber || "N/A"}</p>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Room Details */}
                    <Card className="border-0 shadow-lg rounded-2xl print:shadow-none print:border">
                        <CardHeader className="pb-2">
                            <CardTitle className="flex items-center gap-2 text-lg">
                                <BedDouble className="h-5 w-5 text-orange-500" />
                                Chi tiết phòng
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="grid grid-cols-2 gap-4 text-sm">
                                <div className="flex items-center gap-2">
                                    <Calendar className="h-4 w-4 text-muted-foreground" />
                                    <span className="text-muted-foreground">Nhận phòng:</span>
                                    <span className="font-medium">{formatDate(booking.checkInDate)}</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <Calendar className="h-4 w-4 text-muted-foreground" />
                                    <span className="text-muted-foreground">Trả phòng:</span>
                                    <span className="font-medium">{formatDate(booking.checkOutDate)}</span>
                                </div>
                            </div>

                            <Separator />

                            {/* Room list */}
                            <div className="space-y-2">
                                {booking.rooms?.map((br) => (
                                    <div key={br.id} className="flex justify-between items-center py-2 border-b last:border-0">
                                        <div>
                                            <p className="font-medium">Phòng {br.room?.roomNumber}</p>
                                            <p className="text-xs text-muted-foreground">
                                                {br.room?.roomType?.name} - {br.numberOfNights} đêm
                                            </p>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-sm text-muted-foreground">
                                                {formatCurrency(Number(br.pricePerNight))} x {br.numberOfNights}
                                            </p>
                                            <p className="font-semibold">{formatCurrency(Number(br.totalPrice))}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>

                    {/* Services */}
                    {serviceBookings && serviceBookings.length > 0 && (
                        <Card className="border-0 shadow-lg rounded-2xl print:shadow-none print:border">
                            <CardHeader className="pb-2">
                                <CardTitle className="flex items-center gap-2 text-lg">
                                    <HandPlatter className="h-5 w-5 text-orange-500" />
                                    Dịch vụ đã sử dụng
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-2">
                                {serviceBookings.map((sb: ServiceBooking) => (
                                    <div key={sb.id} className="flex justify-between items-center py-2 border-b last:border-0">
                                        <div>
                                            <p className="font-medium">{sb.service?.name}</p>
                                            <p className="text-xs text-muted-foreground">
                                                {getCategoryLabel(sb.service?.category)} - SL: {sb.quantity}
                                            </p>
                                        </div>
                                        <div className="text-right">
                                            <Badge variant="outline" className="text-xs mb-1">
                                                {sb.status === "COMPLETED" ? "Hoàn thành" : sb.status}
                                            </Badge>
                                            <p className="font-semibold">{formatCurrency(Number(sb.totalPrice))}</p>
                                        </div>
                                    </div>
                                ))}
                            </CardContent>
                        </Card>
                    )}
                </div>

                {/* Right Column - Invoice Summary */}
                <div>
                    <Card className="border-0 shadow-lg rounded-2xl sticky top-4 print:shadow-none print:border">
                        <CardHeader className="pb-2">
                            <CardTitle className="flex items-center gap-2 text-lg">
                                <Receipt className="h-5 w-5 text-orange-500" />
                                Tổng hóa đơn
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="space-y-2 text-sm">
                                <div className="flex justify-between">
                                    <span className="text-muted-foreground">Tiền phòng:</span>
                                    <span>{formatCurrency(roomTotal)}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-muted-foreground">Tiền dịch vụ:</span>
                                    <span>{formatCurrency(serviceTotal)}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-muted-foreground">Thuế VAT (10%):</span>
                                    <span>{formatCurrency(taxAmount)}</span>
                                </div>
                            </div>

                            <Separator />

                            <div className="flex justify-between text-lg font-bold">
                                <span>Tổng cộng:</span>
                                <span className="text-orange-600">{formatCurrency(grandTotal)}</span>
                            </div>

                            <div className="flex justify-between text-sm">
                                <span className="text-muted-foreground">Đã thanh toán:</span>
                                <span className="text-green-600">{formatCurrency(Number(booking.paidAmount))}</span>
                            </div>

                            <div className="flex justify-between font-semibold">
                                <span>Còn lại:</span>
                                <span className="text-red-600">
                                    {formatCurrency(grandTotal - Number(booking.paidAmount))}
                                </span>
                            </div>

                            <Separator />

                            {/* Payment buttons - Hidden in print */}
                            <div className="space-y-2 print:hidden">
                                <Button className="w-full rounded-xl bg-gradient-to-r from-orange-500 to-amber-500 text-white gap-2">
                                    <CreditCard className="h-4 w-4" />
                                    Thanh toán qua Stripe
                                </Button>
                                <Button variant="outline" className="w-full rounded-xl gap-2">
                                    <Banknote className="h-4 w-4" />
                                    Thanh toán tiền mặt
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>

            {/* Print footer */}
            <div className="hidden print:block text-center mt-8 text-sm">
                <p>Cảm ơn quý khách đã sử dụng dịch vụ!</p>
                <p className="text-muted-foreground">Ngày in: {new Date().toLocaleString("vi-VN")}</p>
            </div>
        </div>
    );
}
