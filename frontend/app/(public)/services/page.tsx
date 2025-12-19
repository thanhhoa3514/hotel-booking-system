"use client";

import { useState, useMemo, JSX } from "react";
import { useQuery } from "@tanstack/react-query";
import {
    servicesApi,
    Service,
    ServiceCategory,
    getCategoryLabel,
} from "@/services/services.api";
import { ServiceCard } from "@/components/features/service-card";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
    Sparkles,
    Search,
    ChevronLeft,
    ChevronRight,
    UtensilsCrossed,
    Car,
    Shirt,
    Briefcase,
    Bell,
    Coffee,
    MoreHorizontal,
    LayoutGrid,
} from "lucide-react";

const categories: { value: ServiceCategory | "ALL"; label: string; icon: JSX.Element }[] = [
    { value: "ALL", label: "Tất cả", icon: <LayoutGrid className="h-4 w-4" /> },
    { value: "FOOD_BEVERAGE", label: "Ẩm thực", icon: <UtensilsCrossed className="h-4 w-4" /> },
    { value: "SPA_WELLNESS", label: "Spa & Wellness", icon: <Sparkles className="h-4 w-4" /> },
    { value: "RECREATION", label: "Giải trí", icon: <Coffee className="h-4 w-4" /> },
    { value: "TRANSPORTATION", label: "Vận chuyển", icon: <Car className="h-4 w-4" /> },
    { value: "LAUNDRY", label: "Giặt ủi", icon: <Shirt className="h-4 w-4" /> },
    { value: "BUSINESS", label: "Doanh nghiệp", icon: <Briefcase className="h-4 w-4" /> },
    { value: "ROOM_SERVICE", label: "Phục vụ phòng", icon: <Bell className="h-4 w-4" /> },
    { value: "OTHER", label: "Khác", icon: <MoreHorizontal className="h-4 w-4" /> },
];

