"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
    serviceBookingsApi,
    ServiceBooking,
    ServiceBookingStatus,
} from "@/services/service-bookings.api";
import { usersApi } from "@/services/users.api";
import {
    ServiceBookingStats,
    ServiceBookingFilters,
    ServiceBookingTable,
    AssignStaffDialog,
    UpdateStatusDialog,
} from "./components";

export default function AdminServiceBookingsPage() {
    const queryClient = useQueryClient();
    const [searchQuery, setSearchQuery] = useState("");
    const [statusFilter, setStatusFilter] = useState<string>("all");
    const [dateFilter, setDateFilter] = useState<string>("");

    // Dialog states
    const [assigningBooking, setAssigningBooking] = useState<ServiceBooking | null>(null);
    const [updatingStatusBooking, setUpdatingStatusBooking] = useState<ServiceBooking | null>(null);
    const [selectedStaffId, setSelectedStaffId] = useState("");
    const [staffNotes, setStaffNotes] = useState("");
    const [newStatus, setNewStatus] = useState<ServiceBookingStatus>("CONFIRMED");

    const { data, isLoading } = useQuery({
        queryKey: ["admin-service-bookings", statusFilter, dateFilter],
        queryFn: () =>
            serviceBookingsApi.getServiceBookings({
                status: statusFilter === "all" ? undefined : (statusFilter as ServiceBookingStatus),
                scheduledDate: dateFilter || undefined,
                limit: 100,
            }),
    });

    // Get staff users for assignment
    const { data: staffData } = useQuery({
        queryKey: ["staff-users"],
        queryFn: () => usersApi.getUsers({ limit: 100 }),
    });

    const staffUsers = staffData?.data.filter((u) =>
        ["RECEPTIONIST", "HOUSEKEEPING", "MANAGER"].includes(u.role?.name || "")
    ) || [];

    const assignMutation = useMutation({
        mutationFn: ({ id, data }: { id: string; data: { assignedStaffId: string; staffNotes?: string } }) =>
            serviceBookingsApi.assignStaff(id, data),
        onSuccess: () => {
            toast.success("Phan cong nhan vien thanh cong");
            queryClient.invalidateQueries({ queryKey: ["admin-service-bookings"] });
            handleCloseAssignDialog();
        },
        onError: (error: any) => {
            toast.error("Khong the phan cong", {
                description: error.response?.data?.message,
            });
        },
    });

    const updateStatusMutation = useMutation({
        mutationFn: ({ id, data }: { id: string; data: { status: ServiceBookingStatus; staffNotes?: string } }) =>
            serviceBookingsApi.updateServiceBookingStatus(id, data),
        onSuccess: () => {
            toast.success("Cap nhat trang thai thanh cong");
            queryClient.invalidateQueries({ queryKey: ["admin-service-bookings"] });
            handleCloseUpdateStatusDialog();
        },
        onError: (error: any) => {
            toast.error("Khong the cap nhat trang thai", {
                description: error.response?.data?.message,
            });
        },
    });

    const cancelMutation = useMutation({
        mutationFn: (id: string) =>
            serviceBookingsApi.cancelServiceBooking(id, { cancelReason: "Huy boi nhan vien" }),
        onSuccess: () => {
            toast.success("Huy dich vu thanh cong");
            queryClient.invalidateQueries({ queryKey: ["admin-service-bookings"] });
        },
        onError: (error: any) => {
            toast.error("Khong the huy", {
                description: error.response?.data?.message,
            });
        },
    });

    const handleCloseAssignDialog = () => {
        setAssigningBooking(null);
        setSelectedStaffId("");
        setStaffNotes("");
    };

    const handleCloseUpdateStatusDialog = () => {
        setUpdatingStatusBooking(null);
        setNewStatus("CONFIRMED");
        setStaffNotes("");
    };

    const handleAssignConfirm = () => {
        if (assigningBooking) {
            assignMutation.mutate({
                id: assigningBooking.id,
                data: { assignedStaffId: selectedStaffId, staffNotes: staffNotes || undefined },
            });
        }
    };

    const handleUpdateStatusConfirm = () => {
        if (updatingStatusBooking) {
            updateStatusMutation.mutate({
                id: updatingStatusBooking.id,
                data: { status: newStatus, staffNotes: staffNotes || undefined },
            });
        }
    };

    const handleUpdateStatus = (booking: ServiceBooking, status: ServiceBookingStatus) => {
        setUpdatingStatusBooking(booking);
        setNewStatus(status);
    };

    return (
        <div className="space-y-6">
            {/* Page Header */}
            <div>
                <h1 className="text-3xl font-bold bg-gradient-to-r from-slate-900 to-slate-600 dark:from-white dark:to-slate-400 bg-clip-text text-transparent">
                    Quan ly dat dich vu
                </h1>
                <p className="text-muted-foreground mt-1">
                    Quan ly cac don dat dich vu cua khach hang
                </p>
            </div>

            {/* Stats */}
            <ServiceBookingStats bookings={data?.data || []} />

            {/* Filters */}
            <ServiceBookingFilters
                searchQuery={searchQuery}
                statusFilter={statusFilter}
                dateFilter={dateFilter}
                onSearchChange={setSearchQuery}
                onStatusChange={setStatusFilter}
                onDateChange={setDateFilter}
            />

            {/* Bookings Table */}
            <ServiceBookingTable
                bookings={data?.data || []}
                isLoading={isLoading}
                searchQuery={searchQuery}
                onAssignStaff={setAssigningBooking}
                onUpdateStatus={handleUpdateStatus}
                onCancel={(id) => cancelMutation.mutate(id)}
            />

            {/* Assign Staff Dialog */}
            <AssignStaffDialog
                booking={assigningBooking}
                staffUsers={staffUsers}
                selectedStaffId={selectedStaffId}
                staffNotes={staffNotes}
                isAssigning={assignMutation.isPending}
                onStaffIdChange={setSelectedStaffId}
                onStaffNotesChange={setStaffNotes}
                onClose={handleCloseAssignDialog}
                onConfirm={handleAssignConfirm}
            />

            {/* Update Status Dialog */}
            <UpdateStatusDialog
                booking={updatingStatusBooking}
                newStatus={newStatus}
                staffNotes={staffNotes}
                isUpdating={updateStatusMutation.isPending}
                onStaffNotesChange={setStaffNotes}
                onClose={handleCloseUpdateStatusDialog}
                onConfirm={handleUpdateStatusConfirm}
            />
        </div>
    );
}
