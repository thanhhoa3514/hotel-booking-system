# Passkey Authentication Environment Variables

Add these environment variables to your `.env` file:

```env
# JWT Refresh Token Secret (generate a strong random key, different from JWT_SECRET)
JWT_REFRESH_SECRET=your-refresh-secret-key-here-must-be-different-from-jwt-secret

# WebAuthn/Passkey Configuration
RP_ID=localhost
RP_NAME=Hotel Management System
RP_ORIGIN=http://localhost:3000
```

## Development Configuration

For local development:

- `RP_ID=localhost` - Must match the domain you're accessing
- `RP_ORIGIN=http://localhost:3000` - Must match the frontend URL exactly
- WebAuthn works on `localhost` without HTTPS

## Production Configuration

For production deployment:

```env
RP_ID=yourdomain.com
RP_NAME=Hotel Management System
RP_ORIGIN=https://yourdomain.com
```

Important:

- Production REQUIRES HTTPS
- `RP_ID` must match your domain exactly
- `RP_ORIGIN` must include `https://`

## Generating Secrets

Generate strong secrets using:

```bash
# Node.js
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"

# OpenSSL
openssl rand -hex 32

# PowerShell
[Convert]::ToBase64String((1..32 | ForEach-Object { Get-Random -Maximum 256 }))
```

## CORS Configuration

Make sure your CORS configuration in `main.ts` includes:

```typescript
app.enableCors({
  origin: [
    'http://localhost:3000',
    'http://127.0.0.1:3000',
    // Add production domain
  ],
  credentials: true,
});
```
