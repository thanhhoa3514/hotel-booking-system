# Passkey Authentication - Quick Start Guide

## Prerequisites
- Backend and frontend servers not running
- PostgreSQL database running
- Node.js and npm installed

## Step 1: Configure Backend Environment

Add these to `backend/.env`:

```env
# JWT Refresh Secret (generate a new one)
JWT_REFRESH_SECRET=your-strong-refresh-secret-key-here

# WebAuthn Configuration (Development)
RP_ID=localhost
RP_NAME=Hotel Management System
RP_ORIGIN=http://localhost:3000
```

### Generate a Strong Secret
```bash
# Using Node.js
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"

# Using OpenSSL
openssl rand -hex 32

# Using PowerShell
[Convert]::ToBase64String((1..32 | ForEach-Object { Get-Random -Maximum 256 }))
```

## Step 2: Start Backend Server

```bash
cd backend
npm run start:dev
```

Verify backend is running at `http://localhost:3001`

## Step 3: Start Frontend Server

```bash
cd frontend
npm run dev
```

Verify frontend is running at `http://localhost:3000`

## Step 4: Test Passkey Registration

### Option A: Create New Account
1. Go to `http://localhost:3000/auth/register`
2. Register a new account
3. Login with email/password
4. Navigate to `/dashboard/passkeys`
5. Click "Add Passkey"
6. Follow browser prompts (Face ID/Touch ID/Windows Hello)
7. Passkey registered!

### Option B: Use Existing Account
1. Login with existing credentials
2. Navigate to `/dashboard/passkeys`
3. Click "Add Passkey"
4. Enter device name (optional)
5. Click "Register Passkey"
6. Follow browser prompts
7. Success!

## Step 5: Test Passkey Login

1. Logout from current session
2. Go to `http://localhost:3000/auth/login`
3. Enter your email
4. Click "Login with Passkey" button
5. Select your passkey from browser prompt
6. Verify with biometric/PIN
7. You're logged in!

## Step 6: Test Passkey Management

1. Go to `/dashboard/passkeys`
2. View all your passkeys
3. Test these features:
   - **Rename**: Click edit icon, change device name
   - **Add Another**: Register multiple passkeys
   - **Delete**: Click trash icon, confirm deletion

## Step 7: Test Token Refresh (Optional)

1. Login with passkey
2. Open browser DevTools > Application > Local Storage
3. Note the `auth_token` value
4. Wait 15+ minutes (or manually expire the token)
5. Make an API request (navigate to any dashboard page)
6. Token should auto-refresh (check Network tab)
7. No login prompt = success!

## Troubleshooting

### "WebAuthn not supported"
- **Cause**: Browser doesn't support WebAuthn
- **Solution**: Use Chrome 67+, Safari 14+, or Edge 18+
- **Development**: Works on localhost without HTTPS

### "Origin mismatch" error
- **Cause**: `RP_ORIGIN` doesn't match frontend URL
- **Solution**: Ensure `RP_ORIGIN=http://localhost:3000` (exact match)

### "Challenge expired"
- **Cause**: Took too long to complete registration/login
- **Solution**: Challenges expire in 5 minutes. Try again faster.

### "Cannot find passkey"
- **Cause**: Passkey registered on different device/browser
- **Solution**: Register a new passkey on current device

### Passkey button doesn't appear
- **Cause**: WebAuthn not detected
- **Solution**: Check browser compatibility, use supported browser

### Token refresh fails
- **Cause**: Refresh token expired or invalid
- **Solution**: Login again to get new tokens

## API Testing (Optional)

### Test Registration Begin
```bash
# Get auth token first from localStorage after login
curl -X POST http://localhost:3001/passkey/register/begin \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"deviceName": "Test Device"}'
```

### Test Login Begin
```bash
curl -X POST http://localhost:3001/passkey/login/begin \
  -H "Content-Type: application/json" \
  -d '{"email": "user@example.com"}'
```

### Test Get Credentials
```bash
curl http://localhost:3001/passkey/credentials \
  -H "Authorization: Bearer YOUR_TOKEN"
```

## Browser DevTools Tips

### Check WebAuthn Support
Open Console:
```javascript
console.log('WebAuthn supported:', 
  window.PublicKeyCredential !== undefined);
```

### Check Platform Authenticator
```javascript
PublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable()
  .then(available => console.log('Platform authenticator:', available));
```

### View Stored Tokens
1. Open DevTools
2. Go to Application tab
3. Local Storage > `http://localhost:3000`
4. Check for: `auth_token`, `refresh_token`, `user`

## Production Deployment

When deploying to production:

1. **Update Environment Variables**
   ```env
   RP_ID=yourdomain.com
   RP_NAME=Hotel Management System
   RP_ORIGIN=https://yourdomain.com
   ```

2. **Enable HTTPS** (Required for WebAuthn in production)

3. **Configure CORS**
   Update `main.ts` in backend to include production domain

4. **Use httpOnly Cookies** for refresh tokens (more secure than localStorage)

5. **Test on Multiple Devices**
   - Desktop browsers
   - Mobile Safari (iOS)
   - Mobile Chrome (Android)
   - Different OS (Windows, macOS, Linux)

## Success Indicators

✅ **Registration Works**
- Browser prompts for biometric
- Success message appears
- Passkey appears in dashboard

✅ **Login Works**
- Passkey button visible
- Browser shows passkey selector
- Login succeeds without password

✅ **Management Works**
- Can list all passkeys
- Can rename passkeys
- Can delete passkeys
- Last used timestamp updates

✅ **Token Refresh Works**
- No interruption after 15 minutes
- Requests continue seamlessly
- New tokens in localStorage

## Next Steps

- [ ] Test on different browsers
- [ ] Test on mobile devices
- [ ] Register multiple passkeys
- [ ] Test with different users
- [ ] Verify security features
- [ ] Review logs for errors
- [ ] Plan production deployment

## Support

For issues or questions:
1. Check `backend/webauth.md` for common problems
2. Review `PASSKEY_FEATURE_COMPLETE.md` for details
3. Check browser console for errors
4. Check backend logs for server errors

---

**Enjoy passwordless authentication with Passkeys!** 🎉🔐
