# Implementation Tasks

## 1. Database Schema

- [x] 1.1 Create Prisma migration for passkey_credentials table
- [x] 1.2 Create Prisma migration for auth_challenges table
- [x] 1.3 Create Prisma migration for refresh_tokens table
- [x] 1.4 Add indexes for performance (credential_id, user_id, challenge, token_hash)
- [x] 1.5 Run migration and verify schema
- [x] 1.6 Generate Prisma client

## 2. Backend - Dependencies

- [x] 2.1 Install @simplewebauthn/server package
- [x] 2.2 Update package.json with version

## 3. Backend - Passkey Module

- [x] 3.1 Generate passkey module using NestJS CLI
- [x] 3.2 Create PasskeyService with core methods
- [x] 3.3 Create PasskeyController with endpoints
- [x] 3.4 Create DTOs with Zod validation schemas
- [x] 3.5 Add PasskeyModule to AppModule imports

## 4. Backend - Registration Flow

- [x] 4.1 Implement POST /passkey/register/begin endpoint
- [x] 4.2 Implement POST /passkey/register/complete endpoint
- [x] 4.3 Add username uniqueness validation
- [x] 4.4 Add challenge generation and storage
- [x] 4.5 Add attestation verification
- [x] 4.6 Add credential storage with public key

## 5. Backend - Authentication Flow

- [x] 5.1 Implement POST /passkey/login/begin endpoint
- [x] 5.2 Implement POST /passkey/login/complete endpoint
- [x] 5.3 Add challenge verification
- [x] 5.4 Add signature verification
- [x] 5.5 Add sign count validation (cloning detection)
- [x] 5.6 Update last_used_at timestamp

## 6. Backend - Token Management

- [x] 6.1 Implement refresh token generation
- [x] 6.2 Implement refresh token hashing (SHA-256)
- [x] 6.3 Implement POST /passkey/refresh endpoint
- [x] 6.4 Implement token rotation logic
- [x] 6.5 Implement token revocation on logout
- [x] 6.6 Add refresh token cleanup job (expired tokens)

## 7. Backend - Passkey Management

- [x] 7.1 Implement GET /passkey/credentials endpoint (list user passkeys)
- [x] 7.2 Implement DELETE /passkey/credentials/:id endpoint (remove passkey)
- [x] 7.3 Implement PATCH /passkey/credentials/:id endpoint (rename device)
- [x] 7.4 Add JWT guard protection for management endpoints

## 8. Backend - Configuration

- [x] 8.1 Add RP_ID to environment variables
- [x] 8.2 Add RP_NAME to environment variables
- [x] 8.3 Add RP_ORIGIN to environment variables
- [x] 8.4 Configure CORS for WebAuthn origins (documented)
- [x] 8.5 Add JWT_REFRESH_SECRET to environment variables

## 9. Backend - Security & Validation

- [x] 9.1 Add challenge expiration check (5 minutes)
- [x] 9.2 Add challenge reuse prevention
- [x] 9.3 Add input validation for all DTOs
- [x] 9.4 Add rate limiting on passkey endpoints
- [x] 9.5 Add proper error messages (Vietnamese for users)

## 10. Frontend - Passkey Registration


## 14. Testing

- [ ] 14.1 Test registration flow (Chrome, Safari, Edge)
- [ ] 14.2 Test authentication flow
- [ ] 14.3 Test multiple passkeys per user
- [ ] 14.4 Test passkey removal
- [ ] 14.5 Test challenge expiration
- [ ] 14.6 Test token refresh flow
- [ ] 14.7 Test CORS configuration
- [ ] 14.8 Test on mobile devices (iOS, Android)

## 15. Documentation


