"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import {
    Search,
    Filter,
    Plus,
    MoreHorizontal,
    Calendar,
    CheckCircle2,
    Clock,
    XCircle,
    Eye,
    Edit,
    Trash2,
} from "lucide-react";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

// Mock bookings data
const bookings = [
    {
        id: "BK001",
        guest: "Nguyễn Văn A",
        email: "nguyenvana@email.com",
        phone: "0901234567",
        room: "Deluxe 301",
        roomType: "Deluxe",
        checkIn: "2024-12-11",
        checkOut: "2024-12-13",
        nights: 2,
        guests: 2,
        status: "confirmed",
        amount: 2400000,
        createdAt: "2024-12-09",
    },
    {
        id: "BK002",
        guest: "Trần Thị B",
        email: "tranthib@email.com",
        phone: "0912345678",
        room: "Suite 501",
        roomType: "Suite",
        checkIn: "2024-12-12",
        checkOut: "2024-12-15",
        nights: 3,
        guests: 4,
        status: "pending",
        amount: 5600000,
        createdAt: "2024-12-10",
    },
    {
        id: "BK003",
        guest: "Lê Văn C",
        email: "levanc@email.com",
        phone: "0923456789",
        room: "Standard 102",
        roomType: "Standard",
        checkIn: "2024-12-11",
        checkOut: "2024-12-12",
        nights: 1,
        guests: 1,
        status: "checked-in",
        amount: 800000,
        createdAt: "2024-12-08",
    },
    {
        id: "BK004",
        guest: "Phạm Thị D",
        email: "phamthid@email.com",
        phone: "0934567890",
        room: "Deluxe 205",
        roomType: "Deluxe",
        checkIn: "2024-12-10",
        checkOut: "2024-12-11",
        nights: 1,
        guests: 2,
        status: "checked-out",
        amount: 1200000,
        createdAt: "2024-12-07",
    },
    {
        id: "BK005",
        guest: "Hoàng Văn E",
        email: "hoangvane@email.com",
        phone: "0945678901",
        room: "Suite 502",
        roomType: "Suite",
        checkIn: "2024-12-14",
        checkOut: "2024-12-17",
        nights: 3,
        guests: 3,
        status: "cancelled",
        amount: 4800000,
        createdAt: "2024-12-06",
    },
];

