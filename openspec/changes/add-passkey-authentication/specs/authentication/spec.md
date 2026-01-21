# Authentication Capability - Passkey Feature

## ADDED Requirements

### Requirement: Passkey Registration for Authenticated Users

The system SHALL allow authenticated users to register WebAuthn passkeys for passwordless authentication.

#### Scenario: User registers first passkey successfully

- **WHEN** authenticated user initiates passkey registration
- **THEN** system generates WebAuthn challenge with 5-minute expiration
- **AND** system stores challenge with user context in database
- **AND** system returns registration options to client
- **AND** user completes biometric verification on device
- **AND** system verifies attestation response
- **AND** system stores credential with public key and device name
- **AND** user receives confirmation message

#### Scenario: User registers multiple passkeys

- **WHEN** user already has one passkey registered
- **AND** user initiates registration for second passkey
- **THEN** system allows registration of additional passkey
- **AND** both passkeys are stored independently
- **AND** user can authenticate with either passkey

#### Scenario: Registration fails due to expired challenge

- **WHEN** user initiates passkey registration
- **AND** user waits more than 5 minutes before completing
- **THEN** system rejects registration with "Challenge expired" error
- **AND** user must restart registration process

#### Scenario: Registration requires authentication

- **WHEN** unauthenticated user attempts passkey registration
- **THEN** system returns 401 Unauthorized error
- **AND** user must login first before registering passkey

### Requirement: Passkey Authentication

The system SHALL allow users to authenticate using registered passkeys without password.

#### Scenario: User logs in with passkey successfully

- **WHEN** user selects passkey login option
- **AND** system generates authentication challenge
- **AND** user completes biometric verification
- **AND** system verifies signature with stored public key
- **THEN** system issues access token and refresh token
- **AND** user is logged into the system
- **AND** system updates last_used_at timestamp for credential

#### Scenario: Authentication with multiple passkeys available

- **WHEN** user has multiple passkeys registered
- **AND** user initiates passkey login
- **THEN** browser shows list of available passkeys
- **AND** user selects desired passkey
- **AND** authentication proceeds with selected credential

#### Scenario: Authentication fails with invalid signature

- **WHEN** user attempts passkey authentication
- **AND** signature verification fails
- **THEN** system returns 401 Unauthorized error
- **AND** credential is not marked as used
- **AND** user can retry authentication

#### Scenario: Credential cloning detected

- **WHEN** user authenticates with passkey
- **AND** sign count is less than or equal to stored count
- **THEN** system detects potential credential cloning
- **AND** system disables the credential
- **AND** system alerts user via email
- **AND** authentication is rejected

### Requirement: Passkey Management

The system SHALL allow users to manage their registered passkeys.

#### Scenario: User views list of registered passkeys

- **WHEN** authenticated user accesses passkey management page
- **THEN** system displays list of all user's passkeys
- **AND** each passkey shows device name, creation date, last used date
- **AND** list is ordered by last used date (most recent first)

#### Scenario: User removes passkey

- **WHEN** user selects passkey to remove
- **AND** confirms deletion
- **THEN** system marks credential as inactive
- **AND** credential cannot be used for future authentication
- **AND** user receives confirmation message

#### Scenario: User renames passkey device

- **WHEN** user edits device name for passkey
- **AND** provides new name (1-100 characters)
- **THEN** system updates device_name field
- **AND** new name is displayed in passkey list

#### Scenario: User cannot remove last authentication method

- **WHEN** user has only one passkey and no password
- **AND** user attempts to remove the passkey
- **THEN** system prevents removal
- **AND** displays warning: "Cannot remove last authentication method"

### Requirement: Refresh Token Management

The system SHALL implement secure token refresh mechanism for extended sessions.

#### Scenario: Access token expires and refreshes automatically

- **WHEN** user's access token expires (after 15 minutes)
- **AND** user makes authenticated API request
- **AND** system has valid refresh token
- **THEN** system issues new access token and refresh token
- **AND** old refresh token is revoked
- **AND** request proceeds with new access token

#### Scenario: Refresh token expires

- **WHEN** user's refresh token expires (after 7 days)
- **AND** user attempts to refresh access token
- **THEN** system rejects refresh request
- **AND** user must re-authenticate with passkey or password

