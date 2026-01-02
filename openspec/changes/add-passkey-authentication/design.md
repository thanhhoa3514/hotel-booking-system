# Design: Passkey Authentication

## Context

Adding WebAuthn/Passkey authentication to the hotel management system. Users can register passkeys after logging in with existing credentials (email/password or OAuth). This is based on production experience documented in `backend/webauth.md`.

Constraints:

- Must integrate with existing JWT authentication
- Must support multiple passkeys per user
- Must work on localhost (dev) and HTTPS (production)
- Must follow NestJS modular architecture
- Must use TypeScript strict mode

Stakeholders:

- Hotel guests (primary users)
- Hotel staff (admin, receptionist)
- System administrators

## Goals / Non-Goals

Goals:

- Enable passwordless authentication via passkeys
- Support multiple devices per user (laptop, phone, security key)
- Implement secure token management (access + refresh tokens)
- Follow WebAuthn best practices from production experience
- Provide passkey management UI
- Maintain backward compatibility with existing auth methods

Non-Goals:

- Replace existing email/password authentication (coexist)
- Support resident keys (discouraged mode is sufficient)
- Implement attestation verification (use "none" for simplicity)
- Support cross-device authentication (conditional UI)

## Decisions

### Decision 1: Registration Requires Existing Login

Rationale:

- Users must have an account before registering passkeys
- Prevents anonymous passkey registration
- Simplifies user management (no duplicate accounts)
- Aligns with hotel booking flow (guests register first)

Implementation:

- Passkey registration endpoints require JWT authentication
- User ID from JWT token used to link passkey to user
- No username/password needed during passkey registration

### Decision 2: Two-Step WebAuthn Flow

Rationale:

- WebAuthn requires challenge-response pattern
- Prevents replay attacks
- Standard practice in WebAuthn implementations

Implementation:

- Registration: begin (get challenge) → complete (verify attestation)
- Authentication: begin (get challenge) → complete (verify assertion)
- Challenge stored in database with 5-minute expiration
- Challenge marked as "used" after successful verification

### Decision 3: Store Metadata with Challenge

Rationale:

