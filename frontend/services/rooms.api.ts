import { api } from "./api";
import { Room, RoomType, RoomStatus } from "@/types/room";
import { CheckAvailabilityDto, AvailabilityResponse } from "@/types/booking";

export interface RoomTypesResponse {
  data: RoomType[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export interface CreateRoomData {
  roomNumber: string;
  floor: number;
  typeId: string;
  status?: RoomStatus;
  notes?: string;
}

export interface UpdateRoomData {
  roomNumber?: string;
  floor?: number;
  typeId?: string;
  status?: RoomStatus;
  notes?: string;
}

export interface RoomImageData {
  url: string;
  altText?: string;
  isPrimary: boolean;
  displayOrder: number;
}

export interface CreateRoomTypeData {
  name: string;
  description?: string;
  basePrice: number;
  capacity: number;
  bedType: 'SINGLE' | 'DOUBLE' | 'QUEEN' | 'KING' | 'TWIN';
  bedCount?: number;
  size?: number;
  amenities?: string[];
  displayOrder?: number;
  isActive?: boolean;
  images?: RoomImageData[];
}

export const roomsApi = {
  /**
   * Get all rooms with optional filters
   */
  getRooms: async (filters?: {
    typeId?: string;
    status?: string;
    floor?: number;
  }): Promise<Room[]> => {
    const params = new URLSearchParams();
    if (filters?.typeId) params.append("typeId", filters.typeId);
    if (filters?.status) params.append("status", filters.status);
    if (filters?.floor) params.append("floor", filters.floor.toString());

    const response = await api.get<Room[]>(`/rooms?${params.toString()}`);
    return response.data;
  },

  /**
   * Get room by ID
   */
  getRoom: async (id: string): Promise<Room> => {
    const response = await api.get<Room>(`/rooms/${id}`);
    return response.data;
  },

  /**
   * Create a new room
   */
  createRoom: async (data: CreateRoomData): Promise<Room> => {
    const response = await api.post<Room>("/rooms", data);
    return response.data;
  },

  /**
   * Update a room
   */
  updateRoom: async (id: string, data: UpdateRoomData): Promise<Room> => {
    const response = await api.patch<Room>(`/rooms/${id}`, data);
    return response.data;
  },

  /**
   * Delete a room
   */
  deleteRoom: async (id: string): Promise<void> => {
    await api.delete(`/rooms/${id}`);
  },

  /**
   * Update room status
   */
  updateRoomStatus: async (id: string, status: RoomStatus): Promise<Room> => {
    const response = await api.patch<Room>(`/rooms/${id}`, { status });
    return response.data;
  },

  /**
   * Get all room types with pagination
   */
  getRoomTypes: async (filters?: { page?: number; limit?: number }): Promise<RoomTypesResponse> => {
    const params = new URLSearchParams();
    if (filters?.page) params.append("page", filters.page.toString());
    if (filters?.limit) params.append("limit", filters.limit.toString());

    const response = await api.get<RoomTypesResponse>(`/room-types?${params.toString()}`);
    return response.data;
  },


  /**
   * Get room type by ID
   */
  getRoomType: async (id: string): Promise<RoomType> => {
    const response = await api.get<RoomType>(`/room-types/${id}`);
    return response.data;
  },

  /**
   * Create a new room type with images
   */
  createRoomType: async (data: CreateRoomTypeData): Promise<RoomType> => {
    const response = await api.post<RoomType>("/room-types", data);
    return response.data;
  },

  /**
   * Update a room type
   */
  updateRoomType: async (id: string, data: Partial<CreateRoomTypeData>): Promise<RoomType> => {
    const response = await api.patch<RoomType>(`/room-types/${id}`, data);
    return response.data;
  },

  /**
   * Delete a room type
   */
  deleteRoomType: async (id: string): Promise<void> => {
    await api.delete(`/room-types/${id}`);
  },

  /**
   * Check room availability for given dates
   */
  checkAvailability: async (
    data: CheckAvailabilityDto
  ): Promise<AvailabilityResponse> => {
    const response = await api.post<AvailabilityResponse>(
      "/bookings/check-availability",
      data
    );
    return response.data;
  },
};

