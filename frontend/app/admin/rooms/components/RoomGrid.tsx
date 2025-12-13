"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Pagination } from "@/components/ui/pagination";
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
    ImageOff,
} from "lucide-react";
import { Room } from "@/types/room";
import { getStatusConfig, getAmenityIcon, formatCurrency } from "./room-utils";

interface RoomGridProps {
    rooms: Room[];
    isLoading?: boolean;
    // Pagination props
    currentPage?: number;
    pageSize?: number;
    onPageChange?: (page: number) => void;
    onPageSizeChange?: (pageSize: number) => void;
    // Action props
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
            <Skeleton className="h-40 w-full" />
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

    // Get primary image or first image from room type
    const primaryImage = roomType?.images?.find(img => img.isPrimary) || roomType?.images?.[0];
    const imageUrl = primaryImage?.url;

    return (
        <Card className="border-0 shadow-lg shadow-slate-200/50 dark:shadow-slate-900/50 bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm rounded-2xl overflow-hidden hover:shadow-xl transition-shadow">
            {/* Room Image */}
            <div className="h-40 relative bg-slate-100 dark:bg-slate-800">
                {imageUrl ? (
                    <img
                        src={imageUrl}
                        alt={`Phòng ${room.roomNumber}`}
                        className="w-full h-full object-cover"
                    />
                ) : (
                    <div className="w-full h-full flex items-center justify-center">
                        <ImageOff className="h-12 w-12 text-slate-300 dark:text-slate-600" />
                    </div>
                )}

                {/* Overlay with room info */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                <div className="absolute bottom-3 left-3">
                    <p className="text-white/80 text-sm">{roomType?.name || "Unknown"}</p>
                    <p className="text-white text-xl font-bold">Phòng {room.roomNumber}</p>
                </div>
                <Badge
                    className={`absolute top-3 right-3 ${statusConfig.className} border-0 rounded-lg`}
                >
                    {statusConfig.label}
                </Badge>
            </div>

            <CardContent className="p-4">
                {/* Info Row */}
                <div className="flex items-center justify-between mb-3">
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
                <div className="flex items-center gap-2 mb-3">
                    {(roomType?.amenities || []).slice(0, 5).map((amenity, index) => {
                        const icon = getAmenityIcon(amenity);
                        if (!icon) return null;
                        return (
                            <div
                                key={index}
                                className="p-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-muted-foreground"
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

export function RoomGrid({
    rooms,
    isLoading,
    currentPage = 1,
    pageSize = 6,
    onPageChange,
    onPageSizeChange,
    onView,
    onEdit,
    onDelete,
}: RoomGridProps) {
    // Calculate pagination
    const totalItems = rooms.length;
    const totalPages = Math.ceil(totalItems / pageSize);
    const startIndex = (currentPage - 1) * pageSize;
    const endIndex = startIndex + pageSize;
    const paginatedRooms = rooms.slice(startIndex, endIndex);

    if (isLoading) {
        return (
            <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {[...Array(pageSize)].map((_, i) => (
                        <RoomCardSkeleton key={i} />
                    ))}
                </div>
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
        <div className="space-y-4">
            {/* Room Cards Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {paginatedRooms.map((room) => (
                    <RoomCard
                        key={room.id}
                        room={room}
                        onView={onView}
                        onEdit={onEdit}
                        onDelete={onDelete}
                    />
                ))}
            </div>

            {/* Pagination */}
            {onPageChange && (
                <Pagination
                    currentPage={currentPage}
                    totalPages={totalPages}
                    totalItems={totalItems}
                    pageSize={pageSize}
                    pageSizeOptions={[6, 9, 12, 24]}
                    onPageChange={onPageChange}
                    onPageSizeChange={onPageSizeChange}
                    showPageSizeSelector={!!onPageSizeChange}
                />
            )}
        </div>
    );
}
