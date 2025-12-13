"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
    BedDouble,
    Calendar,
    DollarSign,
    Users,
    TrendingUp,
    TrendingDown,
    ArrowUpRight,
    Clock,
    CheckCircle2,
    XCircle,
    AlertCircle,
} from "lucide-react";

// Mock data for stats
const stats = [
    {
        title: "Tổng doanh thu",
        value: "125.5M",
        unit: "VNĐ",
        change: "+12.5%",
        trend: "up",
        icon: DollarSign,
        color: "from-emerald-500 to-teal-500",
    },
    {
        title: "Đặt phòng hôm nay",
        value: "24",
        unit: "phòng",
        change: "+8%",
        trend: "up",
        icon: Calendar,
        color: "from-orange-500 to-amber-500",
    },
    {
        title: "Phòng trống",
        value: "18",
        unit: "phòng",
        change: "-3",
        trend: "down",
        icon: BedDouble,
        color: "from-amber-500 to-orange-500",
    },
    {
        title: "Khách đang lưu trú",
        value: "156",
        unit: "khách",
        change: "+5%",
        trend: "up",
        icon: Users,
        color: "from-purple-500 to-pink-500",
    },
];

// Mock recent bookings
const recentBookings = [
    {
        id: "BK001",
        guest: "Nguyễn Văn A",
        room: "Deluxe 301",
        checkIn: "2024-12-11",
        checkOut: "2024-12-13",
        status: "confirmed",
        amount: "2,400,000đ",
    },
    {
        id: "BK002",
        guest: "Trần Thị B",
        room: "Suite 501",
        checkIn: "2024-12-12",
        checkOut: "2024-12-15",
        status: "pending",
        amount: "5,600,000đ",
    },
    {
        id: "BK003",
        guest: "Lê Văn C",
        room: "Standard 102",
        checkIn: "2024-12-11",
        checkOut: "2024-12-12",
        status: "checked-in",
        amount: "800,000đ",
    },
    {
        id: "BK004",
        guest: "Phạm Thị D",
        room: "Deluxe 205",
        checkIn: "2024-12-10",
        checkOut: "2024-12-11",
        status: "cancelled",
        amount: "1,200,000đ",
    },
];

