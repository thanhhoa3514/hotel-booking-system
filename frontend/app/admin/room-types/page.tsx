"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { roomsApi, CreateRoomTypeData } from "@/services/rooms.api";
import { RoomType } from "@/types/room";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
    Plus,
    Search,
    MoreHorizontal,
    Edit,
    Trash2,
    BedDouble,
    Users,
    Loader2,
    ImageIcon,
} from "lucide-react";
import { AddRoomTypeDialog } from "../rooms/components/AddRoomTypeDialog";
import { EditRoomTypeDialog } from "./components/EditRoomTypeDialog";
import Image from "next/image";

export default function RoomTypesPage() {
    const queryClient = useQueryClient();
    const [searchQuery, setSearchQuery] = useState("");
    const [deletingRoomType, setDeletingRoomType] = useState<RoomType | null>(null);
    const [editingRoomType, setEditingRoomType] = useState<RoomType | null>(null);

    // Fetch room types
    const { data: roomTypesData, isLoading } = useQuery({
        queryKey: ["room-types"],
        queryFn: () => roomsApi.getRoomTypes(),
    });
    const roomTypes = roomTypesData?.data || [];

    // Delete mutation
    const deleteMutation = useMutation({
        mutationFn: (id: string) => roomsApi.deleteRoomType(id),
        onSuccess: () => {
            toast.success("Đã xóa loại phòng thành công!");
            queryClient.invalidateQueries({ queryKey: ["room-types"] });
            setDeletingRoomType(null);
        },
        onError: (error: any) => {
            toast.error("Không thể xóa loại phòng", {
                description: error.response?.data?.message || error.message,
            });
        },
    });

    // Filter room types
    const filteredRoomTypes = roomTypes.filter((rt) =>
        rt.name.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat("vi-VN", {
            style: "currency",
            currency: "VND",
        }).format(amount);
    };

    const getBedTypeLabel = (bedType: string) => {
        const labels: Record<string, string> = {
            SINGLE: "Đơn",
            DOUBLE: "Đôi",
            QUEEN: "Queen",
            KING: "King",
            TWIN: "Twin",
        };
        return labels[bedType] || bedType;
    };

    return (
        <div className="space-y-6">
            {/* Page Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold bg-gradient-to-r from-slate-900 to-slate-600 dark:from-white dark:to-slate-400 bg-clip-text text-transparent">
                        Quản lý loại phòng
                    </h1>
                    <p className="text-muted-foreground mt-1">
                        Quản lý các loại phòng trong khách sạn
                    </p>
                </div>
                <AddRoomTypeDialog />
            </div>

            {/* Search */}
            <div className="flex gap-4">
                <div className="relative flex-1 max-w-md">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                        placeholder="Tìm kiếm loại phòng..."
                        className="pl-10 rounded-xl"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>
            </div>

            {/* Room Types Grid */}
            {isLoading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {[...Array(6)].map((_, i) => (
                        <Card key={i} className="animate-pulse">
                            <div className="h-40 bg-slate-200 dark:bg-slate-800 rounded-t-lg" />
                            <CardContent className="p-4 space-y-3">
                                <div className="h-5 bg-slate-200 dark:bg-slate-800 rounded w-2/3" />
                                <div className="h-4 bg-slate-200 dark:bg-slate-800 rounded w-1/2" />
                            </CardContent>
                        </Card>
                    ))}
                </div>
            ) : filteredRoomTypes.length === 0 ? (
                <Card className="border-0 shadow-lg rounded-2xl">
                    <CardContent className="p-8 text-center text-muted-foreground">
                        Không tìm thấy loại phòng nào
                    </CardContent>
                </Card>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {filteredRoomTypes.map((roomType) => {
                        const primaryImage = roomType.images?.find(img => img.isPrimary) || roomType.images?.[0];

                        return (
                            <Card
                                key={roomType.id}
                                className="border-0 shadow-lg shadow-slate-200/50 dark:shadow-slate-900/50 bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm rounded-xl overflow-hidden hover:shadow-xl transition-all duration-300 group"
                            >
                                {/* Image */}
                                <div className="h-40 relative bg-gradient-to-br from-orange-100 to-amber-100 dark:from-orange-950/30 dark:to-amber-950/30">
                                    {primaryImage?.url ? (
                                        <Image
                                            src={primaryImage.url}
                                            alt={roomType.name}
                                            fill
                                            className="object-cover transition-transform duration-500 group-hover:scale-105"
                                        />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center">
                                            <ImageIcon className="h-12 w-12 text-orange-300 dark:text-orange-700" />
                                        </div>
                                    )}
                                    <div className="absolute top-3 right-3">
                                        <DropdownMenu>
                                            <DropdownMenuTrigger asChild>
                                                <Button
                                                    variant="secondary"
                                                    size="icon"
                                                    className="h-8 w-8 rounded-full bg-white/80 dark:bg-black/50 backdrop-blur-sm"
                                                >
                                                    <MoreHorizontal className="h-4 w-4" />
                                                </Button>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent align="end" className="rounded-xl">
                                                <DropdownMenuItem
                                                    className="cursor-pointer"
                                                    onClick={() => setEditingRoomType(roomType)}
                                                >
                                                    <Edit className="h-4 w-4 mr-2" />
                                                    Chỉnh sửa
                                                </DropdownMenuItem>
                                                <DropdownMenuItem
                                                    className="cursor-pointer text-red-600"
                                                    onClick={() => setDeletingRoomType(roomType)}
                                                >
                                                    <Trash2 className="h-4 w-4 mr-2" />
                                                    Xóa
                                                </DropdownMenuItem>
                                            </DropdownMenuContent>
                                        </DropdownMenu>
                                    </div>
                                    <Badge className="absolute bottom-3 left-3 bg-white/90 dark:bg-black/70 text-slate-900 dark:text-white backdrop-blur-sm">
                                        {roomType.isActive ? "Đang hoạt động" : "Tạm ngưng"}
                                    </Badge>
                                </div>

                                {/* Content */}
                                <CardContent className="p-4">
                                    <div className="flex justify-between items-start mb-2">
                                        <div>
                                            <h3 className="font-semibold text-lg">{roomType.name}</h3>
                                            <p className="text-sm text-muted-foreground line-clamp-1">
                                                {roomType.description || "Không có mô tả"}
                                            </p>
                                        </div>
                                        <p className="text-lg font-bold text-orange-600">
                                            {formatCurrency(roomType.basePrice)}
                                        </p>
                                    </div>

                                    <div className="flex items-center gap-3 text-sm text-muted-foreground">
                                        <div className="flex items-center gap-1">
                                            <Users className="h-4 w-4" />
                                            <span>{roomType.capacity} khách</span>
                                        </div>
                                        <div className="flex items-center gap-1">
                                            <BedDouble className="h-4 w-4" />
                                            <span>{getBedTypeLabel(roomType.bedType)}</span>
                                        </div>
                                        {roomType.size && (
                                            <span>{roomType.size} m²</span>
                                        )}
                                    </div>
                                </CardContent>
                            </Card>
                        );
                    })}
                </div>
            )}

            {/* Delete Confirmation Dialog */}
            <Dialog open={!!deletingRoomType} onOpenChange={() => setDeletingRoomType(null)}>
                <DialogContent className="sm:max-w-md rounded-2xl">
                    <DialogHeader>
                        <DialogTitle>Xác nhận xóa</DialogTitle>
                        <DialogDescription>
                            Bạn có chắc chắn muốn xóa loại phòng "{deletingRoomType?.name}"?
                            Hành động này không thể hoàn tác.
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                        <Button
                            variant="outline"
                            onClick={() => setDeletingRoomType(null)}
                            className="rounded-xl"
                            disabled={deleteMutation.isPending}
                        >
                            Hủy
                        </Button>
                        <Button
                            variant="destructive"
                            onClick={() => deletingRoomType && deleteMutation.mutate(deletingRoomType.id)}
                            className="rounded-xl"
                            disabled={deleteMutation.isPending}
                        >
                            {deleteMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            Xóa
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Edit Dialog */}
            <EditRoomTypeDialog
                roomType={editingRoomType}
                onClose={() => setEditingRoomType(null)}
            />
        </div>
    );
}