- Avoids security issue of trusting client-provided data
- Learned from production bug (see webauth.md Bug #5)

Implementation:

- `auth_challenges` table includes `username` and `display_name` columns
- Data saved in "begin" step, retrieved in "complete" step
- Prevents client from tampering with user creation data

### Decision 4: Use @simplewebauthn/server Library

Rationale:

- Well-maintained, production-ready library
- Handles complex WebAuthn operations
- TypeScript native
- Better API than raw webauthn library (avoids parsing bugs)

Alternatives considered:

- webauthn (Python library): Requires JSON parsing, has API inconsistencies
- fido2-lib: More complex API, less documentation
- Custom implementation: Too complex, security risks

### Decision 5: Refresh Token Strategy

Rationale:

- Short-lived access tokens (15 minutes) minimize damage if stolen
- Long-lived refresh tokens (7 days) improve UX
- Token rotation prevents token reuse attacks

Implementation:

- Access token: JWT, 15-minute expiration, stored in memory (frontend)
- Refresh token: JWT, 7-day expiration, hashed in database
- Refresh endpoint: Validates old token, issues new pair, revokes old token
- Logout: Revokes refresh token in database

### Decision 6: Multiple Passkeys Per User

Rationale:

- Users have multiple devices (laptop, phone, tablet)
- Security keys as backup
- Device loss doesn't lock out user

Implementation:

- One-to-many relationship: User → PasskeyCredentials
- Each credential has device_name for identification
- User can manage (list, remove, rename) passkeys
- Login shows all available credentials

### Decision 7: Sign Count Tracking

Rationale:

- Detects credential cloning attacks
- WebAuthn spec recommends this

Implementation:

- Store sign_count in passkey_credentials table
- Increment on each authentication
- Alert if new count <= old count (potential cloning)
- Disable credential if cloning detected

## Technical Architecture

### Database Schema

```
users (existing)
  ├─ passkey_credentials (new, 1:N)
  └─ refresh_tokens (new, 1:N)

auth_challenges (new)
  └─ user_id (nullable, for authentication)
```

### Backend Module Structure

```
src/passkey/
├── passkey.module.ts
├── passkey.controller.ts
├── passkey.service.ts
├── dto/
│   ├── register-passkey.dto.ts
│   ├── authenticate-passkey.dto.ts
│   └── manage-passkey.dto.ts
└── entities/
    ├── passkey-credential.entity.ts
    └── auth-challenge.entity.ts

src/auth/ (existing, modified)
├── auth.service.ts (add refresh token methods)
└── guards/
    └── jwt-refresh.guard.ts (new)
```

### API Endpoints

Registration:

- POST /api/passkey/register/begin (requires JWT)
- POST /api/passkey/register/complete (requires JWT)

Authentication:

- POST /api/passkey/login/begin (public)
- POST /api/passkey/login/complete (public)

Management:

- GET /api/passkey/credentials (requires JWT)
- DELETE /api/passkey/credentials/:id (requires JWT)
- PATCH /api/passkey/credentials/:id (requires JWT)

Token:

- POST /api/auth/refresh (requires refresh token)
- POST /api/auth/logout (requires JWT)

### Frontend Flow

1. User logs in with email/password
2. Dashboard shows "Add Passkey" option
3. Click → Registration begin → Browser prompts for biometric
4. Complete → Passkey saved
5. Next login: Click "Login with Passkey" → Browser prompts → Logged in

## Risks / Trade-offs

### Risk 1: Browser Compatibility

Risk: Older browsers don't support WebAuthn
Mitigation:

- Keep email/password login as fallback
- Show passkey option only if browser supports it
- Feature detection: `window.PublicKeyCredential`

### Risk 2: CORS Configuration

Risk: Origin mismatch causes WebAuthn failure (see webauth.md Bug #2)
Mitigation:

- Match RP_ID with domain exactly
- Support both localhost and 127.0.0.1 in development
- Document CORS setup clearly
- Test with exact production domain before deployment

### Risk 3: Challenge Expiration

Risk: User delays too long, challenge expires
Mitigation:

- 5-minute expiration (reasonable time)
- Clear error message: "Challenge expired, please try again"
- Auto-retry with new challenge

### Risk 4: Token Storage Security

Risk: XSS attacks can steal tokens from localStorage
Mitigation:

- Access token in memory only (lost on refresh)
- Refresh token in httpOnly cookie (JavaScript can't access)
- Short access token lifetime (15 minutes)
- Implement CSP headers

### Risk 5: Credential Cloning

Risk: Attacker clones passkey to another device
Mitigation:

- Track sign_count on every authentication
- Alert user if cloning detected
- Automatically disable suspicious credentials
- Require re-registration

## Migration Plan

Phase 1: Backend Implementation (Week 1)

- Database migrations
- Passkey module implementation
- API endpoints
- Unit tests

Phase 2: Frontend Implementation (Week 2)

- Registration UI
- Authentication UI
- Management dashboard
- Token refresh logic

Phase 3: Testing (Week 3)

- Cross-browser testing
- Mobile device testing
- Security testing
- Load testing

Phase 4: Deployment (Week 4)

- Deploy to staging
- User acceptance testing
- Deploy to production
- Monitor logs and errors

Rollback plan:

- Feature flag to disable passkey authentication
- Database migrations are additive (no data loss)
- Existing auth methods unaffected
- Can remove passkey module without breaking system

## Configuration

Development:

```env
RP_ID=localhost
RP_NAME=Hotel Management System
RP_ORIGIN=http://localhost:3000
JWT_SECRET=<existing>
JWT_REFRESH_SECRET=<new, generate strong key>
CORS_ORIGINS=http://localhost:3000,http://127.0.0.1:3000
```

Production:

```env
RP_ID=yourdomain.com
RP_NAME=Hotel Management System
RP_ORIGIN=https://yourdomain.com
JWT_SECRET=<existing>
JWT_REFRESH_SECRET=<strong key>
CORS_ORIGINS=https://yourdomain.com
```

## Open Questions

1. Should we send email notification when new passkey is registered?

   - Recommendation: Yes, for security awareness

2. Should we limit number of passkeys per user?

   - Recommendation: Yes, max 5 passkeys per user

3. Should we support passkey-only accounts (no password)?

   - Recommendation: Phase 2 feature, not in initial implementation

4. How to handle user who loses all passkeys?

   - Recommendation: Email-based recovery flow (send magic link)

5. Should we track passkey usage analytics?
   - Recommendation: Yes, track registration/login counts for metrics
