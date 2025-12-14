import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';

// Enums matching Prisma schema
export const ServiceCategoryEnum = z.enum([
  'FOOD_BEVERAGE',
  'SPA_WELLNESS',
  'RECREATION',
  'TRANSPORTATION',
  'BUSINESS',
  'LAUNDRY',
  'CONCIERGE',
  'ROOM_SERVICE',
  'OTHER',
]);

export const ServicePricingTypeEnum = z.enum([
  'FIXED',
  'PER_HOUR',
  'PER_PERSON',
  'PER_ITEM',
]);

// Operating Hours Schema (JSON validation)
export const OperatingHoursSchema = z.record(
  z.enum([
    'monday',
    'tuesday',
    'wednesday',
    'thursday',
    'friday',
    'saturday',
    'sunday',
  ]),
  z.object({
    open: z.string().regex(/^([0-1][0-9]|2[0-3]):[0-5][0-9]$/), // HH:MM format
    close: z.string().regex(/^([0-1][0-9]|2[0-3]):[0-5][0-9]$/),
    isClosed: z.boolean().optional(),
  }),
).optional();

// Create Service DTO
export const CreateServiceSchema = z.object({
  name: z.string().min(2, { message: 'Tên dịch vụ phải có ít nhất 2 ký tự' }),
  slug: z.string().min(2).regex(/^[a-z0-9-]+$/), // lowercase, numbers, hyphens only
  description: z.string().optional(),
  category: ServiceCategoryEnum,
  pricingType: ServicePricingTypeEnum,
  basePrice: z.number().min(0, { message: 'Giá phải lớn hơn hoặc bằng 0' }),
  isActive: z.boolean().default(true).optional(),
  requiresBooking: z.boolean().default(false).optional(),
  maxCapacity: z.number().int().positive().optional(),
  operatingHours: OperatingHoursSchema,
  duration: z.number().int().positive().optional(), // in minutes
  imageUrl: z.string().optional().transform(val => val === '' ? undefined : val).pipe(z.string().url().optional()),
  displayOrder: z.number().int().default(0).optional(),

});

export class CreateServiceDto extends createZodDto(CreateServiceSchema) { }

// Update Service DTO
export const UpdateServiceSchema = CreateServiceSchema.partial();
export class UpdateServiceDto extends createZodDto(UpdateServiceSchema) { }

// Query Services DTO
export const QueryServicesSchema = z.object({
  category: ServiceCategoryEnum.optional(),
  isActive: z.coerce.boolean().optional(),
  search: z.string().optional(), // Search by name
  page: z.coerce.number().int().positive().default(1).optional(),
  limit: z.coerce.number().int().positive().max(100).default(20).optional(),
});

export class QueryServicesDto extends createZodDto(QueryServicesSchema) { }
