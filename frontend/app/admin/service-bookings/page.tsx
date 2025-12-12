"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { format } from "date-fns";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
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
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
    DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
    Search,
    MoreHorizontal,
    UserPlus,
    Play,
    CheckCircle,
    XCircle,
    Loader2,
    Calendar,
    Clock,
    MapPin,
    Phone,
} from "lucide-react";
import { toast } from "sonner";
import {
    serviceBookingsApi,
    ServiceBooking,
    ServiceBookingStatus,
    getStatusLabel,
    getStatusColor,
} from "@/services/service-bookings.api";
import { getCategoryLabel } from "@/services/services.api";
import { usersApi } from "@/services/users.api";

const statuses: ServiceBookingStatus[] = [
    "PENDING",
    "CONFIRMED",
    "IN_PROGRESS",
    "COMPLETED",
    "CANCELLED",
];

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
    );

    const assignMutation = useMutation({
        mutationFn: ({ id, data }: { id: string; data: { assignedStaffId: string; staffNotes?: string } }) =>
            serviceBookingsApi.assignStaff(id, data),
        onSuccess: () => {
            toast.success("Phan cong nhan vien thanh cong");
            queryClient.invalidateQueries({ queryKey: ["admin-service-bookings"] });
            setAssigningBooking(null);
            setSelectedStaffId("");
            setStaffNotes("");
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
            setUpdatingStatusBooking(null);
            setNewStatus("CONFIRMED");
            setStaffNotes("");
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

    const getNextStatuses = (current: ServiceBookingStatus): ServiceBookingStatus[] => {
        const transitions: Record<ServiceBookingStatus, ServiceBookingStatus[]> = {
            PENDING: ["CONFIRMED", "CANCELLED"],
            CONFIRMED: ["IN_PROGRESS", "CANCELLED"],
            IN_PROGRESS: ["COMPLETED"],
            COMPLETED: [],
            CANCELLED: [],
            NO_SHOW: [],
        };
        return transitions[current] || [];
    };

    // Stats
    const stats = [
        {
            label: "Cho xu ly",
            value: data?.data.filter((b) => b.status === "PENDING").length || 0,
            color: "text-yellow-600",
            bg: "bg-yellow-50 dark:bg-yellow-950/30",
        },
        {
            label: "Da xac nhan",
            value: data?.data.filter((b) => b.status === "CONFIRMED").length || 0,
            color: "text-blue-600",
            bg: "bg-blue-50 dark:bg-blue-950/30",
        },
        {
            label: "Dang thuc hien",
            value: data?.data.filter((b) => b.status === "IN_PROGRESS").length || 0,
            color: "text-purple-600",
            bg: "bg-purple-50 dark:bg-purple-950/30",
        },
        {
            label: "Hoan thanh",
            value: data?.data.filter((b) => b.status === "COMPLETED").length || 0,
            color: "text-emerald-600",
            bg: "bg-emerald-50 dark:bg-emerald-950/30",
        },
    ];

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
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {stats.map((stat, i) => (
                    <Card key={i} className={`border-0 shadow-md rounded-xl ${stat.bg}`}>
                        <CardContent className="p-4 text-center">
                            <p className={`text-3xl font-bold ${stat.color}`}>{stat.value}</p>
                            <p className="text-sm text-muted-foreground">{stat.label}</p>
                        </CardContent>
                    </Card>
                ))}
            </div>

            {/* Filters */}
            <Card className="border-0 shadow-lg rounded-2xl">
                <CardContent className="p-4">
                    <div className="flex flex-col sm:flex-row gap-4">
                        <div className="relative flex-1">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                            <Input
                                placeholder="Tim theo ma dat, ten khach..."
                                className="pl-10 rounded-xl border-0 bg-slate-100 dark:bg-slate-800"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />
                        </div>
                        <Select value={statusFilter} onValueChange={setStatusFilter}>
                            <SelectTrigger className="w-full sm:w-40 rounded-xl border-0 bg-slate-100 dark:bg-slate-800">
                                <SelectValue placeholder="Trang thai" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">Tat ca</SelectItem>
                                {statuses.map((status) => (
                                    <SelectItem key={status} value={status}>
                                        {getStatusLabel(status)}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                        <Input
                            type="date"
                            className="w-full sm:w-40 rounded-xl border-0 bg-slate-100 dark:bg-slate-800"
                            value={dateFilter}
                            onChange={(e) => setDateFilter(e.target.value)}
                        />
                    </div>
                </CardContent>
            </Card>

            {/* Bookings Table */}
            <Card className="border-0 shadow-lg rounded-2xl overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-slate-50 dark:bg-slate-800/50">
                            <tr>
                                <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">
                                    Ma don / Dich vu
                                </th>
                                <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">
                                    Khach hang
                                </th>
                                <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">
                                    Lich hen
                                </th>
                                <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">
                                    Nhan vien
                                </th>
                                <th className="px-4 py-3 text-center text-sm font-medium text-muted-foreground">
                                    Trang thai
                                </th>
                                <th className="px-4 py-3 text-right text-sm font-medium text-muted-foreground">
                                    Gia
                                </th>
                                <th className="px-4 py-3 text-right text-sm font-medium text-muted-foreground">
                                    Thao tac
                                </th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                            {isLoading ? (
                                [...Array(5)].map((_, i) => (
                                    <tr key={i}>
                                        <td className="px-4 py-3" colSpan={7}>
                                            <Skeleton className="h-12 w-full" />
                                        </td>
                                    </tr>
                                ))
                            ) : data?.data.length === 0 ? (
                                <tr>
                                    <td colSpan={7} className="px-4 py-8 text-center text-muted-foreground">
                                        Khong tim thay don dat dich vu nao
                                    </td>
                                </tr>
                            ) : (
                                data?.data
                                    .filter(
                                        (b) =>
                                            b.bookingCode.toLowerCase().includes(searchQuery.toLowerCase()) ||
                                            b.guestName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                                            b.service.name.toLowerCase().includes(searchQuery.toLowerCase())
                                    )
                                    .map((booking) => {
                                        const statusColor = getStatusColor(booking.status);
                                        const nextStatuses = getNextStatuses(booking.status);
                                        return (
                                            <tr
                                                key={booking.id}
                                                className="hover:bg-slate-50 dark:hover:bg-slate-800/50"
                                            >
                                                <td className="px-4 py-3">
                                                    <div>
                                                        <p className="font-medium text-blue-600">
                                                            {booking.bookingCode}
                                                        </p>
                                                        <p className="text-sm">{booking.service.name}</p>
                                                        <p className="text-xs text-muted-foreground">
                                                            {getCategoryLabel(booking.service.category)}
                                                        </p>
                                                    </div>
                                                </td>
                                                <td className="px-4 py-3">
                                                    <div>
                                                        <p className="font-medium">{booking.guestName}</p>
                                                        <div className="flex items-center gap-1 text-xs text-muted-foreground">
                                                            <Phone className="h-3 w-3" />
                                                            {booking.guestPhone}
                                                        </div>
                                                        <div className="flex items-center gap-1 text-xs text-muted-foreground">
                                                            <MapPin className="h-3 w-3" />
                                                            Phong {booking.roomNumber}
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-4 py-3">
                                                    <div className="flex items-center gap-1 text-sm">
                                                        <Calendar className="h-3.5 w-3.5 text-muted-foreground" />
                                                        {format(new Date(booking.scheduledDate), "dd/MM/yyyy")}
                                                    </div>
                                                    <div className="flex items-center gap-1 text-sm text-muted-foreground">
                                                        <Clock className="h-3.5 w-3.5" />
                                                        {format(new Date(booking.scheduledTime), "HH:mm")}
                                                    </div>
                                                    {booking.quantity > 1 && (
                                                        <p className="text-xs text-muted-foreground">
                                                            SL: {booking.quantity}
                                                        </p>
                                                    )}
                                                </td>
                                                <td className="px-4 py-3">
                                                    {booking.assignedStaff ? (
                                                        <div>
                                                            <p className="text-sm font-medium">
                                                                {booking.assignedStaff.fullName}
                                                            </p>
                                                            <p className="text-xs text-muted-foreground">
                                                                {booking.assignedStaff.email}
                                                            </p>
                                                        </div>
                                                    ) : (
                                                        <span className="text-sm text-muted-foreground italic">
                                                            Chua phan cong
                                                        </span>
                                                    )}
                                                </td>
                                                <td className="px-4 py-3 text-center">
                                                    <Badge
                                                        className={`${statusColor.bg} ${statusColor.text} border-0 rounded-lg`}
                                                    >
                                                        {getStatusLabel(booking.status)}
                                                    </Badge>
                                                </td>
                                                <td className="px-4 py-3 text-right">
                                                    <p className="font-semibold">
                                                        {new Intl.NumberFormat("vi-VN", {
                                                            style: "currency",
                                                            currency: "VND",
                                                        }).format(Number(booking.totalPrice))}
                                                    </p>
                                                </td>
                                                <td className="px-4 py-3 text-right">
                                                    <DropdownMenu>
                                                        <DropdownMenuTrigger asChild>
                                                            <Button variant="ghost" size="sm" className="rounded-lg">
                                                                <MoreHorizontal className="h-4 w-4" />
                                                            </Button>
                                                        </DropdownMenuTrigger>
                                                        <DropdownMenuContent align="end" className="rounded-xl">
                                                            {!booking.assignedStaff &&
                                                                ["PENDING", "CONFIRMED"].includes(booking.status) && (
                                                                    <DropdownMenuItem
                                                                        onClick={() => setAssigningBooking(booking)}
                                                                        className="cursor-pointer"
                                                                    >
                                                                        <UserPlus className="h-4 w-4 mr-2" />
                                                                        Phan cong nhan vien
                                                                    </DropdownMenuItem>
                                                                )}
                                                            {nextStatuses.length > 0 && (
                                                                <>
                                                                    <DropdownMenuSeparator />
                                                                    {nextStatuses.map((status) => (
                                                                        <DropdownMenuItem
                                                                            key={status}
                                                                            onClick={() => {
                                                                                if (status === "CANCELLED") {
                                                                                    cancelMutation.mutate(booking.id);
                                                                                } else {
                                                                                    setUpdatingStatusBooking(booking);
                                                                                    setNewStatus(status);
                                                                                }
                                                                            }}
                                                                            className="cursor-pointer"
                                                                        >
                                                                            {status === "IN_PROGRESS" && (
                                                                                <Play className="h-4 w-4 mr-2" />
                                                                            )}
                                                                            {status === "COMPLETED" && (
                                                                                <CheckCircle className="h-4 w-4 mr-2" />
                                                                            )}
                                                                            {status === "CANCELLED" && (
                                                                                <XCircle className="h-4 w-4 mr-2 text-red-600" />
                                                                            )}
                                                                            {status === "CONFIRMED" && (
                                                                                <CheckCircle className="h-4 w-4 mr-2" />
                                                                            )}
                                                                            {getStatusLabel(status)}
                                                                        </DropdownMenuItem>
                                                                    ))}
                                                                </>
                                                            )}
                                                        </DropdownMenuContent>
                                                    </DropdownMenu>
                                                </td>
                                            </tr>
                                        );
                                    })
                            )}
                        </tbody>
                    </table>
                </div>
            </Card>

            {/* Assign Staff Dialog */}
            <Dialog open={!!assigningBooking} onOpenChange={() => setAssigningBooking(null)}>
                <DialogContent className="sm:max-w-md rounded-2xl">
                    <DialogHeader>
                        <DialogTitle>Phan cong nhan vien</DialogTitle>
                        <DialogDescription>
                            Phan cong nhan vien xu ly don dich vu {assigningBooking?.bookingCode}
                        </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4">
                        <div className="space-y-2">
                            <Label>Chon nhan vien</Label>
                            <Select value={selectedStaffId} onValueChange={setSelectedStaffId}>
                                <SelectTrigger className="rounded-xl">
                                    <SelectValue placeholder="Chon nhan vien" />
                                </SelectTrigger>
                                <SelectContent>
                                    {staffUsers?.map((user) => (
                                        <SelectItem key={user.id} value={user.id}>
                                            {user.fullName} ({user.role?.name})
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-2">
                            <Label>Ghi chu (tuy chon)</Label>
                            <Textarea
                                placeholder="Ghi chu cho nhan vien..."
                                className="rounded-xl resize-none"
                                rows={3}
                                value={staffNotes}
                                onChange={(e) => setStaffNotes(e.target.value)}
                            />
                        </div>
                    </div>
                    <DialogFooter className="gap-2">
                        <Button
                            variant="outline"
                            onClick={() => setAssigningBooking(null)}
                            className="rounded-xl"
                        >
                            Huy
                        </Button>
                        <Button
                            onClick={() =>
                                assigningBooking &&
                                assignMutation.mutate({
                                    id: assigningBooking.id,
                                    data: { assignedStaffId: selectedStaffId, staffNotes: staffNotes || undefined },
                                })
                            }
                            disabled={!selectedStaffId || assignMutation.isPending}
                            className="rounded-xl bg-gradient-to-r from-blue-500 to-indigo-500"
                        >
                            {assignMutation.isPending && (
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            )}
                            Phan cong
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Update Status Dialog */}
            <Dialog
                open={!!updatingStatusBooking}
                onOpenChange={() => setUpdatingStatusBooking(null)}
            >
                <DialogContent className="sm:max-w-md rounded-2xl">
                    <DialogHeader>
                        <DialogTitle>Cap nhat trang thai</DialogTitle>
                        <DialogDescription>
                            Cap nhat trang thai don {updatingStatusBooking?.bookingCode} thanh "{getStatusLabel(newStatus)}"
                        </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4">
                        <div className="space-y-2">
                            <Label>Ghi chu nhan vien (tuy chon)</Label>
                            <Textarea
                                placeholder="Ghi chu..."
                                className="rounded-xl resize-none"
                                rows={3}
                                value={staffNotes}
                                onChange={(e) => setStaffNotes(e.target.value)}
                            />
                        </div>
                    </div>
                    <DialogFooter className="gap-2">
                        <Button
                            variant="outline"
                            onClick={() => setUpdatingStatusBooking(null)}
                            className="rounded-xl"
                        >
                            Huy
                        </Button>
                        <Button
                            onClick={() =>
                                updatingStatusBooking &&
                                updateStatusMutation.mutate({
                                    id: updatingStatusBooking.id,
                                    data: { status: newStatus, staffNotes: staffNotes || undefined },
                                })
                            }
                            disabled={updateStatusMutation.isPending}
                            className="rounded-xl bg-gradient-to-r from-blue-500 to-indigo-500"
                        >
                            {updateStatusMutation.isPending && (
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            )}
                            Cap nhat
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}

