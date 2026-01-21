# Shiprocket Integration - Quick Start Guide

## 🚀 Getting Started in 3 Steps

### Step 1: Configure Your Credentials
1. Navigate to **Admin Panel** → **Settings** → **Shiprocket**
2. Enter your Shiprocket email and password
3. Click **"Test Connection"** to verify your credentials
4. Click **"Save Settings"** to store your configuration

That's it! Your Shiprocket integration is now ready to use.

### Step 2: Create Your First Shipment
1. Go to **Orders** → Select any order
2. Scroll to the **"Shiprocket Shipping"** section
3. Select a pickup location (if you have multiple)
4. Click **"Create Shiprocket Shipment"**
5. The system will automatically:
   - Create the shipment in Shiprocket
   - Generate an AWB (Airway Bill) code
   - Update the order status to "shipped"
   - Save the tracking number

### Step 3: Explore Shiprocket Features
Navigate to **Shiprocket** in the admin sidebar to access:

- **Dashboard**: Overview of all shipments with statistics
- **All Shipments**: Manage and track all shipments
- **Serviceability**: Check if courier can deliver to a location
- **Rate Calculator**: Calculate shipping rates before creating shipments
- **Request Pickup**: Schedule package pickups
- **Returns**: Manage return orders

## 📋 Available Features

### ✅ Shipment Management
- Create shipments from orders
- View all shipments with filters
- Track shipments in real-time
- Cancel shipments
- Generate shipping labels
- Generate manifests
- Generate invoices
- View shipment charges

### ✅ Serviceability & Rates
- Check courier availability between pincodes
- Calculate shipping rates
- Compare courier prices
- View estimated delivery times
- Check COD availability

### ✅ Pickup Management
- Request package pickups
- Schedule pickup dates and times
- Select pickup locations
- View pickup history

### ✅ Returns
- Create return orders
- Track return shipments
- Manage return status

## 🔧 Advanced Usage

### Bulk Operations
1. Go to **Shiprocket** → **All Shipments**
2. Select multiple shipments using checkboxes
3. Click **"Generate Label"** or **"Generate Manifest"** for bulk operations

### Shipment Details
1. Click the **eye icon** on any shipment in the shipments list
2. View complete shipment information
3. Access tracking timeline
4. Generate labels and invoices
5. Cancel shipments if needed

### Serviceability Check
1. Go to **Shiprocket** → **Serviceability**
2. Enter pickup and delivery pincodes
3. Enter package weight
4. Select payment type (Prepaid/COD)
5. Click **"Check Serviceability"** to see available couriers

### Rate Calculator
1. Go to **Shiprocket** → **Rate Calculator**
2. Enter shipment details
3. Click **"Calculate Rates"** to see all available courier options with prices
4. Compare rates and delivery times

## 🔐 Security Notes

- Your Shiprocket credentials are stored securely in your browser's localStorage
- Tokens are automatically refreshed when they expire (24 hours)
- All API calls are made through secure server-side routes
- Never share your Shiprocket credentials

## 📞 Support

If you encounter any issues:
1. Check that your Shiprocket account is active
2. Verify your credentials are correct
3. Ensure you have API access enabled in your Shiprocket account
4. Contact Shiprocket support: support@shiprocket.in

## 🎯 Tips

- **Always check serviceability** before creating shipments to ensure delivery is possible
- **Use rate calculator** to find the best courier option for your shipments
- **Schedule pickups in advance** (at least 24 hours) for better service
- **Generate labels in bulk** to save time when processing multiple orders
- **Track shipments regularly** to keep customers informed

---

**Ready to ship?** Just paste your API keys in the settings page and start shipping! 🚢
