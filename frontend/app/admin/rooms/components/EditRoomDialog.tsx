"use client";

import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Loader2 } from "lucide-react";
import { Room, RoomType, RoomStatus } from "@/types/room";
import { statusOptions } from "./room-utils";

export interface EditRoomData {
    roomNumber: string;
    floor: string;
    typeId: string;
    status: RoomStatus;
    notes: string;
}

interface EditRoomDialogProps {
    room: Room | null;
    editData: EditRoomData;
    roomTypes: RoomType[];
    isSubmitting?: boolean;
    onClose: () => void;
    onEditDataChange: (data: EditRoomData) => void;
    onSubmit: () => void;
}

export function EditRoomDialog({
    room,
    editData,
    roomTypes,
    isSubmitting,
    onClose,
    onEditDataChange,
    onSubmit,
}: EditRoomDialogProps) {

    const selectedRoomType = roomTypes.find(rt => rt.id === editData.typeId);
    const primaryImage = selectedRoomType?.images?.find(img => img.isPrimary) || selectedRoomType?.images?.[0];

    return (
        <Dialog open={!!room} onOpenChange={() => onClose()}>
            <DialogContent className="sm:max-w-md rounded-2xl">
                {/* Image Preview */}
                {primaryImage?.url && (
                    <div className="relative h-32 -mx-6 -mt-6 mb-4 overflow-hidden rounded-t-2xl">
                        <img
                            src={primaryImage.url}
                            alt={selectedRoomType?.name || 'Room'}
                            className="w-full h-full object-cover"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                        <div className="absolute bottom-3 left-4">
                            <p className="text-white/80 text-xs">{selectedRoomType?.name}</p>
                            <p className="text-white text-lg font-bold">Phòng {room?.roomNumber}</p>
                        </div>
                    </div>
                )}

                <DialogHeader className={primaryImage?.url ? '' : 'mb-4'}>
                    {!primaryImage?.url && (
                        <>
                            <DialogTitle>Chỉnh sửa phòng {room?.roomNumber}</DialogTitle>
                            <DialogDescription>Cập nhật thông tin phòng</DialogDescription>
                        </>
                    )}
                    {primaryImage?.url && (
                        <DialogDescription>Cập nhật thông tin phòng</DialogDescription>
                    )}
                </DialogHeader>
                <div className="grid gap-4 py-4">
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="edit-roomNumber">Số phòng *</Label>
                            <Input
                                id="edit-roomNumber"
                                placeholder="VD: 101"
                                className="rounded-xl"
                                value={editData.roomNumber}
                                onChange={(e) =>
                                    onEditDataChange({ ...editData, roomNumber: e.target.value })
                                }
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="edit-floor">Tầng *</Label>
                            <Input
                                id="edit-floor"
                                type="number"
                                placeholder="VD: 1"
                                className="rounded-xl"
                                value={editData.floor}
                                onChange={(e) =>
                                    onEditDataChange({ ...editData, floor: e.target.value })
                                }
                            />
                        </div>
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="edit-type">Loại phòng *</Label>
                        <Select
                            value={editData.typeId}
                            onValueChange={(value) =>
                                onEditDataChange({ ...editData, typeId: value })
                            }
                        >
                            <SelectTrigger className="rounded-xl">
                                <SelectValue placeholder="Chọn loại phòng" />
                            </SelectTrigger>
                            <SelectContent>
                                {roomTypes.map((type) => (
                                    <SelectItem key={type.id} value={type.id}>
                                        {type.name}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="edit-status">Trạng thái</Label>
                        <Select
                            value={editData.status}
                            onValueChange={(value) =>
                                onEditDataChange({ ...editData, status: value as RoomStatus })
                            }
                        >
                            <SelectTrigger className="rounded-xl">
                                <SelectValue placeholder="Chọn trạng thái" />
                            </SelectTrigger>
                            <SelectContent>
                                {statusOptions.map((opt) => (
                                    <SelectItem key={opt.value} value={opt.value}>
                                        {opt.label}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="edit-notes">Ghi chú</Label>
                        <Textarea
                            id="edit-notes"
                            placeholder="Ghi chú về phòng..."
                            className="rounded-xl resize-none"
                            rows={2}
                            value={editData.notes}
                            onChange={(e) =>
                                onEditDataChange({ ...editData, notes: e.target.value })
                            }
                        />
                    </div>
                </div>
                <DialogFooter>
                    <Button
                        variant="outline"
                        onClick={onClose}
                        className="rounded-xl"
                        disabled={isSubmitting}
                    >
                        Hủy
                    </Button>
                    <Button
                        onClick={onSubmit}
                        className="rounded-xl bg-gradient-to-r from-orange-500 to-amber-500"
                        disabled={!editData.roomNumber || !editData.floor || !editData.typeId || isSubmitting}
                    >
                        {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        Cập nhật
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
