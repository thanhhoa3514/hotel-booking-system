"use client";

import * as React from "react";
import { format, differenceInDays } from "date-fns";
import { Calendar as CalendarIcon } from "lucide-react";
import { DateRange } from "react-day-picker";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover";
import { Separator } from "@/components/ui/separator";

interface BookingWidgetProps {
    pricePerNight: number;
}

export function BookingWidget({ pricePerNight }: BookingWidgetProps) {
    const [date, setDate] = React.useState<DateRange | undefined>({
        from: new Date(),
        to: new Date(new Date().setDate(new Date().getDate() + 3)),
    });

    const nights = React.useMemo(() => {
        if (date?.from && date?.to) {
            return differenceInDays(date.to, date.from);
        }
        return 0;
    }, [date]);

    const total = nights * pricePerNight;
    const serviceFee = Math.round(total * 0.1); // 10% service fee
    const grandTotal = total + serviceFee;

    return (
        <Card className="sticky top-24 shadow-lg border-slate-200">
            <CardHeader>
                <div className="flex justify-between items-baseline">
                    <CardTitle className="text-2xl font-bold">${pricePerNight}</CardTitle>
                    <span className="text-slate-500 text-sm">/night</span>
                </div>
            </CardHeader>
            <CardContent className="space-y-4">
                {/* Date Picker */}
                <div className="grid gap-2">
                    <label className="text-sm font-medium">Dates</label>
                    <Popover>
                        <PopoverTrigger asChild>
                            <Button
                                id="date"
                                variant={"outline"}
                                className={cn(
                                    "w-full justify-start text-left font-normal",
                                    !date && "text-muted-foreground"
                                )}
                            >
                                <CalendarIcon className="mr-2 h-4 w-4" />
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
                        <PopoverContent className="w-auto p-0" align="end">
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

                {/* Guests Mock Input */}
                <div className="grid gap-2">
                    <label className="text-sm font-medium">Guests</label>
                    <div className="h-10 px-3 py-2 border rounded-md text-sm border-slate-200 bg-white flex items-center">
                        2 Guests
                    </div>
                </div>

                {/* Price Breakdown */}
                {nights > 0 && (
                    <div className="space-y-2 pt-4">
                        <div className="flex justify-between text-sm text-slate-600">
                            <span>${pricePerNight} x {nights} nights</span>
                            <span>${total}</span>
                        </div>
                        <div className="flex justify-between text-sm text-slate-600">
                            <span>Service fee</span>
                            <span>${serviceFee}</span>
                        </div>
                        <Separator className="my-2" />
                        <div className="flex justify-between font-bold text-lg text-slate-900">
                            <span>Total</span>
                            <span>${grandTotal}</span>
                        </div>
                    </div>
                )}

            </CardContent>
            <CardFooter>
                <Button className="w-full h-12 text-lg bg-blue-600 hover:bg-blue-700">
                    Book Now
                </Button>
            </CardFooter>
        </Card>
    );
}
