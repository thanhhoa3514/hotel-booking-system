import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';

export const BedTypeEnum = z.enum(['SINGLE', 'DOUBLE', 'QUEEN', 'KING', 'TWIN']);

// Schema for room images
export const RoomImageSchema = z.object({
    url: z.string().url({ message: 'Invalid image URL' }),
    altText: z.string().optional(),
    isPrimary: z.boolean().default(false),
    displayOrder: z.number().int().min(0).default(0),
});

export const CreateRoomTypeSchema = z.object({
    name: z.string().min(1, { message: 'Name is required' }),
    description: z.string().optional(),
    basePrice: z.number().min(0),
    capacity: z.number().int().min(1),
    bedType: BedTypeEnum,
    bedCount: z.number().int().min(1).default(1),
    size: z.number().optional(),
    amenities: z.array(z.string()).optional(),
    displayOrder: z.number().int().optional(),
    isActive: z.boolean().optional().default(true),
    // Add images array
    images: z.array(RoomImageSchema).optional(),
});

export class CreateRoomTypeDto extends createZodDto(CreateRoomTypeSchema) { }

export const UpdateRoomTypeSchema = CreateRoomTypeSchema.partial();

export class UpdateRoomTypeDto extends createZodDto(UpdateRoomTypeSchema) { }

export const QueryRoomTypesSchema = z.object({
    page: z.coerce.number().int().positive().default(1).optional(),
    limit: z.coerce.number().int().positive().max(100).default(20).optional(),
});

export class QueryRoomTypesDto extends createZodDto(QueryRoomTypesSchema) { }
