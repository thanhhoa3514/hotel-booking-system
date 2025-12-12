"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { format } from "date-fns";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
    Clock,
    Calendar,
    MapPin,
    X,
    AlertCircle,
    CheckCircle2,
    Loader2,
} from "lucide-react";
import { toast } from "sonner";
import {
    serviceBookingsApi,
    ServiceBooking,
    getStatusLabel,
    getStatusColor,
} from "@/services/service-bookings.api";
import { getCategoryLabel } from "@/services/services.api";

interface MyServiceOrdersProps {
    bookingId: string;
}

export function MyServiceOrders({ bookingId }: MyServiceOrdersProps) {
    const queryClient = useQueryClient();

    const { data: orders, isLoading } = useQuery({
        queryKey: ["service-bookings", bookingId],
        queryFn: () => serviceBookingsApi.getServiceBookingsByBookingId(bookingId),
        enabled: !!bookingId,
    });

    const cancelMutation = useMutation({
        mutationFn: (id: string) =>
            serviceBookingsApi.cancelServiceBooking(id, {
                cancelReason: "Khach hang huy",
            }),
        onSuccess: () => {
            toast.success("Da huy dich vu thanh cong");
            queryClient.invalidateQueries({ queryKey: ["service-bookings"] });
            queryClient.invalidateQueries({ queryKey: ["booking"] });
        },
        onError: (error: any) => {
            toast.error("Khong the huy dich vu", {
                description: error.response?.data?.message || "Vui long thu lai sau",
            });
        },
    });

    if (isLoading) {
        return (
            <div className="space-y-4">
                {[...Array(3)].map((_, i) => (
                    <Card key={i} className="border-0 rounded-2xl">
                        <CardContent className="p-4">
                            <div className="flex gap-4">
                                <Skeleton className="h-16 w-16 rounded-xl" />
                                <div className="flex-1 space-y-2">
                                    <Skeleton className="h-5 w-1/2" />
                                    <Skeleton className="h-4 w-1/3" />
                                    <Skeleton className="h-4 w-1/4" />
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>
        );
    }

    if (!orders || orders.length === 0) {
        return (
            <Card className="border-0 shadow-lg rounded-2xl">
                <CardContent className="p-8 text-center">
                    <CheckCircle2 className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                    <h3 className="text-lg font-semibold mb-2">Chua co dich vu nao</h3>
                    <p className="text-muted-foreground">
                        Ban chua dat dich vu nao cho booking nay.
                    </p>
                </CardContent>
            </Card>
        );
    }

    const canCancel = (status: string) =>
        ["PENDING", "CONFIRMED"].includes(status);

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold">Dich vu da dat ({orders.length})</h3>
                <p className="text-sm text-muted-foreground">
                    Tong:{" "}
                    <span className="font-semibold text-foreground">
                        {new Intl.NumberFormat("vi-VN", {
                            style: "currency",
                            currency: "VND",
                        }).format(
                            orders.reduce((sum, o) => sum + Number(o.totalPrice), 0)
                        )}
                    </span>
                </p>
            </div>

            {orders.map((order) => {
                const statusColor = getStatusColor(order.status);
                return (
                    <Card
                        key={order.id}
                        className="border-0 shadow-lg shadow-slate-200/50 dark:shadow-slate-900/50 bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm rounded-2xl overflow-hidden"
                    >
                        <CardContent className="p-4">
                            <div className="flex gap-4">
                                {/* Service icon/image placeholder */}
                                <div className="h-16 w-16 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-500 flex items-center justify-center text-white text-xl font-bold shrink-0">
                                    {order.service.name.charAt(0)}
                                </div>

                                {/* Content */}
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-start justify-between gap-2">
                                        <div>
                                            <h4 className="font-semibold truncate">
                                                {order.service.name}
                                            </h4>
                                            <p className="text-xs text-muted-foreground">
                                                {getCategoryLabel(order.service.category)}
                                            </p>
                                        </div>
                                        <Badge
                                            className={`${statusColor.bg} ${statusColor.text} border-0 rounded-lg shrink-0`}
                                        >
                                            {getStatusLabel(order.status)}
                                        </Badge>
                                    </div>

                                    {/* Details */}
                                    <div className="mt-2 flex flex-wrap gap-3 text-sm text-muted-foreground">
                                        <div className="flex items-center gap-1">
                                            <Calendar className="h-3.5 w-3.5" />
                                            <span>
                                                {format(new Date(order.scheduledDate), "dd/MM/yyyy")}
                                            </span>
                                        </div>
                                        <div className="flex items-center gap-1">
                                            <Clock className="h-3.5 w-3.5" />
                                            <span>
                                                {format(new Date(order.scheduledTime), "HH:mm")}
                                            </span>
                                        </div>
                                        <div className="flex items-center gap-1">
                                            <MapPin className="h-3.5 w-3.5" />
                                            <span>Phong {order.roomNumber}</span>
                                        </div>
                                    </div>

                                    {/* Price and actions */}
                                    <div className="mt-3 flex items-center justify-between">
                                        <div>
                                            <span className="text-sm text-muted-foreground">
                                                SL: {order.quantity} x{" "}
                                            </span>
                                            <span className="font-semibold">
                                                {new Intl.NumberFormat("vi-VN", {
                                                    style: "currency",
                                                    currency: "VND",
                                                }).format(Number(order.totalPrice))}
                                            </span>
                                        </div>

                                        {canCancel(order.status) && (
                                            <AlertDialog>
                                                <AlertDialogTrigger asChild>
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        className="text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg"
                                                    >
                                                        <X className="h-4 w-4 mr-1" />
                                                        Huy
                                                    </Button>
                                                </AlertDialogTrigger>
                                                <AlertDialogContent className="rounded-2xl">
                                                    <AlertDialogHeader>
                                                        <AlertDialogTitle>Huy dich vu?</AlertDialogTitle>
                                                        <AlertDialogDescription>
                                                            Ban co chac chan muon huy dich vu "{order.service.name}"?
                                                            Chi phi se duoc hoan lai vao hoa don phong.
                                                        </AlertDialogDescription>
                                                    </AlertDialogHeader>
                                                    <AlertDialogFooter>
                                                        <AlertDialogCancel className="rounded-xl">
                                                            Khong
                                                        </AlertDialogCancel>
                                                        <AlertDialogAction
                                                            onClick={() => cancelMutation.mutate(order.id)}
                                                            className="rounded-xl bg-red-600 hover:bg-red-700"
                                                            disabled={cancelMutation.isPending}
                                                        >
                                                            {cancelMutation.isPending && (
                                                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                                            )}
                                                            Xac nhan huy
                                                        </AlertDialogAction>
                                                    </AlertDialogFooter>
                                                </AlertDialogContent>
                                            </AlertDialog>
                                        )}
                                    </div>

                                    {/* Special requests */}
                                    {order.specialRequests && (
                                        <p className="mt-2 text-xs text-muted-foreground italic border-t pt-2">
                                            Yeu cau: {order.specialRequests}
                                        </p>
                                    )}

                                    {/* Assigned staff */}
                                    {order.assignedStaff && (
                                        <p className="mt-1 text-xs text-muted-foreground">
                                            Nhan vien: {order.assignedStaff.fullName}
                                        </p>
                                    )}
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                );
            })}
        </div>
    );
}

