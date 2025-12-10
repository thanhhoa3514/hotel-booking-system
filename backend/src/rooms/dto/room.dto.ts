import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';

export const RoomStatusEnum = z.enum([
    'AVAILABLE',
    'OCCUPIED',
    'MAINTENANCE',
    'CLEANING',
    'OUT_OF_ORDER',
]);

export const CreateRoomSchema = z.object({
    roomNumber: z.string().min(1, { message: 'Room number is required' }),
    floor: z.number().int(),
    status: RoomStatusEnum.default('AVAILABLE'),
    typeId: z.string().uuid({ message: 'Invalid room type ID' }),
    notes: z.string().optional(),
});

export class CreateRoomDto extends createZodDto(CreateRoomSchema) { }

export const UpdateRoomSchema = CreateRoomSchema.partial();

export class UpdateRoomDto extends createZodDto(UpdateRoomSchema) { }
