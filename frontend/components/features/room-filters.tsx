"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Filter, X, Users, DollarSign } from "lucide-react";

interface RoomFiltersProps {
    onFilterChange: (filters: RoomFilterValues) => void;
    maxPrice?: number;
}

export interface RoomFilterValues {
    priceRange: [number, number];
    maxGuests: number | null;
    amenities: string[];
}

const AMENITIES_OPTIONS = [
    "Wifi",
    "TV",
    "Điều hòa",
    "Minibar",
    "Ban công",
    "Bồn tắm",
    "Két sắt",
    "Bàn làm việc",
];

export function RoomFilters({ onFilterChange, maxPrice = 5000000 }: RoomFiltersProps) {
    const [priceRange, setPriceRange] = useState<[number, number]>([0, maxPrice]);
    const [maxGuests, setMaxGuests] = useState<number | null>(null);
    const [selectedAmenities, setSelectedAmenities] = useState<string[]>([]);

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat("vi-VN", {
            style: "currency",
            currency: "VND",
            maximumFractionDigits: 0,
        }).format(amount);
    };

    const handlePriceChange = (value: number[]) => {
        const newRange: [number, number] = [value[0], value[1]];
        setPriceRange(newRange);
    };

    const handleAmenityToggle = (amenity: string) => {
        setSelectedAmenities((prev) =>
            prev.includes(amenity)
                ? prev.filter((a) => a !== amenity)
                : [...prev, amenity]
        );
    };

    const handleApplyFilters = () => {
        onFilterChange({
            priceRange,
            maxGuests,
            amenities: selectedAmenities,
        });
    };

    const handleClearFilters = () => {
        setPriceRange([0, maxPrice]);
        setMaxGuests(null);
        setSelectedAmenities([]);
        onFilterChange({
            priceRange: [0, maxPrice],
            maxGuests: null,
            amenities: [],
        });
    };

    const hasActiveFilters = priceRange[0] > 0 || priceRange[1] < maxPrice || maxGuests !== null || selectedAmenities.length > 0;

    return (
        <Card className="sticky top-24 border-0 shadow-lg rounded-2xl bg-white dark:bg-slate-900">
            <CardHeader className="pb-4">
                <div className="flex items-center justify-between">
                    <CardTitle className="text-lg flex items-center gap-2">
                        <Filter className="h-5 w-5 text-orange-500" />
                        Bộ lọc
                    </CardTitle>
                    {hasActiveFilters && (
                        <Button variant="ghost" size="sm" onClick={handleClearFilters} className="text-slate-500 hover:text-red-500 h-8">
                            <X className="h-4 w-4 mr-1" />
                            Xóa
                        </Button>
                    )}
                </div>
            </CardHeader>
            <CardContent className="space-y-6">
                {/* Price Range */}
                <div className="space-y-4">
                    <Label className="flex items-center gap-2 text-sm font-medium">
                        <DollarSign className="h-4 w-4 text-orange-500" />
                        Khoảng giá / đêm
                    </Label>
                    <Slider
                        min={0}
                        max={maxPrice}
                        step={100000}
                        value={priceRange}
                        onValueChange={handlePriceChange}
                        className="mt-2"
                    />
                    <div className="flex items-center justify-between text-sm text-slate-600 dark:text-slate-400">
                        <span>{formatCurrency(priceRange[0])}</span>
                        <span>{formatCurrency(priceRange[1])}</span>
                    </div>
                </div>

                {/* Max Guests */}
                <div className="space-y-3">
                    <Label className="flex items-center gap-2 text-sm font-medium">
                        <Users className="h-4 w-4 text-orange-500" />
                        Số khách tối đa
                    </Label>
                    <div className="flex gap-2">
                        {[1, 2, 3, 4].map((num) => (
                            <Button
                                key={num}
                                variant={maxGuests === num ? "default" : "outline"}
                                size="sm"
                                onClick={() => setMaxGuests(maxGuests === num ? null : num)}
                                className={maxGuests === num ? "bg-orange-500 hover:bg-orange-600" : ""}
                            >
                                {num}+
                            </Button>
                        ))}
                    </div>
                </div>

                {/* Amenities */}
                <div className="space-y-3">
                    <Label className="text-sm font-medium">Tiện nghi</Label>
                    <div className="grid grid-cols-2 gap-2">
                        {AMENITIES_OPTIONS.map((amenity) => (
                            <div
                                key={amenity}
                                className="flex items-center space-x-2"
                            >
                                <Checkbox
                                    id={amenity}
                                    checked={selectedAmenities.includes(amenity)}
                                    onCheckedChange={() => handleAmenityToggle(amenity)}
                                />
                                <label
                                    htmlFor={amenity}
                                    className="text-sm text-slate-600 dark:text-slate-400 cursor-pointer"
                                >
                                    {amenity}
                                </label>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Apply Button */}
                <Button
                    className="w-full bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white cursor-pointer"
                    onClick={handleApplyFilters}
                >
                    Áp dụng bộ lọc
                </Button>

                {/* Active Filters Display */}
                {hasActiveFilters && (
                    <div className="flex flex-wrap gap-2 pt-2">
                        {priceRange[0] > 0 && (
                            <Badge variant="secondary" className="bg-orange-100 text-orange-700">
                                Từ {formatCurrency(priceRange[0])}
                            </Badge>
                        )}
                        {priceRange[1] < maxPrice && (
                            <Badge variant="secondary" className="bg-orange-100 text-orange-700">
                                Đến {formatCurrency(priceRange[1])}
                            </Badge>
                        )}
                        {maxGuests && (
                            <Badge variant="secondary" className="bg-orange-100 text-orange-700">
                                {maxGuests}+ khách
                            </Badge>
                        )}
                        {selectedAmenities.map((a) => (
                            <Badge key={a} variant="secondary" className="bg-orange-100 text-orange-700">
                                {a}
                            </Badge>
                        ))}
                    </div>
                )}
            </CardContent>
        </Card>
    );
}
