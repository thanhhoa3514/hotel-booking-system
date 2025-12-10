import Link from "next/link";
import Image from "next/image";
import { Star, MapPin } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";

interface HotelCardProps {
    id: string;
    name: string;
    location: string;
    price: number;
    rating: number;
    imageUrl: string;
}

export function HotelCard({ id, name, location, price, rating, imageUrl }: HotelCardProps) {
    return (
        <Link href={`/hotels/${id}`}>
            <Card className="group overflow-hidden border-none shadow-sm transition-all duration-300 hover:shadow-xl hover:-translate-y-1">
                <div className="relative aspect-video w-full overflow-hidden rounded-t-lg">
                    <Image
                        src={imageUrl}
                        alt={name}
                        fill
                        className="object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                    <div className="absolute top-2 right-2">
                        <Badge className="bg-white/90 text-slate-900 shadow-sm hover:bg-white">
                            <Star className="mr-1 h-3 w-3 fill-amber-500 text-amber-500" />
                            {rating}
                        </Badge>
                    </div>
                </div>
                <CardContent className="p-4">
                    <h3 className="text-lg font-bold text-slate-900">{name}</h3>
                    <div className="mt-2 flex items-center text-sm text-slate-500">
                        <MapPin className="mr-1 h-4 w-4" />
                        {location}
                    </div>
                </CardContent>
                <CardFooter className="flex items-center justify-between p-4 pt-0">
                    <div>
                        <span className="text-xl font-bold text-blue-600">${price}</span>
                        <span className="text-sm text-slate-500">/night</span>
                    </div>
                </CardFooter>
            </Card>
        </Link>
    );
}
