"use client";

import { format } from "date-fns";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
    DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import {
    MoreHorizontal,
    UserPlus,
    Play,
    CheckCircle,
    XCircle,
    Calendar,
    Clock,
    MapPin,
    Phone,
} from "lucide-react";
import {
    ServiceBooking,
    ServiceBookingStatus,
    getStatusLabel,
    getStatusColor,
} from "@/services/service-bookings.api";
import { getCategoryLabel } from "@/services/services.api";

interface ServiceBookingTableProps {
    bookings: ServiceBooking[];
    isLoading: boolean;
    searchQuery: string;
    onAssignStaff: (booking: ServiceBooking) => void;
    onUpdateStatus: (booking: ServiceBooking, status: ServiceBookingStatus) => void;
    onCancel: (bookingId: string) => void;
}

function getNextStatuses(current: ServiceBookingStatus): ServiceBookingStatus[] {
    const transitions: Record<ServiceBookingStatus, ServiceBookingStatus[]> = {
        PENDING: ["CONFIRMED", "CANCELLED"],
        CONFIRMED: ["IN_PROGRESS", "CANCELLED"],
        IN_PROGRESS: ["COMPLETED"],
        COMPLETED: [],
        CANCELLED: [],
        NO_SHOW: [],
    };
    return transitions[current] || [];
}

function TableSkeleton() {
    return (
        <>
            {[...Array(5)].map((_, i) => (
                <tr key={i}>
                    <td className="px-4 py-3" colSpan={7}>
                        <Skeleton className="h-12 w-full" />
                    </td>
                </tr>
            ))}
        </>
    );
}

function TableEmpty() {
    return (
        <tr>
            <td colSpan={7} className="px-4 py-8 text-center text-muted-foreground">
                Khong tim thay don dat dich vu nao
            </td>
        </tr>
    );
}

interface BookingRowProps {
    booking: ServiceBooking;
    onAssignStaff: (booking: ServiceBooking) => void;
    onUpdateStatus: (booking: ServiceBooking, status: ServiceBookingStatus) => void;
    onCancel: (bookingId: string) => void;
}

function BookingRow({ booking, onAssignStaff, onUpdateStatus, onCancel }: BookingRowProps) {
    const statusColor = getStatusColor(booking.status);
    const nextStatuses = getNextStatuses(booking.status);

    return (
        <tr className="hover:bg-slate-50 dark:hover:bg-slate-800/50">
            <td className="px-4 py-3">
                <div>
                    <p className="font-medium text-blue-600">{booking.bookingCode}</p>
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
                    <p className="text-xs text-muted-foreground">SL: {booking.quantity}</p>
                )}
            </td>
            <td className="px-4 py-3">
                {booking.assignedStaff ? (
                    <div>
                        <p className="text-sm font-medium">{booking.assignedStaff.fullName}</p>
                        <p className="text-xs text-muted-foreground">
                            {booking.assignedStaff.email}
                        </p>
                    </div>
                ) : (
                    <span className="text-sm text-muted-foreground italic">Chua phan cong</span>
                )}
            </td>
            <td className="px-4 py-3 text-center">
                <Badge className={`${statusColor.bg} ${statusColor.text} border-0 rounded-lg`}>
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
                                    onClick={() => onAssignStaff(booking)}
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
                                                onCancel(booking.id);
                                            } else {
                                                onUpdateStatus(booking, status);
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
}

export function ServiceBookingTable({
    bookings,
    isLoading,
    searchQuery,
    onAssignStaff,
    onUpdateStatus,
    onCancel,
}: ServiceBookingTableProps) {
    const filteredBookings = bookings.filter(
        (b) =>
            b.bookingCode.toLowerCase().includes(searchQuery.toLowerCase()) ||
            b.guestName.toLowerCase().includes(searchQuery.toLowerCase()) ||
            b.service.name.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
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
                            <TableSkeleton />
                        ) : filteredBookings.length === 0 ? (
                            <TableEmpty />
                        ) : (
                            filteredBookings.map((booking) => (
                                <BookingRow
                                    key={booking.id}
                                    booking={booking}
                                    onAssignStaff={onAssignStaff}
                                    onUpdateStatus={onUpdateStatus}
                                    onCancel={onCancel}
                                />
                            ))
                        )}
                    </tbody>
                </table>
            </div>
        </Card>
    );
}
