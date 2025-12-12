import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';

const createCheckoutSessionSchema = z.object({
  bookingId: z.string().uuid('Invalid booking ID format'),
});

export class CreateCheckoutSessionDto extends createZodDto(
  createCheckoutSessionSchema,
) {}
