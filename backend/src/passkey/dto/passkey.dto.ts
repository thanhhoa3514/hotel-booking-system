import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';

// Registration Begin DTO
export const RegisterPasskeyBeginSchema = z.object({
    deviceName: z.string().min(1).max(100).optional(),
});

export class RegisterPasskeyBeginDto extends createZodDto(
    RegisterPasskeyBeginSchema,
) { }

// Registration Complete DTO
export const RegisterPasskeyCompleteSchema = z.object({
    credential: z.object({
        id: z.string(),
        rawId: z.string(),
        response: z.object({
            clientDataJSON: z.string(),
            attestationObject: z.string(),
            transports: z.array(z.enum(['ble', 'cable', 'hybrid', 'internal', 'nfc', 'smart-card', 'usb'])).optional(),
        }),
        type: z.literal('public-key'),
        clientExtensionResults: z.any(),
        authenticatorAttachment: z.enum(['platform', 'cross-platform']).optional(),
    }),
    deviceName: z.string().min(1).max(100).optional(),
});

export class RegisterPasskeyCompleteDto extends createZodDto(
    RegisterPasskeyCompleteSchema,
) { }

// Login Begin DTO
export const LoginPasskeyBeginSchema = z.object({
    email: z.string().email(),
});

export class LoginPasskeyBeginDto extends createZodDto(
    LoginPasskeyBeginSchema,
) { }

// Login Complete DTO
export const LoginPasskeyCompleteSchema = z.object({
    email: z.string().email(),
    credential: z.object({
        id: z.string(),
        rawId: z.string(),
        response: z.object({
            clientDataJSON: z.string(),
            authenticatorData: z.string(),
            signature: z.string(),
            userHandle: z.string().optional(),
        }),
        type: z.literal('public-key'),
        clientExtensionResults: z.any(),
        authenticatorAttachment: z.enum(['platform', 'cross-platform']).optional(),
    }),
});

export class LoginPasskeyCompleteDto extends createZodDto(
    LoginPasskeyCompleteSchema,
) { }

// Update Passkey DTO
export const UpdatePasskeySchema = z.object({
    deviceName: z.string().min(1).max(100),
});

export class UpdatePasskeyDto extends createZodDto(UpdatePasskeySchema) { }

// Refresh Token DTO
export const RefreshTokenSchema = z.object({
    refreshToken: z.string(),
});

export class RefreshTokenDto extends createZodDto(RefreshTokenSchema) { }

// Response types
export interface PasskeyCredentialResponse {
    id: string;
    deviceName: string | null;
    createdAt: Date;
    lastUsedAt: Date | null;
    transports: string[];
}

