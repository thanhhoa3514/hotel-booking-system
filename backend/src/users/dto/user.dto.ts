import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';

// Define the Zod schema for creating a user
export const CreateUserSchema = z.object({
    email: z.string().email({ message: 'Invalid email address' }),
    password: z
        .string()
        .min(6, { message: 'Password must be at least 6 characters long' }),
    fullName: z
        .string()
        .min(2, { message: 'Full name must be at least 2 characters long' }),
    phone: z.string().optional(),
    roleId: z.string().uuid({ message: 'Invalid role ID' }).optional(),
});

// Create the DTO class from the schema
export class CreateUserDto extends createZodDto(CreateUserSchema) { }

// Define the Zod schema for updating a user (partial of create)
export const UpdateUserSchema = CreateUserSchema.partial();

// Create the DTO class from the schema
export class UpdateUserDto extends createZodDto(UpdateUserSchema) { }

// Query/Filter DTO for pagination and filtering
export const QueryUsersSchema = z.object({
  search: z.string().optional(),
  status: z.enum(['ACTIVE', 'INACTIVE', 'BANNED']).optional(),
  roleId: z.string().uuid().optional(),
  page: z.coerce.number().int().positive().default(1).optional(),
  limit: z.coerce.number().int().positive().max(100).default(20).optional(),
});

export class QueryUsersDto extends createZodDto(QueryUsersSchema) { }

// Status update DTO
export const UpdateUserStatusSchema = z.object({
  status: z.enum(['ACTIVE', 'INACTIVE', 'BANNED']),
  reason: z.string().optional(),
});

export class UpdateUserStatusDto extends createZodDto(UpdateUserStatusSchema) { }

// Role update DTO
export const UpdateUserRoleSchema = z.object({
  roleId: z.string().uuid({ message: 'Invalid role ID' }),
});

export class UpdateUserRoleDto extends createZodDto(UpdateUserRoleSchema) { }
