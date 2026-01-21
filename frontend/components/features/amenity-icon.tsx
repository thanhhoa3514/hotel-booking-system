"use client";

import { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface AmenityIconProps {
    icon: LucideIcon;
    label: string;
    description?: string;
    className?: string;
}

export function AmenityIcon({
    icon: Icon,
    label,
    description,
    className,
}: AmenityIconProps) {
    return (
        <div
            className={cn(
                "group flex flex-col items-center text-center p-4 cursor-default",
                "hover:bg-slate-100 dark:hover:bg-slate-800/50 rounded-xl transition-colors duration-200",
                className
            )}
        >
            <div
                className={cn(
                    "w-14 h-14 rounded-2xl flex items-center justify-center mb-3",
                    "bg-gradient-to-br from-orange-500/10 to-amber-500/10",
                    "group-hover:from-orange-500/20 group-hover:to-amber-500/20",
                    "transition-all duration-300"
                )}
            >
                <Icon className="w-7 h-7 text-orange-600 dark:text-orange-400" />
            </div>
            <span className="font-medium text-slate-900 dark:text-white text-sm">
                {label}
            </span>
            {description && (
                <span className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                    {description}
                </span>
            )}
        </div>
    );
}
