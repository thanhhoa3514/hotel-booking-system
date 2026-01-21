# Passkey Authentication Implementation Guide (Framework-Agnostic)

## 🎯 Mục đích

Hướng dẫn chi tiết để implement Passkey/WebAuthn Authentication trên bất kỳ framework nào (Java Spring Boot, Node.js Express, NestJS, Django, Ruby on Rails, etc.)

Document này được tổng hợp từ **real production experience** với FastAPI, bao gồm:

- ✅ Các lỗi phổ biến và cách fix
- ✅ Best practices đã được verify
- ✅ Common pitfalls cần tránh
- ✅ Architecture patterns đã test

---

## 📚 Table of Contents

1. [WebAuthn Flow Overview](#webauthn-flow-overview)
2. [Database Schema](#database-schema)
3. [Backend Implementation](#backend-implementation)
4. [Frontend Implementation](#frontend-implementation)
5. [Critical Bugs We Fixed](#critical-bugs-we-fixed)
6. [Configuration Gotchas](#configuration-gotchas)
7. [Security Best Practices](#security-best-practices)
8. [Token Management Patterns](#token-management-patterns)
9. [Testing & Debugging](#testing-debugging)
10. [Production Checklist](#production-checklist)

---

## 🔄 WebAuthn Flow Overview

### Registration Flow (2-Step Process)

```
┌─────────────────────────────────────────────────────────────────┐
│  STEP 1: Registration Begin                                     │
├─────────────────────────────────────────────────────────────────┤
│  Client                          Server                          │
│    │                               │                             │
│    │  POST /auth/register/begin    │                             │
│    │  {username, display_name}     │                             │
│    │─────────────────────────────►│                             │
│    │                               │                             │
│    │                               │ 1. Check username unique    │
│    │                               │ 2. Generate challenge       │
│    │                               │ 3. Save to auth_challenges  │
│    │                               │    (with username/display)  │
│    │                               │                             │
│    │◄─────────────────────────────│                             │
│    │  {challenge, user_id, rp,     │                             │
│    │   publicKeyOptions}           │                             │
│    │                               │                             │
│    │ navigator.credentials.create()│                             │
│    │ → User Face ID/Touch ID       │                             │
│    │                               │                             │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│  STEP 2: Registration Complete                                  │
├─────────────────────────────────────────────────────────────────┤
│  Client                          Server                          │
│    │                               │                             │
│    │  POST /auth/register/complete │                             │
│    │  {user_id, credential}        │                             │
│    │─────────────────────────────►│                             │
│    │                               │                             │
│    │                               │ 1. Find challenge           │
│    │                               │ 2. Verify attestation       │
│    │                               │ 3. Create user              │
│    │                               │ 4. Save credential          │
│    │                               │ 5. Generate tokens          │
│    │                               │                             │
│    │◄─────────────────────────────│                             │
│    │  {access_token,               │                             │
│    │   refresh_token}              │                             │
└─────────────────────────────────────────────────────────────────┘
```

### Login Flow (Similar 2-Step)

```
1. Login Begin:   Get challenge + allowed credentials
2. Login Complete: Verify signature + generate tokens
```

---

## 🗄️ Database Schema

### Table: users

```sql
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    username VARCHAR(30) UNIQUE NOT NULL,
    display_name VARCHAR(100) NOT NULL,
    email VARCHAR(255),
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    last_login_at TIMESTAMP,
    is_active BOOLEAN DEFAULT TRUE
);

CREATE INDEX idx_users_username ON users(username);
CREATE INDEX idx_users_email ON users(email);
```

### Table: passkey_credentials

```sql
CREATE TABLE passkey_credentials (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    credential_id TEXT UNIQUE NOT NULL,
    public_key BYTEA NOT NULL,              -- Store as binary
    sign_count INTEGER DEFAULT 0,
    device_name VARCHAR(100),
    aaguid VARCHAR(36),
    transports TEXT[],                       -- Array: ['usb', 'nfc', 'ble']
    created_at TIMESTAMP DEFAULT NOW(),
    last_used_at TIMESTAMP,
    is_active BOOLEAN DEFAULT TRUE
);

CREATE INDEX idx_passkey_user_id ON passkey_credentials(user_id);
CREATE INDEX idx_passkey_credential_id ON passkey_credentials(credential_id);
```

### Table: auth_challenges

```sql
CREATE TABLE auth_challenges (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    challenge TEXT UNIQUE NOT NULL,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    type VARCHAR(20) NOT NULL,              -- 'registration' | 'authentication'
    username VARCHAR(30),                    -- ⚠️ CRITICAL: Store for registration
    display_name VARCHAR(100),               -- ⚠️ CRITICAL: Store for registration
    created_at TIMESTAMP DEFAULT NOW(),
    expires_at TIMESTAMP NOT NULL,
    used BOOLEAN DEFAULT FALSE
);

CREATE INDEX idx_challenges_type_used ON auth_challenges(type, used);
CREATE INDEX idx_challenges_expires ON auth_challenges(expires_at);
```

**⚠️ IMPORTANT:** `username` and `display_name` in `auth_challenges` are **CRITICAL**.

- During registration, you need these to create the user in step 2
- Without them, you'll have to pass username/display_name from client (insecure)

### Table: refresh_tokens

```sql
CREATE TABLE refresh_tokens (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    token_hash TEXT UNIQUE NOT NULL,         -- Hash using SHA-256
    created_at TIMESTAMP DEFAULT NOW(),
    expires_at TIMESTAMP NOT NULL,
    revoked BOOLEAN DEFAULT FALSE,
    revoked_at TIMESTAMP
);

CREATE INDEX idx_refresh_token_hash ON refresh_tokens(token_hash);
CREATE INDEX idx_refresh_token_user ON refresh_tokens(user_id);
```

---

## 🔧 Backend Implementation

### Core Libraries Needed

**Python (FastAPI):**

```python
webauthn==2.1.0
python-jose[cryptography]==3.3.0
```

**Node.js (Express/NestJS):**

```javascript
@simplewebauthn/server
jsonwebtoken
```

**Java (Spring Boot):**

```xml
<dependency>
    <groupId>com.webauthn4j</groupId>
    <artifactId>webauthn4j-core</artifactId>
</dependency>
```

---

### Registration Begin Endpoint

#### Pseudocode (Framework-Agnostic)

```
POST /api/v1/auth/register/begin
Body: { username, display_name, email? }

1. Validate input (username 3-30 chars, alphanumeric)

2. Check username uniqueness:
   IF exists(users WHERE username = input.username):
       RETURN 400 "Username already exists"

3. Generate random user_id (UUID)

4. Generate WebAuthn options:
   options = create_registration_options({
       rp_id: "localhost",
       rp_name: "YourApp",
       user_id: user_id,
       user_name: username,
       user_display_name: display_name,
       challenge: random_bytes(32),
       attestation: "none",
       authenticator_selection: {
           authenticator_attachment: "platform",
           resident_key: "discouraged",
           user_verification: "required"
       },
       supported_algorithms: [ES256, RS256]
   })

5. Save challenge to database:
   INSERT INTO auth_challenges (
       challenge,
       type,
       username,           -- ⚠️ MUST SAVE
       display_name,       -- ⚠️ MUST SAVE
       expires_at
   ) VALUES (
       base64url(options.challenge),
       'registration',
       username,
       display_name,
       NOW() + INTERVAL '5 minutes'
   )

6. ⚠️ CRITICAL: Parse options correctly
   // Python: json.loads(options_to_json(options))
   // Node.js: Already returns object
   // Java: Serialize to JSON

7. Return response:
   {
       challenge: base64url_string,
       user_id: uuid,
       rp: { name, id },
       user: { id, name, displayName },
       pubKeyCredParams: [...],
       timeout: 60000,
       attestation: "none",
       authenticatorSelection: {...}
   }
```

#### ⚠️ BUG WE FIXED #1: Options Parsing

```python
# ❌ WRONG (Python with webauthn 2.x)
options_dict = options_to_json(options)  # Returns STRING!
return options_dict["rp"]  # TypeError: string indices must be integers

# ✅ CORRECT
import json
options_dict = json.loads(options_to_json(options))  # Parse to dict
return options_dict["rp"]
```

---

### Registration Complete Endpoint

#### Pseudocode

```
POST /api/v1/auth/register/complete
Body: { user_id, credential, device_name? }

1. Find the most recent unused registration challenge:
   challenge = SELECT * FROM auth_challenges
               WHERE type = 'registration'
               AND used = FALSE
               ORDER BY created_at DESC
               LIMIT 1

   IF NOT challenge:
       RETURN 400 "Challenge not found"

2. Check expiration:
   IF challenge.expires_at < NOW():
       RETURN 400 "Challenge expired"

3. Verify registration:
   try:
       verification = verify_registration_response({
           credential: credential,
           expected_challenge: base64url_decode(challenge.challenge),
           expected_origin: "http://localhost:5500",
           expected_rp_id: "localhost",
           require_user_verification: true
       })

       // ⚠️ CRITICAL: webauthn 2.x doesn't have .verified property
       // If no exception → Success
       // If exception → Failed

   catch Exception as e:
       RETURN 400 "Invalid attestation: " + e.message

4. Create user (using saved username/display_name):
   INSERT INTO users (
       id,
       username,
       display_name,
       last_login_at
   ) VALUES (
       user_id,
       challenge.username,        -- From challenge!
       challenge.display_name,    -- From challenge!
       NOW()
   )

5. Save credential:
   credential_id_b64 = base64url_encode(verification.credential_id)

   INSERT INTO passkey_credentials (
       user_id,
       credential_id,
       public_key,
       sign_count,
       device_name,
       aaguid
   ) VALUES (
       user_id,
       credential_id_b64,
       verification.credential_public_key,
       verification.sign_count,
       device_name,
       verification.aaguid
   )

6. Mark challenge as used:
   UPDATE auth_challenges
   SET used = TRUE, user_id = user_id
   WHERE id = challenge.id

7. Generate tokens:
   access_token = create_jwt({
       sub: user_id,
       username: username,
       exp: NOW() + 15 minutes
   })

   refresh_token = create_jwt({
       sub: user_id,
       exp: NOW() + 7 days
   })

8. Save refresh token (hashed):
   INSERT INTO refresh_tokens (
       user_id,
       token_hash,
       expires_at
   ) VALUES (
       user_id,
       sha256(refresh_token),
       NOW() + 7 days
   )

9. Return:
   {
       user_id,
       username,
       access_token,
       refresh_token,
       token_type: "Bearer",
       expires_in: 900
   }
```

#### ⚠️ BUG WE FIXED #2: Verification Check

```python
# ❌ WRONG (webauthn 2.x)
verification = verify_registration_response(...)
if not verification.verified:  # .verified doesn't exist!
    raise ValueError("Failed")

# ✅ CORRECT
try:
    verification = verify_registration_response(...)
    # If we reach here → Success (no exception)
except Exception as e:
    # Failed
    raise HTTPException(400, f"Verification failed: {e}")
```

---

### Login Begin Endpoint

```
POST /api/v1/auth/login/begin
Body: { username }

1. Find user:
   user = SELECT * FROM users WHERE username = input.username
   IF NOT user:
       RETURN 404 "User not found"

2. Get user's credentials:
   credentials = SELECT * FROM passkey_credentials
                 WHERE user_id = user.id
                 AND is_active = TRUE

   IF credentials.empty:
       RETURN 400 "No credentials found"

3. Generate authentication options:
   options = create_authentication_options({
       rp_id: "localhost",
       challenge: random_bytes(32),
       allow_credentials: [
           {
               type: "public-key",
               id: base64url_decode(cred.credential_id),
               transports: cred.transports
           }
           for cred in credentials
       ],
       user_verification: "required",
       timeout: 60000
   })

4. Save challenge:
   INSERT INTO auth_challenges (
       challenge,
       user_id,
       type,
       expires_at
   ) VALUES (
       base64url(options.challenge),
       user.id,
       'authentication',
       NOW() + INTERVAL '5 minutes'
   )

5. Return:
   {
       challenge,
       timeout,
       rpId,
       allowCredentials,
       userVerification
   }
```

---

### Login Complete Endpoint

```
POST /api/v1/auth/login/complete
Body: { username, credential }

1. Find user
2. Find challenge
3. Verify authentication response
4. Update sign_count (detect cloning)
5. Generate tokens
6. Return tokens
```

---

## 🚨 Critical Bugs We Fixed

### Bug #1: CORS Configuration

**Problem:**

```
Access to fetch at 'http://localhost:8000/api/v1/auth/register/begin'
from origin 'http://127.0.0.1:5500' has been blocked by CORS policy
```

**Root Cause:**

- Backend CORS only allowed `http://localhost:8000`
- Frontend was served from `http://127.0.0.1:5500`

**Solution:**

```python
# ✅ Include ALL frontend origins
CORS_ORIGINS = [
    "http://localhost:5500",
    "http://127.0.0.1:5500",
    "http://localhost:3000",  # If you have other frontends
]

# Add CORS middleware LAST (outermost)
app.add_middleware(
    CORSMiddleware,
    allow_origins=CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
```

**⚠️ CRITICAL:** Middleware order matters!

```python
# ❌ WRONG ORDER
app.add_middleware(CORSMiddleware, ...)   # Inner
app.middleware("http")(log_requests)      # Outer

# ✅ CORRECT ORDER
app.middleware("http")(log_requests)      # Inner
app.add_middleware(CORSMiddleware, ...)   # Outer (applied last)
```

---

### Bug #2: Origin Mismatch (localhost vs 127.0.0.1)

**Problem:**

```json
{
  "error": "REGISTRATION_FAILED",
  "message": "This is an invalid domain"
}
```

**Root Cause:**

- User accessed via `http://127.0.0.1:5500`
- Backend `RP_ID` was set to `"localhost"`
- WebAuthn: `localhost` ≠ `127.0.0.1`

**Solution:**

```python
# Option 1: Match RP_ID with URL domain
RP_ID = "localhost"  # If frontend is at http://localhost:5500
RP_ORIGIN = "http://localhost:5500"

# Option 2: Use 127.0.0.1
RP_ID = "127.0.0.1"  # If frontend is at http://127.0.0.1:5500
RP_ORIGIN = "http://127.0.0.1:5500"

# ⚠️ MUST MATCH EXACTLY (including trailing slash)
```

**Best Practice:**

```python
# Support both with/without trailing slash
def verify_registration(...):
    allowed_origins = [expected_origin]
    if expected_origin.endswith('/'):
        allowed_origins.append(expected_origin.rstrip('/'))
    else:
        allowed_origins.append(expected_origin + '/')

    verification = verify_registration_response(
        ...
        expected_origin=allowed_origins  # List instead of string
    )
```

---

### Bug #3: WebAuthn Options Parsing Error

**Problem:**

```python
TypeError: string indices must be integers
at line: rp=options["rp"]
```

**Root Cause:**

- `options_to_json()` in webauthn 2.x returns a **JSON STRING**, not a dict
- Code tried to access like a dict: `options["rp"]`

**Solution:**

```python
# ❌ WRONG
options_dict = options_to_json(options)  # Returns string!

# ✅ CORRECT
import json
options_dict = json.loads(options_to_json(options))
```

---

### Bug #4: Missing .verified Property

**Problem:**

```python
AttributeError: 'VerifiedRegistration' object has no attribute 'verified'
```

**Root Cause:**

- webauthn library v2.x changed API
- Old code: `if verification.verified:`
- New API: No `.verified` property; raises exception on failure

**Solution:**

```python
# ❌ WRONG (Old API)
verification = verify_registration_response(...)
if not verification.verified:
    raise ValueError("Failed")

# ✅ CORRECT (New API 2.x)
try:
    verification = verify_registration_response(...)
    # Success! Return data
    return {
        "credential_id": verification.credential_id,
        "public_key": verification.credential_public_key,
        "sign_count": verification.sign_count
    }
except Exception as e:
    # Failed
    raise HTTPException(400, f"Verification failed: {e}")
```

---

### Bug #5: Missing Username/Display Name in Registration

**Problem:**

- Registration Begin: Challenge created
- Registration Complete: Need username to create user
- Solution: User sent username again from client (insecure)

**Solution:**

```sql
-- ✅ Store username/display_name WITH challenge
ALTER TABLE auth_challenges
ADD COLUMN username VARCHAR(30),
ADD COLUMN display_name VARCHAR(100);

-- In Registration Begin:
INSERT INTO auth_challenges (..., username, display_name)
VALUES (..., request.username, request.display_name);

-- In Registration Complete:
new_user = User(
    id=request.user_id,
    username=challenge_record.username,      -- From DB!
    display_name=challenge_record.display_name  -- From DB!
)
```

---

## ⚙️ Configuration Gotchas

### 1. Environment-Specific Settings

**Development (.env):**

```env
RP_ID=localhost
RP_ORIGIN=http://localhost:5500
CORS_ORIGINS=http://localhost:5500,http://127.0.0.1:5500
DEBUG=true
```

**Production (.env):**

```env
RP_ID=yourdomain.com
RP_ORIGIN=https://yourdomain.com
CORS_ORIGINS=https://yourdomain.com
DEBUG=false
```

**⚠️ CRITICAL:** WebAuthn only works on `localhost` (dev) or `https://` (prod)

---

### 2. HTTPS Requirement

```
Development:  http://localhost     ✅ OK
Production:   http://example.com   ❌ WebAuthn will NOT work
Production:   https://example.com  ✅ Required
```

---

### 3. Token Expiration Strategy

**Recommended:**

```
Access Token:  15 minutes (short)
Refresh Token: 7 days (or sliding with 30-day max)
```

**Why?**

- Short access token → Less damage if stolen
- Long refresh token → Good UX (don't force re-login daily)
- Refresh token in DB → Can revoke on logout

---

## 🔐 Security Best Practices

### 1. Token Storage (Client-Side)

**❌ AVOID: localStorage (XSS vulnerable)**

```javascript
// If your site is vulnerable to XSS:
localStorage.setItem('access_token', token);
// → Hacker can steal with: localStorage.getItem('access_token')
```

**✅ BETTER: Access Token in Memory + Refresh Token in httpOnly Cookie**

```javascript
// Client: Store access token in RAM only
class TokenManager {
  constructor() {
    this.accessToken = null; // Lost on page refresh
  }
}

// Server: Set refresh token as httpOnly cookie
response.set_cookie(
  'refresh_token',
  (value = refresh_token),
  (httponly = true), // JavaScript can't read
  (secure = true), // HTTPS only
  (samesite = 'strict'), // CSRF protection
);
```

---

### 2. Input Validation

```python
# ✅ Validate username
import re

def validate_username(username: str):
    if not 3 <= len(username) <= 30:
        raise ValueError("Username must be 3-30 characters")

    if not re.match(r'^[a-zA-Z0-9_-]+$', username):
        raise ValueError("Username: only letters, numbers, -, _")
```

---

### 3. Challenge Expiration

```python
# ✅ Always set expiration
expires_at = datetime.utcnow() + timedelta(seconds=300)  # 5 minutes

# ✅ Always check expiration
if challenge.expires_at < datetime.utcnow():
    raise HTTPException(400, "Challenge expired. Please try again.")
```

---

### 4. Prevent Credential Cloning

```python
# ✅ Check sign count (authentication)
new_sign_count = verification.new_sign_count

if new_sign_count <= credential.sign_count:
    # Same credential used on 2 devices → Cloned!
    raise HTTPException(401, "Credential appears compromised")

# Update sign count
credential.sign_count = new_sign_count
```

---

### 5. Content Security Policy (CSP)

```python
# ✅ Add security headers
@app.middleware("http")
async def add_security_headers(request, call_next):
    response = await call_next(request)
    response.headers["Content-Security-Policy"] = (
        "default-src 'self'; "
        "script-src 'self'; "
        "style-src 'self' 'unsafe-inline';"
    )
    response.headers["X-Content-Type-Options"] = "nosniff"
    response.headers["X-Frame-Options"] = "DENY"
    return response
```

---

## 🧪 Testing & Debugging

### 1. DevTools Network Tab

**Check Request Headers:**

```
Authorization: Bearer eyJhbGci...  ← Token present?
Content-Type: application/json
Origin: http://localhost:5500
```

**Check Payload:**

```json
{
  "username": "john",
  "display_name": "John Doe"
}
```

**Check Response:**

```
Status: 200 OK  ← Success
Status: 400     ← Check error message in Preview tab
Status: 401     ← Token issue
Status: 500     ← Server error (check backend logs)
```

---

### 2. Test Edge Cases

```
✅ Test: Username already exists
✅ Test: Challenge expired (wait 5 minutes)
✅ Test: Invalid challenge (tamper with data)
✅ Test: Token expiration (access token after 15 min)
✅ Test: Refresh token expiration (after 7 days)
✅ Test: CORS from different origin
✅ Test: Invalid RP_ID/Origin mismatch
```

---

### 3. Logging

```python
# ✅ Log critical steps (DO NOT log sensitive data)
logger.info(f"Registration begin for username: {username}")
logger.info(f"Challenge created: {challenge_id}")
logger.info(f"User created: {user_id}")
logger.error(f"Verification failed: {error_message}")

# ❌ NEVER LOG
logger.info(f"Password: {password}")      # NO!
logger.info(f"Token: {access_token}")     # NO!
logger.info(f"Private Key: {key}")        # NO!
```

---

## ✅ Production Checklist

### Backend

- [ ] HTTPS enabled (SSL certificate)
- [ ] RP_ID matches domain (e.g., "yourdomain.com")
- [ ] RP_ORIGIN is `https://yourdomain.com`
- [ ] CORS configured for production frontend
- [ ] Secret keys are strong (32+ random chars)
- [ ] Database has indexes (username, credential_id)
- [ ] Refresh tokens are hashed (SHA-256)
- [ ] Challenge cleanup job (delete expired challenges)
- [ ] Rate limiting on /login, /register endpoints
- [ ] CSP headers configured
- [ ] Error messages don't leak sensitive info

### Frontend

- [ ] Access token stored in RAM (not localStorage)
- [ ] Refresh token in httpOnly cookie (if hybrid approach)
- [ ] Auto-refresh logic implemented
- [ ] Proper error handling (401 → refresh → retry)
- [ ] Loading states for async operations
- [ ] User feedback for Face ID/Touch ID prompts

### Testing

- [ ] Tested on multiple browsers (Chrome, Safari, Edge)
- [ ] Tested on multiple devices (Mac, iPhone, Android, Windows)
- [ ] Tested CORS from production domain
- [ ] Load testing (100+ concurrent registrations)
- [ ] Security audit (penetration testing)

---

## 📖 Framework-Specific Notes

### Node.js (Express/NestJS)

```javascript
// Use @simplewebauthn/server
import {
  generateRegistrationOptions,
  verifyRegistrationResponse,
} from '@simplewebauthn/server';

// Already returns objects (no need to parse JSON)
const options = await generateRegistrationOptions({
  rpName: 'YourApp',
  rpID: 'localhost',
  userID: userId,
  userName: username,
  // ...
});

console.log(options.challenge); // Direct access ✅
```

### Java (Spring Boot)

```java
// Use webauthn4j
import com.webauthn4j.WebAuthnManager;

// Convert Base64URL manually
import java.util.Base64;

String challenge = Base64.getUrlEncoder()
    .withoutPadding()
    .encodeToString(randomBytes);
```

### Django (Python)

```python
# Similar to FastAPI
# Use webauthn library
# Same bugs apply (options parsing, .verified)
```

---

## 🎓 Key Takeaways

1. **WebAuthn is a 2-step process** (Begin → Complete)
2. **Store metadata WITH challenge** (username, display_name)
3. **Parse library outputs carefully** (string vs object)
4. **Check library version** (API changes between versions)
5. **RP_ID and Origin must match EXACTLY**
6. **Middleware order matters** (CORS last)
7. **Don't rely on .verified property** (use try/catch)
8. **Test all edge cases** (expired, invalid, cloned)
9. **HTTPS is required** (except localhost)
10. **Token storage matters** (RAM + httpOnly Cookie best)

---

## 📚 References

- [WebAuthn Specification](https://www.w3.org/TR/webauthn-2/)
- [OWASP Authentication Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Authentication_Cheat_Sheet.html)
- [JWT Best Practices](https://datatracker.ietf.org/doc/html/rfc8725)

---

**Last Updated:** December 2024  
**Tested Frameworks:** FastAPI (Python), Express (Node.js)  
**Production Ready:** ✅ Yes
