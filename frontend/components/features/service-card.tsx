"use client";

import Image from "next/image";
import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
    Service,
    ServiceCategory,
    getCategoryLabel,
    formatServicePrice,
} from "@/services/services.api";
import {
    Clock,
    Users,
    UtensilsCrossed,
    Sparkles,
    Car,
    Shirt,
    Briefcase,
    Bell,
    Coffee,
    MoreHorizontal,
} from "lucide-react";
import { JSX } from "react";

interface ServiceCardProps {
    service: Service;
}

const getCategoryIcon = (category: ServiceCategory) => {
    const icons: Record<ServiceCategory, JSX.Element> = {
        FOOD_BEVERAGE: <UtensilsCrossed className="h-4 w-4" />,
        SPA_WELLNESS: <Sparkles className="h-4 w-4" />,
        RECREATION: <Coffee className="h-4 w-4" />,
        TRANSPORTATION: <Car className="h-4 w-4" />,
        BUSINESS: <Briefcase className="h-4 w-4" />,
        LAUNDRY: <Shirt className="h-4 w-4" />,
        CONCIERGE: <Bell className="h-4 w-4" />,
        ROOM_SERVICE: <Coffee className="h-4 w-4" />,
        OTHER: <MoreHorizontal className="h-4 w-4" />,
    };
    return icons[category] || <MoreHorizontal className="h-4 w-4" />;
};

const getCategoryColor = (category: ServiceCategory): string => {
    const colors: Record<ServiceCategory, string> = {
        FOOD_BEVERAGE: "bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400",
        SPA_WELLNESS: "bg-pink-100 text-pink-700 dark:bg-pink-900/30 dark:text-pink-400",
        RECREATION: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400",
        TRANSPORTATION: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
        BUSINESS: "bg-slate-100 text-slate-700 dark:bg-slate-800/50 dark:text-slate-400",
        LAUNDRY: "bg-cyan-100 text-cyan-700 dark:bg-cyan-900/30 dark:text-cyan-400",
        CONCIERGE: "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400",
        ROOM_SERVICE: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400",
        OTHER: "bg-gray-100 text-gray-700 dark:bg-gray-800/50 dark:text-gray-400",
    };
    return colors[category] || colors.OTHER;
};

export function ServiceCard({ service }: ServiceCardProps) {
    return (
        <Card className="group overflow-hidden border-0 shadow-lg hover:shadow-xl transition-all duration-300 rounded-2xl bg-white dark:bg-slate-900">
            {/* Image */}
            <div className="relative h-48 overflow-hidden">
                {service.imageUrl ? (
                    <Image
                        src={service.imageUrl}
                        alt={service.name}
                        fill
                        className="object-cover transition-transform duration-500 group-hover:scale-110"
                    />
                ) : (
                    <div className="w-full h-full bg-gradient-to-br from-orange-100 to-amber-50 dark:from-orange-900/20 dark:to-amber-900/20 flex items-center justify-center">
                        <div className="p-4 rounded-full bg-white/50 dark:bg-slate-800/50">
                            {getCategoryIcon(service.category)}
                        </div>
                    </div>
                )}
                {/* Category Badge */}
                <div className="absolute top-3 left-3">
                    <Badge className={`${getCategoryColor(service.category)} border-0 gap-1`}>
                        {getCategoryIcon(service.category)}
                        {getCategoryLabel(service.category)}
                    </Badge>
                </div>
                {/* Price Badge */}
                <div className="absolute bottom-3 right-3">
                    <Badge className="bg-white/95 dark:bg-slate-900/95 text-orange-600 font-bold text-sm px-3 py-1.5 shadow-lg backdrop-blur-sm border-0">
                        {formatServicePrice(service.basePrice, service.pricingType)}
                    </Badge>
                </div>
            </div>

            <CardContent className="p-5">
                {/* Title */}
                <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2 group-hover:text-orange-600 transition-colors line-clamp-1">
                    {service.name}
                </h3>

                {/* Description */}
                {service.description && (
                    <p className="text-sm text-slate-500 dark:text-slate-400 line-clamp-2 mb-4">
                        {service.description}
                    </p>
                )}

                {/* Quick Info */}
                <div className="flex items-center gap-4 text-xs text-slate-500 dark:text-slate-400 mb-4">
                    {service.duration && (
                        <div className="flex items-center gap-1">
                            <Clock className="h-3.5 w-3.5" />
                            <span>{service.duration} phút</span>
                        </div>
                    )}
                    {service.maxCapacity && (
                        <div className="flex items-center gap-1">
                            <Users className="h-3.5 w-3.5" />
                            <span>Tối đa {service.maxCapacity} người</span>
                        </div>
                    )}
                    {service.requiresBooking && (
                        <Badge variant="outline" className="text-xs py-0 h-5">
                            Cần đặt trước
                        </Badge>
                    )}
                </div>

                {/* Action Button */}
                <Link href={`/services/${service.id}`} className="block">
                    <Button className="w-full bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white font-medium shadow-md shadow-orange-500/20 cursor-pointer">
                        Xem chi tiết
                    </Button>
                </Link>
            </CardContent>
        </Card>
    );
}
