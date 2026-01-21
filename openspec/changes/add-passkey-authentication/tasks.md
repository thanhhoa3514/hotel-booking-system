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

- [x] 10.1 Create passkey registration page/modal
- [x] 10.2 Implement registration begin API call
- [x] 10.3 Implement navigator.credentials.create() call
- [x] 10.4 Implement registration complete API call
- [x] 10.5 Add loading states and error handling
- [x] 10.6 Add success feedback

## 11. Frontend - Passkey Authentication

- [x] 11.1 Add passkey login button on login page
- [x] 11.2 Implement login begin API call
- [x] 11.3 Implement navigator.credentials.get() call
- [x] 11.4 Implement login complete API call
- [x] 11.5 Store access token in memory
- [x] 11.6 Store refresh token in localStorage (production: httpOnly cookie)

## 12. Frontend - Passkey Management

- [x] 12.1 Create passkey management page in user dashboard
- [x] 12.2 Display list of registered passkeys
- [x] 12.3 Add "Register New Passkey" button
- [x] 12.4 Add remove passkey functionality
- [x] 12.5 Add rename device functionality
- [x] 12.6 Show last used timestamp

## 13. Frontend - Token Refresh

- [x] 13.1 Implement automatic token refresh logic
- [x] 13.2 Add axios interceptor for 401 responses
- [x] 13.3 Retry failed requests after refresh
- [x] 13.4 Handle refresh token expiration (redirect to login)

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

- [x] 15.1 Update API documentation with passkey endpoints
- [x] 15.2 Add user guide for passkey setup
- [x] 15.3 Document environment variables
- [x] 15.4 Add troubleshooting guide

## Implementation Status

All development tasks (sections 1-13, 15) are complete. Testing (section 14) is ready to begin.

### Summary of Completed Work:

#### Backend
- Database schema with 3 new tables (passkey_credentials, auth_challenges, refresh_tokens)
- Complete Passkey module with service, controller, and DTOs
- 9 REST API endpoints for registration, authentication, and management
- Security features: rate limiting, challenge expiration, sign count tracking
- Token refresh with SHA-256 hashing and rotation

#### Frontend
- WebAuthn helper utilities for browser integration
- Passkey API service layer
- Registration dialog component
- Login page with passkey button
- Full management dashboard at /dashboard/passkeys
- Automatic token refresh interceptor

#### Documentation
- PASSKEY_ENV_SETUP.md - Environment configuration guide
- PASSKEY_IMPLEMENTATION_SUMMARY.md - Backend implementation details
- PASSKEY_FEATURE_COMPLETE.md - Complete feature documentation
- All tasks tracked and updated in tasks.md
