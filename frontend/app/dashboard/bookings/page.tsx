"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
import { Skeleton } from "@/components/ui/skeleton";
import { Calendar, Search, Eye, XCircle, Clock, CheckCircle, AlertCircle } from "lucide-react";
import { format } from "date-fns";

// Mock booking data
const MOCK_BOOKINGS = [
    {
        id: "BK001",
        roomName: "Deluxe Ocean View Suite",
        checkIn: new Date("2024-12-15"),
        checkOut: new Date("2024-12-18"),
        guests: 2,
        total: 897,
        status: "CONFIRMED",
    },
    {
        id: "BK002",
        roomName: "Premium Family Room",
        checkIn: new Date("2024-12-20"),
        checkOut: new Date("2024-12-25"),
        guests: 4,
        total: 1995,
        status: "PENDING",
    },
    {
        id: "BK003",
        roomName: "Standard Double Room",
        checkIn: new Date("2024-11-10"),
        checkOut: new Date("2024-11-12"),
        guests: 2,
        total: 298,
        status: "CHECKED_OUT",
    },
    {
        id: "BK004",
        roomName: "Executive Business Suite",
        checkIn: new Date("2024-12-05"),
        checkOut: new Date("2024-12-07"),
        guests: 1,
        total: 898,
        status: "CANCELLED",
    },
];

const STATUS_CONFIG = {
    PENDING: { label: "Pending", color: "bg-yellow-500", icon: Clock },
    CONFIRMED: { label: "Confirmed", color: "bg-blue-500", icon: CheckCircle },
    CHECKED_IN: { label: "Checked In", color: "bg-green-500", icon: CheckCircle },
    CHECKED_OUT: { label: "Checked Out", color: "bg-slate-500", icon: CheckCircle },
    CANCELLED: { label: "Cancelled", color: "bg-red-500", icon: XCircle },
    NO_SHOW: { label: "No Show", color: "bg-orange-500", icon: AlertCircle },
};

