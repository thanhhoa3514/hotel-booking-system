"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { roomsApi } from "@/services/rooms.api";
import { Room, RoomStatus } from "@/types/room";
import {
    RoomStatsCards,
    RoomFilters,
    RoomGrid,
    AddRoomDialog,
    NewRoomData,
} from "./components";

const defaultNewRoom: NewRoomData = {
    roomNumber: "",
    floor: "",
    typeId: "",
    status: "AVAILABLE",
    notes: "",
};

export default function AdminRoomsPage() {
    const queryClient = useQueryClient();
    const [searchQuery, setSearchQuery] = useState("");
    const [typeFilter, setTypeFilter] = useState("all");
    const [statusFilter, setStatusFilter] = useState("all");
    const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
    const [newRoom, setNewRoom] = useState<NewRoomData>(defaultNewRoom);

    // Fetch rooms
    const {
        data: rooms = [],
        isLoading: roomsLoading,
    } = useQuery({
        queryKey: ["rooms"],
        queryFn: () => roomsApi.getRooms(),
    });

    // Fetch room types
    const { data: roomTypes = [] } = useQuery({
        queryKey: ["room-types"],
        queryFn: () => roomsApi.getRoomTypes(),
    });

    // Create room mutation
    const createMutation = useMutation({
        mutationFn: roomsApi.createRoom,
        onSuccess: () => {
            toast.success("Đã thêm phòng thành công!");
            queryClient.invalidateQueries({ queryKey: ["rooms"] });
            setIsAddDialogOpen(false);
            setNewRoom(defaultNewRoom);
        },
        onError: (error: any) => {
            toast.error("Không thể thêm phòng", {
                description: error.response?.data?.message || error.message,
            });
        },
    });

    // Delete room mutation
    const deleteMutation = useMutation({
        mutationFn: roomsApi.deleteRoom,
        onSuccess: () => {
            toast.success("Đã xóa phòng thành công!");
            queryClient.invalidateQueries({ queryKey: ["rooms"] });
        },
        onError: (error: any) => {
            toast.error("Không thể xóa phòng", {
                description: error.response?.data?.message || error.message,
            });
        },
    });

    // Filter rooms
    const filteredRooms = rooms.filter((room) => {
        const matchesSearch = room.roomNumber
            .toLowerCase()
            .includes(searchQuery.toLowerCase());
        const matchesType = typeFilter === "all" || room.typeId === typeFilter;
        const matchesStatus = statusFilter === "all" || room.status === statusFilter;
        return matchesSearch && matchesType && matchesStatus;
    });

    const handleAddRoom = () => {
        if (!newRoom.roomNumber || !newRoom.floor || !newRoom.typeId) {
            toast.error("Vui lòng điền đầy đủ thông tin bắt buộc");
            return;
        }
            const floor = Number.parseInt(newRoom.floor, 10);
    if (!Number.isFinite(floor) || floor < 0) {
        toast.error("Tầng không hợp lệ");
        return;
    }

        createMutation.mutate({
            roomNumber: newRoom.roomNumber,
            floor,
            typeId: newRoom.typeId,
            status: newRoom.status,
            notes: newRoom.notes || undefined,
        });
    };

    const handleDeleteRoom = (room: Room) => {
        if (confirm(`Bạn có chắc muốn xóa phòng ${room.roomNumber}?`)) {
            deleteMutation.mutate(room.id);
        }
    };

    return (
        <div className="space-y-6">
            {/* Page Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold bg-gradient-to-r from-slate-900 to-slate-600 dark:from-white dark:to-slate-400 bg-clip-text text-transparent">
                        Quản lý phòng
                    </h1>
                    <p className="text-muted-foreground mt-1">
                        Quản lý tất cả phòng trong khách sạn
                    </p>
                </div>

                <AddRoomDialog
                    isOpen={isAddDialogOpen}
                    newRoom={newRoom}
                    roomTypes={roomTypes}
                    isSubmitting={createMutation.isPending}
                    onOpenChange={setIsAddDialogOpen}
                    onNewRoomChange={setNewRoom}
                    onSubmit={handleAddRoom}
                />
            </div>

            {/* Stats Cards */}
            <RoomStatsCards rooms={rooms} />

            {/* Filters */}
            <RoomFilters
                searchQuery={searchQuery}
                typeFilter={typeFilter}
                statusFilter={statusFilter}
                roomTypes={roomTypes}
                onSearchChange={setSearchQuery}
                onTypeChange={setTypeFilter}
                onStatusChange={setStatusFilter}
            />

            {/* Rooms Grid */}
            <RoomGrid
                rooms={filteredRooms}
                isLoading={roomsLoading}
                onView={(room) => toast.info(`Xem chi tiết phòng ${room.roomNumber}`)}
                onEdit={(room) => toast.info(`Chỉnh sửa phòng ${room.roomNumber}`)}
                onDelete={handleDeleteRoom}
            />
        </div>
    );
}
