# Razorpay Payment Gateway Integration

This document provides instructions for setting up Razorpay payment gateway integration.

## Environment Variables

Add the following environment variables to your `.env` file:

```env
# Razorpay API Keys (Production)
NEXT_PUBLIC_RAZORPAY_KEY_ID=rzp_live_xxxxxxxxxxxxx
RAZORPAY_KEY_SECRET=xxxxxxxxxxxxxxxxxxxxxxxxxxxx

# Razorpay Webhook Secret (Optional but recommended)
RAZORPAY_WEBHOOK_SECRET=xxxxxxxxxxxxxxxxxxxxxxxxxxxx
```

## Getting Your Razorpay Keys

1. **Log in to Razorpay Dashboard**: https://dashboard.razorpay.com/
2. **Navigate to Settings > API Keys**
3. **Generate API Keys** (if not already generated):
   - Click "Generate Key" for Live mode
   - Copy the **Key ID** (starts with `rzp_live_`)
   - Copy the **Key Secret** (keep this secure, it's only shown once)
4. **Set up Webhook** (Recommended):
   - Go to Settings > Webhooks
   - Add webhook URL: `https://yourdomain.com/api/razorpay/webhook`
   - Select events: `payment.captured`, `payment.failed`, `order.paid`
   - Copy the **Webhook Secret**

## Security Best Practices

1. **Never commit API keys to version control**
   - Add `.env` to `.gitignore`
   - Use environment variables in production

2. **Use different keys for development and production**
   - Test keys start with `rzp_test_`
   - Live keys start with `rzp_live_`

3. **Keep Key Secret secure**
   - Only store in server-side environment variables
   - Never expose in client-side code

4. **Enable Webhook Verification**
   - Always verify webhook signatures
   - Use the webhook secret for signature verification

## Database Setup

Before using Razorpay, you need to add payment tracking columns to your `orders` table:

1. **Run the migration SQL**:
   - Open Supabase Dashboard → SQL Editor
   - Run the SQL from `RAZORPAY_DATABASE_MIGRATION.sql`
   - Or execute:
     ```sql
     ALTER TABLE orders ADD COLUMN IF NOT EXISTS razorpay_order_id TEXT;
     ALTER TABLE orders ADD COLUMN IF NOT EXISTS razorpay_payment_id TEXT;
     CREATE INDEX IF NOT EXISTS idx_orders_razorpay_order_id ON orders(razorpay_order_id);
     CREATE INDEX IF NOT EXISTS idx_orders_razorpay_payment_id ON orders(razorpay_payment_id);
     ```

## Features

- ✅ Secure payment processing
- ✅ Automatic payment verification
- ✅ Webhook support for payment events
- ✅ Error handling and retry mechanisms
- ✅ Payment status tracking
- ✅ Duplicate payment prevention
- ✅ Signature verification (HMAC SHA256)
- ✅ Timeout protection (10s)
- ✅ Constant-time signature comparison (prevents timing attacks)

## Testing

### Test Cards (Sandbox Mode)

If using test keys (`rzp_test_`), use these test cards:

- **Card Number**: `4111 1111 1111 1111`
- **Expiry**: Any future date (e.g., `12/25`)
- **CVV**: Any 3 digits (e.g., `123`)
- **OTP**: `1234` (for 3D Secure)

### UPI Testing

- **UPI ID**: `success@razorpay` (always succeeds)
- **UPI ID**: `failure@razorpay` (always fails)

## Payment Flow

1. User places order → Order created in database
2. Razorpay order created → Payment modal opens
3. User completes payment → Payment verified
4. Order status updated → Confirmation shown
5. Webhook received → Additional verification (optional)

## Troubleshooting

### Payment Not Processing

1. Check if API keys are correctly set in `.env`
2. Verify keys are for the correct environment (test/live)
3. Check browser console for errors
4. Verify network connectivity

### Payment Verification Failed

1. Check server logs for signature verification errors
2. Ensure `RAZORPAY_KEY_SECRET` is correct
3. Verify payment was actually completed in Razorpay dashboard

### Webhook Not Working

1. Verify webhook URL is accessible from internet
2. Check webhook secret matches in dashboard
3. Review webhook logs in Razorpay dashboard
4. Ensure webhook events are enabled

## Support

For Razorpay support:
- Documentation: https://razorpay.com/docs/
- Support: support@razorpay.com
- Dashboard: https://dashboard.razorpay.com/
