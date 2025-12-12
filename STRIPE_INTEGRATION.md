# Stripe Payment Integration Guide

This guide explains how to set up and test the Stripe payment integration for the hotel booking system.

## Prerequisites

1. **Stripe Account**: Create a free account at [stripe.com](https://stripe.com)
2. **Stripe CLI**: Install the Stripe CLI for local webhook testing

## Installation

### 1. Install Stripe CLI

**Windows:**
```bash
# Using Scoop
scoop install stripe

# Or download from: https://github.com/stripe/stripe-cli/releases
```

**macOS:**
```bash
brew install stripe/stripe-cli/stripe
```

**Linux:**
```bash
# Download and extract the binary
wget https://github.com/stripe/stripe-cli/releases/download/v1.19.5/stripe_1.19.5_linux_x86_64.tar.gz
tar -xvf stripe_1.19.5_linux_x86_64.tar.gz
sudo mv stripe /usr/local/bin/
```

### 2. Login to Stripe CLI

```bash
stripe login
```

This will open your browser to authenticate with Stripe.

## Configuration

### Backend Configuration

1. Update `backend/.env` with your Stripe keys:

```env
# Stripe Configuration
STRIPE_SECRET_KEY=sk_test_your_stripe_secret_key_here
STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret_here

# Application URLs
FRONTEND_URL=http://localhost:3000
BACKEND_URL=http://localhost:3001
```

To get your Stripe keys:
- Go to [Stripe Dashboard](https://dashboard.stripe.com/test/apikeys)
- Copy your **Secret key** (starts with `sk_test_`)
- The webhook secret will be generated when you set up webhook forwarding

### Frontend Configuration

1. Update `frontend/.env.local` with your Stripe publishable key:

```env
NEXT_PUBLIC_API_URL=http://localhost:3001
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_your_stripe_publishable_key_here
```

To get your publishable key:
- Go to [Stripe Dashboard](https://dashboard.stripe.com/test/apikeys)
- Copy your **Publishable key** (starts with `pk_test_`)

## Local Development & Testing

### Step 1: Start the Backend Server

```bash
cd backend
npm run start:dev
```

The backend should be running on `http://localhost:3001`

### Step 2: Start the Frontend Server

```bash
cd frontend
npm run dev
```

The frontend should be running on `http://localhost:3000`

### Step 3: Set Up Stripe Webhook Forwarding

In a new terminal, forward Stripe webhooks to your local backend:

```bash
stripe listen --forward-to http://localhost:3001/stripe/webhook
```

This command will output a webhook signing secret (starts with `whsec_`). Copy this and update your `backend/.env`:

```env
STRIPE_WEBHOOK_SECRET=whsec_1234567890abcdef...
```

**Important**: Restart your backend server after updating the webhook secret.

### Step 4: Test the Payment Flow

1. **Create a Booking**:
   - Navigate to the booking page
   - Select a room and fill in guest details
   - Submit the booking (status will be PENDING)

2. **Initiate Payment**:
   - Go to your dashboard/bookings
   - Find the pending booking
   - Click on the Stripe payment button
   - You'll be redirected to Stripe's checkout page

3. **Test Payment**:
   Use Stripe's test cards:
   - **Successful payment**: `4242 4242 4242 4242`
   - **Payment requires authentication**: `4000 0027 6000 3184`
   - **Declined payment**: `4000 0000 0000 0002`

   Use any future expiry date (e.g., 12/34), any 3-digit CVC, and any ZIP code.

4. **Verify Webhook Events**:
   In the terminal running `stripe listen`, you should see webhook events:
   ```
   2025-12-12 10:30:45   --> checkout.session.completed [evt_xxx]
   2025-12-12 10:30:45  <--  [200] POST http://localhost:3001/stripe/webhook [evt_xxx]
   ```

5. **Check Booking Status**:
   - After successful payment, the booking status should change to CONFIRMED
   - A payment record should be created in the database
   - You should be redirected to the success page

## Testing Different Scenarios

### Successful Payment

```bash
# Use test card: 4242 4242 4242 4242
# The webhook will trigger and booking status will be CONFIRMED
```

### Payment Failure

```bash
# Use test card: 4000 0000 0000 0002
# The payment will be declined
# Booking remains in PENDING status
```

### 3D Secure Authentication

```bash
# Use test card: 4000 0027 6000 3184
# You'll be prompted for 3D Secure authentication
# Complete or fail authentication to test both flows
```

### Manual Webhook Testing

You can manually trigger webhook events:

```bash
# Trigger a successful checkout.session.completed event
stripe trigger checkout.session.completed

# The CLI will create a test session and send the webhook to your local server
```

## Stripe CLI Useful Commands

```bash
# View all events
stripe events list

# View specific event details
stripe events retrieve evt_xxx

# View logs in real-time
stripe logs tail

# Test webhook endpoint
stripe trigger checkout.session.completed

# View recent API calls
stripe requests list
```

## Integration Flow

### Payment Flow Diagram

```
User → Clicks "Pay with Stripe" → Backend creates Stripe Session
  → Redirects to Stripe Checkout → User enters payment details
  → Stripe processes payment → Stripe sends webhook to backend
  → Backend updates booking status to CONFIRMED → Backend creates payment record
  → User redirected to success page → Frontend refreshes booking data
```

### Key Components

**Backend:**
- `src/stripe/stripe.service.ts` - Stripe business logic
- `src/stripe/stripe.controller.ts` - API endpoints
- `src/stripe/stripe.module.ts` - Module configuration

**Frontend:**
- `components/features/payment/stripe-checkout-button.tsx` - Checkout button with Stripe icon
- `app/(public)/booking/success/page.tsx` - Success page
- `app/(public)/booking/cancel/page.tsx` - Cancel page
- `services/stripe.api.ts` - Stripe API calls
- `hooks/useStripe.ts` - React hooks for Stripe operations

## Security Best Practices

1. **Webhook Signature Verification**: Always verify webhook signatures to ensure events come from Stripe
2. **Environment Variables**: Never commit real Stripe keys to version control
3. **HTTPS in Production**: Always use HTTPS for webhook endpoints in production
4. **Idempotency**: Handle duplicate webhook events gracefully
5. **Error Handling**: Properly handle payment failures and edge cases

## Troubleshooting

### Webhook Not Received

- Ensure `stripe listen` is running
- Check that the webhook secret in `.env` matches the one from `stripe listen`
- Verify the backend server is running on port 3001
- Check firewall settings

### Payment Not Updating Booking

- Check the webhook endpoint logs in the terminal running `stripe listen`
- Verify the booking ID in the session metadata
- Check the backend logs for errors
- Ensure the database connection is working

### Frontend Errors

- Verify `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` is set in `.env.local`
- Check browser console for errors
- Ensure the backend API is accessible from the frontend

## Production Deployment

### Before Going Live:

1. **Replace Test Keys** with live keys:
   - `sk_live_...` for backend
   - `pk_live_...` for frontend

2. **Set Up Webhook Endpoint**:
   - Go to [Stripe Webhooks](https://dashboard.stripe.com/webhooks)
   - Add endpoint: `https://your-domain.com/stripe/webhook`
   - Select events: `checkout.session.completed`, `checkout.session.expired`, `payment_intent.payment_failed`
   - Copy the webhook secret and update production environment variables

3. **Enable Payment Methods**:
   - Configure accepted payment methods in Stripe Dashboard
   - Enable regional payment methods if needed

4. **Set Up Monitoring**:
   - Monitor webhook events in Stripe Dashboard
   - Set up alerts for failed payments
   - Review payment analytics regularly

## Additional Resources

- [Stripe Documentation](https://stripe.com/docs)
- [Stripe Testing Guide](https://stripe.com/docs/testing)
- [Stripe CLI Reference](https://stripe.com/docs/stripe-cli)
- [Webhook Best Practices](https://stripe.com/docs/webhooks/best-practices)

## Support

For issues or questions:
1. Check Stripe logs: `stripe logs tail`
2. Review webhook events in Stripe Dashboard
3. Check application logs for errors
4. Contact the development team
