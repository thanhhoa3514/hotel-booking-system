import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';

// Enums
export const BookingStatusEnum = z.enum([
  'PENDING',
  'CONFIRMED',
  'CHECKED_IN',
  'CHECKED_OUT',
  'CANCELLED',
  'NO_SHOW',
]);

export const BookingSourceEnum = z.enum([
  'WEBSITE',
  'PHONE',
  'WALK_IN',
  'OTA',
]);

// Create Booking DTO
export const CreateBookingSchema = z.object({
  userId: z.string().uuid({ message: 'ID người dùng không hợp lệ' }),
  roomIds: z
    .array(z.string().uuid({ message: 'ID phòng không hợp lệ' }))
    .min(1, { message: 'Phải chọn ít nhất 1 phòng' }),
  checkInDate: z.coerce.date({ message: 'Ngày nhận phòng không hợp lệ' }),
  checkOutDate: z.coerce.date({ message: 'Ngày trả phòng không hợp lệ' }),
  guestName: z.string().min(2, { message: 'Tên khách phải có ít nhất 2 ký tự' }),
  guestEmail: z.string().email({ message: 'Email không hợp lệ' }),
  guestPhone: z.string().min(10, { message: 'Số điện thoại không hợp lệ' }),
  guestIdNumber: z.string().optional(),
  numberOfGuests: z
    .number()
    .int()
    .positive({ message: 'Số lượng khách phải lớn hơn 0' }),
  specialRequests: z.string().optional(),
  promotionCode: z.string().optional(),
  bookingSource: BookingSourceEnum.default('WEBSITE'),
});

export class CreateBookingDto extends createZodDto(CreateBookingSchema) {}

// Update Booking DTO
export const UpdateBookingSchema = z.object({
  guestName: z.string().min(2).optional(),
  guestEmail: z.string().email().optional(),
  guestPhone: z.string().min(10).optional(),
  guestIdNumber: z.string().optional(),
  numberOfGuests: z.number().int().positive().optional(),
  specialRequests: z.string().optional(),
  checkInDate: z.coerce.date().optional(),
  checkOutDate: z.coerce.date().optional(),
});

export class UpdateBookingDto extends createZodDto(UpdateBookingSchema) {}

// Update Booking Status DTO
export const UpdateBookingStatusSchema = z.object({
  status: BookingStatusEnum,
  staffNotes: z.string().optional(),
});

export class UpdateBookingStatusDto extends createZodDto(
  UpdateBookingStatusSchema,
) {}

// Cancel Booking DTO
export const CancelBookingSchema = z.object({
  cancelReason: z
    .string()
    .min(10, { message: 'Lý do hủy phải có ít nhất 10 ký tự' }),
});

export class CancelBookingDto extends createZodDto(CancelBookingSchema) {}

// Check Availability DTO
export const CheckAvailabilitySchema = z.object({
  roomTypeId: z
    .string()
    .uuid({ message: 'ID loại phòng không hợp lệ' })
    .optional(),
  checkInDate: z.coerce.date({ message: 'Ngày nhận phòng không hợp lệ' }),
  checkOutDate: z.coerce.date({ message: 'Ngày trả phòng không hợp lệ' }),
  numberOfRooms: z
    .number()
    .int()
    .positive()
    .default(1)
    .optional(),
});

export class CheckAvailabilityDto extends createZodDto(
  CheckAvailabilitySchema,
) {}

// Query DTO for listing bookings
export const QueryBookingsSchema = z.object({
  status: BookingStatusEnum.optional(),
  userId: z.string().uuid().optional(),
  checkInDate: z.coerce.date().optional(),
  checkOutDate: z.coerce.date().optional(),
  page: z.number().int().positive().default(1).optional(),
  limit: z.number().int().positive().max(100).default(20).optional(),
});

export class QueryBookingsDto extends createZodDto(QueryBookingsSchema) {}
