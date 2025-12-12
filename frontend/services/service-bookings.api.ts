import { api } from "./api";
import { Service } from "./services.api";

// Types
export type ServiceBookingStatus =
    | "PENDING"
    | "CONFIRMED"
    | "IN_PROGRESS"
    | "COMPLETED"
    | "CANCELLED"
    | "NO_SHOW";

export interface ServiceBooking {
    id: string;
    bookingCode: string;
    serviceId: string;
    service: Pick<Service, "id" | "name" | "category" | "imageUrl">;
    bookingId: string;
    booking: {
        id: string;
        bookingCode: string;
        guestName: string;
    };
    guestName: string;
    guestPhone: string;
    roomNumber: string;
    scheduledDate: string;
    scheduledTime: string;
    duration: number | null;
    quantity: number;
    unitPrice: number;
    totalPrice: number;
    status: ServiceBookingStatus;
    startedAt: string | null;
    completedAt: string | null;
    assignedStaffId: string | null;
    assignedStaff: {
        id: string;
        fullName: string;
        email: string;
    } | null;
    specialRequests: string | null;
    staffNotes: string | null;
    cancelledAt: string | null;
    cancelReason: string | null;
    isChargedToRoom: boolean;
    chargedAt: string | null;
    createdAt: string;
    updatedAt: string;
}

export interface CreateServiceBookingDto {
    serviceId: string;
    bookingId: string;
    scheduledDate: string;
    scheduledTime: string;
    duration?: number;
    quantity?: number;
    specialRequests?: string;
}

export interface UpdateServiceBookingDto {
    scheduledDate?: string;
    scheduledTime?: string;
    duration?: number;
    quantity?: number;
    specialRequests?: string;
}

export interface UpdateServiceBookingStatusDto {
    status: ServiceBookingStatus;
    staffNotes?: string;
}

export interface AssignStaffDto {
    assignedStaffId: string;
    staffNotes?: string;
}

export interface CancelServiceBookingDto {
    cancelReason?: string;
}

export interface ServiceBookingsResponse {
    data: ServiceBooking[];
    meta: {
        total: number;
        page: number;
        limit: number;
        totalPages: number;
    };
}

export interface ServiceBookingsFilters {
    status?: ServiceBookingStatus;
    bookingId?: string;
    serviceId?: string;
    assignedStaffId?: string;
    scheduledDate?: string;
    page?: number;
    limit?: number;
}

export const serviceBookingsApi = {
    /**
     * Create a new service booking
     */
    createServiceBooking: async (
        data: CreateServiceBookingDto
    ): Promise<ServiceBooking> => {
        const response = await api.post<ServiceBooking>("/service-bookings", data);
        return response.data;
    },

    /**
     * Get all service bookings with filters
     */
    getServiceBookings: async (
        filters?: ServiceBookingsFilters
    ): Promise<ServiceBookingsResponse> => {
        const params = new URLSearchParams();

        if (filters?.status) params.append("status", filters.status);
        if (filters?.bookingId) params.append("bookingId", filters.bookingId);
        if (filters?.serviceId) params.append("serviceId", filters.serviceId);
        if (filters?.assignedStaffId)
            params.append("assignedStaffId", filters.assignedStaffId);
        if (filters?.scheduledDate)
            params.append("scheduledDate", filters.scheduledDate);
        if (filters?.page) params.append("page", String(filters.page));
        if (filters?.limit) params.append("limit", String(filters.limit));

        const response = await api.get<ServiceBookingsResponse>(
            `/service-bookings?${params.toString()}`
        );
        return response.data;
    },

    /**
     * Get service booking by ID
     */
    getServiceBooking: async (id: string): Promise<ServiceBooking> => {
        const response = await api.get<ServiceBooking>(`/service-bookings/${id}`);
        return response.data;
    },

    /**
     * Get service bookings by room booking ID (for checkout)
     */
    getServiceBookingsByBookingId: async (
        bookingId: string
    ): Promise<ServiceBooking[]> => {
        const response = await api.get<ServiceBooking[]>(
            `/service-bookings/booking/${bookingId}`
        );
        return response.data;
    },

    /**
     * Update service booking (PENDING status only)
     */
    updateServiceBooking: async (
        id: string,
        data: UpdateServiceBookingDto
    ): Promise<ServiceBooking> => {
        const response = await api.patch<ServiceBooking>(
            `/service-bookings/${id}`,
            data
        );
        return response.data;
    },

    /**
     * Update service booking status (staff only)
     */
    updateServiceBookingStatus: async (
        id: string,
        data: UpdateServiceBookingStatusDto
    ): Promise<ServiceBooking> => {
        const response = await api.patch<ServiceBooking>(
            `/service-bookings/${id}/status`,
            data
        );
        return response.data;
    },

    /**
     * Assign staff to service booking
     */
    assignStaff: async (
        id: string,
        data: AssignStaffDto
    ): Promise<ServiceBooking> => {
        const response = await api.patch<ServiceBooking>(
            `/service-bookings/${id}/assign-staff`,
            data
        );
        return response.data;
    },

    /**
     * Cancel service booking
     */
    cancelServiceBooking: async (
        id: string,
        data?: CancelServiceBookingDto
    ): Promise<ServiceBooking> => {
        const response = await api.delete<ServiceBooking>(
            `/service-bookings/${id}/cancel`,
            { data }
        );
        return response.data;
    },
};

// Helper functions
export const getStatusLabel = (status: ServiceBookingStatus): string => {
    const labels: Record<ServiceBookingStatus, string> = {
        PENDING: "Cho xu ly",
        CONFIRMED: "Da xac nhan",
        IN_PROGRESS: "Dang thuc hien",
        COMPLETED: "Hoan thanh",
        CANCELLED: "Da huy",
        NO_SHOW: "Khong den",
    };
    return labels[status] || status;
};

export const getStatusColor = (
    status: ServiceBookingStatus
): { bg: string; text: string } => {
    const colors: Record<ServiceBookingStatus, { bg: string; text: string }> = {
        PENDING: {
            bg: "bg-yellow-100 dark:bg-yellow-900/30",
            text: "text-yellow-700 dark:text-yellow-400",
        },
        CONFIRMED: {
            bg: "bg-blue-100 dark:bg-blue-900/30",
            text: "text-blue-700 dark:text-blue-400",
        },
        IN_PROGRESS: {
            bg: "bg-purple-100 dark:bg-purple-900/30",
            text: "text-purple-700 dark:text-purple-400",
        },
        COMPLETED: {
            bg: "bg-emerald-100 dark:bg-emerald-900/30",
            text: "text-emerald-700 dark:text-emerald-400",
        },
        CANCELLED: {
            bg: "bg-red-100 dark:bg-red-900/30",
            text: "text-red-700 dark:text-red-400",
        },
        NO_SHOW: {
            bg: "bg-slate-100 dark:bg-slate-900/30",
            text: "text-slate-700 dark:text-slate-400",
        },
    };
    return colors[status] || { bg: "bg-slate-100", text: "text-slate-700" };
};

