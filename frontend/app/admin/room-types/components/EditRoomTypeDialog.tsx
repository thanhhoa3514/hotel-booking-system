"use client";

import { useState, useEffect } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { roomsApi, CreateRoomTypeData } from "@/services/rooms.api";
import { RoomType } from "@/types/room";
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
import { ImageUploader, UploadedImage } from "@/components/ui/image-uploader";

interface EditRoomTypeDialogProps {
    roomType: RoomType | null;
    onClose: () => void;
}

const bedTypes = [
    { value: "SINGLE", label: "Giường đơn" },
    { value: "DOUBLE", label: "Giường đôi" },
    { value: "QUEEN", label: "Giường Queen" },
    { value: "KING", label: "Giường King" },
    { value: "TWIN", label: "2 Giường đơn (Twin)" },
];

export function EditRoomTypeDialog({ roomType, onClose }: EditRoomTypeDialogProps) {
    const queryClient = useQueryClient();
    const [formData, setFormData] = useState({
        name: "",
        description: "",
        basePrice: "",
        capacity: "",
        bedType: "DOUBLE" as string,
        bedCount: "1",
        size: "",
        amenities: "",
        isActive: true,
    });
    const [images, setImages] = useState<UploadedImage[]>([]);

    // Populate form when roomType changes
    useEffect(() => {
        if (roomType) {
            // Parse amenities
            let amenitiesStr = "";
            if (roomType.amenities) {
                try {
                    const arr = typeof roomType.amenities === "string"
                        ? JSON.parse(roomType.amenities)
                        : roomType.amenities;
                    amenitiesStr = Array.isArray(arr) ? arr.join(", ") : "";
                } catch {
                    amenitiesStr = "";
                }
            }

            setFormData({
                name: roomType.name || "",
                description: roomType.description || "",
                basePrice: roomType.basePrice?.toString() || "",
                capacity: roomType.capacity?.toString() || "",
                bedType: roomType.bedType || "DOUBLE",
                bedCount: roomType.bedCount?.toString() || "1",
                size: roomType.size?.toString() || "",
                amenities: amenitiesStr,
                isActive: roomType.isActive ?? true,
            });

            // Set images
            if (roomType.images && roomType.images.length > 0) {
                setImages(roomType.images.map((img, index) => ({
                    url: img.url,
                    altText: img.caption,
                    isPrimary: img.isPrimary,
                    displayOrder: img.displayOrder ?? index,
                })));
            } else {
                setImages([]);
            }
        }
    }, [roomType]);

    const updateMutation = useMutation({
        mutationFn: (data: Partial<CreateRoomTypeData>) =>
            roomsApi.updateRoomType(roomType!.id, data),
        onSuccess: async () => {
            await queryClient.refetchQueries({ queryKey: ["room-types"] });
            toast.success("Cập nhật loại phòng thành công!");
            onClose();
        },
        onError: (error: any) => {
            toast.error("Lỗi khi cập nhật loại phòng", {
                description: error.response?.data?.message || error.message,
            });
        },
    });

    const handleSubmit = () => {
        if (!formData.name || !formData.basePrice || !formData.capacity) {
            toast.error("Vui lòng điền đầy đủ thông tin bắt buộc");
            return;
        }

        const data: Partial<CreateRoomTypeData> = {
            name: formData.name,
            description: formData.description || undefined,
            basePrice: parseFloat(formData.basePrice),
            capacity: parseInt(formData.capacity),
            bedType: formData.bedType as CreateRoomTypeData["bedType"],
            bedCount: formData.bedCount ? parseInt(formData.bedCount) : 1,
            size: formData.size ? parseFloat(formData.size) : undefined,
            amenities: formData.amenities
                ? formData.amenities.split(",").map((a) => a.trim()).filter(Boolean)
                : undefined,
            images: images.map((img) => ({
                url: img.url,
                altText: img.altText,
                isPrimary: img.isPrimary,
                displayOrder: img.displayOrder,
            })),
        };

        updateMutation.mutate(data);
    };

    const isSubmitting = updateMutation.isPending;

    return (
        <Dialog open={!!roomType} onOpenChange={() => onClose()}>
            <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto rounded-2xl">
                <DialogHeader>
                    <DialogTitle>Chỉnh sửa loại phòng</DialogTitle>
                    <DialogDescription>
                        Cập nhật thông tin loại phòng "{roomType?.name}"
                    </DialogDescription>
                </DialogHeader>

                <div className="grid gap-4 py-4">
                    {/* Basic Info */}
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="edit-name">Tên loại phòng *</Label>
                            <Input
                                id="edit-name"
                                placeholder="VD: Deluxe Room"
                                className="rounded-xl"
                                value={formData.name}
                                onChange={(e) =>
                                    setFormData({ ...formData, name: e.target.value })
                                }
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="edit-price">Giá cơ bản (VNĐ) *</Label>
                            <Input
                                id="edit-price"
                                type="number"
                                placeholder="VD: 1500000"
                                className="rounded-xl"
                                value={formData.basePrice}
                                onChange={(e) =>
                                    setFormData({ ...formData, basePrice: e.target.value })
                                }
                            />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="edit-description">Mô tả</Label>
                        <Textarea
                            id="edit-description"
                            placeholder="Mô tả chi tiết về loại phòng..."
                            className="rounded-xl resize-none"
                            rows={3}
                            value={formData.description}
                            onChange={(e) =>
                                setFormData({ ...formData, description: e.target.value })
                            }
                        />
                    </div>

                    {/* Room Details */}
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="edit-capacity">Sức chứa *</Label>
                            <Input
                                id="edit-capacity"
                                type="number"
                                min="1"
                                placeholder="2"
                                className="rounded-xl"
                                value={formData.capacity}
                                onChange={(e) =>
                                    setFormData({ ...formData, capacity: e.target.value })
                                }
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="edit-bedType">Loại giường *</Label>
                            <Select
                                value={formData.bedType}
                                onValueChange={(value) =>
                                    setFormData({ ...formData, bedType: value })
                                }
                            >
                                <SelectTrigger className="rounded-xl">
                                    <SelectValue placeholder="Chọn loại giường" />
                                </SelectTrigger>
                                <SelectContent>
                                    {bedTypes.map((type) => (
                                        <SelectItem key={type.value} value={type.value}>
                                            {type.label}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="edit-bedCount">Số giường</Label>
                            <Input
                                id="edit-bedCount"
                                type="number"
                                min="1"
                                placeholder="1"
                                className="rounded-xl"
                                value={formData.bedCount}
                                onChange={(e) =>
                                    setFormData({ ...formData, bedCount: e.target.value })
                                }
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="edit-size">Diện tích (m²)</Label>
                            <Input
                                id="edit-size"
                                type="number"
                                placeholder="25"
                                className="rounded-xl"
                                value={formData.size}
                                onChange={(e) =>
                                    setFormData({ ...formData, size: e.target.value })
                                }
                            />
                        </div>
                    </div>

                    {/* Amenities */}
                    <div className="space-y-2">
                        <Label htmlFor="edit-amenities">Tiện nghi</Label>
                        <Input
                            id="edit-amenities"
                            placeholder="WiFi, TV, Điều hòa, Minibar..."
                            className="rounded-xl"
                            value={formData.amenities}
                            onChange={(e) =>
                                setFormData({ ...formData, amenities: e.target.value })
                            }
                        />
                        <p className="text-xs text-muted-foreground">
                            Nhập các tiện nghi cách nhau bởi dấu phẩy
                        </p>
                    </div>

                    {/* Images */}
                    <div className="space-y-2">
                        <Label>Hình ảnh</Label>
                        <ImageUploader
                            images={images}
                            onChange={setImages}
                            maxImages={10}
                            disabled={isSubmitting}
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
                        onClick={handleSubmit}
                        className="rounded-xl bg-gradient-to-r from-orange-500 to-amber-500"
                        disabled={
                            !formData.name ||
                            !formData.basePrice ||
                            !formData.capacity ||
                            isSubmitting
                        }
                    >
                        {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        Cập nhật
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
