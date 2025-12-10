import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';

export const BedTypeEnum = z.enum(['SINGLE', 'DOUBLE', 'QUEEN', 'KING', 'TWIN']);

export const CreateRoomTypeSchema = z.object({
    name: z.string().min(1, { message: 'Name is required' }),
    description: z.string().optional(),
    basePrice: z.number().min(0),
    capacity: z.number().int().min(1),
    bedType: BedTypeEnum,
    bedCount: z.number().int().min(1).default(1),
    size: z.number().optional(),
    amenities: z.array(z.string()).optional(), // Assuming array of strings for now
    displayOrder: z.number().int().optional(),
    isActive: z.boolean().optional().default(true),
});

export class CreateRoomTypeDto extends createZodDto(CreateRoomTypeSchema) { }

export const UpdateRoomTypeSchema = CreateRoomTypeSchema.partial();

export class UpdateRoomTypeDto extends createZodDto(UpdateRoomTypeSchema) { }
