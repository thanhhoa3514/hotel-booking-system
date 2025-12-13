import { api } from "./api";
import { Room, RoomType, RoomStatus } from "@/types/room";
import { CheckAvailabilityDto, AvailabilityResponse } from "@/types/booking";

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
   * Get all room types
   */
  getRoomTypes: async (): Promise<RoomType[]> => {
    const response = await api.get<RoomType[]>("/room-types");
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