export default function ServicesPage() {
    const [selectedCategory, setSelectedCategory] = useState<ServiceCategory | "ALL">("ALL");
    const [searchQuery, setSearchQuery] = useState("");
    const [page, setPage] = useState(1);
    const limit = 12;

    // Fetch services from API
    const { data: servicesData, isLoading, error } = useQuery({
        queryKey: ["services", page, limit, selectedCategory],
        queryFn: () =>
            servicesApi.getServices({
                page,
                limit,
                category: selectedCategory === "ALL" ? undefined : selectedCategory,
                isActive: true,
            }),
    });

    const services = servicesData?.data || [];
    const meta = servicesData?.meta;

    // Client-side search filter
    const filteredServices = useMemo(() => {
        if (!searchQuery.trim()) return services;
        const query = searchQuery.toLowerCase();
        return services.filter(
            (service) =>
                service.name.toLowerCase().includes(query) ||
                service.description?.toLowerCase().includes(query)
        );
    }, [services, searchQuery]);

    // Reset page when category changes
    const handleCategoryChange = (category: ServiceCategory | "ALL") => {
        setSelectedCategory(category);
        setPage(1);
    };

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
            {/* Hero Header */}
            <section className="relative py-16 bg-gradient-to-br from-orange-500 to-amber-500">
                <div className="absolute inset-0 bg-black/10" />
                <div className="container mx-auto px-4 relative z-10">
                    <div className="text-center text-white">
                        <h1 className="text-4xl md:text-5xl font-bold mb-4 drop-shadow-md">
                            Dịch vụ khách sạn
                        </h1>
                        <p className="text-lg md:text-xl opacity-90 max-w-2xl mx-auto">
                            Trải nghiệm các dịch vụ cao cấp được thiết kế riêng cho kỳ nghỉ hoàn hảo của bạn
                        </p>
                    </div>
                </div>
            </section>

            {/* Main Content */}
            <div className="container mx-auto px-4 py-12">
                {/* Search and Filters */}
                <div className="flex flex-col md:flex-row gap-4 mb-8">
                    {/* Search */}
                    <div className="relative flex-1 max-w-md">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                            placeholder="Tìm kiếm dịch vụ..."
                            className="pl-10 rounded-xl bg-white dark:bg-slate-900"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>
                </div>

                {/* Category Tabs */}
                <div className="flex flex-wrap gap-2 mb-8">
                    {categories.map((cat) => (
                        <Button
                            key={cat.value}
                            variant={selectedCategory === cat.value ? "default" : "outline"}
                            size="sm"
                            className={`rounded-full gap-2 ${selectedCategory === cat.value
                                ? "bg-gradient-to-r from-orange-500 to-amber-500 text-white border-0"
                                : "border-slate-200 dark:border-slate-700"
                                }`}
                            onClick={() => handleCategoryChange(cat.value)}
                        >
                            {cat.icon}
                            {cat.label}
                        </Button>
                    ))}
                </div>

                {/* Results Header */}
                <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-2">
                        <Sparkles className="h-5 w-5 text-orange-500" />
                        <span className="text-slate-600 dark:text-slate-400">
                            {isLoading
                                ? "Đang tải..."
                                : `${filteredServices.length} dịch vụ${meta ? ` (Tổng: ${meta.total})` : ""}`}
                        </span>
                    </div>
                </div>

                {/* Loading State */}
                {isLoading && (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                        {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
                            <div key={i} className="rounded-2xl overflow-hidden bg-white dark:bg-slate-900 shadow-lg">
                                <Skeleton className="h-48 w-full" />
                                <div className="p-5 space-y-3">
                                    <Skeleton className="h-5 w-3/4" />
                                    <Skeleton className="h-4 w-full" />
                                    <Skeleton className="h-4 w-2/3" />
                                    <Skeleton className="h-10 w-full mt-4" />
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {/* Error State */}
                {error && (
                    <div className="text-center py-12 bg-white dark:bg-slate-900 rounded-2xl shadow-lg">
                        <p className="text-red-500">Có lỗi xảy ra khi tải danh sách dịch vụ</p>
                    </div>
                )}

                {/* Empty State */}
                {!isLoading && !error && filteredServices.length === 0 && (
                    <div className="text-center py-16 bg-white dark:bg-slate-900 rounded-2xl shadow-lg">
                        <Search className="h-12 w-12 text-slate-300 mx-auto mb-4" />
                        <h3 className="text-lg font-semibold text-slate-700 dark:text-slate-300 mb-2">
                            Không tìm thấy dịch vụ
                        </h3>
                        <p className="text-slate-500 dark:text-slate-400">
                            Hãy thử tìm kiếm với từ khóa khác hoặc chọn danh mục khác
                        </p>
                    </div>
                )}

                {/* Services Grid */}
                {!isLoading && !error && filteredServices.length > 0 && (
                    <>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                            {filteredServices.map((service: Service) => (
                                <ServiceCard key={service.id} service={service} />
                            ))}
                        </div>

                        {/* Pagination */}
                        {meta && meta.totalPages > 1 && (
                            <div className="flex items-center justify-center gap-4 mt-8">
                                <Button
                                    variant="outline"
                                    size="sm"
                                    disabled={page <= 1}
                                    onClick={() => setPage((p) => p - 1)}
                                    className="gap-2 rounded-xl"
                                >
                                    <ChevronLeft className="h-4 w-4" />
                                    Trước
                                </Button>
                                <span className="text-sm text-slate-600 dark:text-slate-400">
                                    Trang {meta.page} / {meta.totalPages}
                                </span>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    disabled={page >= meta.totalPages}
                                    onClick={() => setPage((p) => p + 1)}
                                    className="gap-2 rounded-xl"
                                >
                                    Sau
                                    <ChevronRight className="h-4 w-4" />
                                </Button>
                            </div>
                        )}
                    </>
                )}
            </div>
        </div>
    );
}
