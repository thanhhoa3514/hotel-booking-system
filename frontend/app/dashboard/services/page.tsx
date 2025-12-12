"use client";

import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { AlertCircle, ShoppingBag, Sparkles } from "lucide-react";
import { bookingsApi } from "@/services/bookings.api";
import { ServiceCatalog, MyServiceOrders } from "@/components/features/services";

export default function DashboardServicesPage() {
    const [activeTab, setActiveTab] = useState("catalog");
    const [selectedBookingId, setSelectedBookingId] = useState<string>("");

    // Get user's bookings that are CHECKED_IN
    const { data: bookingsData, isLoading: bookingsLoading } = useQuery({
        queryKey: ["my-bookings", "CHECKED_IN"],
        queryFn: () => bookingsApi.getBookings({ status: "CHECKED_IN" }),
    });

    const checkedInBookings = bookingsData?.data || [];
    const hasActiveBooking = checkedInBookings.length > 0;

    // Auto-select first booking if available
    useEffect(() => {
        if (hasActiveBooking && !selectedBookingId && checkedInBookings[0]) {
            setSelectedBookingId(checkedInBookings[0].id);
        }
    }, [hasActiveBooking, selectedBookingId, checkedInBookings]);

    return (
        <div className="space-y-6">
            {/* Page Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold bg-gradient-to-r from-slate-900 to-slate-600 dark:from-white dark:to-slate-400 bg-clip-text text-transparent">
                        Dich vu khach san
                    </h1>
                    <p className="text-muted-foreground mt-1">
                        Dat va quan ly cac dich vu trong thoi gian luu tru
                    </p>
                </div>

                {/* Booking Selector */}
                {hasActiveBooking && (
                    <div className="flex items-center gap-2">
                        <span className="text-sm text-muted-foreground">Booking:</span>
                        <Select value={selectedBookingId} onValueChange={setSelectedBookingId}>
                            <SelectTrigger className="w-48 rounded-xl">
                                <SelectValue placeholder="Chon booking" />
                            </SelectTrigger>
                            <SelectContent>
                                {checkedInBookings.map((booking) => (
                                    <SelectItem key={booking.id} value={booking.id}>
                                        {booking.bookingCode} - Phong{" "}
                                        {booking.rooms?.map((r) => r.room?.roomNumber).join(", ")}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                )}
            </div>

            {/* Loading State */}
            {bookingsLoading && (
                <div className="space-y-4">
                    <Skeleton className="h-12 w-full rounded-xl" />
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        {[...Array(6)].map((_, i) => (
                            <Skeleton key={i} className="h-64 rounded-2xl" />
                        ))}
                    </div>
                </div>
            )}

            {/* No Active Booking Warning */}
            {!bookingsLoading && !hasActiveBooking && (
                <Card className="border-0 shadow-lg rounded-2xl bg-amber-50 dark:bg-amber-900/20">
                    <CardContent className="p-6 flex items-start gap-4">
                        <div className="p-3 bg-amber-100 dark:bg-amber-900/30 rounded-xl">
                            <AlertCircle className="h-6 w-6 text-amber-600 dark:text-amber-400" />
                        </div>
                        <div>
                            <h3 className="font-semibold text-amber-900 dark:text-amber-100">
                                Khong co booking dang check-in
                            </h3>
                            <p className="text-sm text-amber-700 dark:text-amber-300 mt-1">
                                Ban can co booking da check-in de co the dat dich vu. Vui long lien he le tan
                                de check-in hoac dat phong moi.
                            </p>
                        </div>
                    </CardContent>
                </Card>
            )}

            {/* Main Content */}
            {!bookingsLoading && hasActiveBooking && (
                <Tabs value={activeTab} onValueChange={setActiveTab}>
                    <TabsList className="w-full sm:w-auto bg-slate-100 dark:bg-slate-800 p-1 rounded-xl">
                        <TabsTrigger
                            value="catalog"
                            className="rounded-lg data-[state=active]:bg-white dark:data-[state=active]:bg-slate-900"
                        >
                            <Sparkles className="h-4 w-4 mr-2" />
                            Danh muc dich vu
                        </TabsTrigger>
                        <TabsTrigger
                            value="orders"
                            className="rounded-lg data-[state=active]:bg-white dark:data-[state=active]:bg-slate-900"
                        >
                            <ShoppingBag className="h-4 w-4 mr-2" />
                            Don dat cua toi
                        </TabsTrigger>
                    </TabsList>

                    <TabsContent value="catalog" className="mt-6">
                        <ServiceCatalog
                            bookingId={selectedBookingId}
                            onOrderSuccess={() => setActiveTab("orders")}
                        />
                    </TabsContent>

                    <TabsContent value="orders" className="mt-6">
                        <MyServiceOrders bookingId={selectedBookingId} />
                    </TabsContent>
                </Tabs>
            )}

            {/* Browse Services (even without booking) */}
            {!bookingsLoading && !hasActiveBooking && (
                <div className="mt-6">
                    <Card className="border-0 shadow-lg rounded-2xl mb-6">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Sparkles className="h-5 w-5" />
                                Kham pha dich vu
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="text-muted-foreground mb-4">
                                Ban van co the xem cac dich vu co san tai khach san. De dat dich vu,
                                vui long check-in truoc.
                            </p>
                        </CardContent>
                    </Card>
                    <ServiceCatalog />
                </div>
            )}
        </div>
    );
}

