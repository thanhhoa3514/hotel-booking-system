"use client";

import { useState } from "react";
import React from 'react';
import Image from "next/image";
import { BookingWidget } from "@/components/features/booking-widget";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
    Dialog,
    DialogContent,
    DialogTrigger,
    DialogTitle
} from "@/components/ui/dialog";
import {
    Wifi,
    Coffee,
    Utensils,
    Car,
    Tv,
    Wind,
    Star,
    MapPin,
    Share2,
    Heart
} from "lucide-react";
import * as VisuallyHidden from "@radix-ui/react-visually-hidden";

// Mock Data
const HOTEL_DATA = {
    id: "1",
    name: "Azure Coastal Resin",
    location: "Maldives, South Atoll",
    description: "Experience the ultimate luxury at Azure Coastal Resin. Nestled in the heart of South Atoll, our resort offers breathtaking ocean views, private villas with direct water access, and world-class amenities. Perfect for honeymoons, family vacations, or a peaceful retreat.",
    price: 450,
    rating: 4.9,
    reviews: 128,
    amenities: [
        { icon: Wifi, label: "Free Wifi" },
        { icon: Coffee, label: "Breakfast" },
        { icon: Utensils, label: "Restaurant" },
        { icon: Car, label: "Parking" },
        { icon: Tv, label: "TV" },
        { icon: Wind, label: "AC" },
    ],
    images: [
        "https://images.unsplash.com/photo-1571003123894-1f0594d2b5d9?q=80&w=2649&auto=format&fit=crop",
        "https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?q=80&w=2670&auto=format&fit=crop",
        "https://images.unsplash.com/photo-1618773928121-c32242e63f39?q=80&w=2670&auto=format&fit=crop",
        "https://images.unsplash.com/photo-1590490360182-c33d57733427?q=80&w=2674&auto=format&fit=crop",
        "https://images.unsplash.com/photo-1596394516093-501ba68a0ba6?q=80&w=2670&auto=format&fit=crop",
    ],
    reviewsList: [
        {
            id: 1,
            user: "Alice Johnson",
            avatar: "https://i.pravatar.cc/150?u=a042581f4e29026024d",
            rating: 5,
            date: "Oct 2023",
            comment: "Absolutely stunning! The view from the water villa was incredible. Staff was super friendly."
        },
        {
            id: 2,
            user: "Michael Smith",
            avatar: "https://i.pravatar.cc/150?u=a042581f4e29026704d",
            rating: 4,
            date: "Sep 2023",
            comment: "Great experience overall. The food was amazing, but the wifi was a bit spotty in the room."
        }
    ]
};

