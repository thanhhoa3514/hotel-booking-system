"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { Search, AlertCircle } from "lucide-react";
import {
    servicesApi,
    Service,
    ServiceCategory,
    getCategoryLabel,
} from "@/services/services.api";
import { ServiceCard } from "./service-card";
import { OrderServiceDialog } from "./order-service-dialog";

interface ServiceCatalogProps {
    bookingId?: string;
    onOrderSuccess?: () => void;
}

const categories: { value: ServiceCategory | "ALL"; label: string }[] = [
    { value: "ALL", label: "Tat ca" },
    { value: "FOOD_BEVERAGE", label: "An uong" },
    { value: "SPA_WELLNESS", label: "Spa" },
    { value: "RECREATION", label: "Giai tri" },
    { value: "ROOM_SERVICE", label: "Phong" },
    { value: "TRANSPORTATION", label: "Van chuyen" },
    { value: "LAUNDRY", label: "Giat ui" },
    { value: "BUSINESS", label: "Doanh nghiep" },
];

export function ServiceCatalog({
    bookingId,
    onOrderSuccess,
}: ServiceCatalogProps) {
    const [selectedCategory, setSelectedCategory] = useState<
        ServiceCategory | "ALL"
    >("ALL");
    const [searchQuery, setSearchQuery] = useState("");
    const [selectedService, setSelectedService] = useState<Service | null>(null);
    const [isOrderDialogOpen, setIsOrderDialogOpen] = useState(false);

    const { data, isLoading, error } = useQuery({
        queryKey: ["services", selectedCategory, searchQuery],
        queryFn: () =>
            servicesApi.getServices({
                category: selectedCategory === "ALL" ? undefined : selectedCategory,
                isActive: true,
                search: searchQuery || undefined,
                limit: 50,
            }),
    });

    const handleOrderService = (service: Service) => {
        setSelectedService(service);
        setIsOrderDialogOpen(true);
    };

    const handleOrderSuccess = () => {
        setIsOrderDialogOpen(false);
        setSelectedService(null);
        onOrderSuccess?.();
    };

    if (error) {
        return (
            <Card className="border-0 shadow-lg rounded-2xl">
                <CardContent className="p-8 text-center">
                    <AlertCircle className="h-12 w-12 mx-auto mb-4 text-red-500" />
                    <h3 className="text-lg font-semibold mb-2">Khong the tai dich vu</h3>
                    <p className="text-muted-foreground">
                        Da xay ra loi khi tai danh sach dich vu. Vui long thu lai sau.
                    </p>
                </CardContent>
            </Card>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div>
                <h2 className="text-2xl font-bold bg-gradient-to-r from-slate-900 to-slate-600 dark:from-white dark:to-slate-400 bg-clip-text text-transparent">
                    Dich vu khach san
                </h2>
                <p className="text-muted-foreground mt-1">
                    Kham pha va dat cac dich vu tai khach san
                </p>
            </div>

            {/* Search and Category Tabs */}
            <Card className="border-0 shadow-lg shadow-slate-200/50 dark:shadow-slate-900/50 bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm rounded-2xl">
                <CardContent className="p-4 space-y-4">
                    {/* Search */}
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                            placeholder="Tim kiem dich vu..."
                            className="pl-10 rounded-xl border-0 bg-slate-100 dark:bg-slate-800"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>

                    {/* Category Tabs */}
                    <Tabs
                        value={selectedCategory}
                        onValueChange={(value) =>
                            setSelectedCategory(value as ServiceCategory | "ALL")
                        }
                    >
                        <TabsList className="w-full h-auto flex-wrap justify-start gap-2 bg-transparent p-0">
                            {categories.map((category) => (
                                <TabsTrigger
                                    key={category.value}
                                    value={category.value}
                                    className="rounded-xl data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-500 data-[state=active]:to-indigo-500 data-[state=active]:text-white data-[state=active]:shadow-lg"
                                >
                                    {category.label}
                                </TabsTrigger>
                            ))}
                        </TabsList>
                    </Tabs>
                </CardContent>
            </Card>

            {/* Services Grid */}
            {isLoading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {[...Array(6)].map((_, i) => (
                        <Card key={i} className="border-0 rounded-2xl overflow-hidden">
                            <Skeleton className="h-28 w-full" />
                            <CardContent className="p-4 space-y-3">
                                <Skeleton className="h-4 w-3/4" />
                                <Skeleton className="h-4 w-1/2" />
                                <Skeleton className="h-10 w-full rounded-xl" />
                            </CardContent>
                        </Card>
                    ))}
                </div>
            ) : data?.data.length === 0 ? (
                <Card className="border-0 shadow-lg rounded-2xl">
                    <CardContent className="p-8 text-center">
                        <Search className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                        <h3 className="text-lg font-semibold mb-2">
                            Khong tim thay dich vu
                        </h3>
                        <p className="text-muted-foreground">
                            Thu thay doi bo loc hoac tu khoa tim kiem.
                        </p>
                    </CardContent>
                </Card>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {data?.data.map((service) => (
                        <ServiceCard
                            key={service.id}
                            service={service}
                            onOrder={handleOrderService}
                            disabled={!bookingId}
                        />
                    ))}
                </div>
            )}

            {/* No booking warning */}
            {!bookingId && (
                <Card className="border-0 shadow-lg rounded-2xl bg-amber-50 dark:bg-amber-900/20">
                    <CardContent className="p-4 flex items-center gap-3">
                        <AlertCircle className="h-5 w-5 text-amber-600 dark:text-amber-400 shrink-0" />
                        <p className="text-sm text-amber-700 dark:text-amber-300">
                            Ban can co booking da check-in de dat dich vu. Vui long dang nhap
                            va chon booking cua ban.
                        </p>
                    </CardContent>
                </Card>
            )}

            {/* Order Dialog */}
            {selectedService && bookingId && (
                <OrderServiceDialog
                    open={isOrderDialogOpen}
                    onOpenChange={setIsOrderDialogOpen}
                    service={selectedService}
                    bookingId={bookingId}
                    onSuccess={handleOrderSuccess}
                />
            )}
        </div>
    );
}

