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
        <Card className={`border-0 border-l-4 ${statusConfig.borderColor} shadow-lg shadow-slate-200/50 dark:shadow-slate-900/50 bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm rounded-xl overflow-hidden hover:shadow-xl transition-all duration-300 group`}>
            {/* Room Image or Pastel Placeholder */}
            <div className={`h-40 relative ${imageUrl ? 'bg-slate-100 dark:bg-slate-800' : statusConfig.softBg}`}>
                {imageUrl ? (
                    <div className="w-full h-full relative overflow-hidden">
                        <img
                            src={imageUrl}
                            alt={`Phòng ${room.roomNumber}`}
                            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-80" />
                    </div>
                ) : (
                    <div className="w-full h-full flex flex-col items-center justify-center relative overflow-hidden">
                        {/* Decorative background shapes */}
                        <div className={`absolute top-0 right-0 w-24 h-24 transform translate-x-8 -translate-y-8 rounded-full opacity-20 ${statusConfig.className.split(' ')[0]}`} />
                        <div className={`absolute bottom-0 left-0 w-16 h-16 transform -translate-x-4 translate-y-4 rounded-full opacity-20 ${statusConfig.className.split(' ')[0]}`} />

                        <div className={`p-4 rounded-full ${statusConfig.className.split(' ')[0]} bg-opacity-20 backdrop-blur-sm mb-2`}>
                            <BedDouble className={`h-8 w-8 ${statusConfig.iconColor}`} />
                        </div>
                        <p className={`text-sm font-medium ${statusConfig.textColor}`}>
                            {roomType?.name || "Standard Room"}
                        </p>
                    </div>
                )}

                {/* Overlay Text (Only visible if there is an image, otherwise text is properly shown in placeholder) */}
                {imageUrl && (
                    <div className="absolute bottom-3 left-3 z-10">
                        <p className="text-white/80 text-xs font-medium uppercase tracking-wider">{roomType?.name || "Unknown"}</p>
                        <p className="text-white text-xl font-bold">P. {room.roomNumber}</p>
                    </div>
                )}

                {/* Status Badge */}
                <Badge
                    variant="secondary"
                    className={`absolute top-3 right-3 ${statusConfig.className} border-0 font-semibold shadow-sm backdrop-blur-md`}
                >
                    {statusConfig.label}
                </Badge>
            </div>

            <CardContent className="p-4">
                {/* Info Text (If image exists, room number is on image. If no image, show room number here clearly) */}
                {!imageUrl && (
                    <div className="mb-3">
                        <p className={`text-2xl font-bold ${statusConfig.textColor}`}>Phòng {room.roomNumber}</p>
                    </div>
                )}

                {/* Amenities & Info */}
                <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                        <div className="flex items-center text-sm text-muted-foreground bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded-md">
                            <Users className="h-3.5 w-3.5 mr-1.5" />
                            <span>{roomType?.maxOccupancy || 0}</span>
                        </div>
                        <div className="flex items-center text-sm text-muted-foreground bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded-md">
                            <BedDouble className="h-3.5 w-3.5 mr-1.5" />
                            <span className="truncate max-w-[80px]" title={`Tầng ${room.floor}`}>Tầng {room.floor}</span>
                        </div>
                    </div>

                    <div className="text-right">
                        <p className="text-lg font-bold text-slate-700 dark:text-slate-200">
                            {formatCurrency(roomType?.basePrice || 0)}
                        </p>
                    </div>
                </div>

                {/* Action Row */}
                <div className="grid grid-cols-[1fr,auto] gap-2 mt-4">
                    {/* Primary Quick Action Button */}
                    <Button
                        className={`w-full shadow-sm ${room.status === 'AVAILABLE'
                                ? 'bg-green-600 hover:bg-green-700 text-white'
                                : room.status === 'OCCUPIED'
                                    ? 'bg-red-600 hover:bg-red-700 text-white'
                                    : 'bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900'
                            }`}
                        onClick={() => onView?.(room)} // Placeholder for specific actions
                    >
                        {statusConfig.actionLabel}
                    </Button>

                    {/* Secondary Actions Menu */}
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="outline" size="icon" className="aspect-square rounded-lg">
                                <MoreHorizontal className="h-4 w-4" />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="rounded-xl w-48">
                            <DropdownMenuItem
                                className="cursor-pointer py-2.5"
                                onClick={() => onView?.(room)}
                            >
                                <Eye className="h-4 w-4 mr-2.5 text-slate-500" />
                                Xem chi tiết
                            </DropdownMenuItem>
                            <DropdownMenuItem
                                className="cursor-pointer py-2.5"
                                onClick={() => onEdit?.(room)}
                            >
                                <Edit className="h-4 w-4 mr-2.5 text-slate-500" />
                                Chỉnh sửa
                            </DropdownMenuItem>
                            <DropdownMenuItem
                                className="cursor-pointer py-2.5 text-red-600 focus:text-red-700 focus:bg-red-50 dark:focus:bg-red-950/30"
                                onClick={() => onDelete?.(room)}
                            >
                                <Trash2 className="h-4 w-4 mr-2.5" />
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
