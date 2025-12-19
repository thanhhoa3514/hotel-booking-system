"use client";

import Image from "next/image";
import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { RoomType } from "@/types/room";
import { Users, Maximize2, Bed, Wifi, Tv, Wind, Coffee } from "lucide-react";

interface RoomTypeCardProps {
    roomType: RoomType;
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
    if (lowerAmenity.includes("wifi")) return <Wifi className="h-4 w-4" />;
    if (lowerAmenity.includes("tv")) return <Tv className="h-4 w-4" />;
    if (lowerAmenity.includes("ac") || lowerAmenity.includes("điều hòa")) return <Wind className="h-4 w-4" />;
    if (lowerAmenity.includes("coffee") || lowerAmenity.includes("cà phê")) return <Coffee className="h-4 w-4" />;
    return null;
};

export function RoomTypeCard({ roomType }: RoomTypeCardProps) {
    const primaryImage = roomType.images?.find(img => img.isPrimary) || roomType.images?.[0];

    // Parse amenities if it's a JSON string
    let amenitiesArray: string[] = [];
    try {
        if (roomType.amenities) {
            amenitiesArray = typeof roomType.amenities === 'string'
                ? JSON.parse(roomType.amenities)
                : roomType.amenities;
            if (!Array.isArray(amenitiesArray)) {
                amenitiesArray = [];
            }
        }
    } catch {
        amenitiesArray = [];
    }

    const displayedAmenities = amenitiesArray.slice(0, 4);
    const guestCount = roomType.capacity || roomType.maxOccupancy || 2;

    return (
        <Card className="group overflow-hidden border-0 shadow-lg hover:shadow-xl transition-all duration-300 rounded-2xl bg-white dark:bg-slate-900">
            {/* Image */}
            <div className="relative h-56 overflow-hidden">
                {primaryImage ? (
                    <Image
                        src={primaryImage.url}
                        alt={roomType.name}
                        fill
                        className="object-cover transition-transform duration-500 group-hover:scale-110"
                    />
                ) : (
                    <div className="w-full h-full bg-gradient-to-br from-orange-100 to-amber-50 dark:from-orange-900/20 dark:to-amber-900/20 flex items-center justify-center">
                        <Bed className="h-16 w-16 text-orange-300" />
                    </div>
                )}
                {/* Price Badge */}
                <div className="absolute top-4 right-4">
                    <Badge className="bg-white/95 dark:bg-slate-900/95 text-orange-600 font-bold text-sm px-3 py-1.5 shadow-lg backdrop-blur-sm border-0">
                        {formatCurrency(roomType.basePrice)}/đêm
                    </Badge>
                </div>
            </div>

            <CardContent className="p-5">
                {/* Title */}
                <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2 group-hover:text-orange-600 transition-colors">
                    {roomType.name}
                </h3>

                {/* Description */}
                {roomType.description && (
                    <p className="text-sm text-slate-500 dark:text-slate-400 line-clamp-2 mb-4">
                        {roomType.description}
                    </p>
                )}

                {/* Quick Info */}
                <div className="flex items-center gap-4 text-sm text-slate-600 dark:text-slate-300 mb-4">
                    <div className="flex items-center gap-1.5">
                        <Users className="h-4 w-4 text-orange-500" />
                        <span>{guestCount} khách</span>
                    </div>
                    {roomType.size && (
                        <div className="flex items-center gap-1.5">
                            <Maximize2 className="h-4 w-4 text-orange-500" />
                            <span>{roomType.size} m²</span>
                        </div>
                    )}
                    <div className="flex items-center gap-1.5">
                        <Bed className="h-4 w-4 text-orange-500" />
                        <span>{getBedTypeLabel(roomType.bedType)}</span>
                    </div>
                </div>

                {/* Amenities */}
                {displayedAmenities.length > 0 && (
                    <div className="flex flex-wrap gap-2 mb-4">
                        {displayedAmenities.map((amenity, idx) => (
                            <Badge key={idx} variant="secondary" className="bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-normal text-xs">
                                {getAmenityIcon(amenity)}
                                <span className="ml-1">{amenity}</span>
                            </Badge>
                        ))}
                        {amenitiesArray.length > 4 && (
                            <Badge variant="secondary" className="bg-slate-100 dark:bg-slate-800 text-slate-500 font-normal text-xs">
                                +{amenitiesArray.length - 4}
                            </Badge>
                        )}
                    </div>
                )}

                {/* Action Button */}
                <Link href={`/rooms/${roomType.id}`} className="block">
                    <Button className="w-full bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white font-medium shadow-md shadow-orange-500/20 cursor-pointer">
                        Xem chi tiết & Đặt phòng
                    </Button>
                </Link>
            </CardContent>
        </Card>
    );
}
