"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { format } from "date-fns";
import { Calendar as CalendarIcon, Search, Users } from "lucide-react";
import { DateRange } from "react-day-picker";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";

export function SearchBar() {
    const router = useRouter();
    const [date, setDate] = React.useState<DateRange | undefined>({
        from: new Date(),
        to: new Date(new Date().setDate(new Date().getDate() + 3)),
    });
    const [guests, setGuests] = React.useState("2");

    const handleSearch = () => {
        // Navigate to rooms page with search params
        const params = new URLSearchParams();
        if (date?.from) params.append("checkIn", date.from.toISOString());
        if (date?.to) params.append("checkOut", date.to.toISOString());
        if (guests) params.append("guests", guests);
        router.push(`/rooms?${params.toString()}`);
    };

    return (
        <div className="flex flex-col md:flex-row items-center p-4 bg-white/95 backdrop-blur-sm rounded-2xl shadow-xl w-full max-w-4xl gap-4 border border-slate-100">
            {/* Date Range Picker */}
            <div className="flex-1 w-full">
                <label className="text-xs font-semibold text-slate-500 ml-1 mb-1 block">Nhận phòng - Trả phòng</label>
                <Popover>
                    <PopoverTrigger asChild>
                        <Button
                            id="date"
                            variant={"outline"}
                            className={cn(
                                "w-full justify-start text-left font-normal border-slate-200 h-12 cursor-pointer",
                                !date && "text-muted-foreground"
                            )}
                        >
                            <CalendarIcon className="mr-2 h-4 w-4 opacity-50" />
                            {date?.from ? (
                                date.to ? (
                                    <>
                                        {format(date.from, "dd/MM/yyyy")} -{" "}
                                        {format(date.to, "dd/MM/yyyy")}
                                    </>
                                ) : (
                                    format(date.from, "dd/MM/yyyy")
                                )
                            ) : (
                                <span>Chọn ngày</span>
                            )}
                        </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                            initialFocus
                            mode="range"
                            defaultMonth={date?.from}
                            selected={date}
                            onSelect={setDate}
                            numberOfMonths={2}
                            disabled={(date) => date < new Date()}
                        />
                    </PopoverContent>
                </Popover>
            </div>

            {/* Guests Selector */}
            <div className="w-full md:w-48">
                <label className="text-xs font-semibold text-slate-500 ml-1 mb-1 block">Số khách</label>
                <Select value={guests} onValueChange={setGuests}>
                    <SelectTrigger className="h-12 border-slate-200 cursor-pointer">
                        <div className="flex items-center">
                            <Users className="mr-2 h-4 w-4 opacity-50" />
                            <SelectValue placeholder="Khách" />
                        </div>
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="1" className="cursor-pointer">1 Khách</SelectItem>
                        <SelectItem value="2" className="cursor-pointer">2 Khách</SelectItem>
                        <SelectItem value="3" className="cursor-pointer">3 Khách</SelectItem>
                        <SelectItem value="4" className="cursor-pointer">4+ Khách</SelectItem>
                    </SelectContent>
                </Select>
            </div>

            {/* Search Button */}
            <div className="w-full md:w-auto mt-auto flex items-end">
                <Button
                    className="w-full md:w-auto h-12 px-8 bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-lg font-medium shadow-lg shadow-orange-500/30 transition-all hover:shadow-xl cursor-pointer"
                    onClick={handleSearch}
                >
                    <Search className="h-5 w-5 mr-2" />
                    Tìm kiếm
                </Button>
            </div>
        </div>
    );
}

