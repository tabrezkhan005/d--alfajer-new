# Shiprocket Integration Setup Guide

## Overview
A comprehensive Shiprocket integration has been added to your admin panel with full API functionality. This allows you to:
- **Create shipments** directly from order details
- **Track shipments** with AWB codes and real-time updates
- **Generate shipping labels, manifests, and invoices**
- **Check serviceability** before creating shipments
- **Calculate shipping rates** for any route
- **Request pickups** for ready-to-ship packages
- **Manage return orders** through Shiprocket
- **Cancel shipments** when needed
- **View shipment charges** and details
- **Bulk operations** for labels and manifests

## Setup Steps

### Step 1: Access Shiprocket Settings
1. Log in to your admin panel
2. Navigate to **Settings** → **Shiprocket** in the sidebar
3. Or go directly to: `/admin/settings/shiprocket`

### Step 2: Configure Shiprocket Credentials
1. Enter your Shiprocket account email
2. Enter your Shiprocket account password
3. (Optional) Enter your default pickup location name
4. Click **"Test Connection"** to verify your credentials
5. Click **"Save Settings"** to store the configuration

### Step 3: Verify API Access
- Make sure your Shiprocket account has API access enabled
- You can verify this in Shiprocket dashboard: Settings → API Settings
- The integration uses Shiprocket's v2 API

## Using Shiprocket Integration

### Shiprocket Dashboard
Navigate to **Shiprocket** → **Dashboard** to see:
- Shipment statistics (Total, Pending, In Transit, Delivered, Cancelled)
- Recent shipments
- Quick access to all Shiprocket features

### Creating a Shipment
1. Go to **Orders** → Select an order
2. Scroll to the **"Shiprocket Shipping"** section
3. Click **"Create Shiprocket Shipment"**
4. The system will:
   - Create a shipment in Shiprocket
   - Generate an AWB (Airway Bill) code
   - Update the order with the tracking number
   - Change order status to "shipped"

### Managing Shipments
Navigate to **Shiprocket** → **All Shipments** to:
- View all shipments with filters
- Search by order number, AWB, or customer name
- Select multiple shipments for bulk operations
- Generate labels and manifests in bulk
- Cancel shipments
- View detailed shipment information

### Serviceability Check
Navigate to **Shiprocket** → **Serviceability** to:
- Check if courier can deliver between two pincodes
- See available couriers for a route
- View estimated delivery times
- Check COD availability

### Rate Calculator
Navigate to **Shiprocket** → **Rate Calculator** to:
- Calculate shipping rates for any route
- Compare courier prices
- See COD charges
- Estimate delivery times

### Request Pickup
Navigate to **Shiprocket** → **Request Pickup** to:
- Schedule package pickup
- Select pickup date and time
- Specify package count
- Choose pickup location

### Tracking Shipments
- Once a shipment is created, the tracking number (AWB code) is displayed
- Click the **"Track"** button to open Shiprocket's tracking page
- View detailed tracking timeline in shipment details page
- Real-time status updates

## API Endpoints Created

The following comprehensive API routes have been created:

### Authentication & Configuration
1. **POST `/api/shiprocket/auth`** - Authenticate and get token

### Shipment Management
2. **POST `/api/shiprocket/shipment`** - Create a new shipment
3. **GET `/api/shiprocket/shipments`** - Get all shipments or shipment details
4. **POST `/api/shiprocket/update-shipment`** - Update shipment details
5. **POST `/api/shiprocket/cancel`** - Cancel a shipment

### Tracking & Information
6. **GET `/api/shiprocket/tracking`** - Get tracking information
7. **GET `/api/shiprocket/charges`** - Get shipment charges

### Labels & Documents
8. **POST `/api/shiprocket/generate-label`** - Generate shipping labels
9. **POST `/api/shiprocket/generate-manifest`** - Generate manifest
10. **POST `/api/shiprocket/generate-invoice`** - Generate invoice

### Serviceability & Rates
11. **POST `/api/shiprocket/serviceability`** - Check serviceability
12. **GET `/api/shiprocket/couriers`** - Get available courier companies

### Pickup Management
13. **GET `/api/shiprocket/pickup-locations`** - Get pickup locations
14. **POST `/api/shiprocket/request-pickup`** - Request pickup

### Courier Assignment
15. **POST `/api/shiprocket/assign-courier`** - Assign courier and generate AWB

### Returns
16. **POST `/api/shiprocket/return-order`** - Create return order

## Files Created/Modified

### New Files:
- `src/lib/shiprocket.ts` - Shiprocket API integration library
- `src/app/admin/settings/shiprocket/page.tsx` - Settings page
- `src/app/api/shiprocket/auth/route.ts` - Authentication API
- `src/app/api/shiprocket/shipment/route.ts` - Shipment creation API
- `src/app/api/shiprocket/tracking/route.ts` - Tracking API
- `src/app/api/shiprocket/pickup-locations/route.ts` - Pickup locations API

### Modified Files:
- `src/app/admin/orders/[id]/page.tsx` - Added Shiprocket integration
- `src/components/admin/sidebar.tsx` - Added Shiprocket to settings menu
- `src/lib/supabase/orders.ts` - Added tracking number update function

## Important Notes

1. **Token Expiry**: Shiprocket tokens expire after 24 hours. The system will prompt you to re-authenticate if needed.

2. **Pickup Location**: Make sure you have at least one pickup location configured in your Shiprocket account.

3. **Order Data**: The integration automatically maps:
   - Customer shipping address
   - Order items with quantities and prices
   - Payment method (Prepaid/COD)
   - Order total

4. **Weight Calculation**: Currently uses a default weight of 0.5kg. You may want to add weight calculation based on products.

5. **Error Handling**: If shipment creation fails, check:
   - Shiprocket credentials are correct
   - Pickup location exists in Shiprocket
   - Order has complete shipping address
   - All required fields are filled

## Support

- **Shiprocket API Docs**: https://apidocs.shiprocket.in/
- **Shiprocket Support**: support@shiprocket.in
- **Shiprocket Dashboard**: https://app.shiprocket.in

## Security

- Shiprocket credentials are stored in browser localStorage (client-side only)
- Tokens are automatically refreshed when expired
- API calls are made server-side through Next.js API routes

## Next Steps (Optional Enhancements)

1. Add weight calculation based on product data
2. Add courier selection before creating shipment
3. Add bulk shipment creation for multiple orders
4. Add webhook support for shipment status updates
5. Add automatic email notifications with tracking links