#### Scenario: User logs out and revokes tokens

- **WHEN** user initiates logout
- **THEN** system revokes refresh token in database
- **AND** access token becomes invalid
- **AND** user must re-authenticate for future access

### Requirement: Challenge Management

The system SHALL manage WebAuthn challenges securely with expiration.

#### Scenario: Challenge expires after 5 minutes

- **WHEN** system generates authentication or registration challenge
- **THEN** challenge expires after 5 minutes
- **AND** expired challenges cannot be used for verification
- **AND** system returns "Challenge expired" error if used

#### Scenario: Challenge can only be used once

- **WHEN** challenge is successfully used for registration or authentication
- **THEN** system marks challenge as used
- **AND** same challenge cannot be reused
- **AND** system returns "Challenge already used" error if attempted

#### Scenario: Cleanup of expired challenges

- **WHEN** scheduled cleanup job runs
- **THEN** system deletes challenges older than 1 hour
- **AND** database remains clean of stale challenges

### Requirement: Security and Validation

The system SHALL enforce security best practices for passkey authentication.

#### Scenario: Origin validation during registration

- **WHEN** user completes passkey registration
- **THEN** system verifies origin matches expected RP_ORIGIN
- **AND** registration fails if origin mismatch detected
- **AND** error message indicates domain mismatch

#### Scenario: RP ID validation during authentication

- **WHEN** user completes passkey authentication
- **THEN** system verifies RP_ID matches expected value
- **AND** authentication fails if RP_ID mismatch detected

#### Scenario: User verification required

- **WHEN** system generates WebAuthn options
- **THEN** user_verification is set to "required"
- **AND** browser prompts for biometric or PIN
- **AND** authentication fails without user verification

#### Scenario: Rate limiting on passkey endpoints

- **WHEN** user makes more than 5 failed authentication attempts in 5 minutes
- **THEN** system temporarily blocks passkey authentication for user
- **AND** returns "Too many attempts, try again later" error
- **AND** block expires after 15 minutes

### Requirement: Cross-Browser and Device Support

The system SHALL support WebAuthn across modern browsers and devices.

#### Scenario: Browser supports WebAuthn

- **WHEN** user accesses passkey registration page
- **AND** browser supports PublicKeyCredential API
- **THEN** system displays passkey registration option
- **AND** user can proceed with registration

#### Scenario: Browser does not support WebAuthn

- **WHEN** user accesses passkey registration page
- **AND** browser does not support PublicKeyCredential API
- **THEN** system hides passkey registration option
- **AND** displays message: "Passkey not supported on this browser"
- **AND** user can still use password authentication

#### Scenario: Mobile device biometric authentication

- **WHEN** user registers passkey on mobile device
- **THEN** system supports Face ID (iOS) or fingerprint (Android)
- **AND** credential is stored in device secure enclave
- **AND** user can authenticate with biometric on subsequent logins

### Requirement: Error Handling and User Feedback

The system SHALL provide clear error messages and feedback during passkey operations.

#### Scenario: User cancels passkey registration

- **WHEN** user initiates passkey registration
- **AND** cancels browser biometric prompt
- **THEN** system returns user-friendly error message
- **AND** registration process can be restarted

#### Scenario: Network error during registration

- **WHEN** network connection fails during passkey registration
- **THEN** system displays "Network error, please try again"
- **AND** challenge remains valid if not expired
- **AND** user can retry registration

#### Scenario: Successful passkey operations show confirmation

- **WHEN** user successfully registers passkey
- **THEN** system displays success message in Vietnamese
- **AND** redirects to passkey management page
- **AND** new passkey appears in list

### Requirement: HTTPS and Localhost Support

The system SHALL work on localhost (development) and HTTPS (production).

#### Scenario: Development on localhost

- **WHEN** system runs on localhost in development
- **THEN** WebAuthn works without HTTPS
- **AND** RP_ID is set to "localhost"
- **AND** RP_ORIGIN is "http://localhost:3000"

#### Scenario: Production requires HTTPS

- **WHEN** system deploys to production domain
- **THEN** WebAuthn requires HTTPS connection
- **AND** RP_ID matches production domain
- **AND** RP_ORIGIN uses https:// protocol
- **AND** HTTP connections are rejected for passkey operations
