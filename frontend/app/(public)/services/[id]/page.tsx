"use client";

import { JSX, use } from "react";
import { useQuery } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import {
    servicesApi,
    getCategoryLabel,
    formatServicePrice,
    ServiceCategory,
} from "@/services/services.api";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import {
    ArrowLeft,
    Clock,
    Users,
    Calendar,
    DollarSign,
    UtensilsCrossed,
    Sparkles,
    Car,
    Shirt,
    Briefcase,
    Bell,
    Coffee,
    MoreHorizontal,
    ImageOff,
    CheckCircle,
} from "lucide-react";

interface ServiceDetailPageProps {
    params: Promise<{ id: string }>;
}

const getCategoryIcon = (category: ServiceCategory) => {
    const icons: Record<ServiceCategory, JSX.Element> = {
        FOOD_BEVERAGE: <UtensilsCrossed className="h-5 w-5" />,
        SPA_WELLNESS: <Sparkles className="h-5 w-5" />,
        RECREATION: <Coffee className="h-5 w-5" />,
        TRANSPORTATION: <Car className="h-5 w-5" />,
        BUSINESS: <Briefcase className="h-5 w-5" />,
        LAUNDRY: <Shirt className="h-5 w-5" />,
        CONCIERGE: <Bell className="h-5 w-5" />,
        ROOM_SERVICE: <Coffee className="h-5 w-5" />,
        OTHER: <MoreHorizontal className="h-5 w-5" />,
    };
    return icons[category] || <MoreHorizontal className="h-5 w-5" />;
};

const dayLabels: Record<string, string> = {
    monday: "Thứ Hai",
    tuesday: "Thứ Ba",
    wednesday: "Thứ Tư",
    thursday: "Thứ Năm",
    friday: "Thứ Sáu",
    saturday: "Thứ Bảy",
    sunday: "Chủ Nhật",
};

