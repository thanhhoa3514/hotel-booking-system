"use client";

import Image from "next/image";
import Link from "next/link";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Users, Bed, Maximize } from "lucide-react";
import { useState } from "react";

interface RoomCardProps {
    id: string;
    name: string;
    image: string;
    basePrice: number;
    capacity: number;
    bedType: string;
    size?: number;
    amenities?: string[];
    isAvailable?: boolean;
}

export function RoomCard({
    id,
    name,
    image,
    basePrice,
    capacity,
    bedType,
    size,
    amenities = [],
    isAvailable = true,
}: RoomCardProps) {
    const [imageLoaded, setImageLoaded] = useState(false);

    return (
        <Card className="group overflow-hidden transition-all duration-300 hover:shadow-xl hover:-translate-y-1 dark:bg-slate-900">
            {/* Image Container */}
            <div className="relative aspect-[16/10] overflow-hidden">
                {!imageLoaded && (
                    <Skeleton className="absolute inset-0 w-full h-full" />
                )}
                <Image
                    src={image}
                    alt={name}
                    fill
                    className={`object-cover transition-transform duration-500 group-hover:scale-110 ${imageLoaded ? "opacity-100" : "opacity-0"
                        }`}
                    onLoad={() => setImageLoaded(true)}
                />

                {/* Availability Badge */}
                <div className="absolute top-3 right-3">
                    <Badge
                        variant={isAvailable ? "default" : "destructive"}
                        className={`${isAvailable
                                ? "bg-green-500 hover:bg-green-600"
                                : "bg-red-500 hover:bg-red-600"
                            }`}
                    >
                        {isAvailable ? "Available" : "Booked"}
                    </Badge>
                </div>
            </div>

            {/* Content */}
            <CardContent className="p-4 space-y-3">
                <h3 className="text-lg font-semibold text-slate-900 dark:text-white line-clamp-1">
                    {name}
                </h3>

                {/* Room Details */}
                <div className="flex items-center gap-4 text-sm text-slate-500 dark:text-slate-400">
                    <div className="flex items-center gap-1">
                        <Users className="h-4 w-4" />
                        <span>{capacity} Guests</span>
                    </div>
                    <div className="flex items-center gap-1">
                        <Bed className="h-4 w-4" />
                        <span>{bedType}</span>
                    </div>
                    {size && (
                        <div className="flex items-center gap-1">
                            <Maximize className="h-4 w-4" />
                            <span>{size}m²</span>
                        </div>
                    )}
                </div>

                {/* Amenities */}
                {amenities.length > 0 && (
                    <div className="flex flex-wrap gap-1">
                        {amenities.slice(0, 3).map((amenity) => (
                            <Badge key={amenity} variant="secondary" className="text-xs">
                                {amenity}
                            </Badge>
                        ))}
                        {amenities.length > 3 && (
                            <Badge variant="outline" className="text-xs">
                                +{amenities.length - 3}
                            </Badge>
                        )}
                    </div>
                )}
            </CardContent>

            {/* Footer */}
            <CardFooter className="p-4 pt-0 flex items-center justify-between">
                <div>
                    <span className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                        ${basePrice}
                    </span>
                    <span className="text-sm text-slate-500 dark:text-slate-400">
                        /night
                    </span>
                </div>
                <Link href={`/booking?roomType=${id}`}>
                    <Button
                        className="cursor-pointer bg-blue-600 hover:bg-blue-700"
                        disabled={!isAvailable}
                    >
                        Book Now
                    </Button>
                </Link>
            </CardFooter>
        </Card>
    );
}

// Loading Skeleton
export function RoomCardSkeleton() {
    return (
        <Card className="overflow-hidden">
            <Skeleton className="aspect-[16/10] w-full" />
            <CardContent className="p-4 space-y-3">
                <Skeleton className="h-6 w-3/4" />
                <Skeleton className="h-4 w-1/2" />
                <div className="flex gap-2">
                    <Skeleton className="h-5 w-16" />
                    <Skeleton className="h-5 w-16" />
                </div>
            </CardContent>
            <CardFooter className="p-4 pt-0 flex justify-between">
                <Skeleton className="h-8 w-20" />
                <Skeleton className="h-10 w-24" />
            </CardFooter>
        </Card>
    );
}
