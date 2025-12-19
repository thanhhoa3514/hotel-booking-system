"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import {
    BedDouble,
    Users,
    Ruler,
    ChevronLeft,
    ChevronRight,
    ImageOff,
    Bed,
} from "lucide-react";
import { Room } from "@/types/room";
import { getStatusConfig, getAmenityIcon, formatCurrency } from "./room-utils";

interface ViewRoomDialogProps {
    room: Room | null;
    onClose: () => void;
}

export function ViewRoomDialog({ room, onClose }: ViewRoomDialogProps) {
    const [currentImageIndex, setCurrentImageIndex] = useState(0);

    const roomType = room?.roomType;
    const images = roomType?.images || [];
    const hasImages = images.length > 0;

    useEffect(() => {
        // reset on room change / new image list
        setCurrentImageIndex(0);
    }, [room?.id]);

    useEffect(() => {
        // clamp if image list shrinks
        setCurrentImageIndex((idx) => Math.min(idx, Math.max(0, images.length - 1)));
    }, [images.length]);

    if (!room) return null;

    const statusConfig = getStatusConfig(room.status);

    const handlePrevImage = () => {
        setCurrentImageIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1));
    };

    const handleNextImage = () => {
        setCurrentImageIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1));
    };

    const getBedTypeLabel = (bedType?: string) => {
        switch (bedType) {
            case "SINGLE": return "Giường đơn";
            case "DOUBLE": return "Giường đôi";
            case "QUEEN": return "Giường Queen";
            case "KING": return "Giường King";
            case "TWIN": return "2 Giường đơn";
            default: return bedType || "N/A";
        }
    };

    return (
        <Dialog open={!!room} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-2xl rounded-2xl p-0 overflow-hidden">
                {/* Image Gallery */}
                <div className="relative h-64 bg-slate-100 dark:bg-slate-800">
                    {hasImages ? (
                        <>
                            <img
                                src={images[currentImageIndex]?.url}
                                alt={images[currentImageIndex]?.caption || `Phòng ${room.roomNumber}`}
                                className="w-full h-full object-cover"
                            />
                            {images.length > 1 && (
                                <>
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        className="absolute left-2 top-1/2 -translate-y-1/2 bg-white/80 dark:bg-black/50 rounded-full hover:bg-white dark:hover:bg-black/70"
                                        onClick={handlePrevImage}
                                    >
                                        <ChevronLeft className="h-5 w-5" />
                                    </Button>
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        className="absolute right-2 top-1/2 -translate-y-1/2 bg-white/80 dark:bg-black/50 rounded-full hover:bg-white dark:hover:bg-black/70"
                                        onClick={handleNextImage}
                                    >
                                        <ChevronRight className="h-5 w-5" />
                                    </Button>
                                    <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5">
                                        {images.map((_, idx) => (
                                            <button
                                                key={idx}
                                                className={`w-2 h-2 rounded-full transition-colors ${idx === currentImageIndex
                                                    ? "bg-white"
                                                    : "bg-white/50 hover:bg-white/75"
                                                    }`}
                                                onClick={() => setCurrentImageIndex(idx)}
                                            />
                                        ))}
                                    </div>
                                </>
                            )}
                        </>
                    ) : (
                        <div className="w-full h-full flex items-center justify-center">
                            <ImageOff className="h-16 w-16 text-slate-300 dark:text-slate-600" />
                        </div>
                    )}

                    {/* Status Badge */}
                    <Badge
                        className={`absolute top-3 right-3 ${statusConfig.className} border-0 rounded-lg`}
                    >
                        {statusConfig.label}
                    </Badge>
                </div>

                {/* Content */}
                <div className="p-6">
                    {/* Image Thumbnails Strip */}
                    {images.length > 1 && (
                        <div className="flex gap-2 overflow-x-auto pb-4 mb-2 scrollbar-hide">
                            {images.map((img, idx) => (
                                <button
                                    key={img.id}
                                    className={`flex-shrink-0 w-16 h-12 rounded-lg overflow-hidden border-2 transition-all ${idx === currentImageIndex
                                        ? "border-orange-500 ring-2 ring-orange-500/20"
                                        : "border-transparent opacity-70 hover:opacity-100 hover:border-slate-300"
                                        }`}
                                    onClick={() => setCurrentImageIndex(idx)}
                                >
                                    <img
                                        src={img.url}
                                        alt={img.caption || `Image ${idx + 1}`}
                                        className="w-full h-full object-cover"
                                    />
                                </button>
                            ))}
                        </div>
                    )}
                    <DialogHeader className="mb-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <DialogTitle className="text-2xl">
                                    Phòng {room.roomNumber}
                                </DialogTitle>
                                <p className="text-muted-foreground">
                                    {roomType?.name || "Unknown Type"}
                                </p>
                            </div>
                            <div className="text-right">
                                <p className="text-2xl font-bold text-orange-600">
                                    {formatCurrency(roomType?.basePrice || 0)}
                                </p>
                                <p className="text-sm text-muted-foreground">/đêm</p>
                            </div>
                        </div>
                    </DialogHeader>

                    {/* Room Info Grid */}
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-4">
                        <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800 text-center">
                            <BedDouble className="h-5 w-5 mx-auto mb-1 text-orange-600" />
                            <p className="text-sm font-medium">Tầng {room.floor}</p>
                        </div>
                        <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800 text-center">
                            <Users className="h-5 w-5 mx-auto mb-1 text-orange-600" />
                            <p className="text-sm font-medium">{roomType?.maxOccupancy || 0} khách</p>
                        </div>
                        <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800 text-center">
                            <Bed className="h-5 w-5 mx-auto mb-1 text-orange-600" />
                            <p className="text-sm font-medium">{getBedTypeLabel(roomType?.bedType)}</p>
                        </div>
                        <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800 text-center">
                            <Ruler className="h-5 w-5 mx-auto mb-1 text-orange-600" />
                            <p className="text-sm font-medium">{roomType?.size || 0} m²</p>
                        </div>
                    </div>

                    {/* Description */}
                    {roomType?.description && (
                        <div className="mb-4">
                            <h4 className="font-medium mb-2">Mô tả</h4>
                            <p className="text-sm text-muted-foreground">{roomType.description}</p>
                        </div>
                    )}

                    {/* Amenities */}
                    {roomType?.amenities && (() => {
                        // Parse amenities if it's a JSON string
                        let amenitiesArray: string[] = [];
                        try {
                            amenitiesArray = typeof roomType.amenities === 'string'
                                ? JSON.parse(roomType.amenities)
                                : roomType.amenities;
                        } catch {
                            amenitiesArray = [];
                        }

                        if (!Array.isArray(amenitiesArray) || amenitiesArray.length === 0) return null;

                        return (
                            <div className="mb-4">
                                <h4 className="font-medium mb-2">Tiện nghi</h4>
                                <div className="flex flex-wrap gap-2">
                                    {amenitiesArray.map((amenity, index) => (
                                        <div
                                            key={index}
                                            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-slate-100 dark:bg-slate-800 text-sm"
                                        >
                                            {getAmenityIcon(amenity)}
                                            <span className="capitalize">{amenity}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        );
                    })()}

                    {/* Notes */}
                    {room.notes && (
                        <div className="p-3 rounded-xl bg-yellow-50 dark:bg-yellow-950/30 border border-yellow-200 dark:border-yellow-900">
                            <h4 className="font-medium text-yellow-800 dark:text-yellow-200 mb-1">
                                Ghi chú
                            </h4>
                            <p className="text-sm text-yellow-700 dark:text-yellow-300">
                                {room.notes}
                            </p>
                        </div>
                    )}


                </div>
            </DialogContent>
        </Dialog>
    );
}
