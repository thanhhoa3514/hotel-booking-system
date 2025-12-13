"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Search } from "lucide-react";
import {
    ServiceBookingStatus,
    getStatusLabel,
} from "@/services/service-bookings.api";

const statuses: ServiceBookingStatus[] = [
    "PENDING",
    "CONFIRMED",
    "IN_PROGRESS",
    "COMPLETED",
    "CANCELLED",
];

interface ServiceBookingFiltersProps {
    searchQuery: string;
    statusFilter: string;
    dateFilter: string;
    onSearchChange: (value: string) => void;
    onStatusChange: (value: string) => void;
    onDateChange: (value: string) => void;
}

export function ServiceBookingFilters({
    searchQuery,
    statusFilter,
    dateFilter,
    onSearchChange,
    onStatusChange,
    onDateChange,
}: ServiceBookingFiltersProps) {
    return (
        <Card className="border-0 shadow-lg rounded-2xl">
            <CardContent className="p-4">
                <div className="flex flex-col sm:flex-row gap-4">
                    <div className="relative flex-1">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                            placeholder="Tim theo ma dat, ten khach..."
                            className="pl-10 rounded-xl border-0 bg-slate-100 dark:bg-slate-800"
                            value={searchQuery}
                            onChange={(e) => onSearchChange(e.target.value)}
                        />
                    </div>
                    <Select value={statusFilter} onValueChange={onStatusChange}>
                        <SelectTrigger className="w-full sm:w-40 rounded-xl border-0 bg-slate-100 dark:bg-slate-800">
                            <SelectValue placeholder="Trang thai" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">Tat ca</SelectItem>
                            {statuses.map((status) => (
                                <SelectItem key={status} value={status}>
                                    {getStatusLabel(status)}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                    <Input
                        type="date"
                        className="w-full sm:w-40 rounded-xl border-0 bg-slate-100 dark:bg-slate-800"
                        value={dateFilter}
                        onChange={(e) => onDateChange(e.target.value)}
                    />
                </div>
            </CardContent>
        </Card>
    );
}