export default function BookingsDashboard() {
    const [searchQuery, setSearchQuery] = useState("");
    const [statusFilter, setStatusFilter] = useState("all");
    const [isLoading, setIsLoading] = useState(false);

    const filteredBookings = MOCK_BOOKINGS.filter((booking) => {
        const matchesSearch =
            booking.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
            booking.roomName.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesStatus = statusFilter === "all" || booking.status === statusFilter;
        return matchesSearch && matchesStatus;
    });

    const getStatusBadge = (status: string) => {
        const config = STATUS_CONFIG[status as keyof typeof STATUS_CONFIG];
        if (!config) return null;
        const Icon = config.icon;
        return (
            <Badge className={`${config.color} text-white flex items-center gap-1`}>
                <Icon className="h-3 w-3" />
                {config.label}
            </Badge>
        );
    };

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-950 py-8 px-4">
            <div className="container mx-auto max-w-6xl">
                {/* Header */}
                <div className="mb-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                    <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">
                        My Bookings
                    </h1>
                    <p className="text-slate-500 dark:text-slate-400">
                        View and manage your hotel reservations
                    </p>
                </div>

                {/* Stats Cards */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8 animate-in fade-in slide-in-from-bottom-4 duration-500 delay-100">
                    <Card>
                        <CardContent className="p-4">
                            <div className="text-2xl font-bold text-blue-600">{MOCK_BOOKINGS.length}</div>
                            <div className="text-sm text-slate-500">Total Bookings</div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardContent className="p-4">
                            <div className="text-2xl font-bold text-green-600">
                                {MOCK_BOOKINGS.filter((b) => b.status === "CONFIRMED").length}
                            </div>
                            <div className="text-sm text-slate-500">Confirmed</div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardContent className="p-4">
                            <div className="text-2xl font-bold text-yellow-600">
                                {MOCK_BOOKINGS.filter((b) => b.status === "PENDING").length}
                            </div>
                            <div className="text-sm text-slate-500">Pending</div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardContent className="p-4">
                            <div className="text-2xl font-bold text-slate-600">
                                ${MOCK_BOOKINGS.reduce((acc, b) => acc + b.total, 0).toLocaleString()}
                            </div>
                            <div className="text-sm text-slate-500">Total Spent</div>
                        </CardContent>
                    </Card>
                </div>

                {/* Filters */}
                <Card className="mb-6 animate-in fade-in slide-in-from-bottom-4 duration-500 delay-200">
                    <CardContent className="p-4">
                        <div className="flex flex-col sm:flex-row gap-4">
                            <div className="relative flex-1">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                                <Input
                                    placeholder="Search by booking ID or room name..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="pl-10"
                                />
                            </div>
                            <Select value={statusFilter} onValueChange={setStatusFilter}>
                                <SelectTrigger className="w-full sm:w-48 cursor-pointer">
                                    <SelectValue placeholder="Filter by status" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all" className="cursor-pointer">All Statuses</SelectItem>
                                    <SelectItem value="PENDING" className="cursor-pointer">Pending</SelectItem>
                                    <SelectItem value="CONFIRMED" className="cursor-pointer">Confirmed</SelectItem>
                                    <SelectItem value="CHECKED_IN" className="cursor-pointer">Checked In</SelectItem>
                                    <SelectItem value="CHECKED_OUT" className="cursor-pointer">Checked Out</SelectItem>
                                    <SelectItem value="CANCELLED" className="cursor-pointer">Cancelled</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </CardContent>
                </Card>

                {/* Bookings Table */}
                <Card className="animate-in fade-in slide-in-from-bottom-4 duration-500 delay-300">
                    <CardContent className="p-0">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Booking ID</TableHead>
                                    <TableHead>Room</TableHead>
                                    <TableHead>Dates</TableHead>
                                    <TableHead>Guests</TableHead>
                                    <TableHead>Total</TableHead>
                                    <TableHead>Status</TableHead>
                                    <TableHead className="text-right">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {isLoading ? (
                                    Array.from({ length: 4 }).map((_, i) => (
                                        <TableRow key={i}>
                                            <TableCell><Skeleton className="h-4 w-16" /></TableCell>
                                            <TableCell><Skeleton className="h-4 w-32" /></TableCell>
                                            <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                                            <TableCell><Skeleton className="h-4 w-8" /></TableCell>
                                            <TableCell><Skeleton className="h-4 w-16" /></TableCell>
                                            <TableCell><Skeleton className="h-6 w-20" /></TableCell>
                                            <TableCell><Skeleton className="h-8 w-8 ml-auto" /></TableCell>
                                        </TableRow>
                                    ))
                                ) : filteredBookings.length > 0 ? (
                                    filteredBookings.map((booking, index) => (
                                        <TableRow
                                            key={booking.id}
                                            className="animate-in fade-in"
                                            style={{ animationDelay: `${index * 50}ms` }}
                                        >
                                            <TableCell className="font-medium">{booking.id}</TableCell>
                                            <TableCell>{booking.roomName}</TableCell>
                                            <TableCell>
                                                <div className="flex items-center gap-1 text-sm">
                                                    <Calendar className="h-3 w-3" />
                                                    {format(booking.checkIn, "MMM dd")} - {format(booking.checkOut, "MMM dd")}
                                                </div>
                                            </TableCell>
                                            <TableCell>{booking.guests}</TableCell>
                                            <TableCell className="font-semibold">${booking.total}</TableCell>
                                            <TableCell>{getStatusBadge(booking.status)}</TableCell>
                                            <TableCell className="text-right">
                                                <Button variant="ghost" size="icon" className="cursor-pointer">
                                                    <Eye className="h-4 w-4" />
                                                </Button>
                                            </TableCell>
                                        </TableRow>
                                    ))
                                ) : (
                                    <TableRow>
                                        <TableCell colSpan={7} className="text-center py-8 text-slate-500">
                                            No bookings found matching your criteria.
                                        </TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
