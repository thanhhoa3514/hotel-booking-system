import { Wifi, Tv, Wind, Coffee, Bath } from "lucide-react";
import { RoomStatus } from "@/types/room";

// Re-export types for convenience
export type { Room, RoomType, RoomStatus } from "@/types/room";

export const getStatusConfig = (status: RoomStatus) => {
    switch (status) {
        case "AVAILABLE":
            return { label: "Trống", className: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400" };
        case "OCCUPIED":
            return { label: "Đang sử dụng", className: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400" };
        case "CLEANING":
            return { label: "Đang dọn", className: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400" };
        case "MAINTENANCE":
            return { label: "Bảo trì", className: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400" };
        case "OUT_OF_ORDER":
            return { label: "Hỏng", className: "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-400" };
        default:
            return { label: status, className: "bg-slate-100 text-slate-700" };
    }
};

export const getAmenityIcon = (amenity: string) => {
    const amenityLower = amenity.toLowerCase();
    if (amenityLower.includes("wifi")) return <Wifi className="h-4 w-4" />;
    if (amenityLower.includes("tv") || amenityLower.includes("television")) return <Tv className="h-4 w-4" />;
    if (amenityLower.includes("ac") || amenityLower.includes("air")) return <Wind className="h-4 w-4" />;
    if (amenityLower.includes("minibar") || amenityLower.includes("coffee")) return <Coffee className="h-4 w-4" />;
    if (amenityLower.includes("bath") || amenityLower.includes("tub")) return <Bath className="h-4 w-4" />;
    return null;
};

export const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("vi-VN", {
        style: "currency",
        currency: "VND",
    }).format(amount);
};

export const statusOptions: { value: RoomStatus; label: string }[] = [
    { value: "AVAILABLE", label: "Trống" },
    { value: "OCCUPIED", label: "Đang sử dụng" },
    { value: "CLEANING", label: "Đang dọn" },
    { value: "MAINTENANCE", label: "Bảo trì" },
    { value: "OUT_OF_ORDER", label: "Hỏng" },
];
