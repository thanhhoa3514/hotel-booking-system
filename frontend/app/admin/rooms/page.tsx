"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import {
    Search,
    Plus,
    MoreHorizontal,
    BedDouble,
    Edit,
    Trash2,
    Eye,
    Wifi,
    Tv,
    Wind,
    Coffee,
    Bath,
    Users,
} from "lucide-react";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { toast } from "sonner";

// Mock rooms data
const rooms = [
    {
        id: "R001",
        number: "101",
        floor: 1,
        type: "Standard",
        capacity: 2,
        price: 800000,
        status: "available",
        amenities: ["wifi", "tv", "ac"],
    },
    {
        id: "R002",
        number: "102",
        floor: 1,
        type: "Standard",
        capacity: 2,
        price: 800000,
        status: "occupied",
        amenities: ["wifi", "tv", "ac"],
    },
    {
        id: "R003",
        number: "201",
        floor: 2,
        type: "Deluxe",
        capacity: 3,
        price: 1200000,
        status: "available",
        amenities: ["wifi", "tv", "ac", "minibar", "bathtub"],
    },
    {
        id: "R004",
        number: "202",
        floor: 2,
        type: "Deluxe",
        capacity: 3,
        price: 1200000,
        status: "cleaning",
        amenities: ["wifi", "tv", "ac", "minibar", "bathtub"],
    },
    {
        id: "R005",
        number: "301",
        floor: 3,
        type: "Suite",
        capacity: 4,
        price: 2500000,
        status: "available",
        amenities: ["wifi", "tv", "ac", "minibar", "bathtub", "kitchen"],
    },
    {
        id: "R006",
        number: "302",
        floor: 3,
        type: "Suite",
        capacity: 4,
        price: 2500000,
        status: "maintenance",
        amenities: ["wifi", "tv", "ac", "minibar", "bathtub", "kitchen"],
    },
];

