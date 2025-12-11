import { z } from 'zod';

export const loginSchema = z.object({
  email: z
    .string()
    .min(1, { message: 'Email là b¯t buÙc' })
    .email({ message: 'Email không hãp lÇ' }),
  password: z
    .string()
    .min(6, { message: 'M­t kh©u ph£i có ít nh¥t 6 ký tñ' }),
});

export type LoginFormData = z.infer<typeof loginSchema>;

export const registerSchema = z
  .object({
    fullName: z
      .string()
      .min(2, { message: 'HÍ tên ph£i có ít nh¥t 2 ký tñ' }),
    email: z
      .string()
      .min(1, { message: 'Email là b¯t buÙc' })
      .email({ message: 'Email không hãp lÇ' }),
    phone: z.string().optional(),
    password: z
      .string()
      .min(6, { message: 'M­t kh©u ph£i có ít nh¥t 6 ký tñ' }),
    confirmPassword: z
      .string()
      .min(6, { message: 'Xác nh­n m­t kh©u là b¯t buÙc' }),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'M­t kh©u xác nh­n không khÛp',
    path: ['confirmPassword'],
  });

export type RegisterFormData = z.infer<typeof registerSchema>;
