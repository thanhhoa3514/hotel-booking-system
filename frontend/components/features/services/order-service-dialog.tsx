"use client";

import { useState, useMemo } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { format } from "date-fns";
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
import { Calendar } from "@/components/ui/calendar";
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover";
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form";
import { CalendarIcon, Loader2, CreditCard, Clock, Users } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { Service, formatServicePrice } from "@/services/services.api";
import { serviceBookingsApi } from "@/services/service-bookings.api";
import {
    createServiceBookingSchema,
    CreateServiceBookingFormData,
} from "@/features/services/services.schema";

interface OrderServiceDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    service: Service;
    bookingId: string;
    onSuccess?: () => void;
}

export function OrderServiceDialog({
    open,
    onOpenChange,
    service,
    bookingId,
    onSuccess,
}: OrderServiceDialogProps) {
    const queryClient = useQueryClient();

    const form = useForm({
        resolver: zodResolver(createServiceBookingSchema),
        defaultValues: {
            serviceId: service.id,
            bookingId: bookingId,
            scheduledDate: format(new Date(), "yyyy-MM-dd"),
            scheduledTime: "10:00",
            quantity: 1,
            duration: service.duration || undefined,
            specialRequests: "",
        },
    });

    const quantity = form.watch("quantity");
    const duration = form.watch("duration");

    // Calculate estimated price
    const estimatedPrice = useMemo(() => {
        const basePrice = service.basePrice;
        let total = basePrice;

        switch (service.pricingType) {
            case "PER_PERSON":
                total = basePrice * (quantity || 1);
                break;
            case "PER_HOUR":
                const hours = (duration || service.duration || 60) / 60;
                total = basePrice * hours * (quantity || 1);
                break;
            case "PER_ITEM":
                total = basePrice * (quantity || 1);
                break;
            case "FIXED":
            default:
                total = basePrice;
        }

        return total;
    }, [service, quantity, duration]);

    const createMutation = useMutation({
        mutationFn: serviceBookingsApi.createServiceBooking,
        onSuccess: () => {
            toast.success("Dat dich vu thanh cong!", {
                description: "Chi phi se duoc tinh vao hoa don phong cua ban.",
            });
            queryClient.invalidateQueries({ queryKey: ["service-bookings"] });
            queryClient.invalidateQueries({ queryKey: ["booking"] });
            form.reset();
            onSuccess?.();
        },
        onError: (error: any) => {
            toast.error("Khong the dat dich vu", {
                description:
                    error.response?.data?.message || "Vui long thu lai sau.",
            });
        },
    });

    const onSubmit = (data: any) => {
        createMutation.mutate({
            ...data,
            scheduledTime: `${data.scheduledDate}T${data.scheduledTime}:00`,
        });
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-md rounded-2xl">
                <DialogHeader>
                    <DialogTitle>Dat dich vu</DialogTitle>
                    <DialogDescription>
                        {service.name} - {formatServicePrice(service.basePrice, service.pricingType)}
                    </DialogDescription>
                </DialogHeader>

                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                        {/* Date picker */}
                        <FormField
                            control={form.control}
                            name="scheduledDate"
                            render={({ field }) => (
                                <FormItem className="flex flex-col">
                                    <FormLabel>Ngay hen</FormLabel>
                                    <Popover>
                                        <PopoverTrigger asChild>
                                            <FormControl>
                                                <Button
                                                    variant="outline"
                                                    className={cn(
                                                        "w-full pl-3 text-left font-normal rounded-xl",
                                                        !field.value && "text-muted-foreground"
                                                    )}
                                                >
                                                    {field.value ? (
                                                        format(new Date(field.value), "dd/MM/yyyy")
                                                    ) : (
                                                        <span>Chon ngay</span>
                                                    )}
                                                    <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                                                </Button>
                                            </FormControl>
                                        </PopoverTrigger>
                                        <PopoverContent className="w-auto p-0" align="start">
                                            <Calendar
                                                mode="single"
                                                selected={field.value ? new Date(field.value) : undefined}
                                                onSelect={(date) =>
                                                    field.onChange(date ? format(date, "yyyy-MM-dd") : "")
                                                }
                                                disabled={(date) => date < new Date()}
                                                initialFocus
                                            />
                                        </PopoverContent>
                                    </Popover>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        {/* Time picker */}
                        <FormField
                            control={form.control}
                            name="scheduledTime"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Gio hen</FormLabel>
                                    <FormControl>
                                        <div className="relative">
                                            <Clock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                            <Input
                                                type="time"
                                                className="pl-10 rounded-xl"
                                                {...field}
                                            />
                                        </div>
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        {/* Quantity */}
                        {service.pricingType !== "FIXED" && (
                            <FormField
                                control={form.control}
                                name="quantity"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>
                                            {service.pricingType === "PER_PERSON"
                                                ? "So nguoi"
                                                : service.pricingType === "PER_ITEM"
                                                    ? "So luong"
                                                    : "So luong"}
                                        </FormLabel>
                                        <FormControl>
                                            <div className="relative">
                                                <Users className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                                <Input
                                                    type="number"
                                                    min={1}
                                                    className="pl-10 rounded-xl"
                                                    {...field}
                                                    onChange={(e) =>
                                                        field.onChange(parseInt(e.target.value) || 1)
                                                    }
                                                />
                                            </div>
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        )}

                        {/* Duration (for per-hour services) */}
                        {service.pricingType === "PER_HOUR" && (
                            <FormField
                                control={form.control}
                                name="duration"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Thoi gian (phut)</FormLabel>
                                        <FormControl>
                                            <div className="relative">
                                                <Clock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                                <Input
                                                    type="number"
                                                    min={30}
                                                    step={30}
                                                    className="pl-10 rounded-xl"
                                                    placeholder={String(service.duration || 60)}
                                                    {...field}
                                                    onChange={(e) =>
                                                        field.onChange(parseInt(e.target.value) || undefined)
                                                    }
                                                />
                                            </div>
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        )}

                        {/* Special requests */}
                        <FormField
                            control={form.control}
                            name="specialRequests"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Yeu cau dac biet (tuy chon)</FormLabel>
                                    <FormControl>
                                        <Textarea
                                            placeholder="Nhap yeu cau dac biet cua ban..."
                                            className="rounded-xl resize-none"
                                            rows={3}
                                            {...field}
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        {/* Price summary */}
                        <div className="p-4 bg-slate-100 dark:bg-slate-800 rounded-xl space-y-2">
                            <div className="flex justify-between items-center">
                                <span className="text-sm text-muted-foreground">
                                    Tong du kien
                                </span>
                                <span className="text-xl font-bold">
                                    {new Intl.NumberFormat("vi-VN", {
                                        style: "currency",
                                        currency: "VND",
                                    }).format(estimatedPrice)}
                                </span>
                            </div>
                            <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                <CreditCard className="h-3 w-3" />
                                <span>Se duoc tinh vao hoa don phong</span>
                            </div>
                        </div>

                        <DialogFooter className="gap-2">
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => onOpenChange(false)}
                                className="rounded-xl"
                            >
                                Huy
                            </Button>
                            <Button
                                type="submit"
                                disabled={createMutation.isPending}
                                className="rounded-xl bg-gradient-to-r from-blue-500 to-indigo-500"
                            >
                                {createMutation.isPending && (
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                )}
                                Xac nhan dat
                            </Button>
                        </DialogFooter>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    );
}

