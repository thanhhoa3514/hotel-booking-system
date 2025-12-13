"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Room } from "@/types/room";

interface RoomStatsCardsProps {
    rooms: Room[];
}

export function RoomStatsCards({ rooms }: RoomStatsCardsProps) {
    const stats = [
        {
            label: "Tổng phòng",
            value: rooms.length,
            color: "text-blue-600",
            bg: "bg-blue-50 dark:bg-blue-950/30",
        },
        {
            label: "Trống",
            value: rooms.filter((r) => r.status === "AVAILABLE").length,
            color: "text-emerald-600",
            bg: "bg-emerald-50 dark:bg-emerald-950/30",
        },
        {
            label: "Đang sử dụng",
            value: rooms.filter((r) => r.status === "OCCUPIED").length,
            color: "text-amber-600",
            bg: "bg-amber-50 dark:bg-amber-950/30",
        },
        {
            label: "Bảo trì",
            value: rooms.filter((r) => r.status === "MAINTENANCE").length,
            color: "text-red-600",
            bg: "bg-red-50 dark:bg-red-950/30",
        },
    ];

    return (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {stats.map((stat, index) => (
                <Card key={index} className={`border-0 shadow-md rounded-xl ${stat.bg}`}>
                    <CardContent className="p-4 text-center">
                        <p className={`text-3xl font-bold ${stat.color}`}>{stat.value}</p>
                        <p className="text-sm text-muted-foreground">{stat.label}</p>
                    </CardContent>
                </Card>
            ))}
        </div>
    );
}
