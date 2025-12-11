import { z } from 'zod';

export const createBookingSchema = z.object({
  roomIds: z
    .array(z.string())
    .min(1, { message: 'Vui long chon it nhat mot phong' }),
  checkInDate: z.date({ required_error: 'Ngay nhap phong la buoc' }),
  checkOutDate: z.date({ required_error: 'Ngay tra phong la buoc' }),
  guestName: z
    .string()
    .min(2, { message: 'Ten khach phai it nhat 2 ky tu' }),
  guestEmail: z
    .string()
    .email({ message: 'Email khong hop le' }),
  guestPhone: z
    .string()
    .min(10, { message: 'So dien thoai phai it nhat 10 so' }),
  guestIdNumber: z.string().optional(),
  numberOfGuests: z
    .number()
    .int()
    .positive({ message: 'So luong khach phai lon hon 0' }),
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
    message: 'Ngay tra phong phai sau ngay nhap phong',
    path: ['checkOutDate'],
  }
);

export type CreateBookingFormData = z.infer<typeof createBookingSchema>;

export const cancelBookingSchema = z.object({
  cancelReason: z
    .string()
    .min(10, { message: 'Ly do huy phai it nhat 10 ky tu' }),
});

export type CancelBookingFormData = z.infer<typeof cancelBookingSchema>;

export const checkAvailabilitySchema = z.object({
  roomTypeId: z.string().optional(),
  checkInDate: z.date({ required_error: 'Ngay nhap phong la buoc' }),
  checkOutDate: z.date({ required_error: 'Ngay tra phong la buoc' }),
  numberOfRooms: z.number().int().positive().default(1).optional(),
}).refine(
  (data) => {
    if (data.checkInDate && data.checkOutDate) {
      return data.checkOutDate > data.checkInDate;
    }
    return true;
  },
  {
    message: 'Ngay tra phong phai sau ngay nhap phong',
    path: ['checkOutDate'],
  }
);

export type CheckAvailabilityFormData = z.infer<typeof checkAvailabilitySchema>;
