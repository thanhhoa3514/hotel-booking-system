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
    EditRoomDialog,
    DeleteRoomDialog,
    ViewRoomDialog,
    NewRoomData,
    EditRoomData,
} from "./components";
import { AddRoomTypeDialog } from "./components/AddRoomTypeDialog";

const defaultNewRoom: NewRoomData = {
    roomNumber: "",
    floor: "",
    typeId: "",
    status: "AVAILABLE",
    notes: "",
};

const defaultEditRoom: EditRoomData = {
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

    // Pagination state
    const [currentPage, setCurrentPage] = useState(1);
    const [pageSize, setPageSize] = useState(6);

    // Dialog states
    const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
    const [newRoom, setNewRoom] = useState<NewRoomData>(defaultNewRoom);
    const [editingRoom, setEditingRoom] = useState<Room | null>(null);
    const [editData, setEditData] = useState<EditRoomData>(defaultEditRoom);
    const [deletingRoom, setDeletingRoom] = useState<Room | null>(null);
    const [viewingRoom, setViewingRoom] = useState<Room | null>(null);

    // Fetch rooms
    const {
        data: rooms = [],
        isLoading: roomsLoading,
    } = useQuery({
        queryKey: ["rooms"],
        queryFn: () => roomsApi.getRooms(),
    });

    // Fetch room types
    const { data: roomTypesData } = useQuery({
        queryKey: ["room-types"],
        queryFn: () => roomsApi.getRoomTypes(),
    });
    const roomTypes = roomTypesData?.data || [];

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

    // Update room mutation
    const updateMutation = useMutation({
        mutationFn: ({ id, data }: { id: string; data: Parameters<typeof roomsApi.updateRoom>[1] }) =>
            roomsApi.updateRoom(id, data),
        onSuccess: () => {
            toast.success("Đã cập nhật phòng thành công!");
            queryClient.invalidateQueries({ queryKey: ["rooms"] });
            setEditingRoom(null);
            setEditData(defaultEditRoom);
        },
        onError: (error: any) => {
            toast.error("Không thể cập nhật phòng", {
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
            setDeletingRoom(null);
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

    // Reset to page 1 when filters change
    const handleSearchChange = (value: string) => {
        setSearchQuery(value);
        setCurrentPage(1);
    };

    const handleTypeChange = (value: string) => {
        setTypeFilter(value);
        setCurrentPage(1);
    };

    const handleStatusChange = (value: string) => {
        setStatusFilter(value);
        setCurrentPage(1);
    };

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

    const handleOpenEdit = (room: Room) => {
        setEditingRoom(room);
        setEditData({
            roomNumber: room.roomNumber,
            floor: room.floor.toString(),
            typeId: room.typeId,
            status: room.status,
            notes: room.notes || "",
        });
    };

    const handleUpdateRoom = () => {
        if (!editingRoom) return;

        if (!editData.roomNumber || !editData.floor || !editData.typeId) {
            toast.error("Vui lòng điền đầy đủ thông tin bắt buộc");
            return;
        }

        const floor = Number.parseInt(editData.floor, 10);
        if (!Number.isFinite(floor) || floor < 0) {
            toast.error("Tầng không hợp lệ");
            return;
        }

        updateMutation.mutate({
            id: editingRoom.id,
            data: {
                roomNumber: editData.roomNumber,
                floor,
                typeId: editData.typeId,
                status: editData.status,
                notes: editData.notes || undefined,
            },
        });
    };

    const handleDeleteRoom = () => {
        if (deletingRoom) {
            deleteMutation.mutate(deletingRoom.id);
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

                <div className="flex gap-2">
                    <AddRoomTypeDialog />
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
            </div>

            {/* Stats Cards */}
            <RoomStatsCards rooms={rooms} />

            {/* Filters */}
            <RoomFilters
                searchQuery={searchQuery}
                typeFilter={typeFilter}
                statusFilter={statusFilter}
                roomTypes={roomTypes}
                onSearchChange={handleSearchChange}
                onTypeChange={handleTypeChange}
                onStatusChange={handleStatusChange}
            />

            {/* Rooms Grid */}
            <RoomGrid
                rooms={filteredRooms}
                isLoading={roomsLoading}
                currentPage={currentPage}
                pageSize={pageSize}
                onPageChange={setCurrentPage}
                onPageSizeChange={setPageSize}
                onView={setViewingRoom}
                onEdit={handleOpenEdit}
                onDelete={setDeletingRoom}
            />

            {/* Edit Room Dialog */}
            <EditRoomDialog
                room={editingRoom}
                editData={editData}
                roomTypes={roomTypes}
                isSubmitting={updateMutation.isPending}
                onClose={() => setEditingRoom(null)}
                onEditDataChange={setEditData}
                onSubmit={handleUpdateRoom}
            />

            {/* Delete Room Dialog */}
            <DeleteRoomDialog
                room={deletingRoom}
                isDeleting={deleteMutation.isPending}
                onClose={() => setDeletingRoom(null)}
                onConfirm={handleDeleteRoom}
            />

            {/* View Room Dialog */}
            <ViewRoomDialog
                room={viewingRoom}
                onClose={() => setViewingRoom(null)}
            />
        </div>
    );
}
