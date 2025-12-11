import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { roomsApi } from '@/services/rooms.api';
import { CheckAvailabilityDto } from '@/types/booking';

// Query keys
export const roomKeys = {
  all: ['rooms'] as const,
  lists: () => [...roomKeys.all, 'list'] as const,
  list: (filters?: any) => [...roomKeys.lists(), filters] as const,
  details: () => [...roomKeys.all, 'detail'] as const,
  detail: (id: string) => [...roomKeys.details(), id] as const,
};

export const roomTypeKeys = {
  all: ['room-types'] as const,
  lists: () => [...roomTypeKeys.all, 'list'] as const,
  details: () => [...roomTypeKeys.all, 'detail'] as const,
  detail: (id: string) => [...roomTypeKeys.details(), id] as const,
};

/**
 * Get all rooms
 */
export function useRooms(filters?: {
  typeId?: string;
  status?: string;
  floor?: number;
}) {
  return useQuery({
    queryKey: roomKeys.list(filters),
    queryFn: () => roomsApi.getRooms(filters),
  });
}

/**
 * Get room by ID
 */
export function useRoom(id: string) {
  return useQuery({
    queryKey: roomKeys.detail(id),
    queryFn: () => roomsApi.getRoom(id),
    enabled: !!id,
  });
}

/**
 * Get all room types
 */
export function useRoomTypes() {
  return useQuery({
    queryKey: roomTypeKeys.lists(),
    queryFn: () => roomsApi.getRoomTypes(),
  });
}

/**
 * Get room type by ID
 */
export function useRoomType(id: string) {
  return useQuery({
    queryKey: roomTypeKeys.detail(id),
    queryFn: () => roomsApi.getRoomType(id),
    enabled: !!id,
  });
}

/**
 * Check room availability
 */
export function useCheckAvailability() {
  return useMutation({
    mutationFn: (data: CheckAvailabilityDto) =>
      roomsApi.checkAvailability(data),
  });
}
