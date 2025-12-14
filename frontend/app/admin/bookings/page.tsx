"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Plus, Loader2 } from "lucide-react";
import { BookingStats } from "./components/BookingStats";
import { BookingFilters } from "./components/BookingFilters";
import { BookingTable } from "./components/BookingTable";
import { AddServiceDialog } from "./components/AddServiceDialog";
import { Booking, BookingStatus } from "@/types/booking";
import { bookingsApi } from "@/services/bookings.api";
import { toast } from "sonner";
import { Skeleton } from "@/components/ui/skeleton";

export default function AdminBookingsPage() {
    const queryClient = useQueryClient();
    const [searchQuery, setSearchQuery] = useState("");
    const [statusFilter, setStatusFilter] = useState("all");
    const [page, setPage] = useState(1);
    const [addServiceBooking, setAddServiceBooking] = useState<Booking | null>(null);
    const limit = 20;

    // Fetch bookings from API
    const { data: bookingsData, isLoading, error } = useQuery({
        queryKey: ["admin-bookings", statusFilter, page],
        queryFn: () => bookingsApi.getBookings({
            status: statusFilter !== "all" ? statusFilter : undefined,
            page,
            limit,
        }),
    });

    // Cancel booking mutation
    const cancelMutation = useMutation({
        mutationFn: ({ id, reason }: { id: string; reason: string }) =>
            bookingsApi.cancelBooking(id, reason),
        onSuccess: () => {
            toast.success("Đã hủy đặt phòng!");
            queryClient.invalidateQueries({ queryKey: ["admin-bookings"] });
        },
        onError: (error: any) => {
            toast.error("Lỗi", {
                description: error.response?.data?.message || "Không thể hủy đặt phòng",
            });
        },
    });

    // Update status mutation
    const updateStatusMutation = useMutation({
        mutationFn: ({ id, status }: { id: string; status: string }) =>
            bookingsApi.updateBookingStatus(id, status),
        onSuccess: () => {
            toast.success("Đã cập nhật trạng thái!");
            queryClient.invalidateQueries({ queryKey: ["admin-bookings"] });
        },
        onError: (error: any) => {
            toast.error("Lỗi", {
                description: error.response?.data?.message || "Không thể cập nhật trạng thái",
            });
        },
    });

    const bookings = bookingsData?.data || [];

    // Handlers
    const handleView = (booking: Booking) => {
        console.log("View booking", booking);
        // TODO: Open view dialog
    };

    const handleEdit = (booking: Booking) => {
        console.log("Edit booking", booking);
        // TODO: Open edit dialog
    };

    const handleCancel = (booking: Booking) => {
        if (confirm(`Bạn có chắc muốn hủy đặt phòng ${booking.bookingCode}?`)) {
            cancelMutation.mutate({ id: booking.id, reason: "Cancelled by admin" });
        }
    };

    const handleApprove = (booking: Booking) => {
        updateStatusMutation.mutate({ id: booking.id, status: "CONFIRMED" });
    };

    const handleAddService = (booking: Booking) => {
        setAddServiceBooking(booking);
    };

    // Client-side search filter (for search within loaded data)
    const filteredBookings = bookings.filter((booking) => {
        if (!searchQuery) return true;
        const matchesSearch =
            booking.guestName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            booking.bookingCode?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            booking.rooms?.some(r => r.room?.roomNumber?.includes(searchQuery));
        return matchesSearch;
    });

    // Loading skeleton
    if (isLoading) {
        return (
            <div className="space-y-6">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div>
                        <h1 className="text-3xl font-bold bg-gradient-to-r from-slate-900 to-slate-600 dark:from-white dark:to-slate-400 bg-clip-text text-transparent">
                            Quản lý đặt phòng
                        </h1>
                        <p className="text-muted-foreground mt-1">
                            Theo dõi và quản lý tất cả đặt phòng khách sạn
                        </p>
                    </div>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {[...Array(4)].map((_, i) => (
                        <Skeleton key={i} className="h-24 rounded-xl" />
                    ))}
                </div>

                <Skeleton className="h-12 rounded-xl" />

                <div className="space-y-2">
                    {[...Array(5)].map((_, i) => (
                        <Skeleton key={i} className="h-16 rounded-lg" />
                    ))}
                </div>
            </div>
        );
    }

    // Error state
    if (error) {
        return (
            <div className="space-y-6">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div>
                        <h1 className="text-3xl font-bold bg-gradient-to-r from-slate-900 to-slate-600 dark:from-white dark:to-slate-400 bg-clip-text text-transparent">
                            Quản lý đặt phòng
                        </h1>
                    </div>
                </div>
                <div className="flex flex-col items-center justify-center py-12 text-center">
                    <p className="text-red-500 mb-4">Có lỗi xảy ra khi tải dữ liệu</p>
                    <Button
                        variant="outline"
                        onClick={() => queryClient.invalidateQueries({ queryKey: ["admin-bookings"] })}
                    >
                        Thử lại
                    </Button>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Page Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold bg-gradient-to-r from-slate-900 to-slate-600 dark:from-white dark:to-slate-400 bg-clip-text text-transparent">
                        Quản lý đặt phòng
                    </h1>
                    <p className="text-muted-foreground mt-1">
                        Theo dõi và quản lý tất cả đặt phòng khách sạn
                    </p>
                </div>
                <Button className="rounded-xl bg-gradient-to-r from-orange-500 to-amber-500 text-white shadow-lg shadow-orange-500/30">
                    <Plus className="h-4 w-4 mr-2" />
                    Tạo đặt phòng
                </Button>
            </div>

            {/* Stats / Tabs */}
            <BookingStats
                bookings={bookings}
                activeStatus={statusFilter}
                onStatusChange={setStatusFilter}
            />

            {/* Filters */}
            <BookingFilters
                searchQuery={searchQuery}
                onSearchChange={setSearchQuery}
            />

            {/* Table */}
            <BookingTable
                bookings={filteredBookings}
                onView={handleView}
                onEdit={handleEdit}
                onCancel={handleCancel}
                onApprove={handleApprove}
                onAddService={handleAddService}
            />

            {/* Add Service Dialog */}
            <AddServiceDialog
                booking={addServiceBooking}
                open={!!addServiceBooking}
                onClose={() => setAddServiceBooking(null)}
            />

            {/* Pagination info */}
            {bookingsData?.meta && (
                <div className="flex items-center justify-between text-sm text-muted-foreground">
                    <span>
                        Hiển thị {filteredBookings.length} / {bookingsData.meta.total} đặt phòng
                    </span>
                    {bookingsData.meta.totalPages > 1 && (
                        <div className="flex gap-2">
                            <Button
                                variant="outline"
                                size="sm"
                                disabled={page <= 1}
                                onClick={() => setPage(p => p - 1)}
                            >
                                Trước
                            </Button>
                            <span className="flex items-center px-2">
                                Trang {page} / {bookingsData.meta.totalPages}
                            </span>
                            <Button
                                variant="outline"
                                size="sm"
                                disabled={page >= bookingsData.meta.totalPages}
                                onClick={() => setPage(p => p + 1)}
                            >
                                Sau
                            </Button>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
