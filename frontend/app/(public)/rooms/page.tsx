"use client";

import { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { roomsApi, RoomTypesResponse } from "@/services/rooms.api";
import { RoomType } from "@/types/room";
import { RoomTypeCard } from "@/components/features/room-type-card";
import { RoomFilters, RoomFilterValues } from "@/components/features/room-filters";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { BedDouble, Search, ChevronLeft, ChevronRight } from "lucide-react";

export default function RoomsPage() {
    const [filters, setFilters] = useState<RoomFilterValues>({
        priceRange: [0, 10000000],
        maxGuests: null,
        amenities: [],
    });
    const [page, setPage] = useState(1);
    const limit = 12; // Items per page

    // Fetch room types from API with pagination
    const { data: roomTypesData, isLoading, error } = useQuery({
        queryKey: ["roomTypes", page, limit],
        queryFn: () => roomsApi.getRoomTypes({ page, limit }),
    });

    const roomTypes = roomTypesData?.data || [];
    const meta = roomTypesData?.meta;

    // Filter room types based on selected filters (client-side)
    const filteredRoomTypes = useMemo(() => {
        if (!roomTypes) return [];

        return roomTypes.filter((roomType: RoomType) => {
            // Filter by price
            if (roomType.basePrice < filters.priceRange[0] || roomType.basePrice > filters.priceRange[1]) {
                return false;
            }

            // Filter by max guests
            if (filters.maxGuests && roomType.maxOccupancy < filters.maxGuests) {
                return false;
            }

            // Filter by amenities
            if (filters.amenities.length > 0) {
                const roomAmenities = roomType.amenities?.map(a => a.toLowerCase()) || [];
                const hasAllAmenities = filters.amenities.every(filterAmenity =>
                    roomAmenities.some(roomAmenity => roomAmenity.includes(filterAmenity.toLowerCase()))
                );
                if (!hasAllAmenities) return false;
            }

            return true;
        });
    }, [roomTypes, filters]);

    const handleFilterChange = (newFilters: RoomFilterValues) => {
        setFilters(newFilters);
    };

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
            {/* Hero Header */}
            <section className="relative py-16 bg-gradient-to-br from-orange-500 to-amber-500">
                <div className="absolute inset-0 bg-black/10" />
                <div className="container mx-auto px-4 relative z-10">
                    <div className="text-center text-white">
                        <h1 className="text-4xl md:text-5xl font-bold mb-4 drop-shadow-md">
                            Khám phá các loại phòng
                        </h1>
                        <p className="text-lg md:text-xl opacity-90 max-w-2xl mx-auto">
                            Lựa chọn không gian nghỉ ngơi hoàn hảo cho kỳ nghỉ của bạn
                        </p>
                    </div>
                </div>
            </section>

            {/* Main Content */}
            <div className="container mx-auto px-4 py-12">
                <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
                    {/* Sidebar Filters */}
                    <div className="lg:col-span-1">
                        <RoomFilters
                            onFilterChange={handleFilterChange}
                            maxPrice={10000000}
                        />
                    </div>

                    {/* Room Types Grid */}
                    <div className="lg:col-span-3">
                        {/* Results Header */}
                        <div className="flex items-center justify-between mb-6">
                            <div className="flex items-center gap-2">
                                <BedDouble className="h-5 w-5 text-orange-500" />
                                <span className="text-slate-600 dark:text-slate-400">
                                    {isLoading ? "Đang tải..." : `${filteredRoomTypes.length} loại phòng${meta ? ` (Tổng: ${meta.total})` : ''}`}
                                </span>
                            </div>
                        </div>

                        {/* Loading State */}
                        {isLoading && (
                            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                                {[1, 2, 3, 4, 5, 6].map((i) => (
                                    <div key={i} className="rounded-2xl overflow-hidden bg-white dark:bg-slate-900 shadow-lg">
                                        <Skeleton className="h-56 w-full" />
                                        <div className="p-5 space-y-3">
                                            <Skeleton className="h-6 w-3/4" />
                                            <Skeleton className="h-4 w-full" />
                                            <Skeleton className="h-4 w-2/3" />
                                            <Skeleton className="h-10 w-full mt-4" />
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}

                        {/* Error State */}
                        {error && (
                            <div className="text-center py-12">
                                <p className="text-red-500">Có lỗi xảy ra khi tải danh sách phòng</p>
                            </div>
                        )}

                        {/* Empty State */}
                        {!isLoading && !error && filteredRoomTypes.length === 0 && (
                            <div className="text-center py-16 bg-white dark:bg-slate-900 rounded-2xl shadow-lg">
                                <Search className="h-12 w-12 text-slate-300 mx-auto mb-4" />
                                <h3 className="text-lg font-semibold text-slate-700 dark:text-slate-300 mb-2">
                                    Không tìm thấy phòng phù hợp
                                </h3>
                                <p className="text-slate-500 dark:text-slate-400">
                                    Hãy thử điều chỉnh bộ lọc để tìm kiếm kết quả khác
                                </p>
                            </div>
                        )}

                        {/* Room Types Grid */}
                        {!isLoading && !error && filteredRoomTypes.length > 0 && (
                            <>
                                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                                    {filteredRoomTypes.map((roomType: RoomType) => (
                                        <RoomTypeCard key={roomType.id} roomType={roomType} />
                                    ))}
                                </div>

                                {/* Pagination */}
                                {meta && meta.totalPages > 1 && (
                                    <div className="flex items-center justify-center gap-4 mt-8">
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            disabled={page <= 1}
                                            onClick={() => setPage(p => p - 1)}
                                            className="gap-2"
                                        >
                                            <ChevronLeft className="h-4 w-4" />
                                            Trước
                                        </Button>
                                        <span className="text-sm text-slate-600 dark:text-slate-400">
                                            Trang {meta.page} / {meta.totalPages}
                                        </span>
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            disabled={page >= meta.totalPages}
                                            onClick={() => setPage(p => p + 1)}
                                            className="gap-2"
                                        >
                                            Sau
                                            <ChevronRight className="h-4 w-4" />
                                        </Button>
                                    </div>
                                )}
                            </>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
