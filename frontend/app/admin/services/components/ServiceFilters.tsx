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
import { ServiceCategory, getCategoryLabel } from "@/services/services.api";

const categories: ServiceCategory[] = [
    "FOOD_BEVERAGE",
    "SPA_WELLNESS",
    "RECREATION",
    "TRANSPORTATION",
    "BUSINESS",
    "LAUNDRY",
    "CONCIERGE",
    "ROOM_SERVICE",
    "OTHER",
];

interface ServiceFiltersProps {
    searchQuery: string;
    categoryFilter: string;
    onSearchChange: (value: string) => void;
    onCategoryChange: (value: string) => void;
}

export function ServiceFilters({
    searchQuery,
    categoryFilter,
    onSearchChange,
    onCategoryChange,
}: ServiceFiltersProps) {
    return (
        <Card className="border-0 shadow-lg rounded-2xl">
            <CardContent className="p-4">
                <div className="flex flex-col sm:flex-row gap-4">
                    <div className="relative flex-1">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                            placeholder="Tim kiem dich vu..."
                            className="pl-10 rounded-xl border-0 bg-slate-100 dark:bg-slate-800"
                            value={searchQuery}
                            onChange={(e) => onSearchChange(e.target.value)}
                        />
                    </div>
                    <Select value={categoryFilter} onValueChange={onCategoryChange}>
                        <SelectTrigger className="w-full sm:w-48 rounded-xl border-0 bg-slate-100 dark:bg-slate-800">
                            <SelectValue placeholder="Danh muc" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">Tat ca danh muc</SelectItem>
                            {categories.map((cat) => (
                                <SelectItem key={cat} value={cat}>
                                    {getCategoryLabel(cat)}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>
            </CardContent>
        </Card>
    );
}
