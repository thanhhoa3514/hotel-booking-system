"use client";

import { useState } from "react";
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
    DialogTrigger,
} from "@/components/ui/dialog";
import { Plus, Loader2 } from "lucide-react";
import { ImageUploader, UploadedImage } from "@/components/ui/image-uploader";
import { roomsApi, CreateRoomTypeData } from "@/services/rooms.api";
import { toast } from "sonner";
import { useMutation, useQueryClient } from "@tanstack/react-query";

const BED_TYPES = [
    { value: "SINGLE", label: "Đơn" },
    { value: "DOUBLE", label: "Đôi" },
    { value: "QUEEN", label: "Queen" },
    { value: "KING", label: "King" },
    { value: "TWIN", label: "Twin" },
] as const;

interface AddRoomTypeDialogProps {
    trigger?: React.ReactNode;
}

export function AddRoomTypeDialog({ trigger }: AddRoomTypeDialogProps) {
    const [isOpen, setIsOpen] = useState(false);
    const queryClient = useQueryClient();

    const [formData, setFormData] = useState<{
        name: string;
        description: string;
        basePrice: string;
        capacity: string;
        bedType: string;
        bedCount: string;
        size: string;
        amenities: string;
    }>({
        name: "",
        description: "",
        basePrice: "",
        capacity: "",
        bedType: "DOUBLE",
        bedCount: "1",
        size: "",
        amenities: "",
    });

    const [images, setImages] = useState<UploadedImage[]>([]);

    const createMutation = useMutation({
        mutationFn: (data: CreateRoomTypeData) => roomsApi.createRoomType(data),
        onSuccess: async () => {

            // Force refetch to ensure UI updates immediately
            await queryClient.refetchQueries({ queryKey: ["room-types"] });
            toast.success("Tạo loại phòng thành công!");
            setIsOpen(false);
            resetForm();
        },
        onError: (error: any) => {
            toast.error("Lỗi khi tạo loại phòng", {
                description: error.response?.data?.message || error.message,
            });
        },
    });

    const resetForm = () => {
        setFormData({
            name: "",
            description: "",
            basePrice: "",
            capacity: "",
            bedType: "DOUBLE",
            bedCount: "1",
            size: "",
            amenities: "",
        });
        setImages([]);
    };

    const handleSubmit = () => {
        if (!formData.name || !formData.basePrice || !formData.capacity) {
            toast.error("Vui lòng điền đầy đủ thông tin bắt buộc");
            return;
        }

        const data: CreateRoomTypeData = {
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
            images: images.length > 0
                ? images.map((img) => ({
                    url: img.url,
                    altText: img.altText,
                    isPrimary: img.isPrimary,
                    displayOrder: img.displayOrder,
                }))
                : undefined,
        };



        createMutation.mutate(data);
    };

    const isSubmitting = createMutation.isPending;

    return (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
                {trigger || (
                    <Button className="rounded-xl bg-gradient-to-r from-orange-500 to-amber-500 text-white shadow-lg shadow-orange-500/30">
                        <Plus className="h-4 w-4 mr-2" />
                        Thêm loại phòng
                    </Button>
                )}
            </DialogTrigger>
            <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto rounded-2xl">
                <DialogHeader>
                    <DialogTitle>Thêm loại phòng mới</DialogTitle>
                    <DialogDescription>
                        Nhập thông tin loại phòng và upload ảnh minh họa
                    </DialogDescription>
                </DialogHeader>

                <div className="grid gap-4 py-4">
                    {/* Name */}
                    <div className="space-y-2">
                        <Label htmlFor="name">Tên loại phòng *</Label>
                        <Input
                            id="name"
                            placeholder="VD: Phòng Deluxe"
                            className="rounded-xl"
                            value={formData.name}
                            onChange={(e) =>
                                setFormData({ ...formData, name: e.target.value })
                            }
                        />
                    </div>

                    {/* Description */}
                    <div className="space-y-2">
                        <Label htmlFor="description">Mô tả</Label>
                        <Textarea
                            id="description"
                            placeholder="Mô tả chi tiết về loại phòng..."
                            className="rounded-xl resize-none"
                            rows={3}
                            value={formData.description}
                            onChange={(e) =>
                                setFormData({ ...formData, description: e.target.value })
                            }
                        />
                    </div>

                    {/* Price & Capacity */}
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="basePrice">Giá cơ bản (VNĐ/đêm) *</Label>
                            <Input
                                id="basePrice"
                                type="number"
                                placeholder="1000000"
                                className="rounded-xl"
                                value={formData.basePrice}
                                onChange={(e) =>
                                    setFormData({ ...formData, basePrice: e.target.value })
                                }
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="capacity">Sức chứa (người) *</Label>
                            <Input
                                id="capacity"
                                type="number"
                                placeholder="2"
                                className="rounded-xl"
                                value={formData.capacity}
                                onChange={(e) =>
                                    setFormData({ ...formData, capacity: e.target.value })
                                }
                            />
                        </div>
                    </div>

                    {/* Bed Type & Count */}
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label>Loại giường</Label>
                            <Select
                                value={formData.bedType}
                                onValueChange={(value) =>
                                    setFormData({ ...formData, bedType: value })
                                }
                            >
                                <SelectTrigger className="rounded-xl">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    {BED_TYPES.map((type) => (
                                        <SelectItem key={type.value} value={type.value}>
                                            {type.label}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="bedCount">Số giường</Label>
                            <Input
                                id="bedCount"
                                type="number"
                                placeholder="1"
                                className="rounded-xl"
                                value={formData.bedCount}
                                onChange={(e) =>
                                    setFormData({ ...formData, bedCount: e.target.value })
                                }
                            />
                        </div>
                    </div>

                    {/* Size & Amenities */}
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="size">Diện tích (m²)</Label>
                            <Input
                                id="size"
                                type="number"
                                placeholder="25"
                                className="rounded-xl"
                                value={formData.size}
                                onChange={(e) =>
                                    setFormData({ ...formData, size: e.target.value })
                                }
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="amenities">Tiện nghi</Label>
                            <Input
                                id="amenities"
                                placeholder="wifi, tv, minibar..."
                                className="rounded-xl"
                                value={formData.amenities}
                                onChange={(e) =>
                                    setFormData({ ...formData, amenities: e.target.value })
                                }
                            />
                        </div>
                    </div>

                    {/* Image Upload */}
                    <div className="space-y-2">
                        <Label>Ảnh phòng</Label>
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
                        onClick={() => setIsOpen(false)}
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
                        Tạo loại phòng
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