const getStatusConfig = (status: string) => {
    switch (status) {
        case "available":
            return { label: "Trống", className: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400" };
        case "occupied":
            return { label: "Đang sử dụng", className: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400" };
        case "cleaning":
            return { label: "Đang dọn", className: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400" };
        case "maintenance":
            return { label: "Bảo trì", className: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400" };
        default:
            return { label: status, className: "bg-slate-100 text-slate-700" };
    }
};

const getAmenityIcon = (amenity: string) => {
    switch (amenity) {
        case "wifi":
            return <Wifi className="h-4 w-4" />;
        case "tv":
            return <Tv className="h-4 w-4" />;
        case "ac":
            return <Wind className="h-4 w-4" />;
        case "minibar":
            return <Coffee className="h-4 w-4" />;
        case "bathtub":
            return <Bath className="h-4 w-4" />;
        default:
            return null;
    }
};

const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("vi-VN", {
        style: "currency",
        currency: "VND",
    }).format(amount);
};

export default function AdminRoomsPage() {
    const [searchQuery, setSearchQuery] = useState("");
    const [typeFilter, setTypeFilter] = useState("all");
    const [statusFilter, setStatusFilter] = useState("all");
    const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
    const [newRoom, setNewRoom] = useState({
        number: "",
        floor: "",
        type: "",
        capacity: "",
        price: "",
    });

    const filteredRooms = rooms.filter((room) => {
        const matchesSearch =
            room.number.toLowerCase().includes(searchQuery.toLowerCase()) ||
            room.type.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesType = typeFilter === "all" || room.type.toLowerCase() === typeFilter;
        const matchesStatus = statusFilter === "all" || room.status === statusFilter;
        return matchesSearch && matchesType && matchesStatus;
    });

    const handleAddRoom = () => {
        // In real app, call API here
        toast.success(`Đã thêm phòng ${newRoom.number} thành công!`);
        setIsAddDialogOpen(false);
        setNewRoom({ number: "", floor: "", type: "", capacity: "", price: "" });
    };

    return (
        <div className="space-y-6">
            {/* Page Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold bg-gradient-to-r from-slate-900 to-slate-600 dark:from-white dark:to-slate-400 bg-clip-text text-transparent">
                        Quản lý phòng
                    </h1>
                    <p className="text-muted-foreground mt-1">
                        Quản lý tất cả phòng trong khách sạn
                    </p>
                </div>

                <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
                    <DialogTrigger asChild>
                        <Button className="rounded-xl bg-gradient-to-r from-blue-500 to-indigo-500 text-white shadow-lg shadow-blue-500/30">
                            <Plus className="h-4 w-4 mr-2" />
                            Thêm phòng mới
                        </Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-md rounded-2xl">
                        <DialogHeader>
                            <DialogTitle>Thêm phòng mới</DialogTitle>
                            <DialogDescription>
                                Nhập thông tin phòng cần thêm
                            </DialogDescription>
                        </DialogHeader>
                        <div className="grid gap-4 py-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="roomNumber">Số phòng</Label>
                                    <Input
                                        id="roomNumber"
                                        placeholder="VD: 101"
                                        className="rounded-xl"
                                        value={newRoom.number}
                                        onChange={(e) => setNewRoom({ ...newRoom, number: e.target.value })}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="floor">Tầng</Label>
                                    <Input
                                        id="floor"
                                        type="number"
                                        placeholder="VD: 1"
                                        className="rounded-xl"
                                        value={newRoom.floor}
                                        onChange={(e) => setNewRoom({ ...newRoom, floor: e.target.value })}
                                    />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="type">Loại phòng</Label>
                                <Select
                                    value={newRoom.type}
                                    onValueChange={(value) => setNewRoom({ ...newRoom, type: value })}
                                >
                                    <SelectTrigger className="rounded-xl">
                                        <SelectValue placeholder="Chọn loại phòng" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="standard">Standard</SelectItem>
                                        <SelectItem value="deluxe">Deluxe</SelectItem>
                                        <SelectItem value="suite">Suite</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="capacity">Sức chứa</Label>
                                    <Input
                                        id="capacity"
                                        type="number"
                                        placeholder="VD: 2"
                                        className="rounded-xl"
                                        value={newRoom.capacity}
                                        onChange={(e) => setNewRoom({ ...newRoom, capacity: e.target.value })}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="price">Giá/đêm (VNĐ)</Label>
                                    <Input
                                        id="price"
                                        type="number"
                                        placeholder="VD: 800000"
                                        className="rounded-xl"
                                        value={newRoom.price}
                                        onChange={(e) => setNewRoom({ ...newRoom, price: e.target.value })}
                                    />
                                </div>
                            </div>
                        </div>
                        <DialogFooter>
                            <Button variant="outline" onClick={() => setIsAddDialogOpen(false)} className="rounded-xl">
                                Hủy
                            </Button>
                            <Button onClick={handleAddRoom} className="rounded-xl bg-gradient-to-r from-blue-500 to-indigo-500">
                                Thêm phòng
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {[
                    { label: "Tổng phòng", value: rooms.length, color: "text-blue-600", bg: "bg-blue-50 dark:bg-blue-950/30" },
                    { label: "Trống", value: rooms.filter(r => r.status === "available").length, color: "text-emerald-600", bg: "bg-emerald-50 dark:bg-emerald-950/30" },
                    { label: "Đang sử dụng", value: rooms.filter(r => r.status === "occupied").length, color: "text-amber-600", bg: "bg-amber-50 dark:bg-amber-950/30" },
                    { label: "Bảo trì", value: rooms.filter(r => r.status === "maintenance").length, color: "text-red-600", bg: "bg-red-50 dark:bg-red-950/30" },
                ].map((stat, index) => (
                    <Card key={index} className={`border-0 shadow-md rounded-xl ${stat.bg}`}>
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
                                placeholder="Tìm theo số phòng, loại phòng..."
                                className="pl-10 rounded-xl border-0 bg-slate-100 dark:bg-slate-800"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />
                        </div>
                        <Select value={typeFilter} onValueChange={setTypeFilter}>
                            <SelectTrigger className="w-full sm:w-40 rounded-xl border-0 bg-slate-100 dark:bg-slate-800">
                                <SelectValue placeholder="Loại phòng" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">Tất cả loại</SelectItem>
                                <SelectItem value="standard">Standard</SelectItem>
                                <SelectItem value="deluxe">Deluxe</SelectItem>
                                <SelectItem value="suite">Suite</SelectItem>
                            </SelectContent>
                        </Select>
                        <Select value={statusFilter} onValueChange={setStatusFilter}>
                            <SelectTrigger className="w-full sm:w-40 rounded-xl border-0 bg-slate-100 dark:bg-slate-800">
                                <SelectValue placeholder="Trạng thái" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">Tất cả</SelectItem>
                                <SelectItem value="available">Trống</SelectItem>
                                <SelectItem value="occupied">Đang sử dụng</SelectItem>
                                <SelectItem value="cleaning">Đang dọn</SelectItem>
                                <SelectItem value="maintenance">Bảo trì</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </CardContent>
            </Card>

            {/* Rooms Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredRooms.map((room) => {
                    const statusConfig = getStatusConfig(room.status);
                    return (
                        <Card
                            key={room.id}
                            className="border-0 shadow-lg shadow-slate-200/50 dark:shadow-slate-900/50 bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm rounded-2xl overflow-hidden hover:shadow-xl transition-shadow"
                        >
                            {/* Room Header with gradient based on type */}
                            <div className={`h-24 relative ${room.type === "Suite"
                                    ? "bg-gradient-to-br from-purple-500 to-pink-500"
                                    : room.type === "Deluxe"
                                        ? "bg-gradient-to-br from-blue-500 to-indigo-500"
                                        : "bg-gradient-to-br from-slate-500 to-slate-600"
                                }`}>
                                <div className="absolute bottom-4 left-4">
                                    <p className="text-white/80 text-sm">{room.type}</p>
                                    <p className="text-white text-2xl font-bold">Phòng {room.number}</p>
                                </div>
                                <Badge className={`absolute top-3 right-3 ${statusConfig.className} border-0 rounded-lg`}>
                                    {statusConfig.label}
                                </Badge>
                            </div>

                            <CardContent className="p-4">
                                {/* Info Row */}
                                <div className="flex items-center justify-between mb-4">
                                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                        <BedDouble className="h-4 w-4" />
                                        <span>Tầng {room.floor}</span>
                                    </div>
                                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                        <Users className="h-4 w-4" />
                                        <span>{room.capacity} khách</span>
                                    </div>
                                </div>

                                {/* Amenities */}
                                <div className="flex items-center gap-2 mb-4">
                                    {room.amenities.slice(0, 5).map((amenity, index) => (
                                        <div
                                            key={index}
                                            className="p-2 rounded-lg bg-slate-100 dark:bg-slate-800 text-muted-foreground"
                                            title={amenity}
                                        >
                                            {getAmenityIcon(amenity)}
                                        </div>
                                    ))}
                                </div>

                                {/* Price & Actions */}
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-lg font-bold">{formatCurrency(room.price)}</p>
                                        <p className="text-xs text-muted-foreground">/đêm</p>
                                    </div>
                                    <DropdownMenu>
                                        <DropdownMenuTrigger asChild>
                                            <Button variant="outline" size="sm" className="rounded-xl">
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
                                                Xóa phòng
                                            </DropdownMenuItem>
                                        </DropdownMenuContent>
                                    </DropdownMenu>
                                </div>
                            </CardContent>
                        </Card>
                    );
                })}
            </div>
        </div>
    );
}
