"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
    BedDouble,
    MoreHorizontal,
    Edit,
    Trash2,
    Eye,
    Users,
} from "lucide-react";
import { Room } from "@/types/room";
import { getStatusConfig, getAmenityIcon, formatCurrency } from "./room-utils";

interface RoomGridProps {
    rooms: Room[];
    isLoading?: boolean;
    onView?: (room: Room) => void;
    onEdit?: (room: Room) => void;
    onDelete?: (room: Room) => void;
}

interface RoomCardProps {
    room: Room;
    onView?: (room: Room) => void;
    onEdit?: (room: Room) => void;
    onDelete?: (room: Room) => void;
}

function RoomCardSkeleton() {
    return (
        <Card className="border-0 shadow-lg rounded-2xl overflow-hidden">
            <Skeleton className="h-24 w-full" />
            <CardContent className="p-4 space-y-4">
                <div className="flex justify-between">
                    <Skeleton className="h-4 w-20" />
                    <Skeleton className="h-4 w-20" />
                </div>
                <div className="flex gap-2">
                    <Skeleton className="h-8 w-8 rounded-lg" />
                    <Skeleton className="h-8 w-8 rounded-lg" />
                    <Skeleton className="h-8 w-8 rounded-lg" />
                </div>
                <div className="flex justify-between items-center">
                    <Skeleton className="h-6 w-24" />
                    <Skeleton className="h-8 w-8 rounded-lg" />
                </div>
            </CardContent>
        </Card>
    );
}

function RoomCard({ room, onView, onEdit, onDelete }: RoomCardProps) {
    const statusConfig = getStatusConfig(room.status);
    const roomType = room.roomType;

    // Determine gradient based on room type name
    const getGradient = () => {
        const typeName = roomType?.name?.toLowerCase() || "";
        if (typeName.includes("suite")) return "bg-gradient-to-br from-purple-500 to-pink-500";
        if (typeName.includes("deluxe")) return "bg-gradient-to-br from-blue-500 to-indigo-500";
        return "bg-gradient-to-br from-slate-500 to-slate-600";
    };

    return (
        <Card className="border-0 shadow-lg shadow-slate-200/50 dark:shadow-slate-900/50 bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm rounded-2xl overflow-hidden hover:shadow-xl transition-shadow">
            {/* Room Header with gradient based on type */}
            <div className={`h-24 relative ${getGradient()}`}>
                <div className="absolute bottom-4 left-4">
                    <p className="text-white/80 text-sm">{roomType?.name || "Unknown"}</p>
                    <p className="text-white text-2xl font-bold">Phòng {room.roomNumber}</p>
                </div>
                <Badge
                    className={`absolute top-3 right-3 ${statusConfig.className} border-0 rounded-lg`}
                >
                    {statusConfig.label}
                </Badge>
            </div>

            <CardContent className="p-4">
                {/* Info Row */}
                <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <BedDouble className="h-4 w-4" />
                        <span>Tầng {room.floor}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Users className="h-4 w-4" />
                        <span>{roomType?.maxOccupancy || 0} khách</span>
                    </div>
                </div>

                {/* Amenities */}
                <div className="flex items-center gap-2 mb-4">
                    {(roomType?.amenities || []).slice(0, 5).map((amenity, index) => {
                        const icon = getAmenityIcon(amenity);
                        if (!icon) return null;
                        return (
                            <div
                                key={index}
                                className="p-2 rounded-lg bg-slate-100 dark:bg-slate-800 text-muted-foreground"
                                title={amenity}
                            >
                                {icon}
                            </div>
                        );
                    })}
                </div>

                {/* Price & Actions */}
                <div className="flex items-center justify-between">
                    <div>
                        <p className="text-lg font-bold">
                            {formatCurrency(roomType?.basePrice || 0)}
                        </p>
                        <p className="text-xs text-muted-foreground">/đêm</p>
                    </div>
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="outline" size="sm" className="rounded-xl">
                                <MoreHorizontal className="h-4 w-4" />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="rounded-xl">
                            <DropdownMenuItem
                                className="cursor-pointer"
                                onClick={() => onView?.(room)}
                            >
                                <Eye className="h-4 w-4 mr-2" />
                                Xem chi tiết
                            </DropdownMenuItem>
                            <DropdownMenuItem
                                className="cursor-pointer"
                                onClick={() => onEdit?.(room)}
                            >
                                <Edit className="h-4 w-4 mr-2" />
                                Chỉnh sửa
                            </DropdownMenuItem>
                            <DropdownMenuItem
                                className="cursor-pointer text-red-600"
                                onClick={() => onDelete?.(room)}
                            >
                                <Trash2 className="h-4 w-4 mr-2" />
                                Xóa phòng
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>
            </CardContent>
        </Card>
    );
}

export function RoomGrid({ rooms, isLoading, onView, onEdit, onDelete }: RoomGridProps) {
    if (isLoading) {
        return (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {[...Array(6)].map((_, i) => (
                    <RoomCardSkeleton key={i} />
                ))}
            </div>
        );
    }

    if (rooms.length === 0) {
        return (
            <Card className="border-0 shadow-lg rounded-2xl">
                <CardContent className="p-8 text-center text-muted-foreground">
                    Không tìm thấy phòng nào
                </CardContent>
            </Card>
        );
    }

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {rooms.map((room) => (
                <RoomCard
                    key={room.id}
                    room={room}
                    onView={onView}
                    onEdit={onEdit}
                    onDelete={onDelete}
                />
            ))}
        </div>
    );
}
