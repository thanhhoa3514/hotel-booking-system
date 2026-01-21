"use client";

import { Star } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";

interface TestimonialCardProps {
    name: string;
    avatar?: string;
    location: string;
    rating: number;
    comment: string;
    date?: string;
    className?: string;
}

export function TestimonialCard({
    name,
    avatar,
    location,
    rating,
    comment,
    date,
    className,
}: TestimonialCardProps) {
    const getInitials = (name: string) => {
        return name
            .split(" ")
            .map((n) => n[0])
            .join("")
            .toUpperCase()
            .slice(0, 2);
    };

    return (
        <div
            className={cn(
                "group relative p-6 rounded-2xl cursor-default",
                "bg-white dark:bg-slate-800/50",
                "border border-slate-200 dark:border-slate-700",
                "shadow-lg hover:shadow-xl transition-all duration-300",
                "hover:-translate-y-1",
                className
            )}
        >
            {/* Quote Icon */}
            <div className="absolute top-4 right-4 text-4xl text-orange-500/20 font-serif">
                "
            </div>

            {/* Rating Stars */}
            <div className="flex gap-1 mb-4">
                {Array.from({ length: 5 }).map((_, i) => (
                    <Star
                        key={i}
                        className={cn(
                            "w-4 h-4",
                            i < rating
                                ? "fill-amber-400 text-amber-400"
                                : "fill-slate-200 text-slate-200 dark:fill-slate-600 dark:text-slate-600"
                        )}
                    />
                ))}
            </div>

            {/* Comment */}
            <p className="text-slate-600 dark:text-slate-300 text-sm leading-relaxed mb-6 line-clamp-4">
                "{comment}"
            </p>

            {/* Author Info */}
            <div className="flex items-center gap-3">
                <Avatar className="h-10 w-10 border-2 border-orange-500/20">
                    <AvatarImage src={avatar} alt={name} />
                    <AvatarFallback className="bg-gradient-to-br from-orange-500 to-amber-500 text-white text-sm font-medium">
                        {getInitials(name)}
                    </AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                    <p className="font-semibold text-slate-900 dark:text-white text-sm truncate">
                        {name}
                    </p>
                    <p className="text-xs text-slate-500 dark:text-slate-400 truncate">
                        {location}
                    </p>
                </div>
                {date && (
                    <span className="text-xs text-slate-400 dark:text-slate-500">
                        {date}
                    </span>
                )}
            </div>
        </div>
    );
}
