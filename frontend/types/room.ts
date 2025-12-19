export type RoomStatus = 'AVAILABLE' | 'OCCUPIED' | 'MAINTENANCE' | 'CLEANING' | 'OUT_OF_ORDER';
export type BedType = 'SINGLE' | 'DOUBLE' | 'QUEEN' | 'KING' | 'TWIN';

export interface RoomType {
  id: string;
  name: string;
  slug: string;
  description?: string;
  basePrice: number;
  capacity: number;
  maxOccupancy?: number;
  bedType: BedType;
  bedCount: number;
  size?: number;
  amenities: string[] | string;
  displayOrder: number;
  isActive: boolean;
  images?: RoomImage[];
  createdAt: string;
  updatedAt: string;
}

export interface RoomImage {
  id: string;
  roomTypeId: string;
  url: string;
  caption?: string;
  isPrimary: boolean;
  displayOrder: number;
}

export interface Room {
  id: string;
  roomNumber: string;
  floor: number;
  status: RoomStatus;
  typeId: string;
  roomType?: RoomType;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}
