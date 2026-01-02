# Change: Add Passkey/WebAuthn Authentication

## Why

Users currently authenticate using email/password or OAuth (Google). Passkey authentication provides:

- Enhanced security: Biometric authentication (Face ID, Touch ID, Windows Hello)
- Better UX: No passwords to remember or type
- Phishing resistance: Cryptographic credentials bound to domain
- Industry standard: WebAuthn is W3C standard supported by all modern browsers

This feature allows logged-in users to register passkeys for passwordless authentication on subsequent logins.

## What Changes

- Add passkey registration flow (2-step: begin + complete)
- Add passkey authentication flow (2-step: begin + complete)
- Add database tables for passkey credentials and auth challenges
- Add refresh token management for secure token rotation
- Integrate @simplewebauthn/server library for WebAuthn operations
- Add passkey management UI (list, add, remove passkeys)
- Support multiple passkeys per user (different devices)
- Implement security best practices from production experience

Key features:

- Users can register passkeys after logging in with existing credentials
- Multiple passkeys per user (laptop, phone, security key)
- Passkey management dashboard
- Automatic challenge expiration (5 minutes)
- Sign count tracking for credential cloning detection
- Refresh token rotation with secure storage

## Impact

Affected specs:

- `authentication` (new capability)

Affected code:

- Backend:
  - Database: New Prisma models (PasskeyCredential, AuthChallenge, RefreshToken)
  - New module: `src/passkey/` (controller, service, DTOs, guards)
  - Auth module: Integration with existing JWT auth
  - Dependencies: @simplewebauthn/server
- Frontend:
  - New pages: Passkey registration, passkey management
  - New components: PasskeyButton, PasskeyList
  - WebAuthn browser API integration
  - Token refresh logic

Breaking changes: None (additive feature)

Dependencies:

- @simplewebauthn/server (backend)
- @simplewebauthn/browser (frontend - if needed)
- Browser support: Chrome 67+, Safari 13+, Edge 18+, Firefox 60+