export default function ServiceDetailPage({ params }: ServiceDetailPageProps) {
    const router = useRouter();
    const { id } = use(params);

    // Fetch service from API
    const { data: service, isLoading, error } = useQuery({
        queryKey: ["service", id],
        queryFn: () => servicesApi.getService(id),
    });

    // Loading state
    if (isLoading) {
        return (
            <div className="min-h-screen bg-slate-50 dark:bg-slate-950 py-8">
                <div className="container mx-auto px-4">
                    <Skeleton className="h-8 w-32 mb-6" />
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        <div className="lg:col-span-2 space-y-6">
                            <Skeleton className="h-80 w-full rounded-2xl" />
                            <Skeleton className="h-8 w-3/4" />
                            <Skeleton className="h-24 w-full" />
                        </div>
                        <div>
                            <Skeleton className="h-80 w-full rounded-2xl" />
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    // Error state
    if (error || !service) {
        return (
            <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex items-center justify-center">
                <div className="text-center">
                    <h1 className="text-2xl font-bold text-slate-700 mb-4">Không tìm thấy dịch vụ</h1>
                    <Link href="/services">
                        <Button variant="outline">
                            <ArrowLeft className="h-4 w-4 mr-2" />
                            Quay lại danh sách
                        </Button>
                    </Link>
                </div>
            </div>
        );
    }

    const handleBookService = () => {
        // Navigate to booking page with service info
        router.push(`/booking?serviceId=${service.id}`);
    };

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-950 py-8">
            <div className="container mx-auto px-4">
                {/* Back Button */}
                <Link
                    href="/services"
                    className="inline-flex items-center gap-2 text-slate-600 hover:text-orange-600 mb-6 transition-colors"
                >
                    <ArrowLeft className="h-4 w-4" />
                    Quay lại danh sách dịch vụ
                </Link>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Left Content */}
                    <div className="lg:col-span-2 space-y-8">
                        {/* Image */}
                        <div className="rounded-2xl overflow-hidden bg-white dark:bg-slate-900 shadow-lg">
                            <div className="relative h-80 md:h-[400px]">
                                {service.imageUrl ? (
                                    <Image
                                        src={service.imageUrl}
                                        alt={service.name}
                                        fill
                                        className="object-cover"
                                        priority
                                    />
                                ) : (
                                    <div className="w-full h-full bg-gradient-to-br from-orange-100 to-amber-50 flex items-center justify-center">
                                        <ImageOff className="h-20 w-20 text-orange-300" />
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Service Info */}
                        <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-lg p-6 space-y-6">
                            {/* Header */}
                            <div className="flex items-start justify-between gap-4">
                                <div>
                                    <div className="flex items-center gap-2 mb-2">
                                        <Badge className="bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400 gap-1">
                                            {getCategoryIcon(service.category)}
                                            {getCategoryLabel(service.category)}
                                        </Badge>
                                        {service.requiresBooking && (
                                            <Badge variant="outline" className="gap-1">
                                                <Calendar className="h-3 w-3" />
                                                Cần đặt trước
                                            </Badge>
                                        )}
                                    </div>
                                    <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">
                                        {service.name}
                                    </h1>
                                    <p className="text-2xl font-bold text-orange-600">
                                        {formatServicePrice(service.basePrice, service.pricingType)}
                                    </p>
                                </div>
                            </div>

                            <Separator />

                            {/* Quick Info */}
                            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                                {service.duration && (
                                    <div className="flex items-center gap-3 p-4 bg-slate-50 dark:bg-slate-800 rounded-xl">
                                        <Clock className="h-6 w-6 text-orange-500" />
                                        <div>
                                            <p className="text-sm text-slate-500">Thời gian</p>
                                            <p className="font-semibold">{service.duration} phút</p>
                                        </div>
                                    </div>
                                )}
                                {service.maxCapacity && (
                                    <div className="flex items-center gap-3 p-4 bg-slate-50 dark:bg-slate-800 rounded-xl">
                                        <Users className="h-6 w-6 text-orange-500" />
                                        <div>
                                            <p className="text-sm text-slate-500">Sức chứa</p>
                                            <p className="font-semibold">Tối đa {service.maxCapacity} người</p>
                                        </div>
                                    </div>
                                )}
                                <div className="flex items-center gap-3 p-4 bg-slate-50 dark:bg-slate-800 rounded-xl">
                                    <DollarSign className="h-6 w-6 text-orange-500" />
                                    <div>
                                        <p className="text-sm text-slate-500">Loại giá</p>
                                        <p className="font-semibold">
                                            {service.pricingType === "FIXED" && "Cố định"}
                                            {service.pricingType === "PER_HOUR" && "Theo giờ"}
                                            {service.pricingType === "PER_PERSON" && "Theo người"}
                                            {service.pricingType === "PER_ITEM" && "Theo món"}
                                        </p>
                                    </div>
                                </div>
                            </div>

                            {/* Description */}
                            {service.description && (
                                <>
                                    <Separator />
                                    <div>
                                        <h2 className="text-xl font-semibold mb-3">Mô tả</h2>
                                        <p className="text-slate-600 dark:text-slate-400 leading-relaxed whitespace-pre-line">
                                            {service.description}
                                        </p>
                                    </div>
                                </>
                            )}

                            {/* Operating Hours */}
                            {service.operatingHours && Object.keys(service.operatingHours).length > 0 && (
                                <>
                                    <Separator />
                                    <div>
                                        <h2 className="text-xl font-semibold mb-4">Giờ hoạt động</h2>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                            {Object.entries(service.operatingHours).map(([day, hours]) => (
                                                <div
                                                    key={day}
                                                    className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-800 rounded-xl"
                                                >
                                                    <span className="font-medium">{dayLabels[day] || day}</span>
                                                    {hours.isClosed ? (
                                                        <span className="text-red-500">Đóng cửa</span>
                                                    ) : (
                                                        <span className="text-slate-600 dark:text-slate-400">
                                                            {hours.open} - {hours.close}
                                                        </span>
                                                    )}
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </>
                            )}
                        </div>
                    </div>

                    {/* Right Sidebar - Booking Widget */}
                    <div className="lg:col-span-1">
                        <Card className="sticky top-24 shadow-lg border-0 rounded-2xl">
                            <CardHeader>
                                <CardTitle className="flex items-center justify-between">
                                    <span className="text-2xl font-bold">
                                        {formatServicePrice(service.basePrice, service.pricingType)}
                                    </span>
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                {/* Service Highlights */}
                                <div className="space-y-3">
                                    <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400">
                                        <CheckCircle className="h-4 w-4 text-green-500" />
                                        <span>Dịch vụ chất lượng cao</span>
                                    </div>
                                    {service.duration && (
                                        <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400">
                                            <Clock className="h-4 w-4 text-orange-500" />
                                            <span>Thời gian: {service.duration} phút</span>
                                        </div>
                                    )}
                                    {service.maxCapacity && (
                                        <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400">
                                            <Users className="h-4 w-4 text-orange-500" />
                                            <span>Phục vụ tối đa {service.maxCapacity} người</span>
                                        </div>
                                    )}
                                </div>

                                <Separator />

                                {/* Book Button */}
                                {service.requiresBooking ? (
                                    <Button
                                        className="w-full h-12 text-lg bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white font-semibold shadow-lg shadow-orange-500/30 cursor-pointer"
                                        onClick={handleBookService}
                                    >
                                        Đặt dịch vụ ngay
                                    </Button>
                                ) : (
                                    <div className="text-center p-4 bg-green-50 dark:bg-green-900/20 rounded-xl">
                                        <CheckCircle className="h-8 w-8 text-green-500 mx-auto mb-2" />
                                        <p className="font-medium text-green-700 dark:text-green-400">
                                            Không cần đặt trước
                                        </p>
                                        <p className="text-sm text-green-600 dark:text-green-500">
                                            Sử dụng trực tiếp tại khách sạn
                                        </p>
                                    </div>
                                )}

                                <p className="text-center text-xs text-slate-500">
                                    Liên hệ lễ tân để biết thêm chi tiết
                                </p>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>
        </div>
    );
}
