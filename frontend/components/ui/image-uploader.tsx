"use client";

import { useState, useCallback, useRef } from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
    Upload,
    X,
    Star,
    Loader2,
    ImageIcon,
} from "lucide-react";
import Image from "next/image";

export interface UploadedImage {
    url: string;
    altText?: string;
    isPrimary: boolean;
    displayOrder: number;
    isUploading?: boolean;
}

interface ImageUploaderProps {
    images: UploadedImage[];
    onChange: (images: UploadedImage[]) => void;
    maxImages?: number;
    disabled?: boolean;
}

const CLOUD_NAME = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
const UPLOAD_PRESET = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET;

export function ImageUploader({
    images,
    onChange,
    maxImages = 10,
    disabled = false,
}: ImageUploaderProps) {
    const [isDragOver, setIsDragOver] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const uploadToCloudinary = async (file: File): Promise<string | null> => {
        if (!CLOUD_NAME || !UPLOAD_PRESET) {
            console.error("Cloudinary credentials not configured");
            return null;
        }

        const formData = new FormData();
        formData.append("file", file);
        formData.append("upload_preset", UPLOAD_PRESET);
        formData.append("folder", "hotel/rooms");

        try {
            const response = await fetch(
                `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`,
                {
                    method: "POST",
                    body: formData,
                }
            );

            if (!response.ok) {
                throw new Error("Upload failed");
            }

            const data = await response.json();
            return data.secure_url;
        } catch (error) {
            console.error("Cloudinary upload error:", error);
            return null;
        }
    };

    const handleFiles = useCallback(
        async (files: FileList | File[]) => {
            const fileArray = Array.from(files);
            const remainingSlots = maxImages - images.length;
            const filesToUpload = fileArray.slice(0, remainingSlots);

            if (filesToUpload.length === 0) return;

            // Add placeholder images with loading state
            const placeholders: UploadedImage[] = filesToUpload.map((_, index) => ({
                url: "",
                isPrimary: images.length === 0 && index === 0,
                displayOrder: images.length + index,
                isUploading: true,
            }));

            const newImages = [...images, ...placeholders];
            onChange(newImages);

            // Upload each file
            const uploadPromises = filesToUpload.map(async (file, index) => {
                const url = await uploadToCloudinary(file);
                return { index: images.length + index, url };
            });

            const results = await Promise.all(uploadPromises);

            // Update images with actual URLs
            const updatedImages = newImages.map((img, idx) => {
                const result = results.find((r) => r.index === idx);
                if (result && result.url) {
                    return {
                        ...img,
                        url: result.url,
                        isUploading: false,
                    };
                }
                return img;
            }).filter((img) => img.url || img.isUploading);

            // Remove failed uploads
            const successfulImages = updatedImages.filter(
                (img) => img.url && !img.isUploading
            );
            onChange(successfulImages);
        },
        [images, onChange, maxImages]
    );

    const handleDrop = useCallback(
        (e: React.DragEvent) => {
            e.preventDefault();
            setIsDragOver(false);
            if (disabled) return;

            const files = e.dataTransfer.files;
            handleFiles(files);
        },
        [handleFiles, disabled]
    );

    const handleDragOver = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        setIsDragOver(true);
    }, []);

    const handleDragLeave = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        setIsDragOver(false);
    }, []);

    const handleFileSelect = useCallback(
        (e: React.ChangeEvent<HTMLInputElement>) => {
            const files = e.target.files;
            if (files) {
                handleFiles(files);
            }
            // Reset input
            if (fileInputRef.current) {
                fileInputRef.current.value = "";
            }
        },
        [handleFiles]
    );

    const handleRemove = useCallback(
        (index: number) => {
            const newImages = images.filter((_, i) => i !== index);
            // If removed image was primary, set first remaining as primary
            if (images[index].isPrimary && newImages.length > 0) {
                newImages[0].isPrimary = true;
            }
            // Update display order
            const reorderedImages = newImages.map((img, i) => ({
                ...img,
                displayOrder: i,
            }));
            onChange(reorderedImages);
        },
        [images, onChange]
    );

    const handleSetPrimary = useCallback(
        (index: number) => {
            const newImages = images.map((img, i) => ({
                ...img,
                isPrimary: i === index,
            }));
            onChange(newImages);
        },
        [images, onChange]
    );

    const canAddMore = images.length < maxImages;

    return (
        <div className="space-y-4">
            {/* Dropzone */}
            {canAddMore && (
                <div
                    onDrop={handleDrop}
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    onClick={() => !disabled && fileInputRef.current?.click()}
                    className={cn(
                        "border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-all",
                        isDragOver
                            ? "border-orange-500 bg-orange-50 dark:bg-orange-950/20"
                            : "border-slate-300 dark:border-slate-700 hover:border-orange-400",
                        disabled && "opacity-50 cursor-not-allowed"
                    )}
                >
                    <input
                        ref={fileInputRef}
                        type="file"
                        multiple
                        accept="image/*"
                        onChange={handleFileSelect}
                        className="hidden"
                        disabled={disabled}
                    />
                    <Upload className="h-8 w-8 mx-auto text-slate-400 mb-2" />
                    <p className="text-sm text-slate-600 dark:text-slate-400">
                        Kéo thả ảnh vào đây hoặc click để chọn
                    </p>
                    <p className="text-xs text-slate-400 mt-1">
                        Tối đa {maxImages} ảnh ({images.length}/{maxImages})
                    </p>
                </div>
            )}

            {/* Image Preview Grid */}
            {images.length > 0 && (
                <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
                    {images.map((image, index) => (
                        <div
                            key={index}
                            className={cn(
                                "relative aspect-square rounded-lg overflow-hidden border-2 group",
                                image.isPrimary
                                    ? "border-orange-500 ring-2 ring-orange-500/30"
                                    : "border-slate-200 dark:border-slate-700"
                            )}
                        >
                            {image.isUploading ? (
                                <div className="absolute inset-0 flex items-center justify-center bg-slate-100 dark:bg-slate-800">
                                    <Loader2 className="h-6 w-6 animate-spin text-orange-500" />
                                </div>
                            ) : image.url ? (
                                <>
                                    <Image
                                        src={image.url}
                                        alt={image.altText || `Image ${index + 1}`}
                                        fill
                                        className="object-cover"
                                    />
                                    {/* Overlay buttons */}
                                    <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                                        <Button
                                            type="button"
                                            size="icon"
                                            variant="secondary"
                                            className={cn(
                                                "h-8 w-8 rounded-full",
                                                image.isPrimary && "bg-orange-500 text-white hover:bg-orange-600"
                                            )}
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                handleSetPrimary(index);
                                            }}
                                            title={image.isPrimary ? "Ảnh chính" : "Đặt làm ảnh chính"}
                                        >
                                            <Star className={cn("h-4 w-4", image.isPrimary && "fill-current")} />
                                        </Button>
                                        <Button
                                            type="button"
                                            size="icon"
                                            variant="destructive"
                                            className="h-8 w-8 rounded-full"
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                handleRemove(index);
                                            }}
                                            title="Xóa ảnh"
                                        >
                                            <X className="h-4 w-4" />
                                        </Button>
                                    </div>
                                    {/* Primary badge */}
                                    {image.isPrimary && (
                                        <div className="absolute top-1 left-1 bg-orange-500 text-white text-xs px-1.5 py-0.5 rounded">
                                            Chính
                                        </div>
                                    )}
                                </>
                            ) : (
                                <div className="absolute inset-0 flex items-center justify-center bg-slate-100 dark:bg-slate-800">
                                    <ImageIcon className="h-6 w-6 text-slate-400" />
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            )}

            {/* Help text */}
            <p className="text-xs text-slate-500">
                Click vào biểu tượng ⭐ để chọn ảnh chính hiển thị đầu tiên
            </p>
        </div>
    );
}
