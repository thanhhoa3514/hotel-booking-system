import { Card, CardContent } from "@/components/ui/card";
import { Booking } from "@/types/booking";

interface BookingStatsProps {
    bookings: Booking[];
    activeStatus: string;
    onStatusChange: (status: string) => void;
}

export function BookingStats({ bookings, activeStatus, onStatusChange }: BookingStatsProps) {
    const stats = [
        {
            id: "all",
            label: "Tổng đặt phòng",
            value: bookings.length,
            color: "text-orange-600",
            borderColor: "border-orange-500",
            bgColor: "bg-orange-50 dark:bg-orange-900/20"
        },
        {
            id: "PENDING",
            label: "Chờ xử lý",
            value: bookings.filter(b => b.status === "PENDING").length,
            color: "text-amber-600",
            borderColor: "border-amber-500",
            bgColor: "bg-amber-50 dark:bg-amber-900/20"
        },
        {
            id: "CHECKED_IN",
            label: "Đang ở (In-house)",
            value: bookings.filter(b => b.status === "CHECKED_IN").length,
            color: "text-blue-600",
            borderColor: "border-blue-500",
            bgColor: "bg-blue-50 dark:bg-blue-900/20"
        },
        {
            id: "CONFIRMED",
            label: "Sắp đến",
            value: bookings.filter(b => b.status === "CONFIRMED").length,
            color: "text-green-600",
            borderColor: "border-green-500",
            bgColor: "bg-green-50 dark:bg-green-900/20"
        },
    ];

    return (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {stats.map((stat) => {
                const isActive = activeStatus === stat.id;
                return (
                    <div
                        key={stat.id}
                        onClick={() => onStatusChange(stat.id)}
                        className={`cursor-pointer transition-all duration-200 ${isActive ? 'scale-105' : 'hover:scale-105'}`}
                    >
                        <Card className={`border-0 shadow-md ${isActive ? `ring-2 ring-offset-2 ${stat.borderColor} ${stat.bgColor}` : 'bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm'}`}>
                            <CardContent className="p-4 text-center">
                                <p className={`text-3xl font-bold ${stat.color}`}>{stat.value}</p>
                                <p className={`text-sm ${isActive ? 'font-medium' : 'text-muted-foreground'}`}>{stat.label}</p>
                            </CardContent>
                        </Card>
                    </div>
                );
            })}
        </div>
    );
}
