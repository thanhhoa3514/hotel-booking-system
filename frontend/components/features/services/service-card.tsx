"use client";

import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
    Clock,
    Users,
    Utensils,
    Dumbbell,
    Car,
    Briefcase,
    Sparkles,
    Shirt,
    Coffee,
    HelpCircle,
} from "lucide-react";
import {
    Service,
    ServiceCategory,
    formatServicePrice,
    getCategoryLabel,
} from "@/services/services.api";

interface ServiceCardProps {
    service: Service;
    onOrder?: (service: Service) => void;
    disabled?: boolean;
}

const getCategoryIcon = (category: ServiceCategory) => {
    const icons: Record<ServiceCategory, React.ReactNode> = {
        FOOD_BEVERAGE: <Utensils className="h-5 w-5" />,
        SPA_WELLNESS: <Sparkles className="h-5 w-5" />,
        RECREATION: <Dumbbell className="h-5 w-5" />,
        TRANSPORTATION: <Car className="h-5 w-5" />,
        BUSINESS: <Briefcase className="h-5 w-5" />,
        LAUNDRY: <Shirt className="h-5 w-5" />,
        CONCIERGE: <HelpCircle className="h-5 w-5" />,
        ROOM_SERVICE: <Coffee className="h-5 w-5" />,
        OTHER: <HelpCircle className="h-5 w-5" />,
    };
    return icons[category] || <HelpCircle className="h-5 w-5" />;
};

const getCategoryGradient = (category: ServiceCategory): string => {
    const gradients: Record<ServiceCategory, string> = {
        FOOD_BEVERAGE: "from-orange-500 to-red-500",
        SPA_WELLNESS: "from-pink-500 to-purple-500",
        RECREATION: "from-green-500 to-teal-500",
        TRANSPORTATION: "from-blue-500 to-indigo-500",
        BUSINESS: "from-slate-500 to-slate-700",
        LAUNDRY: "from-cyan-500 to-blue-500",
        CONCIERGE: "from-amber-500 to-orange-500",
        ROOM_SERVICE: "from-violet-500 to-purple-500",
        OTHER: "from-slate-400 to-slate-600",
    };
    return gradients[category] || "from-slate-400 to-slate-600";
};

export function ServiceCard({ service, onOrder, disabled }: ServiceCardProps) {
    return (
        <Card className="border-0 shadow-lg shadow-slate-200/50 dark:shadow-slate-900/50 bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm rounded-2xl overflow-hidden hover:shadow-xl transition-all duration-300 group">
            {/* Header with gradient */}
            <div
                className={`h-28 relative bg-gradient-to-br ${getCategoryGradient(service.category)}`}
            >
                <div className="absolute inset-0 bg-black/10" />
                <div className="absolute top-3 left-3 p-2 bg-white/20 backdrop-blur-sm rounded-xl text-white">
                    {getCategoryIcon(service.category)}
                </div>
                {service.requiresBooking && (
                    <Badge className="absolute top-3 right-3 bg-white/20 backdrop-blur-sm text-white border-0 rounded-lg">
                        Dat truoc
                    </Badge>
                )}
                <div className="absolute bottom-3 left-3 right-3">
                    <p className="text-white/80 text-xs font-medium">
                        {getCategoryLabel(service.category)}
                    </p>
                    <h3 className="text-white text-lg font-bold truncate">
                        {service.name}
                    </h3>
                </div>
            </div>

            <CardContent className="p-4">
                {/* Description */}
                {service.description && (
                    <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
                        {service.description}
                    </p>
                )}

                {/* Info badges */}
                <div className="flex flex-wrap gap-2 mb-3">
                    {service.duration && (
                        <div className="flex items-center gap-1 text-xs text-muted-foreground bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded-lg">
                            <Clock className="h-3 w-3" />
                            <span>{service.duration} phut</span>
                        </div>
                    )}
                    {service.maxCapacity && (
                        <div className="flex items-center gap-1 text-xs text-muted-foreground bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded-lg">
                            <Users className="h-3 w-3" />
                            <span>Toi da {service.maxCapacity}</span>
                        </div>
                    )}
                </div>

                {/* Price */}
                <div className="flex items-baseline gap-1">
                    <span className="text-xl font-bold text-slate-900 dark:text-white">
                        {formatServicePrice(service.basePrice, service.pricingType)}
                    </span>
                </div>
            </CardContent>

            <CardFooter className="p-4 pt-0">
                <Button
                    className="w-full rounded-xl bg-gradient-to-r from-blue-500 to-indigo-500 text-white shadow-lg shadow-blue-500/30 hover:shadow-xl hover:shadow-blue-500/40 transition-all"
                    onClick={() => onOrder?.(service)}
                    disabled={disabled || !service.isActive}
                >
                    {!service.isActive ? "Khong kha dung" : "Dat dich vu"}
                </Button>
            </CardFooter>
        </Card>
    );
}

