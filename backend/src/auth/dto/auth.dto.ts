import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';

// Login DTO
export const LoginSchema = z.object({
  email: z.string().email({ message: 'Địa chỉ email không hợp lệ' }),
  password: z.string().min(6, { message: 'Mật khẩu phải có ít nhất 6 ký tự' }),
});

export class LoginDto extends createZodDto(LoginSchema) { }

// Register DTO
export const RegisterSchema = z.object({
  email: z.string().email({ message: 'Địa chỉ email không hợp lệ' }),
  password: z
    .string()
    .min(6, { message: 'Mật khẩu phải có ít nhất 6 ký tự' }),
  fullName: z
    .string()
    .min(2, { message: 'Họ tên phải có ít nhất 2 ký tự' }),
  phone: z.string().optional(),
});

export class RegisterDto extends createZodDto(RegisterSchema) { }
