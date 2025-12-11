import { z } from 'zod';

export const createBookingSchema = z.object({
  roomIds: z
    .array(z.string())
    .min(1, { message: 'Vui lòng chÍn ít nh¥t mÙt phòng' }),
  checkInDate: z.date({ required_error: 'Ngày nh­n phòng là b¯t buÙc' }),
  checkOutDate: z.date({ required_error: 'Ngày tr£ phòng là b¯t buÙc' }),
  guestName: z
    .string()
    .min(2, { message: 'Tên khách ph£i có ít nh¥t 2 ký tñ' }),
  guestEmail: z
    .string()
    .email({ message: 'Email không hãp lÇ' }),
  guestPhone: z
    .string()
    .min(10, { message: 'SÑ iÇn tho¡i ph£i có ít nh¥t 10 sÑ' }),
  guestIdNumber: z.string().optional(),
  numberOfGuests: z
    .number()
    .int()
    .positive({ message: 'SÑ l°ãng khách ph£i lÛn h¡n 0' }),
  specialRequests: z.string().optional(),
  promotionCode: z.string().optional(),
}).refine(
  (data) => {
    if (data.checkInDate && data.checkOutDate) {
      return data.checkOutDate > data.checkInDate;
    }
    return true;
  },
  {
    message: 'Ngày tr£ phòng ph£i sau ngày nh­n phòng',
    path: ['checkOutDate'],
  }
);

export type CreateBookingFormData = z.infer<typeof createBookingSchema>;

export const cancelBookingSchema = z.object({
  cancelReason: z
    .string()
    .min(10, { message: 'Lý do hçy ph£i có ít nh¥t 10 ký tñ' }),
});

export type CancelBookingFormData = z.infer<typeof cancelBookingSchema>;

export const checkAvailabilitySchema = z.object({
  roomTypeId: z.string().optional(),
  checkInDate: z.date({ required_error: 'Ngày nh­n phòng là b¯t buÙc' }),
  checkOutDate: z.date({ required_error: 'Ngày tr£ phòng là b¯t buÙc' }),
  numberOfRooms: z.number().int().positive().default(1).optional(),
}).refine(
  (data) => {
    if (data.checkInDate && data.checkOutDate) {
      return data.checkOutDate > data.checkInDate;
    }
    return true;
  },
  {
    message: 'Ngày tr£ phòng ph£i sau ngày nh­n phòng',
    path: ['checkOutDate'],
  }
);

export type CheckAvailabilityFormData = z.infer<typeof checkAvailabilitySchema>;
