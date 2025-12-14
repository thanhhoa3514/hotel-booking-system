"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Loader2, HandPlatter } from "lucide-react";
import { toast } from "sonner";
import { Booking } from "@/types/booking";
import { servicesApi, Service, getCategoryLabel } from "@/services/services.api";
import { serviceBookingsApi, CreateServiceBookingDto } from "@/services/service-bookings.api";

interface AddServiceDialogProps {
    booking: Booking | null;
    open: boolean;
    onClose: () => void;
}

const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("vi-VN", {
        style: "currency",
        currency: "VND",
    }).format(amount);
};

export function AddServiceDialog({ booking, open, onClose }: AddServiceDialogProps) {
    const queryClient = useQueryClient();
    const [selectedServiceId, setSelectedServiceId] = useState("");
    const [quantity, setQuantity] = useState(1);
    const [scheduledDate, setScheduledDate] = useState(new Date().toISOString().split("T")[0]);
    const [scheduledTime, setScheduledTime] = useState("10:00");
    const [specialRequests, setSpecialRequests] = useState("");

    // Fetch services
    const { data: servicesData, isLoading: loadingServices } = useQuery({
        queryKey: ["services-for-booking"],
        queryFn: () => servicesApi.getServices({ isActive: true, limit: 100 }),
        enabled: open,
    });

    const services = servicesData?.data || [];
    const selectedService = services.find((s) => s.id === selectedServiceId);

    // Create service booking mutation
    const createMutation = useMutation({
        mutationFn: (data: CreateServiceBookingDto) =>
            serviceBookingsApi.createServiceBooking(data),
        onSuccess: () => {
            toast.success("Đã thêm dịch vụ vào đặt phòng!");
            queryClient.invalidateQueries({ queryKey: ["admin-bookings"] });
            queryClient.invalidateQueries({ queryKey: ["admin-service-bookings"] });
            handleClose();
        },
        onError: (error: any) => {
            toast.error("Không thể thêm dịch vụ", {
                description: error.response?.data?.message || "Có lỗi xảy ra",
            });
        },
    });

    const handleClose = () => {
        setSelectedServiceId("");
        setQuantity(1);
        setScheduledDate(new Date().toISOString().split("T")[0]);
        setScheduledTime("10:00");
        setSpecialRequests("");
        onClose();
    };

    const handleSubmit = () => {
        if (!booking || !selectedServiceId) return;

        createMutation.mutate({
            serviceId: selectedServiceId,
            bookingId: booking.id,
            scheduledDate,
            scheduledTime: `${scheduledDate}T${scheduledTime}:00Z`,
            quantity,
            specialRequests: specialRequests || undefined,
        });
    };

    const totalPrice = selectedService ? selectedService.basePrice * quantity : 0;

    return (
        <Dialog open={open} onOpenChange={(isOpen) => !isOpen && handleClose()}>
            <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <HandPlatter className="h-5 w-5 text-orange-500" />
                        Thêm dịch vụ
                    </DialogTitle>
                    <DialogDescription>
                        Thêm dịch vụ cho đặt phòng <strong>{booking?.bookingCode}</strong>
                        <br />
                        <span className="text-muted-foreground">
                            Khách: {booking?.guestName} - Phòng: {booking?.rooms?.[0]?.room?.roomNumber || "N/A"}
                        </span>
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-4 py-4">
                    {/* Service Selection */}
                    <div className="space-y-2">
                        <Label>Chọn dịch vụ *</Label>
                        {loadingServices ? (
                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                <Loader2 className="h-4 w-4 animate-spin" />
                                Đang tải...
                            </div>
                        ) : (
                            <Select value={selectedServiceId} onValueChange={setSelectedServiceId}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Chọn dịch vụ" />
                                </SelectTrigger>
                                <SelectContent>
                                    {services.map((service) => (
                                        <SelectItem key={service.id} value={service.id}>
                                            <div className="flex items-center justify-between gap-4">
                                                <span>{service.name}</span>
                                                <span className="text-muted-foreground text-xs">
                                                    {getCategoryLabel(service.category)} - {formatCurrency(service.basePrice)}
                                                </span>
                                            </div>
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        )}
                    </div>

                    {/* Quantity */}
                    <div className="space-y-2">
                        <Label>Số lượng</Label>
                        <Input
                            type="number"
                            min={1}
                            value={quantity}
                            onChange={(e) => setQuantity(Number(e.target.value) || 1)}
                        />
                    </div>

                    {/* Scheduled Date & Time */}
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label>Ngày</Label>
                            <Input
                                type="date"
                                value={scheduledDate}
                                onChange={(e) => setScheduledDate(e.target.value)}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label>Giờ</Label>
                            <Input
                                type="time"
                                value={scheduledTime}
                                onChange={(e) => setScheduledTime(e.target.value)}
                            />
                        </div>
                    </div>

                    {/* Special Requests */}
                    <div className="space-y-2">
                        <Label>Ghi chú</Label>
                        <Textarea
                            placeholder="Yêu cầu đặc biệt (nếu có)..."
                            value={specialRequests}
                            onChange={(e) => setSpecialRequests(e.target.value)}
                        />
                    </div>

                    {/* Total Price */}
                    {selectedService && (
                        <div className="p-4 bg-orange-50 dark:bg-orange-950/30 rounded-xl">
                            <div className="flex justify-between items-center">
                                <span className="text-sm text-muted-foreground">Tổng tiền:</span>
                                <span className="text-lg font-bold text-orange-600">
                                    {formatCurrency(totalPrice)}
                                </span>
                            </div>
                            <p className="text-xs text-muted-foreground mt-1">
                                Sẽ được tính vào hóa đơn phòng khi checkout
                            </p>
                        </div>
                    )}
                </div>

                <DialogFooter>
                    <Button variant="outline" onClick={handleClose}>
                        Hủy
                    </Button>
                    <Button
                        onClick={handleSubmit}
                        disabled={!selectedServiceId || createMutation.isPending}
                        className="bg-gradient-to-r from-orange-500 to-amber-500 text-white"
                    >
                        {createMutation.isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                        Thêm dịch vụ
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
