import { z } from "zod";

// Service Category enum
export const serviceCategorySchema = z.enum([
    "FOOD_BEVERAGE",
    "SPA_WELLNESS",
    "RECREATION",
    "TRANSPORTATION",
    "BUSINESS",
    "LAUNDRY",
    "CONCIERGE",
    "ROOM_SERVICE",
    "OTHER",
]);

// Service Pricing Type enum
export const servicePricingTypeSchema = z.enum([
    "FIXED",
    "PER_HOUR",
    "PER_PERSON",
    "PER_ITEM",
]);

// Operating Hours schema
export const operatingHoursSchema = z.record(
    z.string(),
    z.object({
        open: z.string().regex(/^\d{2}:\d{2}$/).optional(),
        close: z.string().regex(/^\d{2}:\d{2}$/).optional(),
        isClosed: z.boolean().optional(),
    })
);

// Create Service Schema
export const createServiceSchema = z.object({
    name: z.string().min(1, "Ten dich vu la bat buoc"),
    slug: z
        .string()
        .min(1, "Slug la bat buoc")
        .regex(/^[a-z0-9-]+$/, "Slug chi chua chu thuong, so va dau gach ngang"),
    description: z.string().optional(),
    category: serviceCategorySchema,
    pricingType: servicePricingTypeSchema,
    basePrice: z.number().min(0, "Gia phai lon hon hoac bang 0"),
    isActive: z.boolean().optional().default(true),
    requiresBooking: z.boolean().optional().default(false),
    maxCapacity: z.number().int().positive().optional(),
    operatingHours: operatingHoursSchema.optional(),
    duration: z.number().int().positive().optional(),
    imageUrl: z.string().url().optional().or(z.literal("")),
    displayOrder: z.number().int().min(0).optional().default(0),
});

export type CreateServiceFormData = z.infer<typeof createServiceSchema>;

// Update Service Schema
export const updateServiceSchema = createServiceSchema.partial();

export type UpdateServiceFormData = z.infer<typeof updateServiceSchema>;

// Service Booking Status enum
export const serviceBookingStatusSchema = z.enum([
    "PENDING",
    "CONFIRMED",
    "IN_PROGRESS",
    "COMPLETED",
    "CANCELLED",
    "NO_SHOW",
]);

// Create Service Booking Schema
export const createServiceBookingSchema = z.object({
    serviceId: z.string().uuid("Service ID khong hop le"),
    bookingId: z.string().uuid("Booking ID khong hop le"),
    scheduledDate: z.string().min(1, "Ngay hen la bat buoc"),
    scheduledTime: z.string().min(1, "Gio hen la bat buoc"),
    duration: z.number().int().positive().optional(),
    quantity: z.number().int().positive().default(1),
    specialRequests: z.string().optional(),
});

export type CreateServiceBookingFormData = z.infer<
    typeof createServiceBookingSchema
>;

// Update Service Booking Schema
export const updateServiceBookingSchema = z.object({
    scheduledDate: z.string().optional(),
    scheduledTime: z.string().optional(),
    duration: z.number().int().positive().optional(),
    quantity: z.number().int().positive().optional(),
    specialRequests: z.string().optional(),
});

export type UpdateServiceBookingFormData = z.infer<
    typeof updateServiceBookingSchema
>;

// Update Status Schema
export const updateServiceBookingStatusSchema = z.object({
    status: serviceBookingStatusSchema,
    staffNotes: z.string().optional(),
});

export type UpdateServiceBookingStatusFormData = z.infer<
    typeof updateServiceBookingStatusSchema
>;

// Assign Staff Schema
export const assignStaffSchema = z.object({
    assignedStaffId: z.string().uuid("Staff ID khong hop le"),
    staffNotes: z.string().optional(),
});

export type AssignStaffFormData = z.infer<typeof assignStaffSchema>;

// Cancel Service Booking Schema
export const cancelServiceBookingSchema = z.object({
    cancelReason: z.string().optional(),
});

export type CancelServiceBookingFormData = z.infer<
    typeof cancelServiceBookingSchema
>;

// Query schemas for filters
export const queryServicesSchema = z.object({
    category: serviceCategorySchema.optional(),
    isActive: z.boolean().optional(),
    search: z.string().optional(),
    page: z.number().int().positive().optional(),
    limit: z.number().int().positive().max(100).optional(),
});

export const queryServiceBookingsSchema = z.object({
    status: serviceBookingStatusSchema.optional(),
    bookingId: z.string().uuid().optional(),
    serviceId: z.string().uuid().optional(),
    assignedStaffId: z.string().uuid().optional(),
    scheduledDate: z.string().optional(),
    page: z.number().int().positive().optional(),
    limit: z.number().int().positive().max(100).optional(),
});

