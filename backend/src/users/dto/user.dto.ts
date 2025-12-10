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
