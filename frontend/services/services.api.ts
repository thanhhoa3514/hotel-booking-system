import { api } from "./api";

// Types
export interface Service {
    id: string;
    name: string;
    slug: string;
    description: string | null;
    category: ServiceCategory;
    pricingType: ServicePricingType;
    basePrice: number;
    isActive: boolean;
    requiresBooking: boolean;
    maxCapacity: number | null;
    operatingHours: OperatingHours | null;
    duration: number | null;
    imageUrl: string | null;
    displayOrder: number;
    createdAt: string;
    updatedAt: string;
}

export type ServiceCategory =
    | "FOOD_BEVERAGE"
    | "SPA_WELLNESS"
    | "RECREATION"
    | "TRANSPORTATION"
    | "BUSINESS"
    | "LAUNDRY"
    | "CONCIERGE"
    | "ROOM_SERVICE"
    | "OTHER";

export type ServicePricingType =
    | "FIXED"
    | "PER_HOUR"
    | "PER_PERSON"
    | "PER_ITEM";

export interface OperatingHours {
    [day: string]: {
        open?: string;
        close?: string;
        isClosed?: boolean;
    };
}

export interface CreateServiceDto {
    name: string;
    slug: string;
    description?: string;
    category: ServiceCategory;
    pricingType: ServicePricingType;
    basePrice: number;
    isActive?: boolean;
    requiresBooking?: boolean;
    maxCapacity?: number;
    operatingHours?: OperatingHours;
    duration?: number;
    imageUrl?: string;
    displayOrder?: number;
}

export interface UpdateServiceDto extends Partial<CreateServiceDto> { }

export interface ServicesResponse {
    data: Service[];
    meta: {
        total: number;
        page: number;
        limit: number;
        totalPages: number;
    };
}

export interface ServicesFilters {
    category?: ServiceCategory;
    isActive?: boolean;
    search?: string;
    page?: number;
    limit?: number;
}

export const servicesApi = {
    /**
     * Get all services with filters
     */
    getServices: async (filters?: ServicesFilters): Promise<ServicesResponse> => {
        const params = new URLSearchParams();

        if (filters?.category) params.append("category", filters.category);
        if (filters?.isActive !== undefined)
            params.append("isActive", String(filters.isActive));
        if (filters?.search) params.append("search", filters.search);
        if (filters?.page) params.append("page", String(filters.page));
        if (filters?.limit) params.append("limit", String(filters.limit));

        const response = await api.get<ServicesResponse>(
            `/services?${params.toString()}`
        );
        return response.data;
    },

    /**
     * Get service by ID
     */
    getService: async (id: string): Promise<Service> => {
        const response = await api.get<Service>(`/services/${id}`);
        return response.data;
    },

    /**
     * Get services by category
     */
    getServicesByCategory: async (category: ServiceCategory): Promise<Service[]> => {
        const response = await api.get<Service[]>(`/services/category/${category}`);
        return response.data;
    },

    /**
     * Create a new service (admin/manager only)
     */
    createService: async (data: CreateServiceDto): Promise<Service> => {
        const response = await api.post<Service>("/services", data);
        return response.data;
    },

    /**
     * Update a service (admin/manager only)
     */
    updateService: async (id: string, data: UpdateServiceDto): Promise<Service> => {
        const response = await api.patch<Service>(`/services/${id}`, data);
        return response.data;
    },

    /**
     * Delete a service (admin only)
     */
    deleteService: async (id: string): Promise<void> => {
        await api.delete(`/services/${id}`);
    },
};

// Helper functions
export const getCategoryLabel = (category: ServiceCategory): string => {
    const labels: Record<ServiceCategory, string> = {
        FOOD_BEVERAGE: "An uong",
        SPA_WELLNESS: "Spa & Wellness",
        RECREATION: "Giai tri",
        TRANSPORTATION: "Van chuyen",
        BUSINESS: "Doanh nghiep",
        LAUNDRY: "Giat ui",
        CONCIERGE: "Concierge",
        ROOM_SERVICE: "Phuc vu phong",
        OTHER: "Khac",
    };
    return labels[category] || category;
};

export const getPricingTypeLabel = (pricingType: ServicePricingType): string => {
    const labels: Record<ServicePricingType, string> = {
        FIXED: "Co dinh",
        PER_HOUR: "/gio",
        PER_PERSON: "/nguoi",
        PER_ITEM: "/mon",
    };
    return labels[pricingType] || pricingType;
};

export const formatServicePrice = (
    basePrice: number,
    pricingType: ServicePricingType
): string => {
    const formatted = new Intl.NumberFormat("vi-VN", {
        style: "currency",
        currency: "VND",
    }).format(basePrice);

    if (pricingType === "FIXED") return formatted;
    return `${formatted}${getPricingTypeLabel(pricingType)}`;
};