export default function HotelDetailPage({ params }: { params: Promise<{ id: string }> }) {
    // Unwrap params using React.use() or await if async component. Next.js 16 params are async.
    // Since this is a client component, I can't await params directly in the component body easily if it were server component.
    // Using React.use() is the modern way if it was passed as valid promise, but easiest is just ignoring params for mock data for now
    // or use `React.use()` if strictly following Next 15/16 patterns for Client Components with async params.
    // Actually, for client components in Next 15+, params is a Promise.
    // Let's just use the mock data.

    const hotel = HOTEL_DATA;
    const [activeImage, setActiveImage] = useState(0);

    return (
        <div className="container mx-auto px-4 py-8">
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start mb-6 gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-slate-900">{hotel.name}</h1>
                    <div className="flex items-center gap-2 text-slate-500 mt-2">
                        <MapPin className="h-4 w-4" />
                        <span>{hotel.location}</span>
                    </div>
                </div>
                <div className="flex items-center gap-4">
                    <Button variant="outline" size="sm" className="hidden md:flex">
                        <Share2 className="mr-2 h-4 w-4" /> Share
                    </Button>
                    <Button variant="outline" size="sm" className="hidden md:flex">
                        <Heart className="mr-2 h-4 w-4" /> Save
                    </Button>
                </div>
            </div>

            {/* Gallery */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8 h-[400px] md:h-[500px]">
                {/* Main Image */}
                <div className="md:col-span-2 row-span-2 relative rounded-xl overflow-hidden cursor-pointer group">
                    <Image
                        src={hotel.images[0]}
                        alt="Main View"
                        fill
                        className="object-cover transition-transform duration-500 group-hover:scale-105"
                        priority
                    />
                </div>

                {/* Secondary Images */}
                <div className="hidden md:block relative rounded-xl overflow-hidden cursor-pointer group">
                    <Image src={hotel.images[1]} alt="View 2" fill className="object-cover transition-transform duration-500 group-hover:scale-105" />
                </div>
                <div className="hidden md:block relative rounded-xl overflow-hidden cursor-pointer group">
                    <Image src={hotel.images[2]} alt="View 3" fill className="object-cover transition-transform duration-500 group-hover:scale-105" />
                </div>
                <div className="hidden md:block relative rounded-xl overflow-hidden cursor-pointer group">
                    <Image src={hotel.images[3]} alt="View 4" fill className="object-cover transition-transform duration-500 group-hover:scale-105" />
                </div>

                {/* View All Button Image */}
                <div className="hidden md:block relative rounded-xl overflow-hidden cursor-pointer group">
                    <Image src={hotel.images[4]} alt="View 5" fill className="object-cover transition-transform duration-500 group-hover:scale-105" />
                    <Dialog>
                        <DialogTrigger asChild>
                            <div className="absolute inset-0 bg-black/40 flex items-center justify-center transition-opacity hover:bg-black/50">
                                <span className="text-white font-semibold text-lg">+ View All</span>
                            </div>
                        </DialogTrigger>
                        <DialogContent className="max-w-5xl h-[90vh] p-0 overflow-hidden bg-black/95 border-none">
                            <VisuallyHidden.Root>
                                <DialogTitle>Image Gallery</DialogTitle>
                            </VisuallyHidden.Root>
                            <div className="relative w-full h-full flex items-center justify-center p-4">
                                <div className="relative w-full h-full">
                                    <Image
                                        src={hotel.images[activeImage]}
                                        alt="Gallery Full"
                                        fill
                                        className="object-contain"
                                    />
                                </div>

                                {/* Thumbnails in Dialog */}
                                <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2 overflow-x-auto max-w-full p-2">
                                    {hotel.images.map((img, idx) => (
                                        <button
                                            key={idx}
                                            onClick={() => setActiveImage(idx)}
                                            className={`relative w-16 h-16 rounded-md overflow-hidden border-2 transition-colors ${activeImage === idx ? 'border-white' : 'border-transparent opacity-70 hover:opacity-100'}`}
                                        >
                                            <Image src={img} alt="" fill className="object-cover" />
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </DialogContent>
                    </Dialog>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {/* Left Content */}
                <div className="md:col-span-2 space-y-8">

                    {/* Description */}
                    <div>
                        <h2 className="text-2xl font-bold mb-4">About this place</h2>
                        <p className="text-slate-600 leading-relaxed">
                            {hotel.description}
                        </p>
                    </div>

                    <Separator />

                    {/* Amenities */}
                    <div>
                        <h2 className="text-2xl font-bold mb-4">Amenities</h2>
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                            {hotel.amenities.map((item, idx) => (
                                <div key={idx} className="flex items-center gap-3 text-slate-600">
                                    <item.icon className="h-5 w-5 text-slate-900" />
                                    <span>{item.label}</span>
                                </div>
                            ))}
                        </div>
                    </div>

                    <Separator />

                    {/* Reviews */}
                    <div>
                        <div className="flex items-center gap-2 mb-6">
                            <h2 className="text-2xl font-bold">Reviews</h2>
                            <div className="flex items-center gap-1 text-sm bg-blue-50 text-blue-700 px-2 py-1 rounded-full font-semibold">
                                <Star className="h-4 w-4 fill-blue-700" />
                                {hotel.rating} ({hotel.reviews} reviews)
                            </div>
                        </div>

                        <div className="space-y-6">
                            {hotel.reviewsList.map((review) => (
                                <div key={review.id} className="bg-slate-50 p-6 rounded-xl">
                                    <div className="flex items-center gap-4 mb-4">
                                        <Avatar>
                                            <AvatarImage src={review.avatar} />
                                            <AvatarFallback>{review.user[0]}</AvatarFallback>
                                        </Avatar>
                                        <div>
                                            <h4 className="font-semibold text-slate-900">{review.user}</h4>
                                            <span className="text-slate-500 text-sm">{review.date}</span>
                                        </div>
                                        <div className="ml-auto flex gap-1">
                                            {Array.from({ length: 5 }).map((_, i) => (
                                                <Star
                                                    key={i}
                                                    className={`h-4 w-4 ${i < review.rating ? 'fill-amber-500 text-amber-500' : 'text-slate-300'}`}
                                                />
                                            ))}
                                        </div>
                                    </div>
                                    <p className="text-slate-600">
                                        "{review.comment}"
                                    </p>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Right Sidebar - Sticky Booking Widget */}
                <div className="relative">
                    <BookingWidget pricePerNight={hotel.price} />
                </div>
            </div>
        </div>
    );
}
