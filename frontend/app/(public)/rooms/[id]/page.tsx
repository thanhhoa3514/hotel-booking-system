"use client";

import { useState, use } from "react";
import { useQuery } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { roomsApi } from "@/services/rooms.api";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { Calendar } from "@/components/ui/calendar";
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import {
    ChevronLeft,
    ChevronRight,
    Users,
    Maximize2,
    Bed,
    Calendar as CalendarIcon,
    Wifi,
    Tv,
    Wind,
    Coffee,
    ArrowLeft,
    ImageOff,
} from "lucide-react";
import { format, differenceInDays } from "date-fns";
import { vi } from "date-fns/locale";
import { DateRange } from "react-day-picker";
import Link from "next/link";

interface RoomDetailPageProps {
    params: Promise<{ id: string }>;
}

const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("vi-VN", {
        style: "currency",
        currency: "VND",
    }).format(amount);
};

const getBedTypeLabel = (bedType: string) => {
    switch (bedType) {
        case "SINGLE": return "Giường đơn";
        case "DOUBLE": return "Giường đôi";
        case "QUEEN": return "Giường Queen";
        case "KING": return "Giường King";
        case "TWIN": return "2 Giường đơn";
        default: return bedType;
    }
};

const getAmenityIcon = (amenity: string) => {
    const lowerAmenity = amenity.toLowerCase();
    if (lowerAmenity.includes("wifi")) return <Wifi className="h-5 w-5" />;
    if (lowerAmenity.includes("tv")) return <Tv className="h-5 w-5" />;
    if (lowerAmenity.includes("ac") || lowerAmenity.includes("điều hòa")) return <Wind className="h-5 w-5" />;
    if (lowerAmenity.includes("coffee") || lowerAmenity.includes("cà phê")) return <Coffee className="h-5 w-5" />;
    return <div className="w-5 h-5 rounded-full bg-orange-100" />;
};

