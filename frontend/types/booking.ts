import { Room } from './room';
import { User } from './auth';

export type BookingStatus =
  | 'PENDING'
  | 'CONFIRMED'
  | 'CHECKED_IN'
  | 'CHECKED_OUT'
  | 'CANCELLED'
  | 'NO_SHOW';

export interface Booking {
  id: string;
  bookingCode: string;
  userId: string;
  user?: User;

  // Guest information
  guestName: string;
  guestEmail: string;
  guestPhone: string;
  guestIdNumber?: string;

  // Booking dates
  checkInDate: string;
  checkOutDate: string;
  checkInTime?: string;
  checkOutTime?: string;
  numberOfGuests: number;
  numberOfNights: number;

  // Financial
  subtotal: number;
  taxAmount: number;
  serviceCharge: number;
  discountAmount: number;
  totalAmount: number;
  paidAmount: number;

  // Status
  status: BookingStatus;
  specialRequests?: string;
  staffNotes?: string;
  bookingSource?: string;

  // Cancellation
  cancelledAt?: string;
  cancelledBy?: string;
  cancelReason?: string;

  // Relations
  rooms?: BookingRoom[];
  payments?: Payment[];
  review?: Review;

  createdAt: string;
  updatedAt: string;
}

export interface BookingRoom {
  id: string;
  bookingId: string;
  roomId: string;
  room?: Room;
  pricePerNight: number;
  numberOfNights: number;
  totalPrice: number;
  createdAt: string;
}

export interface Payment {
  id: string;
  bookingId: string;
  amount: number;
  method: 'CASH' | 'CREDIT_CARD' | 'DEBIT_CARD' | 'BANK_TRANSFER' | 'MOMO' | 'VNPAY' | 'ZALOPAY';
  status: 'PENDING' | 'COMPLETED' | 'FAILED' | 'REFUNDED' | 'PARTIALLY_REFUNDED';
  transactionId?: string;
  paidAt?: string;
  notes?: string;
  createdAt: string;
}

export interface Review {
  id: string;
  bookingId: string;
  userId: string;
  rating: number;
  comment?: string;
  createdAt: string;
}

// DTOs for API requests
export interface CreateBookingDto {
  userId: string;
  roomIds: string[];
  checkInDate: string;
  checkOutDate: string;
  guestName: string;
  guestEmail: string;
  guestPhone: string;
  guestIdNumber?: string;
  numberOfGuests: number;
  specialRequests?: string;
  promotionCode?: string;
}

export interface UpdateBookingDto {
  guestName?: string;
  guestEmail?: string;
  guestPhone?: string;
  numberOfGuests?: number;
  specialRequests?: string;
}

export interface CheckAvailabilityDto {
  roomTypeId: string;
  checkInDate: string;
  checkOutDate: string;
  numberOfRooms?: number;
}

export interface AvailabilityResponse {
  available: boolean;
  availableRooms: Room[];
  totalAvailable: number;
}
