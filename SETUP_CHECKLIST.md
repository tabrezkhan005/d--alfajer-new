# Setup Checklist - Complete Project Setup Guide

## ✅ Completed Setup Steps

### 1. Environment Variables
- [x] Supabase keys configured
- [x] Razorpay keys configured (rzp_live_S6xf8HUr9xD2aF)
- [x] Razorpay webhook secret configured
- [x] Shiprocket API key in .env (but should use email/password in admin)

### 2. Code Fixes
- [x] All linter errors fixed
- [x] Critical bugs fixed
- [x] Security improvements applied
- [x] Error handling enhanced

## ⚠️ Required Actions

### 1. Database Migration (CRITICAL)
**Action**: Run this SQL in Supabase Dashboard → SQL Editor:

```sql
-- Add Razorpay payment tracking columns
ALTER TABLE orders ADD COLUMN IF NOT EXISTS razorpay_order_id TEXT;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS razorpay_payment_id TEXT;

-- Add indexes for performance
CREATE INDEX IF NOT EXISTS idx_orders_razorpay_order_id ON orders(razorpay_order_id);
CREATE INDEX IF NOT EXISTS idx_orders_razorpay_payment_id ON orders(razorpay_payment_id);

-- Optional: Add Shiprocket columns if needed
ALTER TABLE orders ADD COLUMN IF NOT EXISTS shiprocket_shipment_id TEXT;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS shiprocket_awb_code TEXT;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS shiprocket_courier_name TEXT;
```

**Status**: ⚠️ **MUST DO BEFORE TESTING PAYMENTS**

### 2. Razorpay Webhook Configuration (RECOMMENDED)
**Action**: 
1. Go to https://dashboard.razorpay.com/
2. Navigate to Settings → Webhooks
3. Add webhook URL: `https://yourdomain.com/api/razorpay/webhook`
4. Select events:
   - `payment.captured`
   - `payment.failed`
   - `order.paid`
5. Copy the webhook secret
6. Update `RAZORPAY_WEBHOOK_SECRET` in `.env` if different

**Status**: ⚠️ **RECOMMENDED FOR PRODUCTION**

### 3. Shiprocket Configuration (REQUIRED FOR SHIPPING)
**Action**:
1. Go to Admin Panel → Settings → Shiprocket
2. Enter your Shiprocket API user email
3. Enter your Shiprocket API user password
4. Click "Test Connection" to verify
5. Click "Save Settings"
6. Optionally set a default pickup location

**Note**: The `NEXT_PUBLIC_SHIPROCKET_API_KEY` in `.env` is not used anymore. 
Shiprocket requires email/password authentication via the admin panel.

**Status**: ⚠️ **REQUIRED FOR SHIPMENT CREATION**

### 4. Verify Environment Variables
Check your `.env` file has:
```env
# Supabase (✅ Configured)
SUPABASE_SERVICE_ROLE_KEY=...
NEXT_PUBLIC_SUPABASE_URL=...
NEXT_PUBLIC_SUPABASE_ANON_KEY=...

# Razorpay (✅ Configured)
NEXT_PUBLIC_RAZORPAY_KEY_ID=rzp_live_S6xf8HUr9xD2aF
RAZORPAY_KEY_SECRET=RHIYzs7Fpzxm3mIUf7Lq6kpC
RAZORPAY_WEBHOOK_SECRET=alfajerwebhook

# Shiprocket (⚠️ Remove or ignore - use admin panel instead)
NEXT_PUBLIC_SHIPROCKET_API_KEY=... (not used)
```

**Status**: ✅ **CONFIGURED** (but remove unused Shiprocket API key)

## 🧪 Testing Checklist

### Payment Flow
- [ ] Add products to cart
- [ ] Go to checkout
- [ ] Fill shipping address
- [ ] Select payment method (Razorpay)
- [ ] Complete payment with test card: `4111 1111 1111 1111`
- [ ] Verify order confirmation screen appears
- [ ] Verify order appears in admin panel
- [ ] Verify payment status is "paid"

### Admin Panel
- [ ] Verify orders list shows new orders
- [ ] Verify order details show correct items and totals
- [ ] Test order status updates
- [ ] Test Shiprocket shipment creation from order detail page

### Shiprocket Integration
- [ ] Configure Shiprocket credentials in admin settings
- [ ] Test connection from settings page
- [ ] Test serviceability check
- [ ] Create a test order
- [ ] Create shipment from order detail page
- [ ] Verify shipment is created in Shiprocket

### Collections & Products
- [ ] Verify collections page loads correctly
- [ ] Verify only categories with products are shown
- [ ] Click on collection → verify products filter correctly
- [ ] Test product search and filters
- [ ] Verify Exquisite Collection displays correctly

## 🚨 Common Issues & Solutions

### Issue: "Payment verification failed"
**Solution**: 
- Check `RAZORPAY_KEY_SECRET` is correct
- Verify payment was actually completed in Razorpay dashboard
- Check server logs for signature verification errors

### Issue: "Order not found" in webhook
**Solution**:
- Run database migration to add `razorpay_order_id` column
- Verify order was created before payment
- Check webhook is receiving correct order IDs

### Issue: "Shiprocket not configured"
**Solution**:
- Go to Admin → Settings → Shiprocket
- Enter email and password
- Click "Test Connection"
- Click "Save Settings"

### Issue: "Failed to create shipment"
**Solution**:
- Verify Shiprocket credentials are saved
- Check shipping address has all required fields (pincode, city, state)
- Verify order has items
- Check Shiprocket dashboard for API errors

## 📝 Additional Notes

1. **Automatic Shipment Creation**: Disabled for security. Admin must create shipments manually.

2. **Webhook vs Client Verification**: Both are used:
   - Client verification happens immediately after payment
   - Webhook provides backup verification from Razorpay

3. **Token Expiration**: Shiprocket tokens expire after 24 hours. The system will automatically refresh when needed.

4. **Production Deployment**: 
   - Update all environment variables in production
   - Configure webhook URL for production domain
   - Test all payment flows before going live

## ✅ Final Status

**Code Quality**: ✅ All issues fixed
**Security**: ✅ Improvements applied
**Configuration**: ⚠️ Requires manual setup (database migration, webhook, Shiprocket credentials)
**Testing**: ⚠️ Ready for testing after setup steps