export default function RoomDetailPage({ params }: RoomDetailPageProps) {
    const router = useRouter();
    const { id } = use(params);

    const [currentImageIndex, setCurrentImageIndex] = useState(0);
    const [dateRange, setDateRange] = useState<DateRange | undefined>();
    const [guests, setGuests] = useState("2");

    // Fetch room type from API
    const { data: roomType, isLoading, error } = useQuery({
        queryKey: ["roomType", id],
        queryFn: () => roomsApi.getRoomType(id),
    });

    const images = roomType?.images || [];
    const hasImages = images.length > 0;

    // Parse amenities if it's a JSON string
    const amenitiesArray: string[] = (() => {
        if (!roomType?.amenities) return [];
        try {
            if (typeof roomType.amenities === 'string') {
                const parsed = JSON.parse(roomType.amenities);
                return Array.isArray(parsed) ? parsed : [];
            }
            return Array.isArray(roomType.amenities) ? roomType.amenities : [];
        } catch {
            return [];
        }
    })();

    const guestCount = roomType?.capacity || roomType?.maxOccupancy || 2;

    const nights = dateRange?.from && dateRange?.to
        ? differenceInDays(dateRange.to, dateRange.from)
        : 0;

    const totalPrice = roomType ? roomType.basePrice * nights : 0;
    const serviceFee = Math.round(totalPrice * 0.1);
    const grandTotal = totalPrice + serviceFee;

    const handlePrevImage = () => {
        setCurrentImageIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1));
    };

    const handleNextImage = () => {
        setCurrentImageIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1));
    };

    const handleBookNow = () => {
        if (!dateRange?.from || !dateRange?.to) return;

        const queryParams = new URLSearchParams({
            roomTypeId: id,
            checkIn: dateRange.from.toISOString(),
            checkOut: dateRange.to.toISOString(),
            guests: guests,
        });

        router.push(`/booking?${queryParams.toString()}`);
    };

    // Loading state
    if (isLoading) {
        return (
            <div className="min-h-screen bg-slate-50 dark:bg-slate-950 py-8">
                <div className="container mx-auto px-4">
                    <Skeleton className="h-8 w-32 mb-6" />
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        <div className="lg:col-span-2 space-y-6">
                            <Skeleton className="h-96 w-full rounded-2xl" />
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
    if (error || !roomType) {
        return (
            <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex items-center justify-center">
                <div className="text-center">
                    <h1 className="text-2xl font-bold text-slate-700 mb-4">Không tìm thấy phòng</h1>
                    <Link href="/rooms">
                        <Button variant="outline">
                            <ArrowLeft className="h-4 w-4 mr-2" />
                            Quay lại danh sách
                        </Button>
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-950 py-8">
            <div className="container mx-auto px-4">
                {/* Back Button */}
                <Link href="/rooms" className="inline-flex items-center gap-2 text-slate-600 hover:text-orange-600 mb-6 transition-colors">
                    <ArrowLeft className="h-4 w-4" />
                    Quay lại danh sách phòng
                </Link>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Left Content */}
                    <div className="lg:col-span-2 space-y-8">
                        {/* Image Gallery */}
                        <div className="rounded-2xl overflow-hidden bg-white dark:bg-slate-900 shadow-lg">
                            {/* Main Image */}
                            <div className="relative h-80 md:h-[450px]">
                                {hasImages ? (
                                    <>
                                        <Image
                                            src={images[currentImageIndex]?.url}
                                            alt={images[currentImageIndex]?.caption || roomType.name}
                                            fill
                                            className="object-cover"
                                            priority
                                        />
                                        {images.length > 1 && (
                                            <>
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white rounded-full shadow-lg"
                                                    onClick={handlePrevImage}
                                                >
                                                    <ChevronLeft className="h-5 w-5" />
                                                </Button>
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white rounded-full shadow-lg"
                                                    onClick={handleNextImage}
                                                >
                                                    <ChevronRight className="h-5 w-5" />
                                                </Button>
                                            </>
                                        )}
                                    </>
                                ) : (
                                    <div className="w-full h-full bg-gradient-to-br from-orange-100 to-amber-50 flex items-center justify-center">
                                        <ImageOff className="h-20 w-20 text-orange-300" />
                                    </div>
                                )}
                            </div>

                            {/* Thumbnails */}
                            {images.length > 1 && (
                                <div className="flex gap-2 p-4 overflow-x-auto">
                                    {images.map((img, idx) => (
                                        <button
                                            key={img.id}
                                            className={`flex-shrink-0 w-20 h-14 rounded-lg overflow-hidden border-2 transition-all ${idx === currentImageIndex
                                                ? "border-orange-500 ring-2 ring-orange-500/20"
                                                : "border-transparent opacity-70 hover:opacity-100"
                                                }`}
                                            onClick={() => setCurrentImageIndex(idx)}
                                        >
                                            <Image
                                                src={img.url}
                                                alt={img.caption || `Image ${idx + 1}`}
                                                width={80}
                                                height={56}
                                                className="w-full h-full object-cover"
                                            />
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Room Info */}
                        <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-lg p-6 space-y-6">
                            {/* Header */}
                            <div className="flex items-start justify-between">
                                <div>
                                    <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">
                                        {roomType.name}
                                    </h1>
                                    <p className="text-2xl font-bold text-orange-600">
                                        {formatCurrency(roomType.basePrice)}
                                        <span className="text-base font-normal text-slate-500">/đêm</span>
                                    </p>
                                </div>
                            </div>

                            <Separator />

                            {/* Quick Info */}
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                <div className="flex items-center gap-3 p-4 bg-slate-50 dark:bg-slate-800 rounded-xl">
                                    <Users className="h-6 w-6 text-orange-500" />
                                    <div>
                                        <p className="text-sm text-slate-500">Số khách</p>
                                        <p className="font-semibold">{guestCount} người</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3 p-4 bg-slate-50 dark:bg-slate-800 rounded-xl">
                                    <Maximize2 className="h-6 w-6 text-orange-500" />
                                    <div>
                                        <p className="text-sm text-slate-500">Diện tích</p>
                                        <p className="font-semibold">{roomType.size} m²</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3 p-4 bg-slate-50 dark:bg-slate-800 rounded-xl">
                                    <Bed className="h-6 w-6 text-orange-500" />
                                    <div>
                                        <p className="text-sm text-slate-500">Loại giường</p>
                                        <p className="font-semibold">{getBedTypeLabel(roomType.bedType)}</p>
                                    </div>
                                </div>
                            </div>

                            {/* Description */}
                            {roomType.description && (
                                <>
                                    <Separator />
                                    <div>
                                        <h2 className="text-xl font-semibold mb-3">Mô tả</h2>
                                        <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
                                            {roomType.description}
                                        </p>
                                    </div>
                                </>
                            )}

                            {/* Amenities */}
                            {amenitiesArray.length > 0 && (
                                <>
                                    <Separator />
                                    <div>
                                        <h2 className="text-xl font-semibold mb-4">Tiện nghi</h2>
                                        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                                            {amenitiesArray.map((amenity, idx) => (
                                                <div
                                                    key={idx}
                                                    className="flex items-center gap-3 p-3 bg-slate-50 dark:bg-slate-800 rounded-xl"
                                                >
                                                    <div className="text-orange-500">
                                                        {getAmenityIcon(amenity)}
                                                    </div>
                                                    <span className="text-slate-700 dark:text-slate-300">{amenity}</span>
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
                                    <span className="text-2xl font-bold">{formatCurrency(roomType.basePrice)}</span>
                                    <span className="text-sm font-normal text-slate-500">/đêm</span>
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                {/* Date Picker */}
                                <div className="space-y-2">
                                    <label className="text-sm font-medium">Ngày nhận/trả phòng</label>
                                    <Popover>
                                        <PopoverTrigger asChild>
                                            <Button
                                                variant="outline"
                                                className="w-full justify-start text-left font-normal h-12"
                                            >
                                                <CalendarIcon className="mr-2 h-4 w-4" />
                                                {dateRange?.from ? (
                                                    dateRange.to ? (
                                                        <>
                                                            {format(dateRange.from, "dd/MM", { locale: vi })} -{" "}
                                                            {format(dateRange.to, "dd/MM/yyyy", { locale: vi })}
                                                        </>
                                                    ) : (
                                                        format(dateRange.from, "dd/MM/yyyy", { locale: vi })
                                                    )
                                                ) : (
                                                    <span className="text-slate-500">Chọn ngày</span>
                                                )}
                                            </Button>
                                        </PopoverTrigger>
                                        <PopoverContent className="w-auto p-0" align="start">
                                            <Calendar
                                                mode="range"
                                                selected={dateRange}
                                                onSelect={setDateRange}
                                                numberOfMonths={2}
                                                disabled={(date) => date < new Date()}
                                            />
                                        </PopoverContent>
                                    </Popover>
                                </div>

                                {/* Guests */}
                                <div className="space-y-2">
                                    <label className="text-sm font-medium">Số khách</label>
                                    <Select value={guests} onValueChange={setGuests}>
                                        <SelectTrigger className="h-12">
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {Array.from({ length: guestCount }, (_, i) => i + 1).map((n) => (
                                                <SelectItem key={n} value={String(n)}>
                                                    {n} khách
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>


                                {/* Price Breakdown */}
                                {nights > 0 && (
                                    <div className="space-y-2 pt-4 border-t">
                                        <div className="flex justify-between text-sm">
                                            <span className="text-slate-600">
                                                {formatCurrency(roomType.basePrice)} x {nights} đêm
                                            </span>
                                            <span>{formatCurrency(totalPrice)}</span>
                                        </div>
                                        <div className="flex justify-between text-sm">
                                            <span className="text-slate-600">Phí dịch vụ</span>
                                            <span>{formatCurrency(serviceFee)}</span>
                                        </div>
                                        <Separator className="my-2" />
                                        <div className="flex justify-between font-bold text-lg">
                                            <span>Tổng cộng</span>
                                            <span className="text-orange-600">{formatCurrency(grandTotal)}</span>
                                        </div>
                                    </div>
                                )}

                                {/* Book Button */}
                                <Button
                                    className="w-full h-12 text-lg bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white font-semibold shadow-lg shadow-orange-500/30 cursor-pointer"
                                    disabled={!dateRange?.from || !dateRange?.to}
                                    onClick={handleBookNow}
                                >
                                    Đặt phòng ngay
                                </Button>

                                {!dateRange?.from && (
                                    <p className="text-center text-sm text-slate-500">
                                        Vui lòng chọn ngày để xem giá
                                    </p>
                                )}
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>
        </div>
    );
}
