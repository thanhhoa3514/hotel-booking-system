"use client";

import Image from "next/image";
import Link from "next/link";
import { cn } from "@/lib/utils";

interface DestinationCardProps {
    name: string;
    image: string;
    properties: number;
    featured?: boolean;
    href?: string;
    className?: string;
}

export function DestinationCard({
    name,
    image,
    properties,
    featured = false,
    href = "/rooms",
    className,
}: DestinationCardProps) {
    return (
        <Link
            href={href}
            className={cn(
                "group relative block overflow-hidden rounded-2xl cursor-pointer",
                "aspect-[4/5] md:aspect-[3/4]",
                className
            )}
        >
            {/* Background Image */}
            <div className="absolute inset-0">
                <Image
                    src={image}
                    alt={name}
                    fill
                    className="object-cover transition-transform duration-500 group-hover:scale-110"
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                />
            </div>

            {/* Gradient Overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />

            {/* Featured Badge */}
            {featured && (
                <div className="absolute top-4 left-4 z-10">
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-gradient-to-r from-orange-500 to-amber-500 text-white shadow-lg">
                        ⭐ Nổi bật
                    </span>
                </div>
            )}

            {/* Content */}
            <div className="absolute bottom-0 left-0 right-0 p-5 z-10">
                <h3 className="text-xl font-bold text-white mb-1 group-hover:text-orange-300 transition-colors">
                    {name}
                </h3>
                <p className="text-white/80 text-sm">
                    {properties} khách sạn
                </p>
            </div>

            {/* Hover Effect Border */}
            <div className="absolute inset-0 rounded-2xl border-2 border-transparent group-hover:border-orange-500/50 transition-colors duration-300" />
        </Link>
    );
}
