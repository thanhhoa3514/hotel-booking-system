import { SearchBar } from "@/components/features/search-bar";
import { HotelCard } from "@/components/features/hotel-card";

// Mock data for featured hotels
const FEATURED_HOTELS = [
    {
        id: "1",
        name: "Azure Coastal Resin",
        location: "Maldives, South Atoll",
        price: 450,
        rating: 4.9,
        imageUrl: "https://images.unsplash.com/photo-1571003123894-1f0594d2b5d9?q=80&w=2649&auto=format&fit=crop",
    },
    {
        id: "2",
        name: "Urban Heights Luxury",
        location: "New York, Manhattan",
        price: 320,
        rating: 4.7,
        imageUrl: "https://images.unsplash.com/photo-1566073771259-6a8506099945?q=80&w=2670&auto=format&fit=crop",
    },
    {
        id: "3",
        name: "Serenity Mountain Lodge",
        location: "Swiss Alps, Zermatt",
        price: 550,
        rating: 4.95,
        imageUrl: "https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?q=80&w=2670&auto=format&fit=crop",
    },
];

export default function HomePage() {
    return (
        <div className="flex flex-col min-h-screen">
            {/* Hero Section */}
            <section className="relative h-[85vh] w-full flex items-center justify-center">
                {/* Background Image */}
                <div
                    className="absolute inset-0 z-0 bg-cover bg-center bg-no-repeat"
                    style={{
                        backgroundImage: 'url("https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?q=80&w=2670&auto=format&fit=crop")',
                    }}
                >
                    {/* Overlay */}
                    <div className="absolute inset-0 bg-black/30 backdrop-blur-[2px]" />
                </div>

                {/* Hero Content */}
                <div className="relative z-10 w-full container mx-auto px-4 flex flex-col items-center gap-8 animate-in fade-in slide-in-from-bottom-10 duration-700">
                    <div className="text-center space-y-4 max-w-3xl">
                        <h1 className="text-4xl md:text-6xl font-bold text-white tracking-tight drop-shadow-md">
                            Find Your Perfect <span className="text-orange-200">Escape</span>
                        </h1>
                        <p className="text-lg md:text-xl text-white/90 font-light drop-shadow">
                            Discover luxury hotels, resorts, and unique stays around the world.
                        </p>
                    </div>

                    {/* Floating Search Bar */}
                    <div className="w-full max-w-4xl mt-4">
                        <SearchBar />
                    </div>
                </div>
            </section>

            {/* Featured Hotels Section */}
            <section className="py-20 bg-slate-50">
                <div className="container mx-auto px-4">
                    <div className="text-center mb-12 space-y-2">
                        <h2 className="text-3xl font-bold text-slate-900">Featured Destinations</h2>
                        <p className="text-slate-500">Hand-picked properties for your next memorable trip.</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {FEATURED_HOTELS.map((hotel) => (
                            <HotelCard
                                key={hotel.id}
                                {...hotel}
                            />
                        ))}
                    </div>
                </div>
            </section>
        </div>
    );
}