const getStatusConfig = (status: string) => {
    switch (status) {
        case "confirmed":
            return { label: "Đã xác nhận", icon: CheckCircle2, className: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400" };
        case "pending":
            return { label: "Chờ xử lý", icon: Clock, className: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400" };
        case "checked-in":
            return { label: "Đã nhận phòng", icon: CheckCircle2, className: "bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400" };
        case "cancelled":
            return { label: "Đã hủy", icon: XCircle, className: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400" };
        default:
            return { label: status, icon: AlertCircle, className: "bg-slate-100 text-slate-700" };
    }
};

export default function AdminDashboardPage() {
    return (
        <div className="space-y-6">
            {/* Page Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold bg-gradient-to-r from-slate-900 to-slate-600 dark:from-white dark:to-slate-400 bg-clip-text text-transparent">
                        Dashboard
                    </h1>
                    <p className="text-muted-foreground mt-1">
                        Xin chào! Đây là tổng quan hoạt động hôm nay.
                    </p>
                </div>
                <div className="flex gap-2">
                    <Button variant="outline" className="rounded-xl">
                        <Clock className="h-4 w-4 mr-2" />
                        Tuần này
                    </Button>
                    <Button className="rounded-xl bg-gradient-to-r from-orange-500 to-amber-500 text-white shadow-lg shadow-orange-500/30">
                        Xuất báo cáo
                    </Button>
                </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {stats.map((stat, index) => (
                    <Card
                        key={index}
                        className="relative overflow-hidden border-0 shadow-lg shadow-slate-200/50 dark:shadow-slate-900/50 bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm rounded-2xl"
                    >
                        <CardContent className="p-6">
                            <div className="flex items-start justify-between">
                                <div>
                                    <p className="text-sm text-muted-foreground">{stat.title}</p>
                                    <div className="flex items-baseline gap-1 mt-2">
                                        <span className="text-3xl font-bold">{stat.value}</span>
                                        <span className="text-sm text-muted-foreground">{stat.unit}</span>
                                    </div>
                                    <div className="flex items-center gap-1 mt-2">
                                        {stat.trend === "up" ? (
                                            <TrendingUp className="h-4 w-4 text-emerald-500" />
                                        ) : (
                                            <TrendingDown className="h-4 w-4 text-red-500" />
                                        )}
                                        <span className={stat.trend === "up" ? "text-emerald-500 text-sm" : "text-red-500 text-sm"}>
                                            {stat.change}
                                        </span>
                                        <span className="text-xs text-muted-foreground">vs tuần trước</span>
                                    </div>
                                </div>
                                <div className={`p-3 rounded-xl bg-gradient-to-br ${stat.color} shadow-lg`}>
                                    <stat.icon className="h-6 w-6 text-white" />
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>

            {/* Recent Bookings & Quick Actions */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Recent Bookings */}
                <Card className="lg:col-span-2 border-0 shadow-lg shadow-slate-200/50 dark:shadow-slate-900/50 bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm rounded-2xl">
                    <CardHeader className="flex flex-row items-center justify-between">
                        <div>
                            <CardTitle className="text-lg">Đặt phòng gần đây</CardTitle>
                            <CardDescription>Cập nhật realtime</CardDescription>
                        </div>
                        <Button variant="ghost" size="sm" className="text-orange-600">
                            Xem tất cả
                            <ArrowUpRight className="h-4 w-4 ml-1" />
                        </Button>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            {recentBookings.map((booking) => {
                                const statusConfig = getStatusConfig(booking.status);
                                return (
                                    <div
                                        key={booking.id}
                                        className="flex items-center justify-between p-4 rounded-xl bg-slate-50/50 dark:bg-slate-800/50 hover:bg-slate-100/50 dark:hover:bg-slate-800 transition-colors"
                                    >
                                        <div className="flex items-center gap-4">
                                            <div className="h-10 w-10 rounded-full bg-gradient-to-br from-orange-500 to-amber-500 flex items-center justify-center text-white font-medium">
                                                {booking.guest.charAt(0)}
                                            </div>
                                            <div>
                                                <p className="font-medium">{booking.guest}</p>
                                                <p className="text-sm text-muted-foreground">
                                                    {booking.room} • {booking.checkIn}
                                                </p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-4">
                                            <Badge className={`${statusConfig.className} border-0 rounded-lg px-3 py-1`}>
                                                <statusConfig.icon className="h-3 w-3 mr-1" />
                                                {statusConfig.label}
                                            </Badge>
                                            <span className="font-semibold text-sm">{booking.amount}</span>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </CardContent>
                </Card>

                {/* Quick Actions */}
                <Card className="border-0 shadow-lg shadow-slate-200/50 dark:shadow-slate-900/50 bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm rounded-2xl">
                    <CardHeader>
                        <CardTitle className="text-lg">Thao tác nhanh</CardTitle>
                        <CardDescription>Các tác vụ thường dùng</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-3">
                        <Button
                            variant="outline"
                            className="w-full justify-start rounded-xl h-12 hover:bg-orange-50 dark:hover:bg-orange-950/30 hover:text-orange-600 hover:border-orange-200"
                        >
                            <Calendar className="h-5 w-5 mr-3 text-orange-500" />
                            Tạo đặt phòng mới
                        </Button>
                        <Button
                            variant="outline"
                            className="w-full justify-start rounded-xl h-12 hover:bg-emerald-50 dark:hover:bg-emerald-950/30 hover:text-emerald-600 hover:border-emerald-200"
                        >
                            <CheckCircle2 className="h-5 w-5 mr-3 text-emerald-500" />
                            Xác nhận check-in
                        </Button>
                        <Button
                            variant="outline"
                            className="w-full justify-start rounded-xl h-12 hover:bg-amber-50 dark:hover:bg-amber-950/30 hover:text-amber-600 hover:border-amber-200"
                        >
                            <BedDouble className="h-5 w-5 mr-3 text-amber-500" />
                            Thêm phòng mới
                        </Button>
                        <Button
                            variant="outline"
                            className="w-full justify-start rounded-xl h-12 hover:bg-purple-50 dark:hover:bg-purple-950/30 hover:text-purple-600 hover:border-purple-200"
                        >
                            <Users className="h-5 w-5 mr-3 text-purple-500" />
                            Quản lý khách hàng
                        </Button>
                    </CardContent>
                </Card>
            </div>

            {/* Room Status Overview */}
            <Card className="border-0 shadow-lg shadow-slate-200/50 dark:shadow-slate-900/50 bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm rounded-2xl">
                <CardHeader>
                    <CardTitle className="text-lg">Tình trạng phòng</CardTitle>
                    <CardDescription>Cập nhật theo thời gian thực</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                        {[
                            { label: "Trống", count: 18, color: "bg-emerald-500", bgColor: "bg-emerald-50 dark:bg-emerald-950/30" },
                            { label: "Đang sử dụng", count: 45, color: "bg-orange-500", bgColor: "bg-orange-50 dark:bg-orange-950/30" },
                            { label: "Đang dọn", count: 5, color: "bg-amber-500", bgColor: "bg-amber-50 dark:bg-amber-950/30" },
                            { label: "Bảo trì", count: 2, color: "bg-red-500", bgColor: "bg-red-50 dark:bg-red-950/30" },
                            { label: "Đã đặt trước", count: 10, color: "bg-purple-500", bgColor: "bg-purple-50 dark:bg-purple-950/30" },
                        ].map((room, index) => (
                            <div key={index} className={`p-4 rounded-xl ${room.bgColor} text-center`}>
                                <div className={`inline-flex items-center justify-center h-12 w-12 rounded-xl ${room.color} text-white font-bold text-lg mb-2`}>
                                    {room.count}
                                </div>
                                <p className="text-sm font-medium">{room.label}</p>
                            </div>
                        ))}
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
