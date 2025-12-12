import { api } from "./api";
import { Booking, CreateBookingDto, UpdateBookingDto } from "@/types/booking";

export interface BookingsResponse {
  data: Booking[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export interface BookingsFilters {
  status?: string;
  userId?: string;
  checkInDate?: string;
  checkOutDate?: string;
  page?: number;
  limit?: number;
}

export const bookingsApi = {
  /**
   * Create a new booking
   */
  createBooking: async (data: CreateBookingDto): Promise<Booking> => {
    const response = await api.post<Booking>("/bookings", data);
    return response.data;
  },

  /**
   * Get all bookings with filters
   */
  getBookings: async (filters?: BookingsFilters): Promise<BookingsResponse> => {
    const params = new URLSearchParams();

    if (filters?.status) params.append("status", filters.status);
    if (filters?.userId) params.append("userId", filters.userId);
    if (filters?.checkInDate) params.append("checkInDate", filters.checkInDate);
    if (filters?.checkOutDate)
      params.append("checkOutDate", filters.checkOutDate);
    if (filters?.page) params.append("page", filters.page.toString());
    if (filters?.limit) params.append("limit", filters.limit.toString());

    const response = await api.get<BookingsResponse>(
      `/bookings?${params.toString()}`
    );
    return response.data;
  },

  /**
   * Get booking by ID
   */
  getBooking: async (id: string): Promise<Booking> => {
    const response = await api.get<Booking>(`/bookings/${id}`);
    return response.data;
  },

  /**
   * Update booking
   */
  updateBooking: async (
    id: string,
    data: UpdateBookingDto
  ): Promise<Booking> => {
    const response = await api.patch<Booking>(`/bookings/${id}`, data);
    return response.data;
  },

  /**
   * Cancel booking
   */
  cancelBooking: async (id: string, cancelReason: string): Promise<Booking> => {
    const response = await api.delete<Booking>(`/bookings/${id}/cancel`, {
      data: { cancelReason },
    });
    return response.data;
  },

  /**
   * Update booking status (admin/receptionist only)
   */
  updateBookingStatus: async (
    id: string,
    status: string,
    staffNotes?: string
  ): Promise<Booking> => {
    const response = await api.patch<Booking>(`/bookings/${id}/status`, {
      status,
      staffNotes,
    });
    return response.data;
  },
};
