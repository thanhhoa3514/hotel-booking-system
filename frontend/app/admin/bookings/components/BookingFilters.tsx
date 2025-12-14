import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

interface BookingFiltersProps {
    searchQuery: string;
    onSearchChange: (value: string) => void;
}

export function BookingFilters({ searchQuery, onSearchChange }: BookingFiltersProps) {
    return (
        <Card className="border-0 shadow-lg shadow-slate-200/50 dark:shadow-slate-900/50 bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm rounded-2xl">
            <CardContent className="p-4">
                <div className="flex flex-col sm:flex-row gap-4">
                    <div className="relative flex-1">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                            placeholder="Tìm theo tên khách, mã đặt phòng..."
                            className="pl-10 rounded-xl border-0 bg-slate-100 dark:bg-slate-800 focus-visible:ring-orange-500"
                            value={searchQuery}
                            onChange={(e) => onSearchChange(e.target.value)}
                        />
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}
