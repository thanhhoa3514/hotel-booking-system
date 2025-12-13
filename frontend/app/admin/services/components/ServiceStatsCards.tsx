"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Service } from "@/services/services.api";

interface ServiceStatsCardsProps {
    services: Service[];
    total: number;
}

export function ServiceStatsCards({ services, total }: ServiceStatsCardsProps) {
    const stats = [
        {
            label: "Tong dich vu",
            value: total,
            color: "text-blue-600",
            bg: "bg-blue-50 dark:bg-blue-950/30",
        },
        {
            label: "Dang hoat dong",
            value: services.filter((s) => s.isActive).length,
            color: "text-emerald-600",
            bg: "bg-emerald-50 dark:bg-emerald-950/30",
        },
        {
            label: "Tam dung",
            value: services.filter((s) => !s.isActive).length,
            color: "text-amber-600",
            bg: "bg-amber-50 dark:bg-amber-950/30",
        },
        {
            label: "Can dat truoc",
            value: services.filter((s) => s.requiresBooking).length,
            color: "text-purple-600",
            bg: "bg-purple-50 dark:bg-purple-950/30",
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
