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
import { RoomType, RoomStatus } from "@/types/room";
import { statusOptions } from "./room-utils";

interface RoomFiltersProps {
    searchQuery: string;
    typeFilter: string;
    statusFilter: string;
    roomTypes: RoomType[];
    onSearchChange: (value: string) => void;
    onTypeChange: (value: string) => void;
    onStatusChange: (value: string) => void;
}

export function RoomFilters({
    searchQuery,
    typeFilter,
    statusFilter,
    roomTypes,
    onSearchChange,
    onTypeChange,
    onStatusChange,
}: RoomFiltersProps) {
    return (
        <Card className="border-0 shadow-lg shadow-slate-200/50 dark:shadow-slate-900/50 bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm rounded-2xl">
            <CardContent className="p-4">
                <div className="flex flex-col sm:flex-row gap-4">
                    <div className="relative flex-1">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                            placeholder="Tìm theo số phòng..."
                            className="pl-10 rounded-xl border-0 bg-slate-100 dark:bg-slate-800"
                            value={searchQuery}
                            onChange={(e) => onSearchChange(e.target.value)}
                        />
                    </div>
                    <Select value={typeFilter} onValueChange={onTypeChange}>
                        <SelectTrigger className="w-full sm:w-48 rounded-xl border-0 bg-slate-100 dark:bg-slate-800">
                            <SelectValue placeholder="Loại phòng" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">Tất cả loại</SelectItem>
                            {roomTypes.map((type) => (
                                <SelectItem key={type.id} value={type.id}>
                                    {type.name}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                    <Select value={statusFilter} onValueChange={onStatusChange}>
                        <SelectTrigger className="w-full sm:w-40 rounded-xl border-0 bg-slate-100 dark:bg-slate-800">
                            <SelectValue placeholder="Trạng thái" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">Tất cả</SelectItem>
                            {statusOptions.map((opt) => (
                                <SelectItem key={opt.value} value={opt.value}>
                                    {opt.label}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>
            </CardContent>
        </Card>
    );
}
