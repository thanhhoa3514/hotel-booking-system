"use client";

import { Card, CardContent } from "@/components/ui/card";
import { ServiceBooking } from "@/services/service-bookings.api";

interface ServiceBookingStatsProps {
    bookings: ServiceBooking[];
}

export function ServiceBookingStats({ bookings }: ServiceBookingStatsProps) {
    const stats = [
        {
            label: "Cho xu ly",
            value: bookings.filter((b) => b.status === "PENDING").length,
            color: "text-yellow-600",
            bg: "bg-yellow-50 dark:bg-yellow-950/30",
        },
        {
            label: "Da xac nhan",
            value: bookings.filter((b) => b.status === "CONFIRMED").length,
            color: "text-orange-600",
            bg: "bg-orange-50 dark:bg-orange-950/30",
        },
        {
            label: "Dang thuc hien",
            value: bookings.filter((b) => b.status === "IN_PROGRESS").length,
            color: "text-purple-600",
            bg: "bg-purple-50 dark:bg-purple-950/30",
        },
        {
            label: "Hoan thanh",
            value: bookings.filter((b) => b.status === "COMPLETED").length,
            color: "text-green-600",
            bg: "bg-green-50 dark:bg-green-950/30",
        },
    ];

    return (
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
    );
}
