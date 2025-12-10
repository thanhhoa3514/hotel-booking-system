"use client";

import * as React from "react";
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
    const [date, setDate] = React.useState<DateRange | undefined>({
        from: new Date(),
        to: new Date(new Date().setDate(new Date().getDate() + 3)),
    });

    return (
        <div className="flex flex-col md:flex-row items-center p-4 bg-white/95 backdrop-blur-sm rounded-2xl shadow-xl w-full max-w-4xl gap-4 border border-slate-100">
            {/* Date Range Picker */}
            <div className="flex-1 w-full">
                <label className="text-xs font-semibold text-slate-500 ml-1 mb-1 block">Check-in - Check-out</label>
                <Popover>
                    <PopoverTrigger asChild>
                        <Button
                            id="date"
                            variant={"outline"}
                            className={cn(
                                "w-full justify-start text-left font-normal border-slate-200 h-12",
                                !date && "text-muted-foreground"
                            )}
                        >
                            <CalendarIcon className="mr-2 h-4 w-4 opacity-50" />
                            {date?.from ? (
                                date.to ? (
                                    <>
                                        {format(date.from, "LLL dd, y")} -{" "}
                                        {format(date.to, "LLL dd, y")}
                                    </>
                                ) : (
                                    format(date.from, "LLL dd, y")
                                )
                            ) : (
                                <span>Pick a date</span>
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
                        />
                    </PopoverContent>
                </Popover>
            </div>

            {/* Guests Selector */}
            <div className="w-full md:w-48">
                <label className="text-xs font-semibold text-slate-500 ml-1 mb-1 block">Guests</label>
                <Select defaultValue="2">
                    <SelectTrigger className="h-12 border-slate-200">
                        <div className="flex items-center">
                            <Users className="mr-2 h-4 w-4 opacity-50" />
                            <SelectValue placeholder="Guests" />
                        </div>
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="1">1 Guest</SelectItem>
                        <SelectItem value="2">2 Guests</SelectItem>
                        <SelectItem value="3">3 Guests</SelectItem>
                        <SelectItem value="4">4+ Guests</SelectItem>
                    </SelectContent>
                </Select>
            </div>

            {/* Search Button */}
            <div className="w-full md:w-auto mt-auto flex items-end">
                <Button className="w-full md:w-auto h-12 px-8 bg-blue-600 hover:bg-blue-700 text-lg font-medium shadow-md transition-all hover:shadow-lg">
                    Search
                </Button>
            </div>
        </div>
    );
}