const getStatusConfig = (status: string) => {
    switch (status) {
        case "confirmed":
            return { label: "Đã xác nhận", icon: CheckCircle2, className: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400" };
        case "pending":
            return { label: "Chờ xử lý", icon: Clock, className: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400" };
        case "checked-in":
            return { label: "Đã nhận phòng", icon: CheckCircle2, className: "bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400" };
        case "checked-out":
            return { label: "Đã trả phòng", icon: CheckCircle2, className: "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-400" };
        case "cancelled":
            return { label: "Đã hủy", icon: XCircle, className: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400" };
        default:
            return { label: status, icon: Clock, className: "bg-slate-100 text-slate-700" };
    }
};

const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("vi-VN", {
        style: "currency",
        currency: "VND",
    }).format(amount);
};

export default function AdminBookingsPage() {
    const [searchQuery, setSearchQuery] = useState("");
    const [statusFilter, setStatusFilter] = useState("all");

    const filteredBookings = bookings.filter((booking) => {
        const matchesSearch =
            booking.guest.toLowerCase().includes(searchQuery.toLowerCase()) ||
            booking.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
            booking.room.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesStatus = statusFilter === "all" || booking.status === statusFilter;
        return matchesSearch && matchesStatus;
    });

    return (
        <div className="space-y-6">
            {/* Page Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold bg-gradient-to-r from-slate-900 to-slate-600 dark:from-white dark:to-slate-400 bg-clip-text text-transparent">
                        Quản lý đặt phòng
                    </h1>
                    <p className="text-muted-foreground mt-1">
                        Theo dõi và quản lý tất cả đặt phòng
                    </p>
                </div>
                <Button className="rounded-xl bg-gradient-to-r from-orange-500 to-amber-500 text-white shadow-lg shadow-orange-500/30">
                    <Plus className="h-4 w-4 mr-2" />
                    Tạo đặt phòng
                </Button>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {[
                    { label: "Tổng đặt phòng", value: bookings.length, color: "text-orange-600" },
                    { label: "Chờ xử lý", value: bookings.filter(b => b.status === "pending").length, color: "text-amber-600" },
                    { label: "Đã xác nhận", value: bookings.filter(b => b.status === "confirmed").length, color: "text-green-600" },
                    { label: "Đã hủy", value: bookings.filter(b => b.status === "cancelled").length, color: "text-red-600" },
                ].map((stat, index) => (
                    <Card key={index} className="border-0 shadow-md bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm rounded-xl">
                        <CardContent className="p-4 text-center">
                            <p className={`text-3xl font-bold ${stat.color}`}>{stat.value}</p>
                            <p className="text-sm text-muted-foreground">{stat.label}</p>
                        </CardContent>
                    </Card>
                ))}
            </div>

            {/* Filters */}
            <Card className="border-0 shadow-lg shadow-slate-200/50 dark:shadow-slate-900/50 bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm rounded-2xl">
                <CardContent className="p-4">
                    <div className="flex flex-col sm:flex-row gap-4">
                        <div className="relative flex-1">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                            <Input
                                placeholder="Tìm theo tên, mã đặt phòng, phòng..."
                                className="pl-10 rounded-xl border-0 bg-slate-100 dark:bg-slate-800"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />
                        </div>
                        <Select value={statusFilter} onValueChange={setStatusFilter}>
                            <SelectTrigger className="w-full sm:w-48 rounded-xl border-0 bg-slate-100 dark:bg-slate-800">
                                <Filter className="h-4 w-4 mr-2" />
                                <SelectValue placeholder="Trạng thái" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">Tất cả</SelectItem>
                                <SelectItem value="pending">Chờ xử lý</SelectItem>
                                <SelectItem value="confirmed">Đã xác nhận</SelectItem>
                                <SelectItem value="checked-in">Đã nhận phòng</SelectItem>
                                <SelectItem value="checked-out">Đã trả phòng</SelectItem>
                                <SelectItem value="cancelled">Đã hủy</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </CardContent>
            </Card>

            {/* Bookings Table */}
            <Card className="border-0 shadow-lg shadow-slate-200/50 dark:shadow-slate-900/50 bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm rounded-2xl overflow-hidden">
                <CardContent className="p-0">
                    <Table>
                        <TableHeader>
                            <TableRow className="bg-slate-50/50 dark:bg-slate-800/50">
                                <TableHead className="font-semibold">Mã</TableHead>
                                <TableHead className="font-semibold">Khách hàng</TableHead>
                                <TableHead className="font-semibold">Phòng</TableHead>
                                <TableHead className="font-semibold">Check-in/out</TableHead>
                                <TableHead className="font-semibold">Số đêm</TableHead>
                                <TableHead className="font-semibold">Trạng thái</TableHead>
                                <TableHead className="font-semibold">Tổng tiền</TableHead>
                                <TableHead className="font-semibold text-right">Thao tác</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {filteredBookings.map((booking) => {
                                const statusConfig = getStatusConfig(booking.status);
                                return (
                                    <TableRow key={booking.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/50">
                                        <TableCell className="font-mono text-sm font-medium text-orange-600">
                                            {booking.id}
                                        </TableCell>
                                        <TableCell>
                                            <div>
                                                <p className="font-medium">{booking.guest}</p>
                                                <p className="text-xs text-muted-foreground">{booking.phone}</p>
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <div>
                                                <p className="font-medium">{booking.room}</p>
                                                <p className="text-xs text-muted-foreground">{booking.roomType}</p>
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex items-center gap-1 text-sm">
                                                <Calendar className="h-3 w-3 text-muted-foreground" />
                                                <span>{booking.checkIn}</span>
                                                <span className="text-muted-foreground">→</span>
                                                <span>{booking.checkOut}</span>
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <span className="font-medium">{booking.nights}</span>
                                            <span className="text-muted-foreground text-sm"> đêm</span>
                                        </TableCell>
                                        <TableCell>
                                            <Badge className={`${statusConfig.className} border-0 rounded-lg`}>
                                                <statusConfig.icon className="h-3 w-3 mr-1" />
                                                {statusConfig.label}
                                            </Badge>
                                        </TableCell>
                                        <TableCell className="font-semibold">
                                            {formatCurrency(booking.amount)}
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <DropdownMenu>
                                                <DropdownMenuTrigger asChild>
                                                    <Button variant="ghost" size="icon" className="rounded-lg">
                                                        <MoreHorizontal className="h-4 w-4" />
                                                    </Button>
                                                </DropdownMenuTrigger>
                                                <DropdownMenuContent align="end" className="rounded-xl">
                                                    <DropdownMenuItem className="cursor-pointer">
                                                        <Eye className="h-4 w-4 mr-2" />
                                                        Xem chi tiết
                                                    </DropdownMenuItem>
                                                    <DropdownMenuItem className="cursor-pointer">
                                                        <Edit className="h-4 w-4 mr-2" />
                                                        Chỉnh sửa
                                                    </DropdownMenuItem>
                                                    <DropdownMenuItem className="cursor-pointer text-red-600">
                                                        <Trash2 className="h-4 w-4 mr-2" />
                                                        Hủy đặt phòng
                                                    </DropdownMenuItem>
                                                </DropdownMenuContent>
                                            </DropdownMenu>
                                        </TableCell>
                                    </TableRow>
                                );
                            })}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </div>
    );
}
